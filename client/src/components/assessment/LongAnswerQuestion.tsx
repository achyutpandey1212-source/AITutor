import React, { useState, useEffect } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { EvaluationFeedbackCard } from './EvaluationFeedbackCard';

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

  // Poll evaluation status if SUBMITTED or EVALUATING
  useEffect(() => {
    if (!idToken || !submissionResult) return;
    if (submissionResult.status !== 'SUBMITTED' && submissionResult.status !== 'EVALUATING') return;

    const interval = setInterval(async () => {
      try {
        const updated = await liveTutorApiClient.getAssessmentSubmission(
          idToken,
          question.questionId
        );
        if (updated && updated.status !== submissionResult.status) {
          setSubmissionResult(updated);
          if (onSubmitted) onSubmitted(updated);
        }
      } catch (err) {
        console.warn('Error polling long answer evaluation status:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [idToken, question.questionId, submissionResult, onSubmitted]);

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
            LONG ANSWER
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
          {question.marks} Marks (Structured Response)
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
          }}
        >
          {question.context}
        </p>
      )}

      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', lineHeight: '1.4' }}>
        {question.question}
      </h3>

      {/* Text Area Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            Structured Detailed Response:
          </label>
          <textarea
            rows={7}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitted || isSubmitting}
            placeholder="Structure your answer with clear points, reasoning, causes, and conclusions..."
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              background: isSubmitted ? '#f8fafc' : '#ffffff',
              boxSizing: 'border-box',
            }}
          />
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

        {/* Submit Button */}
        {!isSubmitted && (
          <button
            type="submit"
            disabled={!answer.trim() || isSubmitting}
            style={{
              padding: '0.6rem 1.25rem',
              background: !answer.trim() || isSubmitting ? '#94a3b8' : '#7c3aed',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: !answer.trim() || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Detailed Answer'}
          </button>
        )}
      </form>

      {/* Evaluation Feedback Card */}
      {submissionResult && (
        <EvaluationFeedbackCard
          evaluation={submissionResult.evaluation}
          status={submissionResult.status}
        />
      )}
    </div>
  );
};
