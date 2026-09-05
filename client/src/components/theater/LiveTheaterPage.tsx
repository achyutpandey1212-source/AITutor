import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Document as KnowledgeDoc, AssessmentSubmission } from '@ai-tutor/shared';
import { useLiveTutor, mapVoiceToAvatarState } from '../../hooks/useLiveTutor';
import { liveTutorApiClient } from '../../services/api.service';
import { TheaterHeader, type ActiveSurface } from './TheaterHeader';
import { TheaterStage } from './TheaterStage/TheaterStage';
import { TheaterDock } from './TheaterDock/TheaterDock';
import { MilestonesDrawer } from './TheaterDrawers/MilestonesDrawer';
import { TranscriptDrawer } from './TheaterDrawers/TranscriptDrawer';
import { TheaterSettingsSheet } from './TheaterDrawers/TheaterSettingsSheet';
import { LumoDoubtSolver } from './LumoDoubtSolver/LumoDoubtSolver';
import { SessionSummaryStage } from './Modals/SessionSummaryStage';
import type { ConceptStep } from './TheaterProgress/LessonProgress';
import { IconPause, IconPlay } from './TheaterIcons';
import type { CameraFramingState } from './Avatar/types';

export type InteractionState =
  | 'READY'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'PAUSED'
  | 'ERROR';

export interface LiveTheaterPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
  initialSessionId?: string;
  initialTopic?: string;
  initialSubject?: string;
  initialDocumentId?: string;
}

