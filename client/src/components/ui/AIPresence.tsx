import React from 'react';

// ---------------------------------------------------------------
// Lumo AI Presence Indicator
// Communicates the AI tutor's current state calmly.
// No chaotic spinners or aggressive loading bars.
// ---------------------------------------------------------------

export type AIState = 'idle' | 'listening' | 'thinking' | 'teaching' | 'adapting' | 'done';

interface AIPresenceProps {
  state: AIState;
  style?: React.CSSProperties;
}

const stateConfig: Record<AIState, { label: string; color: string; animation?: string }> = {
  idle:      { label: 'Ready',     color: 'var(--color-text-muted)' },
  listening: { label: 'Listening', color: 'var(--color-mint)',    animation: 'lumo-breathe 1.8s ease-in-out infinite' },
  thinking:  { label: 'Thinking',  color: 'var(--color-yellow)',  animation: 'lumo-pulse 1.2s ease-in-out infinite' },
  teaching:  { label: 'Teaching',  color: 'var(--color-orange)',  animation: 'lumo-breathe 2.4s ease-in-out infinite' },
  adapting:  { label: 'Adapting',  color: 'var(--color-sky)',     animation: 'lumo-pulse 0.9s ease-in-out infinite' },
  done:      { label: 'Done',      color: 'var(--color-success)' },
};

export const AIPresence: React.FC<AIPresenceProps> = ({ state, style }) => {
  const config = stateConfig[state];

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`Lumo AI: ${config.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 500,
        color: 'var(--color-text-secondary)',
        ...style,
      }}
    >
      {/* Dot indicator */}
      <span
        aria-hidden="true"
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: config.color,
          display: 'inline-block',
          flexShrink: 0,
          animation: config.animation,
          transition: `background var(--motion-standard) var(--ease-standard)`,
        }}
      />
      {config.label}
    </span>
  );
};
