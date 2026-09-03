import type {
  LearnerProfile,
  KnowledgeContext,
  LessonBlueprint,
  LessonProgressState,
  TeachingState,
} from '@ai-tutor/shared';

export interface PlanLessonParams {
  topic: string;
  subject?: string;
  learnerProfile?: LearnerProfile;
  availableMinutes?: number;
  learningGoal?: string;
  documentId?: string;
  knowledgeContext?: KnowledgeContext;
  sessionId?: string;
  userId?: string;
}

export interface ReplanLessonParams {
  currentBlueprint: LessonBlueprint;
  currentProgress: LessonProgressState;
  triggerReason: string;
  remainingMinutes?: number;
  studentFeedback?: string;
  focusAdjustment?:
    | 'DEEPER_UNDERSTANDING'
    | 'EXAM_FOCUS'
    | 'SIMPLIFIED'
    | 'SPEED_UP'
    | 'REVISIT_MISCONCEPTIONS';
  teachingState?: TeachingState;
  knowledgeContext?: KnowledgeContext;
}

export interface ReplannedBlueprintResult {
  blueprint: LessonBlueprint;
  updatedProgress: LessonProgressState;
  changeSummary: string;
}
