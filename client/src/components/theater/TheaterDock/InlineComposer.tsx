import React, { useState } from 'react';
import { IconArrowRight } from '../TheaterIcons';

export interface InlineComposerProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  isAssessmentActive?: boolean;
}

export const InlineComposer: React.FC<InlineComposerProps> = ({
  onSendMessage,
  disabled = false,
  isAssessmentActive = false,
}) => {
  const [typedMessage, setTypedMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || disabled) return;
    const msg = typedMessage.trim();
    setTypedMessage('');
    await onSendMessage(msg);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--theater-surface-elevated)',
        border: isFocused
          ? '1px solid var(--theater-text-primary)'
          : '1px solid var(--theater-border-subtle)',
        borderRadius: 'var(--theater-radius-sm)',
        padding: '0.15rem 0.25rem 0.15rem 0.65rem',
        minWidth: '180px',
        maxWidth: '260px',
        height: '32px',
        transition: 'border-color var(--theater-transition-fast)',
        boxSizing: 'border-box',
      }}
    >
      <input
        type="text"
        value={typedMessage}
        onChange={(e) => setTypedMessage(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={
          isAssessmentActive
            ? "Type your answer..."
            : "Type a question..."
        }
        disabled={disabled}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--theater-text-primary)',
          fontSize: '0.78rem',
          fontFamily: 'var(--theater-font-sans)',
        }}
      />

      <button
        type="submit"
        disabled={disabled || !typedMessage.trim()}
        style={{
          background: typedMessage.trim() ? 'var(--theater-accent)' : 'transparent',
          color: typedMessage.trim() ? 'var(--theater-accent-contrast)' : 'var(--theater-text-faint)',
          border: 'none',
          borderRadius: 'var(--theater-radius-xs)',
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled || !typedMessage.trim() ? 'default' : 'pointer',
          padding: 0,
          transition: 'all var(--theater-transition-fast)',
        }}
        title="Send message"
        aria-label="Send message"
      >
        <IconArrowRight size={11} />
      </button>
    </form>
  );
};
