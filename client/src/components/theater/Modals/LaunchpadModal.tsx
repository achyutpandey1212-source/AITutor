import React, { useState } from 'react';
import type { Document as KnowledgeDoc, TeachingSession } from '@ai-tutor/shared';

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
        background: 'rgba(7, 9, 13, 0.88)',
        backdropFilter: 'blur(24px)',
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
          maxWidth: '560px',
          background: '#0E1219',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '24px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(59, 130, 246, 0.05)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.65rem',
            }}
          >
            <span style={{ color: '#38BDF8', fontSize: '1.2rem', lineHeight: 1 }}>✦</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Lumo Theater
            </span>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 400,
              fontFamily: 'var(--theater-font-serif)',
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            What do you want to learn?
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#7E8695' }}>
            Enter any topic or concept to step into your private classroom.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Topic Input */}
          <div>
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
                padding: '0.9rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'var(--theater-font-sans)',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
            />
          </div>

          {/* Subject Pills */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#7E8695',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.45rem',
              }}
            >
              Subject
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {subjects.map((s) => {
                const isActive = subject === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: '999px',
                      border: isActive ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: isActive ? '#60A5FA' : '#B4BAC5',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all 0.15s ease',
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
                fontWeight: 700,
                color: '#7E8695',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.45rem',
              }}
            >
              Study Material (Optional)
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => handleDocumentSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'var(--theater-font-sans)',
              }}
            >
              <option value="none" style={{ background: '#0E1219' }}>
                📄 General AI Knowledge (No document attached)
              </option>
              {userDocs.map((doc) => (
                <option key={doc.id} value={doc.id} style={{ background: '#0E1219' }}>
                  📚 {doc.filename}
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
                fontWeight: 700,
                color: '#7E8695',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.45rem',
              }}
            >
              Language
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['english', 'hindi', 'hinglish'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '10px',
                    border: language === l ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: language === l ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: language === l ? '#60A5FA' : '#B4BAC5',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            style={{
              padding: '0.9rem',
              background: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !topic.trim() ? 0.6 : 1,
              marginTop: '0.5rem',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'all 0.15s ease',
            }}
          >
            {isLoading ? 'Preparing Classroom...' : 'Enter Classroom →'}
          </button>
        </form>

        {/* Previous Sessions (Resume) */}
        {pastSessions.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#7E8695',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Resume Recent Lesson
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {pastSessions.slice(0, 3).map((ps) => (
                <div
                  key={ps.id}
                  style={{
                    padding: '0.65rem 0.95rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFFFFF' }}>
                      {ps.topic}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#7E8695' }}>
                      {ps.subject} • {ps.language}
                    </div>
                  </div>

                  <button
                    onClick={() => onResumeSession(ps.id)}
                    disabled={isLoading}
                    style={{
                      padding: '0.3rem 0.75rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60A5FA',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.75rem',
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
