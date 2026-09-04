import React from 'react';

// ---------------------------------------------------------------
// Lumo Input Component
// ---------------------------------------------------------------

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Leading icon or node */
  leadingElement?: React.ReactNode;
  /** Trailing icon or node */
  trailingElement?: React.ReactNode;
  wrapperStyle?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  leadingElement,
  trailingElement,
  wrapperStyle,
  id,
  disabled,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);
  const inputId = id ?? `lumo-input-${Math.random().toString(36).slice(2, 8)}`;

  const hasError = Boolean(error);

  const wrapperBaseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    ...wrapperStyle,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--text-body-sm)',
    fontWeight: 600,
    color: hasError ? 'var(--color-error)' : 'var(--color-text-primary)',
    lineHeight: 1,
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '46px',
    padding: `0 ${trailingElement ? '40px' : '14px'} 0 ${leadingElement ? '40px' : '14px'}`,
    fontSize: 'var(--text-body)',
    fontFamily: 'inherit',
    fontWeight: 400,
    color: 'var(--color-text-primary)',
    background: disabled ? 'var(--color-surface-soft)' : 'var(--color-surface)',
    border: `1px solid ${hasError
      ? 'var(--color-error)'
      : focused
        ? 'var(--color-border-focus)'
        : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    transition: `
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard),
      background var(--motion-fast) var(--ease-standard)
    `,
    boxShadow: focused && !hasError
      ? '0 0 0 3px var(--color-orange-soft)'
      : focused && hasError
        ? '0 0 0 3px var(--color-error-soft)'
        : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    ...style,
  };

  const adornmentStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: 'var(--text-caption)',
    color: hasError ? 'var(--color-error)' : 'var(--color-text-muted)',
    lineHeight: 1.4,
  };

  return (
    <div style={wrapperBaseStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <div style={inputWrapperStyle}>
        {leadingElement && (
          <span style={{ ...adornmentStyle, left: '12px' }}>{leadingElement}</span>
        )}
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        />
        {trailingElement && (
          <span style={{ ...adornmentStyle, right: '12px' }}>{trailingElement}</span>
        )}
      </div>
      {(hint || error) && (
        <span style={hintStyle}>{error || hint}</span>
      )}
    </div>
  );
};
