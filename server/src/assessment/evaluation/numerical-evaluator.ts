import type { EvaluationResult } from '@ai-tutor/shared';
import { AIService, aiService } from '../../ai/ai.service.js';
import { EvaluationPrompts } from './evaluation.prompts.js';
import { EvaluationNormalizer } from './evaluation-normalizer.js';
import type { EvaluatorInput, IQuestionTypeEvaluator, RawAIEvaluationData } from './evaluation.types.js';

export class NumericalEvaluator implements IQuestionTypeEvaluator {
  private ai: AIService;

  constructor(customAI?: AIService) {
    this.ai = customAI || aiService;
  }

  async evaluate(input: EvaluatorInput): Promise<EvaluationResult> {
    const { question, submission } = input;
    const prompt = EvaluationPrompts.buildNumericalEvaluationPrompt(question, submission);
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
            maxTokens: 3000,
          }
        );
        if (result && result.data && typeof result.data === 'object') {
          rawData = result.data;
          break;
        }
      } catch (err: any) {
        console.warn(`[NumericalEvaluator] Evaluation attempt ${attempt} failed:`, err?.message || err);
        if (attempt >= maxAttempts) {
          throw new Error(`Numerical evaluation failed after ${maxAttempts} attempts: ${err?.message || err}`);
        }
      }
    }

    return EvaluationNormalizer.normalize(
      rawData,
      question,
      submission,
      'NUMERICAL'
    );
  }
}

export const numericalEvaluator = new NumericalEvaluator();
