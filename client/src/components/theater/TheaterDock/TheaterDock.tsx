import React, { useState } from 'react';
import { VoiceActivityWidget } from './VoiceActivityWidget';
import { ContextualActionPills } from './ContextualActionPills';
import { InlineComposer } from './InlineComposer';
import { IconMaximize, IconMinimize, IconChevronUp, IconChevronDown, IconHelp } from '../TheaterIcons';

export interface TheaterDockProps {
  micEnabled: boolean;
  interactionState?: 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED' | 'PAUSED' | 'ERROR';
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
  interactionState,
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
  // Collapsible state: defaults to collapsed (compact) for serene live interaction
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  return (
    <nav
      className="theater-dock"
      aria-label="Classroom Controls"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        maxWidth: isCollapsed ? '380px' : 'min(920px, 94vw)',
        minHeight: '44px',
        background: 'var(--theater-surface, #141518)',
        border: '1px solid var(--theater-border-medium, rgba(255, 255, 255, 0.12))',
        borderRadius: 'var(--theater-radius-pill, 9999px)',
        padding: isCollapsed ? '0.3rem 0.65rem' : '0.35rem 0.85rem',
        boxShadow: 'var(--theater-shadow-dock, 0 8px 32px rgba(0, 0, 0, 0.5))',
        zIndex: 30,
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: 'max-width 220ms cubic-bezier(0.16, 1, 0.3, 1), padding 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* 1. Left Section: Microphone Control & Audio Activity Status */}
      <VoiceActivityWidget
        micEnabled={micEnabled}
        interactionState={interactionState}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isThinking={isThinking}
        isInterrupting={isInterrupting}
        onToggleMic={onToggleMic}
        onInterrupt={onInterrupt}
        isSttSupported={isSttSupported}
      />

      {/* 2. Collapsed View: Dedicated Doubt/Ask Button + Expand Toggle */}
      {isCollapsed ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            opacity: 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {/* Hairline Divider */}
          <span
            style={{
              width: '1px',
              height: '16px',
              background: 'var(--theater-border-subtle, rgba(255, 255, 255, 0.08))',
              flexShrink: 0,
            }}
          />

          {/* Dedicated Doubt / Ask Button */}
          {onOpenDoubtSolver && (
            <button
              onClick={onOpenDoubtSolver}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                color: 'var(--theater-text-secondary, #A1A1A5)',
                border: '1px solid var(--theater-border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: 'var(--theater-radius-pill, 9999px)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 550,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--theater-font-sans, system-ui, sans-serif)',
                transition: 'all var(--theater-transition-fast, 120ms ease)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.color = 'var(--theater-text-primary, #F5F5F5)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong, rgba(255, 255, 255, 0.20))';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.color = 'var(--theater-text-secondary, #A1A1A5)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle, rgba(255, 255, 255, 0.08))';
                }
              }}
              title="Ask Lumo a question or doubt"
              aria-label="Ask Doubt"
            >
              <IconHelp size={13} />
              <span>Ask Doubt</span>
            </button>
          )}

          {/* Expand Toolbar Toggle */}
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              background: 'transparent',
              color: 'var(--theater-text-muted, #66666A)',
              border: 'none',
              borderRadius: 'var(--theater-radius-sm, 6px)',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'color var(--theater-transition-fast, 120ms ease)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-primary, #F5F5F5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theater-text-muted, #66666A)';
            }}
            title="Expand toolbar controls"
            aria-label="Expand toolbar"
          >
            <IconChevronUp size={14} />
          </button>
        </div>
      ) : (
        /* 3. Expanded View: Full Controls (Contextual Actions + Composer + Focus Toggle + Collapse Button) */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            opacity: 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {/* Subtle Hairline Divider */}
          <span
            style={{
              width: '1px',
              height: '18px',
              background: 'var(--theater-border-subtle, rgba(255, 255, 255, 0.08))',
              flexShrink: 0,
            }}
          />

          {/* Center Section: Contextual Actions */}
          <ContextualActionPills
            isSpeaking={isSpeaking}
            isListening={isListening}
            isAssessmentActive={isAssessmentActive}
            isReplaying={isReplaying}
            onInterrupt={onInterrupt}
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
              background: 'var(--theater-border-subtle, rgba(255, 255, 255, 0.08))',
              flexShrink: 0,
            }}
          />

          {/* Right Section: Inline Question Composer, Focus Toggle & Collapse */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
                  width: '30px',
                  height: '30px',
                  background: 'transparent',
                  color: 'var(--theater-text-secondary, #A1A1A5)',
                  border: '1px solid var(--theater-border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: 'var(--theater-radius-sm, 6px)',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  transition: 'all var(--theater-transition-fast, 120ms ease)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--theater-text-primary, #F5F5F5)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong, rgba(255, 255, 255, 0.20))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--theater-text-secondary, #A1A1A5)';
                  e.currentTarget.style.borderColor = 'var(--theater-border-subtle, rgba(255, 255, 255, 0.08))';
                }}
                title={isFocusMode ? 'Exit Immersive Theater' : 'Enter Immersive Theater'}
                aria-label={isFocusMode ? 'Exit Immersive Theater' : 'Enter Immersive Theater'}
              >
                {isFocusMode ? <IconMinimize size={13} /> : <IconMaximize size={13} />}
              </button>
            )}

            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                background: 'transparent',
                color: 'var(--theater-text-muted, #66666A)',
                border: 'none',
                borderRadius: 'var(--theater-radius-sm, 6px)',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                transition: 'color var(--theater-transition-fast, 120ms ease)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-primary, #F5F5F5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-muted, #66666A)';
              }}
              title="Collapse toolbar"
              aria-label="Collapse toolbar"
            >
              <IconChevronDown size={14} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
