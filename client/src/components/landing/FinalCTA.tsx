import React from 'react';
import { Button } from '../ui/Button';

interface FinalCTAProps {
  onStart: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStart }) => {
  return (
    <section
      style={{
        padding: 'var(--space-32) var(--space-6)',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(36px, 5.5vw, var(--text-h1))',
          fontWeight: 800,
          letterSpacing: 'var(--text-h1-ls)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.15,
          marginBottom: 'var(--space-4)',
        }}
      >
        Ready to learn differently?
      </h2>

      <p
        style={{
          fontSize: 'var(--text-body-lg)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--text-body-lg-lh)',
          maxWidth: '520px',
          margin: '0 auto var(--space-10)',
        }}
      >
        Pick a topic. Bring your material. Ask a question.
        <br />
        Lumo will take it from there.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <Button variant="primary" size="lg" onClick={onStart}>
          <span>Start Learning</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: 'var(--space-12)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
          flexWrap: 'wrap',
        }}
      >
        <span>✓ Instant Voice & Visuals</span>
        <span>✓ Bring Your Own PDFs</span>
        <span>✓ Adapts to Your Thinking</span>
      </div>
    </section>
  );
};
