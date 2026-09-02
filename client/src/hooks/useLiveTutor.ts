import { useState, useCallback } from 'react';
import type {
  TeachingSession,
  TeachingState,
  TeacherResponse,
  LatencyMetrics,
} from '@ai-tutor/shared';
import { speechToTextService } from '../services/stt.service';
import { textToSpeechService } from '../services/tts.service';
import { liveTutorApiClient } from '../services/api.service';

export interface UseLiveTutorProps {
  idToken: string | null;
  defaultTopic?: string;
  language?: 'english' | 'hindi' | 'hinglish';
}

export function useLiveTutor({ idToken, defaultTopic = "Newton's Laws", language = 'english' }: UseLiveTutorProps) {
  const [session, setSession] = useState<TeachingSession | null>(null);
  const [teachingState, setTeachingState] = useState<TeachingState | null>(null);
  const [teacherResponse, setTeacherResponse] = useState<TeacherResponse | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');

  const [latencies, setLatencies] = useState<LatencyMetrics | null>(null);
  const [timestamps, setTimestamps] = useState<{ [key: string]: number }>({});

  const startSession = useCallback(
    async (topicToTeach = defaultTopic, targetLang = language) => {
      if (!idToken) {
        setError('Authentication required to start a session.');
        return null;
      }
      setIsLoading(true);
      setError(null);
      try {
        const newSession = await liveTutorApiClient.createSession(idToken, {
          topic: topicToTeach,
          learnerProfile: {
            preferredLanguage: targetLang,
            educationLevel: 'beginner',
            learningGoal: `Understand fundamentals of ${topicToTeach}`,
            explanationStyle: 'simple',
          },
        });
        setSession(newSession);
        setTeachingState(newSession.teachingState);
        setTeacherResponse(null);
        return newSession;
      } catch (err: any) {
        setError(err.message || 'Failed to create teaching session');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [idToken, defaultTopic, language]
  );

  const submitStudentMessage = useCallback(
    async (textToSend: string, activeSessionId?: string, selectedLang = language) => {
      const targetSessionId = activeSessionId || session?.id;
      if (!idToken) {
        setError('Sign in required.');
        return;
      }
      if (!targetSessionId) {
        setError('No active teaching session. Please start a session first.');
        return;
      }
      if (!textToSend.trim()) {
        setError('Cannot send empty message.');
        return;
      }

      setIsLoading(true);
      setError(null);
      const t3 = Date.now();

      try {
        const response = await liveTutorApiClient.sendVoiceInteraction(idToken, targetSessionId, {
          transcript: textToSend,
          language: selectedLang,
        });

        const t5 = Date.now();
        setTeacherResponse(response.teacherResponse);
        setTeachingState(response.teachingState);
        setLastSpokenText(response.normalizedSpeechText);

        const backendDuration = t5 - t3;
        const totalPerceived = (timestamps.t0 ? t5 - timestamps.t0 : backendDuration);

        setLatencies({
          backendDurationMs: backendDuration,
          aiGenerationMs: response.latency?.aiGenerationMs,
          totalPerceivedLatencyMs: totalPerceived,
        });

        // Trigger TTS Playback
        const t6 = Date.now();
        textToSpeechService.speak(response.normalizedSpeechText, selectedLang, {
          onStart: () => {
            setIsSpeaking(true);
            const t7 = Date.now();
            setLatencies((prev) => ({ ...prev, ttsDurationMs: t7 - t6 }));
          },
          onEnd: () => {
            setIsSpeaking(false);
          },
          onError: (ttsErr) => {
            setIsSpeaking(false);
            console.warn('[LiveTutor] TTS playback warning:', ttsErr);
          },
        });
      } catch (err: any) {
        setError(err.message || 'Error processing teacher response');
      } finally {
        setIsLoading(false);
      }
    },
    [idToken, session, language, timestamps]
  );

  const startVoiceInput = useCallback(() => {
    setError(null);
    setInterimTranscript('');
    setFinalTranscript('');
    speechToTextService.setLanguage(language);

    const t0 = Date.now();
    setTimestamps({ t0 });

    speechToTextService.start({
      onInterimTranscript: (interim) => {
        setInterimTranscript(interim);
      },
      onFinalTranscript: (final) => {
        setFinalTranscript((prev) => (prev ? `${prev} ${final}` : final));
      },
      onStateChange: (listening) => {
        setIsListening(listening);
      },
      onError: (errMessage) => {
        setError(errMessage);
        setIsListening(false);
      },
    });
  }, [language]);

  const stopVoiceInputAndSubmit = useCallback(async () => {
    speechToTextService.stop();
    setIsListening(false);

    const t1 = Date.now();
    setTimestamps((prev) => ({ ...prev, t1 }));

    // Small delay to allow final audio buffer to finish
    await new Promise((r) => setTimeout(r, 200));

    const text = (finalTranscript || interimTranscript).trim();
    if (text) {
      await submitStudentMessage(text);
    } else {
      setError('No speech detected. Try speaking again or type your message.');
    }
  }, [finalTranscript, interimTranscript, submitStudentMessage]);

  const replaySpeech = useCallback(() => {
    if (lastSpokenText) {
      textToSpeechService.speak(lastSpokenText, language, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [lastSpokenText, language]);

  return {
    session,
    teachingState,
    teacherResponse,
    isListening,
    isSpeaking,
    isLoading,
    error,
    interimTranscript,
    finalTranscript,
    setFinalTranscript,
    latencies,
    startSession,
    startVoiceInput,
    stopVoiceInputAndSubmit,
    submitStudentMessage,
    replaySpeech,
    isSttSupported: speechToTextService.isSupported(),
    isTtsSupported: textToSpeechService.isSupported(),
  };
}
