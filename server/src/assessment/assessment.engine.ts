import crypto from 'crypto';
import type {
  AssessmentDifficulty,
  AssessmentEvaluationMode,
  AssessmentGoal,
  AssessmentPlan,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentStrategyDecision,
  ClientAssessmentQuestion,
} from '@ai-tutor/shared';
import {
  AssessmentPlanSchema,
  DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { QuestionGenerator, questionGenerator } from './question.generator.js';
import { AssessmentValidator } from './assessment.validation.js';
import type {
  AssessmentPlanInput,
  GenerateAssessmentInput,
  GenerateQuestionInput,
  GeneratedAssessmentResult,
} from './assessment.types.js';

export class AssessmentEngine {
  private generator: QuestionGenerator;

  constructor(customGenerator?: QuestionGenerator) {
    this.generator = customGenerator || questionGenerator;
  }

  /**
   * Deterministically plans the assessment strategy based on curriculum context,
   * subject characteristics, cognitive depth, and the student's current TeachingState.
   */
  planAssessment(input: AssessmentPlanInput): AssessmentPlan {
    const topic = input.topic || input.concept;
    const subject = input.subject || 'General';
    const grade = input.grade;
    const goal = input.goal || 'concept_check';

    // 1. Determine Difficulty based on TeachingState
    const difficulty = this.determineDifficulty(input);

    // 2. Determine Question Count based on Goal and Difficulty
    const questionCount = this.determineQuestionCount(input, difficulty, goal);

    // 3. Determine Strategies for questions
    const strategies: AssessmentStrategyDecision[] = [];

    for (let i = 0; i < questionCount; i++) {
      const decision = this.determineQuestionStrategy(
        input,
        difficulty,
        goal,
        i,
        questionCount
      );
      strategies.push(decision);
    }

    const totalMarks = strategies.reduce((sum, s) => sum + s.marks, 0);

    const plan: AssessmentPlan = {
      id: `plan_${crypto.randomUUID()}`,
      topic,
      subject,
      grade,
      goal,
      totalMarks,
      totalQuestions: strategies.length,
      strategies,
      createdAt: new Date().toISOString(),
    };

    return AssessmentPlanSchema.parse(plan);
  }

  /**
   * Generates a single validated AssessmentQuestion contract according to a strategy.
   */
  async generateQuestion(input: GenerateQuestionInput): Promise<AssessmentQuestion> {
    return this.generator.generateQuestion(input);
  }

  /**
   * End-to-end generation: plans the assessment and generates all required questions.
   */
  async generateAssessment(input: GenerateAssessmentInput): Promise<GeneratedAssessmentResult> {
    const plan = this.planAssessment(input.planInput);
    const questions: AssessmentQuestion[] = [];

    for (const strategy of plan.strategies) {
      const question = await this.generator.generateQuestion({
        strategy,
        teachingState: input.planInput.teachingState,
        knowledgeContext: input.knowledgeContext,
      });
      questions.push(question);
    }

    return {
      plan,
      questions,
    };
  }

  /**
   * Sanitizes an AssessmentQuestion for safe client rendering (omits answer keys & internal rubrics).
   */
  sanitizeForClient(question: AssessmentQuestion): ClientAssessmentQuestion {
    return sanitizeQuestionForClient(question);
  }

  /**
   * Deterministic difficulty selection based on student mastery signals.
   */
  private determineDifficulty(input: AssessmentPlanInput): AssessmentDifficulty {
    if (input.preferredDifficulty) {
      return input.preferredDifficulty;
    }

    const state = input.teachingState;
    if (!state) {
      return input.goal === 'practice' ? 'medium' : 'easy';
    }

    // Misconceptions present -> Always start with targeted simpler question to diagnose/remedy
    if (state.misconceptions && state.misconceptions.length > 0) {
      return 'easy';
    }

    // Weak understanding -> Easy targeted reinforcement
    if (state.understanding === 'weak') {
      return 'easy';
    }

    // Developing understanding -> Easy or Medium depending on confidence
    if (state.understanding === 'developing') {
      const confidence = typeof state.confidence === 'number' ? state.confidence : 0.5;
      return confidence >= 0.65 ? 'medium' : 'easy';
    }

    // Strong understanding -> Progress toward Medium or Hard
    if (state.understanding === 'strong') {
      const confidence = typeof state.confidence === 'number' ? state.confidence : 0.8;
      if (confidence >= 0.85 || input.goal === 'practice' || input.goal === 'mastery_verification') {
        return 'hard';
      }
      return 'medium';
    }

    // Default unknown
    return input.goal === 'practice' ? 'medium' : 'easy';
  }

  /**
   * Deterministic question count adaptation.
   */
  private determineQuestionCount(
    input: AssessmentPlanInput,
    difficulty: AssessmentDifficulty,
    goal: AssessmentGoal
  ): number {
    if (typeof input.targetQuestionCount === 'number' && input.targetQuestionCount > 0) {
      return Math.min(10, input.targetQuestionCount);
    }

    switch (goal) {
      case 'concept_check':
        // Fast, focused single question check
        return 1;

      case 'diagnostic':
        return 2;

      case 'practice':
        if (difficulty === 'easy') return 2;
        if (difficulty === 'medium') return 3;
        return 3;

      case 'mastery_verification':
        return difficulty === 'hard' ? 3 : 2;

      default:
        return 1;
    }
  }

  /**
   * Subject-aware deterministic strategy rules.
   */
  private determineQuestionStrategy(
    input: AssessmentPlanInput,
    difficulty: AssessmentDifficulty,
    goal: AssessmentGoal,
    index: number,
    totalCount: number
  ): AssessmentStrategyDecision {
    const subject = input.subject || 'General';
    const subjectLower = subject.toLowerCase();
    const concept = input.concept;
    const grade = input.grade;
    const misconceptions = input.teachingState?.misconceptions;

    // Check if preferred type was explicitly provided
    if (input.preferredQuestionType) {
      const qType = input.preferredQuestionType;
      const evalMode = input.preferredEvaluationMode || this.getDefaultEvaluationMode(qType, input.targetMarks);
      const marks = input.targetMarks || this.getDefaultMarks(qType, evalMode, difficulty);

      const decision: AssessmentStrategyDecision = {
        concept,
        subject,
        grade,
        difficulty,
        questionType: qType,
        evaluationMode: evalMode,
        marks,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: `User specified question type ${qType}`,
        submissionGuidance: evalMode === 'IMAGE_SOLUTION' ? DEFAULT_IMAGE_SUBMISSION_GUIDANCE : undefined,
      };

      AssessmentValidator.validateStrategy(decision);
      return decision;
    }

    // 1. MATHEMATICS & NUMERICAL SUBJECTS
    const isMath =
      subjectLower.includes('math') ||
      subjectLower.includes('algebra') ||
      subjectLower.includes('geometry') ||
      subjectLower.includes('calculus') ||
      subjectLower.includes('trigonometry') ||
      subjectLower.includes('arithmetic');

    if (isMath) {
      return this.determineMathStrategy(input, difficulty, goal, index, totalCount);
    }

    // 2. ENGLISH & LANGUAGE ARTS
    const isEnglish =
      subjectLower.includes('english') ||
      subjectLower.includes('literature') ||
      subjectLower.includes('grammar') ||
      subjectLower.includes('language');

    if (isEnglish) {
      return this.determineEnglishStrategy(input, difficulty, goal, index, totalCount);
    }

    // 3. SOCIAL STUDIES & THEORY-HEAVY SUBJECTS (History, Civics, Geography, Economics)
    const isSST =
      subjectLower.includes('social') ||
      subjectLower.includes('sst') ||
      subjectLower.includes('history') ||
      subjectLower.includes('geography') ||
      subjectLower.includes('civics') ||
      subjectLower.includes('polity') ||
      subjectLower.includes('economics');

    if (isSST) {
      return this.determineTheoryStrategy(input, difficulty, goal, index, totalCount);
    }

    // 4. SCIENCE & GENERAL DEFAULT
    return this.determineScienceDefaultStrategy(input, difficulty, goal, index, totalCount);
  }

  /**
   * Deterministic strategy for Mathematics.
   */
  private determineMathStrategy(
    input: AssessmentPlanInput,
    difficulty: AssessmentDifficulty,
    goal: AssessmentGoal,
    index: number,
    totalCount: number
  ): AssessmentStrategyDecision {
    const concept = input.concept;
    const subject = input.subject;
    const grade = input.grade;
    const misconceptions = input.teachingState?.misconceptions;

    // Explicit marks target given
    if (typeof input.targetMarks === 'number' && input.targetMarks > 0) {
      const marks = input.targetMarks;
      if (marks <= 2) {
        return {
          concept,
          subject,
          grade,
          difficulty,
          questionType: 'NUMERICAL',
          evaluationMode: 'NUMERICAL',
          marks,
          questionCount: 1,
          assessmentGoal: goal,
          targetMisconceptions: misconceptions,
          rationale: 'Low-mark mathematics question with direct numerical evaluation',
        };
      } else {
        return {
          concept,
          subject,
          grade,
          difficulty,
          questionType: 'NUMERICAL',
          evaluationMode: 'IMAGE_SOLUTION',
          marks,
          questionCount: 1,
          assessmentGoal: goal,
          targetMisconceptions: misconceptions,
          submissionGuidance: DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
          rationale: 'Substantial mathematics problem requiring handwritten working steps on paper',
        };
      }
    }

    // Adaptive strategy by difficulty and goal
    if (difficulty === 'easy' || goal === 'concept_check') {
      // 1-2 marks quick check: MCQ or direct numerical
      const isFirstOfMulti = totalCount > 1 && index === 0;
      if (isFirstOfMulti) {
        return {
          concept,
          subject,
          grade,
          difficulty: 'easy',
          questionType: 'MCQ',
          evaluationMode: 'MCQ',
          marks: 1,
          questionCount: 1,
          assessmentGoal: goal,
          targetMisconceptions: misconceptions,
          rationale: 'Easy conceptual check via multiple choice',
        };
      }
      return {
        concept,
        subject,
        grade,
        difficulty: 'easy',
        questionType: 'NUMERICAL',
        evaluationMode: 'NUMERICAL',
        marks: 2,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Quick direct numerical check',
      };
    }

    if (difficulty === 'medium') {
      // 5-mark procedural problem requiring written working
      return {
        concept,
        subject,
        grade,
        difficulty: 'medium',
        questionType: 'NUMERICAL',
        evaluationMode: 'IMAGE_SOLUTION',
        marks: 5,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        submissionGuidance: DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
        rationale: 'Medium complexity math problem requiring handwritten working and step verification',
      };
    }

    // Hard difficulty -> 5 to 10 marks multi-step problem with image solution
    return {
      concept,
      subject,
      grade,
      difficulty: 'hard',
      questionType: 'NUMERICAL',
      evaluationMode: 'IMAGE_SOLUTION',
      marks: 5,
      questionCount: 1,
      assessmentGoal: goal,
      targetMisconceptions: misconceptions,
      submissionGuidance: DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
      rationale: 'Advanced multi-step mathematical problem requiring handwritten proof/solution',
    };
  }

  /**
   * Deterministic strategy for English / Language Arts.
   */
  private determineEnglishStrategy(
    input: AssessmentPlanInput,
    difficulty: AssessmentDifficulty,
    goal: AssessmentGoal,
    index: number,
    totalCount: number
  ): AssessmentStrategyDecision {
    const concept = input.concept;
    const subject = input.subject;
    const grade = input.grade;
    const misconceptions = input.teachingState?.misconceptions;

    if (difficulty === 'easy' || goal === 'concept_check') {
      if (index === 0 && totalCount > 1) {
        return {
          concept,
          subject,
          grade,
          difficulty: 'easy',
          questionType: 'MCQ',
          evaluationMode: 'MCQ',
          marks: 1,
          questionCount: 1,
          assessmentGoal: goal,
          targetMisconceptions: misconceptions,
          rationale: 'Quick grammar or vocabulary concept check',
        };
      }
      return {
        concept,
        subject,
        grade,
        difficulty: 'easy',
        questionType: 'SHORT_ANSWER',
        evaluationMode: 'TEXT',
        marks: 2,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Concise written response check',
      };
    }

    if (difficulty === 'medium') {
      return {
        concept,
        subject,
        grade,
        difficulty: 'medium',
        questionType: 'SHORT_ANSWER',
        evaluationMode: 'TEXT',
        marks: 3,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Short interpretive or analytical written question',
      };
    }

    return {
      concept,
      subject,
      grade,
      difficulty: 'hard',
      questionType: 'LONG_ANSWER',
      evaluationMode: 'TEXT',
      marks: 5,
      questionCount: 1,
      assessmentGoal: goal,
      targetMisconceptions: misconceptions,
      rationale: 'In-depth analytical or essay-style reading comprehension response',
    };
  }

  /**
   * Deterministic strategy for SST / Theory-heavy subjects.
   */
  private determineTheoryStrategy(
    input: AssessmentPlanInput,
    difficulty: AssessmentDifficulty,
    goal: AssessmentGoal,
    index: number,
    totalCount: number
  ): AssessmentStrategyDecision {
    const concept = input.concept;
    const subject = input.subject;
    const grade = input.grade;
    const misconceptions = input.teachingState?.misconceptions;

    if (difficulty === 'easy' || goal === 'concept_check') {
      if (index === 0 && totalCount > 1) {
        return {
          concept,
          subject,
          grade,
          difficulty: 'easy',
          questionType: 'MCQ',
          evaluationMode: 'MCQ',
          marks: 1,
          questionCount: 1,
          assessmentGoal: goal,
          targetMisconceptions: misconceptions,
          rationale: 'Factual verification via MCQ',
        };
      }
      return {
        concept,
        subject,
        grade,
        difficulty: 'easy',
        questionType: 'SHORT_ANSWER',
        evaluationMode: 'TEXT',
        marks: 2,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Short conceptual explanation',
      };
    }

    if (difficulty === 'medium') {
      return {
        concept,
        subject,
        grade,
        difficulty: 'medium',
        questionType: 'SHORT_ANSWER',
        evaluationMode: 'TEXT',
        marks: 3,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Cause-effect or comparative theory question',
      };
    }

    return {
      concept,
      subject,
      grade,
      difficulty: 'hard',
      questionType: 'LONG_ANSWER',
      evaluationMode: 'TEXT',
      marks: 5,
      questionCount: 1,
      assessmentGoal: goal,
      targetMisconceptions: misconceptions,
      rationale: 'Comprehensive analytical question on historical/social phenomena',
    };
  }

  /**
   * Deterministic strategy for Science & general subjects.
   */
  private determineScienceDefaultStrategy(
    input: AssessmentPlanInput,
    difficulty: AssessmentDifficulty,
    goal: AssessmentGoal,
    index: number,
    totalCount: number
  ): AssessmentStrategyDecision {
    const concept = input.concept;
    const subject = input.subject;
    const grade = input.grade;
    const misconceptions = input.teachingState?.misconceptions;

    if (difficulty === 'easy' || goal === 'concept_check') {
      if (index === 0 && totalCount > 1) {
        return {
          concept,
          subject,
          grade,
          difficulty: 'easy',
          questionType: 'MCQ',
          evaluationMode: 'MCQ',
          marks: 1,
          questionCount: 1,
          assessmentGoal: goal,
          targetMisconceptions: misconceptions,
          rationale: 'Fast conceptual MCQ check',
        };
      }
      return {
        concept,
        subject,
        grade,
        difficulty: 'easy',
        questionType: 'SHORT_ANSWER',
        evaluationMode: 'TEXT',
        marks: 2,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Short definition or principle check',
      };
    }

    if (difficulty === 'medium') {
      return {
        concept,
        subject,
        grade,
        difficulty: 'medium',
        questionType: 'SHORT_ANSWER',
        evaluationMode: 'TEXT',
        marks: 3,
        questionCount: 1,
        assessmentGoal: goal,
        targetMisconceptions: misconceptions,
        rationale: 'Scientific reasoning and mechanism explanation',
      };
    }

    return {
      concept,
      subject,
      grade,
      difficulty: 'hard',
      questionType: 'LONG_ANSWER',
      evaluationMode: 'TEXT',
      marks: 5,
      questionCount: 1,
      assessmentGoal: goal,
      targetMisconceptions: misconceptions,
      rationale: 'In-depth scientific problem or experimental analysis',
    };
  }

  private getDefaultEvaluationMode(
    type: AssessmentQuestionType,
    marks?: number
  ): AssessmentEvaluationMode {
    switch (type) {
      case 'MCQ':
        return 'MCQ';
      case 'NUMERICAL':
        return marks && marks >= 3 ? 'IMAGE_SOLUTION' : 'NUMERICAL';
      case 'IMAGE_SOLUTION':
        return 'IMAGE_SOLUTION';
      case 'SHORT_ANSWER':
      case 'LONG_ANSWER':
      default:
        return 'TEXT';
    }
  }

  private getDefaultMarks(
    type: AssessmentQuestionType,
    evalMode: AssessmentEvaluationMode,
    difficulty: AssessmentDifficulty
  ): number {
    if (evalMode === 'IMAGE_SOLUTION') return 5;
    if (type === 'MCQ') return 1;
    if (type === 'SHORT_ANSWER') return difficulty === 'easy' ? 2 : 3;
    if (type === 'LONG_ANSWER') return 5;
    if (type === 'NUMERICAL') return difficulty === 'easy' ? 2 : 5;
    return 2;
  }
}

export const assessmentEngine = new AssessmentEngine();
