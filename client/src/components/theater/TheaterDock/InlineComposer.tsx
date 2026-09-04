import React, { useState } from 'react';

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
        background: isFocused ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)',
        border: isFocused
          ? '1px solid rgba(226, 157, 75, 0.35)'
          : '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '14px',
        padding: '0.35rem 0.5rem 0.35rem 0.95rem',
        minWidth: '220px',
        maxWidth: '300px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isFocused ? '0 0 16px rgba(226, 157, 75, 0.12)' : 'none',
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
          color: '#F5F5F2',
          fontSize: '0.82rem',
          fontFamily: 'var(--theater-font-sans)',
        }}
      />

      <button
        type="submit"
        disabled={disabled || !typedMessage.trim()}
        style={{
          background: typedMessage.trim() ? '#E29D4B' : 'transparent',
          color: typedMessage.trim() ? '#080808' : '#777773',
          border: 'none',
          borderRadius: '8px',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled || !typedMessage.trim() ? 'default' : 'pointer',
          fontSize: '0.95rem',
          fontWeight: 700,
          transition: 'all 0.15s ease',
        }}
        title="Send message"
      >
        →
      </button>
    </form>
  );
};
