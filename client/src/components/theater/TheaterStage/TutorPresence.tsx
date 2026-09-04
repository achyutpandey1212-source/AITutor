import React from 'react';
import type { TutorAvatarState } from '@ai-tutor/shared';

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
}

export const TutorPresence: React.FC<TutorPresenceProps> = ({
  interactionState,
  avatarState,
  isSpeaking = false,
  isInterrupting = false,
  isListening = false,
  isThinking = false,
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
  const isThinkingState = currentState === 'THINKING';

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
        width: '110px',
        padding: '0.4rem',
        borderRadius: 'var(--theater-radius-md)',
        background: 'transparent',
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: 'opacity var(--theater-transition-fast)',
      }}
    >
      {/* Architectural Mount Slot for Phase 5 3D Avatar */}
      <div
        id="lumo-avatar-mount"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--theater-surface-elevated)',
          border: '1px solid var(--theater-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '0.45rem',
          opacity: isThinkingState ? 0.75 : 1,
          transition: 'opacity 0.3s ease, border-color var(--theater-transition-fast)',
        }}
      >
        {/* Restrained Micro Acoustic Visualization (Quiet, strictly monochrome) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '14px',
          }}
        >
          {[4, 9, 14, 8, 12, 6].map((baseHeight, i) => {
            const h =
              currentState === 'SPEAKING'
                ? baseHeight
                : currentState === 'LISTENING'
                ? Math.max(3, Math.round(baseHeight * 0.55))
                : currentState === 'THINKING'
                ? 3
                : 2;
            return (
              <span
                key={i}
                style={{
                  width: '2px',
                  height: `${h}px`,
                  borderRadius: '1px',
                  background: 'var(--theater-text-primary)',
                  opacity:
                    currentState === 'SPEAKING'
                      ? 0.9
                      : currentState === 'LISTENING'
                      ? 0.6
                      : currentState === 'THINKING'
                      ? 0.4
                      : 0.2,
                  transition: 'height 0.14s ease, opacity 0.2s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Understated Typographic Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: isAudioActive
              ? 'var(--theater-text-primary)'
              : 'var(--theater-text-muted)',
            opacity: isAudioActive ? 0.9 : 0.4,
            transition: 'opacity var(--theater-transition-fast)',
          }}
        />
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 500,
            color: 'var(--theater-text-secondary)',
            fontFamily: 'var(--theater-font-sans)',
            letterSpacing: '-0.01em',
          }}
        >
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
};
