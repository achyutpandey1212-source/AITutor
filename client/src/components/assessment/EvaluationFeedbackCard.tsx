import React from 'react';
import type { EvaluationResult } from '@ai-tutor/shared';
import { Button } from '../ui/Button';

export interface EvaluationFeedbackCardProps {
  evaluation?: EvaluationResult;
  status: 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'NEEDS_REVIEW' | 'FAILED';
  onRetry?: () => void;
  onAskLumo?: (doubtContext: {
    question?: string;
    feedback?: string;
    misconception?: string;
  }) => void;
  questionText?: string;
}

export const EvaluationFeedbackCard: React.FC<EvaluationFeedbackCardProps> = ({
  evaluation,
  status,
  onRetry,
  onAskLumo,
  questionText,
}) => {
  if (status === 'SUBMITTED' || status === 'EVALUATING') {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: '2px solid var(--color-orange)',
            borderTopColor: 'transparent',
            animation: 'lumo-spin 0.8s linear infinite',
          }}
        />
        <div>
          <strong style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
            Lumo is evaluating your answer…
          </strong>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            Checking conceptual understanding, steps, and arithmetic.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'NEEDS_REVIEW' || evaluation?.evaluationStatus === 'NEEDS_REVIEW') {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>📸</span>
          <strong style={{ fontSize: 'var(--text-body-sm)' }}>
            Solution photo is partly difficult to read
          </strong>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {evaluation?.feedback ||
            'We could not confidently read your handwriting or steps. To evaluate your solution fairly, please capture a clearer photo.'}
        </p>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            marginBottom: '14px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>Tips for a clear solution upload:</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            <li>Keep the entire page flat with overhead lighting.</li>
            <li>Avoid harsh shadows or blurry camera angles.</li>
            <li>Ensure mathematical steps and units are clearly legible.</li>
          </ul>
        </div>

        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retake Photo
          </Button>
        )}
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <strong style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
          Evaluation temporarily unavailable
        </strong>
        <p style={{ margin: '4px 0 12px 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Your answer was saved securely. Please try evaluating again in a moment.
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry Evaluation
          </Button>
        )}
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const isSuccess = evaluation.percentage >= 75;
  const isModerate = evaluation.percentage >= 40 && evaluation.percentage < 75;
  const headline = isSuccess
    ? '✓ Good understanding'
    : isModerate
    ? '◐ Almost — let’s check one step'
    : '🎯 Let’s review how to approach this';

  const firstMisconception =
    evaluation.misconceptions && evaluation.misconceptions.length > 0
      ? evaluation.misconceptions[0]
      : null;

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '18px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Score Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '10px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: 'var(--text-body)',
              fontWeight: 700,
              color: isSuccess
                ? 'var(--color-success, #10b981)'
                : isModerate
                ? 'var(--color-orange)'
                : 'var(--color-text-primary)',
            }}
          >
            {headline}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}
          >
            · {evaluation.score} / {evaluation.maxScore} marks ({evaluation.percentage}%)
          </span>
        </div>

        {onAskLumo && (
          <button
            type="button"
            onClick={() =>
              onAskLumo({
                question: questionText,
                feedback: evaluation.feedback,
                misconception: firstMisconception || undefined,
              })
            }
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-orange)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all var(--motion-fast) var(--ease-standard)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-orange)';
              e.currentTarget.style.background = 'var(--color-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>✦ Ask Lumo</span>
          </button>
        )}
      </div>

      {/* Main Feedback Message */}
      <p
        style={{
          margin: '0 0 12px 0',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
        }}
      >
        {evaluation.feedback}
      </p>

      {/* Misconception Diagnosis Callout */}
      {firstMisconception && (
        <div
          style={{
            marginBottom: '14px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-hover)',
            borderLeft: '3px solid var(--color-orange)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-orange)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '4px',
            }}
          >
            Misconception Insight
          </div>
          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {firstMisconception}
          </div>
        </div>
      )}

      {/* Step Breakdown (for Numerical & Multi-step Image Solutions) */}
      {evaluation.stepEvaluation && evaluation.stepEvaluation.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <strong
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '6px',
            }}
          >
            Step-by-Step Breakdown
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {evaluation.stepEvaluation.map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Step {step.step}: {step.criterion || ''}
                  </span>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-secondary)' }}>
                    {step.feedback}
                  </p>
                </div>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background:
                      step.status === 'correct'
                        ? 'var(--color-surface)'
                        : 'var(--color-surface)',
                    color:
                      step.status === 'correct'
                        ? 'var(--color-success, #10b981)'
                        : step.status === 'partially_correct'
                        ? 'var(--color-orange)'
                        : 'var(--color-text-muted)',
                  }}
                >
                  {step.status === 'correct'
                    ? '✓ Correct'
                    : step.status === 'partially_correct'
                    ? '◐ Partial'
                    : '✗ Needs check'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Improvement Areas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div
            style={{
              background: 'var(--color-surface-hover)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <strong
              style={{
                fontSize: '11px',
                color: 'var(--color-success, #10b981)',
                display: 'block',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Strengths
            </strong>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {evaluation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
          <div
            style={{
              background: 'var(--color-surface-hover)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <strong
              style={{
                fontSize: '11px',
                color: 'var(--color-orange)',
                display: 'block',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Areas to Revise
            </strong>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {evaluation.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
