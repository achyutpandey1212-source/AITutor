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
    ? `Interrupted: "${interimTranscript}"`
    : interimTranscript
    ? `"${interimTranscript}"`
    : captionText;

  if (!isVisible || !displayText) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '85%',
        background: isInterrupting
          ? 'var(--theater-surface-elevated)'
          : 'var(--theater-surface)',
        border: isInterrupting
          ? '1px solid var(--theater-accent-border)'
          : '1px solid var(--theater-border-medium)',
        borderRadius: 'var(--theater-radius-md)',
        padding: '0.45rem 1.1rem',
        color: isInterrupting ? 'var(--theater-accent)' : 'var(--theater-text-primary)',
        fontSize: '0.85rem',
        fontWeight: 500,
        textAlign: 'center',
        boxShadow: 'var(--theater-shadow-dock)',
        zIndex: 20,
        lineHeight: 1.45,
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      <span>{displayText}</span>
    </div>
  );
};
