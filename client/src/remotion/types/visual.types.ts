import type {
  TutorVisualState,
  TutorAvatarState,
  TutorVisualType,
  TutorVisualMode,
} from '@ai-tutor/shared';

export type { TutorVisualState, TutorAvatarState, TutorVisualType, TutorVisualMode };

export const DEFAULT_VISUAL_STATE: TutorVisualState = {
  sessionId: '',
  topic: 'Light Reflection & Refraction',
  concept: 'Introduction to Light',
  mode: 'IDLE',
  avatarState: 'IDLE',
  visualType: 'TITLE',
  visualData: {
    title: 'Light: Reflection & Refraction',
    subtitle: 'Understanding the Behavior of Light Waves and Rays',
  },
  // Phase 2.6: beat and caption segmentation
  activeBeatIndex: 0,
  activeCaptionIndex: 0,
  totalBeats: 1,
};
