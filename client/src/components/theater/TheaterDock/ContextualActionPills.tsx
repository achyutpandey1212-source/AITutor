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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {/* 1. Replay Mode: Resume Live */}
      {isReplaying && onResumeLive && (
        <button
          onClick={onResumeLive}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'var(--theater-accent)',
            color: 'var(--theater-accent-contrast)',
            border: 'none',
            borderRadius: 'var(--theater-radius-sm)',
            padding: '0.3rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 550,
            cursor: 'pointer',
            fontFamily: 'var(--theater-font-sans)',
            transition: 'opacity var(--theater-transition-fast)',
          }}
          title="Resume live teaching"
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
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'transparent',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Need a hint from Lumo"
              aria-label="Hint"
            >
              <IconLightbulb size={14} />
            </button>
          )}

          {onGiveUpAssessment && (
            <button
              onClick={onGiveUpAssessment}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'transparent',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Reveal step-by-step solution"
              aria-label="Solution"
            >
              <IconHelp size={14} />
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
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'transparent',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Explain again verbatim"
              aria-label="Explain again"
            >
              <IconRefresh size={13} />
            </button>
          )}

          {onExplainDifferently && (
            <button
              onClick={onExplainDifferently}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'transparent',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Try another way (alternative explanation or analogy)"
              aria-label="Try another way"
            >
              <IconSparkles size={13} />
            </button>
          )}

          {onOpenDoubtSolver && (
            <button
              onClick={onOpenDoubtSolver}
              disabled={disabled}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'transparent',
                color: 'var(--theater-text-secondary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--theater-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                }
              }}
              title="Ask Lumo a private doubt"
              aria-label="Ask Lumo"
            >
              <IconHelp size={13} />
            </button>
          )}
        </>
      )}
    </div>
  );
};
