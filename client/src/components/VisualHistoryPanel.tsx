import React, { useEffect, useState } from 'react';
import type { VisualTimelineEntry } from '@ai-tutor/shared';

export interface VisualHistoryPanelProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onReplaySegment: (visualId: string) => void;
  apiBaseUrl?: string;
}

export const VisualHistoryPanel: React.FC<VisualHistoryPanelProps> = ({
  sessionId,
  isOpen,
  onClose,
  onReplaySegment,
  apiBaseUrl = '',
}) => {
  const [timeline, setTimeline] = useState<VisualTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !sessionId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token') || '';
    fetch(`${apiBaseUrl}/api/teaching/sessions/${sessionId}/visual-timeline`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          if (data.success && data.data?.entries) {
            setTimeline(data.data.entries);
          } else {
            setTimeline([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load timeline');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, sessionId, apiBaseUrl]);

  if (!isOpen) return null;

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'ILLUSTRATION':
        return '🖼';
      case 'DIAGRAM':
        return '◇';
      case 'FORMULA':
        return 'ƒ';
      case 'WORKED_EXAMPLE':
        return '✓';
      case 'FLOWCHART':
        return '⮀';
      case 'COMPARISON':
        return '⇄';
      case 'PROCESS_ANIMATION':
        return '▶';
      case 'HIGHLIGHT':
        return '✦';
      case 'RECAP':
        return '↻';
      case 'PDF_ASSET':
        return '📄';
      default:
        return '▪';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '320px',
        height: '100%',
        backgroundColor: 'rgba(11, 17, 32, 0.95)',
        borderLeft: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.5)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f8fafc',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🎞</span>
          <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em' }}>
            Visual Session Timeline
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
          title="Close timeline"
        >
          ✕
        </button>
      </div>

      {/* Timeline List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px' }}>
            Loading session visual history...
          </div>
        )}

        {error && (
          <div style={{ color: '#f87171', fontSize: '12px', padding: '10px' }}>
            {error}
          </div>
        )}

        {!loading && timeline.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '30px' }}>
            No visual segments recorded yet.
            <div style={{ fontSize: '11px', marginTop: '6px' }}>
              Visual beats will appear here as the teacher explains concepts.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {timeline.map((entry, idx) => {
            const timeLabel = new Date(entry.startedAt).toLocaleTimeString([], {
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={entry.visualId || idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.65)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{timeLabel}</span>
                    <span style={{ fontSize: '12px' }}>{getStrategyIcon(entry.strategy)}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: '#38bdf8',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {entry.strategy.replace('_', ' ')}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#f1f5f9',
                      maxWidth: '180px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {entry.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    {entry.beatCount} visual beat{entry.beatCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <button
                  onClick={() => onReplaySegment(entry.visualId)}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                  }}
                >
                  <span>Replay</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
