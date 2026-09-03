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
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#0f172a' }}>My Mistakes & Due Reviews</h1>
        <button
          onClick={() => onNavigate('/dashboard')}
          style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          &larr; Dashboard
        </button>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Missed questions are scheduled for spaced repetition review (3 days, then 7 days) until mastered.
      </p>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading mistake tracker...</p>
      ) : (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.75rem' }}>
            Due for Review ({dueReviews.length})
          </h3>

          {dueReviews.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', marginBottom: '2rem' }}>
              🎉 No questions due for review right now!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {dueReviews.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem',
                    background: '#fffbeb',
                    border: '1px solid #fed7aa',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 600, marginBottom: '0.2rem' }}>
                      {item.subject} • {item.concept} (Attempt #{item.attemptCount})
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {item.question?.question || `Question ID: ${item.questionId}`}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('/practice')}
                    style={{
                      padding: '0.45rem 1rem',
                      background: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Reattempt Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {allWrong.length > dueReviews.length && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.75rem' }}>
                All Tracked Mistakes ({allWrong.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {allWrong.map((item) => (
                  <div
                    key={item.id}
                    style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <div style={{ fontWeight: 600, color: '#334155' }}>{item.concept}</div>
                    <div style={{ color: '#64748b', marginTop: '0.2rem' }}>
                      Status: <strong>{item.reviewStatus}</strong> | Attempted: {item.attemptCount} time{item.attemptCount === 1 ? '' : 's'}
                    </div>
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
