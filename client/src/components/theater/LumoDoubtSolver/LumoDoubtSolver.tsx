import React, { useState, useRef, useEffect } from 'react';
import { liveTutorApiClient, type LumoModelTier, type AIChatMessage } from '../../../services/api.service';
import { speechToTextService } from '../../../services/stt.service';
import { IconSparkles, IconMic, IconArrowRight } from '../TheaterIcons';

export interface LumoDoubtSolverProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  topic: string;
  concept: string;
  documentTitle?: string;
  idToken: string | null;
  sessionId?: string;
}

interface DoubtMessage {
  id: string;
  sender: 'student' | 'lumo';
  text: string;
  timestamp: string;
  tier?: LumoModelTier;
}

export const LumoDoubtSolver: React.FC<LumoDoubtSolverProps> = ({
  isOpen,
  onClose,
  subject,
  topic,
  concept,
  documentTitle,
  idToken,
  sessionId: _sessionId,
}) => {
  const [selectedTier, setSelectedTier] = useState<LumoModelTier>('light');
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [messages, setMessages] = useState<DoubtMessage[]>([
    {
      id: 'welcome',
      sender: 'lumo',
      text: `Hello! I'm right here. Ask me anything privately about ${concept} or any doubts you'd like clarified without interrupting the lesson.`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    const query = inputQuery.trim();
    if (!query || isLoading) return;

    const studentMsg: DoubtMessage = {
      id: `student-${Date.now()}`,
      sender: 'student',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      let answerText = '';
      if (idToken) {
        // Build conversation history for genuine multi-turn context
        const historyForApi: AIChatMessage[] = messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: m.sender === 'student' ? ('user' as const) : ('assistant' as const),
            content: m.text,
          }));

        // Directly reaches /api/ai/chat and maps modelTier on the backend
        const response = await liveTutorApiClient.sendAIChat(idToken, {
          message: query,
          modelTier: selectedTier,
          history: historyForApi,
          context: {
            subject,
            topic,
            concept,
            documentTitle,
          },
        });
        answerText = response.text;
      } else {
        // Thoughtful pedagogical response fallback when dev unauthenticated
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (selectedTier === 'fast') {
          answerText = `In ${topic} (${concept}), regarding "${query}": A net external force causes acceleration proportional to the force and inversely proportional to mass (F = ma).`;
        } else if (selectedTier === 'pro') {
          answerText = `Analytical breakdown for "${query}" in ${topic} (${concept}):\n1. Foundational Principle: Acceleration only occurs when the vector sum of forces (ΣF) is non-zero.\n2. Dynamical Equation: a = ΣF / m.\n3. Application: Doubling net force yields twice the acceleration, assuming mass is invariant.`;
        } else {
          answerText = `Regarding ${concept}: When considering "${query}", remember the foundational relationship in ${topic}. Net force and acceleration are directly proportional; without net force, motion remains uniform.`;
        }
      }

      const lumoMsg: DoubtMessage = {
        id: `lumo-${Date.now()}`,
        sender: 'lumo',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tier: selectedTier,
      };
      setMessages((prev) => [...prev, lumoMsg]);
    } catch (err: any) {
      const errorMsg: DoubtMessage = {
        id: `err-${Date.now()}`,
        sender: 'lumo',
        text: `I encountered an issue analyzing your doubt on ${concept}: ${err?.message || 'Could not fetch response. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (!speechToTextService.isSupported()) return;

    if (isListeningMic) {
      speechToTextService.stop();
      setIsListeningMic(false);
    } else {
      setIsListeningMic(true);
      speechToTextService.start({
        onSpeechTurnDetected: (text: string) => {
          setInputQuery((prev) => (prev ? `${prev} ${text}` : text));
          setIsListeningMic(false);
        },
        onError: () => {
          setIsListeningMic(false);
        },
        onStateChange: (listening: boolean) => {
          setIsListeningMic(listening);
        },
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: isExpanded ? 'center' : 'flex-end',
        justifyContent: isExpanded ? 'center' : 'flex-end',
        padding: isExpanded ? '1rem' : '0 2rem 6.5rem 0',
        pointerEvents: 'none',
        background: isExpanded ? 'rgba(0, 0, 0, 0.65)' : 'transparent',
        backdropFilter: isExpanded ? 'blur(8px)' : 'none',
        transition: 'all 0.25s var(--theater-ease-out)',
      }}
    >
      <aside
        aria-label="Lumo AI Doubt Solver"
        style={{
          pointerEvents: 'auto',
          width: isExpanded ? 'min(760px, 94vw)' : 'min(420px, 92vw)',
          height: isExpanded ? 'min(640px, 82vh)' : 'min(490px, 68vh)',
          background: 'var(--theater-surface)',
          borderRadius: 'var(--theater-radius-xl)',
          border: '1px solid var(--theater-border-medium)',
          boxShadow: 'var(--theater-shadow-stage)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'theaterModalFadeIn 0.2s var(--theater-ease)',
          fontFamily: 'var(--theater-font-sans)',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.15rem',
            borderBottom: '1px solid var(--theater-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconSparkles size={16} style={{ color: 'var(--theater-text-primary)' }} />
            <div>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
                Ask Lumo Privately
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--theater-text-muted)' }}>
                  {subject} › {concept}
                </span>
                {documentTitle && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--theater-text-secondary)',
                      background: 'var(--theater-surface-elevated)',
                      border: '1px solid var(--theater-border-subtle)',
                      padding: '0.05rem 0.35rem',
                      borderRadius: 'var(--theater-radius-xs)',
                    }}
                  >
                    📎 {documentTitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Expand / Shrink */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--theater-text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '0.3rem',
                borderRadius: 'var(--theater-radius-xs)',
                transition: 'color var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
              title={isExpanded ? 'Collapse to compact mode' : 'Expand workspace'}
            >
              {isExpanded ? '⤡' : '⤢'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--theater-text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '0.3rem',
                borderRadius: 'var(--theater-radius-xs)',
                transition: 'color var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
              title="Close doubt solver"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Lumo Model Tier Segmented Switcher (Restrained Tonal Contrast) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 1.15rem',
            background: 'var(--theater-surface-elevated)',
            borderBottom: '1px solid var(--theater-border-subtle)',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--theater-text-muted)',
              fontWeight: 500,
              fontFamily: 'var(--theater-font-sans)',
              letterSpacing: '0.01em',
            }}
          >
            Lumo model
          </span>
          <div
            role="radiogroup"
            aria-label="Lumo model selection"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              background: 'var(--theater-surface)',
              padding: '2px',
              borderRadius: 'var(--theater-radius-sm)',
              border: '1px solid var(--theater-border-subtle)',
            }}
          >
            {(['fast', 'light', 'pro'] as const).map((tier) => {
              const isSelected = selectedTier === tier;
              const label = tier === 'fast' ? 'Fast' : tier === 'light' ? 'Light' : 'Pro';
              const description =
                tier === 'fast' ? 'Fastest response' : tier === 'light' ? 'Balanced' : 'Deep reasoning';
              return (
                <button
                  key={tier}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedTier(tier)}
                  title={`${label} — ${description}`}
                  style={{
                    background: isSelected ? 'var(--theater-text-primary)' : 'transparent',
                    color: isSelected ? 'var(--theater-bg)' : 'var(--theater-text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--theater-radius-xs)',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 600 : 450,
                    cursor: 'pointer',
                    transition: 'all var(--theater-transition-fast)',
                    fontFamily: 'var(--theater-font-sans)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.9rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.length === 1 && messages[0].id === 'welcome' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--theater-text-secondary)',
                  lineHeight: 1.5,
                  fontFamily: 'var(--theater-font-sans)',
                }}
              >
                What are you stuck on in <span style={{ color: 'var(--theater-text-primary)', fontWeight: 550 }}>{concept}</span>?
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  `Can you clarify the core principle of ${concept}?`,
                  `Give an intuitive real-world analogy`,
                  `What is the most common mistake students make here?`,
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(suggestion);
                      inputRef.current?.focus();
                    }}
                    style={{
                      background: 'var(--theater-surface-elevated)',
                      border: '1px solid var(--theater-border-subtle)',
                      borderRadius: 'var(--theater-radius-sm)',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.74rem',
                      color: 'var(--theater-text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all var(--theater-transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--theater-text-primary)';
                      e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--theater-text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isStudent = m.sender === 'student';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    paddingBottom: '0.4rem',
                    borderBottom: '1px solid var(--theater-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: isStudent ? 'var(--theater-text-muted)' : 'var(--theater-text-primary)',
                      }}
                    >
                      {isStudent ? 'You' : `Lumo${m.tier ? ` · ${m.tier}` : ''}`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--theater-text-faint)' }}>{m.timestamp}</span>
                      {!isStudent && (
                        <button
                          onClick={() => navigator.clipboard.writeText(m.text)}
                          title="Copy explanation"
                          aria-label="Copy explanation"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--theater-text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.25rem',
                            borderRadius: 'var(--theater-radius-xs)',
                            transition: 'color var(--theater-transition-fast)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--theater-text-primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theater-text-muted)')}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: isStudent ? 'var(--theater-text-secondary)' : 'var(--theater-text-primary)',
                      lineHeight: 1.55,
                      fontFamily: 'var(--theater-font-sans)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--theater-text-muted)', fontSize: '0.78rem' }}>
              <IconSparkles size={13} style={{ color: 'var(--theater-text-muted)' }} />
              <span>Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '0.65rem 1rem',
            borderTop: '1px solid var(--theater-border-subtle)',
            background: 'var(--theater-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about this concept..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'var(--theater-surface-sunken)',
              border: '1px solid var(--theater-border-subtle)',
              borderRadius: 'var(--theater-radius-sm)',
              padding: '0.45rem 0.8rem',
              color: 'var(--theater-text-primary)',
              fontSize: '0.8rem',
              outline: 'none',
              fontFamily: 'var(--theater-font-sans)',
            }}
          />

          {speechToTextService.isSupported() && (
            <button
              onClick={handleToggleVoiceInput}
              disabled={isLoading}
              style={{
                background: isListeningMic ? 'var(--theater-surface-active)' : 'transparent',
                border: isListeningMic ? '1px solid var(--theater-text-primary)' : '1px solid var(--theater-border-subtle)',
                color: 'var(--theater-text-primary)',
                borderRadius: 'var(--theater-radius-sm)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all var(--theater-transition-fast)',
              }}
              title={isListeningMic ? 'Listening to speech...' : 'Speak doubt'}
              aria-label="Voice input"
            >
              <IconMic size={14} />
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={isLoading || !inputQuery.trim()}
            style={{
              background: inputQuery.trim() ? 'var(--theater-text-primary)' : 'var(--theater-surface-sunken)',
              color: inputQuery.trim() ? 'var(--theater-bg)' : 'var(--theater-text-faint)',
              border: 'none',
              borderRadius: 'var(--theater-radius-sm)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputQuery.trim() && !isLoading ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'all var(--theater-transition-fast)',
            }}
            title="Send doubt"
            aria-label="Send doubt"
          >
            <IconArrowRight size={13} />
          </button>
        </div>
      </aside>
    </div>
  );
};
