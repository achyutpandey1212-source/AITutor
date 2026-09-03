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
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#0f172a' }}>Analytics</h1>
        <button
          onClick={() => onNavigate('/dashboard')}
          style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          &larr; Dashboard
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Computing analytics...</p>
      ) : !analytics ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b' }}>
          No analytics data recorded yet. Start practicing to generate insights!
        </div>
      ) : (
        <div>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Accuracy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: analytics.overallAccuracy >= 75 ? '#16a34a' : '#ea580c' }}>
                {analytics.overallAccuracy}%
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Questions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                {analytics.totalQuestions}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Average Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                {analytics.averageScore}/5
              </div>
            </div>
          </div>

          {/* Strongest & Needs Practice */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginBottom: '0.5rem' }}>Concept Mastery</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(analytics.byConcept).map(([conceptName, cData]) => (
                <div
                  key={conceptName}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{conceptName}</span>
                  <span style={{ color: '#64748b' }}>
                    Accuracy: <strong>{cData.accuracy}%</strong> | Mastery: <strong>{Math.round(cData.mastery * 100)}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes Detected */}
          {analytics.commonMisconceptions.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginBottom: '0.5rem' }}>Common Mistakes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analytics.commonMisconceptions.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', color: '#991b1b' }}
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
