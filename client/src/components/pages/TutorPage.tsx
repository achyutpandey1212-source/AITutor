import React, { useState, useEffect } from 'react';
import type { Document as KnowledgeDoc, TeachingSession } from '@ai-tutor/shared';
import { useLiveTutor } from '../../hooks/useLiveTutor';
import { liveTutorApiClient } from '../../services/api.service';
import { AssessmentRenderer } from '../assessment/AssessmentRenderer';

export interface TutorPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
}

export const TutorPage: React.FC<TutorPageProps> = ({ idToken, onNavigate }) => {
  const [topicInput, setTopicInput] = useState<string>("Newton's Laws of Motion");
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('none');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [userDocs, setUserDocs] = useState<KnowledgeDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [pastSessions, setPastSessions] = useState<TeachingSession[]>([]);
  const [isLoadingPastSessions, setIsLoadingPastSessions] = useState<boolean>(false);

  // Load student's study documents for knowledge grounding
  useEffect(() => {
    let isMounted = true;
    async function loadDocs() {
      if (!idToken) return;
      setIsLoadingDocs(true);
      try {
        const docs = await liveTutorApiClient.listDocuments(idToken);
        if (isMounted) {
          setUserDocs(docs.filter((d) => d.status === 'ready'));
        }
      } catch (err) {
        console.warn('Could not load documents for tutor selection:', err);
      } finally {
        if (isMounted) setIsLoadingDocs(false);
      }
    }
    loadDocs();
    return () => {
      isMounted = false;
    };
  }, [idToken]);

  const selectedDocObj = userDocs.find((d) => d.id === selectedDocumentId);

  const {
    tutorState,
    session,
    sessionContext,
    teacherResponse,
    activeAssessmentQuestion,
    isSpeaking,
    isInterrupting,
    isLoading,
    error,
    interimTranscript,
    finalTranscript,
    micEnabled,
    toggleMic,
    startSession,
    resumeSession,
    pauseSession,
    endSession,
    submitTypedMessage,
    requestAssessmentHint,
    giveUpAssessment,
    replaySpeech,
  } = useLiveTutor({
    idToken,
    defaultTopic: topicInput,
    defaultSubject: selectedSubject,
    defaultDocumentId: selectedDocumentId !== 'none' ? selectedDocumentId : undefined,
    defaultDocumentTitle: selectedDocObj?.filename,
    language: selectedLanguage,
  });

  // Load previous tutor sessions
  useEffect(() => {
    if (!idToken) return;
    setIsLoadingPastSessions(true);
    liveTutorApiClient
      .listTeachingSessions(idToken)
      .then((sessions) => setPastSessions(sessions))
      .catch((err) => console.warn('Could not load previous sessions:', err))
      .finally(() => setIsLoadingPastSessions(false));
  }, [idToken, tutorState]);

  const handleDocumentChange = (docId: string) => {
    setSelectedDocumentId(docId);
    if (docId !== 'none') {
      const doc = userDocs.find((d) => d.id === docId);
      if (doc) {
        const cleanName = doc.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopicInput(cleanName);
      }
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    const docId = selectedDocumentId !== 'none' ? selectedDocumentId : undefined;
    const docTitle = selectedDocObj?.filename;
    await startSession(topicInput.trim(), selectedLanguage, selectedSubject.trim(), docId, docTitle);
  };

  const handleResumePastSession = async (sessionId: string) => {
    await resumeSession(sessionId);
  };

  const handleSendTyped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || isLoading) return;
    const msg = typedMessage.trim();
    setTypedMessage('');
    await submitTypedMessage(msg);
  };

  const getStatusColor = () => {
    if (!micEnabled && tutorState !== 'IDLE' && tutorState !== 'SPEAKING' && tutorState !== 'THINKING') {
      return '#64748b';
    }
    switch (tutorState) {
      case 'LISTENING':
        return '#16a34a';
      case 'INTERRUPTING':
        return '#eab308';
      case 'THINKING':
        return '#2563eb';
      case 'SPEAKING':
        return '#7c3aed';
      case 'WAITING_FOR_STUDENT':
        return '#f59e0b';
      case 'CONNECTING':
        return '#ea580c';
      case 'IDLE':
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = () => {
    if (!micEnabled && tutorState !== 'IDLE' && tutorState !== 'SPEAKING' && tutorState !== 'THINKING') {
      return 'Microphone Off (Click "Mic Off" to unmute)';
    }
    switch (tutorState) {
      case 'LISTENING':
        return 'Listening (Speak naturally)...';
      case 'INTERRUPTING':
        return 'Interrupted! Listening to your question...';
      case 'THINKING':
        return 'Thinking...';
      case 'SPEAKING':
        return 'Speaking (Say "Wait" or "Stop" to interrupt)...';
      case 'WAITING_FOR_STUDENT':
        return 'Waiting for your answer (Solve below or speak)...';
      case 'CONNECTING':
        return 'Connecting session...';
      case 'IDLE':
      default:
        return 'Offline';
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#0f172a' }}>AI Tutor</h1>
        <button
          onClick={() => onNavigate('/dashboard')}
          style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          &larr; Dashboard
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Session Configuration & Start Form */}
      {tutorState === 'IDLE' ? (
        <div style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <form onSubmit={handleStartSession} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General">General Science</option>
                </select>
              </div>

              <div style={{ flex: '2 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Study Document (RAG Grounding)
                </label>
                <select
                  value={selectedDocumentId}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="none">📄 None (General AI Knowledge)</option>
                  {userDocs.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      📚 {doc.filename} ({doc.chunkCount} chunks)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Topic
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. Light Reflection & Refraction"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ width: '130px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLoadingDocs}
              style={{
                padding: '0.75rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '0.25rem',
              }}
            >
              {isLoading ? 'Connecting...' : 'Start Learning'}
            </button>
          </form>

          {/* Previous Tutor Sessions List */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: 600 }}>
              Resume Previous Session
            </h3>

            {isLoadingPastSessions ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading sessions...</p>
            ) : pastSessions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                No previous sessions yet. Start a new session above!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {pastSessions.slice(0, 5).map((ps) => (
                  <div
                    key={ps.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                        {ps.topic}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {ps.subject} • {ps.language} • {ps.status.toUpperCase()}
                        {ps.documentTitle && ` • 📚 ${ps.documentTitle}`}
                        {ps.conversationHistory && ` • ${ps.conversationHistory.length} turns`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleResumePastSession(ps.id)}
                      disabled={isLoading}
                      style={{
                        padding: '0.35rem 0.8rem',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Topic: <strong>{session?.topic || topicInput}</strong> ({selectedSubject} | {selectedLanguage})
            </div>
            {sessionContext?.documentTitle && (
              <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.15rem' }}>
                📚 Grounded on: <strong>{sessionContext.documentTitle}</strong>
              </div>
            )}
            {sessionContext && (
              <div style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '0.15rem' }}>
                Mode: <strong>{sessionContext.currentMode}</strong> | Concept: <strong>{sessionContext.activeConcept}</strong>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={toggleMic}
              style={{
                padding: '0.4rem 0.85rem',
                background: micEnabled ? '#16a34a' : '#64748b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {micEnabled ? '🎙️ Mic On' : '🔇 Mic Off'}
            </button>
            <button
              onClick={pauseSession}
              style={{
                padding: '0.4rem 0.8rem',
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Pause
            </button>
            <button
              onClick={endSession}
              style={{
                padding: '0.4rem 0.8rem',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {/* Tutor Status Banner */}
      <div style={{ padding: '0.75rem 1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: getStatusColor(),
              display: 'inline-block',
            }}
          />
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
            Tutor status: {getStatusLabel()}
          </span>
        </div>

        {teacherResponse && (
          <button
            onClick={replaySpeech}
            disabled={isSpeaking || isInterrupting}
            style={{ padding: '0.25rem 0.6rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            🔊 Replay
          </button>
        )}
      </div>

      {/* Active Assessment Tool Container (when tutor asks a question) */}
      {activeAssessmentQuestion && (
        <div style={{ background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.95rem' }}>
              📝 Assessment Question: {activeAssessmentQuestion.concept} ({activeAssessmentQuestion.difficulty.toUpperCase()})
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={requestAssessmentHint}
                disabled={isLoading}
                style={{ padding: '0.35rem 0.75rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde047', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                💡 Need a Hint
              </button>
              <button
                onClick={giveUpAssessment}
                disabled={isLoading}
                style={{ padding: '0.35rem 0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                🤷 Can't Solve / Show Solution
              </button>
            </div>
          </div>

          <AssessmentRenderer
            question={activeAssessmentQuestion}
            idToken={idToken}
            sessionId={session?.id}
            onSubmitted={async (submission) => {
              const feedbackMsg = submission.evaluation?.correct
                ? `I solved it correctly! Got ${submission.evaluation.score}/${submission.evaluation.maxScore}.`
                : `I attempted the question. Score: ${submission.evaluation?.score || 0}/${submission.evaluation?.maxScore || 1}. ${submission.evaluation?.feedback || ''}`;
              await submitTypedMessage(feedbackMsg);
            }}
          />
        </div>
      )}

      {/* Real-time Voice Transcript Feed */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', minHeight: '180px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
          Transcript:
        </div>

        {sessionContext?.conversationHistory && sessionContext.conversationHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {sessionContext.conversationHistory.map((turn, i) => (
              <div
                key={i}
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  background: turn.role === 'student' ? '#eff6ff' : turn.type === 'assessment' ? '#faf5ff' : '#f8fafc',
                  border: turn.role === 'student' ? '1px solid #bfdbfe' : turn.type === 'assessment' ? '1px solid #e9d5ff' : '1px solid #e2e8f0',
                  alignSelf: turn.role === 'student' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: turn.role === 'student' ? '#1d4ed8' : turn.type === 'assessment' ? '#7e22ce' : '#334155', marginBottom: '0.2rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span>{turn.role === 'student' ? 'You' : 'Tutor'}</span>
                  {turn.type === 'assessment' && (
                    <span style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#6b21a8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Assessment Check
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {turn.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem', margin: 0 }}>
            {tutorState === 'IDLE' ? 'Start a session to talk with the tutor.' : 'Speak into your microphone... (You can interrupt anytime)'}
          </p>
        )}

        {/* Live Interim Speech Bubble */}
        {(interimTranscript || (tutorState === 'LISTENING' && finalTranscript) || isInterrupting) && (
          <div style={{ padding: '0.5rem 0.75rem', background: isInterrupting ? '#fef08a' : '#fef3c7', borderRadius: '6px', fontSize: '0.85rem', color: '#92400e', marginTop: '0.5rem', border: isInterrupting ? '1px solid #eab308' : 'none' }}>
            <em>{isInterrupting ? '✋ Interrupted: ' : ''}{interimTranscript || finalTranscript} ...</em>
          </div>
        )}
      </div>

      {/* Fallback Typed Text Input */}
      {tutorState !== 'IDLE' && (
        <form onSubmit={handleSendTyped} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder={activeAssessmentQuestion ? "Type your answer or say 'Give me a hint'..." : "Or type your message here..."}
            disabled={isLoading}
            style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !typedMessage.trim()}
            style={{ padding: '0.6rem 1.25rem', background: '#475569', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
};
