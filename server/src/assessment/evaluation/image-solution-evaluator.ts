import type { EvaluationResult } from '@ai-tutor/shared';
import { AIService, aiService } from '../../ai/ai.service.js';
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
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const result = await this.ai.generateStructured<RawAIEvaluationData>(
          prompt,
          schemaDescription,
          {
            taskType: 'assessment_evaluation',
            systemInstruction,
            temperature: 0.1,
            maxTokens: 4000,
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
        console.warn(`[ImageSolutionEvaluator] Multimodal evaluation attempt ${attempt} failed:`, err?.message || err);
        if (attempt >= maxAttempts) {
          // Graceful fallback to NEEDS_REVIEW rather than unhandled crash
          return EvaluationNormalizer.normalize(
            {
              correct: false,
              score: 0,
              confidence: 0.2,
              recommendedAction: 'NEEDS_REVIEW',
              feedback: 'We could not clearly inspect the uploaded image. Please ensure good lighting and upload a clearer photo of your notebook.',
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
