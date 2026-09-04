import React from 'react';

// ---------------------------------------------------------------
// Lumo Button Component
// Variants: primary | secondary | ghost | outline | icon
// Sizes: sm | md | lg
// ---------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** For icon-only buttons — renders as a square with centered content */
  icon?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-orange)',
    color: '#FFFFFF',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-orange)',
    border: '1px solid var(--color-orange)',
  },
  destructive: {
    background: 'var(--color-error)',
    color: '#FFFFFF',
    border: '1px solid transparent',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    height: '34px',
    padding: '0 12px',
    fontSize: '13px',
    borderRadius: 'var(--radius-md)',
  },
  md: {
    height: '44px',
    padding: '0 20px',
    fontSize: '15px',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    height: '52px',
    padding: '0 28px',
    fontSize: '16px',
    borderRadius: 'var(--radius-md)',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const isDisabled = disabled || loading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    flexShrink: 0,
    position: 'relative',
    transition: `
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-standard),
      opacity var(--motion-fast) var(--ease-standard)
    `,
    ...variantStyles[variant],
    ...sizeStyles[size],
    // Icon-only override
    ...(icon ? { padding: '0', width: sizeStyles[size].height } : {}),
    // Hover states
    ...(hovered && !isDisabled && variant === 'primary' ? {
      background: 'var(--color-orange-hover)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-md)',
    } : {}),
    ...(hovered && !isDisabled && variant === 'secondary' ? {
      background: 'var(--color-surface-hover)',
      borderColor: 'var(--color-border)',
    } : {}),
    ...(hovered && !isDisabled && variant === 'ghost' ? {
      background: 'var(--color-surface-soft)',
      color: 'var(--color-text-primary)',
    } : {}),
    ...(hovered && !isDisabled && variant === 'outline' ? {
      background: 'var(--color-orange-soft)',
    } : {}),
    // Press state
    ...(pressed && !isDisabled ? {
      transform: 'translateY(0) scale(0.98)',
      boxShadow: 'none',
    } : {}),
    // Disabled
    ...(isDisabled ? { opacity: 0.5 } : {}),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={baseStyle}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); setPressed(false); onMouseLeave?.(e); }}
      onMouseDown={(e) => { setPressed(true); onMouseDown?.(e); }}
      onMouseUp={(e) => { setPressed(false); onMouseUp?.(e); }}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          {!icon && <span style={{ opacity: 0.7 }}>Loading…</span>}
        </>
      ) : children}
    </button>
  );
};

// ---------------------------------------------------------------
// Minimal inline spinner
// ---------------------------------------------------------------
const LoadingSpinner: React.FC = () => (
  <span
    style={{
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }}
    aria-hidden="true"
  />
);

// Inject spin keyframe once
if (typeof document !== 'undefined') {
  const id = 'lumo-spin-keyframe';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
}
