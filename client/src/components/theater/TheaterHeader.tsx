import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
  IconExit,
  IconNotes,
  IconMaterials,
  IconTranscript,
  IconSettings,
  IconSun,
  IconMoon,
  IconSparkles,
  IconChevronRight,
} from './TheaterIcons';

export interface TheaterHeaderProps {
  subject?: string;
  topic?: string;
  concept?: string;
  conceptProgressText?: string;
  conceptProgressPercent?: number;
  documentTitle?: string;
  onExit: () => void;
  onOpenNotes?: () => void;
  onOpenMaterials?: () => void;
  onOpenTranscript?: () => void;
  onOpenSettings: () => void;
  onOpenDoubtSolver?: () => void;
  isFocusMode?: boolean;
}

export const TheaterHeader: React.FC<TheaterHeaderProps> = ({
  subject = 'Physics',
  topic = "Newton's Laws of Motion",
  concept = "Newton's Second Law",
  conceptProgressText = '2 of 5 concepts',
  conceptProgressPercent,
  documentTitle,
  onExit,
  onOpenNotes,
  onOpenMaterials,
  onOpenTranscript,
  onOpenSettings,
  onOpenDoubtSolver,
  isFocusMode = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const computedPercent =
    conceptProgressPercent !== undefined
      ? conceptProgressPercent
      : (() => {
          const match = conceptProgressText.match(/(\d+)\s+of\s+(\d+)/);
          if (match) {
            const current = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            if (total > 0) return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
          }
          return 40;
        })();

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isFocusMode ? '0.4rem 1.75rem 0.1rem 1.75rem' : '0.65rem 1.75rem 0.2rem 1.75rem',
        background: 'transparent',
        zIndex: 30,
        position: 'relative',
        userSelect: 'none',
        fontFamily: 'var(--theater-font-sans)',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'padding var(--theater-transition-normal), opacity var(--theater-transition-normal)',
      }}
    >
      {/* Top Bar Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1440px',
          gap: '1rem',
        }}
      >
        {/* Left: Real Lumo Logo & Exit Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          {/* Real Lumo Logo Asset */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'default',
            }}
          >
            <img
              src="/logo/Lumo_Logo.png"
              alt="Lumo"
              style={{
                height: '22px',
                width: 'auto',
                objectFit: 'contain',
                filter: theme === 'dark' ? 'invert(1)' : 'none',
                opacity: 0.95,
                transition: 'filter var(--theater-transition-fast)',
              }}
            />
          </div>

          {/* Hairline subtle vertical divider */}
          <span
            style={{
              width: '1px',
              height: '13px',
              background: 'var(--theater-border-subtle)',
            }}
          />

          {/* Quiet Exit Link */}
          <button
            onClick={onExit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--theater-text-muted)',
              fontSize: '0.78rem',
              fontWeight: 450,
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--theater-radius-xs)',
              transition: 'color var(--theater-transition-fast)',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-muted)';
            }}
            title="Return to Dashboard"
          >
            <IconExit size={12} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Center: Restrained Pedagogical Breadcrumbs */}
        <div
          className="theater-header-breadcrumbs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--theater-font-sans)',
            opacity: isFocusMode ? 0.65 : 1,
            transition: 'opacity var(--theater-transition-fast)',
          }}
        >
          <span style={{ color: 'var(--theater-text-muted)', fontWeight: 450 }}>{subject}</span>
          <span style={{ color: 'var(--theater-text-faint)', display: 'inline-flex', alignItems: 'center' }}>
            <IconChevronRight size={10} />
          </span>
          <span style={{ color: 'var(--theater-text-secondary)', fontWeight: 450 }}>{topic}</span>
          <span style={{ color: 'var(--theater-text-faint)', display: 'inline-flex', alignItems: 'center' }}>
            <IconChevronRight size={10} />
          </span>
          <span
            style={{
              color: 'var(--theater-text-primary)',
              fontWeight: 550,
              letterSpacing: '-0.01em',
            }}
          >
            {concept}
          </span>
        </div>

        {/* Right: Quiet Utility Actions (Icon-First with Tooltips) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {/* Ask Lumo */}
          {onOpenDoubtSolver && (
            <button
              onClick={onOpenDoubtSolver}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'var(--theater-surface-elevated)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                color: 'var(--theater-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.25rem 0.55rem',
                marginRight: '0.35rem',
                transition: 'all var(--theater-transition-fast)',
                fontFamily: 'var(--theater-font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-primary)';
                e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-secondary)';
                e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
              }}
              title="Ask Lumo a private question"
            >
              <IconSparkles size={12} />
              <span>Ask Lumo</span>
            </button>
          )}

          {/* Notes */}
          <button
            onClick={onOpenNotes}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--theater-text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--theater-radius-xs)',
              transition: 'color var(--theater-transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
            title="Session Notes & Key Takeaways"
            aria-label="Notes"
          >
            <IconNotes size={14} />
          </button>

          {/* Materials */}
          <button
            onClick={onOpenMaterials}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: documentTitle ? 'var(--theater-text-primary)' : 'var(--theater-text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--theater-radius-xs)',
              transition: 'color var(--theater-transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = documentTitle ? 'var(--theater-text-primary)' : 'var(--theater-text-muted)')}
            title={documentTitle ? `Attached: ${documentTitle}` : 'Attached Study Materials'}
            aria-label="Materials"
          >
            <IconMaterials size={14} />
          </button>

          {/* Transcript */}
          {onOpenTranscript && (
            <button
              onClick={onOpenTranscript}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--theater-text-muted)',
                cursor: 'pointer',
                padding: '0.35rem',
                borderRadius: 'var(--theater-radius-xs)',
                transition: 'color var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
              title="Full Dialogue Transcript"
              aria-label="Transcript"
            >
              <IconTranscript size={14} />
            </button>
          )}

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--theater-text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--theater-radius-xs)',
              transition: 'color var(--theater-transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--theater-text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--theater-radius-xs)',
              transition: 'color var(--theater-transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
            title="Classroom Settings"
            aria-label="Settings"
          >
            <IconSettings size={14} />
          </button>
        </div>
      </div>

      {/* Ultra-Minimal Hairline Progress Bar */}
      {!isFocusMode && (
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            height: '1px',
            background: 'var(--theater-border-subtle)',
            marginTop: '0.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${computedPercent}%`,
              height: '100%',
              background: 'var(--theater-text-muted)',
              transition: 'width 0.35s var(--theater-ease)',
            }}
          />
        </div>
      )}
    </header>
  );
};
