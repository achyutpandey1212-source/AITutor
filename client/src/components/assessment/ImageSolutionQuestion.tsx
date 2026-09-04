import React, { useState, useRef, useEffect } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { EvaluationFeedbackCard } from './EvaluationFeedbackCard';
import { MarkdownRenderer } from '../ai/MarkdownRenderer';
import { Button } from '../ui/Button';

export interface ImageSolutionQuestionProps {
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

export const ImageSolutionQuestion: React.FC<ImageSolutionQuestionProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission = null,
  hideEvaluation = false,
  onAskLumo,
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
      setError(err?.message || 'Failed to upload and evaluate photo. Please try again.');
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
              color: 'var(--color-orange)',
              fontWeight: 600,
            }}
          >
            📸 Handwritten Working
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

      {/* Instructions */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <strong style={{ color: 'var(--color-text-primary)' }}>Notebook Instructions:</strong>{' '}
        {question.submissionGuidance ||
          'Solve this problem step-by-step in your notebook. Show all formula selections, substitutions, calculations, and units. Take a photo and upload below.'}
      </div>

      {/* Image Upload Area */}
      <form onSubmit={handleSubmit}>
        {!previewUrl && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '28px 20px',
              textAlign: 'center',
              cursor: isSubmitted ? 'default' : 'pointer',
              background: 'var(--color-surface-hover)',
              marginBottom: '18px',
              transition: 'border-color var(--motion-fast) var(--ease-standard)',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
            <div style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Upload your handwritten solution
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Take a photo or browse your gallery (JPEG, PNG, WebP up to 10MB)
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={isSubmitted || isSubmitting}
        />

        {previewUrl && (
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                position: 'relative',
                maxHeight: '360px',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={previewUrl}
                alt="Your handwritten working"
                style={{
                  maxWidth: '100%',
                  maxHeight: '360px',
                  objectFit: 'contain',
                }}
              />
            </div>

            {!isSubmitted && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <Button variant="ghost" size="sm" onClick={handleReplacePhoto} disabled={isSubmitting}>
                  Replace Photo
                </Button>
              </div>
            )}
          </div>
        )}

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

        {/* Submit Button */}
        {!isSubmitted && (
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? 'Evaluating handwritten steps…' : 'Submit Handwritten Working'}
          </Button>
        )}
      </form>

      {/* Evaluation Feedback */}
      {submissionResult && !hideEvaluation && (
        <EvaluationFeedbackCard
          evaluation={submissionResult.evaluation}
          status={submissionResult.status as any}
          onRetry={handleReplacePhoto}
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
          <span>Working image recorded. Step evaluation will be revealed at the end of the test.</span>
        </div>
      )}
    </div>
  );
};
