import React, { useState, useEffect } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { EvaluationFeedbackCard } from './EvaluationFeedbackCard';
import { MarkdownRenderer } from '../ai/MarkdownRenderer';
import { Button } from '../ui/Button';

export interface LongAnswerQuestionProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  onSubmitted?: (submission: AssessmentSubmission) => void;
  initialSubmission?: AssessmentSubmission | null;
  hideEvaluation?: boolean;
  onAskLumo?: (doubtContext: {
    question?: string;
    feedback?: string;
    misconception?: string;
  }) => void;
}

export const LongAnswerQuestion: React.FC<LongAnswerQuestionProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission = null,
  hideEvaluation = false,
  onAskLumo,
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
        padding: '20px',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Header Badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
            }}
          >
            Long Answer
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
            }}
          >
            {question.difficulty}
          </span>
          {question.ragGrounded && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-orange)',
                fontWeight: 600,
              }}
            >
              📄 Study Material
            </span>
          )}
        </div>
        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {question.marks} Marks
        </span>
      </div>

      {/* Question Context & Prompt */}
      {question.context && (
        <div
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-hover)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px',
            borderLeft: '2px solid var(--color-orange)',
          }}
        >
          {question.context}
        </div>
      )}

      <div style={{ margin: '0 0 18px 0' }}>
        <MarkdownRenderer
          content={question.question}
          style={{
            fontSize: 'var(--text-body-lg, 17px)',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {/* Submission Input */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <textarea
            rows={7}
            placeholder="Write your structured explanation, proofs, or derivations here…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitted || isSubmitting}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body)',
              lineHeight: 1.6,
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          {question.submissionGuidance && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Tip: {question.submissionGuidance}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              marginBottom: '14px',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-danger, #ef4444)',
              color: 'var(--color-danger, #ef4444)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Button */}
        {!isSubmitted && (
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? 'Evaluating answer…' : 'Submit Detailed Answer'}
          </Button>
        )}
      </form>

      {/* Evaluation Feedback */}
      {submissionResult && !hideEvaluation && (
        <EvaluationFeedbackCard
          evaluation={submissionResult.evaluation}
          status={submissionResult.status as any}
          onAskLumo={onAskLumo}
          questionText={question.question}
        />
      )}
      {submissionResult && hideEvaluation && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓</span>
          <span>Response recorded. Detailed evaluation will be revealed at the end of the test.</span>
        </div>
      )}
    </div>
  );
};
