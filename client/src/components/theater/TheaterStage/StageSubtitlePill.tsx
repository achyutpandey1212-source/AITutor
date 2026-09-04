import React from 'react';

export interface StageSubtitlePillProps {
  captionText?: string;
  interimTranscript?: string;
  isInterrupting?: boolean;
  isVisible: boolean;
}

export const StageSubtitlePill: React.FC<StageSubtitlePillProps> = ({
  captionText,
  interimTranscript,
  isInterrupting = false,
  isVisible,
}) => {
  // If student is speaking or interrupting, display interim speech
  const displayText = isInterrupting
    ? `✋ Interrupted: "${interimTranscript}"`
    : interimTranscript
    ? `🎙️ "${interimTranscript}"`
    : captionText;

  if (!isVisible || !displayText) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '82%',
        background: isInterrupting
          ? 'rgba(42, 24, 20, 0.94)'
          : 'rgba(13, 15, 18, 0.92)',
        backdropFilter: 'blur(12px)',
        border: isInterrupting
          ? '1px solid rgba(245, 185, 66, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '0.45rem 1.25rem',
        color: isInterrupting ? '#F5C542' : '#F7F5EF',
        fontSize: '0.92rem',
        fontWeight: 500,
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        zIndex: 20,
        lineHeight: 1.4,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <span>{displayText}</span>
    </div>
  );
};
