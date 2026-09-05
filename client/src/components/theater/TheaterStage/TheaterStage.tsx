import React from 'react';
import type { TutorVisualState, ClientAssessmentQuestion, AssessmentSubmission, TutorAvatarState } from '@ai-tutor/shared';
import { VisualCanvas } from './VisualCanvas';
import { AssessmentStage } from './AssessmentStage';
import { TutorPresence } from './TutorPresence';
import type { CameraFramingState } from '../Avatar/types';
import { StageSubtitlePill } from './StageSubtitlePill';
import type { ConceptStep } from '../TheaterProgress/LessonProgress';
import { IconRefresh, IconMaximize, IconMinimize, IconPlus, IconMinus } from '../TheaterIcons';

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
  onSendMessage?: (msg: string) => void;
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
  isFocusMode = false,
  onToggleFocusMode,
  dockSlot,
  onSendMessage: _onSendMessage,
}) => {
  // Derive concept title & visual badge
  const conceptTitle = visualState.concept || visualState.topic || 'Refraction of Light';
  const visualTag = visualState.visualType
    ? visualState.visualType.replace(/_/g, ' ')
    : 'DYNAMIC SIMULATION';

  // Miko avatar zoom factor: 0.75x to 1.35x (default 1.0)
  const [mikoZoom, setMikoZoom] = React.useState<number>(1.0);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMikoZoom((prev) => Math.min(1.35, Math.round((prev + 0.1) * 100) / 100));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMikoZoom((prev) => Math.max(0.75, Math.round((prev - 0.1) * 100) / 100));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMikoZoom(1.0);
  };

  return (
    <div
      id="lumo-open-teaching-stage"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: isFocusMode ? '100%' : '1560px',
        margin: '0 auto',
        position: 'relative',
        minHeight: isFocusMode ? 'calc(100vh - 84px)' : 'calc(100vh - 110px)',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. ABOVE VISUAL AREA: Clean Context Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: isFocusMode ? 'min(1560px, calc((100vh - 140px) * 16 / 9), 96vw)' : 'min(860px, 88vw)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.2rem 0.4rem 0.6rem 0.4rem',
          boxSizing: 'border-box',
          transition: 'max-width var(--theater-transition-stage)',
          zIndex: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 650,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--theater-text-muted)',
              }}
            >
              {visualTag}
            </span>
            {isReplaying && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 550,
                  color: 'var(--theater-text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <IconRefresh size={10} />
                <span>Replaying: {replayConceptName || visualState.concept}</span>
                {onResumeLive && (
                  <button
                    onClick={onResumeLive}
                    style={{
                      background: 'var(--theater-surface-elevated)',
                      color: 'var(--theater-text-primary)',
                      border: '1px solid var(--theater-border-medium)',
                      borderRadius: 'var(--theater-radius-sm)',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: '0.25rem',
                    }}
                  >
                    Resume Live
                  </button>
                )}
              </span>
            )}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: isFocusMode ? '1.35rem' : '1.15rem',
              fontWeight: 650,
              color: 'var(--theater-text-primary)',
              letterSpacing: '-0.015em',
            }}
          >
            {conceptTitle}
          </h2>
        </div>

        {/* Top-Right Stage Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--theater-surface-elevated)',
                border: '1px solid var(--theater-border-medium)',
                borderRadius: 'var(--theater-radius-sm)',
                color: 'var(--theater-text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 550,
                padding: '0.35rem 0.7rem',
                cursor: 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-primary)';
                e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--theater-text-secondary)';
                e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
              }}
              title={isFocusMode ? 'Collapse to Standard View' : 'Enlarge Visual Area'}
            >
              {isFocusMode ? (
                <>
                  <IconMinimize size={12} />
                  <span>Standard View</span>
                </>
              ) : (
                <>
                  <IconMaximize size={12} />
                  <span>Enlarge</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. THE HERO VISUAL AREA (Expansive & Immersive Stage Canvas) */}
      <div
        id="lumo-video-player-frame"
        style={{
          width: isFocusMode ? 'min(1560px, calc((100vh - 140px) * 16 / 9), 96vw)' : 'min(860px, 88vw)',
          height: isFocusMode ? 'min(877px, calc(100vh - 140px))' : 'min(484px, 52vh)',
          aspectRatio: '16/9',
          background: '#0A0A0B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: isFocusMode ? '16px' : '18px',
          boxShadow: isFocusMode
            ? '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.06)'
            : '0 12px 36px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width var(--theater-transition-stage), height var(--theater-transition-stage), box-shadow var(--theater-transition-stage)',
          zIndex: 5,
        }}
      >
        <VisualCanvas
          visualState={visualState}
          captionsEnabled={false}
        />

        {/* Live Spoken Subtitle Overlay (inside player frame) */}
        <StageSubtitlePill
          captionText={visualState.captionText}
          interimTranscript={interimTranscript}
          isInterrupting={isInterrupting}
          isVisible={captionsEnabled || Boolean(interimTranscript) || isInterrupting || Boolean(visualState.captionText)}
          bottom="1.25rem"
          isStatic={false}
        />
      </div>

      {/* 4. TRANSPARENT STAGE PRESENCE — MIKO 3D AVATAR (Region 3, Free Standing) */}
      <div
        id="theater-miko-presence"
        style={{
          position: 'absolute',
          right: activeAssessmentQuestion ? 'min(430px, 35vw)' : (isFocusMode ? '1.5rem' : '0.5rem'),
          bottom: 0,
          top: 0,
          width: isFocusMode ? 'clamp(280px, 24vw, 400px)' : 'clamp(320px, 26vw, 440px)',
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
          zoom={mikoZoom}
        />
      </div>

      {/* Miko 3D Zoom Controls (Right Edge Floating Widget) */}
      <div
        id="miko-zoom-controls"
        style={{
          position: 'absolute',
          right: '1.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--theater-surface, #141518)',
          border: '1px solid var(--theater-border-medium, rgba(0, 0, 0, 0.15))',
          borderRadius: 'var(--theater-radius-pill, 9999px)',
          padding: '0.45rem 0.35rem',
          boxShadow: 'var(--theater-shadow-dock, 0 4px 16px rgba(0, 0, 0, 0.15))',
          backdropFilter: 'blur(10px)',
          userSelect: 'none',
        }}
      >
        <button
          onClick={handleZoomIn}
          disabled={mikoZoom >= 1.35}
          title="Zoom in on Miko (+)"
          style={{
            background: 'transparent',
            border: 'none',
            color: mikoZoom >= 1.35 ? 'var(--theater-text-muted, #8C8C90)' : 'var(--theater-text-primary, #121314)',
            cursor: mikoZoom >= 1.35 ? 'default' : 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: mikoZoom >= 1.35 ? 0.35 : 1,
            transition: 'background var(--theater-transition-fast), color var(--theater-transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (mikoZoom < 1.35) e.currentTarget.style.background = 'var(--theater-surface-hover, rgba(0,0,0,0.06))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <IconPlus size={14} />
        </button>

        <button
          onClick={handleResetZoom}
          title={`Zoom: ${Math.round(mikoZoom * 100)}% (Click to Reset)`}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--theater-text-muted, #8C8C90)',
            cursor: 'pointer',
            fontSize: '0.62rem',
            fontWeight: 600,
            fontFamily: 'var(--theater-font-mono, monospace)',
            padding: '0.15rem 0.2rem',
            borderRadius: '4px',
            lineHeight: 1,
            transition: 'color var(--theater-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-primary, #121314)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-muted, #8C8C90)';
          }}
        >
          {Math.round(mikoZoom * 100)}%
        </button>

        <button
          onClick={handleZoomOut}
          disabled={mikoZoom <= 0.75}
          title="Zoom out on Miko (-)"
          style={{
            background: 'transparent',
            border: 'none',
            color: mikoZoom <= 0.75 ? 'var(--theater-text-muted, #8C8C90)' : 'var(--theater-text-primary, #121314)',
            cursor: mikoZoom <= 0.75 ? 'default' : 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: mikoZoom <= 0.75 ? 0.35 : 1,
            transition: 'background var(--theater-transition-fast), color var(--theater-transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (mikoZoom > 0.75) e.currentTarget.style.background = 'var(--theater-surface-hover, rgba(0,0,0,0.06))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <IconMinus size={14} />
        </button>
      </div>

      {/* 5. ACTIVE ASSESSMENT STAGE (when quiz is active) */}
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

      {/* 6. FLOATING CONTROL SURFACE — COLLAPSIBLE DOCK */}
      {dockSlot && (
        <div
          id="lumo-dock-slot"
          style={{
            position: 'absolute',
            bottom: '1rem',
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
  );
};
