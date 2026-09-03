import React, { useEffect, useState } from 'react';
import type { User as AppUser, WrongAssessmentQuestion } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface DashboardPageProps {
  user: AppUser | null;
  idToken: string;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  idToken,
  onNavigate,
  onSignOut,
}) => {
  const [dueReviews, setDueReviews] = useState<WrongAssessmentQuestion[]>([]);

  useEffect(() => {
    if (idToken) {
      liveTutorApiClient
        .getDueReviews(idToken)
        .then(setDueReviews)
        .catch(() => setDueReviews([]));
    }
  }, [idToken]);

  const studentName = user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '1.5rem' }}>
        Welcome, <strong>{studentName}</strong>
      </p>

      {/* Spaced Review Due Notification */}
      {dueReviews.length > 0 && (
        <div
          style={{
            padding: '1rem',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#92400e' }}>Reviews Due: {dueReviews.length}</div>
            <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
              Spaced repetition questions ready for reattempt.
            </div>
          </div>
          <button
            onClick={() => onNavigate('/mistakes')}
            style={{
              padding: '0.5rem 1rem',
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Practice Due Questions
          </button>
        </div>
      )}

      {/* Main Navigation Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => onNavigate('/tutor')}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 700,
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>🎙️ Start Tutor</span>
          <span>&rarr;</span>
        </button>

        <button
          onClick={() => onNavigate('/practice')}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 600,
            background: '#f8fafc',
            color: '#1e293b',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>📝 Practice & Assessments</span>
          <span>&rarr;</span>
        </button>

        <button
          onClick={() => onNavigate('/bookmarks')}
          style={{
            padding: '0.85rem 1rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>🔖 Saved Questions</span>
          <span>&rarr;</span>
        </button>

        <button
          onClick={() => onNavigate('/mistakes')}
          style={{
            padding: '0.85rem 1rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ My Mistakes & Due Reviews</span>
          <span>&rarr;</span>
        </button>

        <button
          onClick={() => onNavigate('/analytics')}
          style={{
            padding: '0.85rem 1rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>📊 Analytics</span>
          <span>&rarr;</span>
        </button>

        <button
          onClick={() => onNavigate('/documents')}
          style={{
            padding: '0.85rem 1rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>📚 Study Knowledge (RAG Documents)</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <button
          onClick={onSignOut}
          style={{
            padding: '0.5rem 1rem',
            background: '#fee2e2',
            color: '#991b1b',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
