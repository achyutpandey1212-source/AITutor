import React, { useState, useRef, useEffect } from 'react';
import type { WorkspaceContext, ModelTier } from './types';
import { MODEL_TIER_OPTIONS } from './types';

interface ComposerProps {
  onSendMessage: (text: string) => void;
  onOpenContextModal: () => void;
  isGenerating: boolean;
  onCancelGeneration?: () => void;
  context: WorkspaceContext;
  placeholder?: string;
  modelTier: ModelTier;
  onSelectTier: (tier: ModelTier) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onOpenContextModal,
  isGenerating,
  onCancelGeneration,
  context,
  placeholder = 'Ask Lumo anything…',
  modelTier,
  onSelectTier,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 240);
      textareaRef.current.style.height = `${Math.max(newHeight, 24)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasAttachedContext = Boolean(
    context.documentId || context.subject || context.topic
  );

  return (
    <div
      style={{
        padding: '0 var(--space-4) var(--space-4) var(--space-4)',
        background: 'transparent',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all var(--motion-fast) var(--ease-standard)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isGenerating}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '14px',
            fontFamily: 'inherit',
            color: 'var(--color-text-primary)',
            lineHeight: 1.5,
            padding: '2px 0',
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          {/* Left: Attach Context + Model Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Attach Context — global Button-style pill */}
            <button
              type="button"
              onClick={onOpenContextModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: 'var(--radius-pill)',
                background: hasAttachedContext ? 'var(--color-orange-soft)' : 'transparent',
                border: `1px solid ${hasAttachedContext ? 'var(--color-orange)' : 'var(--color-border)'}`,
                color: hasAttachedContext ? 'var(--color-orange)' : 'var(--color-text-secondary)',
                transition: 'all var(--motion-fast) var(--ease-standard)',
              }}
              title="Attach study document or set topic context"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span>{hasAttachedContext ? 'Context Attached' : 'Attach Context'}</span>
            </button>

            {/* Model Selector — drop-up */}
            <ComposerModelSelector
              selectedTier={modelTier}
              onSelectTier={onSelectTier}
              disabled={isGenerating}
            />
          </div>

          {/* Action buttons + Keyboard hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              Enter ↵
            </span>

            {isGenerating ? (
              <button
                type="button"
                onClick={onCancelGeneration}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
                title="Stop formulating"
              >
                <div
                  style={{
                    width: '9px',
                    height: '9px',
                    background: 'var(--color-text-primary)',
                    borderRadius: '1px',
                  }}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim()}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  background: input.trim() ? 'var(--color-orange)' : 'var(--color-surface-soft)',
                  border: '1px solid',
                  borderColor: input.trim() ? 'var(--color-orange)' : 'var(--color-border)',
                  color: input.trim() ? '#ffffff' : 'var(--color-text-muted)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                  boxShadow: input.trim() ? '0 2px 8px rgba(232, 89, 46, 0.3)' : 'none',
                }}
                title="Send inquiry"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discreet footer tip */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '6px',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.01em',
        }}
      >
        Lumo adapts explanations to your pace · Shift+Enter for newline
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Inline drop-UP model selector for the Composer toolbar
// ---------------------------------------------------------------------------
interface ComposerModelSelectorProps {
  selectedTier: ModelTier;
  onSelectTier: (tier: ModelTier) => void;
  disabled?: boolean;
}

const ComposerModelSelector: React.FC<ComposerModelSelectorProps> = ({
  selectedTier,
  onSelectTier,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption =
    MODEL_TIER_OPTIONS.find((opt) => opt.id === selectedTier) ||
    MODEL_TIER_OPTIONS[1];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          height: '30px',
          padding: '0 10px',
          borderRadius: 'var(--radius-pill)',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all var(--motion-fast) var(--ease-standard)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color:
              currentOption.id === 'pro'
                ? 'var(--color-orange)'
                : currentOption.id === 'fast'
                ? 'var(--color-yellow)'
                : 'var(--color-sky)',
          }}
        >
          {currentOption.badge}
        </span>
        <span>{currentOption.name}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--color-text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          {/* Chevron UP always (pointing up when closed, down when open) */}
          <polyline points="6 15 12 9 18 15" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            // Drop UP: anchor to bottom of trigger
            bottom: 'calc(100% + 8px)',
            left: 0,
            zIndex: 110,
            width: '280px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'lumo-slide-up var(--motion-fast) var(--ease-enter)',
          }}
        >
          <div
            style={{
              padding: '6px 10px 4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Model Intelligence
          </div>

          {MODEL_TIER_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedTier;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectTier(opt.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isSelected ? 'var(--color-surface-hover)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  fontFamily: 'inherit',
                  transition: 'background var(--motion-fast) var(--ease-standard)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    lineHeight: '20px',
                    color:
                      opt.id === 'pro'
                        ? 'var(--color-orange)'
                        : opt.id === 'fast'
                        ? 'var(--color-yellow)'
                        : 'var(--color-sky)',
                  }}
                >
                  {opt.badge}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {opt.name}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          color: 'var(--color-orange)',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.35,
                    }}
                  >
                    {opt.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
