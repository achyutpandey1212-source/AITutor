import React from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { AssessmentRenderer } from '../../assessment/AssessmentRenderer';
import { IconNotes, IconLightbulb, IconHelp } from '../TheaterIcons';

export interface AssessmentStageProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  sessionId?: string;
  onSubmitted: (submission: AssessmentSubmission) => void;
  onRequestHint?: () => void;
  onGiveUp?: () => void;
  isLoading?: boolean;
}

export const AssessmentStage: React.FC<AssessmentStageProps> = ({
  question,
  idToken,
  sessionId,
  onSubmitted,
  onRequestHint,
  onGiveUp,
  isLoading = false,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 'min(420px, 35vw)',
        minWidth: '280px',
        height: '100%',
        background: 'var(--theater-surface)',
        border: '1px solid var(--theater-border-medium)',
        borderRadius: 'var(--theater-radius-lg)',
        padding: '1rem',
        boxShadow: 'var(--theater-shadow-dock)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 25,
        overflowY: 'auto',
        color: 'var(--theater-text-primary)',
        boxSizing: 'border-box',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--theater-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <IconNotes size={16} style={{ color: 'var(--theater-accent)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--theater-text-primary)' }}>
              Check Understanding
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)', marginTop: '0.1rem' }}>
              Concept: <strong style={{ color: 'var(--theater-text-secondary)', fontWeight: 550 }}>{question.concept}</strong> •{' '}
              <span style={{ textTransform: 'uppercase' }}>{question.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {onRequestHint && (
            <button
              onClick={onRequestHint}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.55rem',
                background: 'var(--theater-accent-amber-subtle)',
                color: 'var(--theater-accent-amber)',
                border: '1px solid var(--theater-accent-amber)',
                borderRadius: 'var(--theater-radius-sm)',
                fontWeight: 550,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.72rem',
                transition: 'all var(--theater-transition-fast)',
              }}
              title="Get a hint from Lumo"
            >
              <IconLightbulb size={12} />
              <span>Hint</span>
            </button>
          )}

          {onGiveUp && (
            <button
              onClick={onGiveUp}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.55rem',
                background: 'var(--theater-accent-coral-subtle)',
                color: 'var(--theater-accent-coral)',
                border: '1px solid var(--theater-accent-coral)',
                borderRadius: 'var(--theater-radius-sm)',
                fontWeight: 550,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.72rem',
                transition: 'all var(--theater-transition-fast)',
              }}
              title="Reveal solution"
            >
              <IconHelp size={12} />
              <span>Solution</span>
            </button>
          )}
        </div>
      </div>

      {/* Assessment Question Component */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AssessmentRenderer
          question={question}
          idToken={idToken}
          sessionId={sessionId}
          onSubmitted={onSubmitted}
        />
      </div>
    </div>
  );
};
