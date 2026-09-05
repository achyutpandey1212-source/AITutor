import React, { useState, useEffect } from 'react';

export const TeachingLoop: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'Student asks a doubt',
      subtitle: 'Speaks aloud or types naturally on any concept.',
      badge: 'Natural Interaction',
      detail: '"How does a rocket accelerate in space if there is no air to push off?"',
      visualType: 'voice',
    },
    {
      num: '02',
      title: 'Lumo plans the lesson',
      subtitle: 'Pinpoints the underlying misconception and structures a sequence.',
      badge: 'Pedagogical Model',
      detail: 'Detects misconception: "Thrust requires ambient air to push against". Target: Conservation of Momentum & Newton\'s 3rd Law.',
      visualType: 'plan',
    },
    {
      num: '03',
      title: 'Visual concept appears',
      subtitle: 'The whiteboard draws the physical forces in motion.',
      badge: 'Dynamic Visualization',
      detail: 'Forward thrust F_thrust = - (dm/dt) · v_exhaust. The mass expelled backwards pushes the rocket forward.',
      visualType: 'diagram',
    },
    {
      num: '04',
      title: 'Lumo checks in',
      subtitle: 'Asks a conceptual question to test your real mental model.',
      badge: 'Active Comprehension',
      detail: '"If you throw a heavy bowling ball while standing on frictionless ice, what happens to you?"',
      visualType: 'question',
    },
    {
      num: '05',
      title: 'Student reasons through',
      subtitle: 'Evaluates the core logic rather than multiple-choice guessing.',
      badge: 'Deep Evaluation',
      detail: 'Student responds: "I slide backward in the opposite direction!"',
      visualType: 'answer',
    },
    {
      num: '06',
      title: 'Lumo adapts & reinforces',
      subtitle: 'Connects the analogy back to the rocket engine.',
      badge: 'Adaptive Mastery',
      detail: '"Exactly! The expelled gas molecules are millions of tiny bowling balls thrown every second."',
      visualType: 'reinforce',
    },
  ];

  // Auto-advance loop every 4.2 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isPaused, steps.length]);

  return (
    <section
      id="how"
      style={{
        padding: 'var(--space-24) var(--space-6)',
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
      }}
    >
      {/* Editorial Header */}
      <div style={{ maxWidth: '640px', marginBottom: 'var(--space-12)' }}>
        <p
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-orange)',
            marginBottom: 'var(--space-3)',
          }}
        >
          How It Works
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
          Learning should feel like a conversation.
        </h2>
        <p
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--text-body-lg-lh)',
          }}
        >
          Lumo doesn't just produce walls of text. It walks through ideas with you, creates visual diagrams, checks your intuition, and alters course the moment you hesitate.
        </p>
      </div>

      {/* Two Column Interactive Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: 'var(--space-12)',
          alignItems: 'start',
        }}
        className="lumo-teaching-loop-grid"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left: Step Sequence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(idx)}
                style={{
                  textAlign: 'left',
                  background: isActive ? 'var(--color-surface)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--color-orange)' : 'transparent'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                  transition: 'all var(--motion-standard) var(--ease-standard)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
                aria-pressed={isActive}
              >
                {/* Number & Indicator */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isActive ? 'var(--color-orange)' : 'var(--color-text-muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isActive ? 'var(--color-orange)' : 'var(--color-border)',
                      transition: 'background var(--motion-standard) var(--ease-standard)',
                    }}
                  />
                </div>

                {/* Title & Subtitle */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {step.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: isActive ? 'var(--color-orange)' : 'var(--color-text-muted)',
                        background: isActive ? 'var(--color-orange-soft)' : 'var(--color-surface-soft)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.45,
                    }}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Live Demonstrative Visual Stage */}
        <div
          style={{
            position: 'sticky',
            top: '96px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-cinematic)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            minHeight: '440px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Visual Header */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-orange)',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Step {steps[activeStep].num} · {steps[activeStep].badge}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Live Teaching Engine
            </span>
          </div>

          {/* Visual Canvas Area */}
          <div
            style={{
              flex: 1,
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Step 1: Voice Question */}
            {activeStep === 0 && (
              <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }} className="animate-fade-in">
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--color-orange-soft)',
                    color: 'var(--color-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-4)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  "How does a rocket accelerate in space if there's no air to push against?"
                </div>
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Natural speech input with audio transcription
                </p>
              </div>
            )}

            {/* Step 2: Pedagogical Plan */}
            {activeStep === 1 && (
              <div style={{ width: '100%', maxWidth: '380px' }} className="animate-fade-in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '12px 16px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-error)', marginBottom: '2px' }}>
                      Identified Misconception
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                      "Thrust requires ambient air as a reactive medium"
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-sky)', marginBottom: '2px' }}>
                      Target Physics Principle
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                      Newton's 3rd Law & Conservation of Momentum
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--color-orange-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-orange-border-30)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-orange)', marginBottom: '2px' }}>
                      Teaching Strategy
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                      Visual vector demonstration → Ice-skating analogy → Comprehension check
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Visual Concept Diagram */}
            {activeStep === 2 && (
              <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }} className="animate-fade-in">
                <svg viewBox="0 0 340 160" style={{ width: '100%', height: 'auto' }}>
                  {/* Rocket body */}
                  <path d="M 170,40 C 195,40 215,65 215,100 L 125,100 C 125,65 145,40 170,40 Z" fill="var(--color-surface-soft)" stroke="var(--color-text-primary)" strokeWidth="2"/>
                  <polygon points="125,90 100,115 125,115" fill="var(--color-surface-soft)" stroke="var(--color-text-primary)" strokeWidth="1.5"/>
                  <polygon points="215,90 240,115 215,115" fill="var(--color-surface-soft)" stroke="var(--color-text-primary)" strokeWidth="1.5"/>
                  
                  {/* Forward Thrust Arrow */}
                  <line x1="170" y1="35" x2="170" y2="5" stroke="var(--color-mint)" strokeWidth="3" markerEnd="url(#arrow-mint)"/>
                  <text x="180" y="20" fontSize="11" fontWeight="800" fill="var(--color-mint)">Thrust (F)</text>

                  {/* Exhaust Plume backward */}
                  <polygon points="145,100 170,140 195,100" fill="var(--color-orange-soft)" stroke="var(--color-orange)" strokeWidth="1.5"/>
                  <line x1="170" y1="105" x2="170" y2="150" stroke="var(--color-orange)" strokeWidth="3" markerEnd="url(#arrow-orange)"/>
                  <text x="180" y="145" fontSize="11" fontWeight="800" fill="var(--color-orange)">Exhaust (-v)</text>
                </svg>
                <div
                  style={{
                    marginTop: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-orange)',
                  }}
                >
                  Δp_rocket + Δp_exhaust = 0
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Momentum transferred directly from expelled fuel mass
                </p>
              </div>
            )}

            {/* Step 4: Socratic Check */}
            {activeStep === 3 && (
              <div style={{ width: '100%', maxWidth: '380px' }} className="animate-fade-in">
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-orange-soft)',
                    border: '1px solid var(--color-orange-border-25)',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase' }}>
                    Lumo Asks
                  </span>
                  <p style={{ margin: '6px 0 0', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                    "If you're wearing roller skates on smooth concrete and push away a heavy 15kg medicine ball, what happens to you?"
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    A) I stay completely still because air doesn't push back
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-mint-soft)', border: '1px solid var(--color-mint)', fontSize: '13px', fontWeight: 600, color: 'var(--color-mint)' }}>
                    B) I roll backward in the opposite direction
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Student Answers */}
            {activeStep === 4 && (
              <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }} className="animate-fade-in">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--color-mint-soft)',
                    color: 'var(--color-mint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-4)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                >
                  "I roll backward! Pushing the ball puts an equal and opposite force on me."
                </div>
                <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-mint)', fontSize: '12px', fontWeight: 700 }}>
                  <span>Mental Model Confirmed</span> · <span>Zero Guesswork</span>
                </div>
              </div>
            )}

            {/* Step 6: Lumo Adapts & Reinforces */}
            {activeStep === 5 && (
              <div style={{ width: '100%', maxWidth: '380px' }} className="animate-fade-in">
                <div
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-mint)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-mint)', textTransform: 'uppercase' }}>
                      Concept Mastered
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                    "Spot on. A rocket engine is simply throwing billions of high-speed gas molecules backward. Every molecule pushes the rocket forward — no air required."
                  </p>
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-orange-soft)',
                    border: '1px solid var(--color-orange-border-20)',
                    fontSize: '12px',
                    color: 'var(--color-orange)',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  Next: Deriving the Tsiolkovsky Rocket Equation →
                </div>
              </div>
            )}
          </div>

          {/* Bottom Detail Strip */}
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--color-surface-soft)',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            {steps[activeStep].detail}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .lumo-teaching-loop-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
