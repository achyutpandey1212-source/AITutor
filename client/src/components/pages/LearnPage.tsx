import React, { useState, useEffect } from 'react';
import type { TeachingSession } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { Button } from '../ui/Button';
import { StartLearningForm } from '../learning/StartLearningForm';

export interface LearnPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
  initialTopic?: string;
  initialSubject?: string;
  initialDocumentId?: string;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  idToken,
  onNavigate,
  initialTopic = '',
  initialSubject = 'Physics',
  initialDocumentId = 'none',
}) => {
  const [pastSessions, setPastSessions] = useState<TeachingSession[]>([]);

  useEffect(() => {
    if (!idToken) return;
    liveTutorApiClient
      .listTeachingSessions(idToken)
      .then((sessions) => setPastSessions(sessions))
      .catch(() => setPastSessions([]));
  }, [idToken]);

  const handleResumeSession = (sessionId: string) => {
    onNavigate(`/tutor?sessionId=${sessionId}`);
  };

  const handleSessionStarted = (session: TeachingSession) => {
    onNavigate(`/tutor?sessionId=${session.id}`);
  };

  const formatRelativeTime = (dateStr?: string): string => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'calc(64px + 1.5rem) 1rem 2rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: 'calc(100vh - 64px - 3rem)',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          padding: 'clamp(1.25rem, 3vw, 2.5rem)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(1rem, 2vw, 1.75rem)',
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--color-orange)',
                boxShadow: '0 0 8px var(--color-orange)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                letterSpacing: '-0.01em',
              }}
            >
              Lumo Live Tutor
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            What would you like to explore?
          </h1>
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Enter any concept or topic to begin your personalized live lesson.
          </p>
        </div>

        <StartLearningForm
          idToken={idToken}
          onSessionStarted={handleSessionStarted}
          initialTopic={initialTopic}
          initialSubject={initialSubject}
          initialDocumentId={initialDocumentId}
        />

        {/* Resume Recent Lesson */}
        {pastSessions.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: 'clamp(0.75rem, 1.5vw, 1rem)',
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem',
              }}
            >
              Resume Recent Lesson
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '240px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {pastSessions.map((ps) => (
                <div
                  key={ps.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ps.topic}
                    </div>
                    <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                      {ps.subject} • {ps.language} • {formatRelativeTime(ps.updatedAt || ps.startedAt)}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleResumeSession(ps.id)}
                    style={{ flexShrink: 0 }}
                  >
                    Resume
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type="file"]::-webkit-file-upload-button {
          display: none;
        }
        select:focus, input:focus {
          outline: none;
          border-color: var(--color-orange) !important;
          box-shadow: 0 0 0 3px var(--color-orange-border-20);
        }
      `}</style>
    </div>
  );
};

export default LearnPage;
