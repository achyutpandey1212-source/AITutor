import type {
  AssessmentQuestion,
  AssessmentStrategyDecision,
} from '@ai-tutor/shared';
import {
  AssessmentQuestionSchema,
  AssessmentStrategyDecisionSchema,
} from '@ai-tutor/shared';
import type { AssessmentValidationResult } from './assessment.types.js';

export class AssessmentValidator {
  /**
   * Performs full deterministic business validation on an AssessmentQuestion contract.
   */
  static validateQuestion(question: AssessmentQuestion): AssessmentValidationResult {
    const errors: string[] = [];

    // 1. Zod schema validation check
    const zodResult = AssessmentQuestionSchema.safeParse(question);
    if (!zodResult.success) {
      for (const issue of zodResult.error.issues) {
        errors.push(`Zod Schema Error [${issue.path.join('.')}]: ${issue.message}`);
      }
    }

    // 2. Marks validation
    if (!Number.isInteger(question.marks) || question.marks <= 0) {
      errors.push(`Marks must be a positive integer, received: ${question.marks}`);
    }

    // 3. Question Type & Evaluation Mode compatibility & specifics
    switch (question.questionType) {
      case 'MCQ': {
        if (question.evaluationMode !== 'MCQ') {
          errors.push(
            `MCQ question type must have evaluationMode 'MCQ', received '${question.evaluationMode}'`
          );
        }

        if (question.marks > 3) {
          errors.push(
            `MCQ questions should not exceed 3 marks (typically 1-2 marks), received: ${question.marks}`
          );
        }

        if (!question.options || !Array.isArray(question.options)) {
          errors.push('MCQ question must provide an options array');
        } else {
          if (question.options.length !== 4) {
            errors.push(
              `MCQ question must have exactly 4 options, received ${question.options.length}`
            );
          }

          const optionIds = new Set<string>();
          for (const opt of question.options) {
            if (!opt.id || !opt.id.trim()) {
              errors.push('MCQ option ID cannot be empty');
            }
            if (!opt.text || !opt.text.trim()) {
              errors.push(`MCQ option '${opt.id}' text cannot be empty`);
            }
            if (optionIds.has(opt.id)) {
              errors.push(`Duplicate MCQ option ID '${opt.id}' found`);
            }
            optionIds.add(opt.id);
          }

          if (!question.correctOptionId || !question.correctOptionId.trim()) {
            errors.push('MCQ question requires a valid correctOptionId');
          } else if (!optionIds.has(question.correctOptionId)) {
            errors.push(
              `correctOptionId '${question.correctOptionId}' does not match any available option IDs: [${Array.from(optionIds).join(', ')}]`
            );
          }
        }
        break;
      }

      case 'SHORT_ANSWER': {
        if (question.evaluationMode !== 'TEXT' && question.evaluationMode !== 'NUMERICAL') {
          errors.push(
            `SHORT_ANSWER questions must use evaluationMode 'TEXT' or 'NUMERICAL', received '${question.evaluationMode}'`
          );
        }
        if (question.marks > 5) {
          errors.push(
            `SHORT_ANSWER questions should typically carry 1 to 4 marks (max 5), received: ${question.marks}`
          );
        }
        break;
      }

      case 'LONG_ANSWER': {
        if (question.evaluationMode !== 'TEXT') {
          errors.push(
            `LONG_ANSWER questions must use evaluationMode 'TEXT', received '${question.evaluationMode}'`
          );
        }
        if (question.marks < 3) {
          errors.push(
            `LONG_ANSWER questions should carry at least 3-4 marks (typically 5-10 marks), received: ${question.marks}`
          );
        }
        if (!question.rubric || (!question.rubric.criteria && !question.rubric.steps && !question.rubric.method)) {
          errors.push(
            'LONG_ANSWER questions require evaluation rubric (criteria, steps, or method)'
          );
        }
        break;
      }

      case 'NUMERICAL': {
        if (
          question.evaluationMode !== 'NUMERICAL' &&
          question.evaluationMode !== 'IMAGE_SOLUTION'
        ) {
          errors.push(
            `NUMERICAL questions must use evaluationMode 'NUMERICAL' or 'IMAGE_SOLUTION', received '${question.evaluationMode}'`
          );
        }

        if (!question.expectedAnswer || !question.expectedAnswer.trim()) {
          errors.push('NUMERICAL questions must specify an expectedAnswer');
        }

        if (!question.rubric) {
          errors.push('NUMERICAL questions require an evaluation rubric');
        }
        break;
      }

      case 'IMAGE_SOLUTION': {
        if (question.evaluationMode !== 'IMAGE_SOLUTION') {
          errors.push(
            `IMAGE_SOLUTION questionType must use evaluationMode 'IMAGE_SOLUTION', received '${question.evaluationMode}'`
          );
        }
        break;
      }

      default: {
        errors.push(`Unrecognized questionType: '${(question as any).questionType}'`);
      }
    }

    // 4. IMAGE_SOLUTION evaluation mode specific rules
    if (question.evaluationMode === 'IMAGE_SOLUTION') {
      if (question.marks < 3) {
        errors.push(
          `IMAGE_SOLUTION evaluation requires multi-step work and should carry at least 3 marks (typically 5-10 marks), received: ${question.marks}`
        );
      }

      if (!question.rubric) {
        errors.push('IMAGE_SOLUTION requires an evaluation rubric with steps and final answer');
      } else if (!question.rubric.steps && !question.rubric.method && !question.rubric.calculation) {
        errors.push(
          'IMAGE_SOLUTION rubric must include steps, method, or calculation guidelines for evaluating working'
        );
      }

      if (!question.requiresImageUpload) {
        errors.push("IMAGE_SOLUTION questions must set 'requiresImageUpload' to true");
      }

      if (!question.submissionGuidance || !question.submissionGuidance.trim()) {
        errors.push('IMAGE_SOLUTION questions must include student submissionGuidance');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Deterministically validates an assessment strategy decision.
   */
  static validateStrategy(strategy: AssessmentStrategyDecision): AssessmentValidationResult {
    const errors: string[] = [];

    const zodResult = AssessmentStrategyDecisionSchema.safeParse(strategy);
    if (!zodResult.success) {
      for (const issue of zodResult.error.issues) {
        errors.push(`Strategy Schema Error [${issue.path.join('.')}]: ${issue.message}`);
      }
    }

    if (strategy.questionType === 'MCQ' && strategy.marks > 3) {
      errors.push(`Cannot plan MCQ with excessive marks (${strategy.marks})`);
    }

    if (strategy.evaluationMode === 'IMAGE_SOLUTION' && strategy.marks < 3) {
      errors.push(
        `Cannot plan IMAGE_SOLUTION with low marks (${strategy.marks}). Minimum recommended is 3-5 marks.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
