import React, { useEffect, useState } from 'react';
import type { AssessmentAnalytics } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface AnalyticsPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ idToken, onNavigate }) => {
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idToken) {
      liveTutorApiClient
        .getAssessmentAnalytics(idToken)
        .then(setAnalytics)
        .catch(() => setAnalytics(null))
        .finally(() => setLoading(false));
    }
  }, [idToken]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 var(--space-6)', fontFamily: 'var(--font-family-base)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 4px', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Performance Analytics
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Real-time understanding metrics and mastery levels across subjects.
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
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Computing analytics...</p>
      ) : !analytics ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', color: 'var(--color-text-muted)' }}>
          No analytics data recorded yet. Start practicing to generate insights!
        </div>
      ) : (
        <div>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Accuracy</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: analytics.overallAccuracy >= 75 ? '#4ade80' : '#fb923c' }}>
                {analytics.overallAccuracy}%
              </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Questions</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-text-primary)' }}>
                {analytics.totalQuestions}
              </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-primary)' }}>
                {analytics.averageScore}/5
              </div>
            </div>
          </div>

          {/* Strongest & Needs Practice */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '0.85rem' }}>Concept Mastery</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(analytics.byConcept).map(([conceptName, cData]) => (
                <div
                  key={conceptName}
                  style={{
                    padding: '0.85rem 1.15rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{conceptName}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    Accuracy: <strong style={{ color: 'var(--color-text-secondary)' }}>{cData.accuracy}%</strong> | Mastery: <strong style={{ color: 'var(--color-text-secondary)' }}>{Math.round(cData.mastery * 100)}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes Detected */}
          {analytics.commonMisconceptions.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '0.85rem' }}>Common Misconceptions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analytics.commonMisconceptions.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ padding: '0.85rem 1.15rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#f87171' }}
                  >
                    <strong>{item.misconception}</strong> ({item.count} instance{item.count === 1 ? '' : 's'})
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
