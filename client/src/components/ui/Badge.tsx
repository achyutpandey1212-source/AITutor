import React from 'react';

// ---------------------------------------------------------------
// Lumo Badge Component
// For subject labels and semantic status indicators.
// Color creates hierarchy, NOT the only meaning indicator.
// ---------------------------------------------------------------

type BadgeVariant =
  // Subject badges
  | 'physics'
  | 'biology'
  | 'chemistry'
  | 'mathematics'
  | 'astronomy'
  | 'programming'
  | 'history'
  // Semantic
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  // Brand
  | 'brand'
  | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const variantMap: Record<BadgeVariant, { bg: string; color: string }> = {
  physics:     { bg: 'var(--color-sky-soft)',     color: 'var(--color-sky)' },
  biology:     { bg: 'var(--color-mint-soft)',    color: 'var(--color-mint)' },
  chemistry:   { bg: 'var(--color-orange-soft)',  color: 'var(--color-orange)' },
  mathematics: { bg: 'var(--color-yellow-soft)',  color: '#B8851A' },
  astronomy:   { bg: 'var(--color-sky-soft)',     color: 'var(--color-sky)' },
  programming: { bg: 'var(--color-surface-soft)', color: 'var(--color-text-secondary)' },
  history:     { bg: 'var(--color-yellow-soft)',  color: '#A0721A' },
  success:     { bg: 'var(--color-success-soft)', color: 'var(--color-success)' },
  warning:     { bg: 'var(--color-warning-soft)', color: 'var(--color-warning)' },
  error:       { bg: 'var(--color-error-soft)',   color: 'var(--color-error)' },
  info:        { bg: 'var(--color-info-soft)',    color: 'var(--color-info)' },
  neutral:     { bg: 'var(--color-surface-soft)', color: 'var(--color-text-secondary)' },
  brand:       { bg: 'var(--color-orange-soft)',  color: 'var(--color-orange)' },
  accent:      { bg: 'var(--color-mint-soft)',    color: 'var(--color-mint)' },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  style,
  className,
}) => {
  const { bg, color } = variantMap[variant];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        fontSize: 'var(--text-caption)',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        borderRadius: 'var(--radius-full)',
        background: bg,
        color: color,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
