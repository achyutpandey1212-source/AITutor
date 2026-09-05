import React from 'react';
import type { WorkspaceContext } from './types';

interface EmptyStateProps {
  context: WorkspaceContext;
  onSelectPrompt: (prompt: string) => void;
  onOpenContextModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  context,
  onOpenContextModal,
}) => {
  const hasContext = Boolean(
    context.subject || context.topic || context.concept || context.documentTitle
  );

  const contextName =
    context.documentTitle ||
    [context.subject, context.topic, context.concept].filter(Boolean).join(' · ');

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'var(--space-12) var(--space-4) var(--space-8) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(26px, 3.2vw, 36px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-2) 0',
          lineHeight: 1.15,
        }}
        className="lumo-editorial-title"
      >
        What shall we unpack today?
      </h2>

      <p
        style={{
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.55,
          maxWidth: '460px',
          margin: '0 0 var(--space-6) 0',
        }}
      >
        Ask doubts, deconstruct difficult derivations, or cross-examine your study materials.
      </p>

      {/* Active Context Banner if set */}
      {hasContext && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>Grounded in:</span>
          <strong style={{ color: 'var(--color-text-primary)' }}>{contextName}</strong>
          <button
            type="button"
            onClick={onOpenContextModal}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-orange)',
              fontWeight: 600,
              fontSize: '11px',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
};

