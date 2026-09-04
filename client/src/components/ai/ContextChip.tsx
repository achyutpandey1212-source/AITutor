import React from 'react';
import type { WorkspaceContext } from './types';

interface ContextChipProps {
  context: WorkspaceContext;
  onChangeContext: () => void;
  onClearContext: () => void;
}

export const ContextChip: React.FC<ContextChipProps> = ({
  context,
  onChangeContext,
  onClearContext,
}) => {
  const hasDocument = Boolean(context.documentTitle || context.documentId);
  const hasSubjectOrTopic = Boolean(context.subject || context.topic || context.concept);
  const hasContext = hasDocument || hasSubjectOrTopic;

  if (!hasContext) {
    return (
      <button
        type="button"
        onClick={onChangeContext}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-pill)',
          background: 'transparent',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-muted)',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all var(--motion-fast) var(--ease-standard)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-orange)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Add context</span>
      </button>
    );
  }

  // Build display label
  let displayLabel = '';
  if (hasDocument) {
    displayLabel = `📄 ${context.documentTitle || 'Attached Document'}`;
  } else {
    const parts = [context.subject, context.topic, context.concept].filter(Boolean);
    displayLabel = parts.join(' · ');
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px 3px 10px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-surface-hover)',
        border: '1px solid var(--color-border)',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        maxWidth: '280px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      <button
        type="button"
        onClick={onChangeContext}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'inherit',
          fontSize: 'inherit',
          cursor: 'pointer',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '220px',
          textAlign: 'left',
        }}
        title={`Active Context: ${displayLabel}. Click to modify.`}
      >
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {displayLabel}
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClearContext();
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          transition: 'color var(--motion-fast) var(--ease-standard)',
        }}
        aria-label="Clear active context"
        title="Remove context"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
