import React, { useState, useRef, useEffect } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { EvaluationFeedbackCard } from './EvaluationFeedbackCard';

export interface ImageSolutionQuestionProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  onSubmitted?: (submission: AssessmentSubmission) => void;
  initialSubmission?: AssessmentSubmission | null;
}

export const ImageSolutionQuestion: React.FC<ImageSolutionQuestionProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission = null,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialSubmission?.imageReference || null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmission | null>(
    initialSubmission
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        console.warn('Error polling image evaluation status:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [idToken, question.questionId, submissionResult, onSubmitted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase())) {
      setError('Please upload a valid JPEG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReplacePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSubmissionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await liveTutorApiClient.submitAssessmentImage(
        idToken,
        question.questionId,
        selectedFile
      );

      setSubmissionResult(result);
      if (onSubmitted) {
        onSubmitted(result);
      }
    } catch (err: any) {
      console.error('Image solution submission error:', err);
      setError(err?.message || 'Failed to upload solution image. Please try again.');
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
              background: '#fef3c7',
              color: '#92400e',
              fontWeight: 600,
            }}
          >
            📸 HANDWRITTEN SOLUTION
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
          {question.marks} Marks (Multi-Step Working)
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

      {/* Cleanliness Guidance Card */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '6px',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: '#0369a1',
        }}
      >
        <strong>📋 Notebook Solution Instructions:</strong>
        <p style={{ margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
          {question.submissionGuidance ||
            'Write each mathematical step clearly in your notebook. Show your full working. Take a clear, well-lit photo and upload it below.'}
        </p>
      </div>

      {/* Image Upload Area */}
      <form onSubmit={handleSubmit}>
        {!previewUrl && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: isSubmitted ? 'default' : 'pointer',
              background: '#f8fafc',
              marginBottom: '1rem',
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem' }}>
              Click to photograph or upload solution
            </strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Supports JPEG, PNG, or WebP (Max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isSubmitted || isSubmitting}
            />
          </div>
        )}

        {/* Image Preview */}
        {previewUrl && (
          <div
            style={{
              marginBottom: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.75rem',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                📸 Attached Solution Photo
              </span>
              {!isSubmitted && (
                <button
                  type="button"
                  onClick={handleReplacePhoto}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Retake / Replace Photo
                </button>
              )}
            </div>
            <div style={{ textAlign: 'center', maxHeight: '350px', overflow: 'hidden', borderRadius: '4px' }}>
              <img
                src={previewUrl}
                alt="Student Solution Preview"
                style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

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
            disabled={!selectedFile || isSubmitting}
            style={{
              padding: '0.65rem 1.25rem',
              background: !selectedFile || isSubmitting ? '#94a3b8' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: !selectedFile || isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isSubmitting ? 'Uploading & Submitting...' : '📤 Submit Solution Image'}
          </button>
        )}
      </form>

      {/* Evaluation Feedback Card */}
      {submissionResult && (
        <EvaluationFeedbackCard
          evaluation={submissionResult.evaluation}
          status={submissionResult.status}
          onRetry={handleReplacePhoto}
        />
      )}
    </div>
  );
};
