import type {
  TutorVisualState,
  TutorAvatarState,
  TutorVisualType,
  TutorVisualMode,
  TutorVisualData,
} from '@ai-tutor/shared';

export type { TutorVisualState, TutorAvatarState, TutorVisualType, TutorVisualMode, TutorVisualData };

export const DEFAULT_VISUAL_STATE: TutorVisualState = {
  sessionId: '',
  topic: 'AI Tutor Classroom',
  concept: 'Introduction',
  mode: 'IDLE',
  avatarState: 'IDLE',
  visualType: 'TITLE',
  visualData: {
    title: 'AI Tutor Classroom',
    subtitle: 'Interactive AI Visual Classroom',
  },
  // Phase 2.6: beat and caption segmentation
  activeBeatIndex: 0,
  activeCaptionIndex: 0,
  totalBeats: 1,
  // Phase 3: Accessibility toggle (default: false)
  captionsEnabled: false,
};
