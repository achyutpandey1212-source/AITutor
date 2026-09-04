import React from 'react';
import { IconRefresh, IconSparkles, IconLightbulb, IconHelp, IconPlay } from '../TheaterIcons';

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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      {/* 1. Replay Mode: Resume Live */}
      {isReplaying && onResumeLive && (
        <button
          onClick={onResumeLive}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--theater-accent)',
            color: 'var(--theater-accent-contrast)',
            border: 'none',
            borderRadius: 'var(--theater-radius-sm)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--theater-font-sans)',
            transition: 'opacity var(--theater-transition-fast)',
          }}
        >
          <IconPlay size={10} />
          <span>Resume Live</span>
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
                gap: '0.35rem',
                background: 'var(--theater-surface-elevated)',
                color: 'var(--theater-accent-amber)',
                border: '1px solid var(--theater-border-medium)',
                borderRadius: 'var(--theater-radius-sm)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--theater-accent-amber)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                }
              }}
            >
              <IconLightbulb size={13} />
              <span>Hint</span>
            </button>
          )}

          {onGiveUpAssessment && (
            <button
              onClick={onGiveUpAssessment}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--theater-surface-elevated)',
                color: 'var(--theater-accent-coral)',
                border: '1px solid var(--theater-border-medium)',
                borderRadius: 'var(--theater-radius-sm)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--theater-accent-coral)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                }
              }}
            >
              <IconHelp size={13} />
              <span>Solution</span>
            </button>
          )}
        </>
      )}

      {/* 3. Normal Explaining / Listening: "Explain again", "Try another way" */}
      {!isAssessmentActive && !isReplaying && (
        <>
          {onExplainAgain && (
            <button
              onClick={onExplainAgain}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--theater-surface-elevated)',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-hover)';
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-elevated)';
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Deterministically replay the previous explanation verbatim"
            >
              <IconRefresh size={12} />
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
                gap: '0.35rem',
                background: 'var(--theater-surface-elevated)',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-hover)';
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.background = 'var(--theater-surface-elevated)';
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Explain this concept with another visual or analogy"
            >
              <IconSparkles size={12} />
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
                gap: '0.3rem',
                background: 'var(--theater-accent-subtle)',
                color: 'var(--theater-accent)',
                border: '1px solid var(--theater-accent-border)',
                borderRadius: 'var(--theater-radius-sm)',
                padding: '0.35rem 0.7rem',
                fontSize: '0.78rem',
                fontWeight: 550,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = 'var(--theater-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = 'var(--theater-accent-border)';
                }
              }}
              title="Ask your teacher something privately"
            >
              <IconSparkles size={12} />
              <span>Ask Lumo</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
