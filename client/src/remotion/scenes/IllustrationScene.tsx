import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface IllustrationSceneProps {
  heading?: string;
  text?: string;
  subtitle?: string;
  concept?: string;
}

/**
 * Phase 2.6 — IllustrationScene
 * Used for real-world hook beats at the start of a concept sequence.
 * Shows a visual metaphor or analogy to anchor the upcoming concept.
 *
 * Example: "A spoon appears bent in a glass of water — this is refraction!"
 */
export const IllustrationScene: React.FC<IllustrationSceneProps> = ({
  heading = 'Real-World Hook',
  text = 'A spoon in water appears bent — but is it really?',
  subtitle = 'This everyday illusion is caused by refraction of light',
  concept,
}) => {
  const frame = useCurrentFrame();

  const containerOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const cardScale = interpolate(frame, [0, 15], [0.93, 1], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [14, 26], [0, 1], { extrapolateRight: 'clamp' });

  // Hook emoji cycles based on content
  const hookEmoji = '💡';

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
      {/* Hook badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.5rem',
        }}
      >
        <span
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {hookEmoji} {heading}
        </span>
        {concept && (
          <span
            style={{
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            — {concept}
          </span>
        )}
      </div>

      {/* Main Illustration Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(7, 10, 25, 0.98))',
          border: '1.5px solid rgba(52, 211, 153, 0.35)',
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.12)',
          transform: `scale(${cardScale})`,
          maxWidth: '540px',
          width: '100%',
        }}
      >
        {/* Large hook emoji */}
        <div
          style={{
            fontSize: '3.5rem',
            marginBottom: '0.75rem',
            lineHeight: 1,
          }}
        >
          🤔
        </div>

        {/* Hook question/statement */}
        <div
          style={{
            color: '#f1f5f9',
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '0.01em',
          }}
        >
          {text}
        </div>
      </div>

      {/* Concept connection */}
      {subtitle && (
        <div
          style={{
            color: '#64748b',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: '460px',
            opacity: subtitleOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ color: '#34d399', fontSize: '1rem' }}>→</span>
          <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
