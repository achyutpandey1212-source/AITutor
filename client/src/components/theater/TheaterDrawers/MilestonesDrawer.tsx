import React, { useEffect, useState } from 'react';
import type { SessionMemory, ReplaySegment } from '@ai-tutor/shared';
import { IconNotes } from '../TheaterIcons';

export interface MilestonesDrawerProps {
  sessionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReplaySegment: (segmentId: string) => void;
  idToken?: string;
  activeConcept?: string;
}

export const MilestonesDrawer: React.FC<MilestonesDrawerProps> = ({
  sessionId,
  isOpen,
  onClose,
  onReplaySegment,
  idToken,
  activeConcept,
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
      .catch((err) => console.warn('[MilestonesTimeline] Failed to load memory:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, sessionId, idToken]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session Timeline and Replay Navigation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(0, 0, 0, 0.32)',
        backdropFilter: 'blur(3px)',
        animation: 'theaterOverlayFadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 'min(680px, 94vw)',
          maxHeight: 'min(660px, 84vh)',
          background: 'var(--theater-surface)',
          borderRadius: 'var(--theater-radius-xl)',
          border: '1px solid var(--theater-border-medium)',
          boxShadow: 'var(--theater-shadow-stage)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--theater-font-sans)',
        }}
      >
        {/* Workspace Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.35rem',
            borderBottom: '1px solid var(--theater-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconNotes size={16} style={{ color: 'var(--theater-text-primary)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
                  Session Timeline
                </h3>
                {memory?.conceptsCovered && memory.conceptsCovered.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--theater-text-secondary)',
                      background: 'var(--theater-surface-elevated)',
                      border: '1px solid var(--theater-border-subtle)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--theater-radius-xs)',
                      fontWeight: 550,
                    }}
                  >
                    {memory.conceptsCovered.length} mastered
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)' }}>
                Chronological moments & replay points
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--theater-border-subtle)',
              borderRadius: 'var(--theater-radius-xs)',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theater-text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
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
            title="Close timeline (Esc)"
            aria-label="Close timeline"
          >
            ✕
          </button>
        </div>

        {/* Timeline Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {loading ? (
            <div style={{ color: 'var(--theater-text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '3rem 1rem' }}>
              Loading session timeline...
            </div>
          ) : !memory || memory.segments.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem 1.5rem',
                color: 'var(--theater-text-muted)',
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 550, color: 'var(--theater-text-primary)', marginBottom: '0.4rem' }}>
                Timeline will unfold here
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', maxWidth: '380px', lineHeight: 1.5, color: 'var(--theater-text-muted)' }}>
                As Lumo guides you through concepts, diagrams, and explanations, chronological milestone markers will be recorded here for instant replay.
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Continuous vertical hairline timeline line */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  bottom: '24px',
                  left: '60px',
                  width: '1px',
                  background: 'var(--theater-border-subtle)',
                  zIndex: 1,
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {memory.segments.map((seg: ReplaySegment, idx) => {
                  const date = new Date(seg.createdAt);
                  const timeLabel = !isNaN(date.getTime())
                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : `0${idx}:00`;
                  const isCurrent = activeConcept && (seg.concept === activeConcept || seg.title === activeConcept);

                  return (
                    <div
                      key={seg.segmentId}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {/* Left: Timestamp */}
                      <span
                        style={{
                          width: '46px',
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          color: 'var(--theater-text-muted)',
                          textAlign: 'right',
                          paddingTop: '0.2rem',
                          flexShrink: 0,
                        }}
                      >
                        {timeLabel}
                      </span>

                      {/* Center Node Indicator */}
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: isCurrent ? 'var(--theater-text-primary)' : 'var(--theater-surface-elevated)',
                          border: isCurrent ? '2px solid var(--theater-bg)' : '2px solid var(--theater-border-strong)',
                          marginTop: '0.28rem',
                          flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 2px var(--theater-text-primary)' : 'none',
                        }}
                      />

                      {/* Right: Milestone Card */}
                      <div
                        style={{
                          flex: 1,
                          padding: '0.75rem 1rem',
                          background: isCurrent
                            ? 'var(--theater-surface-elevated)'
                            : 'var(--theater-surface-sunken)',
                          borderRadius: 'var(--theater-radius-md)',
                          border: isCurrent
                            ? '1px solid var(--theater-border-strong)'
                            : '1px solid var(--theater-border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          transition: 'all var(--theater-transition-fast)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--theater-text-primary)' }}>
                              {seg.title || seg.concept}
                            </span>
                            {isCurrent && (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  color: 'var(--theater-text-secondary)',
                                  background: 'var(--theater-surface)',
                                  border: '1px solid var(--theater-border-subtle)',
                                  borderRadius: 'var(--theater-radius-xs)',
                                  padding: '0.05rem 0.35rem',
                                  fontWeight: 500,
                                }}
                              >
                                Active Moment
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              onReplaySegment(seg.segmentId);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              background: 'var(--theater-surface)',
                              border: '1px solid var(--theater-border-subtle)',
                              color: 'var(--theater-text-secondary)',
                              borderRadius: 'var(--theater-radius-xs)',
                              padding: '0.2rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 550,
                              cursor: 'pointer',
                              fontFamily: 'var(--theater-font-sans)',
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
                            title="Replay this teaching moment"
                          >
                            <span>↻ Replay</span>
                          </button>
                        </div>

                        {seg.displayText && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.78rem',
                              color: 'var(--theater-text-muted)',
                              lineHeight: 1.45,
                            }}
                          >
                            {seg.displayText.length > 130
                              ? `${seg.displayText.slice(0, 130)}...`
                              : seg.displayText}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
