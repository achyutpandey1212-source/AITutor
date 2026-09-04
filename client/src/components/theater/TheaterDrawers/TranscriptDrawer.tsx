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
          <IconTranscript size={18} style={{ color: 'var(--theater-accent)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
              Conversation Transcript
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#7E8695' }}>
              Full dialogue & explanations
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
          <div style={{ color: '#7E8695', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            <p>No messages yet.</p>
            <p style={{ fontSize: '0.78rem', color: '#4B5260' }}>
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
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                    color: isStudent ? '#60A5FA' : isAssessment ? '#F5C542' : '#B4BAC5',
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
                        background: 'rgba(245, 185, 66, 0.15)',
                        color: '#F5C542',
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
                      ? 'rgba(59, 130, 246, 0.12)'
                      : isAssessment
                      ? 'rgba(245, 185, 66, 0.08)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isStudent
                      ? '1px solid rgba(59, 130, 246, 0.25)'
                      : isAssessment
                      ? '1px solid rgba(245, 185, 66, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    color: '#FFFFFF',
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
