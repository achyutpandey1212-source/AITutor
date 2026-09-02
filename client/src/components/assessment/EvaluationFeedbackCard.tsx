import React from 'react';
import type { EvaluationResult } from '@ai-tutor/shared';

export interface EvaluationFeedbackCardProps {
  evaluation?: EvaluationResult;
  status: 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'NEEDS_REVIEW' | 'FAILED';
  onRetry?: () => void;
}

export const EvaluationFeedbackCard: React.FC<EvaluationFeedbackCardProps> = ({
  evaluation,
  status,
  onRetry,
}) => {
  if (status === 'SUBMITTED' || status === 'EVALUATING') {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>⏳</span>
        <div>
          <strong>AI is checking your working...</strong>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#3b82f6' }}>
            Analyzing steps, checking arithmetic, and diagnosing conceptual understanding.
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
          padding: '1.25rem',
          borderRadius: '8px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#92400e',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>📸</span>
          <strong style={{ fontSize: '1rem' }}>Your working is partly difficult to read</strong>
        </div>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: '1.4' }}>
          {evaluation?.feedback ||
            'We could not confidently read your handwriting or steps. To ensure your mastery is evaluated fairly, please take a clearer, well-lit photo of your notebook.'}
        </p>

        <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <strong>Tips for a clear solution upload:</strong>
          <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0 }}>
            <li>Keep the full page visible and flat.</li>
            <li>Use good overhead lighting without strong shadows.</li>
            <li>Ensure each mathematical step is clearly separated and readable.</li>
          </ul>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.5rem 1rem',
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            🔄 Retake / Resubmit Solution
          </button>
        )}
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
        }}
      >
        <strong>⚠️ Evaluation temporarily unavailable</strong>
        <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.85rem' }}>
          Your submission is saved securely. Please try checking again in a moment.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.4rem 0.8rem',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry Evaluation
          </button>
        )}
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const isSuccess = evaluation.percentage >= 75;
  const isModerate = evaluation.percentage >= 40 && evaluation.percentage < 75;

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        borderRadius: '8px',
        background: isSuccess ? '#f0fdf4' : isModerate ? '#fffbeb' : '#fef2f2',
        border: `1px solid ${isSuccess ? '#bbf7d0' : isModerate ? '#fde68a' : '#fecaca'}`,
      }}
    >
      {/* Score Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${isSuccess ? '#dcfce7' : isModerate ? '#fef3c7' : '#fee2e2'}`,
          paddingBottom: '0.75rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>{isSuccess ? '🎉' : isModerate ? '💡' : '🎯'}</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: isSuccess ? '#166534' : isModerate ? '#92400e' : '#991b1b' }}>
            Score: {evaluation.score} / {evaluation.maxScore} ({evaluation.percentage}%)
          </span>
        </div>

        <span
          style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: isSuccess ? '#dcfce7' : isModerate ? '#fef3c7' : '#fee2e2',
            color: isSuccess ? '#166534' : isModerate ? '#92400e' : '#991b1b',
          }}
        >
          {evaluation.recommendedAction.replace('_', ' ')}
        </span>
      </div>

      {/* Main Feedback Message */}
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.5' }}>
        {evaluation.feedback}
      </p>

      {/* Step Breakdown (for Numerical & Multi-step Image Solutions) */}
      {evaluation.stepEvaluation && evaluation.stepEvaluation.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>
            Step-by-Step Working Breakdown:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {evaluation.stepEvaluation.map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    Step {step.step}: {step.criterion || ''}
                  </span>
                  <p style={{ margin: '0.15rem 0 0 0', color: '#64748b' }}>{step.feedback}</p>
                </div>
                <span
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background:
                      step.status === 'correct' ? '#dcfce7' : step.status === 'partially_correct' ? '#fef3c7' : '#fee2e2',
                    color:
                      step.status === 'correct' ? '#166534' : step.status === 'partially_correct' ? '#92400e' : '#991b1b',
                  }}
                >
                  {step.status === 'correct' ? '✅ Correct' : step.status === 'partially_correct' ? '⚠️ Partial' : '❌ Incorrect'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {evaluation.strengths.length > 0 && (
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.8rem', color: '#166534', display: 'block', marginBottom: '0.25rem' }}>
              💪 Strengths Identified:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#334155' }}>
              {evaluation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.weaknesses.length > 0 && (
          <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.8rem', color: '#991b1b', display: 'block', marginBottom: '0.25rem' }}>
              🔍 Areas for Improvement:
            </strong>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#334155' }}>
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
