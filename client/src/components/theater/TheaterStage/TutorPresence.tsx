import React from 'react';
import type { TutorAvatarState } from '@ai-tutor/shared';

export interface TutorPresenceProps {
  avatarState: TutorAvatarState;
  isSpeaking?: boolean;
  isInterrupting?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
}

export const TutorPresence: React.FC<TutorPresenceProps> = ({
  avatarState,
  isSpeaking = false,
  isInterrupting = false,
  isListening = false,
  isThinking = false,
}) => {
  const speakingActive = isSpeaking || avatarState === 'SPEAKING';
  const interruptingActive = isInterrupting || avatarState === 'INTERRUPTING';
  const listeningActive = isListening || avatarState === 'LISTENING';
  const thinkingActive = isThinking || avatarState === 'THINKING';

  const getStatusText = () => {
    if (interruptingActive) return 'Listening';
    if (speakingActive) return 'Explaining';
    if (thinkingActive) return 'Thinking';
    if (listeningActive) return 'Listening';
    return 'Lumo';
  };

  return (
    <div
      id="lumo-avatar-viewport"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '120px',
        padding: '0.5rem',
        borderRadius: 'var(--theater-radius-md)',
        background: 'transparent',
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: 'opacity var(--theater-transition-fast)',
      }}
    >
      {/* Architectural Mount Slot for Phase 4 3D Avatar */}
      <div
        id="lumo-avatar-mount"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--theater-surface-elevated)',
          border: '1px solid var(--theater-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '0.4rem',
        }}
      >
        {/* Acoustic Micro-Visualizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '14px',
          }}
        >
          {[4, 9, 14, 8, 12, 6].map((baseHeight, i) => {
            const h = speakingActive
              ? baseHeight
              : listeningActive
              ? Math.max(3, Math.round(baseHeight * 0.6))
              : 2;
            return (
              <span
                key={i}
                style={{
                  width: '2px',
                  height: `${h}px`,
                  borderRadius: '1px',
                  background: 'var(--theater-text-primary)',
                  opacity: speakingActive ? 0.9 : listeningActive ? 0.6 : 0.25,
                  transition: 'height 0.12s ease',
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
            background: speakingActive || listeningActive ? 'var(--theater-text-primary)' : 'var(--theater-text-muted)',
            opacity: speakingActive || listeningActive ? 1 : 0.4,
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
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};
