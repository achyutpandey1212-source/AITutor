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
        gap: 'var(--space-4)',
        flexWrap: 'wrap',
        padding: 'var(--space-2) 0',
      }}
      role="toolbar"
      aria-label="Quick learning actions"
    >
      <Button
        variant="primary"
        size="md"
        onClick={onStartLearning}
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '0 var(--space-6)',
          height: '42px',
        }}
      >
        + Start new topic
      </Button>

      {onAskLumo && (
        <Button
          variant="secondary"
          size="md"
          onClick={onAskLumo}
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '0 var(--space-5)',
            height: '42px',
            background: 'transparent',
          }}
        >
          ✦ Ask Lumo
        </Button>
      )}

      <Button
        variant="secondary"
        size="md"
        onClick={onPractice}
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '0 var(--space-5)',
          height: '42px',
          background: 'transparent',
        }}
      >
        Practice questions
      </Button>

      <button
        onClick={onUploadMaterial}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'color var(--motion-fast) var(--ease-standard)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
      >
        <span>+ Add study material</span>
      </button>

      {dueReviewsCount > 0 ? (
        <button
          onClick={onViewMistakes}
          style={{
            background: 'var(--color-warning-soft)',
            border: '1px solid var(--color-warning)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Review mistakes</span>
          <span
            style={{
              background: 'var(--color-warning)',
              color: '#FFFFFF',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
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
            fontSize: 'var(--text-body-sm)',
            cursor: 'pointer',
            padding: '8px 12px',
            transition: 'color var(--motion-fast) var(--ease-standard)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          Mistakes log
        </button>
      )}
    </div>
  );
};
