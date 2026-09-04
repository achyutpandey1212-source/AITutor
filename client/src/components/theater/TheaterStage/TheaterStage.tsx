import React from 'react';
import type { TutorVisualState, ClientAssessmentQuestion, AssessmentSubmission, TutorAvatarState } from '@ai-tutor/shared';
import { VisualCanvas } from './VisualCanvas';
import { AssessmentStage } from './AssessmentStage';
import { TutorPresence } from './TutorPresence';
import { StageSubtitlePill } from './StageSubtitlePill';
import { LessonProgress, type ConceptStep } from '../TheaterProgress/LessonProgress';

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
        gap: '0.85rem',
      }}
    >
      {/* The Master Classroom Stage Container */}
      <div
        className="theater-stage-container"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          minHeight: '480px',
          maxHeight: '68vh',
          background: '#0A0A0B',
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.03) 0%, rgba(10, 10, 11, 0.98) 75%)',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: 'var(--theater-shadow-stage)',
          display: 'flex',
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
              background: 'rgba(226, 157, 75, 0.94)',
              backdropFilter: 'blur(10px)',
              color: '#080808',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              zIndex: 30,
              boxShadow: '0 4px 20px rgba(226, 157, 75, 0.3)',
              fontFamily: 'var(--theater-font-sans)',
            }}
          >
            <span>↻ Replaying: {replayConceptName || visualState.concept}</span>
            {onResumeLive && (
              <button
                onClick={onResumeLive}
                style={{
                  background: '#080808',
                  color: '#F5F5F2',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.15rem 0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Resume Live ▶
              </button>
            )}
          </div>
        )}

        {/* Left / Center: Visual Blackboard Content */}
        <div
          style={{
            flex: 1,
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        </div>

        {/* Right Section: Lumo Tutor Presence OR Assessment Workspace */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
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
