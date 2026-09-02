import React, { useRef, useState } from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitted = Boolean(submissionResult);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Please select a valid JPEG, PNG, or WebP photo.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Image file is too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleReplacePhoto = () => {
    if (isSubmitted || isSubmitting) return;
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
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
            📸 HANDWRITTEN WORKING REQUIRED
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

      <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginTop: 0, marginBottom: '0.75rem' }}>
        {question.question}
      </h3>

      {/* Clean-Solution Guidance Card */}
      <div
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          borderRadius: '6px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          color: '#0369a1',
          fontSize: '0.85rem',
        }}
      >
        <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
          📸 Make your working easy to read:
        </strong>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>Solve the complete problem in your notebook showing each step.</li>
          <li>Make sure the full page is visible, well-lit, and in order.</li>
          <li>Avoid cutting off calculations, formulas, or your final answer.</li>
        </ul>
      </div>

      {/* Upload & Preview Section */}
      <form onSubmit={handleSubmit}>
        {!previewUrl ? (
          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              marginBottom: '1rem',
              cursor: isSubmitted ? 'default' : 'pointer',
            }}
            onClick={() => !isSubmitted && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              capture="environment"
              disabled={isSubmitted || isSubmitting}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#334155' }}>
              Click to take a photo or upload solution image
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Supports JPEG, PNG, WebP (max 10MB)
            </p>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.75rem',
              background: '#f8fafc',
              marginBottom: '1rem',
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
                📷 Solution Image Preview
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
            <strong>✅ Handwritten Solution Uploaded & Submitted</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
              Your solution photo has been saved securely and queued for AI vision evaluation.
            </p>
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
    </div>
  );
};
