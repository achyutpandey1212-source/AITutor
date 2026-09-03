import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  TeachingSession,
  TeachingState,
  TeacherResponse,
  TutorSessionContext,
  LatencyMetrics,
  ClientAssessmentQuestion,
  TutorAction,
  TutorVisualState,
  TutorAvatarState,
  TutorVisualType,
  TutorVisualData,
  VisualBeat,
} from '@ai-tutor/shared';
import { speechToTextService } from '../services/stt.service';
import { textToSpeechService } from '../services/tts.service';
import { liveTutorApiClient } from '../services/api.service';
import { isMeaningfulBargeIn } from '../config/voice.config';

export type VoiceTutorState =
  | 'IDLE'
  | 'CONNECTING'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTING'
  | 'WAITING_FOR_STUDENT';

export function mapVoiceToAvatarState(state: VoiceTutorState): TutorAvatarState {
  switch (state) {
    case 'SPEAKING':
      return 'SPEAKING';
    case 'INTERRUPTING':
      return 'INTERRUPTING';
    case 'LISTENING':
    case 'WAITING_FOR_STUDENT':
      return 'LISTENING';
    case 'THINKING':
    case 'CONNECTING':
      return 'THINKING';
    case 'IDLE':
    default:
      return 'IDLE';
  }
}

export interface UseLiveTutorProps {
  idToken: string | null;
  defaultTopic?: string;
  defaultSubject?: string;
  defaultDocumentId?: string;
  defaultDocumentTitle?: string;
  language?: 'english' | 'hindi' | 'hinglish';
}

