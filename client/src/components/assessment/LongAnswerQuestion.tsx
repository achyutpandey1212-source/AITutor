import React, { useState } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface LongAnswerQuestionProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  onSubmitted?: (submission: AssessmentSubmission) => void;
  initialSubmission?: AssessmentSubmission | null;
}

export const LongAnswerQuestion: React.FC<LongAnswerQuestionProps> = ({
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
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await liveTutorApiClient.submitAssessmentAnswer(idToken, question.questionId, {
        questionId: question.questionId,
        questionType: 'LONG_ANSWER',
        answer: answer.trim(),
      });

      setSubmissionResult(result);
      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err: any) {
      console.error('Long answer submission error:', err);
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
              background: '#ede9fe',
              color: '#5b21b6',
              fontWeight: 600,
            }}
          >
            LONG ANSWER / ESSAY
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
          {question.marks} Marks
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
        <div style={{ marginBottom: '0.5rem' }}>
          <textarea
            rows={7}
            value={answer}
            disabled={isSubmitted || isSubmitting}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your comprehensive explanation or analysis here..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />
        </div>

        {/* Word count */}
        <div
          style={{
            textAlign: 'right',
            fontSize: '0.8rem',
            color: '#64748b',
            marginBottom: '1rem',
          }}
        >
          {wordCount} words ({answer.length} characters)
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
            <strong>✅ Long Response Submitted</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              Your detailed answer has been persisted and prepared for AI teacher evaluation.
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
            {isSubmitting ? 'Submitting...' : 'Submit Long Answer'}
          </button>
        )}
      </form>
    </div>
  );
};
