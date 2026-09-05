import React, { useEffect, useRef, useState } from 'react';
import type { TutorSessionContext } from '@ai-tutor/shared';
import { IconTranscript } from '../TheaterIcons';

export type ConversationTurn = TutorSessionContext['conversationHistory'][number];

export interface TranscriptDrawerProps {
  conversationHistory?: ConversationTurn[];
  isOpen: boolean;
  onClose: () => void;
}

export const TranscriptDrawer: React.FC<TranscriptDrawerProps> = ({
  conversationHistory = [],
  isOpen,
  onClose,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Smart auto-scroll: only follows bottom if the user hasn't manually scrolled up
  useEffect(() => {
    if (isOpen && !isUserScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, conversationHistory.length, isUserScrolledUp]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 65;
    setIsUserScrolledUp(!isNearBottom);
  };

  const handleJumpToLatest = () => {
    setIsUserScrolledUp(false);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredHistory = searchQuery.trim()
    ? conversationHistory.filter((turn) =>
        turn.text.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : conversationHistory;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conversation History Workspace"
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
          width: 'min(640px, 94vw)',
          height: 'min(700px, 84vh)',
          background: 'var(--theater-surface)',
          borderRadius: 'var(--theater-radius-xl)',
          border: '1px solid var(--theater-border-medium)',
          boxShadow: 'var(--theater-shadow-stage)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--theater-font-sans)',
          position: 'relative',
        }}
      >
        {/* Workspace Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.95rem 1.35rem',
            borderBottom: '1px solid var(--theater-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconTranscript size={16} style={{ color: 'var(--theater-text-primary)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
                  Conversation History
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--theater-text-secondary)',
                    background: 'var(--theater-surface-elevated)',
                    border: '1px solid var(--theater-border-subtle)',
                    padding: '0.08rem 0.45rem',
                    borderRadius: 'var(--theater-radius-xs)',
                    fontWeight: 500,
                  }}
                >
                  {conversationHistory.length} turns
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)' }}>
                Full dialogue & teaching transcript
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Search Filter */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversation..."
              style={{
                background: 'var(--theater-surface-sunken)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-xs)',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                color: 'var(--theater-text-primary)',
                outline: 'none',
                width: '140px',
                fontFamily: 'var(--theater-font-sans)',
              }}
            />

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
              title="Close transcript (Esc)"
              aria-label="Close transcript"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {filteredHistory.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'var(--theater-text-muted)',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 500, color: 'var(--theater-text-primary)' }}>
                {searchQuery ? 'No matching dialogue found.' : 'No conversation recorded yet.'}
              </p>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.76rem', color: 'var(--theater-text-faint)' }}>
                {searchQuery
                  ? 'Try a different keyword or clear the search filter.'
                  : 'Speak or type to begin dialogue with your live AI tutor.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((turn, index) => {
              const isStudent = turn.role === 'student';
              const isAssessment = turn.type === 'assessment';

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--theater-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: isStudent ? 'var(--theater-text-muted)' : 'var(--theater-text-primary)',
                      }}
                    >
                      {isStudent ? 'You' : 'Lumo'}
                    </span>
                    {isAssessment && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          background: 'var(--theater-surface-elevated)',
                          border: '1px solid var(--theater-border-subtle)',
                          padding: '0.05rem 0.35rem',
                          borderRadius: 'var(--theater-radius-xs)',
                          color: 'var(--theater-text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        Checkpoint
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '0.84rem',
                      lineHeight: 1.55,
                      color: isStudent ? 'var(--theater-text-secondary)' : 'var(--theater-text-primary)',
                      fontFamily: 'var(--theater-font-sans)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {turn.text}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* Floating "Jump to latest" pill if scrolled up */}
        {isUserScrolledUp && (
          <button
            onClick={handleJumpToLatest}
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--theater-surface-elevated)',
              border: '1px solid var(--theater-border-medium)',
              boxShadow: 'var(--theater-shadow-dock)',
              borderRadius: 'var(--theater-radius-full)',
              color: 'var(--theater-text-primary)',
              padding: '0.3rem 0.85rem',
              fontSize: '0.74rem',
              fontWeight: 550,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all var(--theater-transition-fast)',
              zIndex: 10,
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            <span>↓ Jump to latest</span>
          </button>
        )}
      </div>
    </div>
  );
};