export function useLiveTutor({
  idToken,
  defaultTopic = "Newton's Laws",
  defaultSubject = "Physics",
  defaultDocumentId,
  defaultDocumentTitle,
  language = 'english',
}: UseLiveTutorProps) {
  const [tutorState, setTutorState] = useState<VoiceTutorState>('IDLE');
  const [session, setSession] = useState<TeachingSession | null>(null);
  const [sessionContext, setSessionContext] = useState<TutorSessionContext | null>(null);
  const [teachingState, setTeachingState] = useState<TeachingState | null>(null);
  const [teacherResponse, setTeacherResponse] = useState<TeacherResponse | null>(null);
  const [activeAssessmentQuestion, setActiveAssessmentQuestion] = useState<ClientAssessmentQuestion | null>(null);
  const [activeTutorAction, setActiveTutorAction] = useState<TutorAction | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [micEnabled, setMicEnabled] = useState<boolean>(true);

  // Persistent Remotion Visual Classroom State
  const [visualState, setVisualState] = useState<TutorVisualState>({
    sessionId: '',
    topic: defaultTopic,
    concept: 'Introduction',
    mode: 'IDLE',
    avatarState: 'IDLE',
    visualType: 'TITLE',
    visualData: {
      title: defaultTopic,
      subtitle: 'Interactive AI Visual Classroom',
    },
    // Phase 2.6: beat and caption segmentation defaults
    activeBeatIndex: 0,
    activeCaptionIndex: 0,
    totalBeats: 1,
    // Phase 3: Accessibility toggle (default: false)
    captionsEnabled: false,
  });

  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const toggleCaptions = useCallback(() => {
    setCaptionsEnabled((prev) => {
      const next = !prev;
      setVisualState((vs) => ({ ...vs, captionsEnabled: next }));
      return next;
    });
  }, []);

  // Synchronize avatarState with voice tutor state (IDLE, SPEAKING, LISTENING, THINKING, INTERRUPTING)
  useEffect(() => {
    setVisualState((prev) => ({
      ...prev,
      avatarState: mapVoiceToAvatarState(tutorState),
    }));
  }, [tutorState]);

  const [latencies, setLatencies] = useState<LatencyMetrics | null>(null);
  const [timestamps, setTimestamps] = useState<{ [key: string]: number }>({});

  const stateRef = useRef<VoiceTutorState>(tutorState);
  stateRef.current = tutorState;

  const sessionRef = useRef<TeachingSession | null>(session);
  sessionRef.current = session;

  const languageRef = useRef(language);
  languageRef.current = language;

  const lastSpokenTextRef = useRef<string>(lastSpokenText);
  lastSpokenTextRef.current = lastSpokenText;

  const micEnabledRef = useRef<boolean>(micEnabled);
  micEnabledRef.current = micEnabled;

  const activeTurnIdRef = useRef<string | null>(null);

  // Phase 2.6: Visual beat orchestration refs
  const beatTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeBeatSequenceRef = useRef<VisualBeat[]>([]);
  const activeBeatIndexRef = useRef<number>(0);

  // Phase 2.6: Caption segment cycling refs
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionSegmentsRef = useRef<string[]>([]);
  const activeCaptionIndexRef = useRef<number>(0);

  /** Cancel all pending beat advancement timers (called on barge-in or new turn) */
  const cancelBeatTimers = useCallback(() => {
    beatTimersRef.current.forEach((t) => clearTimeout(t));
    beatTimersRef.current = [];
    if (captionTimerRef.current) {
      clearTimeout(captionTimerRef.current);
      captionTimerRef.current = null;
    }
  }, []);

  /** Apply a single beat to the visual state */
  const applyBeat = useCallback((beat: VisualBeat, beatIndex: number, totalBeats: number) => {
    setVisualState((prev) => ({
      ...prev,
      visualType: beat.type,
      visualData: (beat.data || {}) as TutorVisualData,
      activeBeatIndex: beatIndex,
      totalBeats,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  /**
   * Phase 2.6: Start the visual beat sequence for a turn.
   * Beat 0 is applied immediately, then subsequent beats are queued on timers.
   * Each beat with durationHint > 0 auto-advances to the next beat.
   */
  const startBeatSequence = useCallback((beats: VisualBeat[], turnId: string) => {
    // Cancel any currently running beat timers from the previous turn
    cancelBeatTimers();
    if (!beats || beats.length === 0) return;

    activeBeatSequenceRef.current = beats;
    activeBeatIndexRef.current = 0;

    // Apply beat 0 immediately
    applyBeat(beats[0], 0, beats.length);

    // Schedule subsequent beats
    let cumulativeDelay = 0;
    for (let i = 1; i < beats.length; i++) {
      const prevBeat = beats[i - 1];
      if (!prevBeat.durationHint || prevBeat.durationHint <= 0) {
        // No auto-advance from this beat — stop scheduling
        break;
      }
      cumulativeDelay += prevBeat.durationHint;
      const beatIndex = i;
      const timer = setTimeout(() => {
        // Only advance if this turn is still active
        if (activeTurnIdRef.current !== turnId) return;
        activeBeatIndexRef.current = beatIndex;
        applyBeat(beats[beatIndex], beatIndex, beats.length);
      }, cumulativeDelay);
      beatTimersRef.current.push(timer);
    }
  }, [cancelBeatTimers, applyBeat]);

  /**
   * Phase 2.6: Split captionText into sentence segments and cycle them.
   * E.g. "When light enters glass. It slows down. The angle changes." → 3 captions.
   */
  const startCaptionCycle = useCallback((captionText: string, turnId: string) => {
    if (captionTimerRef.current) {
      clearTimeout(captionTimerRef.current);
      captionTimerRef.current = null;
    }

    if (!captionText || captionText.trim().length === 0) {
      setVisualState((prev) => ({ ...prev, captionText: '', captionSegments: [], activeCaptionIndex: 0 }));
      return;
    }

    // Split on sentence boundaries (. ! ?) while preserving the delimiter
    const rawSegments = captionText.match(/[^.!?]+[.!?]?/g) || [captionText];
    const segments = rawSegments
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    if (segments.length === 0) {
      setVisualState((prev) => ({ ...prev, captionText: captionText.trim(), captionSegments: [captionText.trim()], activeCaptionIndex: 0 }));
      return;
    }

    captionSegmentsRef.current = segments;
    activeCaptionIndexRef.current = 0;

    // Display segment 0 immediately
    setVisualState((prev) => ({
      ...prev,
      captionText: segments[0],
      captionSegments: segments,
      activeCaptionIndex: 0,
    }));

    // Cycle through subsequent segments
    if (segments.length > 1) {
      const cycleNext = (idx: number) => {
        if (activeTurnIdRef.current !== turnId) return;
        if (idx >= segments.length) return;
        activeCaptionIndexRef.current = idx;
        setVisualState((prev) => ({
          ...prev,
          captionText: segments[idx],
          activeCaptionIndex: idx,
        }));
        if (idx + 1 < segments.length) {
          // ~3 seconds per segment
          captionTimerRef.current = setTimeout(() => cycleNext(idx + 1), 3000);
        }
      };
      captionTimerRef.current = setTimeout(() => cycleNext(1), 3000);
    }
  }, []);

  const setMicrophoneEnabled = useCallback((enabled: boolean) => {
    setMicEnabled(enabled);
    micEnabledRef.current = enabled;
    if (!enabled) {
      speechToTextService.pauseCapture();
      setInterimTranscript('');
      setFinalTranscript('');
    } else {
      if (sessionRef.current && stateRef.current !== 'IDLE' && stateRef.current !== 'THINKING') {
        if (stateRef.current !== 'SPEAKING') {
          speechToTextService.resumeCapture();
        }
      }
    }
  }, []);

  const toggleMic = useCallback(() => {
    setMicrophoneEnabled(!micEnabledRef.current);
  }, [setMicrophoneEnabled]);

  // Internal turn submitter
  const submitTurn = useCallback(
    async (textToSend: string, activeSessionId?: string, selectedLang = languageRef.current) => {
      const targetSessionId = activeSessionId || sessionRef.current?.id;
      if (!idToken) {
        setError('Sign in required.');
        setTutorState('IDLE');
        return;
      }
      if (!targetSessionId) {
        setError('No active teaching session. Please start a session first.');
        setTutorState('IDLE');
        return;
      }
      if (!textToSend.trim()) {
        return;
      }

      setTutorState('THINKING');
      setError(null);
      // Pause microphone capture during active backend network call
      speechToTextService.pauseCapture();

      const t3 = Date.now();

      try {
        const response = await liveTutorApiClient.sendVoiceInteraction(idToken, targetSessionId, {
          transcript: textToSend.trim(),
          language: selectedLang,
        });

        const t5 = Date.now();
        setTeacherResponse(response.teacherResponse);
        setTeachingState(response.teachingState);
        setLastSpokenText(response.normalizedSpeechText);

        if (response.sessionContext) {
          setSessionContext(response.sessionContext);
        }

        if (response.assessmentQuestion) {
          setActiveAssessmentQuestion(response.assessmentQuestion);
        } else if (
          response.tutorAction?.type === 'EXPLAIN' ||
          response.tutorAction?.type === 'CONTINUE_TEACHING' ||
          response.tutorAction?.type === 'ASK_CONVERSATIONAL' ||
          response.tutorAction?.type === 'SPEAK'
        ) {
          setActiveAssessmentQuestion(null);
        }

        if (response.tutorAction) {
          setActiveTutorAction(response.tutorAction);
        }

        // ── Phase 2.6: Visual Classroom Orchestration ──────────────────────────────
        // All visual selection is now driven by the server-provided visualBeats or
        // primary visual. No regex fallbacks. No teacher script on the blackboard.
        // ─────────────────────────────────────────────────────────────────────────

        const currentTurnId = response.turnId || `turn_${Date.now()}`;
        activeTurnIdRef.current = currentTurnId;

        if (response.assessmentQuestion || response.tutorAction?.type === 'ASK_ASSESSMENT') {
          // Assessment mode: cancel beats, keep current visual board intact on left panel
          cancelBeatTimers();
          setVisualState((prev) => ({
            ...prev,
            mode: 'ASSESSMENT',
            concept: response.assessmentQuestion?.concept || prev.concept,
            lastUpdated: new Date().toISOString(),
          }));
        } else {
          // Teaching mode: orchestrate visual beats
          const teachingContent = response.teachingContent;
          const responseBeats: any[] = response.visualBeats || teachingContent?.visualBeats || [];
          const primaryVisual = response.visualPayload || response.teacherResponse?.visual || teachingContent?.visual;

          if (responseBeats.length > 0) {
            // Server provided multi-beat sequence → start beat orchestration
            startBeatSequence(responseBeats as any, currentTurnId);
          } else if (primaryVisual && primaryVisual.type) {
            // Single visual from server → apply directly as one beat
            setVisualState((prev) => ({
              ...prev,
              sessionId: targetSessionId,
              topic: response.sessionContext?.topic || prev.topic,
              concept: response.sessionContext?.activeConcept || response.teachingState?.currentConcept || prev.concept,
              mode: (response.sessionContext?.currentMode as any) || 'TEACHING',
              visualType: (primaryVisual.type as TutorVisualType),
              visualData: ((primaryVisual.data && typeof primaryVisual.data === 'object') ? primaryVisual.data : {}) as TutorVisualData,
              turnId: currentTurnId,
              activeBeatIndex: 0,
              totalBeats: 1,
              lastUpdated: new Date().toISOString(),
            }));
          }
          // Note: if no visual was provided, the previous visual remains — intentional persistence

          // Caption cycle: segment and cycle captionText sentence by sentence
          const captionText =
            response.captionText ||
            response.teacherResponse?.captionText ||
            teachingContent?.captionText ||
            '';
          startCaptionCycle(captionText, currentTurnId);

          // Update concept and mode independently of visual
          setVisualState((prev) => ({
            ...prev,
            sessionId: targetSessionId,
            topic: response.sessionContext?.topic || prev.topic,
            concept: response.sessionContext?.activeConcept || response.teachingState?.currentConcept || prev.concept,
            mode: (response.sessionContext?.currentMode as any) || 'TEACHING',
            turnId: currentTurnId,
          }));
        }

        const backendDuration = t5 - t3;
        const totalPerceived = timestamps.t0 ? t5 - timestamps.t0 : backendDuration;

        setLatencies({
          backendDurationMs: backendDuration,
          aiGenerationMs: response.latency?.aiGenerationMs,
          totalPerceivedLatencyMs: totalPerceived,
        });

        // Trigger TTS Output and resume STT in Barge-In listening mode only if mic is enabled
        setTutorState('SPEAKING');
        if (micEnabledRef.current) {
          speechToTextService.resumeCapture();
        }
        const t6 = Date.now();

        const isWaitingForAnswer = response.tutorAction?.type === 'ASK_ASSESSMENT' ||
          response.tutorAction?.type === 'WAIT_FOR_ANSWER' ||
          Boolean(response.assessmentQuestion);

        // currentTurnId is already assigned above in the visual orchestration block
        const speechToSpeak =
          response.speechText ||
          response.normalizedSpeechText ||
          response.teacherResponse?.speechText ||
          response.teacherResponse?.responseText ||
          '';

        textToSpeechService.speak(speechToSpeak, selectedLang, {
          onStart: () => {
            if (activeTurnIdRef.current !== currentTurnId) return;
            const t7 = Date.now();
            setLatencies((prev) => ({ ...prev, ttsDurationMs: t7 - t6 }));
          },
          onEnd: () => {
            if (activeTurnIdRef.current !== currentTurnId) return;
            // Phase 2.6: clear captions and beat timers when TTS finishes
            cancelBeatTimers();
            setVisualState((prev) => ({ ...prev, captionText: undefined }));
            if (stateRef.current === 'SPEAKING') {
              setTutorState(isWaitingForAnswer ? 'WAITING_FOR_STUDENT' : 'LISTENING');
              setInterimTranscript('');
              setFinalTranscript('');
              if (micEnabledRef.current) {
                speechToTextService.resumeCapture();
              } else {
                speechToTextService.pauseCapture();
              }
            }
          },
          onError: (ttsErr) => {
            if (activeTurnIdRef.current !== currentTurnId) return;
            // Phase 2.6: clear captions and beat timers on TTS error
            cancelBeatTimers();
            setVisualState((prev) => ({ ...prev, captionText: undefined }));
            console.warn('[LiveTutor] TTS audio warning:', ttsErr);
            if (stateRef.current === 'SPEAKING') {
              setTutorState(isWaitingForAnswer ? 'WAITING_FOR_STUDENT' : 'LISTENING');
              setInterimTranscript('');
              setFinalTranscript('');
              if (micEnabledRef.current) {
                speechToTextService.resumeCapture();
              } else {
                speechToTextService.pauseCapture();
              }
            }
          },
        });
      } catch (err: any) {
        setError(err.message || 'Error processing teacher response');
        setTutorState('LISTENING');
        if (micEnabledRef.current) {
          speechToTextService.resumeCapture();
        }
      }
    },
    [idToken, timestamps]
  );

  // Starts the continuous STT listener with Barge-In capability
  const startListeningLoop = useCallback(() => {
    speechToTextService.setLanguage(languageRef.current);

    speechToTextService.start({
      onInterimTranscript: (interim) => {
        if (!micEnabledRef.current) return;
        setInterimTranscript(interim);
        if (stateRef.current === 'SPEAKING' && isMeaningfulBargeIn(interim, lastSpokenTextRef.current)) {
          activeTurnIdRef.current = null;
          cancelBeatTimers();
          textToSpeechService.cancel();
          setVisualState((prev) => ({ ...prev, captionText: undefined }));
          setTutorState('INTERRUPTING');
        }
      },
      onFinalTranscript: (final) => {
        if (!micEnabledRef.current) return;
        setFinalTranscript(final);
        if (stateRef.current === 'SPEAKING' && isMeaningfulBargeIn(final, lastSpokenTextRef.current)) {
          activeTurnIdRef.current = null;
          cancelBeatTimers();
          textToSpeechService.cancel();
          setVisualState((prev) => ({ ...prev, captionText: undefined }));
          setTutorState('INTERRUPTING');
        }
      },
      onSpeechTurnDetected: (turnTranscript) => {
        if (!micEnabledRef.current) return;
        const trimmed = turnTranscript.trim();
        if (!trimmed) return;

        if (stateRef.current === 'SPEAKING') {
          if (!isMeaningfulBargeIn(trimmed, lastSpokenTextRef.current)) {
            return;
          }
          activeTurnIdRef.current = null;
          cancelBeatTimers();
          textToSpeechService.cancel();
          setVisualState((prev) => ({ ...prev, captionText: undefined }));
        }

        if (['LISTENING', 'SPEAKING', 'INTERRUPTING', 'WAITING_FOR_STUDENT'].includes(stateRef.current)) {
          const t0 = Date.now();
          setTimestamps({ t0 });
          submitTurn(trimmed);
        }
      },
      onError: (errMessage) => {
        if (micEnabledRef.current) {
          setError(errMessage);
        }
      },
      onStateChange: () => {},
    });

    if (!micEnabledRef.current) {
      speechToTextService.pauseCapture();
    }
    setTutorState('LISTENING');
  }, [submitTurn]);

  // Starts a new Teaching Session
  const startSession = useCallback(
    async (
      topicToTeach = defaultTopic,
      targetLang = language,
      targetSubject = defaultSubject,
      targetDocumentId?: string,
      targetDocumentTitle?: string
    ) => {
      if (!idToken) {
        setError('Authentication required to start a session.');
        return null;
      }

      setTutorState('CONNECTING');
      setError(null);
      setTeacherResponse(null);
      setInterimTranscript('');
      setFinalTranscript('');
      setActiveAssessmentQuestion(null);
      setActiveTutorAction(null);

      try {
        const newSession = await liveTutorApiClient.createSession(idToken, {
          topic: topicToTeach,
          subject: targetSubject,
          documentId: targetDocumentId || defaultDocumentId,
          documentTitle: targetDocumentTitle || defaultDocumentTitle,
          learnerProfile: {
            preferredLanguage: targetLang,
            educationLevel: 'beginner',
            learningGoal: `Understand fundamentals of ${topicToTeach}`,
            explanationStyle: 'simple',
          },
        });

        setSession(newSession);
        setTeachingState(newSession.teachingState);

        setSessionContext({
          sessionId: newSession.id,
          userId: newSession.userId,
          subject: targetSubject,
          topic: newSession.topic,
          language: newSession.language,
          documentId: newSession.documentId,
          documentTitle: newSession.documentTitle,
          conversationHistory: newSession.conversationHistory || [],
          activeConcept: newSession.currentConcept || newSession.topic,
          teachingState: newSession.teachingState,
          currentMode: newSession.currentMode || 'TEACHING',
          assessmentStatus: newSession.assessmentStatus || 'NONE',
          updatedAt: newSession.updatedAt,
        });

        // Initialize Remotion Visual Classroom with new session topic
        setVisualState({
          sessionId: newSession.id,
          topic: newSession.topic,
          concept: newSession.currentConcept || newSession.topic,
          mode: 'TEACHING',
          avatarState: 'THINKING',
          visualType: 'TITLE',
          visualData: {
            title: newSession.topic,
            subtitle: `Subject: ${targetSubject} • Interactive AI Classroom`,
          },
          lastUpdated: new Date().toISOString(),
          activeBeatIndex: 0,
          activeCaptionIndex: 0,
          totalBeats: 1,
          captionsEnabled: false,
        });

        startListeningLoop();
        return newSession;
      } catch (err: any) {
        setError(err.message || 'Failed to create teaching session');
        setTutorState('IDLE');
        return null;
      }
    },
    [idToken, defaultTopic, language, defaultSubject, defaultDocumentId, defaultDocumentTitle, startListeningLoop]
  );

  // Resumes an existing previous Teaching Session
  const resumeSession = useCallback(
    async (sessionId: string) => {
      if (!idToken) {
        setError('Authentication required to resume session.');
        return null;
      }

      setTutorState('CONNECTING');
      setError(null);
      setInterimTranscript('');
      setFinalTranscript('');
      setActiveAssessmentQuestion(null);

      try {
        const { session: resumedSession, context } = await liveTutorApiClient.resumeTeachingSession(idToken, sessionId);
        setSession(resumedSession);
        setSessionContext(context);
        setTeachingState(resumedSession.teachingState);

        // Restore Remotion Visual Classroom logical state from resumed session
        setVisualState({
          sessionId: resumedSession.id,
          topic: resumedSession.topic,
          concept: resumedSession.currentConcept || resumedSession.topic,
          mode: (context.currentMode as any) || 'TEACHING',
          avatarState: 'LISTENING',
          visualType: context.currentMode === 'ASSESSMENT' ? 'DIAGRAM' : 'TITLE',
          visualData: {
            title: resumedSession.topic,
            subtitle: `Resumed Session • Concept: ${resumedSession.currentConcept || resumedSession.topic}`,
          },
          lastUpdated: new Date().toISOString(),
          activeBeatIndex: 0,
          activeCaptionIndex: 0,
          totalBeats: 1,
          captionsEnabled: false,
        });

        // If there was an active assessment question in the session, restore it
        if (context.currentQuestionId && context.currentMode === 'ASSESSMENT') {
          try {
            const q = await liveTutorApiClient.getQuestion(idToken, context.currentQuestionId);
            setActiveAssessmentQuestion(q);
            setTutorState('WAITING_FOR_STUDENT');
          } catch (qErr) {
            console.warn('[LiveTutor] Could not restore active assessment question:', qErr);
          }
        }

        startListeningLoop();
        return resumedSession;
      } catch (err: any) {
        setError(err.message || 'Failed to resume session');
        setTutorState('IDLE');
        return null;
      }
    },
    [idToken, startListeningLoop]
  );

  // Pauses current session
  const pauseSession = useCallback(async () => {
    speechToTextService.stop();
    textToSpeechService.cancel();
    if (session && idToken) {
      try {
        await liveTutorApiClient.updateTeachingSession(idToken, session.id, { status: 'paused' });
      } catch {
        // ignore
      }
    }
    setTutorState('IDLE');
    setVisualState((prev) => ({
      ...prev,
      mode: 'IDLE',
      avatarState: 'IDLE',
    }));
  }, [session, idToken]);

  // Gracefully ends active session
  const endSession = useCallback(async () => {
    speechToTextService.stop();
    textToSpeechService.cancel();
    if (session && idToken) {
      try {
        await liveTutorApiClient.updateTeachingSession(idToken, session.id, { status: 'completed' });
      } catch {
        // ignore
      }
    }
    setTutorState('IDLE');
    setInterimTranscript('');
    setFinalTranscript('');
    setActiveAssessmentQuestion(null);
    setVisualState((prev) => ({
      ...prev,
      mode: 'IDLE',
      avatarState: 'IDLE',
    }));
  }, [session, idToken]);

  // Sends typed fallback text message
  const submitTypedMessage = useCallback(
    async (msg: string) => {
      if (!msg.trim()) return;
      if (tutorState === 'SPEAKING') {
        textToSpeechService.cancel();
      }
      setFinalTranscript(msg);
      await submitTurn(msg);
    },
    [submitTurn, tutorState]
  );

  // Requests a hint for active assessment
  const requestAssessmentHint = useCallback(async () => {
    await submitTypedMessage('Can you give me a hint for this question?');
  }, [submitTypedMessage]);

  // Gives up on active assessment
  const giveUpAssessment = useCallback(async () => {
    await submitTypedMessage("I can't solve this question. Please explain the solution.");
  }, [submitTypedMessage]);

  // Submits assessment answer via AssessmentRenderer
  const submitAssessmentAnswer = useCallback(
    async (submissionPayload: import('@ai-tutor/shared').AssessmentSubmissionRequest) => {
      if (!idToken || !activeAssessmentQuestion) return null;
      setTutorState('THINKING');
      try {
        const submission = await liveTutorApiClient.submitAssessmentAnswer(
          idToken,
          activeAssessmentQuestion.questionId,
          submissionPayload
        );
        setActiveAssessmentQuestion(null);
        setTutorState('LISTENING');
        // Announce feedback back to live tutor loop
        if (submission.evaluation) {
          const feedbackMsg = submission.evaluation.correct
            ? `I solved it correctly! Got ${submission.evaluation.score}/${submission.evaluation.maxScore}.`
            : `I attempted the question. Score: ${submission.evaluation.score}/${submission.evaluation.maxScore}. ${submission.evaluation.feedback}`;
          await submitTurn(feedbackMsg);
        }
        return submission;
      } catch (subErr: any) {
        setError(subErr.message || 'Failed to submit answer');
        setTutorState('WAITING_FOR_STUDENT');
        return null;
      }
    },
    [idToken, activeAssessmentQuestion, submitTurn]
  );

  // Replays last audio
  const replaySpeech = useCallback(() => {
    if (lastSpokenText && tutorState !== 'SPEAKING') {
      speechToTextService.pauseCapture();
      setTutorState('SPEAKING');

      textToSpeechService.speak(lastSpokenText, languageRef.current, {
        onStart: () => {},
        onEnd: () => {
          setTutorState(activeAssessmentQuestion ? 'WAITING_FOR_STUDENT' : 'LISTENING');
          speechToTextService.resumeCapture();
        },
        onError: () => {
          setTutorState(activeAssessmentQuestion ? 'WAITING_FOR_STUDENT' : 'LISTENING');
          speechToTextService.resumeCapture();
        },
      });
    }
  }, [lastSpokenText, tutorState, activeAssessmentQuestion]);

  // Phase 3: Replays a stored visual history segment deterministically
  const replayVisualSegment = useCallback(
    async (visualId: string) => {
      const currentSessionId = sessionRef.current?.id;
      if (!idToken || !currentSessionId) return;
      try {
        const token = idToken;
        const res = await fetch(
          `/api/teaching/sessions/${currentSessionId}/visual-history/${visualId}/replay`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const json = await res.json();
        if (json.success && json.data) {
          const replayData = json.data;
          // Set visual state to initial replay beat
          if (replayData.visualBeats && replayData.visualBeats.length > 0) {
            const firstBeat = replayData.visualBeats[0];
            setVisualState((prev) => ({
              ...prev,
              visualType: firstBeat.type,
              visualData: firstBeat.data,
              activeBeatIndex: 0,
              totalBeats: replayData.visualBeats.length,
            }));
            startBeatSequence(replayData.visualBeats, replayData.turnId || `replay_${visualId}`);
          }

          // If speech exists, trigger playback
          if (replayData.speechText) {
            speechToTextService.pauseCapture();
            setTutorState('SPEAKING');
            textToSpeechService.speak(replayData.speechText, languageRef.current, {
              onStart: () => {},
              onEnd: () => {
                setTutorState('LISTENING');
                speechToTextService.resumeCapture();
              },
              onError: () => {
                setTutorState('LISTENING');
                speechToTextService.resumeCapture();
              },
            });
          }
        }
      } catch (err: any) {
        console.warn('[useLiveTutor] Replay segment failed:', err);
      }
    },
    [idToken, startBeatSequence]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      speechToTextService.stop();
      textToSpeechService.cancel();
    };
  }, []);

  return {
    tutorState,
    session,
    sessionContext,
    teachingState,
    teacherResponse,
    activeAssessmentQuestion,
    activeTutorAction,
    isListening: tutorState === 'LISTENING',
    isSpeaking: tutorState === 'SPEAKING',
    isInterrupting: tutorState === 'INTERRUPTING',
    isWaitingForStudent: tutorState === 'WAITING_FOR_STUDENT',
    isLoading: tutorState === 'CONNECTING' || tutorState === 'THINKING',
    error,
    interimTranscript,
    finalTranscript,
    latencies,
    micEnabled,
    setMicEnabled: setMicrophoneEnabled,
    toggleMic,
    startSession,
    resumeSession,
    pauseSession,
    endSession,
    submitTypedMessage,
    requestAssessmentHint,
    giveUpAssessment,
    submitAssessmentAnswer,
    replaySpeech,
    visualState,
    setVisualState,
    captionsEnabled,
    toggleCaptions,
    replayVisualSegment,
    isSttSupported: speechToTextService.isSupported(),
    isTtsSupported: textToSpeechService.isSupported(),
  };
}
