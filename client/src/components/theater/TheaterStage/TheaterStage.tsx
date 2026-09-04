import React from 'react';
import type { TutorVisualState, ClientAssessmentQuestion, AssessmentSubmission, TutorAvatarState } from '@ai-tutor/shared';
import { VisualCanvas } from './VisualCanvas';
import { AssessmentStage } from './AssessmentStage';
import { TutorPresence } from './TutorPresence';
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
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: isFocusMode ? '1600px' : '1240px',
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

      {/* The Central Teaching Environment Canvas Area */}
      <div
        style={{
          width: '100%',
          height: isFocusMode ? 'calc(100vh - 120px)' : 'clamp(380px, 58vh, 660px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          gap: '1.25rem',
          transition: 'height var(--theater-transition-stage)',
        }}
      >
        {/* Visual Blackboard Content — The Unquestioned Hero */}
        <div
          style={{
            flex: 1,
            height: '100%',
            maxWidth: activeAssessmentQuestion ? '68%' : '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <VisualCanvas
            visualState={visualState}
            captionsEnabled={false}
          />

          {/* Floating Subtitle Caption Pill */}
          <StageSubtitlePill
            captionText={visualState.captionText}
            interimTranscript={interimTranscript}
            isInterrupting={isInterrupting}
            isVisible={captionsEnabled || Boolean(interimTranscript) || isInterrupting}
          />

          {/* Quick Focus Mode Expand Toggle on Canvas Corner */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'var(--theater-surface-elevated)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-xs)',
                color: 'var(--theater-text-muted)',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.75,
                transition: 'opacity var(--theater-transition-fast), color var(--theater-transition-fast)',
                zIndex: 25,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = 'var(--theater-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.75';
                e.currentTarget.style.color = 'var(--theater-text-muted)';
              }}
              title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              aria-label={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              {isFocusMode ? <IconMinimize size={13} /> : <IconMaximize size={13} />}
            </button>
          )}
        </div>

        {/* Companion Area: Tutor Presence OR Assessment Stage */}
        {!activeAssessmentQuestion ? (
          /* Subtle Lumo Companion Presence */
          <div
            style={{
              display: isFocusMode ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: isFocusMode ? 0 : 1,
              transition: 'opacity var(--theater-transition-fast)',
            }}
          >
            <TutorPresence
              interactionState={interactionState}
              avatarState={avatarState}
              isSpeaking={isSpeaking}
              isInterrupting={isInterrupting}
              isListening={isListening}
              isThinking={isThinking}
            />
          </div>
        ) : (
          /* Active Assessment Stage */
          <div
            style={{
              width: 'min(400px, 32vw)',
              height: '100%',
              display: 'flex',
              alignItems: 'stretch',
              flexShrink: 0,
              zIndex: 20,
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
