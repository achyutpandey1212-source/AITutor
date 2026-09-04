import React, { useState } from 'react';
import type { Document as KnowledgeDoc, TeachingSession } from '@ai-tutor/shared';
import { IconArrowRight } from '../TheaterIcons';

export interface LaunchpadModalProps {
  initialTopic?: string;
  initialSubject?: string;
  initialDocumentId?: string;
  userDocs: KnowledgeDoc[];
  pastSessions: TeachingSession[];
  onStartSession: (
    topic: string,
    subject: string,
    language: 'english' | 'hindi' | 'hinglish',
    documentId?: string,
    documentTitle?: string
  ) => Promise<void>;
  onResumeSession: (sessionId: string) => Promise<void>;
  isLoading?: boolean;
}

export const LaunchpadModal: React.FC<LaunchpadModalProps> = ({
  initialTopic = '',
  initialSubject = 'Physics',
  initialDocumentId = 'none',
  userDocs,
  pastSessions,
  onStartSession,
  onResumeSession,
  isLoading = false,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [selectedDocId, setSelectedDocId] = useState(initialDocumentId);
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');

  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science'];

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocId(docId);
    if (docId !== 'none') {
      const doc = userDocs.find((d) => d.id === docId);
      if (doc && !topic) {
        const cleanName = doc.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopic(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    const doc = userDocs.find((d) => d.id === selectedDocId);
    await onStartSession(
      topic.trim(),
      subject,
      language,
      selectedDocId !== 'none' ? selectedDocId : undefined,
      doc?.filename
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--theater-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 50,
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--theater-surface)',
          border: '1px solid var(--theater-border-medium)',
          borderRadius: 'var(--theater-radius-xl)',
          padding: '2.25rem 2rem',
          boxShadow: 'var(--theater-shadow-stage)',
          color: 'var(--theater-text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--theater-accent)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 650,
                color: 'var(--theater-text-secondary)',
                letterSpacing: '-0.01em',
              }}
            >
              Lumo Live Tutor
            </span>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: '1.55rem',
              fontWeight: 600,
              color: 'var(--theater-text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            What would you like to explore?
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: 'var(--theater-text-muted)' }}>
            Enter any concept or topic to begin your personalized live lesson.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Topic Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 550,
                color: 'var(--theater-text-muted)',
                letterSpacing: '0.02em',
                marginBottom: '0.35rem',
              }}
            >
              Topic or Question
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton's Laws of Motion, Snell's Law, Mitosis..."
              autoFocus
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--theater-surface-sunken)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-md)',
                color: 'var(--theater-text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'border-color var(--theater-transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--theater-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--theater-border-subtle)')}
            />
          </div>

          {/* Subject Options */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 550,
                color: 'var(--theater-text-muted)',
                letterSpacing: '0.02em',
                marginBottom: '0.4rem',
              }}
            >
              Subject
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {subjects.map((s) => {
                const isActive = subject === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: 'var(--theater-radius-sm)',
                      border: isActive ? '1px solid var(--theater-accent)' : '1px solid var(--theater-border-subtle)',
                      background: isActive ? 'var(--theater-accent)' : 'var(--theater-surface-elevated)',
                      color: isActive ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all var(--theater-transition-fast)',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study Material Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 550,
                color: 'var(--theater-text-muted)',
                letterSpacing: '0.02em',
                marginBottom: '0.35rem',
              }}
            >
              Attach Study Material (Optional)
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => handleDocumentSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: 'var(--theater-surface-sunken)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-md)',
                color: 'var(--theater-text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
                fontFamily: 'var(--theater-font-sans)',
              }}
            >
              <option value="none">
                General Knowledge (No document attached)
              </option>
              {userDocs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 550,
                color: 'var(--theater-text-muted)',
                letterSpacing: '0.02em',
                marginBottom: '0.35rem',
              }}
            >
              Teaching Language
            </label>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              {(['english', 'hindi', 'hinglish'] as const).map((l) => {
                const isActive = language === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: 'var(--theater-radius-sm)',
                      border: isActive ? '1px solid var(--theater-accent)' : '1px solid var(--theater-border-subtle)',
                      background: isActive ? 'var(--theater-accent)' : 'var(--theater-surface-elevated)',
                      color: isActive ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all var(--theater-transition-fast)',
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.75rem 1.25rem',
              background: 'var(--theater-accent)',
              color: 'var(--theater-accent-contrast)',
              border: 'none',
              borderRadius: 'var(--theater-radius-md)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !topic.trim() ? 0.6 : 1,
              marginTop: '0.35rem',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'opacity var(--theater-transition-fast)',
            }}
          >
            <span>{isLoading ? 'Preparing session...' : 'Begin Lesson'}</span>
            <IconArrowRight size={14} />
          </button>
        </form>

        {/* Previous Sessions (Resume) */}
        {pastSessions.length > 0 && (
          <div style={{ borderTop: '1px solid var(--theater-border-subtle)', paddingTop: '1rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 550,
                color: 'var(--theater-text-muted)',
                letterSpacing: '0.02em',
              }}
            >
              Resume Recent Lesson
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.45rem' }}>
              {pastSessions.slice(0, 3).map((ps) => (
                <div
                  key={ps.id}
                  style={{
                    padding: '0.55rem 0.85rem',
                    background: 'var(--theater-surface-elevated)',
                    border: '1px solid var(--theater-border-subtle)',
                    borderRadius: 'var(--theater-radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 550, fontSize: '0.82rem', color: 'var(--theater-text-primary)' }}>
                      {ps.topic}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--theater-text-muted)' }}>
                      {ps.subject} • {ps.language}
                    </div>
                  </div>

                  <button
                    onClick={() => onResumeSession(ps.id)}
                    disabled={isLoading}
                    style={{
                      padding: '0.25rem 0.65rem',
                      background: 'var(--theater-surface-active)',
                      color: 'var(--theater-text-primary)',
                      border: '1px solid var(--theater-border-subtle)',
                      borderRadius: 'var(--theater-radius-sm)',
                      fontWeight: 550,
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                    }}
                  >
                    Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
