import React from 'react';
import type { TutorAvatarState } from '@ai-tutor/shared';
import { ProductionAvatarViewport } from '../Avatar/ProductionAvatarViewport';
import type { CameraFramingState } from '../Avatar/types';

export type InteractionState =
  | 'READY'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'PAUSED'
  | 'ERROR';

export interface TutorPresenceProps {
  interactionState?: InteractionState;
  avatarState?: TutorAvatarState;
  isSpeaking?: boolean;
  isInterrupting?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  framing?: CameraFramingState;
}

export const TutorPresence: React.FC<TutorPresenceProps> = ({
  interactionState,
  avatarState,
  isSpeaking = false,
  isInterrupting = false,
  isListening = false,
  isThinking = false,
  framing = 'medium',
}) => {
  // Derive active status with single-source priority
  const currentState: InteractionState =
    interactionState ||
    (isInterrupting || avatarState === 'INTERRUPTING'
      ? 'INTERRUPTED'
      : isSpeaking || avatarState === 'SPEAKING'
      ? 'SPEAKING'
      : isThinking || avatarState === 'THINKING'
      ? 'THINKING'
      : isListening || avatarState === 'LISTENING'
      ? 'LISTENING'
      : 'READY');

  const getStatusLabel = () => {
    switch (currentState) {
      case 'SPEAKING':
        return 'Explaining';
      case 'LISTENING':
        return 'Listening';
      case 'THINKING':
        return 'Thinking';
      case 'INTERRUPTED':
        return 'Interrupted';
      case 'PAUSED':
        return 'Paused';
      case 'ERROR':
        return 'Notice';
      case 'READY':
      default:
        return 'Lumo';
    }
  };

  const isAudioActive = currentState === 'SPEAKING' || currentState === 'LISTENING';

  return (
    <div
      id="lumo-avatar-viewport"
      data-interaction-state={currentState}
      aria-label={`Lumo tutor status: ${getStatusLabel()}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* 3D Avatar Mount — Seamlessly occupies companion space without card frames */}
      <div
        id="lumo-avatar-mount"
        style={{
          width: '100%',
          flex: 1,
          minHeight: '260px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <ProductionAvatarViewport
          interactionState={currentState}
          framing={framing}
        />
      </div>

      {/* Understated Typographic Status Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--theater-radius-pill, 9999px)',
          background: 'rgba(20, 21, 24, 0.55)',
          border: '1px solid var(--theater-border-subtle, rgba(255, 255, 255, 0.07))',
          backdropFilter: 'blur(8px)',
          marginTop: '0.35rem',
          marginBottom: '0.25rem',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: isAudioActive
              ? 'var(--theater-text-primary, #F5F5F5)'
              : 'var(--theater-text-muted, #66666A)',
            opacity: isAudioActive ? 0.95 : 0.4,
            transition: 'opacity var(--theater-transition-fast, 120ms ease)',
          }}
        />
        <span
          style={{
            fontSize: '0.70rem',
            fontWeight: 500,
            color: 'var(--theater-text-secondary, #A1A1A5)',
            fontFamily: 'var(--theater-font-sans, system-ui, sans-serif)',
            letterSpacing: '-0.01em',
          }}
        >
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
};
