import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

// ---------------------------------------------------------------
// Logo component
// Renders the locked Lumo logo asset.
// In light theme: original dark/black logo (no modification).
// In dark theme: white logo via CSS filter (invert only on pure-black assets).
// ---------------------------------------------------------------

interface LogoProps {
  /** Height in px. Width scales proportionally. */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({ height = 28, className, style }) => {
  const { theme } = useTheme();

  return (
    <img
      src="/logo/Lumo_Logo.png"
      alt="Lumo"
      height={height}
      width={height} // 1:1 logo asset
      style={{
        height: `${height}px`,
        width: `${height}px`,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        // In dark mode: invert the pure-black logo to become white.
        // This is safe because the Lumo logo is pure black on transparent.
        filter: theme === 'dark' ? 'invert(1) brightness(10)' : 'none',
        opacity: theme === 'dark' ? 0.95 : 1,
        transition: `filter var(--motion-standard) var(--ease-standard),
                     opacity var(--motion-standard) var(--ease-standard)`,
        ...style,
      }}
      className={className}
    />
  );
};

// ---------------------------------------------------------------
// LogoWordmark: Logo + "Lumo" text side by side
// ---------------------------------------------------------------

interface LogoWordmarkProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LogoWordmark: React.FC<LogoWordmarkProps> = ({
  height = 28,
  className,
  style,
}) => {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        ...style,
      }}
    >
      <Logo height={height} />
      <span
        style={{
          fontSize: `${Math.round(height * 0.6)}px`,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--color-text-primary)',
          lineHeight: 1,
          transition: 'color var(--motion-standard) var(--ease-standard)',
        }}
      >
        Lumo
      </span>
    </span>
  );
};
