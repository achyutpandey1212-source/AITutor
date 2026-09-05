import React from 'react';
import { Button } from '../ui/Button';
import { HeroMikoCanvas } from './HeroMikoCanvas';

interface HeroProps {
  onStart: () => void;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onExplore }) => {
  return (
    <section
      id="product"
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(32px, 5vw, 64px) var(--space-6) var(--space-12)',
        maxWidth: '1360px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ----------------- Top 2-Column Splice ----------------- */}
      <div
        className="lumo-hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.95fr)',
          alignItems: 'center',
          gap: 'clamp(32px, 5vw, 72px)',
          width: '100%',
          flex: 1,
        }}
      >
        {/* Left Column: Editorial & Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 2,
            paddingRight: 'clamp(0px, 3vw, 24px)',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <span
              className="lumo-hero-eyebrow-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-purple)',
                boxShadow: '0 0 8px var(--color-purple)',
                display: 'inline-block',
              }}
            />
            <span
              className="lumo-hero-eyebrow-text"
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-purple)',
                fontFamily: 'var(--font-family-base)',
              }}
            >
              AI Tutor For Deep Understanding
            </span>
          </div>

          {/* Headline (Editorial Geist + Newsreader styling) */}
          <h1
            className="lumo-hero-headline"
            style={{
              fontSize: 'clamp(42px, 5.8vw, 74px)',
              fontWeight: 600,
              letterSpacing: '-0.038em',
              lineHeight: 1.06,
              color: 'var(--color-text-primary)',
              margin: '0 0 24px',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            Learn with clarity.
            <br />
            Understand for life.
          </h1>

          {/* Subtitle */}
          <p
            className="lumo-hero-subtitle"
            style={{
              fontSize: 'clamp(15px, 1.35vw, 17px)',
              lineHeight: 1.62,
              color: 'var(--color-text-secondary)',
              maxWidth: '520px',
              margin: '0 0 36px',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 400,
            }}
          >
            Lumo combines the power of AI, interactive visuals, and a live tutor to help you truly understand concepts—not just memorize them.
          </p>

          {/* CTA Button Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '36px',
              flexWrap: 'wrap',
            }}
          >
            {/* Primary Pill Button */}
            <Button
              variant="pill-white"
              size="lg"
              onClick={onStart}
              className="lumo-hero-primary-btn"
              style={{
                padding: '0 28px',
                height: '48px',
                fontSize: '15px',
                gap: '8px',
              }}
            >
              <span>Enter Lumo</span>
              <span style={{ fontSize: '15px' }}>↗</span>
            </Button>

            {/* Secondary Ghost Button with Play Icon */}
            <button
              onClick={onExplore}
              className="lumo-hero-secondary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 20px',
                height: '48px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '14.5px',
                fontFamily: 'var(--font-family-base)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--color-border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '2px',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </span>
              <span>Watch overview</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Interactive Miko Avatar Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(520px, 72vh, 800px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <HeroMikoCanvas />
        </div>
      </div>

      {/* ----------------- Bottom Feature Shelf Dock ----------------- */}
      {/* Floating 4-card container matching Reference Image 1 */}
      <div
        style={{
          marginTop: 'clamp(32px, 4vw, 56px)',
          width: '100%',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(16px)',
          padding: '24px 28px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="lumo-hero-features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '24px',
          }}
        >
          {/* Feature 1 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-purple)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2M15 12h2M7 16h10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Live AI Tutor
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                Talk in real time with Miko, your personal AI tutor.
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-sky)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M3 3v18h18" />
                <path d="M18 9l-5 5-3-3-4 4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Interactive Visuals
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                See concepts come alive with dynamic simulations.
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-coral)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M9 9h6M9 13h6M9 17h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Adaptive Practice
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                Practice what matters. Lumo adapts to you.
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-mint)',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Deep Understanding
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                Move beyond answers. Build real understanding.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Media Queries & Theme Overrides */}
      <style>{`
        @media (max-width: 960px) {
          .lumo-hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .lumo-hero-grid > div:first-child {
            align-items: center;
            padding-right: 0 !important;
          }
          .lumo-hero-features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 600px) {
          .lumo-hero-features-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Dark mode overrides for hero */
        [data-theme="dark"] .lumo-hero-primary-btn {
          background: var(--color-purple) !important;
          border: 1px solid var(--color-purple) !important;
          color: #FFFFFF !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.3) !important;
        }
        [data-theme="dark"] .lumo-hero-primary-btn:hover {
          background: var(--color-purple-hover) !important;
          border-color: var(--color-purple-hover) !important;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35) !important;
        }

        /* Light mode secondary button contrast */
        [data-theme="light"] .lumo-hero-secondary-btn {
          color: var(--color-text-secondary);
        }
        [data-theme="light"] .lumo-hero-secondary-btn:hover {
          color: var(--color-text-primary);
        }
        [data-theme="light"] .lumo-hero-secondary-btn svg {
          border-color: var(--color-border);
        }
      `}</style>
    </section>
  );
};

