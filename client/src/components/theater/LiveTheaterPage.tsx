import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Document as KnowledgeDoc, TeachingSession, AssessmentSubmission } from '@ai-tutor/shared';
import { useLiveTutor, mapVoiceToAvatarState } from '../../hooks/useLiveTutor';
import { liveTutorApiClient } from '../../services/api.service';
import { TheaterHeader } from './TheaterHeader';
import { TheaterStage } from './TheaterStage/TheaterStage';
import { TheaterDock } from './TheaterDock/TheaterDock';
import { MilestonesDrawer } from './TheaterDrawers/MilestonesDrawer';
import { TranscriptDrawer } from './TheaterDrawers/TranscriptDrawer';
import { StudyMaterialDrawer } from './TheaterDrawers/StudyMaterialDrawer';
import { TheaterSettingsSheet } from './TheaterDrawers/TheaterSettingsSheet';
import { LumoDoubtSolver } from './LumoDoubtSolver/LumoDoubtSolver';
import { LaunchpadModal } from './Modals/LaunchpadModal';
import { SessionSummaryStage } from './Modals/SessionSummaryStage';
import type { ConceptStep } from './TheaterProgress/LessonProgress';

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
  const [topicInput, setTopicInput] = useState<string>(initialTopic || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'Physics');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(initialDocumentId || 'none');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');

  // Documents & Past Sessions
  const [userDocs, setUserDocs] = useState<KnowledgeDoc[]>([]);
  const [pastSessions, setPastSessions] = useState<TeachingSession[]>([]);

  // Drawer & Modal States
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isDoubtSolverOpen, setIsDoubtSolverOpen] = useState(false);

  // Pause & Replay States
  const [isPaused, setIsPaused] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayConceptName, setReplayConceptName] = useState<string | undefined>(undefined);

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

  // Load Past Sessions
  useEffect(() => {
    if (!idToken) return;
    liveTutorApiClient
      .listTeachingSessions(idToken)
      .then((sessions) => setPastSessions(sessions))
      .catch((err) => console.warn('[LiveTheater] Could not load sessions:', err));
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
    startSession,
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

  // Start Session Handler
  const handleStartSession = async (
    topic: string,
    subject: string,
    language: 'english' | 'hindi' | 'hinglish',
    documentId?: string,
    documentTitle?: string
  ) => {
    setIsPaused(false);
    setTopicInput(topic);
    setSelectedSubject(subject);
    setSelectedLanguage(language);
    if (documentId) setSelectedDocumentId(documentId);
    await startSession(topic, language, subject, documentId, documentTitle);
  };

  // Resume Session Handler
  const handleResumeSession = async (sessionId: string) => {
    setIsPaused(false);
    await resumeSession(sessionId);
  };

  // Pause Session Handler
  const handlePauseSession = async () => {
    setIsPaused(true);
    closeAllDrawers();
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

  // Close all drawers
  const closeAllDrawers = () => {
    setIsMilestonesOpen(false);
    setIsTranscriptOpen(false);
    setIsDocumentOpen(false);
    setIsSettingsOpen(false);
    setIsDoubtSolverOpen(false);
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090D',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(30, 42, 64, 0.15) 0%, rgba(7, 9, 13, 0.98) 75%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      {/* 1. Pre-Session Launchpad Modal (when IDLE and not paused) */}
      {!isSessionActive && (
        <LaunchpadModal
          initialTopic={topicInput}
          initialSubject={selectedSubject}
          initialDocumentId={selectedDocumentId}
          userDocs={userDocs}
          pastSessions={pastSessions}
          onStartSession={handleStartSession}
          onResumeSession={handleResumeSession}
          isLoading={isLoading}
        />
      )}

      {/* 2. Top Header Utility Bar */}
      <TheaterHeader
        subject={activeSubject}
        topic={activeTopic}
        concept={activeConceptTitle}
        conceptProgressText={conceptProgressText}
        conceptProgressPercent={conceptProgressPercent}
        documentTitle={activeDocTitle}
        onExit={() => onNavigate('/dashboard')}
        onOpenDoubtSolver={() => {
          closeAllDrawers();
          setIsDoubtSolverOpen(true);
        }}
        onOpenNotes={() => {
          closeAllDrawers();
          setIsMilestonesOpen(true);
        }}
        onOpenMaterials={
          activeDocTitle
            ? () => {
                closeAllDrawers();
                setIsDocumentOpen(true);
              }
            : undefined
        }
        onOpenTranscript={() => {
          closeAllDrawers();
          setIsTranscriptOpen(true);
        }}
        onOpenSettings={() => {
          closeAllDrawers();
          setIsSettingsOpen(true);
        }}
      />

      {/* 3. Paused Session Notification Banner */}
      {isPaused && (
        <div
          style={{
            maxWidth: '1200px',
            width: 'min(1180px, 94vw)',
            margin: '0.6rem auto 0 auto',
            padding: '0.75rem 1.35rem',
            background: 'rgba(16, 16, 17, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(226, 157, 75, 0.35)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 16px rgba(226, 157, 75, 0.08)',
            zIndex: 35,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(226, 157, 75, 0.15)',
                border: '1px solid rgba(226, 157, 75, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E29D4B',
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              ⏸
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F5F2' }}>
                Lesson Paused
              </div>
              <div style={{ fontSize: '0.76rem', color: '#777773' }}>
                Your visual whiteboard, conversation state, and lesson progress are preserved.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleResumePausedSession}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#E29D4B',
                color: '#080808',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '0.48rem 1.15rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(226, 157, 75, 0.35)',
                transition: 'transform 0.15s ease, filter 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.filter = 'brightness(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <span>▶</span>
              <span>Resume Lesson</span>
            </button>
            <button
              onClick={handleEndSession}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#B8B8B3',
                fontSize: '0.8rem',
                fontWeight: 500,
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {/* 4. Error Alert Banner (Non-Technical, Graceful) */}
      {error && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0.5rem auto 0 auto',
            padding: '0.6rem 1.25rem',
            background: 'rgba(255, 90, 54, 0.12)',
            border: '1px solid rgba(255, 90, 54, 0.3)',
            borderRadius: '10px',
            color: '#FF8F78',
            fontSize: '0.85rem',
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
          padding: '0.75rem 1.5rem 6.5rem 1.5rem',
          position: 'relative',
        }}
      >
        <TheaterStage
          visualState={visualState}
          activeAssessmentQuestion={activeAssessmentQuestion}
          idToken={idToken}
          sessionId={session?.id}
          avatarState={avatarState}
          isSpeaking={isSpeaking}
          isInterrupting={isInterrupting}
          isListening={isListening}
          isThinking={isLoading}
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
        />
      </main>

      {/* 6. Floating Command Dock (Bottom Center Island) */}
      {isSessionActive && (
        <TheaterDock
          micEnabled={micEnabled}
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
          onOpenDoubtSolver={() => {
            closeAllDrawers();
            setIsDoubtSolverOpen(true);
          }}
          onSendMessage={submitTypedMessage}
          isLoading={isLoading}
          isSttSupported={isSttSupported}
        />
      )}

      {/* 7. Milestones Drawer */}
      <MilestonesDrawer
        sessionId={session?.id}
        isOpen={isMilestonesOpen}
        onClose={() => setIsMilestonesOpen(false)}
        onReplaySegment={handleReplaySegment}
        idToken={idToken}
      />

      {/* 8. Transcript Drawer */}
      <TranscriptDrawer
        conversationHistory={sessionContext?.conversationHistory}
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
      />

      {/* 9. Study Material Drawer */}
      <StudyMaterialDrawer
        documentTitle={activeDocTitle}
        documentId={session?.documentId || selectedDocumentId}
        isOpen={isDocumentOpen}
        onClose={() => setIsDocumentOpen(false)}
      />

      {/* 10. Settings Sheet */}
      <TheaterSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        captionsEnabled={captionsEnabled}
        onToggleCaptions={toggleCaptions}
        onPauseSession={handlePauseSession}
        onEndSession={handleEndSession}
      />

      {/* 11. Contextual Doubt Solver Modal/Drawer */}
      <LumoDoubtSolver
        isOpen={isDoubtSolverOpen}
        onClose={() => setIsDoubtSolverOpen(false)}
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
