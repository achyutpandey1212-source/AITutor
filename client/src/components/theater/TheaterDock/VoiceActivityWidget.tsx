import React from 'react';
import { IconMic, IconMicOff } from '../TheaterIcons';

export interface VoiceActivityWidgetProps {
  micEnabled: boolean;
  interactionState?: 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED' | 'PAUSED' | 'ERROR';
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
  interactionState,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  isInterrupting = false,
  onToggleMic,
  onInterrupt,
  isSttSupported = true,
}) => {
  const speakingActive = interactionState === 'SPEAKING' || isSpeaking;
  const interruptingActive = interactionState === 'INTERRUPTED' || isInterrupting;
  const thinkingActive = interactionState === 'THINKING' || isThinking;
  const listeningActive = interactionState === 'LISTENING' || isListening;

  const handleClick = () => {
    if (speakingActive && onInterrupt) {
      onInterrupt();
      return;
    }
    onToggleMic();
  };

  const getStatusHeadline = () => {
    if (interruptingActive) return 'Listening';
    if (speakingActive) return 'Explaining';
    if (thinkingActive) return 'Thinking';
    if (listeningActive && micEnabled) return 'Listening';
    if (!micEnabled) return 'Muted';
    return 'Ready';
  };

  const getTooltipText = () => {
    if (!isSttSupported) return 'Speech recognition not supported in this browser';
    if (speakingActive) return 'Tap to interrupt (M)';
    if (micEnabled) return 'Mute microphone (M)';
    return 'Unmute microphone (M)';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
      {/* 1. High-Craft Microphone Control Button */}
      <button
        onClick={handleClick}
        disabled={!isSttSupported}
        aria-label={getTooltipText()}
        title={getTooltipText()}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: speakingActive
            ? 'var(--theater-surface-active)'
            : listeningActive && micEnabled
            ? 'var(--theater-surface-elevated)'
            : 'var(--theater-surface-elevated)',
          border: speakingActive
            ? '1px solid var(--theater-text-primary)'
            : listeningActive && micEnabled
            ? '1px solid var(--theater-border-strong)'
            : '1px solid var(--theater-border-medium)',
          color: 'var(--theater-text-primary)',
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
          e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = speakingActive
            ? 'var(--theater-text-primary)'
            : listeningActive && micEnabled
            ? 'var(--theater-border-strong)'
            : 'var(--theater-border-medium)';
        }}
      >
        {micEnabled ? <IconMic size={15} /> : <IconMicOff size={15} />}
      </button>

      {/* 2. Micro Waveform & Compact Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {/* Subtle Acoustic Visualizer (Quiet, monochrome) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            height: '11px',
          }}
        >
          {[3, 8, 11, 6, 9, 5].map((h, i) => {
            const activeHeight = speakingActive || (listeningActive && micEnabled) ? h : 2;
            return (
              <span
                key={i}
                style={{
                  width: '2px',
                  height: `${activeHeight}px`,
                  background: 'var(--theater-text-primary)',
                  opacity: speakingActive ? 0.85 : listeningActive && micEnabled ? 0.6 : 0.2,
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
