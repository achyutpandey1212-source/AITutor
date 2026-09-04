import React from 'react';

export const NotAnotherChatbot: React.FC = () => {
  const chatbotSteps = [
    { label: 'User types prompt', desc: 'Single prompt in a generic text box' },
    { label: 'Unstructured text dump', desc: 'Generates paragraphs of passive text' },
    { label: 'Passive reading', desc: 'No active synthesis or visual mental models' },
    { label: 'Forgotten in 24 hours', desc: 'Zero retention check, zero adaptation' },
  ];

  const lumoSteps = [
    { label: 'Understand & Assess', desc: 'Maps prior knowledge and identifies misconceptions', color: 'var(--color-orange)' },
    { label: 'Visual Stage Breakdown', desc: 'Draws diagrams, vectors, and anatomical models', color: 'var(--color-sky)' },
    { label: 'Socratic Check-In', desc: 'Probes intuition with targeted thought experiments', color: 'var(--color-yellow)' },
    { label: 'Adaptive Calibration', desc: 'Re-angles the explanation if understanding wavers', color: 'var(--color-mint)' },
    { label: 'Long-Term Mastery', desc: 'Concepts solidified into lasting mental models', color: 'var(--color-orange)' },
  ];

  return (
    <section
      style={{
        padding: 'var(--space-20) var(--space-6)',
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
      }}
    >
      {/* Section Header */}
      <div style={{ maxWidth: '640px', marginBottom: 'var(--space-12)' }}>
        <p
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-mint)',
            marginBottom: 'var(--space-3)',
          }}
        >
          The Difference
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 4.5vw, var(--text-h1))',
            fontWeight: 800,
            letterSpacing: 'var(--text-h1-ls)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.15,
            marginBottom: 'var(--space-4)',
          }}
        >
          Not another chatbot.
        </h2>
        <p
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--text-body-lg-lh)',
          }}
        >
          Chatbots generate answers to be skimmed. Lumo constructs an interactive mental sandbox where you actively build understanding.
        </p>
      </div>

      {/* Visual Contrast Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: 'var(--space-8)',
          alignItems: 'stretch',
        }}
        className="lumo-contrast-grid"
      >
        {/* Left: Traditional AI Chatbot */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-cinematic)',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              Generic Chatbots
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface-soft)',
              }}
            >
              Passive Q&A
            </span>
          </div>

          {/* Chatbot Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
            {chatbotSteps.map((step, idx) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 'var(--space-8)',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-muted)',
              fontSize: '13px',
            }}
          >
            <span style={{ color: 'var(--color-error)', fontWeight: 800 }}>✕</span>
            <span>Passive reading leads to rapid retention drop-off.</span>
          </div>
        </div>

        {/* Right: Lumo Adaptive Environment */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-orange)',
            borderRadius: 'var(--radius-cinematic)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--color-orange)',
              }}
            >
              Lumo Learning Engine
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-orange)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-orange-soft)',
              }}
            >
              Active Synthesis
            </span>
          </div>

          {/* Lumo Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
            {lumoSteps.map((step, idx) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--color-orange-soft)',
                    border: '1px solid var(--color-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-orange)',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 'var(--space-8)',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-mint)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <span style={{ fontWeight: 800 }}>✓</span>
            <span>Multimodal grounding builds verifiable intuition that sticks.</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .lumo-contrast-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
