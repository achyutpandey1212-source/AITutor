import React, { useState, useRef } from 'react';
import type { Document as KnowledgeDoc, TeachingSession } from '@ai-tutor/shared';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { liveTutorApiClient } from '../../services/api.service';

// ---------------------------------------------------------------
// Lumo Start Learning Modal
// The lightweight launchpad for starting a new visual lesson.
// ---------------------------------------------------------------

export interface StartLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  idToken: string;
  existingDocuments: KnowledgeDoc[];
  onDocumentUploaded?: () => void;
  onSessionStarted: (session: TeachingSession) => void;
  initialTopic?: string;
  initialSubject?: string;
  initialDocumentId?: string;
}

const QUICK_TOPICS: Array<{ topic: string; subject: string }> = [
  { topic: "Newton's Laws of Motion", subject: 'Physics' },
  { topic: 'Cell Division & Mitosis', subject: 'Biology' },
  { topic: 'Electric Current & Ohm\'s Law', subject: 'Physics' },
  { topic: 'Chemical Bonding & Molecular Structure', subject: 'Chemistry' },
  { topic: 'Limits and Derivatives', subject: 'Mathematics' },
];

export const StartLearningModal: React.FC<StartLearningModalProps> = ({
  isOpen,
  onClose,
  idToken,
  existingDocuments,
  onDocumentUploaded,
  onSessionStarted,
  initialTopic = '',
  initialSubject = 'Physics',
  initialDocumentId = 'none',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [documentId, setDocumentId] = useState(initialDocumentId);
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [isStarting, setIsStarting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Ready documents available for grounding
  const readyDocs = existingDocuments.filter((d) => d.status === 'ready');

  const handleDocumentSelect = (docId: string) => {
    setDocumentId(docId);
    if (docId !== 'none') {
      const doc = readyDocs.find((d) => d.id === docId);
      if (doc && !topic.trim()) {
        const cleanName = doc.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopic(cleanName);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !idToken) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploaded = await liveTutorApiClient.uploadDocument(idToken, file);
      setUploadSuccess(`Uploaded "${file.name}". Processing...`);
      setDocumentId(uploaded.id);
      if (!topic.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopic(cleanName);
      }
      onDocumentUploaded?.();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a learning topic');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const selectedDoc = readyDocs.find((d) => d.id === documentId);
      const newSession = await liveTutorApiClient.createSession(idToken, {
        topic: topic.trim(),
        subject: subject.trim(),
        documentId: documentId !== 'none' ? documentId : undefined,
        documentTitle: selectedDoc?.filename,
        availableMinutes: 30,
        learnerProfile: {
          preferredLanguage: language,
          explanationStyle: 'simple',
        },
      });

      onSessionStarted(newSession);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize session');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Learning"
      description="What would you like to understand today?"
      maxWidth="580px"
    >
      <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {error && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-error-soft)',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
            }}
          >
            {error}
          </div>
        )}

        {/* 1. Topic Input */}
        <div>
          <label
            htmlFor="lumo-topic-input"
            style={{
              display: 'block',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Topic or Concept
          </label>
          <Input
            id="lumo-topic-input"
            placeholder="e.g. Newton's Laws of Motion, Cellular Mitosis..."
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (error) setError(null);
            }}
            autoFocus
          />

          {/* Quick Suggestions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: 'var(--space-3)',
            }}
          >
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Suggestions:
            </span>
            {QUICK_TOPICS.map((item) => (
              <button
                type="button"
                key={item.topic}
                onClick={() => {
                  setTopic(item.topic);
                  setSubject(item.subject);
                  if (error) setError(null);
                }}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-soft)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-orange)';
                  e.currentTarget.style.color = 'var(--color-orange)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {item.topic}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Subject & Language Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div>
            <label
              htmlFor="lumo-subject-select"
              style={{
                display: 'block',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Subject
            </label>
            <select
              id="lumo-subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-body-sm)',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="General Science">General Science</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="lumo-lang-select"
              style={{
                display: 'block',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Language
            </label>
            <select
              id="lumo-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-body-sm)',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
        </div>

        {/* 3. Study Material / Document Selection */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <label
              htmlFor="lumo-doc-select"
              style={{
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Ground on Study Material (Optional)
            </label>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                color: 'var(--color-orange)',
                background: 'none',
                border: 'none',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isUploading ? 'Uploading...' : '+ Upload New Material'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <select
            id="lumo-doc-select"
            value={documentId}
            onChange={(e) => handleDocumentSelect(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body-sm)',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="none">None (Teach from General Knowledge)</option>
            {readyDocs.map((doc) => (
              <option key={doc.id} value={doc.id}>
                📚 {doc.filename} ({doc.chunkCount} chunks)
              </option>
            ))}
          </select>

          {uploadSuccess && (
            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption)', color: 'var(--color-success)', fontWeight: 500 }}>
              ✓ {uploadSuccess}
            </div>
          )}

          {uploadError && (
            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption)', color: 'var(--color-error)', fontWeight: 500 }}>
              ⚠ {uploadError}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
          }}
        >
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isStarting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={isStarting}>
            Begin Lesson &rarr;
          </Button>
        </div>
      </form>
    </Modal>
  );
};
