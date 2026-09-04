import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { CinematicVideo } from '../ui/CinematicVideo';

interface TheaterPreviewProps {
  onEnterTheater: () => void;
}

export const TheaterPreview: React.FC<TheaterPreviewProps> = ({ onEnterTheater }) => {
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [stageMode, setStageMode] = useState<'cinematic' | 'whiteboard'>('cinematic');

  return (
    <section
      id="theater"
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
          The Flagship Experience
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
          A classroom built around you.
        </h2>
        <p
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--text-body-lg-lh)',
          }}
        >
          This isn't a chatbot text box. It's the Learning Theater — a real-time visual whiteboard where concepts are drawn, tested, and discussed aloud with your personal tutor.
        </p>
      </div>

      {/* The Learning Theater Cinematic Window */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-cinematic)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Control Chrome */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--color-surface-soft)',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Physics</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Orbital Mechanics</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/</span>
            <span style={{ color: 'var(--color-orange)', fontWeight: 700 }}>Deriving Orbital Velocity</span>
          </div>

          {/* Session Badges & Stage Mode Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                onClick={() => setStageMode('cinematic')}
                style={{
                  border: 'none',
                  background: stageMode === 'cinematic' ? 'var(--color-orange-soft)' : 'transparent',
                  color: stageMode === 'cinematic' ? 'var(--color-orange)' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: stageMode === 'cinematic' ? 700 : 500,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-orange)' }} />
                Auditorium Cinema
              </button>
              <button
                onClick={() => setStageMode('whiteboard')}
                style={{
                  border: 'none',
                  background: stageMode === 'whiteboard' ? 'var(--color-orange-soft)' : 'transparent',
                  color: stageMode === 'whiteboard' ? 'var(--color-orange)' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: stageMode === 'whiteboard' ? 700 : 500,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                Whiteboard
              </button>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: 'var(--color-mint-soft)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-mint)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-mint)', display: 'inline-block', animation: 'lumo-pulse 1.5s infinite' }} />
              Voice Synced
            </div>
          </div>
        </div>

        {/* Central Visual Learning Stage */}
        <div
          style={{
            position: 'relative',
            background: stageMode === 'cinematic' ? '#000000' : 'var(--color-background)',
            minHeight: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: stageMode === 'cinematic' ? '0' : 'var(--space-8)',
            overflow: 'hidden',
          }}
        >
          {stageMode === 'cinematic' ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '460px' }}>
              <CinematicVideo
                src="/videos/theater.mp4"
                poster="/videos/posters/theater.jpg"
                aspectRatio="16 / 9"
                style={{ width: '100%', height: '100%', minHeight: '460px' }}
                objectFit="cover"
              />
              {/* Subtle Atmospheric Stage Shadow Vignette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '20px',
                  padding: '6px 14px',
                  background: 'rgba(21, 24, 29, 0.75)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-orange)', animation: 'lumo-pulse 1.5s infinite' }} />
                <span style={{ fontSize: '11px', color: '#F7F5EF', fontWeight: 600 }}>
                  Live Lecture Theater · Molecular Resonance & Stereochemistry
                </span>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '640px', textAlign: 'center' }}>
            <svg viewBox="0 0 460 260" style={{ width: '100%', height: 'auto', maxHeight: '300px' }}>
              <defs>
                <radialGradient id="earth-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-sky)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-sky)" stopOpacity="0.0" />
                </radialGradient>
              </defs>

              {/* Orbital Path Ellipse */}
              <ellipse cx="230" cy="130" rx="170" ry="95" fill="none" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="5 5" />

              {/* Earth Body at Center */}
              <circle cx="230" cy="130" r="54" fill="url(#earth-glow)" />
              <circle cx="230" cy="130" r="42" fill="var(--color-surface)" stroke="var(--color-sky)" strokeWidth="2.5" />
              <text x="230" y="128" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--color-text-primary)">
                Earth (M)
              </text>
              <text x="230" y="142" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-text-muted)">
                r = R_E + h
              </text>

              {/* Satellite Position */}
              <g transform="translate(370, 75)">
                {/* Satellite Body */}
                <rect x="-10" y="-8" width="20" height="16" rx="3" fill="var(--color-surface)" stroke="var(--color-orange)" strokeWidth="2" />
                <line x1="-16" y1="0" x2="-10" y2="0" stroke="var(--color-orange)" strokeWidth="2" />
                <line x1="10" y1="0" x2="16" y2="0" stroke="var(--color-orange)" strokeWidth="2" />

                {/* Velocity Vector (Tangent) */}
                <line x1="0" y1="-8" x2="-45" y2="-45" stroke="var(--color-orange)" strokeWidth="2.5" markerEnd="url(#arrow-orange)" />
                <text x="-52" y="-50" fontSize="11" fontWeight="800" fill="var(--color-orange)">
                  v_orb = √(GM/r)
                </text>

                {/* Gravitational Force Vector (Centripetal toward Earth) */}
                <line x1="-10" y1="6" x2="-75" y2="34" stroke="var(--color-sky)" strokeWidth="2.5" markerEnd="url(#arrow-sky)" />
                <text x="-80" y="52" fontSize="11" fontWeight="800" fill="var(--color-sky)">
                  F_grav = GMm/r²
                </text>
              </g>

              {/* Formula Callout in stage */}
              <rect x="20" y="20" width="180" height="42" rx="6" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
              <text x="30" y="38" fontSize="11" fontWeight="700" fill="var(--color-text-primary)">
                F_centripetal = F_gravity
              </text>
              <text x="30" y="52" fontSize="10" fontFamily="monospace" fill="var(--color-orange)" fontWeight="700">
                mv²/r = GMm/r² → v = √(GM/r)
              </text>
            </svg>
          </div>
          )}

          {/* Interactive Question Transformation Toggle */}
          {showQuestion && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute',
                inset: '20px',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-orange)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                maxWidth: '520px',
                margin: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-orange)', textTransform: 'uppercase' }}>
                  Interactive Check-In
                </span>
                <button
                  onClick={() => setShowQuestion(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', lineHeight: 1.4 }}>
                If we fire thrusters to move the satellite to a higher orbit (greater r), what happens to its steady orbital speed?
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 0, text: 'Speed increases because energy was added', correct: false },
                  { id: 1, text: 'Speed decreases because r is in the denominator: v ∝ 1/√r', correct: true },
                  { id: 2, text: 'Speed remains constant in a vacuum', correct: false },
                ].map((choice) => {
                  const isChosen = selectedAnswer === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => setSelectedAnswer(choice.id)}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-md)',
                        background: isChosen
                          ? choice.correct ? 'var(--color-mint-soft)' : 'var(--color-error-soft)'
                          : 'var(--color-surface-soft)',
                        border: `1px solid ${isChosen ? (choice.correct ? 'var(--color-mint)' : 'var(--color-error)') : 'var(--color-border-subtle)'}`,
                        fontSize: '13px',
                        color: isChosen
                          ? choice.correct ? 'var(--color-mint)' : 'var(--color-error)'
                          : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        fontWeight: isChosen ? 700 : 500,
                      }}
                    >
                      {choice.text}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer === 1 && (
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-mint)', fontWeight: 600 }}>
                  ✓ Exact! Gravitational pull weakens at greater distances, so less centripetal speed is required to maintain equilibrium.
                </p>
              )}
            </div>
          )}

          {/* Floating Lumo Tutor Card (bottom right) */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              padding: '12px 16px',
              maxWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--color-orange)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  L
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Lumo Tutor
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-mint)', fontWeight: 600 }}>
                ● Speaking
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
              "Notice how the required velocity decreases as the orbital radius increases..."
            </p>

            <button
              onClick={() => setShowQuestion(!showQuestion)}
              style={{
                alignSelf: 'flex-start',
                marginTop: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--color-orange)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showQuestion ? '← Return to Whiteboard' : 'Test Comprehension Check →'}
            </button>
          </div>
        </div>

        {/* Bottom Timeline Chrome */}
        <div
          style={{
            padding: '14px 20px',
            background: 'var(--color-surface-soft)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Chapter Scrubber Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '240px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Timeline:
            </span>
            <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
              {[
                { title: 'Intro', done: true },
                { title: 'Force Balance', done: true },
                { title: 'Derivation', done: false, active: true },
                { title: 'Concept Check', done: false },
              ].map((ch) => (
                <div
                  key={ch.title}
                  style={{
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    flex: 1,
                    background: ch.done
                      ? 'var(--color-mint)'
                      : ch.active
                        ? 'var(--color-orange)'
                        : 'var(--color-border)',
                  }}
                  title={ch.title}
                />
              ))}
            </div>
          </div>

          {/* CTA into Theater */}
          <Button variant="primary" size="sm" onClick={onEnterTheater}>
            <span>Launch Live Theater</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};
