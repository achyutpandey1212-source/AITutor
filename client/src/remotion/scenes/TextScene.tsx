import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface TextSceneProps {
  heading?: string;
  text?: string;
  bullets?: string[];
  concept?: string;
}

export const TextScene: React.FC<TextSceneProps> = ({
  heading = 'Core Concept',
  text,
  bullets = [],
  concept,
}) => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const textOpacity = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' });

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          opacity: headingOpacity,
        }}
      >
        <span
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {concept || 'Concept'}
        </span>
        <h2
          style={{
            color: '#f1f5f9',
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          {heading}
        </h2>
      </div>

      {/* Main explanation card */}
      {text && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            padding: '1.35rem 1.65rem',
            marginBottom: '1.35rem',
            opacity: textOpacity,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          }}
        >
          <p
            style={{
              color: '#e2e8f0',
              fontSize: '1.35rem',
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 500,
            }}
          >
            {text}
          </p>
        </div>
      )}

      {/* Key points / bullets */}
      {bullets && bullets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {bullets.map((bullet, idx) => {
            const bulletOpacity = interpolate(
              frame,
              [14 + idx * 6, 22 + idx * 6],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );
            const bulletX = interpolate(
              frame,
              [14 + idx * 6, 22 + idx * 6],
              [-15, 0],
              { extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  opacity: bulletOpacity,
                  transform: `translateX(${bulletX}px)`,
                }}
              >
                <span
                  style={{
                    color: '#38bdf8',
                    fontSize: '1.2rem',
                    lineHeight: '1.65rem',
                    fontWeight: 800,
                  }}
                >
                  ✦
                </span>
                <span
                  style={{
                    color: '#e2e8f0',
                    fontSize: '1.22rem',
                    lineHeight: '1.65rem',
                    fontWeight: 450,
                  }}
                >
                  {bullet}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
