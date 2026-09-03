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
};
