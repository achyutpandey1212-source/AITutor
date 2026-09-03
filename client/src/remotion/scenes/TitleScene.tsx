import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface TitleSceneProps {
  title?: string;
  subtitle?: string;
  concept?: string;
}

export const TitleScene: React.FC<TitleSceneProps> = ({
  title = 'Light: Reflection & Refraction',
  subtitle = 'Exploring Wave Phenomena & Optical Physics',
  concept,
}) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: 'clamp' });

  const subtitleOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [10, 25], [15, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      {concept && (
        <div
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {concept}
        </div>
      )}

      <h1
        style={{
          color: '#f8fafc',
          fontSize: '2.4rem',
          fontWeight: 800,
          margin: 0,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          lineHeight: 1.2,
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: '#94a3b8',
          fontSize: '1.15rem',
          maxWidth: '650px',
          marginTop: '1rem',
          marginBottom: 0,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>

      {/* Chalkboard line decoration */}
      <div
        style={{
          width: '120px',
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
          marginTop: '1.75rem',
          opacity: subtitleOpacity,
        }}
      />
    </div>
  );
};
