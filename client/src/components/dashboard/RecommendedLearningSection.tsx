import React from 'react';
import type { TeachingSession, WrongAssessmentQuestion } from '@ai-tutor/shared';
import { Skeleton } from '../ui/Skeleton';

// ---------------------------------------------------------------
// Lumo Recommended Learning Component (Editorial Edition)
// Lightweight, contextual suggestions: "Here's what makes sense next."
// No heavy card grids.
// ---------------------------------------------------------------

export interface RecommendedItem {
  id: string;
  topic: string;
  subject: string;
  reason: string;
  estimatedMinutes: number;
}

export interface RecommendedLearningSectionProps {
  sessions: TeachingSession[];
  dueReviews: WrongAssessmentQuestion[];
  loading?: boolean;
  onSelectRecommendation: (topic: string, subject: string) => void;
}

function deriveRecommendations(
  sessions: TeachingSession[],
  dueReviews: WrongAssessmentQuestion[]
): RecommendedItem[] {
  const items: RecommendedItem[] = [];

  // 1. Concept review if mistakes exist
  if (dueReviews.length > 0) {
    const firstReview = dueReviews[0];
    items.push({
      id: 'rec-review',
      topic: firstReview.concept || 'Review Difficult Concepts',
      subject: firstReview.subject || 'Review',
      reason: `Reinforce concepts from ${dueReviews.length} practice question${dueReviews.length > 1 ? 's' : ''}`,
      estimatedMinutes: 10,
    });
  }

  // 2. Concepts needing work from recent session
  const latestSession = sessions[0];
  if (latestSession) {
    const needingWork = latestSession.teachingState?.conceptsNeedingWork;
    if (needingWork && needingWork.length > 0) {
      items.push({
        id: 'rec-work',
        topic: needingWork[0],
        subject: latestSession.subject || 'Physics',
        reason: 'Lumo noticed this concept needs a little more practice',
        estimatedMinutes: 12,
      });
    }

    // 3. Curriculum continuation
    const currentTopicLower = latestSession.topic.toLowerCase();
    if (currentTopicLower.includes('motion') || currentTopicLower.includes('newton')) {
      items.push({
        id: 'rec-next-motion',
        topic: 'Work, Energy and Power',
        subject: 'Physics',
        reason: 'Natural continuation after Newton\'s Laws',
        estimatedMinutes: 15,
      });
    } else if (currentTopicLower.includes('light') || currentTopicLower.includes('refraction')) {
      items.push({
        id: 'rec-next-optics',
        topic: 'Total Internal Reflection',
        subject: 'Physics',
        reason: 'Explore optical phenomena building upon Snell\'s Law',
        estimatedMinutes: 15,
      });
    } else if (currentTopicLower.includes('cell') || currentTopicLower.includes('mitosis')) {
      items.push({
        id: 'rec-next-bio',
        topic: 'DNA Replication & Cell Cycle',
        subject: 'Biology',
        reason: 'Follow-up to cellular division and mitosis',
        estimatedMinutes: 14,
      });
    } else {
      items.push({
        id: 'rec-next-general',
        topic: `${latestSession.topic}: Advanced Problems`,
        subject: latestSession.subject || 'Science',
        reason: 'Deepen understanding with worked examples',
        estimatedMinutes: 15,
      });
    }
  }

  // 4. Default curriculum starters
  if (items.length < 3) {
    const starters: RecommendedItem[] = [
      {
        id: 'starter-1',
        topic: 'Electric Potential & Ohm\'s Law',
        subject: 'Physics',
        reason: 'Foundational principles of charge and current',
        estimatedMinutes: 15,
      },
      {
        id: 'starter-2',
        topic: 'Chemical Bonding & Molecular Shapes',
        subject: 'Chemistry',
        reason: 'Master electron pairing and lattice geometry',
        estimatedMinutes: 12,
      },
      {
        id: 'starter-3',
        topic: 'Photosynthesis: Light Reactions',
        subject: 'Biology',
        reason: 'Visual breakdown of electron transport in chloroplasts',
        estimatedMinutes: 16,
      },
    ];

    for (const starter of starters) {
      if (items.length >= 3) break;
      if (!items.some((i) => i.topic === starter.topic)) {
        items.push(starter);
      }
    }
  }

  return items.slice(0, 3);
}

export const RecommendedLearningSection: React.FC<RecommendedLearningSectionProps> = ({
  sessions,
  dueReviews,
  loading = false,
  onSelectRecommendation,
}) => {
  const recommendations = deriveRecommendations(sessions, dueReviews);

  return (
    <section aria-labelledby="lumo-rec-heading" style={{ paddingTop: 'var(--space-2)' }}>
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
          id="lumo-rec-heading"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          Suggested Next Steps
        </h3>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }} className="lumo-rec-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Skeleton width="60px" height="12px" />
              <Skeleton width="85%" height="20px" />
              <Skeleton width="100%" height="14px" />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-8)',
          }}
          className="lumo-rec-grid"
        >
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectRecommendation(rec.topic, rec.subject)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                padding: '16px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all var(--motion-fast) var(--ease-standard)',
              }}
              role="button"
              tabIndex={0}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectRecommendation(rec.topic, rec.subject);
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-orange)',
                    background: 'var(--color-orange-soft)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {rec.subject}
                </span>
                <span>~{rec.estimatedMinutes} min</span>
              </div>

              <h4
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {rec.topic}
              </h4>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                {rec.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .lumo-rec-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-6) !important;
          }
        }
      `}</style>
    </section>
  );
};
