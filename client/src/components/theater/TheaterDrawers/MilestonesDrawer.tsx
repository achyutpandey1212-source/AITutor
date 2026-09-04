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
        background: 'rgba(11, 14, 20, 0.96)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--theater-shadow-drawer)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'theaterSlideInRight 0.25s var(--theater-ease-out)',
        color: '#FFFFFF',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <IconNotes size={18} style={{ color: 'var(--theater-accent)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
              Session Milestones
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#7E8695' }}>
              Concepts mastered & replay history
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8C96A5',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8C96A5')}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {loading ? (
          <div style={{ color: '#7E8695', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            Loading milestones...
          </div>
        ) : !memory || memory.segments.length === 0 ? (
          <div style={{ color: '#7E8695', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            <p>No teaching segments recorded yet.</p>
            <p style={{ fontSize: '0.78rem', color: '#4B5260' }}>
              As Lumo teaches concepts, your progress and replay points will appear here.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#60A5FA',
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
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontWeight: 500,
                    }}
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#7E8695',
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
                        background: 'rgba(255, 255, 255, 0.025)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#7E8695', fontWeight: 600 }}>{time}</span>
                        <button
                          onClick={() => {
                            onClose();
                            onReplaySegment(seg.segmentId);
                          }}
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            color: '#60A5FA',
                            borderRadius: '6px',
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          ↻ Replay
                        </button>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>
                        {seg.title || seg.concept}
                      </div>

                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#B4BAC5', lineHeight: 1.4 }}>
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
