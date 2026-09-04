import React, { useState, useRef, useEffect } from 'react';
import type { WorkspaceContext } from './types';

interface ComposerProps {
  onSendMessage: (text: string) => void;
  onOpenContextModal: () => void;
  isGenerating: boolean;
  onCancelGeneration?: () => void;
  context: WorkspaceContext;
  placeholder?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onOpenContextModal,
  isGenerating,
  onCancelGeneration,
  context,
  placeholder = 'Ask Lumo anything…',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 160);
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
        maxWidth: '768px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          transition: 'border-color var(--motion-fast) var(--ease-standard)',
        }}
        onFocus={() => {
          // Focus glow handled by CSS or active state
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
            fontSize: 'var(--text-body)',
            fontFamily: 'inherit',
            color: 'var(--color-text-primary)',
            lineHeight: 1.5,
            padding: '4px 2px',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '4px',
            borderTop: '1px solid var(--color-border-subtle, rgba(0,0,0,0.04))',
          }}
        >
          {/* Attachment / Context trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={onOpenContextModal}
              style={{
                background: hasAttachedContext ? 'var(--color-surface-hover)' : 'transparent',
                border: `1px solid ${hasAttachedContext ? 'var(--color-orange)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-pill)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: hasAttachedContext ? 'var(--color-orange)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all var(--motion-fast) var(--ease-standard)',
              }}
              title="Attach study document or set topic context"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span>{hasAttachedContext ? 'Context Attached' : 'Attach Context'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isGenerating ? (
              <button
                type="button"
                onClick={onCancelGeneration}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
                title="Stop generating"
              >
                {/* Square stop icon */}
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    background: 'var(--color-text-primary)',
                    borderRadius: '2px',
                  }}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim()}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: input.trim() ? 'var(--color-orange)' : 'var(--color-surface-hover)',
                  border: 'none',
                  color: input.trim() ? '#ffffff' : 'var(--color-text-muted)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                  boxShadow: input.trim() ? '0 2px 8px rgba(255, 90, 54, 0.35)' : 'none',
                }}
                title="Send message (Enter)"
              >
                {/* Arrow up icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          letterSpacing: '-0.01em',
        }}
      >
        Lumo adapts explanations to your pace · Press Enter to send, Shift+Enter for newline
      </div>
    </div>
  );
};
