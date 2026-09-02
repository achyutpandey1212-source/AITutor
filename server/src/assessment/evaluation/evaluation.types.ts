import type {
  AssessmentEvaluationMode,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentSubmission,
  EvaluationFailureReason,
  EvaluationResult,
  KnowledgeContext,
  TeachingState,
} from '@ai-tutor/shared';

export interface EvaluatorInput {
  question: AssessmentQuestion;
  submission: AssessmentSubmission;
  knowledgeContext?: KnowledgeContext;
  teachingState?: Partial<TeachingState>;
}

export interface RawAIEvaluationData {
  correct?: boolean;
  score?: number;
  maxScore?: number;
  stepEvaluation?: Array<{
    step: number | string;
    criterion?: string;
    status: 'correct' | 'partially_correct' | 'incorrect' | 'unclear';
    score?: number;
    maxScore?: number;
    feedback: string;
  }>;
  conceptAssessment?: {
    understanding: 'strong' | 'moderate' | 'weak' | 'unclear';
    methodSelection?: 'strong' | 'moderate' | 'weak' | 'unclear';
    calculation?: 'strong' | 'moderate' | 'weak' | 'unclear';
    completeness?: 'strong' | 'moderate' | 'weak' | 'unclear';
    reasoning?: 'strong' | 'moderate' | 'weak' | 'unclear';
  };
  misconceptions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendedAction?: 'CONTINUE' | 'INCREASE_DIFFICULTY' | 'TARGETED_PRACTICE' | 'REMEDIAL_PRACTICE' | 'RETRY' | 'NEEDS_REVIEW';
  failureReason?: EvaluationFailureReason;
  confidence?: number;
  feedback?: string;
}

export interface IQuestionTypeEvaluator {
  evaluate(input: EvaluatorInput): Promise<EvaluationResult>;
}
