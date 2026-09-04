import React from 'react';

export interface ContextualActionPillsProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isAssessmentActive?: boolean;
  isReplaying?: boolean;
  onExplainAgain?: () => void;
  onExplainDifferently?: () => void;
  onRequestHint?: () => void;
  onGiveUpAssessment?: () => void;
  onResumeLive?: () => void;
  onOpenDoubtSolver?: () => void;
  disabled?: boolean;
}

export const ContextualActionPills: React.FC<ContextualActionPillsProps> = ({
  isSpeaking: _isSpeaking = false,
  isListening: _isListening = false,
  isAssessmentActive = false,
  isReplaying = false,
  onExplainAgain,
  onExplainDifferently,
  onRequestHint,
  onGiveUpAssessment,
  onResumeLive,
  onOpenDoubtSolver,
  disabled = false,
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
      {/* 1. Replay Mode: Resume Live */}
      {isReplaying && onResumeLive && (
        <button
          onClick={onResumeLive}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(226, 157, 75, 0.9)',
            color: '#080808',
            border: 'none',
            borderRadius: '999px',
            padding: '0.45rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--theater-font-sans)',
            boxShadow: '0 0 16px rgba(226, 157, 75, 0.25)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>▶ Resume Live</span>
        </button>
      )}

      {/* 2. Assessment Mode: Hint & Solution */}
      {isAssessmentActive && (
        <>
          {onRequestHint && (
            <button
              onClick={onRequestHint}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(229, 169, 60, 0.1)',
                color: '#E5A93C',
                border: '1px solid rgba(229, 169, 60, 0.25)',
                borderRadius: '999px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>💡 Need a Hint</span>
            </button>
          )}

          {onGiveUpAssessment && (
            <button
              onClick={onGiveUpAssessment}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(224, 82, 82, 0.1)',
                color: '#FF8F78',
                border: '1px solid rgba(224, 82, 82, 0.25)',
                borderRadius: '999px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🤷 Show Solution</span>
            </button>
          )}
        </>
      )}

      {/* 3. Normal Explaining / Listening: "Explain again", "Try another way", and "✦ Ask Lumo" */}
      {!isAssessmentActive && !isReplaying && (
        <>
          {onExplainAgain && (
            <button
              onClick={onExplainAgain}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#EAEAE6',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#F5F5F2';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#EAEAE6';
                }
              }}
              title="Deterministically replay the previous explanation verbatim"
            >
              <span style={{ fontSize: '0.85rem' }}>↻</span>
              <span>Explain again</span>
            </button>
          )}

          {onExplainDifferently && (
            <button
              onClick={onExplainDifferently}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#EAEAE6',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#F5F5F2';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#EAEAE6';
                }
              }}
              title="Explain this concept with another visual or analogy"
            >
              <span style={{ fontSize: '0.85rem' }}>✨</span>
              <span>Try another way</span>
            </button>
          )}

          {/* Lumo AI / Contextual Doubt Solver Entry Point */}
          {onOpenDoubtSolver && (
            <button
              onClick={onOpenDoubtSolver}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(226, 157, 75, 0.08)',
                color: '#E29D4B',
                border: '1px solid rgba(226, 157, 75, 0.25)',
                borderRadius: '999px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(226, 157, 75, 0.15)';
                  e.currentTarget.style.color = '#F5B942';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'rgba(226, 157, 75, 0.08)';
                  e.currentTarget.style.color = '#E29D4B';
                }
              }}
              title="Ask your teacher something privately"
            >
              <span style={{ fontSize: '0.8rem' }}>✦</span>
              <span>Ask Lumo</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
