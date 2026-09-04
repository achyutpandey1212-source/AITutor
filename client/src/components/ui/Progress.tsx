import React from 'react';

// ---------------------------------------------------------------
// Lumo Progress Bar
// Elegant, thin indicator for lesson/mastery progress.
// ---------------------------------------------------------------

interface ProgressProps {
  /** 0–100 */
  value: number;
  /** Optional label for accessibility */
  label?: string;
  /** Color variant */
  variant?: 'brand' | 'mint' | 'sky';
  /** Height in px, default 6 */
  height?: number;
  style?: React.CSSProperties;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  variant = 'brand',
  height = 6,
  style,
  showLabel = false,
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const trackColor = 'var(--color-surface-soft)';
  const fillColor = {
    brand: 'var(--color-orange)',
    mint:  'var(--color-mint)',
    sky:   'var(--color-sky)',
  }[variant];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
          }}
        >
          {label && <span>{label}</span>}
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{
          height: `${height}px`,
          background: trackColor,
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            background: fillColor,
            borderRadius: 'var(--radius-full)',
            transition: `width var(--motion-moderate) var(--ease-standard)`,
          }}
        />
      </div>
    </div>
  );
};
