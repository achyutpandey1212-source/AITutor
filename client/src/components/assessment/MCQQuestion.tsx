import React, { useState } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface MCQQuestionProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  onSubmitted?: (submission: AssessmentSubmission) => void;
  initialSubmission?: AssessmentSubmission | null;
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission = null,
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
              background: '#e0e7ff',
              color: '#3730a3',
              fontWeight: 600,
            }}
          >
            MCQ
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

      {/* Options List */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  cursor: isSubmitted ? 'default' : 'pointer',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <input
                  type="radio"
                  name={`mcq_${question.questionId}`}
                  value={opt.id}
                  checked={isSelected}
                  disabled={isSubmitted || isSubmitting}
                  onChange={() => setSelectedOption(opt.id)}
                  style={{ marginRight: '0.75rem', cursor: isSubmitted ? 'default' : 'pointer' }}
                />
                <span style={{ fontWeight: 700, marginRight: '0.5rem', color: '#1e293b' }}>
                  {opt.id}.
                </span>
                <span style={{ color: '#334155', flex: 1 }}>{opt.text}</span>
              </label>
            );
          })}
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

        {/* Submission Feedback */}
        {submissionResult && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              background: submissionResult.score && submissionResult.score > 0 ? '#f0fdf4' : '#fef2f2',
              border: submissionResult.score && submissionResult.score > 0 ? '1px solid #bbf7d0' : '1px solid #fecaca',
              color: submissionResult.score && submissionResult.score > 0 ? '#166534' : '#991b1b',
              fontSize: '0.9rem',
            }}
          >
            <strong>{submissionResult.score && submissionResult.score > 0 ? '✅ Correct!' : '❌ Incorrect'}</strong>
            {typeof submissionResult.score === 'number' && (
              <span> — Score: {submissionResult.score}/{question.marks}</span>
            )}
            {submissionResult.feedback && <p style={{ margin: '0.25rem 0 0 0' }}>{submissionResult.feedback}</p>}
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <button
            type="submit"
            disabled={!selectedOption || isSubmitting}
            style={{
              padding: '0.6rem 1.25rem',
              background: !selectedOption || isSubmitting ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: !selectedOption || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        )}
      </form>
    </div>
  );
};
