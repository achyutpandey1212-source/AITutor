import React from 'react';
import type { WorkspaceContext } from './types';

interface EmptyStateProps {
  context: WorkspaceContext;
  onSelectPrompt: (prompt: string) => void;
  onOpenContextModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  context,
  onSelectPrompt,
  onOpenContextModal,
}) => {
  const hasContext = Boolean(
    context.subject || context.topic || context.concept || context.documentTitle
  );

  const contextName =
    context.documentTitle ||
    [context.subject, context.topic, context.concept].filter(Boolean).join(' · ');

  // Adaptive starter prompts
  const starterPrompts = hasContext
    ? [
        {
          title: 'Explain simply',
          desc: `Explain the core intuition of ${context.concept || context.topic || context.subject || 'this topic'} in plain English.`,
          prompt: `Can you explain the core intuition behind ${context.concept || context.topic || context.subject || 'this topic'} simply, as if I'm new to it?`,
        },
        {
          title: 'Real-world analogy',
          desc: 'Connect this abstract theory to an everyday physical example.',
          prompt: `Give me a vivid, memorable real-world analogy to help me understand ${context.concept || context.topic || context.subject || 'this concept'}.`,
        },
        {
          title: 'Common misconceptions',
          desc: 'What do students usually get wrong when studying this?',
          prompt: `What are the most common misconceptions students have about ${context.concept || context.topic || context.subject || 'this topic'}, and how should I avoid them?`,
        },
        {
          title: 'Quiz my understanding',
          desc: 'Ask me a thought-provoking conceptual question to check my grasp.',
          prompt: `Test my understanding of ${context.concept || context.topic || context.subject || 'this concept'} with a single conceptual puzzle question. Don't give me the answer right away.`,
        },
      ]
    : [
        {
          title: 'Electric Circuits',
          desc: 'Understand voltage, current, and resistance via water pipe flow.',
          prompt: 'Explain the relationship between voltage, current, and resistance using a water pipe analogy.',
        },
        {
          title: "Newton's Laws",
          desc: 'Explore why things move or stop with everyday physics.',
          prompt: "Explain Newton's three laws of motion with everyday physical examples.",
        },
        {
          title: 'Calculus Intuition',
          desc: 'Why derivatives represent instantaneous rates of change.',
          prompt: 'Why do we need derivatives in calculus? Explain the intuition of instantaneous change.',
        },
        {
          title: 'Challenge Doubt',
          desc: 'Test your critical thinking with a science puzzle.',
          prompt: 'Give me a fun conceptual physics riddle that will test how well I understand force and inertia.',
        },
      ];

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
      {/* Precision Emblem */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <img
          src="/logo/Lumo_Logo.png"
          alt="Lumo"
          style={{ width: '26px', height: '26px', objectFit: 'contain' }}
        />
      </div>

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

      {/* Starter Prompts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '12px',
          width: '100%',
          textAlign: 'left',
          marginTop: 'var(--space-2)',
        }}
      >
        {starterPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left',
              transition: 'all var(--motion-fast) var(--ease-standard)',
              boxShadow: 'var(--shadow-xs)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {item.title}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.45,
              }}
            >
              {item.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
