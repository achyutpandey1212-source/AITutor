import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, conversationHistory.length]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Conversation Transcript"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'min(420px, 92vw)',
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
          <IconTranscript size={18} style={{ color: 'var(--theater-text-primary)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
              Conversation Transcript
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--theater-text-muted)' }}>
              Full dialogue & explanations
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
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {conversationHistory.length === 0 ? (
          <div style={{ color: 'var(--theater-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            <p>No messages yet.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--theater-text-faint)' }}>
              Speak or type to begin talking with your tutor.
            </p>
          </div>
        ) : (
          conversationHistory.map((turn, index) => {
            const isStudent = turn.role === 'student';
            const isAssessment = turn.type === 'assessment';

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: isStudent ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {/* Speaker Label */}
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    color: isStudent ? 'var(--theater-text-secondary)' : 'var(--theater-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    alignSelf: isStudent ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span>{isStudent ? 'You' : 'Lumo'}</span>
                  {isAssessment && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        background: 'var(--theater-surface-elevated)',
                        color: 'var(--theater-text-primary)',
                        border: '1px solid var(--theater-border-subtle)',
                        padding: '0.05rem 0.35rem',
                        borderRadius: '3px',
                      }}
                    >
                      Check
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    padding: '0.7rem 1rem',
                    borderRadius: isStudent ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isStudent
                      ? 'var(--theater-surface-elevated)'
                      : 'var(--theater-surface-sunken)',
                    border: isStudent
                      ? '1px solid var(--theater-border-medium)'
                      : '1px solid var(--theater-border-subtle)',
                    color: 'var(--theater-text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.45,
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
    </aside>
  );
};
