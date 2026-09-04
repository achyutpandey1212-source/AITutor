import React from 'react';
import { VoiceActivityWidget } from './VoiceActivityWidget';
import { ContextualActionPills } from './ContextualActionPills';
import { InlineComposer } from './InlineComposer';
import { IconMaximize, IconMinimize } from '../TheaterIcons';

export interface TheaterDockProps {
  micEnabled: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  isInterrupting?: boolean;
  isAssessmentActive?: boolean;
  isReplaying?: boolean;
  onToggleMic: () => void;
  onInterrupt?: () => void;
  onExplainAgain?: () => void;
  onExplainDifferently?: () => void;
  onRequestHint?: () => void;
  onGiveUpAssessment?: () => void;
  onResumeLive?: () => void;
  onOpenDoubtSolver?: () => void;
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  isSttSupported?: boolean;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const TheaterDock: React.FC<TheaterDockProps> = ({
  micEnabled,
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  isInterrupting = false,
  isAssessmentActive = false,
  isReplaying = false,
  onToggleMic,
  onInterrupt,
  onExplainAgain,
  onExplainDifferently,
  onRequestHint,
  onGiveUpAssessment,
  onResumeLive,
  onOpenDoubtSolver,
  onSendMessage,
  isLoading = false,
  isSttSupported = true,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  return (
    <nav
      className="theater-dock"
      aria-label="Classroom Controls"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: 'min(920px, 94vw)',
        minHeight: '48px',
        background: 'var(--theater-surface)',
        border: '1px solid var(--theater-border-medium)',
        borderRadius: 'var(--theater-radius-full)',
        padding: '0.35rem 0.85rem',
        boxShadow: 'var(--theater-shadow-dock)',
        zIndex: 40,
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: 'all var(--theater-transition-normal)',
      }}
    >
      {/* 1. Left Section: Microphone Control & Audio Activity Status */}
      <VoiceActivityWidget
        micEnabled={micEnabled}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isThinking={isThinking}
        isInterrupting={isInterrupting}
        onToggleMic={onToggleMic}
        onInterrupt={onInterrupt}
        isSttSupported={isSttSupported}
      />

      {/* Subtle Hairline Divider */}
      <span
        style={{
          width: '1px',
          height: '18px',
          background: 'var(--theater-border-subtle)',
          flexShrink: 0,
        }}
      />

      {/* 2. Center Section: Contextual Actions */}
      <ContextualActionPills
        isSpeaking={isSpeaking}
        isListening={isListening}
        isAssessmentActive={isAssessmentActive}
        isReplaying={isReplaying}
        onExplainAgain={onExplainAgain}
        onExplainDifferently={onExplainDifferently}
        onRequestHint={onRequestHint}
        onGiveUpAssessment={onGiveUpAssessment}
        onResumeLive={onResumeLive}
        onOpenDoubtSolver={onOpenDoubtSolver}
        disabled={isLoading}
      />

      {/* Subtle Hairline Divider */}
      <span
        style={{
          width: '1px',
          height: '18px',
          background: 'var(--theater-border-subtle)',
          flexShrink: 0,
        }}
      />

      {/* 3. Right Section: Inline Question Composer & Focus Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <InlineComposer
          onSendMessage={onSendMessage}
          disabled={isLoading}
          isAssessmentActive={isAssessmentActive}
        />

        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'transparent',
              color: 'var(--theater-text-secondary)',
              border: '1px solid var(--theater-border-subtle)',
              borderRadius: 'var(--theater-radius-sm)',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'all var(--theater-transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary)';
              e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
            }}
            title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            aria-label={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isFocusMode ? <IconMinimize size={13} /> : <IconMaximize size={13} />}
          </button>
        )}
      </div>
    </nav>
  );
};
