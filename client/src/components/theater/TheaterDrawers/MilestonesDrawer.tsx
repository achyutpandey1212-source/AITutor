import React, { useEffect, useState } from 'react';
import type { SessionMemory, ReplaySegment } from '@ai-tutor/shared';
import { IconNotes } from '../TheaterIcons';

export interface MilestonesDrawerProps {
  sessionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReplaySegment: (segmentId: string) => void;
  idToken?: string;
}

export const MilestonesDrawer: React.FC<MilestonesDrawerProps> = ({
  sessionId,
  isOpen,
  onClose,
  onReplaySegment,
  idToken,
}) => {
  const [memory, setMemory] = useState<SessionMemory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !sessionId) return;
    let mounted = true;
    setLoading(true);

    const token = idToken || localStorage.getItem('token') || '';
    fetch(`/api/teaching/sessions/${sessionId}/memory`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success && data.data) {
          setMemory(data.data);
        }
      })
      .catch((err) => console.warn('[MilestonesDrawer] Failed to load memory:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, sessionId, idToken]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Session Milestones"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'min(380px, 90vw)',
        height: '100vh',
        background: 'var(--theater-surface)',
        borderLeft: '1px solid var(--theater-border-medium)',
        boxShadow: 'var(--theater-shadow-stage)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'theaterSlideInRight 0.25s var(--theater-ease)',
        color: 'var(--theater-text-primary)',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--theater-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <IconNotes size={18} style={{ color: 'var(--theater-text-primary)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
              Session Milestones
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--theater-text-muted)' }}>
              Concepts mastered & replay history
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid var(--theater-border-subtle)',
            borderRadius: 'var(--theater-radius-sm)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theater-text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all var(--theater-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-primary)';
            e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-muted)';
            e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {loading ? (
          <div style={{ color: 'var(--theater-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            Loading milestones...
          </div>
        ) : !memory || memory.segments.length === 0 ? (
          <div style={{ color: 'var(--theater-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            <p>No teaching segments recorded yet.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--theater-text-faint)' }}>
              As Lumo teaches concepts, your progress and replay points will appear here.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--theater-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Concepts Covered ({memory.conceptsCovered.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {memory.conceptsCovered.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.75rem',
                      background: 'var(--theater-surface-elevated)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--theater-radius-sm)',
                      color: 'var(--theater-text-primary)',
                      border: '1px solid var(--theater-border-subtle)',
                      fontWeight: 500,
                    }}
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--theater-border-subtle)', paddingTop: '1rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--theater-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Timeline & Replay Points
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem' }}>
                {memory.segments.map((seg: ReplaySegment) => {
                  const time = new Date(seg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={seg.segmentId}
                      style={{
                        padding: '0.85rem',
                        background: 'var(--theater-surface-sunken)',
                        borderRadius: 'var(--theater-radius-md)',
                        border: '1px solid var(--theater-border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)', fontWeight: 550 }}>{time}</span>
                        <button
                          onClick={() => {
                            onClose();
                            onReplaySegment(seg.segmentId);
                          }}
                          style={{
                            background: 'var(--theater-surface-elevated)',
                            border: '1px solid var(--theater-border-subtle)',
                            color: 'var(--theater-text-secondary)',
                            borderRadius: 'var(--theater-radius-xs)',
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.72rem',
                            fontWeight: 550,
                            cursor: 'pointer',
                            transition: 'all var(--theater-transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--theater-text-primary)';
                            e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--theater-text-secondary)';
                            e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                          }}
                        >
                          ↻ Replay
                        </button>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--theater-text-primary)' }}>
                        {seg.title || seg.concept}
                      </div>

                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--theater-text-muted)', lineHeight: 1.4 }}>
                        {seg.displayText.length > 90
                          ? `${seg.displayText.slice(0, 90)}...`
                          : seg.displayText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
