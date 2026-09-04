import React from 'react';
import type { AssessmentAnalytics, TeachingSession } from '@ai-tutor/shared';
import { Progress } from '../ui/Progress';
import { Skeleton } from '../ui/Skeleton';

// ---------------------------------------------------------------
// Lumo Learning Mastery Component (Editorial Edition)
// Restrained, quiet orientation: "What I understand."
// No cards, no graphs, no streaks, no XP.
// ---------------------------------------------------------------

export interface LearningMasterySectionProps {
  analytics: AssessmentAnalytics | null;
  sessions: TeachingSession[];
  loading?: boolean;
}

export const LearningMasterySection: React.FC<LearningMasterySectionProps> = ({
  analytics,
  sessions,
  loading = false,
}) => {
  // Aggregate subject progress from sessions and analytics
  const subjectMap = new Map<string, { totalSessions: number; completedCount: number }>();

  sessions.forEach((s) => {
    const subj = s.subject || 'General Science';
    const entry = subjectMap.get(subj) || { totalSessions: 0, completedCount: 0 };
    entry.totalSessions += 1;
    if (s.status === 'completed' || (s.lessonProgress && s.lessonProgress.completedConceptIds?.length > 0)) {
      entry.completedCount += 1;
    }
    subjectMap.set(subj, entry);
  });

  // Extract mastered concepts from recent sessions & analytics
  const masteredConcepts = new Set<string>();
  const developingConcepts = new Set<string>();

  sessions.forEach((s) => {
    s.teachingState?.conceptsMastered?.forEach((c) => masteredConcepts.add(c));
    s.teachingState?.conceptsNeedingWork?.forEach((c) => developingConcepts.add(c));
  });

  if (analytics?.byConcept) {
    Object.entries(analytics.byConcept).forEach(([concept, stats]) => {
      if (stats.mastery >= 0.7 || stats.accuracy >= 70) {
        masteredConcepts.add(concept);
      } else {
        developingConcepts.add(concept);
      }
    });
  }

  const subjects = Array.from(subjectMap.entries()).map(([name, data]) => {
    let percent = Math.min(95, Math.max(25, Math.round((data.completedCount / data.totalSessions) * 100)));
    if (analytics?.bySubject?.[name]) {
      percent = Math.round(analytics.bySubject[name].accuracy);
    }
    return { name, percent };
  });

  const displaySubjects = subjects.length > 0
    ? subjects
    : [
        { name: 'Physics', percent: 0 },
        { name: 'Chemistry', percent: 0 },
        { name: 'Biology', percent: 0 },
      ];

  const hasActivity = sessions.length > 0 || Boolean(analytics?.totalQuestions);

  return (
    <section aria-labelledby="lumo-mastery-heading" style={{ paddingTop: 'var(--space-2)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        <h3
          id="lumo-mastery-heading"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          Subject Mastery
        </h3>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '480px' }}>
          <Skeleton width="100%" height="16px" />
          <Skeleton width="100%" height="16px" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: 'var(--space-12)',
            alignItems: 'start',
          }}
          className="lumo-mastery-grid"
        >
          {/* Subject Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {displaySubjects.map((s) => (
              <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {s.name}
                  </span>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                    {hasActivity ? `${s.percent}%` : 'New'}
                  </span>
                </div>
                <Progress value={s.percent} variant="brand" height={3} />
              </div>
            ))}
          </div>

          {/* Concepts Strengthened */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Recently verified concepts
            </span>

            {masteredConcepts.size === 0 && developingConcepts.size === 0 ? (
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                Mastered and developing concepts will register here as you progress through interactive teaching and assessments.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: '2px' }}>
                {Array.from(masteredConcepts).slice(0, 5).map((concept) => (
                  <span
                    key={`m-${concept}`}
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-primary)',
                      background: 'var(--color-surface-soft)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span>
                    <span>{concept}</span>
                  </span>
                ))}

                {Array.from(developingConcepts).slice(0, 3).map((concept) => (
                  <span
                    key={`d-${concept}`}
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-surface-soft)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>◐</span>
                    <span>{concept}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .lumo-mastery-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-6) !important;
          }
        }
      `}</style>
    </section>
  );
};
