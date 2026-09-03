import React, { useEffect, useState } from 'react';
import type { AssessmentBookmark } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';

export interface BookmarksPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ idToken, onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<AssessmentBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await liveTutorApiClient.getBookmarks(idToken);
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idToken) loadBookmarks();
  }, [idToken]);

  const handleRemove = async (questionId: string) => {
    try {
      await liveTutorApiClient.unbookmarkQuestion(idToken, questionId);
      setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#0f172a' }}>Saved Questions</h1>
        <button
          onClick={() => onNavigate('/dashboard')}
          style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          &larr; Dashboard
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading saved questions...</p>
      ) : bookmarks.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b' }}>
          No saved questions yet. When practicing, click <strong>Save Question</strong> to review it later!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookmarks.map((bmk) => (
            <div
              key={bmk.id}
              style={{
                padding: '1rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  {bmk.question?.subject || 'Subject'} • {bmk.question?.concept} • {bmk.question?.difficulty?.toUpperCase()}
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {bmk.question?.question || `Question ID: ${bmk.questionId}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onNavigate('/practice')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Practice
                </button>
                <button
                  onClick={() => handleRemove(bmk.questionId)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
