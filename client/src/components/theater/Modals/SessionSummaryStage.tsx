import React from 'react';
import { IconCheck, IconNotes, IconArrowRight } from '../TheaterIcons';

export interface SessionSummaryStageProps {
  topic: string;
  subject: string;
  conceptsMastered?: string[];
  onExitToDashboard: () => void;
  onPracticeQuestions: () => void;
}

export const SessionSummaryStage: React.FC<SessionSummaryStageProps> = ({
  topic,
  subject,
  conceptsMastered = [],
  onExitToDashboard,
  onPracticeQuestions,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--theater-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 60,
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--theater-surface)',
          border: '1px solid var(--theater-border-medium)',
          borderRadius: 'var(--theater-radius-xl)',
          padding: '2.25rem 2rem',
          boxShadow: 'var(--theater-shadow-stage)',
          color: 'var(--theater-text-primary)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--theater-radius-pill)',
              background: 'var(--theater-accent-mint-subtle)',
              color: 'var(--theater-accent-mint)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <IconCheck size={12} />
            <span>{subject} Lesson Complete</span>
          </div>

          <h2
            style={{
              margin: '0.2rem 0 0 0',
              fontSize: '1.6rem',
              fontWeight: 600,
              color: 'var(--theater-text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            {topic}
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: 'var(--theater-text-muted)' }}>
            Your session progression and concept milestones have been saved to your timeline.
          </p>
        </div>

        {/* Concepts Mastered Box */}
        {conceptsMastered.length > 0 && (
          <div
            style={{
              background: 'var(--theater-surface-sunken)',
              border: '1px solid var(--theater-border-subtle)',
              borderRadius: 'var(--theater-radius-md)',
              padding: '0.85rem 1rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--theater-text-secondary)',
                letterSpacing: '0.02em',
                marginBottom: '0.45rem',
              }}
            >
              Concepts Covered ({conceptsMastered.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {conceptsMastered.map((c, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    background: 'var(--theater-surface)',
                    border: '1px solid var(--theater-border-subtle)',
                    color: 'var(--theater-text-primary)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--theater-radius-sm)',
                    fontWeight: 500,
                  }}
                >
                  <IconCheck size={10} style={{ color: 'var(--theater-accent-mint)' }} />
                  <span>{c}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.25rem' }}>
          <button
            onClick={onPracticeQuestions}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.75rem 1rem',
              background: 'var(--theater-accent)',
              color: 'var(--theater-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--theater-radius-md)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'opacity var(--theater-transition-fast)',
            }}
          >
            <IconNotes size={14} />
            <span>Practice</span>
          </button>

          <button
            onClick={onExitToDashboard}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              padding: '0.75rem 1rem',
              background: 'var(--theater-surface-elevated)',
              color: 'var(--theater-text-primary)',
              border: '1px solid var(--theater-border-subtle)',
              borderRadius: 'var(--theater-radius-md)',
              fontWeight: 550,
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'all var(--theater-transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--theater-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--theater-surface-elevated)';
            }}
          >
            <span>Done</span>
            <IconArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
