import React from 'react';

export interface ReplayControlsProps {
  onExplainAgain: () => void;
  onExplainDifferently?: () => void;
  onInterrupt?: () => void;
  isSpeaking?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  disabled?: boolean;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  onExplainAgain,
  onExplainDifferently,
  onInterrupt,
  isSpeaking = false,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  disabled = false,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        borderRadius: '8px',
        padding: '0.25rem 0.5rem',
      }}
    >
      <button
        onClick={onExplainAgain}
        disabled={disabled}
        title="Replay previous explanation deterministically"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '5px',
          padding: '0.3rem 0.65rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>↻</span>
        <span>Explain Again</span>
      </button>

      {onExplainDifferently && (
        <button
          onClick={onExplainDifferently}
          disabled={disabled}
          title="Explain concept with a new explanation and visual"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            border: '1px solid #6366f1',
            borderRadius: '5px',
            padding: '0.3rem 0.6rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <span>💡</span>
          <span>Differently</span>
        </button>
      )}

      {onInterrupt && isSpeaking && (
        <button
          onClick={onInterrupt}
          title="Interrupt tutor immediately (barge-in)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            padding: '0.3rem 0.65rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <span>✋</span>
          <span>Stop</span>
        </button>
      )}

      {onPrevious && (
        <button
          onClick={onPrevious}
          disabled={disabled || !hasPrevious}
          title="Previous teaching segment"
          style={{
            background: 'transparent',
            color: hasPrevious && !disabled ? '#cbd5e1' : '#64748b',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: '5px',
            padding: '0.3rem 0.5rem',
            fontSize: '0.75rem',
            cursor: hasPrevious && !disabled ? 'pointer' : 'not-allowed',
          }}
        >
          ⏮ Prev
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          disabled={disabled || !hasNext}
          title="Next teaching segment"
          style={{
            background: 'transparent',
            color: hasNext && !disabled ? '#cbd5e1' : '#64748b',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: '5px',
            padding: '0.3rem 0.5rem',
            fontSize: '0.75rem',
            cursor: hasNext && !disabled ? 'pointer' : 'not-allowed',
          }}
        >
          Next ⏭
        </button>
      )}
    </div>
  );
};
