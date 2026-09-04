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
    if (interruptingActive) return 'Interrupted — listening...';
    if (speakingActive) return 'Lumo is explaining...';
    if (thinkingActive) return 'Lumo is thinking...';
    if (listeningActive) return 'Listening to you...';
    return 'Lumo is ready';
  };

  const getWaveformColor = () => {
    if (interruptingActive) return '#E5A93C';
    if (speakingActive) return '#E29D4B';
    if (listeningActive) return '#55C98A';
    return '#777773';
  };

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(300px, 28vw)',
        height: 'min(390px, 58vh)',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#101011',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Background Avatar Subtle Lighting Effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(16, 16, 17, 0.2) 0%, rgba(16, 16, 17, 0.9) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Teacher Video / Portrait Asset */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: '#0B0B0C',
        }}
      >
        <img
          src="/logo/Lumo_Logo.png"
          alt="Lumo Tutor"
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            opacity: 0.12,
            position: 'absolute',
          }}
        />
        {/* Stylized Avatar Illustration / Feed */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.04) 0%, rgba(11, 11, 12, 0.98) 75%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          {/* Avatar Icon / Portrait */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: '#141416',
              border: speakingActive
                ? '2px solid #E29D4B'
                : listeningActive
                ? '2px solid #55C98A'
                : '2px solid rgba(255, 255, 255, 0.08)',
              boxShadow: speakingActive
                ? '0 0 20px rgba(226, 157, 75, 0.25)'
                : listeningActive
                ? '0 0 20px rgba(85, 201, 138, 0.25)'
                : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🎓</span>
          </div>
        </div>
      </div>

      {/* Top Badge: "Lumo  |||•" */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          padding: '1rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(16, 16, 17, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            padding: '0.25rem 0.65rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F5F5F2' }}>Lumo</span>
          {/* Subtle mini wave icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: '10px' }}>
            <span
              style={{
                width: '2px',
                height: speakingActive ? '8px' : '4px',
                background: speakingActive ? '#E29D4B' : '#777773',
                borderRadius: '1px',
                transition: 'height 0.15s ease',
              }}
            />
            <span
              style={{
                width: '2px',
                height: speakingActive ? '10px' : '6px',
                background: speakingActive ? '#E29D4B' : '#777773',
                borderRadius: '1px',
                transition: 'height 0.2s ease',
              }}
            />
            <span
              style={{
                width: '2px',
                height: speakingActive ? '6px' : '3px',
                background: speakingActive ? '#E29D4B' : '#777773',
                borderRadius: '1px',
                transition: 'height 0.18s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Card with Full Animated Waveform */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          margin: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(16, 16, 17, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#F5F5F2',
            letterSpacing: '0.01em',
          }}
        >
          {getStatusText()}
        </span>

        {/* Animated Horizontal Audio Visualizer Bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '14px',
            width: '100%',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const isMid = i >= 6 && i <= 18;
            const height = speakingActive
              ? isMid
                ? ((i * 7) % 10) + 4
                : ((i * 3) % 6) + 2
              : 2;

            return (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: `${height}px`,
                  background: getWaveformColor(),
                  borderRadius: '1px',
                  opacity: speakingActive ? 0.9 : 0.35,
                  transition: 'height 0.2s ease',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
