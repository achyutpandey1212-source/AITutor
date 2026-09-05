import React from 'react';

export interface StageSubtitlePillProps {
  captionText?: string;
  interimTranscript?: string;
  isInterrupting?: boolean;
  isVisible: boolean;
  bottom?: string;
}

export const StageSubtitlePill: React.FC<StageSubtitlePillProps> = ({
  captionText,
  interimTranscript,
  isInterrupting = false,
  isVisible,
  bottom = '1.25rem',
}) => {
  // Immediate clearance upon interruption (zero ghost text or lagging snippets)
  if (isInterrupting) return null;

  // Prefer active speech if student is currently speaking, else teacher's caption
  const displayText = interimTranscript ? `"${interimTranscript}"` : captionText;

  if (!isVisible || !displayText) return null;

  const isStudentSpeech = Boolean(interimTranscript);

  return (
    <div
      className="stage-subtitle-overlay"
      style={{
        position: 'absolute',
        bottom: bottom,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '82%',
        width: 'auto',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--theater-font-sans)',
          fontSize: 'clamp(0.95rem, 1.8vw, 1.18rem)',
          fontWeight: 450,
          lineHeight: 1.45,
          letterSpacing: '-0.012em',
          color: isStudentSpeech ? 'var(--theater-text-secondary)' : '#ffffff',
          fontStyle: isStudentSpeech ? 'italic' : 'normal',
          textShadow:
            '0 2px 8px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 1px rgba(0, 0, 0, 0.95)',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--theater-radius-sm)',
          // Minimal high-contrast legibility backing only for extreme contrast
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {displayText}
      </p>
    </div>
  );
};
