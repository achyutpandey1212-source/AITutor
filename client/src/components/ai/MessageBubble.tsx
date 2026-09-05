import React, { useState } from 'react';
import type { WorkspaceMessage } from './types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MODEL_TIER_OPTIONS } from './types';

interface MessageBubbleProps {
  message: WorkspaceMessage;
  onSelectSuggestion?: (suggestion: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectSuggestion,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isUser) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          margin: '14px 0',
        }}
      >
        <div
          style={{
            maxWidth: '78%',
            padding: '10px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '14px',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  const tierConfig = MODEL_TIER_OPTIONS.find((t) => t.id === message.modelTier);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        margin: '20px 0',
      }}
    >
      {/* Lumo Avatar */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <img
          src="/logo/Lumo_Logo.png"
          alt="Lumo"
          style={{ width: '16px', height: '16px', objectFit: 'contain' }}
        />
      </div>

      {/* Content Container */}
      <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
        {/* Header meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Lumo
          </span>

          {tierConfig && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              {tierConfig.badge} {tierConfig.name}
            </span>
          )}

          {message.hasDocumentContext && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-orange-soft)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-orange)',
                fontWeight: 600,
              }}
            >
              📄 Grounded
            </span>
          )}
        </div>

        {/* Markdown & Equations */}
        <MarkdownRenderer content={message.content} />

        {/* Action controls & Suggestions */}
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Copy action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 6px',
                fontSize: '12px',
                color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--motion-fast) var(--ease-standard)',
              }}
              title="Copy response"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Suggested follow-ups */}
          {message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion(suggestion)}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all var(--motion-fast) var(--ease-standard)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-orange)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
