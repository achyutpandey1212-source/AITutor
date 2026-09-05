import React from 'react';

export interface StageSubtitlePillProps {
  captionText?: string;
  interimTranscript?: string;
  isInterrupting?: boolean;
  isVisible: boolean;
  bottom?: string;
  isStatic?: boolean;
}

export const StageSubtitlePill: React.FC<StageSubtitlePillProps> = ({
  captionText,
  interimTranscript,
  isInterrupting = false,
  isVisible,
  bottom = '1.25rem',
  isStatic = false,
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
        position: isStatic ? 'relative' : 'absolute',
        bottom: isStatic ? 'auto' : (isStudentSpeech ? '1rem' : bottom),
        left: isStatic ? 'auto' : '50%',
        transform: isStatic ? 'none' : 'translateX(-50%)',
        maxWidth: isStatic ? '100%' : (isStudentSpeech ? '70%' : '82%'),
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
          fontSize: isStudentSpeech ? 'clamp(0.85rem, 1.4vw, 0.98rem)' : 'clamp(0.95rem, 1.8vw, 1.18rem)',
          fontWeight: isStudentSpeech ? 500 : 450,
          lineHeight: 1.4,
          letterSpacing: '-0.012em',
          color: isStudentSpeech ? 'var(--theater-text-secondary, #cbd5e1)' : '#ffffff',
          fontStyle: isStudentSpeech ? 'italic' : 'normal',
          textShadow: isStudentSpeech
            ? '0 1px 3px rgba(0, 0, 0, 0.8)'
            : '0 2px 8px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 1px rgba(0, 0, 0, 0.95)',
          padding: isStudentSpeech ? '0.25rem 0.75rem' : '0.35rem 0.85rem',
          borderRadius: 'var(--theater-radius-pill, 9999px)',
          background: isStudentSpeech ? 'rgba(15, 23, 42, 0.75)' : 'rgba(0, 0, 0, 0.35)',
          border: isStudentSpeech ? '1px solid rgba(148, 163, 184, 0.25)' : 'none',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        {displayText}
      </p>
    </div>
  );
};
