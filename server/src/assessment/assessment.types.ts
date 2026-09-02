import type {
  AssessmentDifficulty,
  AssessmentEvaluationMode,
  AssessmentGoal,
  AssessmentPlan,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentStrategyDecision,
  KnowledgeContext,
  LearnerAssessmentState,
  TeachingState,
} from '@ai-tutor/shared';

export interface AssessmentPlanInput {
  topic?: string;
  concept: string;
  subject: string;
  grade?: string;
  teachingState?: Partial<TeachingState>;
  learnerState?: LearnerAssessmentState;
  goal?: AssessmentGoal;
  targetMarks?: number;
  targetQuestionCount?: number;
  preferredQuestionType?: AssessmentQuestionType;
  preferredEvaluationMode?: AssessmentEvaluationMode;
  preferredDifficulty?: AssessmentDifficulty;
  targetSkill?: string;
  targetMisconception?: string;
  adaptiveContext?: Record<string, any>;
}

export interface GenerateQuestionInput {
  strategy: AssessmentStrategyDecision;
  teachingState?: Partial<TeachingState>;
  learnerState?: LearnerAssessmentState;
  knowledgeContext?: KnowledgeContext;
  customInstructions?: string;
}

export interface GenerateAssessmentInput {
  planInput: AssessmentPlanInput;
  knowledgeContext?: KnowledgeContext;
}

export interface GeneratedAssessmentResult {
  plan: AssessmentPlan;
  questions: AssessmentQuestion[];
}

export interface AssessmentValidationResult {
  isValid: boolean;
  errors: string[];
}
