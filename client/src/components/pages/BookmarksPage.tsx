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
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 var(--space-6)', fontFamily: 'var(--font-family-base)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 4px', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Saved Questions
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Questions you flagged during practice sessions for quick recall.
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
            transition: 'all 0.15s ease',
          }}
        >
          &larr; Dashboard
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading saved questions...</p>
      ) : bookmarks.length === 0 ? (
        <div
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
          }}
        >
          No saved questions yet. When practicing, click <strong>Save Question</strong> to review it later!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookmarks.map((bmk) => (
            <div
              key={bmk.id}
              style={{
                padding: '16px 20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--color-orange)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {bmk.question?.subject || 'Subject'} • {bmk.question?.concept} • {bmk.question?.difficulty?.toUpperCase()}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14.5px', lineHeight: 1.45 }}>
                  {bmk.question?.question || `Question ID: ${bmk.questionId}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onNavigate(`/practice?questionId=${bmk.questionId}`)}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--color-orange)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '12.5px',
                  }}
                >
                  Practice This Question
                </button>
                <button
                  onClick={() => handleRemove(bmk.questionId)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--color-surface-soft)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '12.5px',
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
