import type { EvaluationResult } from '@ai-tutor/shared';
import { AIService, aiService } from '../../ai/ai.service.js';
import { classifyAIError } from '../../ai/ai.errors.js';
import { TASK_TIMEOUTS } from '../../ai/ai.config.js';
import { EvaluationPrompts } from './evaluation.prompts.js';
import { EvaluationNormalizer } from './evaluation-normalizer.js';
import type { EvaluatorInput, IQuestionTypeEvaluator, RawAIEvaluationData } from './evaluation.types.js';

export class ImageSolutionEvaluator implements IQuestionTypeEvaluator {
  private ai: AIService;

  constructor(customAI?: AIService) {
    this.ai = customAI || aiService;
  }

  async evaluate(input: EvaluatorInput): Promise<EvaluationResult> {
    const { question, submission } = input;

    if (!submission.imageReference || typeof submission.imageReference !== 'string') {
      return EvaluationNormalizer.normalize(
        {
          correct: false,
          score: 0,
          confidence: 0,
          recommendedAction: 'NEEDS_REVIEW',
          failureReason: 'IMAGE_INCOMPLETE',
          feedback: 'No solution image found for this submission. Please upload a clear photo of your handwritten work.',
        },
        question,
        submission,
        'IMAGE_SOLUTION'
      );
    }

    // Determine mimeType and raw base64 payload
    let mimeType = 'image/jpeg';
    const match = submission.imageReference.match(/^data:([^;]+);base64,/);
    if (match) {
      mimeType = match[1];
    }

    const prompt = EvaluationPrompts.buildImageSolutionEvaluationPrompt(question);
    const systemInstruction = EvaluationPrompts.getEvaluatorSystemInstruction();
    const schemaDescription = EvaluationPrompts.getEvaluationSchemaDescription();

    let rawData: RawAIEvaluationData = {};
    let lastError: any = null;
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const result = await this.ai.generateStructured<RawAIEvaluationData>(
          prompt,
          schemaDescription,
          {
            taskType: 'multimodal_assessment_evaluation',
            systemInstruction,
            temperature: 0.1,
            maxTokens: 4000,
            timeoutMs: TASK_TIMEOUTS.multimodal_assessment_evaluation, // 18s bounded multimodal timeout
            images: [
              {
                mimeType,
                data: submission.imageReference,
              },
            ],
          }
        );
        if (result && result.data && typeof result.data === 'object') {
          rawData = result.data;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[ImageSolutionEvaluator] Multimodal evaluation attempt ${attempt} failed:`, err?.message || err);
        if (attempt >= maxAttempts) {
          const classified = classifyAIError(err);
          let failureReason: 'TIMEOUT' | 'PROVIDER_UNAVAILABLE' | 'MODEL_FAILURE' | 'LOW_CONFIDENCE' = 'LOW_CONFIDENCE';

          if (classified.code === 'NETWORK_TIMEOUT') {
            failureReason = 'TIMEOUT';
          } else if (classified.code === 'PROVIDER_UNAVAILABLE') {
            failureReason = 'PROVIDER_UNAVAILABLE';
          } else if (classified.isModelError) {
            failureReason = 'MODEL_FAILURE';
          }

          let failureFeedback = 'We could not clearly inspect the uploaded image. Please ensure good lighting and upload a clearer photo of your notebook.';
          if (failureReason === 'TIMEOUT') {
            failureFeedback = 'Evaluation timed out while analyzing your handwritten solution. Your submission is saved securely. Please try checking again in a moment.';
          } else if (failureReason === 'PROVIDER_UNAVAILABLE') {
            failureFeedback = 'Our AI evaluation service is temporarily unavailable. Your solution is saved securely. Please check back shortly.';
          }

          // Graceful fallback to NEEDS_REVIEW with explicit failureReason and zero confidence (no mastery degradation)
          return EvaluationNormalizer.normalize(
            {
              correct: false,
              score: 0,
              confidence: 0.0,
              recommendedAction: 'NEEDS_REVIEW',
              failureReason,
              feedback: failureFeedback,
            },
            question,
            submission,
            'IMAGE_SOLUTION'
          );
        }
      }
    }

    return EvaluationNormalizer.normalize(
      rawData,
      question,
      submission,
      'IMAGE_SOLUTION'
    );
  }
}

export const imageSolutionEvaluator = new ImageSolutionEvaluator();
