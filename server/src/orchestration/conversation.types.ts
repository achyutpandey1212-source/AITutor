import type {
  ClassroomState,
  StudentIntent,
  TeachingState,
  TutorAction,
  TutorVisualData,
  TutorVisualType,
  VisualBeat,
  VisualPlan,
  ClientAssessmentQuestion,
  SessionMemory,
  ReplaySegment,
} from '@ai-tutor/shared';

export interface TurnIdentity {
  turnId: string;
  sessionId: string;
  generation: number;
  createdAt: number;
}

export interface ConversationContext {
  sessionId: string;
  topic: string;
  subject: string;
  language: 'english' | 'hindi' | 'hinglish';
  currentConcept?: string;
  currentLessonBeat?: number;
  recentTurns: Array<{
    role: 'student' | 'teacher' | 'system';
    text: string;
    timestamp: string;
  }>;
  conceptsCovered: string[];
  currentVisualType?: TutorVisualType;
  currentVisualData?: TutorVisualData;
  currentVisualPlan?: VisualPlan;
  lastTeachingSegment?: ReplaySegment;
  assessmentState?: {
    isActive: boolean;
    currentQuestionId?: string;
    assessmentSessionId?: string;
  };
  teachingState: TeachingState;
}

export interface OrchestratedTurnResult {
  turnId: string;
  intent: StudentIntent;
  route: 'TEACHER' | 'ASSESSMENT' | 'REPLAY' | 'SESSION_MEMORY' | 'CONTROL';
  state: ClassroomState;
  tutorAction: TutorAction;
  speechText?: string;
  displayText: string;
  captionText?: string;
  visual?: {
    type: TutorVisualType;
    data: TutorVisualData;
  };
  visualPlan?: VisualPlan;
  visualBeats?: VisualBeat[];
  assessmentQuestion?: ClientAssessmentQuestion;
  teachingState: TeachingState;
  isDeterministicReplay?: boolean;
  message?: string;
}

export interface STTProvider {
  isSupported(): boolean;
  start(callbacks: {
    onInterim?: (text: string) => void;
    onFinal?: (text: string) => void;
    onError?: (err: string) => void;
  }): void;
  stop(): void;
  cancel(): void;
  pause(): void;
  resume(): void;
}

export interface TTSProvider {
  isSupported(): boolean;
  speak(
    text: string,
    language: 'english' | 'hindi' | 'hinglish',
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  isSpeaking(): boolean;
}
