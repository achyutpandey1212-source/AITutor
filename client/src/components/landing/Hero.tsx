import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { CinematicVideo } from '../ui/CinematicVideo';
import { useTheme } from '../../theme/ThemeContext';

interface HeroProps {
  onStart: () => void;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onExplore }) => {
  const { theme } = useTheme();
  // Interactive incline angle for the live physics demonstration artifact
  const [angle, setAngle] = useState(30);
  const [hasFriction, setHasFriction] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulation' | 'video'>('simulation');

  // Physical calculations for the interactive demonstration
  const rad = (angle * Math.PI) / 180;
  const g = 9.8;
  const mu = hasFriction ? 0.2 : 0.0;
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const rawA = g * (sinVal - mu * cosVal);
  const acceleration = Math.max(0, rawA).toFixed(1);

  return (
    <section
      id="learn"
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'calc(var(--space-12) + 20px) var(--space-6) var(--space-16)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ----------------- Atmospheric Hero Video Backdrop ----------------- */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(1200px, 100vw)',
          height: '680px',
          opacity: theme === 'dark' ? 0.32 : 0.16,
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 20%, transparent 80%)',
          filter: theme === 'light' ? 'saturate(1.2) contrast(1.1)' : 'contrast(1.15)',
        }}
        aria-hidden="true"
      >
        <CinematicVideo
          src="/videos/hero.mp4"
          poster="/videos/posters/hero.jpg"
          priority={true}
          style={{ width: '100%', height: '100%' }}
          objectFit="cover"
        />
      </div>

      {/* ----------------- Top Editorial Copy ----------------- */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '840px',
          margin: '0 auto var(--space-10)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Eyebrow */}
        <div
          className="animate-fade-up"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'var(--space-6)',
            padding: '6px 16px',
            background: 'var(--color-orange-soft)',
            border: '1px solid rgba(255, 90, 54, 0.22)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-orange)',
            lineHeight: 1,
            animationDelay: '0ms',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--color-orange)',
              display: 'inline-block',
              animation: 'lumo-breathe 2.2s ease-in-out infinite',
            }}
          />
          AI-Native Learning Environment
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up"
          style={{
            fontSize: 'clamp(44px, 7.2vw, var(--text-display))',
            fontWeight: 800,
            letterSpacing: 'var(--text-display-ls)',
            lineHeight: 'var(--text-display-lh)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-6)',
            animationDelay: '60ms',
          }}
        >
          Learn anything.
          <br />
          <span
            style={{
              color: 'var(--color-orange)',
              background: 'linear-gradient(135deg, var(--color-orange) 0%, var(--color-coral) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your way.
          </span>
        </h1>

        {/* Supporting text */}
        <p
          className="animate-fade-up"
          style={{
            fontSize: 'clamp(16px, 2.2vw, var(--text-body-lg))',
            color: 'var(--color-text-secondary)',
            maxWidth: '540px',
            lineHeight: 'var(--text-body-lg-lh)',
            margin: '0 auto var(--space-8)',
            fontWeight: 400,
            animationDelay: '120ms',
          }}
        >
          Lumo teaches through conversation, voice, visuals and interactive lessons — adapting to how you learn.
        </p>

        {/* Primary & Secondary Actions */}
        <div
          className="animate-fade-up"
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            animationDelay: '180ms',
          }}
        >
          <Button variant="primary" size="lg" onClick={onStart}>
            <span>Start Learning</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
          <Button variant="secondary" size="lg" onClick={onExplore}>
            See how it works
          </Button>
        </div>
      </div>

      {/* ----------------- Hero Product Artifact ----------------- */}
      {/* Editorial, clean, grounded — showing actual learning intelligence */}
      <div
        className="animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '920px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-cinematic)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animationDelay: '240ms',
        }}
      >
        {/* Artifact Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: 'var(--color-surface-soft)',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: 'var(--text-caption)',
                fontWeight: 700,
                color: 'var(--color-sky)',
                background: 'var(--color-sky-soft)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Physics · Dynamics
            </span>
            <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Forces on an Incline
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Mode Toggle: Interactive Stage vs Cinematic Render */}
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
                onClick={() => setActiveTab('simulation')}
                style={{
                  border: 'none',
                  background: activeTab === 'simulation' ? 'var(--color-orange-soft)' : 'transparent',
                  color: activeTab === 'simulation' ? 'var(--color-orange)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === 'simulation' ? 700 : 500,
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                Interactive
              </button>
              <button
                onClick={() => setActiveTab('video')}
                style={{
                  border: 'none',
                  background: activeTab === 'video' ? 'var(--color-orange-soft)' : 'transparent',
                  color: activeTab === 'video' ? 'var(--color-orange)' : 'var(--color-text-muted)',
                  fontWeight: activeTab === 'video' ? 700 : 500,
                  fontSize: '11px',
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
                Cinematic
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--color-mint)',
                  display: 'inline-block',
                  animation: 'lumo-pulse 1.4s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Visual Stage
              </span>
            </div>
          </div>
        </div>

        {/* Artifact Content Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 'var(--space-6)',
            padding: 'var(--space-8)',
          }}
          className="lumo-hero-artifact-grid"
        >
          {/* Left: Dialogue & Reasoning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Student Prompt Bubble */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--color-orange-soft)',
                  color: 'var(--color-orange)',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                You
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                  "If we steepen the incline, does friction slow the acceleration down more or less?"
                </p>
              </div>
            </div>

            {/* Lumo Tutor Response */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-orange-soft)',
                border: '1px solid rgba(255, 90, 54, 0.2)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--color-orange)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                L
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  Notice that friction depends directly on the normal force: <strong>f_k = μ·mg·cos(θ)</strong>. As angle <strong>θ</strong> increases, <strong>cos(θ) shrinks</strong>, so the normal force decreases!
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: 'var(--color-orange)',
                    fontWeight: 700,
                    alignSelf: 'flex-start',
                  }}
                >
                  a = g · (sin θ - μ cos θ) = {acceleration} m/s²
                </div>
              </div>
            </div>

            {/* Interactive Control Pill inside Hero preview */}
            <div
              style={{
                marginTop: 'auto',
                padding: '12px 16px',
                background: 'var(--color-surface-soft)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Incline Angle (θ): <strong>{angle}°</strong>
                </span>
                <input
                  type="range"
                  min="10"
                  max="65"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  style={{ width: '100px', accentColor: 'var(--color-orange)', cursor: 'pointer' }}
                  aria-label="Adjust incline angle"
                />
              </div>

              <button
                onClick={() => setHasFriction(!hasFriction)}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: hasFriction ? 'var(--color-orange-soft)' : 'var(--color-surface)',
                  color: hasFriction ? 'var(--color-orange)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                {hasFriction ? 'Friction: μ = 0.2' : 'Frictionless (μ = 0)'}
              </button>
            </div>
          </div>

          {/* Right: Clean Vector Visual Diagram OR Cinematic Physics Render */}
          <div
            style={{
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-subtle)',
              padding: activeTab === 'video' ? '0' : '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '260px',
              overflow: 'hidden',
            }}
          >
            {activeTab === 'video' ? (
              <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '260px' }}>
                <CinematicVideo
                  src="/videos/physics.mp4"
                  poster="/videos/posters/physics.jpg"
                  priority={true}
                  aspectRatio="16 / 10"
                  style={{ width: '100%', height: '100%', minHeight: '260px' }}
                  objectFit="cover"
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '12px',
                    right: '12px',
                    padding: '6px 12px',
                    background: 'rgba(13, 15, 18, 0.75)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#F7F5EF', fontWeight: 600 }}>
                    Cinematic Simulation · Friction & Rotational Inertia
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-orange)', fontWeight: 700 }}>
                    1080p Stage
                  </span>
                </div>
              </div>
            ) : (
              <>
                <svg
                  viewBox="0 0 320 220"
                  style={{ width: '100%', height: 'auto', maxHeight: '240px' }}
                  aria-label="Interactive force diagram of block on an inclined plane"
                >
                  <defs>
                    <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="var(--color-orange)" />
                    </marker>
                    <marker id="arrow-sky" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="var(--color-sky)" />
                    </marker>
                    <marker id="arrow-mint" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="var(--color-mint)" />
                    </marker>
                  </defs>

                  {/* Incline Ground & Ramp */}
                  <polygon
                    points={`40,190 280,190 ${40 + 240 * (1 - Math.tan(rad * 0.7))},${190 - 130 * (angle / 45)}`}
                    fill="var(--color-border-subtle)"
                    stroke="var(--color-border)"
                    strokeWidth="1.5"
                  />

                  {/* Ramp Angle Arc & Label */}
                  <path
                    d="M 240,190 A 40 40 0 0 0 248,172"
                    fill="none"
                    stroke="var(--color-text-muted)"
                    strokeWidth="1.5"
                  />
                  <text x="256" y="184" fontSize="11" fontWeight="600" fill="var(--color-text-muted)">
                    θ={angle}°
                  </text>

                  {/* Mass Block positioned on slope */}
                  <g transform={`translate(160, ${150 - (angle - 30) * 1.8}) rotate(-${angle * 0.7})`}>
                    <rect
                      x="-22"
                      y="-18"
                      width="44"
                      height="32"
                      rx="4"
                      fill="var(--color-surface)"
                      stroke="var(--color-orange)"
                      strokeWidth="2"
                    />
                    <text x="0" y="2" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-primary)">
                      m
                    </text>

                    {/* Normal Force vector (perpendicular upwards) */}
                    <line
                      x1="0"
                      y1="-18"
                      x2="0"
                      y2={-18 - 42 * cosVal}
                      stroke="var(--color-sky)"
                      strokeWidth="2"
                      markerEnd="url(#arrow-sky)"
                    />
                    <text x="8" y={-24 - 42 * cosVal} fontSize="10" fontWeight="700" fill="var(--color-sky)">
                      N
                    </text>

                    {/* Friction vector (parallel backwards along slope) */}
                    {hasFriction && (
                      <>
                        <line
                          x1="22"
                          y1="-2"
                          x2={22 + 36 * mu * 5}
                          y2="-2"
                          stroke="var(--color-mint)"
                          strokeWidth="2"
                          markerEnd="url(#arrow-mint)"
                        />
                        <text x={30 + 36 * mu * 5} y="2" fontSize="10" fontWeight="700" fill="var(--color-mint)">
                          f_k
                        </text>
                      </>
                    )}

                    {/* Net Acceleration vector (down the slope) */}
                    <line
                      x1="-22"
                      y1="-2"
                      x2={-22 - Math.max(15, Number(acceleration) * 5.5)}
                      y2="-2"
                      stroke="var(--color-orange)"
                      strokeWidth="2.5"
                      markerEnd="url(#arrow-orange)"
                    />
                    <text x={-28 - Math.max(15, Number(acceleration) * 5.5)} y="-6" fontSize="11" fontWeight="800" fill="var(--color-orange)">
                      a
                    </text>
                  </g>

                  {/* Gravity vector (straight down) */}
                  <line
                    x1="160"
                    y1={150 - (angle - 30) * 1.8}
                    x2="160"
                    y2={195 - (angle - 30) * 1.8}
                    stroke="var(--color-text-secondary)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <text x="166" y={192 - (angle - 30) * 1.8} fontSize="10" fontWeight="600" fill="var(--color-text-muted)">
                    mg
                  </text>
                </svg>

                {/* Visual Legend */}
                <div
                  style={{
                    display: 'flex',
                    gap: '14px',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '2px', background: 'var(--color-orange)' }} /> Acceleration
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '2px', background: 'var(--color-sky)' }} /> Normal Force
                  </span>
                  {hasFriction && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '2px', background: 'var(--color-mint)' }} /> Friction
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive layout styles for hero */}
      <style>{`
        @media (max-width: 820px) {
          .lumo-hero-artifact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
