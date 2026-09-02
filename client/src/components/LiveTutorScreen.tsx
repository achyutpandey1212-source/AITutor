import React, { useState } from 'react';
import { useLiveTutor } from '../hooks/useLiveTutor';

export interface LiveTutorScreenProps {
  idToken: string | null;
}

export const LiveTutorScreen: React.FC<LiveTutorScreenProps> = ({ idToken }) => {
  const [topicInput, setTopicInput] = useState<string>("Newton's Laws of Motion");
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [typedMessage, setTypedMessage] = useState<string>('');

  const {
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
    isSttSupported,
    isTtsSupported,
  } = useLiveTutor({
    idToken,
    defaultTopic: topicInput,
    language: selectedLanguage,
  });

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    await startSession(topicInput, selectedLanguage);
  };

  const handleSendTyped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    const msg = typedMessage;
    setTypedMessage('');
    setFinalTranscript(msg);
    await submitStudentMessage(msg, session?.id, selectedLanguage);
  };

  return (
    <section style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
      <h2>🎙️ Live AI Tutor (Voice Pipeline)</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Speak into your microphone or type a question to learn with the AI teacher with automatic speech-to-text and voice playback.
      </p>

      {/* Browser Support Badges */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: isSttSupported ? '#dcfce7' : '#fee2e2', color: isSttSupported ? '#166534' : '#991b1b' }}>
          STT: {isSttSupported ? 'Browser Web Speech API Ready' : 'Unsupported Browser'}
        </span>
        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: isTtsSupported ? '#dcfce7' : '#fee2e2', color: isTtsSupported ? '#166534' : '#991b1b' }}>
          TTS: {isTtsSupported ? 'SpeechSynthesis Ready' : 'Unsupported'}
        </span>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Step 1: Session Controls */}
      <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Topic</label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Newton's Laws"
                disabled={isLoading}
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ width: '140px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                disabled={isLoading}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="submit"
                disabled={isLoading || !idToken}
                style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {session ? 'Restart Session' : 'Start Session'}
              </button>
            </div>
          </div>
        </form>

        {session && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#334155' }}>
            <strong>Active Session:</strong> {session.id} | <strong>Topic:</strong> {session.topic} ({session.language})
          </div>
        )}
      </div>

      {/* Step 2: Voice & Text Interaction */}
      {session && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <h3>🎙️ Voice Controls</h3>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', margin: '1rem 0' }}>
            {!isListening ? (
              <button
                onClick={startVoiceInput}
                disabled={isLoading || isSpeaking}
                style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>🎤</span> Start Speaking
              </button>
            ) : (
              <button
                onClick={stopVoiceInputAndSubmit}
                style={{ padding: '0.75rem 1.5rem', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>⏹️</span> Stop & Send Speech
              </button>
            )}

            {isSpeaking && (
              <span style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                🔊 Teacher is speaking...
              </span>
            )}
            {isLoading && (
              <span style={{ color: '#475569', fontStyle: 'italic' }}>
                Thinking & generating teacher response...
              </span>
            )}
          </div>

          {/* Live Transcript Display */}
          {(isListening || interimTranscript || finalTranscript) && (
            <div style={{ padding: '0.75rem', background: '#f1f5f9', borderRadius: '6px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>STUDENT TRANSCRIPT:</div>
              {finalTranscript && <p style={{ margin: '0.25rem 0', fontWeight: 500 }}>{finalTranscript}</p>}
              {interimTranscript && <p style={{ margin: '0.25rem 0', color: '#64748b', fontStyle: 'italic' }}>{interimTranscript} ...</p>}
            </div>
          )}

          {/* Fallback Text Input */}
          <form onSubmit={handleSendTyped} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="Or type what you want to ask..."
              disabled={isLoading || isListening}
              style={{ flex: 1, padding: '0.5rem' }}
            />
            <button
              type="submit"
              disabled={isLoading || isListening || !typedMessage.trim()}
              style={{ padding: '0.5rem 1rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Send Text
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Teacher Response Display */}
      {teacherResponse && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>🧑‍🏫 Teacher Response</h3>
            <button
              onClick={replaySpeech}
              disabled={isSpeaking}
              style={{ padding: '0.35rem 0.75rem', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🔊 Replay Audio
            </button>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: '1.5', margin: '0.75rem 0', whiteSpace: 'pre-wrap' }}>
            {teacherResponse.responseText}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
            <span><strong>Intent:</strong> {teacherResponse.intent}</span>
            <span><strong>Action:</strong> {teacherResponse.teachingAction}</span>
            <span><strong>Language:</strong> {teacherResponse.language}</span>
          </div>

          {teacherResponse.assessment && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fef3c7', borderRadius: '4px', fontSize: '0.85rem' }}>
              <strong>Assessment:</strong> {teacherResponse.assessment.correctness}
              {teacherResponse.assessment.misconception && (
                <div><strong>Misconception detected:</strong> {teacherResponse.assessment.misconception}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Hybrid Teaching State Summary */}
      {teachingState && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <h4>📊 Teaching State (MongoDB Synced)</h4>
          <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
            <li><strong>Current Concept:</strong> {teachingState.currentConcept}</li>
            <li><strong>Understanding Level:</strong> {teachingState.understanding} (Confidence: {teachingState.confidence.toFixed(2)})</li>
            <li><strong>Recommended Next Action:</strong> {teachingState.recommendedNextAction}</li>
            <li><strong>Misconceptions:</strong> {teachingState.misconceptions.length > 0 ? teachingState.misconceptions.join(', ') : 'None detected'}</li>
            <li><strong>Mastered Concepts:</strong> {teachingState.conceptsMastered.length > 0 ? teachingState.conceptsMastered.join(', ') : 'None yet'}</li>
          </ul>
        </div>
      )}

      {/* Step 5: Latency Instrumentation */}
      {latencies && (
        <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
          <strong>⏱️ Latency Telemetry (M5 Instrumentation):</strong>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {latencies.aiGenerationMs !== undefined && <span>AI Generation: <strong>{latencies.aiGenerationMs}ms</strong></span>}
            {latencies.backendDurationMs !== undefined && <span>Backend Total: <strong>{latencies.backendDurationMs}ms</strong></span>}
            {latencies.ttsDurationMs !== undefined && <span>TTS Time-to-Speech: <strong>{latencies.ttsDurationMs}ms</strong></span>}
            {latencies.totalPerceivedLatencyMs !== undefined && <span>Perceived Total: <strong>{latencies.totalPerceivedLatencyMs}ms</strong></span>}
          </div>
        </div>
      )}
    </section>
  );
};
