import React from 'react';

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
        padding: '0.75rem 2rem 0.25rem 2rem',
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
          maxWidth: '1440px',
        }}
      >
        {/* Left: Lumo Brand & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Lumo Brand Mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                color: '#E29D4B',
                fontSize: '1.05rem',
                lineHeight: 1,
                display: 'inline-block',
                filter: 'drop-shadow(0 0 6px rgba(226, 157, 75, 0.4))',
              }}
            >
              ✦
            </span>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#F5F5F2',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--theater-font-sans)',
              }}
            >
              Lumo
            </span>
          </div>

          {/* Understated Exit Action */}
          <button
            onClick={onExit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: '#777773',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              transition: 'color 0.15s ease',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F2')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#777773')}
            title="Return to Dashboard"
          >
            <span style={{ fontSize: '0.85rem' }}>←</span>
            <span>Exit</span>
          </button>
        </div>

        {/* Center: Restrained Breadcrumb Navigation */}
        <div
          className="theater-header-breadcrumbs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontSize: '0.82rem',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          <span style={{ color: '#777773', fontWeight: 500 }}>{subject}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem' }}>›</span>
          <span style={{ color: '#777773', fontWeight: 500 }}>{topic}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem' }}>›</span>
          <span style={{ color: '#F5F5F2', fontWeight: 600 }}>{concept}</span>
        </div>

        {/* Right: Small Utility Actions (Quiet and Unintrusive) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          {/* Ask Lumo Doubt Solver */}
          {onOpenDoubtSolver && (
            <button
              onClick={onOpenDoubtSolver}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(226, 157, 75, 0.1)',
                border: '1px solid rgba(226, 157, 75, 0.25)',
                borderRadius: '8px',
                color: '#E29D4B',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.22rem 0.6rem',
                transition: 'all 0.15s ease',
                fontFamily: 'var(--theater-font-sans)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(226, 157, 75, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(226, 157, 75, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(226, 157, 75, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(226, 157, 75, 0.25)';
              }}
              title="Ask Lumo a private doubt"
            >
              <span style={{ fontSize: '0.85rem' }}>✦</span>
              <span>Ask Lumo</span>
            </button>
          )}

          {/* Notes */}
          <button
            onClick={onOpenNotes}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              border: 'none',
              color: '#B8B8B3',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              transition: 'color 0.15s ease',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F2')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#B8B8B3')}
          >
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>📝</span>
            <span>Notes</span>
          </button>

          {/* Materials */}
          <button
            onClick={onOpenMaterials}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              border: 'none',
              color: documentTitle ? '#55C98A' : '#B8B8B3',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              transition: 'color 0.15s ease',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F2')}
            onMouseLeave={(e) => (e.currentTarget.style.color = documentTitle ? '#55C98A' : '#B8B8B3')}
          >
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>📎</span>
            <span>Materials</span>
          </button>

          {/* More / Transcript */}
          {onOpenTranscript && (
            <button
              onClick={onOpenTranscript}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                border: 'none',
                color: '#B8B8B3',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                transition: 'color 0.15s ease',
                fontFamily: 'var(--theater-font-sans)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F2')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#B8B8B3')}
            >
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>💬</span>
              <span>More</span>
            </button>
          )}

          {/* Settings (Gear) */}
          <button
            onClick={onOpenSettings}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: '#B8B8B3',
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '0.2rem',
              transition: 'color 0.15s ease',
              fontFamily: 'var(--theater-font-sans)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F2')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#B8B8B3')}
            title="Classroom Settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Subtle Concept Progress with Restrained Warm Indicator Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          marginTop: '0.4rem',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            color: '#777773',
            fontWeight: 500,
            letterSpacing: '0.02em',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          {conceptProgressText}
        </span>
        {/* Subtle top indicator bar */}
        <div
          style={{
            width: '140px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.07)',
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
              background: 'linear-gradient(90deg, #E29D4B, #F5B942)',
              borderRadius: '2px',
              boxShadow: '0 0 6px rgba(226, 157, 75, 0.4)',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>
    </header>
  );
};
