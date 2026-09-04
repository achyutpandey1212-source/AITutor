import React from 'react';
import { VoiceActivityWidget } from './VoiceActivityWidget';
import { ContextualActionPills } from './ContextualActionPills';
import { InlineComposer } from './InlineComposer';

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
}) => {
  return (
    <nav
      className="theater-dock"
      aria-label="Classroom Controls"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        width: 'min(1180px, 94vw)',
        background: 'rgba(16, 16, 17, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '22px',
        padding: '0.65rem 1.25rem',
        boxShadow: 'var(--theater-shadow-dock)',
        zIndex: 40,
        userSelect: 'none',
        flexWrap: 'wrap',
      }}
    >
      {/* 1. Left Section: Hero Microphone + Waveform + Status */}
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

      {/* 2. Center Section: Contextual Action Pills */}
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

      {/* 3. Right Section: Inline Question Input */}
      <InlineComposer
        onSendMessage={onSendMessage}
        disabled={isLoading}
        isAssessmentActive={isAssessmentActive}
      />
    </nav>
  );
};
