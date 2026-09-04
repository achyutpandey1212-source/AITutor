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
        padding: '0.6rem 1.5rem 0.2rem 1.5rem',
        background: 'transparent',
        zIndex: 30,
        position: 'relative',
        userSelect: 'none',
        fontFamily: 'var(--theater-font-sans)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Bar Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1360px',
          gap: '1rem',
        }}
      >
        {/* Left: Lumo Brand & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Lumo Typographic Brand Mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'default',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--theater-accent)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: 650,
                color: 'var(--theater-text-primary)',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--theater-font-sans)',
              }}
            >
              Lumo
            </span>
          </div>

          {/* Hairline vertical divider */}
          <span
            style={{
              width: '1px',
              height: '14px',
              background: 'var(--theater-border-medium)',
            }}
          />

          {/* Understated Exit Action */}
          <button
            onClick={onExit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--theater-text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.25rem 0.45rem',
              borderRadius: 'var(--theater-radius-sm)',
              transition: 'color var(--theater-transition-fast), background var(--theater-transition-fast)',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
              e.currentTarget.style.background = 'var(--theater-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Return to Dashboard"
          >
            <IconExit size={13} />
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
            fontSize: '0.8rem',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          <span style={{ color: 'var(--theater-text-muted)', fontWeight: 500 }}>{subject}</span>
          <span style={{ color: 'var(--theater-text-faint)', display: 'inline-flex', alignItems: 'center' }}>
            <IconChevronRight size={11} />
          </span>
          <span style={{ color: 'var(--theater-text-secondary)', fontWeight: 500 }}>{topic}</span>
          <span style={{ color: 'var(--theater-text-faint)', display: 'inline-flex', alignItems: 'center' }}>
            <IconChevronRight size={11} />
          </span>
          <span
            style={{
              color: 'var(--theater-text-primary)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {concept}
          </span>
        </div>

        {/* Right: Small Utility Actions (Quiet, Precise, Unintrusive) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Ask Lumo Doubt Solver */}
          {onOpenDoubtSolver && (
            <button
              onClick={onOpenDoubtSolver}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--theater-accent-subtle)',
                border: '1px solid var(--theater-accent-border)',
                borderRadius: 'var(--theater-radius-sm)',
                color: 'var(--theater-accent)',
                fontSize: '0.78rem',
                fontWeight: 550,
                cursor: 'pointer',
                padding: '0.28rem 0.6rem',
                marginRight: '0.2rem',
                transition: 'all var(--theater-transition-fast)',
                fontFamily: 'var(--theater-font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--theater-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--theater-accent-border)';
              }}
              title="Ask Lumo a private doubt"
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
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--theater-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.3rem 0.55rem',
              borderRadius: 'var(--theater-radius-sm)',
              transition: 'color var(--theater-transition-fast), background var(--theater-transition-fast)',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
              e.currentTarget.style.background = 'var(--theater-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <IconNotes size={14} />
            <span>Notes</span>
          </button>

          {/* Materials */}
          <button
            onClick={onOpenMaterials}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: documentTitle ? 'var(--theater-accent-mint)' : 'var(--theater-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.3rem 0.55rem',
              borderRadius: 'var(--theater-radius-sm)',
              transition: 'color var(--theater-transition-fast), background var(--theater-transition-fast)',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
              e.currentTarget.style.background = 'var(--theater-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = documentTitle ? 'var(--theater-accent-mint)' : 'var(--theater-text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
            title={documentTitle ? `Attached: ${documentTitle}` : 'Attached Study Materials'}
          >
            <IconMaterials size={14} />
            <span>Materials</span>
          </button>

          {/* Transcript / More */}
          {onOpenTranscript && (
            <button
              onClick={onOpenTranscript}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--theater-text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--theater-radius-sm)',
                transition: 'color var(--theater-transition-fast), background var(--theater-transition-fast)',
                fontFamily: 'var(--theater-font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-primary)';
                e.currentTarget.style.background = 'var(--theater-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <IconTranscript size={14} />
              <span>Transcript</span>
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
              color: 'var(--theater-text-secondary)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--theater-radius-sm)',
              transition: 'color var(--theater-transition-fast), background var(--theater-transition-fast)',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
              e.currentTarget.style.background = 'var(--theater-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
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
              color: 'var(--theater-text-secondary)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: 'var(--theater-radius-sm)',
              transition: 'color var(--theater-transition-fast), background var(--theater-transition-fast)',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
              e.currentTarget.style.background = 'var(--theater-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Classroom Settings"
            aria-label="Classroom settings"
          >
            <IconSettings size={15} />
          </button>
        </div>
      </div>

      {/* Subtle Hairline Concept Progress Track */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginTop: '0.35rem',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '2px',
            background: 'var(--theater-border-subtle)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${computedPercent}%`,
              height: '100%',
              background: 'var(--theater-accent)',
              borderRadius: '2px',
              transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--theater-text-muted)',
            fontWeight: 450,
            letterSpacing: '0.01em',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          {conceptProgressText}
        </span>
      </div>
    </header>
  );
};
