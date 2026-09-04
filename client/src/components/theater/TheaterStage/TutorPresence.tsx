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
    if (interruptingActive) return 'Listening...';
    if (speakingActive) return 'Explaining...';
    if (thinkingActive) return 'Thinking...';
    if (listeningActive) return 'Listening...';
    return 'Lumo';
  };

  const getStatusDotColor = () => {
    if (interruptingActive) return 'var(--theater-accent-amber)';
    if (speakingActive) return 'var(--theater-accent)';
    if (listeningActive) return 'var(--theater-accent-mint)';
    return 'var(--theater-text-muted)';
  };

  return (
    <div
      id="lumo-avatar-viewport"
      style={{
        position: 'relative',
        width: 'min(280px, 24vw)',
        minWidth: '220px',
        height: '100%',
        minHeight: '340px',
        borderRadius: 'var(--theater-radius-lg)',
        background: 'var(--theater-surface)',
        border: '1px solid var(--theater-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.85rem',
        boxSizing: 'border-box',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top Presence Header: Lumo status label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: getStatusDotColor(),
              transition: 'background var(--theater-transition-fast)',
            }}
          />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 550,
              color: 'var(--theater-text-primary)',
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            Lumo
          </span>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 450,
            color: 'var(--theater-text-muted)',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Main Architectural Slot for Phase 4 3D Avatar */}
      <div
        id="lumo-avatar-mount"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '0.5rem 0',
          borderRadius: 'var(--theater-radius-md)',
          background: 'var(--theater-surface-sunken)',
          border: '1px solid var(--theater-border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Watermark Branding in Slot */}
        <img
          src="/logo/Lumo_Logo.png"
          alt=""
          aria-hidden="true"
          style={{
            width: '44px',
            height: '44px',
            objectFit: 'contain',
            opacity: 0.12,
            position: 'absolute',
          }}
        />

        {/* Minimal Audio Visualizer Bar while Speaking/Listening */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            height: '20px',
            zIndex: 2,
          }}
        >
          {[8, 14, 20, 12, 18, 10, 16, 8].map((baseHeight, i) => {
            const h = speakingActive
              ? baseHeight
              : listeningActive
              ? Math.round(baseHeight * 0.7)
              : 3;
            return (
              <span
                key={i}
                style={{
                  width: '2.5px',
                  height: `${h}px`,
                  borderRadius: '1.5px',
                  background: speakingActive
                    ? 'var(--theater-accent)'
                    : listeningActive
                    ? 'var(--theater-accent-mint)'
                    : 'var(--theater-text-faint)',
                  opacity: speakingActive || listeningActive ? 0.85 : 0.4,
                  transition: 'height 0.15s ease, background 0.2s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Subtext info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '0.2rem',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--theater-text-muted)',
            fontFamily: 'var(--theater-font-sans)',
            textAlign: 'center',
          }}
        >
          {speakingActive
            ? 'Speaking — click mic to interrupt'
            : listeningActive
            ? 'Listening to your speech...'
            : 'Interactive AI Tutor'}
        </span>
      </div>
    </div>
  );
};
