import React from 'react';
import type { TutorVisualState, ClientAssessmentQuestion, AssessmentSubmission, TutorAvatarState } from '@ai-tutor/shared';
import { VisualCanvas } from './VisualCanvas';
import { AssessmentStage } from './AssessmentStage';
import { TutorPresence } from './TutorPresence';
import type { CameraFramingState } from '../Avatar/types';
import { StageSubtitlePill } from './StageSubtitlePill';
import { LessonProgress, type ConceptStep } from '../TheaterProgress/LessonProgress';
import { IconRefresh, IconPlay, IconMaximize, IconMinimize } from '../TheaterIcons';

export interface TheaterStageProps {
  visualState: TutorVisualState;
  activeAssessmentQuestion: ClientAssessmentQuestion | null;
  idToken: string;
  sessionId?: string;
  avatarState: TutorAvatarState;
  interactionState?: 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED' | 'PAUSED' | 'ERROR';
  isSpeaking?: boolean;
  isInterrupting?: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  framing?: CameraFramingState;
  captionsEnabled?: boolean;
  interimTranscript?: string;
  onAssessmentSubmitted: (submission: AssessmentSubmission) => void;
  onRequestAssessmentHint?: () => void;
  onGiveUpAssessment?: () => void;
  isLoadingAssessment?: boolean;
  isReplaying?: boolean;
  replayConceptName?: string;
  onResumeLive?: () => void;
  conceptSteps?: ConceptStep[];
  onSelectConceptStep?: (stepId: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  dockSlot?: React.ReactNode;
}

export const TheaterStage: React.FC<TheaterStageProps> = ({
  visualState,
  activeAssessmentQuestion,
  idToken,
  sessionId,
  avatarState,
  interactionState,
  isSpeaking = false,
  isInterrupting = false,
  isListening = false,
  isThinking = false,
  framing = 'medium',
  captionsEnabled = false,
  interimTranscript,
  onAssessmentSubmitted,
  onRequestAssessmentHint,
  onGiveUpAssessment,
  isLoadingAssessment = false,
  isReplaying = false,
  replayConceptName,
  onResumeLive,
  conceptSteps = [],
  onSelectConceptStep,
  isFocusMode = false,
  onToggleFocusMode,
  dockSlot,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: isFocusMode ? '100%' : '1400px',
        margin: '0 auto',
        position: 'relative',
        transition: 'max-width var(--theater-transition-stage)',
      }}
    >
      {/* Replay Indicator Pill at Top */}
      {isReplaying && (
        <div
          style={{
            position: 'absolute',
            top: '-2.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--theater-surface-elevated)',
            border: '1px solid var(--theater-border-medium)',
            color: 'var(--theater-text-primary)',
            padding: '0.25rem 0.8rem',
            borderRadius: 'var(--theater-radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 30,
            boxShadow: 'var(--theater-shadow-dock)',
            fontFamily: 'var(--theater-font-sans)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <IconRefresh size={12} />
            <span>Replaying: {replayConceptName || visualState.concept}</span>
          </span>
          {onResumeLive && (
            <button
              onClick={onResumeLive}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'var(--theater-accent)',
                color: 'var(--theater-accent-contrast)',
                border: 'none',
                borderRadius: 'var(--theater-radius-pill)',
                padding: '0.15rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <IconPlay size={9} />
              <span>Resume Live</span>
            </button>
          )}
        </div>
      )}

      {/* The Central Teaching Environment Stage Area — Unified Presentation */}
      <div
        id="lumo-teaching-stage"
        style={{
          width: '100%',
          height: isFocusMode ? 'calc(100vh - 84px)' : 'clamp(440px, 66vh, 740px)',
          background: 'var(--theater-surface)',
          border: '1px solid var(--theater-border-subtle)',
          borderRadius: isFocusMode ? 'var(--theater-radius-sm)' : 'var(--theater-radius-xl)',
          boxShadow: 'var(--theater-shadow-canvas)',
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'height var(--theater-transition-stage), border-radius var(--theater-transition-stage)',
        }}
      >
        {/* Layer 1 (z-1): Visual Blackboard Content — Dominant Stage Canvas */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: activeAssessmentQuestion ? 'min(420px, 34vw)' : 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 'inherit',
            zIndex: 1,
            transition: 'right var(--theater-transition-stage)',
          }}
        >
          <VisualCanvas
            visualState={visualState}
            captionsEnabled={false}
          />
        </div>

        {/* Layer 2 (z-10): Transparent Stage Presence — Miko 3D Avatar */}
        <div
          id="theater-miko-presence"
          style={{
            position: 'absolute',
            right: activeAssessmentQuestion ? 'min(430px, 35vw)' : (isFocusMode ? '1.5rem' : '0.75rem'),
            bottom: 0,
            top: 0,
            width: isFocusMode ? 'clamp(280px, 24vw, 400px)' : 'clamp(320px, 27vw, 460px)',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            overflow: 'visible',
            transition: 'right var(--theater-transition-stage), width var(--theater-transition-stage)',
          }}
        >
          <TutorPresence
            interactionState={interactionState}
            avatarState={avatarState}
            isSpeaking={isSpeaking}
            isInterrupting={isInterrupting}
            isListening={isListening}
            isThinking={isThinking}
            framing={framing}
          />
        </div>

        {/* Layer 3 (z-20): Floating Subtitle Caption Pill */}
        <StageSubtitlePill
          captionText={visualState.captionText}
          interimTranscript={interimTranscript}
          isInterrupting={isInterrupting}
          isVisible={captionsEnabled || Boolean(interimTranscript) || isInterrupting}
          bottom={dockSlot ? '5rem' : '1.5rem'}
        />

        {/* Layer 4 (z-25): Active Assessment Stage (when interactive quiz is triggered) */}
        {activeAssessmentQuestion && (
          <div
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              bottom: '1rem',
              width: 'min(420px, 34vw)',
              display: 'flex',
              alignItems: 'stretch',
              zIndex: 25,
              boxShadow: 'var(--theater-shadow-drawer)',
              borderRadius: 'var(--theater-radius-lg)',
              overflow: 'hidden',
            }}
          >
            <AssessmentStage
              question={activeAssessmentQuestion}
              idToken={idToken}
              sessionId={sessionId}
              onSubmitted={onAssessmentSubmitted}
              onRequestHint={onRequestAssessmentHint}
              onGiveUp={onGiveUpAssessment}
              isLoading={isLoadingAssessment}
            />
          </div>
        )}

        {/* Layer 5 (z-26): Quick Focus Mode Expand / Minimize Toggle */}
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            style={{
              position: 'absolute',
              top: '0.85rem',
              right: '0.85rem',
              background: 'var(--theater-surface-elevated)',
              border: '1px solid var(--theater-border-subtle)',
              borderRadius: 'var(--theater-radius-xs)',
              color: 'var(--theater-text-muted)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.85,
              transition: 'opacity var(--theater-transition-fast), color var(--theater-transition-fast), background var(--theater-transition-fast)',
              zIndex: 26,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.color = 'var(--theater-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.85';
              e.currentTarget.style.color = 'var(--theater-text-muted)';
            }}
            title={isFocusMode ? 'Exit Full Stage' : 'Expand Full Stage'}
            aria-label={isFocusMode ? 'Exit Full Stage' : 'Expand Full Stage'}
          >
            {isFocusMode ? <IconMinimize size={14} /> : <IconMaximize size={14} />}
          </button>
        )}

        {/* Layer 6 (z-30): Floating Control Surface — Collapsible Dock */}
        {dockSlot && (
          <div
            id="lumo-dock-slot"
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              pointerEvents: 'auto',
              maxWidth: '94%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {dockSlot}
          </div>
        )}
      </div>

      {/* Lesson / Concept Timeline Track (Recedes Gracefully in Focus Mode) */}
      {!isFocusMode && conceptSteps.length > 0 && (
        <div style={{ marginTop: '0.75rem', width: '100%' }}>
          <LessonProgress
            steps={conceptSteps}
            onSelectStep={onSelectConceptStep}
          />
        </div>
      )}
    </div>
  );
};
