import React from 'react';
import { IconMic, IconMicOff } from '../TheaterIcons';

export interface VoiceActivityWidgetProps {
  micEnabled: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  isInterrupting?: boolean;
  onToggleMic: () => void;
  onInterrupt?: () => void;
  isSttSupported?: boolean;
}

export const VoiceActivityWidget: React.FC<VoiceActivityWidgetProps> = ({
  micEnabled,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  isInterrupting = false,
  onToggleMic,
  onInterrupt,
  isSttSupported = true,
}) => {
  const handleClick = () => {
    if (isSpeaking && onInterrupt) {
      onInterrupt();
      return;
    }
    onToggleMic();
  };

  const getStatusHeadline = () => {
    if (isInterrupting) return 'Interrupted';
    if (isSpeaking) return 'Lumo is explaining';
    if (isThinking) return 'Lumo is thinking';
    if (isListening && micEnabled) return 'Listening to you';
    if (!micEnabled) return 'Microphone muted';
    return 'Voice ready';
  };

  const getSubtext = () => {
    if (isSpeaking) return 'Tap mic to interrupt';
    if (isListening && micEnabled) return 'Speak naturally';
    if (isThinking) return 'Synthesizing response';
    if (!micEnabled) return 'Tap to unmute';
    return 'Tap to speak';
  };

  const getWaveColor = () => {
    if (isInterrupting) return 'var(--theater-accent-amber)';
    if (isSpeaking) return 'var(--theater-accent)';
    if (isListening && micEnabled) return 'var(--theater-accent-mint)';
    return 'var(--theater-text-faint)';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* 1. Restrained Microphone Control Button */}
      <button
        onClick={handleClick}
        disabled={!isSttSupported}
        aria-label={isSpeaking ? 'Interrupt Lumo' : micEnabled ? 'Mute microphone' : 'Unmute microphone'}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isSpeaking
            ? 'var(--theater-accent)'
            : isListening && micEnabled
            ? 'var(--theater-surface-active)'
            : 'var(--theater-surface-elevated)',
          border: isListening && micEnabled
            ? '1px solid var(--theater-accent-mint)'
            : '1px solid var(--theater-border-medium)',
          color: isSpeaking
            ? 'var(--theater-accent-contrast)'
            : isListening && micEnabled
            ? 'var(--theater-accent-mint)'
            : 'var(--theater-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isSttSupported ? 'pointer' : 'not-allowed',
          outline: 'none',
          padding: 0,
          flexShrink: 0,
          transition: 'all var(--theater-transition-fast)',
        }}
        onMouseEnter={(e) => {
          if (!isSpeaking) {
            e.currentTarget.style.color = 'var(--theater-text-primary)';
            e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSpeaking) {
            e.currentTarget.style.color = isListening && micEnabled ? 'var(--theater-accent-mint)' : 'var(--theater-text-secondary)';
            e.currentTarget.style.borderColor = isListening && micEnabled ? 'var(--theater-accent-mint)' : 'var(--theater-border-medium)';
          }
        }}
        title={isSpeaking ? 'Tap to interrupt' : micEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {micEnabled ? <IconMic size={17} /> : <IconMicOff size={17} />}
      </button>

      {/* 2. Waveform & Concise Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Subtle Acoustic Visualizer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              height: '12px',
            }}
          >
            {[4, 9, 12, 7, 10, 6, 8, 4].map((h, i) => {
              const activeHeight = isSpeaking || (isListening && micEnabled) ? h : 2;
              return (
                <span
                  key={i}
                  style={{
                    width: '2px',
                    height: `${activeHeight}px`,
                    background: getWaveColor(),
                    borderRadius: '1px',
                    transition: 'height 0.12s ease',
                  }}
                />
              );
            })}
          </div>

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 550,
              color: 'var(--theater-text-primary)',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            {getStatusHeadline()}
          </span>
        </div>

        {/* Subtext description */}
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--theater-text-muted)',
            fontWeight: 400,
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          {getSubtext()}
        </span>
      </div>
    </div>
  );
};
