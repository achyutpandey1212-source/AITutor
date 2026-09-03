import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  TeachingSession,
  TeachingState,
  TeacherResponse,
  TutorSessionContext,
  LatencyMetrics,
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
  | 'INTERRUPTING';

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

  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');

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

        const backendDuration = t5 - t3;
        const totalPerceived = timestamps.t0 ? t5 - timestamps.t0 : backendDuration;

        setLatencies({
          backendDurationMs: backendDuration,
          aiGenerationMs: response.latency?.aiGenerationMs,
          totalPerceivedLatencyMs: totalPerceived,
        });

        // Trigger TTS Output and resume STT in Barge-In listening mode
        setTutorState('SPEAKING');
        speechToTextService.resumeCapture();
        const t6 = Date.now();

        textToSpeechService.speak(response.normalizedSpeechText, selectedLang, {
          onStart: () => {
            const t7 = Date.now();
            setLatencies((prev) => ({ ...prev, ttsDurationMs: t7 - t6 }));
          },
          onEnd: () => {
            // Only transition to LISTENING if tutor hasn't been interrupted into another turn
            if (stateRef.current === 'SPEAKING') {
              setTutorState('LISTENING');
              setInterimTranscript('');
              setFinalTranscript('');
            }
          },
          onError: (ttsErr) => {
            console.warn('[LiveTutor] TTS audio warning:', ttsErr);
            if (stateRef.current === 'SPEAKING') {
              setTutorState('LISTENING');
              setInterimTranscript('');
              setFinalTranscript('');
            }
          },
        });
      } catch (err: any) {
        setError(err.message || 'Error processing teacher response');
        setTutorState('LISTENING');
        speechToTextService.resumeCapture();
      }
    },
    [idToken, timestamps]
  );

  // Starts the continuous STT listener with Barge-In capability
  const startListeningLoop = useCallback(() => {
    speechToTextService.setLanguage(languageRef.current);

    speechToTextService.start({
      onInterimTranscript: (interim) => {
        setInterimTranscript(interim);
        // Live Barge-In Interruption Detection
        if (stateRef.current === 'SPEAKING' && isMeaningfulBargeIn(interim, lastSpokenTextRef.current)) {
          textToSpeechService.cancel();
          setTutorState('INTERRUPTING');
        }
      },
      onFinalTranscript: (final) => {
        setFinalTranscript(final);
        // Live Barge-In Interruption Detection on finalized segment
        if (stateRef.current === 'SPEAKING' && isMeaningfulBargeIn(final, lastSpokenTextRef.current)) {
          textToSpeechService.cancel();
          setTutorState('INTERRUPTING');
        }
      },
      onSpeechTurnDetected: (turnTranscript) => {
        const trimmed = turnTranscript.trim();
        if (!trimmed) return;

        // If student spoke during SPEAKING or INTERRUPTING, verify meaningful utterance
        if (stateRef.current === 'SPEAKING') {
          if (!isMeaningfulBargeIn(trimmed, lastSpokenTextRef.current)) {
            return; // Ignore accidental noise/audio bleed
          }
          textToSpeechService.cancel();
        }

        if (['LISTENING', 'SPEAKING', 'INTERRUPTING'].includes(stateRef.current)) {
          const t0 = Date.now();
          setTimestamps({ t0 });
          submitTurn(trimmed);
        }
      },
      onError: (errMessage) => {
        setError(errMessage);
      },
      onStateChange: () => {},
    });

    setTutorState('LISTENING');
  }, [submitTurn]);

  // Starts or Restarts a Teaching Session
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

        // Also initialize sessionContext
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
          updatedAt: newSession.updatedAt,
        });

        // Automatically start the continuous listening loop
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

  // Gracefully ends active session
  const endSession = useCallback(() => {
    speechToTextService.stop();
    textToSpeechService.cancel();
    setTutorState('IDLE');
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

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

  // Replays last audio
  const replaySpeech = useCallback(() => {
    if (lastSpokenText && tutorState !== 'SPEAKING') {
      speechToTextService.pauseCapture();
      setTutorState('SPEAKING');

      textToSpeechService.speak(lastSpokenText, languageRef.current, {
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
  }, [lastSpokenText, tutorState]);

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
    isListening: tutorState === 'LISTENING',
    isSpeaking: tutorState === 'SPEAKING',
    isInterrupting: tutorState === 'INTERRUPTING',
    isLoading: tutorState === 'CONNECTING' || tutorState === 'THINKING',
    error,
    interimTranscript,
    finalTranscript,
    latencies,
    startSession,
    endSession,
    submitTypedMessage,
    replaySpeech,
    isSttSupported: speechToTextService.isSupported(),
    isTtsSupported: textToSpeechService.isSupported(),
  };
}
