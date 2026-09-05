import React, { useEffect, useRef } from 'react';
import type { WorkspaceMessage, WorkspaceContext, ModelTier } from './types';
import { EmptyState } from './EmptyState';
import { MessageBubble } from './MessageBubble';
import { AIPresence } from '../ui/AIPresence';
import { Logo } from '../ui/Logo';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MODEL_TIER_OPTIONS } from './types';

interface MessageListProps {
  messages: WorkspaceMessage[];
  isGenerating: boolean;
  generationStatus?: string;
  currentStreamText?: string;
  currentModelTier?: ModelTier;
  context: WorkspaceContext;
  onSelectPrompt: (prompt: string) => void;
  onOpenContextModal: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isGenerating,
  generationStatus,
  currentStreamText,
  currentModelTier,
  context,
  onSelectPrompt,
  onOpenContextModal,
  onSelectSuggestion,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, currentStreamText, isGenerating]);

  if (messages.length === 0 && !isGenerating && !currentStreamText) {
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EmptyState
          context={context}
          onSelectPrompt={onSelectPrompt}
          onOpenContextModal={onOpenContextModal}
        />
      </div>
    );
  }

  const tierConfig = MODEL_TIER_OPTIONS.find((t) => t.id === currentModelTier);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-6) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: '768px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSelectSuggestion={onSelectSuggestion}
          />
        ))}

        {/* Live Streaming Assistant Message */}
        {isGenerating && currentStreamText && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              margin: '20px 0',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <Logo height={22} />
            </div>

            <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Lumo
                </span>
                {tierConfig && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {tierConfig.badge} {tierConfig.name}
                  </span>
                )}
                <AIPresence state="thinking" />
              </div>

              <MarkdownRenderer content={currentStreamText} />
            </div>
          </div>
        )}

        {/* Loading / Thinking State before first chunk */}
        {isGenerating && !currentStreamText && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '20px 0',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              width: 'fit-content',
            }}
          >
            <AIPresence state="thinking" />
            <span
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {generationStatus || 'Lumo is formulating an explanation…'}
            </span>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '1px' }} />
      </div>
    </div>
  );
};
