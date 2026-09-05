import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface HighlightSceneProps {
  heading?: string;
  text?: string;
  subtitle?: string;
  concept?: string;
  emphasis?: string;
}

/**
 * Phase 2.6 — HighlightScene
 * Used for single-term or single-concept emphasis beats.
 * Shows one large key term/value with a brief definition below.
 *
 * Example use: emphasizing "focal length f" right before the formula beat.
 */
export const HighlightScene: React.FC<HighlightSceneProps> = ({
  heading = 'Key Concept',
  text = 'Focal Length (f)',
  subtitle = 'Distance from the mirror pole to the principal focus F',
  concept,
  emphasis,
}) => {
  const frame = useCurrentFrame();

  const containerOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const textScale = interpolate(frame, [0, 14], [0.88, 1], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: 'clamp' });
  const glowPulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.15, 0.35, 0.15],
    { extrapolateRight: 'clamp' }
  );

  const displayText = emphasis || text;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '2rem 2.5rem',
        boxSizing: 'border-box',
        opacity: containerOpacity,
      }}
    >
      {/* Category Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.5rem',
        }}
      >
        {concept && (
          <span
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {concept}
          </span>
        )}
        <span
          style={{
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {heading}
        </span>
      </div>

      {/* Main Emphasis Card */}
      <div
        style={{
          background: `rgba(245, 158, 11, ${glowPulse * 0.12 + 0.08})`,
          border: `2px solid rgba(245, 158, 11, ${glowPulse + 0.2})`,
          borderRadius: '16px',
          padding: '1.75rem 2.5rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          boxShadow: `0 0 40px rgba(245, 158, 11, ${glowPulse * 0.3})`,
          transform: `scale(${textScale})`,
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#fef08a',
            letterSpacing: '0.02em',
            textShadow: '0 0 20px rgba(250, 204, 21, 0.5)',
            lineHeight: 1.2,
          }}
        >
          {displayText}
        </div>
      </div>

      {/* Definition / Subtitle */}
      {subtitle && (
        <div
          style={{
            color: '#94a3b8',
            fontSize: '1.05rem',
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: '720px',
            opacity: subtitleOpacity,
            borderLeft: '3px solid #f59e0b',
            paddingLeft: '0.75rem',
            fontStyle: 'italic',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
