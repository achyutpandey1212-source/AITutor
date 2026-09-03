import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { TutorAvatarState } from '@ai-tutor/shared';

export interface AvatarPlaceholderProps {
  avatarState: TutorAvatarState;
}

export const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({ avatarState }) => {
  const frame = useCurrentFrame();

  // Subtle breathing / idle oscillation
  const idleScale = 1 + Math.sin(frame / 15) * 0.02;

  // Energetic pulse when speaking
  const speakingPulse = avatarState === 'SPEAKING' ? 1 + Math.abs(Math.sin(frame / 4)) * 0.08 : 1;

  // Wave heights for speech audio visualizer
  const bar1 = avatarState === 'SPEAKING' ? 8 + Math.abs(Math.sin(frame / 3)) * 24 : 4;
  const bar2 = avatarState === 'SPEAKING' ? 12 + Math.abs(Math.sin(frame / 2.5 + 1)) * 32 : 4;
  const bar3 = avatarState === 'SPEAKING' ? 10 + Math.abs(Math.sin(frame / 3.2 + 2)) * 28 : 4;
  const bar4 = avatarState === 'SPEAKING' ? 6 + Math.abs(Math.sin(frame / 2.8 + 3)) * 20 : 4;

  const getTheme = () => {
    switch (avatarState) {
      case 'SPEAKING':
        return {
          glow: 'rgba(147, 51, 234, 0.4)',
          border: '#a855f7',
          badgeBg: '#7e22ce',
          badgeText: '#ffffff',
          label: 'Speaking',
          icon: '🔊',
        };
      case 'LISTENING':
        return {
          glow: 'rgba(34, 197, 94, 0.4)',
          border: '#22c55e',
          badgeBg: '#15803d',
          badgeText: '#ffffff',
          label: 'Listening',
          icon: '🎙️',
        };
      case 'THINKING':
        return {
          glow: 'rgba(59, 130, 246, 0.4)',
          border: '#3b82f6',
          badgeBg: '#1d4ed8',
          badgeText: '#ffffff',
          label: 'Thinking...',
          icon: '💭',
        };
      case 'INTERRUPTING':
        return {
          glow: 'rgba(234, 179, 8, 0.5)',
          border: '#eab308',
          badgeBg: '#a16207',
          badgeText: '#ffffff',
          label: 'Interrupted',
          icon: '✋',
        };
      case 'IDLE':
      default:
        return {
          glow: 'rgba(100, 116, 139, 0.2)',
          border: '#64748b',
          badgeBg: '#334155',
          badgeText: '#e2e8f0',
          label: 'Idle',
          icon: '🤖',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(15, 23, 42, 0.75)',
        borderRadius: '16px',
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 8px 32px ${theme.glow}`,
        width: '180px',
        userSelect: 'none',
      }}
    >
      {/* Avatar Circle */}
      <div
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: `3px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transform: `scale(${idleScale * speakingPulse})`,
          boxShadow: `0 0 20px ${theme.glow}`,
          transition: 'border 0.2s, box-shadow 0.2s',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>👨‍🏫</span>

        {/* Listening / Speaking animated pulse rings */}
        {avatarState === 'LISTENING' && (
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '2px solid rgba(34, 197, 94, 0.6)',
              opacity: 0.5 + Math.sin(frame / 6) * 0.4,
            }}
          />
        )}
      </div>

      {/* Teacher Title */}
      <div
        style={{
          color: '#f8fafc',
          fontWeight: 700,
          fontSize: '0.95rem',
          marginTop: '0.75rem',
          letterSpacing: '0.02em',
        }}
      >
        AI Teacher
      </div>

      {/* State Badge */}
      <div
        style={{
          marginTop: '0.4rem',
          padding: '0.2rem 0.65rem',
          borderRadius: '999px',
          background: theme.badgeBg,
          color: theme.badgeText,
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        <span>{theme.icon}</span>
        <span>{theme.label}</span>
      </div>

      {/* Speech Audio Waveform Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          height: '36px',
          marginTop: '0.5rem',
        }}
      >
        <div
          style={{
            width: '4px',
            height: `${bar1}px`,
            background: theme.border,
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            width: '4px',
            height: `${bar2}px`,
            background: theme.border,
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            width: '4px',
            height: `${bar3}px`,
            background: theme.border,
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            width: '4px',
            height: `${bar4}px`,
            background: theme.border,
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
};
