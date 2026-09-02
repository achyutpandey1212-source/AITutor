import crypto from 'crypto';
import type {
  AssessmentQuestion,
  AssessmentStrategyDecision,
  MCQOption,
  QuestionRubric,
} from '@ai-tutor/shared';
import {
  AssessmentQuestionSchema,
  DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
} from '@ai-tutor/shared';
import { aiService, AIService } from '../ai/ai.service.js';
import { AssessmentPrompts } from './assessment.prompts.js';
import { AssessmentValidator } from './assessment.validation.js';
import type { GenerateQuestionInput } from './assessment.types.js';

export class QuestionGenerator {
  private ai: AIService;

  constructor(customAiService?: AIService) {
    this.ai = customAiService || aiService;
  }

  /**
   * Generates a fully validated AssessmentQuestion contract based on a determined strategy.
   */
  async generateQuestion(input: GenerateQuestionInput): Promise<AssessmentQuestion> {
    const { strategy, teachingState, knowledgeContext, customInstructions, learnerState } = input;

    const systemInstruction = AssessmentPrompts.getAssessmentSystemInstruction();
    const prompt = AssessmentPrompts.buildQuestionPrompt(
      strategy,
      teachingState,
      knowledgeContext,
      customInstructions,
      learnerState
    );
    const schemaDescription = AssessmentPrompts.getAssessmentQuestionSchemaDescription();

    let rawData: any = null;
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const structuredResult = await this.ai.generateStructured<any>(
          prompt,
          schemaDescription,
          {
            taskType: 'assessment_generation',
            systemInstruction,
            temperature: 0.2,
            maxTokens: 3000,
          }
        );
        rawData = structuredResult.data;
        if (rawData && typeof rawData === 'object') {
          break;
        }
      } catch (err: any) {
        console.warn(`[QuestionGenerator] Generation attempt ${attempt} failed:`, err?.message || err);
        if (attempt >= maxAttempts) {
          throw new Error(`Failed to generate assessment question after ${maxAttempts} attempts: ${err?.message || err}`);
        }
      }
    }

    if (!rawData || typeof rawData !== 'object') {
      throw new Error('AI returned empty or non-object response for assessment question');
    }

    // Deterministically normalize and enrich candidate question object
    const questionCandidate = this.buildCandidateQuestion(rawData, strategy, input);

    // Business validation check
    const validationResult = AssessmentValidator.validateQuestion(questionCandidate);
    if (!validationResult.isValid) {
      console.warn(
        '[QuestionGenerator] AI output failed business validation:',
        validationResult.errors
      );
      // Attempt deterministic repair if possible
      const repaired = this.repairQuestion(questionCandidate, strategy, validationResult.errors);
      const revalidation = AssessmentValidator.validateQuestion(repaired);
      if (!revalidation.isValid) {
        throw new Error(
          `Generated question failed business validation: ${revalidation.errors.join('; ')}`
        );
      }
      return repaired;
    }

    return questionCandidate;
  }

  /**
   * Constructs an AssessmentQuestion candidate from raw AI output and strategy parameters.
   */
  private buildCandidateQuestion(
    raw: any,
    strategy: AssessmentStrategyDecision,
    input: GenerateQuestionInput
  ): AssessmentQuestion {
    const questionId = `q_${crypto.randomUUID()}`;

    // Normalize MCQ options if present
    let normalizedOptions: MCQOption[] | undefined = undefined;
    let correctOptionId: string | undefined = undefined;

    if (strategy.questionType === 'MCQ') {
      normalizedOptions = this.normalizeOptions(raw.options);
      correctOptionId = typeof raw.correctOptionId === 'string' ? raw.correctOptionId.trim().toUpperCase() : undefined;

      // If correctOptionId is missing or not in options, fallback to first option or matched text
      if (normalizedOptions && normalizedOptions.length === 4) {
        const validIds = normalizedOptions.map((o) => o.id);
        if (!correctOptionId || !validIds.includes(correctOptionId)) {
          // Check if expectedAnswer matches any option text
          const matchedByText = normalizedOptions.find(
            (o) => raw.expectedAnswer && o.text.trim().toLowerCase() === String(raw.expectedAnswer).trim().toLowerCase()
          );
          correctOptionId = matchedByText ? matchedByText.id : 'A';
        }
      }
    }

    // Normalize rubric
    const rubric: QuestionRubric | undefined = this.normalizeRubric(raw.rubric, raw.expectedAnswer, strategy);

    // Determine guidance
    const isImageSolution = strategy.evaluationMode === 'IMAGE_SOLUTION';
    const submissionGuidance = isImageSolution
      ? raw.submissionGuidance || strategy.submissionGuidance || DEFAULT_IMAGE_SUBMISSION_GUIDANCE
      : raw.submissionGuidance || strategy.submissionGuidance;

    // Check RAG grounding status
    const isRagGrounded = Boolean(
      input.knowledgeContext &&
      input.knowledgeContext.relevantContextFound !== false &&
      input.knowledgeContext.retrievedChunks &&
      input.knowledgeContext.retrievedChunks.length > 0
    );

    const groundingSources = isRagGrounded
      ? input.knowledgeContext?.retrievedChunks
          .map((c) => c.filename || c.source)
          .filter((s): s is string => Boolean(s))
      : undefined;

    const candidate: AssessmentQuestion = {
      questionId,
      concept: strategy.concept,
      subject: strategy.subject,
      grade: strategy.grade,
      difficulty: strategy.difficulty,
      questionType: strategy.questionType,
      evaluationMode: strategy.evaluationMode,
      marks: strategy.marks,
      question: typeof raw.question === 'string' && raw.question.trim() ? raw.question.trim() : `Solve the problem on ${strategy.concept}.`,
      context: typeof raw.context === 'string' && raw.context.trim() ? raw.context.trim() : undefined,
      options: normalizedOptions,
      correctOptionId,
      expectedAnswer: typeof raw.expectedAnswer === 'string' ? raw.expectedAnswer.trim() : undefined,
      rubric,
      submissionGuidance,
      requiresImageUpload: isImageSolution,
      ragGrounded: isRagGrounded,
      groundingSources: groundingSources && groundingSources.length > 0 ? Array.from(new Set(groundingSources)) : undefined,
    };

    return AssessmentQuestionSchema.parse(candidate);
  }

  /**
   * Normalizes raw options array into standard 4-option structure [{id: 'A', text: '...'}, ...].
   */
  private normalizeOptions(rawOptions: any): MCQOption[] | undefined {
    if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
      return undefined;
    }

    const defaultIds = ['A', 'B', 'C', 'D'];
    const formatted: MCQOption[] = [];

    for (let i = 0; i < Math.min(4, rawOptions.length); i++) {
      const item = rawOptions[i];
      const targetId = defaultIds[i];

      if (typeof item === 'string') {
        // Handle format like "A) Option text" or "1. Option text"
        const cleanedText = item.replace(/^[A-Da-d0-9][\).\s:-]+/, '').trim();
        formatted.push({
          id: targetId,
          text: cleanedText || item.trim(),
        });
      } else if (typeof item === 'object' && item !== null) {
        const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim().toUpperCase() : targetId;
        const text = typeof item.text === 'string' ? item.text.trim() : String(item);
        formatted.push({ id, text });
      }
    }

    return formatted;
  }

  /**
   * Normalizes and enriches rubric information.
   */
  private normalizeRubric(
    rawRubric: any,
    expectedAnswer: any,
    strategy: AssessmentStrategyDecision
  ): QuestionRubric | undefined {
    if (rawRubric && typeof rawRubric === 'object') {
      return {
        method: typeof rawRubric.method === 'string' ? rawRubric.method.trim() : undefined,
        steps: Array.isArray(rawRubric.steps) ? rawRubric.steps.map((s: any) => String(s).trim()).filter(Boolean) : undefined,
        calculation: typeof rawRubric.calculation === 'string' ? rawRubric.calculation.trim() : undefined,
        criteria: Array.isArray(rawRubric.criteria) ? rawRubric.criteria.map((c: any) => String(c).trim()).filter(Boolean) : undefined,
        finalAnswer: typeof rawRubric.finalAnswer === 'string' ? rawRubric.finalAnswer.trim() : (typeof expectedAnswer === 'string' ? expectedAnswer.trim() : undefined),
      };
    }

    // Synthesize rubric if evaluation requires it (e.g. NUMERICAL or IMAGE_SOLUTION)
    if (strategy.evaluationMode === 'IMAGE_SOLUTION' || strategy.questionType === 'NUMERICAL') {
      return {
        method: `Apply fundamental principles of ${strategy.concept}`,
        steps: [
          'State given data and relevant formula/principle',
          'Substitute values and execute intermediate calculations',
          'State final calculated result with correct units',
        ],
        calculation: 'Accurate algebraic and arithmetic evaluation',
        finalAnswer: typeof expectedAnswer === 'string' ? expectedAnswer.trim() : undefined,
      };
    }

    if (strategy.questionType === 'LONG_ANSWER') {
      return {
        criteria: [
          `Clear conceptual understanding of ${strategy.concept}`,
          'Logical structure, accurate terminology, and supported examples',
          'Coherent conclusion addressing all aspects of prompt',
        ],
      };
    }

    return undefined;
  }

  /**
   * Applies deterministic fixes for common repairable AI formatting quirks.
   */
  private repairQuestion(
    question: AssessmentQuestion,
    strategy: AssessmentStrategyDecision,
    _errors: string[]
  ): AssessmentQuestion {
    const clone = { ...question };

    // Repair IMAGE_SOLUTION guidance and requiresImageUpload
    if (clone.evaluationMode === 'IMAGE_SOLUTION') {
      clone.requiresImageUpload = true;
      if (!clone.submissionGuidance || !clone.submissionGuidance.trim()) {
        clone.submissionGuidance = DEFAULT_IMAGE_SUBMISSION_GUIDANCE;
      }
      if (!clone.rubric || (!clone.rubric.steps && !clone.rubric.method)) {
        clone.rubric = {
          method: `Apply formulas and concepts of ${strategy.concept}`,
          steps: ['State formulas and initial variables', 'Perform step-by-step working', 'State final answer with units'],
          calculation: 'Stepwise arithmetic accuracy',
          finalAnswer: clone.expectedAnswer,
        };
      }
    }

    // Repair NUMERICAL missing expectedAnswer
    if (clone.questionType === 'NUMERICAL' && (!clone.expectedAnswer || !clone.expectedAnswer.trim())) {
      clone.expectedAnswer = clone.rubric?.finalAnswer || 'Refer to rubric steps';
    }

    return AssessmentQuestionSchema.parse(clone);
  }
}

export const questionGenerator = new QuestionGenerator();
