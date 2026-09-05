import React from 'react';
import type { TutorAvatarState } from '@ai-tutor/shared';
import { ProductionAvatarViewport } from '../Avatar/ProductionAvatarViewport';
import type { CameraFramingState } from '../Avatar/types';

export type InteractionState =
  | 'READY'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'PAUSED'
  | 'ERROR';

export interface TutorPresenceProps {
  interactionState?: InteractionState;
  avatarState?: TutorAvatarState;
  isSpeaking?: boolean;
  isInterrupting?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  framing?: CameraFramingState;
  zoom?: number;
}

export const TutorPresence: React.FC<TutorPresenceProps> = ({
  interactionState,
  avatarState,
  isSpeaking = false,
  isInterrupting = false,
  isListening = false,
  isThinking = false,
  framing = 'medium',
  zoom = 1.0,
}) => {
  // Derive active status with single-source priority
  const currentState: InteractionState =
    interactionState ||
    (isInterrupting || avatarState === 'INTERRUPTING'
      ? 'INTERRUPTED'
      : isSpeaking || avatarState === 'SPEAKING'
      ? 'SPEAKING'
      : isThinking || avatarState === 'THINKING'
      ? 'THINKING'
      : isListening || avatarState === 'LISTENING'
      ? 'LISTENING'
      : 'READY');

  const getStatusLabel = () => {
    switch (currentState) {
      case 'SPEAKING':
        return 'Explaining';
      case 'LISTENING':
        return 'Listening';
      case 'THINKING':
        return 'Thinking';
      case 'INTERRUPTED':
        return 'Interrupted';
      case 'PAUSED':
        return 'Paused';
      case 'ERROR':
        return 'Notice';
      case 'READY':
      default:
        return 'Lumo';
    }
  };

  const isAudioActive = currentState === 'SPEAKING' || currentState === 'LISTENING';

  return (
    <div
      id="lumo-avatar-viewport"
      data-interaction-state={currentState}
      aria-label={`Lumo tutor status: ${getStatusLabel()}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflow: 'visible', // Must not clip Miko's transparent stage presence
        pointerEvents: 'none',
      }}
    >
      {/* 3D Avatar Mount — Seamlessly occupies stage presence without card frames */}
      <div
        id="lumo-avatar-mount"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible', // No clipping of arms or gestures
          pointerEvents: 'none',
        }}
      >
        <ProductionAvatarViewport
          interactionState={currentState}
          framing={framing}
          zoom={zoom}
        />
      </div>

      {/* Understated Typographic Status Pill — High-contrast in both Light & Dark modes */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--theater-radius-pill, 9999px)',
          background: 'var(--theater-surface, #141518)',
          border: '1px solid var(--theater-border-medium, rgba(0, 0, 0, 0.15))',
          boxShadow: 'var(--theater-shadow-dock, 0 4px 14px rgba(0, 0, 0, 0.12))',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto', // Allow tooltip/hover
          flexShrink: 0,
          zIndex: 15,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background:
              currentState === 'LISTENING'
                ? '#10b981' // Vibrant emerald green for listening
                : currentState === 'SPEAKING'
                ? '#0ea5e9' // Sky blue for explaining
                : currentState === 'THINKING'
                ? '#f59e0b' // Warm amber for thinking
                : currentState === 'INTERRUPTED'
                ? '#ef4444' // Rose red for interrupted
                : 'var(--theater-text-muted, #8C8C90)',
            boxShadow: isAudioActive
              ? currentState === 'LISTENING'
                ? '0 0 6px rgba(16, 185, 129, 0.7)'
                : '0 0 6px rgba(14, 165, 233, 0.7)'
              : 'none',
            transition: 'all var(--theater-transition-fast, 120ms ease)',
          }}
        />
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            color: 'var(--theater-text-primary, #121314)',
            fontFamily: 'var(--theater-font-sans, system-ui, sans-serif)',
            letterSpacing: '-0.01em',
          }}
        >
          {getStatusLabel()}
        </span>
      </div>
    </div>
  );
};