export const LiveTheaterPage: React.FC<LiveTheaterPageProps> = ({
  idToken,
  onNavigate,
  initialSessionId,
  initialTopic,
  initialSubject,
  initialDocumentId,
}) => {
  // Session parameters
  const [topicInput, _setTopicInput] = useState<string>(initialTopic || '');
  const [selectedSubject, _setSelectedSubject] = useState<string>(initialSubject || 'General');
  const [selectedDocumentId, _setSelectedDocumentId] = useState<string>(initialDocumentId || 'none');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');

  // Documents & Past Sessions
  const [userDocs, setUserDocs] = useState<KnowledgeDoc[]>([]);

  // Surface & Modal States (single active surface for mutual exclusivity)
  const [activeSurface, setActiveSurface] = useState<ActiveSurface>('none');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Pause & Replay States
  const [isPaused, setIsPaused] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayConceptName, setReplayConceptName] = useState<string | undefined>(undefined);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [cameraFraming] = useState<CameraFramingState>('medium');

  // Load User Documents
  useEffect(() => {
    let isMounted = true;
    async function loadDocs() {
      if (!idToken) return;
      try {
        const docs = await liveTutorApiClient.listDocuments(idToken);
        if (isMounted) {
          setUserDocs(docs.filter((d) => d.status === 'ready'));
        }
      } catch (err) {
        console.warn('[LiveTheater] Could not load documents:', err);
      }
    }
    loadDocs();
    return () => {
      isMounted = false;
    };
  }, [idToken]);

  const selectedDocObj = userDocs.find((d) => d.id === selectedDocumentId);

  // Core Live Tutor Hook Integration
  const {
    tutorState,
    session,
    sessionContext,
    activeAssessmentQuestion,
    isListening,
    isSpeaking,
    isInterrupting,
    isLoading,
    error,
    interimTranscript,
    micEnabled,
    toggleMic,
    resumeSession,
    pauseSession,
    endSession,
    submitTypedMessage,
    requestAssessmentHint,
    giveUpAssessment,
    visualState,
    captionsEnabled,
    toggleCaptions,
    replayTeachingSegment,
    explainAgain,
    explainDifferently,
    interruptTutor,
    isSttSupported,
  } = useLiveTutor({
    idToken,
    defaultTopic: topicInput || "Newton's Laws of Motion",
    defaultSubject: selectedSubject,
    defaultDocumentId: selectedDocumentId !== 'none' ? selectedDocumentId : undefined,
    defaultDocumentTitle: selectedDocObj?.filename,
    language: selectedLanguage,
  });

  // Auto-resume past session if initialSessionId is passed via URL
  const autoResumedRef = useRef(false);
  useEffect(() => {
    if (initialSessionId && idToken && !autoResumedRef.current && tutorState === 'IDLE' && !session) {
      autoResumedRef.current = true;
      resumeSession(initialSessionId);
    }
  }, [initialSessionId, idToken, tutorState, session, resumeSession]);

  // Pause Session Handler
  const handlePauseSession = async () => {
    setIsPaused(true);
    closeActiveSurface();
    await pauseSession();
  };

  // Resume Paused Session Handler
  const handleResumePausedSession = async () => {
    if (session?.id) {
      setIsPaused(false);
      await resumeSession(session.id);
    }
  };

  // End Session Handler
  const handleEndSession = async () => {
    setIsPaused(false);
    await endSession();
    setIsSummaryOpen(true);
  };

  // Deterministic Replay Handler
  const handleReplaySegment = async (segmentId: string) => {
    setIsReplaying(true);
    await replayTeachingSegment(segmentId);
  };

  // Explain Again Handler
  const handleExplainAgain = async () => {
    setIsReplaying(true);
    setReplayConceptName(sessionContext?.activeConcept || session?.topic);
    await explainAgain();
  };

  // Explain Differently Handler
  const handleExplainDifferently = async () => {
    setIsReplaying(false);
    await explainDifferently();
  };

  // Assessment Submission Handler
  const handleAssessmentSubmitted = async (submission: AssessmentSubmission) => {
    const feedbackMsg = submission.evaluation?.correct
      ? `I solved it correctly! Got ${submission.evaluation.score}/${submission.evaluation.maxScore}.`
      : `I attempted the question. Score: ${submission.evaluation?.score || 0}/${submission.evaluation?.maxScore || 1}. ${submission.evaluation?.feedback || ''}`;
    await submitTypedMessage(feedbackMsg);
  };

  // Close active surface
  const closeActiveSurface = () => {
    setActiveSurface('none');
  };

  // Derive dynamic pedagogical concept steps from session blueprint or concept history
  const conceptSteps: ConceptStep[] = useMemo(() => {
    if (sessionContext?.lessonBlueprint?.conceptSequence && sessionContext.lessonBlueprint.conceptSequence.length > 0) {
      return sessionContext.lessonBlueprint.conceptSequence.map((c, i) => {
        const isCompleted = sessionContext?.lessonProgress?.completedConceptIds?.includes(c.id);
        const isActive =
          sessionContext?.activeConcept === c.title ||
          (!isCompleted && i === (sessionContext?.lessonProgress?.completedConceptIds?.length || 0));
        return {
          id: c.id,
          number: String(i + 1).padStart(2, '0'),
          title: c.title,
          status: (isCompleted ? 'completed' : isActive ? 'active' : 'upcoming') as 'completed' | 'active' | 'upcoming',
        };
      });
    }

    // Default dynamic concept progression based on topic
    const topic = session?.topic || topicInput || "Newton's Laws of Motion";
    const isPhysicsMotion = topic.toLowerCase().includes('newton') || topic.toLowerCase().includes('law');
    const defaultTitles = isPhysicsMotion
      ? ['First Law', 'Second Law', 'Applications', 'Practice', 'Quiz']
      : ['Introduction', 'Core Principle', 'Key Applications', 'Practice Check', 'Mastery Quiz'];

    const activeIndex = sessionContext?.conversationHistory
      ? Math.min(Math.floor(sessionContext.conversationHistory.length / 3), defaultTitles.length - 1)
      : 1;

    return defaultTitles.map((title, i) => {
      const isCompleted = i < activeIndex;
      const isActive = i === activeIndex;
      return {
        id: `step-${i + 1}`,
        number: String(i + 1).padStart(2, '0'),
        title: title,
        status: (isCompleted ? 'completed' : isActive ? 'active' : 'upcoming') as 'completed' | 'active' | 'upcoming',
      };
    });
  }, [sessionContext, session?.topic, topicInput]);

  const activeIndex = conceptSteps.findIndex((s) => s.status === 'active');
  const conceptProgressPercent =
    conceptSteps.length > 0
      ? Math.round(((activeIndex >= 0 ? activeIndex + 1 : 2) / conceptSteps.length) * 100)
      : 40;
  const conceptProgressText = `${activeIndex >= 0 ? activeIndex + 1 : 2} of ${conceptSteps.length} concepts`;

  const activeConceptTitle =
    sessionContext?.activeConcept ||
    conceptSteps.find((s) => s.status === 'active')?.title ||
    visualState.concept ||
    "Newton's Second Law";

  const isSessionActive = (tutorState !== 'IDLE' || isPaused) && Boolean(session);
  const activeTopic = session?.topic || topicInput || "Newton's Laws of Motion";
  const activeSubject = session?.subject || selectedSubject || 'Physics';
  const activeDocTitle = sessionContext?.documentTitle || selectedDocObj?.filename;
  const avatarState = mapVoiceToAvatarState(tutorState);

  // Single source of truth for UI presentation interaction state
  const interactionState: InteractionState = useMemo(() => {
    if (error) return 'ERROR';
    if (isPaused) return 'PAUSED';
    if (tutorState === 'INTERRUPTING' || isInterrupting) return 'INTERRUPTED';
    if (tutorState === 'SPEAKING' || isSpeaking) return 'SPEAKING';
    if (tutorState === 'THINKING' || tutorState === 'CONNECTING' || isLoading) return 'THINKING';
    if (tutorState === 'LISTENING' || isListening) return 'LISTENING';
    return 'READY';
  }, [error, isPaused, tutorState, isInterrupting, isSpeaking, isLoading, isListening]);

  // Global Keyboard Shortcuts (M for mic, Esc to close/exit, Cmd/Ctrl+K to focus composer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      // Esc: Close any active surface or exit Focus Mode
      if (e.key === 'Escape') {
        if (activeSurface !== 'none') {
          e.preventDefault();
          closeActiveSurface();
          return;
        }
        if (isFocusMode) {
          e.preventDefault();
          setIsFocusMode(false);
          return;
        }
      }

      // Cmd/Ctrl + K: Focus dock composer input
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const composerInput = document.getElementById('dock-inline-composer-input');
        composerInput?.focus();
        return;
      }

      // M only: Toggle microphone (only when focus is outside text inputs)
      if (!isInputFocused && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (isSessionActive) {
          if (isSpeaking) {
            interruptTutor();
          } else {
            toggleMic();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeSurface,
    isFocusMode,
    isSessionActive,
    isSpeaking,
    interruptTutor,
    toggleMic,
  ]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--theater-bg)',
        color: 'var(--theater-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: 'var(--theater-font-sans)',
        transition: 'background-color var(--theater-transition-normal), color var(--theater-transition-normal)',
      }}
    >
      {/* 2. Top Header Utility Bar */}
      <TheaterHeader
        subject={activeSubject}
        topic={activeTopic}
        concept={activeConceptTitle}
        conceptProgressText={conceptProgressText}
        conceptProgressPercent={conceptProgressPercent}
        documentTitle={activeDocTitle}
        isFocusMode={isFocusMode}
        activeSurface={activeSurface}
        onExit={() => onNavigate('/dashboard')}
        onOpenDoubtSolver={() => setActiveSurface((prev) => (prev === 'ask_lumo' ? 'none' : 'ask_lumo'))}
        onOpenNotes={() => setActiveSurface((prev) => (prev === 'notes' ? 'none' : 'notes'))}
        onOpenTranscript={() => setActiveSurface((prev) => (prev === 'transcript' ? 'none' : 'transcript'))}
        onOpenSettings={() => setActiveSurface((prev) => (prev === 'settings' ? 'none' : 'settings'))}
      />

      {/* 3. Paused Session Notification Banner */}
      {isPaused && (
        <div
          style={{
            maxWidth: '1200px',
            width: 'min(1180px, 94vw)',
            margin: '0.6rem auto 0 auto',
            padding: '0.65rem 1.25rem',
            background: 'var(--theater-surface)',
            border: '1px solid var(--theater-border-medium)',
            borderRadius: 'var(--theater-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: 'var(--theater-shadow-dock)',
            zIndex: 35,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--theater-surface-elevated)',
                color: 'var(--theater-text-primary)',
                border: '1px solid var(--theater-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconPause size={13} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
                Lesson Paused
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)' }}>
                Your visual board, conversation history, and milestones are preserved.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleResumePausedSession}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--theater-accent)',
                color: 'var(--theater-accent-contrast)',
                fontWeight: 600,
                fontSize: '0.78rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--theater-radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity var(--theater-transition-fast)',
              }}
            >
              <IconPlay size={10} />
              <span>Resume Lesson</span>
            </button>
            <button
              onClick={handleEndSession}
              style={{
                background: 'transparent',
                border: '1px solid var(--theater-border-subtle)',
                color: 'var(--theater-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 500,
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--theater-radius-sm)',
                cursor: 'pointer',
                transition: 'all var(--theater-transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--theater-surface-hover)';
                e.currentTarget.style.color = 'var(--theater-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--theater-text-secondary)';
              }}
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {/* 4. Error Alert Banner */}
      {error && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0.5rem auto 0 auto',
            padding: '0.5rem 1.1rem',
            background: 'var(--theater-status-error-subtle)',
            border: '1px solid var(--theater-status-error)',
            borderRadius: 'var(--theater-radius-sm)',
            color: 'var(--theater-status-error)',
            fontSize: '0.82rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* 5. The Hero Classroom Stage Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isFocusMode ? '0.25rem 0.5rem' : '0.5rem 1.25rem 1.5rem 1.25rem',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'padding var(--theater-transition-stage)',
        }}
      >
        <TheaterStage
          visualState={visualState}
          activeAssessmentQuestion={activeAssessmentQuestion}
          idToken={idToken}
          sessionId={session?.id}
          avatarState={avatarState}
          interactionState={interactionState}
          isSpeaking={isSpeaking}
          isInterrupting={isInterrupting}
          isListening={isListening}
          isThinking={isLoading}
          framing={cameraFraming}
          captionsEnabled={captionsEnabled}
          interimTranscript={interimTranscript}
          onAssessmentSubmitted={handleAssessmentSubmitted}
          onRequestAssessmentHint={requestAssessmentHint}
          onGiveUpAssessment={giveUpAssessment}
          isLoadingAssessment={isLoading}
          isReplaying={isReplaying}
          replayConceptName={replayConceptName}
          onResumeLive={() => setIsReplaying(false)}
          conceptSteps={conceptSteps}
          onSelectConceptStep={(stepId) => {
            setIsReplaying(true);
            setReplayConceptName(conceptSteps.find((s) => s.id === stepId)?.title);
          }}
          isFocusMode={isFocusMode}
          onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
          onSendMessage={submitTypedMessage}
          dockSlot={
            isSessionActive ? (
              <TheaterDock
                micEnabled={micEnabled}
                interactionState={interactionState}
                isSpeaking={isSpeaking}
                isListening={isListening}
                isThinking={isLoading}
                isInterrupting={isInterrupting}
                isAssessmentActive={Boolean(activeAssessmentQuestion)}
                isReplaying={isReplaying}
                onToggleMic={toggleMic}
                onInterrupt={interruptTutor}
                onExplainAgain={handleExplainAgain}
                onExplainDifferently={handleExplainDifferently}
                onRequestHint={requestAssessmentHint}
                onGiveUpAssessment={giveUpAssessment}
                onResumeLive={() => setIsReplaying(false)}
                onOpenDoubtSolver={() => setActiveSurface((prev) => (prev === 'ask_lumo' ? 'none' : 'ask_lumo'))}
                onSendMessage={submitTypedMessage}
                isLoading={isLoading}
                isSttSupported={isSttSupported}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
              />
            ) : null
          }
        />
      </main>

      {/* 7. Session Timeline & Replay Navigation Workspace */}
      <MilestonesDrawer
        sessionId={session?.id}
        isOpen={activeSurface === 'notes'}
        onClose={closeActiveSurface}
        onReplaySegment={handleReplaySegment}
        idToken={idToken}
      />

      {/* 8. Conversation History Workspace */}
      <TranscriptDrawer
        conversationHistory={sessionContext?.conversationHistory}
        isOpen={activeSurface === 'transcript'}
        onClose={closeActiveSurface}
      />

      {/* 9. Session Preferences Modal */}
      <TheaterSettingsSheet
        isOpen={activeSurface === 'settings'}
        onClose={closeActiveSurface}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        captionsEnabled={captionsEnabled}
        onToggleCaptions={toggleCaptions}
        onPauseSession={handlePauseSession}
        onEndSession={handleEndSession}
      />

      {/* 10. Ask Lumo Doubt Solver Workspace */}
      <LumoDoubtSolver
        isOpen={activeSurface === 'ask_lumo'}
        onClose={closeActiveSurface}
        subject={activeSubject}
        topic={activeTopic}
        concept={activeConceptTitle}
        documentTitle={activeDocTitle}
        idToken={idToken}
        sessionId={session?.id}
      />

      {/* 12. Session Summary Celebration Stage */}
      {isSummaryOpen && (
        <SessionSummaryStage
          topic={activeTopic}
          subject={activeSubject}
          conceptsMastered={
            sessionContext?.conversationHistory
              ? [sessionContext.activeConcept || activeTopic]
              : [activeTopic]
          }
          onExitToDashboard={() => onNavigate('/dashboard')}
          onPracticeQuestions={() => onNavigate('/practice')}
        />
      )}
    </div>
  );
};
