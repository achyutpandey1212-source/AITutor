import React from 'react';
import type { TutorVisualState, ClientAssessmentQuestion, AssessmentSubmission, TutorAvatarState } from '@ai-tutor/shared';
import { VisualCanvas } from './VisualCanvas';
import { AssessmentStage } from './AssessmentStage';
import { TutorPresence } from './TutorPresence';
import { StageSubtitlePill } from './StageSubtitlePill';
import { LessonProgress, type ConceptStep } from '../TheaterProgress/LessonProgress';
import { IconRefresh, IconPlay } from '../TheaterIcons';

export interface TheaterStageProps {
  visualState: TutorVisualState;
  activeAssessmentQuestion: ClientAssessmentQuestion | null;
  idToken: string;
  sessionId?: string;
  avatarState: TutorAvatarState;
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
}

export const TheaterStage: React.FC<TheaterStageProps> = ({
  visualState,
  activeAssessmentQuestion,
  idToken,
  sessionId,
  avatarState,
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
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '1360px',
        margin: '0 auto',
        gap: '0.75rem',
      }}
    >
      {/* The Master Classroom Stage Container — Fluid, Responsive, Composition-Aware */}
      <div
        className="theater-stage-container"
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(420px, 60vh, 700px)',
          minHeight: '400px',
          background: 'var(--theater-surface)',
          borderRadius: 'var(--theater-radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--theater-border-subtle)',
          boxShadow: 'var(--theater-shadow-stage)',
          display: 'flex',
          gap: '0.85rem',
          padding: '0.85rem',
          boxSizing: 'border-box',
        }}
      >
        {/* Replay Banner at Top Center */}
        {isReplaying && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--theater-surface-elevated)',
              border: '1px solid var(--theater-accent-border)',
              color: 'var(--theater-text-primary)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--theater-radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 550,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              zIndex: 30,
              boxShadow: 'var(--theater-shadow-dock)',
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <IconRefresh size={13} style={{ color: 'var(--theater-accent)' }} />
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
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity var(--theater-transition-fast)',
                }}
              >
                <IconPlay size={10} />
                <span>Resume Live</span>
              </button>
            )}
          </div>
        )}

        {/* Primary Content: Visual Blackboard & Teaching Visuals */}
        <div
          style={{
            flex: 1,
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 'var(--theater-radius-lg)',
            background: 'var(--theater-surface-sunken)',
          }}
        >
          <VisualCanvas
            visualState={visualState}
            captionsEnabled={false}
          />

          {/* Subtitle Caption Pill */}
          <StageSubtitlePill
            captionText={visualState.captionText}
            interimTranscript={interimTranscript}
            isInterrupting={isInterrupting}
            isVisible={captionsEnabled || Boolean(interimTranscript) || isInterrupting}
          />
        </div>

        {/* Right Section: Lumo Tutor Presence OR Assessment Workspace */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {!activeAssessmentQuestion ? (
            <TutorPresence
              avatarState={avatarState}
              isSpeaking={isSpeaking}
              isInterrupting={isInterrupting}
              isListening={isListening}
              isThinking={isThinking}
            />
          ) : (
            <AssessmentStage
              question={activeAssessmentQuestion}
              idToken={idToken}
              sessionId={sessionId}
              onSubmitted={onAssessmentSubmitted}
              onRequestHint={onRequestAssessmentHint}
              onGiveUp={onGiveUpAssessment}
              isLoading={isLoadingAssessment}
            />
          )}
        </div>
      </div>

      {/* Lesson / Concept Progress Track along Bottom of Stage */}
      {conceptSteps.length > 0 && (
        <LessonProgress
          steps={conceptSteps}
          onSelectStep={onSelectConceptStep}
        />
      )}
    </div>
  );
};
