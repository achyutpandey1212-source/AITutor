import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface RecapSceneProps {
  heading?: string;
  bullets?: string[];
  concept?: string;
}

/**
 * Phase 2.6 — RecapScene
 * Used at the end of a concept beat sequence as a summary card.
 * Shows a numbered list of 3–5 key takeaways with staggered reveal.
 */
export const RecapScene: React.FC<RecapSceneProps> = ({
  heading = 'Quick Recap',
  bullets = [],
  concept,
}) => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const checkmarkPulse = interpolate(frame, [0, 20], [0.7, 1], { extrapolateRight: 'clamp' });

  const displayBullets = bullets.length > 0 ? bullets : [
    'Review the main concept',
    'Practice with examples',
    'Check for understanding',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '2rem 2.5rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Recap Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          opacity: headerOpacity,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '8px',
            padding: '0.3rem 0.65rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          ✓ Recap
        </div>
        {concept && (
          <span
            style={{
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            {concept}
          </span>
        )}
        <h2
          style={{
            color: '#f1f5f9',
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '0.01em',
          }}
        >
          {heading}
        </h2>
      </div>

      {/* Numbered Bullet Points */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {displayBullets.map((bullet, idx) => {
          const bulletOpacity = interpolate(
            frame,
            [8 + idx * 7, 16 + idx * 7],
            [0, 1],
            { extrapolateRight: 'clamp' }
          );
          const bulletX = interpolate(
            frame,
            [8 + idx * 7, 16 + idx * 7],
            [-20, 0],
            { extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                opacity: bulletOpacity,
                transform: `translateX(${bulletX}px)`,
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  minWidth: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  opacity: checkmarkPulse,
                }}
              >
                {idx + 1}
              </div>
              <span
                style={{
                  color: '#e2e8f0',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  fontWeight: 500,
                }}
              >
                {bullet}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
