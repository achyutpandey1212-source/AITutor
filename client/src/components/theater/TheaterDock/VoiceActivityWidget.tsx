import React from 'react';

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
    if (isInterrupting) return 'Interrupted — listening...';
    if (isSpeaking) return 'Lumo is explaining...';
    if (isThinking) return 'Lumo is thinking...';
    if (isListening && micEnabled) return 'Listening to you...';
    if (!micEnabled) return 'Microphone muted';
    return 'Talk to Lumo';
  };

  const getSubtext = () => {
    if (isSpeaking) return 'Tap to interrupt or ask a question';
    if (isListening && micEnabled) return 'Speak naturally or tap to mute';
    if (isThinking) return 'Synthesizing pedagogical response...';
    if (!micEnabled) return 'Tap microphone to unmute';
    return 'Tap microphone to speak';
  };

  const getWaveColor = () => {
    if (isInterrupting) return '#E5A93C';
    if (isSpeaking) return '#E29D4B';
    if (isListening) return '#55C98A';
    return '#777773';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {/* 1. Hero Concentric Circular Microphone Button */}
      <button
        onClick={handleClick}
        disabled={!isSttSupported}
        aria-label={isSpeaking ? 'Interrupt Lumo' : micEnabled ? 'Mute microphone' : 'Unmute microphone'}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#101011',
          border: isSpeaking
            ? '2px solid #E29D4B'
            : isListening && micEnabled
            ? '2px solid #55C98A'
            : isInterrupting
            ? '2px solid #E5A93C'
            : '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isSpeaking
            ? '0 0 20px rgba(226, 157, 75, 0.3)'
            : isListening && micEnabled
            ? '0 0 16px rgba(85, 201, 138, 0.25)'
            : '0 4px 12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isSttSupported ? 'pointer' : 'not-allowed',
          outline: 'none',
          padding: 0,
          flexShrink: 0,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        title={isSpeaking ? 'Tap to interrupt' : micEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {/* Subtle Outer Concentric Ring for Active State */}
        {(isSpeaking || (isListening && micEnabled)) && (
          <div
            style={{
              position: 'absolute',
              inset: '-5px',
              borderRadius: '50%',
              border: isSpeaking
                ? '1px solid rgba(226, 157, 75, 0.3)'
                : '1px solid rgba(85, 201, 138, 0.3)',
              animation: isSpeaking ? 'theaterMicPulse 2s infinite' : 'theaterListeningPulse 2s infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Microphone SVG Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isSpeaking ? '#E29D4B' : isListening && micEnabled ? '#55C98A' : '#F5F5F2'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      {/* 2. Waveform & Two-Line Status Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Animated Waveform Bars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              height: '14px',
            }}
          >
            {[6, 12, 16, 10, 14, 8, 12, 6].map((h, i) => {
              const activeHeight = isSpeaking || (isListening && micEnabled) ? h : 3;
              return (
                <span
                  key={i}
                  style={{
                    width: '2.5px',
                    height: `${activeHeight}px`,
                    background: getWaveColor(),
                    borderRadius: '1.5px',
                    transition: 'height 0.15s ease',
                  }}
                />
              );
            })}
          </div>

          <span
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#F5F5F2',
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
            fontSize: '0.75rem',
            color: '#777773',
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
