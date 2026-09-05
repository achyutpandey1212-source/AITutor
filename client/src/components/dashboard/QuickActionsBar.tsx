import React from 'react';
import { Button } from '../ui/Button';

// ---------------------------------------------------------------
// Lumo Quick Actions Bar (Editorial Edition)
// Understated, refined horizontal actions without card clutter
// ---------------------------------------------------------------

export interface QuickActionsBarProps {
  onStartLearning: () => void;
  onPractice: () => void;
  onAskLumo?: () => void;
  onUploadMaterial: () => void;
  onViewMistakes: () => void;
  dueReviewsCount?: number;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onStartLearning,
  onPractice,
  onAskLumo,
  onUploadMaterial,
  onViewMistakes,
  dueReviewsCount = 0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
        padding: 'var(--space-1) 0',
      }}
      role="toolbar"
      aria-label="Quick learning actions"
    >
      <Button
        variant="primary"
        size="sm"
        onClick={onStartLearning}
        style={{
          borderRadius: 'var(--radius-md)',
          padding: '0 16px',
          height: '36px',
          fontSize: '13px',
          fontWeight: 600,
          gap: '6px',
        }}
      >
        <span>+</span>
        <span>New Topic</span>
      </Button>

      {onAskLumo && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAskLumo}
          style={{
            borderRadius: 'var(--radius-md)',
            padding: '0 14px',
            height: '36px',
            fontSize: '13px',
            fontWeight: 500,
            gap: '6px',
          }}
        >
          <span style={{ color: 'var(--color-orange)' }}>✦</span>
          <span>Ask Lumo AI</span>
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={onPractice}
        style={{
          borderRadius: 'var(--radius-md)',
          padding: '0 14px',
          height: '36px',
          fontSize: '13px',
          fontWeight: 500,
          gap: '6px',
        }}
      >
        <span>🎯</span>
        <span>Practice Hub</span>
      </Button>

      <button
        onClick={onUploadMaterial}
        style={{
          background: 'transparent',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          padding: '0 14px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all var(--motion-fast) var(--ease-standard)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-orange)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
          e.currentTarget.style.background = 'var(--color-surface)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span>📄</span>
        <span>Upload Notes</span>
      </button>

      {dueReviewsCount > 0 ? (
        <button
          onClick={onViewMistakes}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-warning)',
            color: 'var(--color-text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0 12px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <span>Reviews due</span>
          <span
            style={{
              background: 'var(--color-warning)',
              color: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {dueReviewsCount}
          </span>
        </button>
      ) : (
        <button
          onClick={onViewMistakes}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '0 8px',
            height: '36px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color var(--motion-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          <span>Review notebook</span>
        </button>
      )}
    </div>
  );
};
