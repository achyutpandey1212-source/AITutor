import React, { useState } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { EvaluationFeedbackCard } from './EvaluationFeedbackCard';
import { MarkdownRenderer } from '../ai/MarkdownRenderer';
import { Button } from '../ui/Button';

export interface MCQQuestionProps {
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

export const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission = null,
  hideEvaluation = false,
  onAskLumo,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    initialSubmission?.selectedOption || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmission | null>(
    initialSubmission
  );

  const isSubmitted = Boolean(submissionResult);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await liveTutorApiClient.submitAssessmentAnswer(idToken, question.questionId, {
        questionId: question.questionId,
        questionType: 'MCQ',
        selectedOption,
      });

      setSubmissionResult(result);
      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err: any) {
      console.error('MCQ submission error:', err);
      setError(err?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = question.options || [];

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
            Multiple Choice
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
          {question.marks} Mark{question.marks > 1 ? 's' : ''}
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

      {/* Options List */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => !isSubmitted && setSelectedOption(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border)'}`,
                  background: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                  cursor: isSubmitted ? 'default' : 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                <input
                  type="radio"
                  name={`mcq_${question.questionId}`}
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => !isSubmitted && setSelectedOption(opt.id)}
                  disabled={isSubmitted || isSubmitting}
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--color-orange)' : 'var(--color-surface-hover)',
                    border: `1px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border)'}`,
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0,
                    transition: 'all var(--motion-fast) var(--ease-standard)',
                  }}
                >
                  {opt.id}
                </span>
                <span
                  style={{
                    color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-body)',
                    fontWeight: isSelected ? 600 : 400,
                    lineHeight: 1.4,
                  }}
                >
                  {opt.text}
                </span>
              </label>
            );
          })}
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

        {/* Submission Action */}
        {!isSubmitted && (
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!selectedOption || isSubmitting}
          >
            {isSubmitting ? 'Checking answer…' : 'Submit Answer'}
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
