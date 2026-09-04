import React from 'react';
import type { TeachingSession } from '@ai-tutor/shared';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Skeleton } from '../ui/Skeleton';

// ---------------------------------------------------------------
// Lumo Continue Learning Component (Editorial Edition)
// The calm, dominant focal point of the Learning Home:
// "You were here. Let's continue."
// ---------------------------------------------------------------

export interface ContinueLearningCardProps {
  sessions: TeachingSession[];
  loading?: boolean;
  onContinue: (session: TeachingSession) => void;
  onStartNew: () => void;
}

function formatRelativeTime(dateStr?: string): string {
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
}

function calculateProgress(session: TeachingSession): number {
  if (session.lessonProgress) {
    const completed = session.lessonProgress.completedConceptIds?.length || 0;
    const total = session.lessonBlueprint?.conceptSequence?.length || 0;
    if (total > 0) {
      return Math.min(100, Math.max(15, Math.round((completed / total) * 100)));
    }
  }

  const mastered = session.teachingState?.conceptsMastered?.length || 0;
  const needingWork = session.teachingState?.conceptsNeedingWork?.length || 0;
  const total = mastered + needingWork;
  if (total > 0) {
    return Math.min(95, Math.max(20, Math.round((mastered / total) * 100)));
  }

  return session.status === 'completed' ? 100 : 42;
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({
  sessions,
  loading = false,
  onContinue,
  onStartNew,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (loading) {
    return (
      <div
        style={{
          padding: 'var(--space-8) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '720px' }}>
          <Skeleton width="120px" height="14px" />
          <Skeleton width="70%" height="36px" borderRadius="var(--radius-sm)" />
          <Skeleton width="45%" height="20px" />
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Skeleton width="100%" height="4px" borderRadius="var(--radius-full)" />
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Skeleton width="180px" height="44px" borderRadius="var(--radius-md)" />
          </div>
        </div>
      </div>
    );
  }

  // Empty State: New student / No active sessions
  if (!sessions || sessions.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-8) 0',
          borderTop: '1px solid var(--color-border-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-orange)',
            }}
          >
            Start Fresh
          </span>

          <h3
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Nothing in progress yet.
          </h3>

          <p
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              marginTop: 'var(--space-1)',
            }}
          >
            Pick any topic or upload study material, and Lumo will plan and teach your first visual lesson.
          </p>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="primary" size="md" onClick={onStartNew}>
              Start Learning &rarr;
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeSession = sessions[selectedIndex] || sessions[0];
  const progressPercent = calculateProgress(activeSession);
  const relativeTime = formatRelativeTime(activeSession.updatedAt || activeSession.startedAt);
  const currentConcept = activeSession.currentConcept || activeSession.topic;

  // Extract concepts list if available
  const conceptsList: string[] = [];
  if (activeSession.lessonBlueprint?.conceptSequence) {
    activeSession.lessonBlueprint.conceptSequence.forEach((c) => conceptsList.push(c.title));
  } else if (activeSession.teachingState?.conceptsMastered) {
    activeSession.teachingState.conceptsMastered.forEach((c) => conceptsList.push(c));
  }

  return (
    <div
      style={{
        position: 'relative',
        padding: 'var(--space-8) 0 var(--space-10) 0',
        borderTop: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 'var(--space-8)',
          alignItems: 'end',
        }}
        className="lumo-continue-grid"
      >
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Metadata & Subject whisper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            <span style={{ color: 'var(--color-orange)' }}>
              {activeSession.subject || 'General'}
            </span>
            <span>·</span>
            <span>Active {relativeTime}</span>
            {activeSession.documentTitle && (
              <>
                <span>·</span>
                <span
                  style={{
                    maxWidth: '260px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                  title={activeSession.documentTitle}
                >
                  📚 {activeSession.documentTitle}
                </span>
              </>
            )}
          </div>

          {/* Large Editorial Topic Title */}
          <h2
            style={{
              fontSize: 'clamp(28px, 3.4vw, 42px)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {activeSession.topic}
          </h2>

          {/* Current sub-concept focus */}
          <p
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              marginTop: '2px',
            }}
          >
            Continue from <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{currentConcept}</strong>
          </p>

          {/* Concept tags if available */}
          {conceptsList.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                flexWrap: 'wrap',
                marginTop: 'var(--space-2)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-muted)',
              }}
            >
              <span style={{ fontWeight: 600 }}>Concepts:</span>
              {conceptsList.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-soft)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '12px',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Ultra-refined progress line */}
          <div style={{ maxWidth: '480px', marginTop: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
                fontWeight: 500,
              }}
            >
              <span>Lesson progress</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} variant="brand" height={3} />
          </div>
        </div>

        {/* Action Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            flexShrink: 0,
          }}
          className="lumo-continue-action"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => onContinue(activeSession)}
            style={{
              padding: '0 var(--space-8)',
              height: '50px',
              fontSize: '15px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Continue learning &rarr;
          </Button>

          {/* Earlier sessions switcher */}
          {sessions.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-1)',
              }}
            >
              <span>Earlier:</span>
              {sessions.slice(1, 3).map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedIndex(idx + 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    cursor: 'pointer',
                    fontSize: 'var(--text-caption)',
                  }}
                  title={s.topic}
                >
                  {s.topic.length > 18 ? `${s.topic.slice(0, 18)}…` : s.topic}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .lumo-continue-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-6) !important;
          }
          .lumo-continue-action {
            width: 100% !important;
          }
          .lumo-continue-action button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};
