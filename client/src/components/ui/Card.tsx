import React from 'react';

// ---------------------------------------------------------------
// Lumo Card Component
// Variants: default | interactive | elevated | cinematic
// ---------------------------------------------------------------

type CardVariant = 'default' | 'interactive' | 'elevated' | 'cinematic';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: string | number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [hovered, setHovered] = React.useState(false);

  const isInteractive = variant === 'interactive' || variant === 'cinematic';

  const baseStyle: React.CSSProperties = {
    background: variant === 'elevated' || variant === 'cinematic'
      ? 'var(--color-surface-soft)'
      : 'var(--color-surface)',
    border: `1px solid ${variant === 'cinematic'
      ? 'var(--color-border)'
      : 'var(--color-border-subtle)'}`,
    borderRadius: variant === 'cinematic'
      ? 'var(--radius-cinematic)'
      : 'var(--radius-lg)',
    padding: padding !== undefined
      ? (typeof padding === 'number' ? `${padding}px` : padding)
      : 'var(--space-6)',
    transition: isInteractive
      ? `
          transform var(--motion-standard) var(--ease-standard),
          box-shadow var(--motion-standard) var(--ease-standard),
          border-color var(--motion-standard) var(--ease-standard)
        `
      : undefined,
    cursor: isInteractive ? 'pointer' : undefined,
    // Hover effects for interactive variants
    ...(hovered && isInteractive ? {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)',
      borderColor: 'var(--color-border)',
    } : {
      boxShadow: variant === 'elevated' ? 'var(--shadow-sm)' : 'none',
    }),
    ...style,
  };

  return (
    <div
      {...props}
      style={baseStyle}
      onMouseEnter={(e) => { if (isInteractive) setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { if (isInteractive) setHovered(false); onMouseLeave?.(e); }}
    >
      {children}
    </div>
  );
};
