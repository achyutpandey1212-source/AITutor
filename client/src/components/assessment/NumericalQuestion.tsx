import React, { useState } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface NumericalQuestionProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  onSubmitted?: (submission: AssessmentSubmission) => void;
  initialSubmission?: AssessmentSubmission | null;
}

export const NumericalQuestion: React.FC<NumericalQuestionProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission = null,
}) => {
  const [answer, setAnswer] = useState<string>(initialSubmission?.answer || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmission | null>(
    initialSubmission
  );

  const isSubmitted = Boolean(submissionResult);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await liveTutorApiClient.submitAssessmentAnswer(idToken, question.questionId, {
        questionId: question.questionId,
        questionType: 'NUMERICAL',
        answer: answer.trim(),
      });

      setSubmissionResult(result);
      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err: any) {
      console.error('Numerical submission error:', err);
      setError(err?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '1.25rem',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header Badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: '#e0f2fe',
              color: '#0369a1',
              fontWeight: 600,
            }}
          >
            NUMERICAL
          </span>
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: '#f1f5f9',
              color: '#475569',
            }}
          >
            {question.difficulty.toUpperCase()}
          </span>
          {question.ragGrounded && (
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: '#dcfce7',
                color: '#166534',
              }}
            >
              📚 Study Doc Grounded
            </span>
          )}
        </div>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>
          {question.marks} Mark{question.marks > 1 ? 's' : ''}
        </span>
      </div>

      {/* Question Context & Prompt */}
      {question.context && (
        <p
          style={{
            fontSize: '0.9rem',
            color: '#475569',
            background: '#f8fafc',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            marginBottom: '0.75rem',
            fontStyle: 'italic',
          }}
        >
          {question.context}
        </p>
      )}

      <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginTop: 0, marginBottom: '1rem' }}>
        {question.question}
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
            Enter Final Numerical Answer (with units if required):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: '#64748b' }}>Answer =</span>
            <input
              type="text"
              value={answer}
              disabled={isSubmitted || isSubmitting}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. 5, -3.2, 12 m/s, x = 4"
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                flex: 1,
                maxWidth: '280px',
              }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              marginBottom: '1rem',
              background: '#fef2f2',
              color: '#991b1b',
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Submission Confirmation */}
        {submissionResult && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '0.9rem',
            }}
          >
            <strong>✅ Numerical Answer Submitted</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              Your calculation value ({submissionResult.answer}) has been safely recorded.
            </p>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <button
            type="submit"
            disabled={!answer.trim() || isSubmitting}
            style={{
              padding: '0.6rem 1.25rem',
              background: !answer.trim() || isSubmitting ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: !answer.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Numerical Answer'}
          </button>
        )}
      </form>
    </div>
  );
};
