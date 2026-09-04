import React from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { AssessmentRenderer } from '../../assessment/AssessmentRenderer';

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
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        bottom: '1rem',
        width: 'min(480px, 48%)',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(85, 169, 232, 0.35)',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(85, 169, 232, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 25,
        overflowY: 'auto',
        color: '#F7F5EF',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📝</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F7F5EF' }}>
              Check Your Understanding
            </div>
            <div style={{ fontSize: '0.75rem', color: '#89909D', marginTop: '0.1rem' }}>
              Concept: <strong style={{ color: '#55A9E8' }}>{question.concept}</strong> •{' '}
              <span style={{ textTransform: 'uppercase' }}>{question.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {onRequestHint && (
            <button
              onClick={onRequestHint}
              disabled={isLoading}
              style={{
                padding: '0.3rem 0.65rem',
                background: 'rgba(245, 185, 66, 0.15)',
                color: '#F5C542',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                transition: 'all 0.15s ease',
              }}
              title="Get a hint from Lumo"
            >
              💡 Hint
            </button>
          )}

          {onGiveUp && (
            <button
              onClick={onGiveUp}
              disabled={isLoading}
              style={{
                padding: '0.3rem 0.65rem',
                background: 'rgba(222, 107, 104, 0.15)',
                color: '#FF8F78',
                border: '1px solid rgba(222, 107, 104, 0.35)',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.75rem',
                transition: 'all 0.15s ease',
              }}
              title="Reveal solution"
            >
              🤷 Solution
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
