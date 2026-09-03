import React from 'react';

export interface ReplayControlsProps {
  onExplainAgain: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  disabled?: boolean;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  onExplainAgain,
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
