import React, { useEffect, useState } from 'react';
import type { SessionMemory, ReplaySegment } from '@ai-tutor/shared';

export interface SessionTimelineProps {
  sessionId: string;
  onReplaySegment: (segmentId: string) => void;
  apiBaseUrl?: string;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  sessionId,
  onReplaySegment,
  apiBaseUrl = '',
}) => {
  const [memory, setMemory] = useState<SessionMemory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    setLoading(true);

    const token = localStorage.getItem('token') || '';
    fetch(`${apiBaseUrl}/api/teaching/sessions/${sessionId}/memory`, {
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
      .catch((err) => console.warn('[SessionTimeline] Failed to load memory:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [sessionId, apiBaseUrl]);

  if (loading) {
    return <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '0.5rem' }}>Loading session timeline...</div>;
  }

  if (!memory || memory.segments.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.5rem' }}>
        No teaching segments recorded yet. Start learning to build session memory!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
        Session Concepts: {memory.conceptsCovered.join(' • ')}
      </div>

      <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '0.75rem', paddingLeft: '1rem' }}>
        {memory.segments.map((seg: ReplaySegment) => {
          const time = new Date(seg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={seg.segmentId} style={{ marginBottom: '1rem', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-1.45rem',
                  top: '0.2rem',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  border: '2px solid #ffffff',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{time}</span>
                  <h4 style={{ margin: '0.1rem 0', fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                    {seg.title || seg.concept}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>
                    {seg.displayText.length > 90 ? `${seg.displayText.slice(0, 90)}...` : seg.displayText}
                  </p>
                </div>
                <button
                  onClick={() => onReplaySegment(seg.segmentId)}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ▶ Replay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
