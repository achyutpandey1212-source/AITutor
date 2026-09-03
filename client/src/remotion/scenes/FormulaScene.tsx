import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface FormulaSceneProps {
  formulaLabel?: string;
  formula?: string;
  concept?: string;
  variables?: Array<{ symbol: string; meaning: string }>;
  explanation?: string;
}

export const FormulaScene: React.FC<FormulaSceneProps> = ({
  formulaLabel = "SNELL'S LAW OF REFRACTION",
  formula = 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
  concept = "Snell's Law",
  variables = [
    { symbol: 'n₁', meaning: 'Refractive index of first medium (Air ≈ 1.0)' },
    { symbol: 'θ₁', meaning: 'Angle of incidence relative to normal' },
    { symbol: 'n₂', meaning: 'Refractive index of second medium (Glass ≈ 1.5)' },
    { symbol: 'θ₂', meaning: 'Angle of refraction relative to normal' },
  ],
  explanation = 'The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media.',
}) => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const cardScale = interpolate(frame, [0, 12], [0.95, 1], { extrapolateRight: 'clamp' });
  const tableOpacity = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '1.5rem 2.25rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '0.65rem',
          opacity: cardOpacity,
        }}
      >
        <span
          style={{
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {concept}
        </span>
        <h2
          style={{
            color: '#f8fafc',
            fontSize: '1.45rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          {formulaLabel}
        </h2>
      </div>

      {/* Formula Display Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
          border: '1.5px solid #f59e0b',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          marginBottom: '1rem',
          boxShadow: '0 8px 30px rgba(245, 158, 11, 0.15)',
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#fef08a',
            letterSpacing: '0.04em',
            textShadow: '0 0 15px rgba(250, 204, 21, 0.4)',
          }}
        >
          {formula}
        </div>
        <div
          style={{
            color: '#cbd5e1',
            fontSize: '0.85rem',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          or: sin(i) / sin(r) = n₂ / n₁ = constant
        </div>
      </div>

      {/* Variables Definition Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem',
          marginBottom: '0.8rem',
          opacity: tableOpacity,
        }}
      >
        {variables.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#38bdf8',
                minWidth: '24px',
              }}
            >
              {item.symbol}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.2' }}>
              {item.meaning}
            </span>
          </div>
        ))}
      </div>

      {/* Meaning note */}
      <div
        style={{
          color: '#94a3b8',
          fontSize: '0.82rem',
          lineHeight: '1.4',
          borderLeft: '2px solid #64748b',
          paddingLeft: '0.6rem',
          opacity: tableOpacity,
        }}
      >
        {explanation}
      </div>
    </div>
  );
};
