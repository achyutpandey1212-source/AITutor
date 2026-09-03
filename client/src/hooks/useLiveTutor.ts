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
  });

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

        // Synchronize Remotion Visual Classroom with pedagogical state
        const textLower = response.teacherResponse.responseText.toLowerCase();
        let nextVisualType: TutorVisualType = 'TEXT';
        let nextVisualData: any = {
          heading: response.sessionContext?.activeConcept || response.teachingState?.currentConcept || 'Core Concept',
          text: response.teacherResponse.responseText.slice(0, 240),
          bullets: [
            'Teacher explanation synchronized with live speech.',
            'Interrupt anytime to ask questions or request examples.',
          ],
        };

        if (response.assessmentQuestion || response.tutorAction?.type === 'ASK_ASSESSMENT') {
          // Assessment mode: keep current visual board intact on left panel!
          setVisualState((prev) => ({
            ...prev,
            mode: 'ASSESSMENT',
            concept: response.assessmentQuestion?.concept || prev.concept,
            lastUpdated: new Date().toISOString(),
          }));
        } else {
          // Check if teacher produced structured visual or fallback to blueprint
          const teacherVisual = response.visualPayload || response.teacherResponse?.visual;
          if (teacherVisual && teacherVisual.type) {
            nextVisualType = (teacherVisual.type as any) || 'TITLE';
            nextVisualData = teacherVisual.data || teacherVisual;
          } else {
            // Check blueprint visual requirements first as single source of truth
            const bp = response.sessionContext?.lessonBlueprint;
            const currentConceptId =
              response.sessionContext?.lessonProgress?.currentConceptId ||
              bp?.conceptSequence?.[0]?.id;
            const bpVisualReq = bp?.visualRequirements?.find(
              (v: any) => v.conceptId === currentConceptId && v.visualType !== 'NONE'
            );

            if (bpVisualReq?.visualType === 'FORMULA') {
              nextVisualType = 'FORMULA';
              nextVisualData = {
                formulaLabel: bpVisualReq.purpose.toUpperCase(),
                formula: bpVisualReq.keyElements?.[0] || 'Formula',
                concept: response.sessionContext?.activeConcept || "Mathematical Formula",
                explanation: bpVisualReq.purpose,
                variables: (bpVisualReq.keyElements || []).map((el: string) => ({
                  symbol: el,
                  meaning: el,
                })),
              };
            } else if (bpVisualReq?.visualType === 'DIAGRAM') {
              nextVisualType = 'DIAGRAM';
              nextVisualData = {
                heading: bpVisualReq.purpose,
                concept: response.sessionContext?.activeConcept || 'Visual Diagram',
                elements: bpVisualReq.keyElements || [],
              };
            } else if (/\b(snell|formula|equation|sin\b|ratio|\b=|\blaw of refraction)\b/i.test(textLower)) {
              nextVisualType = 'FORMULA';
              nextVisualData = {
                formulaLabel: "SNELL'S LAW OF REFRACTION",
                formula: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
                concept: response.sessionContext?.activeConcept || "Snell's Law",
                explanation: 'The ratio of sine of incidence to sine of refraction is constant across media.',
                variables: [
                  { symbol: 'n₁', meaning: 'Index of medium 1 (Air ≈ 1.0)' },
                  { symbol: 'θ₁', meaning: 'Angle of incidence' },
                  { symbol: 'n₂', meaning: 'Index of medium 2 (Glass ≈ 1.5)' },
                  { symbol: 'θ₂', meaning: 'Angle of refraction' },
                ],
              };
            } else if (/\b(diagram|ray|normal|incident|refract|angle|interface|boundary)\b/i.test(textLower)) {
              nextVisualType = 'DIAGRAM';
              nextVisualData = {
                heading: 'Ray Diagram: Air-Glass Interface',
                concept: response.sessionContext?.activeConcept || 'Light Refraction',
              };
            }
          }

          const currentTurnId = response.turnId || `turn_${Date.now()}`;
          activeTurnIdRef.current = currentTurnId;

          const captionToDisplay =
            response.captionText ||
            response.teacherResponse?.captionText ||
            '';

          setVisualState((prev) => ({
            ...prev,
            sessionId: targetSessionId,
            topic: response.sessionContext?.topic || prev.topic,
            concept: response.sessionContext?.activeConcept || response.teachingState?.currentConcept || prev.concept,
            mode: (response.sessionContext?.currentMode as any) || 'TEACHING',
            visualType: nextVisualType,
            visualData: nextVisualData,
            captionText: captionToDisplay || undefined,
            turnId: currentTurnId,
            lastUpdated: new Date().toISOString(),
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

        const currentTurnId = response.turnId || `turn_${Date.now()}`;
        activeTurnIdRef.current = currentTurnId;

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
    isSttSupported: speechToTextService.isSupported(),
    isTtsSupported: textToSpeechService.isSupported(),
  };
}
