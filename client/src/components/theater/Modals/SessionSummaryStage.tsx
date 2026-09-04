import React from 'react';

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
        background: 'rgba(7, 9, 13, 0.9)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 60,
        animation: 'theaterFadeIn 0.25s ease-out',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: '#0E1219',
          border: '1px solid rgba(85, 201, 138, 0.35)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(85, 201, 138, 0.12)',
          color: '#FFFFFF',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🎉</div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(85, 201, 138, 0.15)',
              color: '#55C98A',
              border: '1px solid rgba(85, 201, 138, 0.3)',
            }}
          >
            {subject} Lesson Complete
          </span>
          <h2
            style={{
              margin: '0.75rem 0 0 0',
              fontSize: '1.8rem',
              fontWeight: 400,
              fontFamily: 'var(--theater-font-serif)',
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            {topic}
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#7E8695' }}>
            Great effort! Your session insights and concepts have been safely saved to your memory timeline.
          </p>
        </div>

        {/* Concepts Mastered Box */}
        {conceptsMastered.length > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#55C98A',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              Concepts Mastered ({conceptsMastered.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {conceptsMastered.map((c, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.78rem',
                    background: 'rgba(85, 201, 138, 0.1)',
                    border: '1px solid rgba(85, 201, 138, 0.25)',
                    color: '#55C98A',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={onPracticeQuestions}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(59, 130, 246, 0.35)',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'all 0.15s ease',
            }}
          >
            📝 Practice Questions
          </button>

          <button
            onClick={onExitToDashboard}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'all 0.15s ease',
            }}
          >
            Done & Return →
          </button>
        </div>
      </div>
    </div>
  );
};
