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
    if (isInterrupting) return 'Listening';
    if (isSpeaking) return 'Explaining';
    if (isThinking) return 'Thinking';
    if (isListening && micEnabled) return 'Listening';
    if (!micEnabled) return 'Muted';
    return 'Ready';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      {/* 1. High-Craft Microphone Control Button */}
      <button
        onClick={handleClick}
        disabled={!isSttSupported}
        aria-label={isSpeaking ? 'Interrupt Lumo' : micEnabled ? 'Mute microphone' : 'Unmute microphone'}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: isSpeaking
            ? 'var(--theater-accent)'
            : isListening && micEnabled
            ? 'var(--theater-surface-active)'
            : 'var(--theater-surface-elevated)',
          border: isListening && micEnabled
            ? '1px solid var(--theater-text-primary)'
            : '1px solid var(--theater-border-medium)',
          color: isSpeaking
            ? 'var(--theater-accent-contrast)'
            : 'var(--theater-text-primary)',
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
            e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSpeaking) {
            e.currentTarget.style.borderColor = isListening && micEnabled ? 'var(--theater-text-primary)' : 'var(--theater-border-medium)';
          }
        }}
        title={isSpeaking ? 'Tap to interrupt' : micEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {micEnabled ? <IconMic size={16} /> : <IconMicOff size={16} />}
      </button>

      {/* 2. Micro Waveform & Compact Single-Word Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Subtle Acoustic Visualizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '11px',
          }}
        >
          {[3, 8, 11, 6, 9, 5].map((h, i) => {
            const activeHeight = isSpeaking || (isListening && micEnabled) ? h : 2;
            return (
              <span
                key={i}
                style={{
                  width: '2px',
                  height: `${activeHeight}px`,
                  background: 'var(--theater-text-primary)',
                  opacity: isSpeaking ? 0.9 : isListening && micEnabled ? 0.6 : 0.25,
                  borderRadius: '1px',
                  transition: 'height 0.12s ease',
                }}
              />
            );
          })}
        </div>

        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 500,
            color: 'var(--theater-text-primary)',
            letterSpacing: '-0.01em',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          {getStatusHeadline()}
        </span>
      </div>
    </div>
  );
};
