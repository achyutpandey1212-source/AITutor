import React, { useEffect, useState } from 'react';
import type { WrongAssessmentQuestion } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface MistakesPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
}

export const MistakesPage: React.FC<MistakesPageProps> = ({ idToken, onNavigate }) => {
  const [dueReviews, setDueReviews] = useState<WrongAssessmentQuestion[]>([]);
  const [allWrong, setAllWrong] = useState<WrongAssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [due, all] = await Promise.all([
        liveTutorApiClient.getDueReviews(idToken),
        liveTutorApiClient.getWrongQuestions(idToken),
      ]);
      setDueReviews(due);
      setAllWrong(all);
    } catch {
      setDueReviews([]);
      setAllWrong([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idToken) loadData();
  }, [idToken]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 var(--space-6)', fontFamily: 'var(--font-family-base)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 4px', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: '-0.025em' }}>
            My Mistakes & Spaced Repetition
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Missed questions are scheduled for spaced repetition review (3 days, then 7 days) until mastered.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/dashboard')}
          style={{
            padding: '6px 14px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          &larr; Dashboard
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading mistake tracker...</p>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '0.85rem' }}>
            Due for Review ({dueReviews.length})
          </h3>

          {dueReviews.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: 'var(--radius-lg)', color: '#4ade80', marginBottom: '2rem', fontSize: '14px' }}>
              🎉 No questions due for review right now!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {dueReviews.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1.1rem 1.25rem',
                    background: 'rgba(234, 88, 12, 0.06)',
                    border: '1px solid rgba(234, 88, 12, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fb923c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                      {item.subject} • {item.concept} (Attempt #{item.attemptCount})
                    </div>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                      {item.question?.question || `Question ID: ${item.questionId}`}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(`/practice?questionId=${item.questionId}`)}
                    style={{
                      padding: '0.45rem 1rem',
                      background: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Review Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {allWrong.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '0.85rem' }}>
                All Tracked Mistakes ({allWrong.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {allWrong.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '0.85rem 1.15rem',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {item.question?.question || `${item.subject} • ${item.concept}`}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '0.25rem' }}>
                        Status: <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{item.reviewStatus}</span> | Attempted: {item.attemptCount} time{item.attemptCount === 1 ? '' : 's'}
                        {item.nextReviewAt && ` | Scheduled: ${new Date(item.nextReviewAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(`/practice?questionId=${item.questionId}`)}
                      style={{
                        padding: '0.35rem 0.8rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
