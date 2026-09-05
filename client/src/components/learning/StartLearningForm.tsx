import React, { useState, useEffect, useMemo } from 'react';
import type { Document as KnowledgeDoc, TeachingSession } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { textToSpeechService } from '../../services/tts.service';
import { speechToTextService } from '../../services/stt.service';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface StartLearningFormProps {
  idToken: string;
  onSessionStarted: (session: TeachingSession) => void;
  initialTopic?: string;
  initialSubject?: string;
  initialDocumentId?: string;
}

const SUBJECTS = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Computer Science',
  'General Science',
  'Other',
];

const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'hinglish', label: 'Hinglish' },
  { id: 'hindi', label: 'Hindi' },
] as const;

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5] as const;

export const StartLearningForm: React.FC<StartLearningFormProps> = ({
  idToken,
  onSessionStarted,
  initialTopic = '',
  initialSubject = 'Physics',
  initialDocumentId = 'none',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [customSubject, setCustomSubject] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(initialDocumentId);
  const [language, setLanguage] = useState<'english' | 'hindi' | 'hinglish'>('english');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userDocs, setUserDocs] = useState<KnowledgeDoc[]>([]);

  const [speed, setSpeed] = useState<number>(() => textToSpeechService.getRate());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => textToSpeechService.getVoiceURI());
  const [previewing, setPreviewing] = useState<boolean>(false);
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const readyDocs = useMemo(() => userDocs.filter((d) => d.status === 'ready'), [userDocs]);

  useEffect(() => {
    if (!idToken) return;
    liveTutorApiClient
      .listDocuments(idToken)
      .then((docs) => setUserDocs(docs))
      .catch(() => setUserDocs([]));
  }, [idToken]);

  useEffect(() => {
    const vList = textToSpeechService.getVoicesList();
    setVoices(vList);
    setSpeed(textToSpeechService.getRate());
    setSelectedVoiceURI(textToSpeechService.getVoiceURI());
  }, [language]);

  useEffect(() => {
    return () => {
      textToSpeechService.stopPreview();
    };
  }, []);

  const availableVoices = useMemo(() => {
    if (voices.length === 0) return [];
    if (language === 'hindi') {
      const hindi = voices.filter((v) => v.lang.toLowerCase().startsWith('hi'));
      if (hindi.length > 0) return hindi;
      const indian = voices.filter((v) => v.lang.toLowerCase().includes('in'));
      return indian.length > 0 ? indian : voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    }
    if (language === 'hinglish') {
      const relevant = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.lang.toLowerCase().includes('in') ||
          v.lang.toLowerCase().startsWith('en')
      );
      return relevant.length > 0 ? relevant : voices;
    }
    const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    return english.length > 0 ? english : voices;
  }, [voices, language]);

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocId(docId);
    setUploadError(null);
    setUploadSuccess(null);
    if (docId !== 'none') {
      const doc = readyDocs.find((d) => d.id === docId);
      if (doc && !topic.trim()) {
        const cleanName = doc.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopic(cleanName);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !idToken) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploaded = await liveTutorApiClient.uploadDocument(idToken, file);
      setUploadSuccess(`Uploaded "${file.name}". Processing...`);
      setSelectedDocId(uploaded.id);
      if (!topic.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopic(cleanName);
      }
      setUserDocs((prev) => [...prev, uploaded]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    textToSpeechService.setRate(newSpeed);
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri || null);
    textToSpeechService.setVoiceURI(uri || null);
  };

  const handleTogglePreviewVoice = () => {
    if (previewing) {
      textToSpeechService.stopPreview();
      setPreviewing(false);
      return;
    }

    setPreviewing(true);
    const greeting =
      language === 'hindi'
        ? 'नमस्ते! मैं ल्यूमो हूँ, आपका व्यक्तिगत एआई ट्यूटर।'
        : language === 'hinglish'
        ? 'Hello! Main Lumo hoon, aapka personal AI tutor.'
        : 'Hello! I am Lumo, your personal AI tutor.';

    textToSpeechService.previewVoice(
      greeting,
      selectedVoiceURI || undefined,
      () => setPreviewing(false),
      () => setPreviewing(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a learning topic');
      return;
    }

    const finalSubject = subject === 'Other' ? customSubject.trim() || 'General' : subject;

    setIsStarting(true);
    setError(null);

    try {
      textToSpeechService.setRate(speed);
      textToSpeechService.setVoiceURI(selectedVoiceURI);
      speechToTextService.setLanguage(language);

      const selectedDoc = readyDocs.find((d) => d.id === selectedDocId);
      const newSession = await liveTutorApiClient.createSession(idToken, {
        topic: topic.trim(),
        subject: finalSubject,
        documentId: selectedDocId !== 'none' ? selectedDocId : undefined,
        documentTitle: selectedDoc?.filename,
        availableMinutes: 30,
        learnerProfile: {
          preferredLanguage: language,
          explanationStyle: 'simple',
        },
      });

      onSessionStarted(newSession);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize session');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
      {/* Topic Input */}
      <div>
        <label
          htmlFor="lumo-topic-input"
          style={{
            display: 'block',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Topic or Concept
        </label>
        <Input
          id="lumo-topic-input"
          placeholder="e.g. Newton's Laws of Motion, Cellular Mitosis..."
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
        />
      </div>

      {/* Subject */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 'var(--text-body-sm)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Subject
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {SUBJECTS.map((s) => {
            const isActive = subject === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--color-orange)' : '1px solid var(--color-border)',
                  background: isActive ? 'var(--color-orange-soft)' : 'var(--color-surface)',
                  color: isActive ? 'var(--color-orange)' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
        {subject === 'Other' && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Input
              placeholder="Enter your subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Voice Customization */}
      <div
        style={{
          padding: 'clamp(1rem, 2vw, 1.25rem)',
          background: 'var(--color-surface-soft)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.75rem, 1.5vw, 1.15rem)',
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Voice Customization
        </div>

        {/* Teaching Language */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Teaching Language
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.45rem',
              background: 'var(--color-surface)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            {LANGUAGES.map((lang) => {
              const isActive = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  style={{
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'var(--color-orange)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--motion-fast) var(--ease-standard)',
                  }}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tutor Voice */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Tutor Voice
            </div>
            <button
              type="button"
              onClick={handleTogglePreviewVoice}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: previewing ? 'var(--color-orange)' : 'var(--color-surface)',
                color: previewing ? '#FFFFFF' : 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                padding: '0.22rem 0.55rem',
                cursor: 'pointer',
                transition: 'all var(--motion-fast) var(--ease-standard)',
              }}
            >
              <span>{previewing ? '■ Stop Audio' : '▶ Test Voice'}</span>
            </button>
          </div>

          {availableVoices.length > 0 ? (
            <select
              value={selectedVoiceURI || ''}
              onChange={(e) => handleVoiceChange(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-body-sm)',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <option value="">System Default ({language})</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          ) : (
            <div
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-surface)',
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              Browser default synthesized voice active
            </div>
          )}

          {/* Mic Diagnostic */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '0.5rem',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: speechToTextService.isSupported()
                  ? 'var(--color-mint)'
                  : 'var(--color-text-muted)',
              }}
            />
            <span>
              {speechToTextService.isSupported()
                ? 'Microphone: Speech recognition ready'
                : 'Microphone: Not supported in this browser'}
            </span>
          </div>
        </div>

        {/* Narration Speed */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Narration Speed
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              background: 'var(--color-surface)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            {SPEED_OPTIONS.map((s) => {
              const isActive = speed === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  style={{
                    padding: '0.42rem 0.2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'var(--color-orange)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--motion-fast) var(--ease-standard)',
                  }}
                >
                  {s}×
                </button>
              );
            })}
          </div>
        </div>

        {/* Subtitles & Captions */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Subtitles & Captions
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.7rem 0.85rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Live Subtitles on Stage
              </div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                Display synchronized speech subtitles during lesson narration
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCaptionsEnabled((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: captionsEnabled ? '1px solid var(--color-orange)' : '1px solid var(--color-border)',
                background: captionsEnabled ? 'var(--color-orange)' : 'var(--color-surface)',
                color: captionsEnabled ? '#FFFFFF' : 'var(--color-text-muted)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--motion-fast) var(--ease-standard)',
              }}
            >
              {captionsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Study Material */}
      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface-soft)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <label
            htmlFor="lumo-doc-select"
            style={{
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Ground on Study Material (Optional)
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              fontSize: 'var(--text-caption)',
              fontWeight: 600,
              color: 'var(--color-orange)',
              background: 'none',
              border: 'none',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isUploading ? 'Uploading...' : '+ Upload New Material'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        <select
          id="lumo-doc-select"
          value={selectedDocId}
          onChange={(e) => handleDocumentSelect(e.target.value)}
          style={{
            width: '100%',
            height: '44px',
            padding: '0 var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-body-sm)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="none">None (Teach from General Knowledge)</option>
          {readyDocs.map((doc) => (
            <option key={doc.id} value={doc.id}>
              📚 {doc.filename} ({doc.chunkCount} chunks)
            </option>
          ))}
        </select>

        {uploadSuccess && (
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption)', color: 'var(--color-success)', fontWeight: 500 }}>
            ✓ {uploadSuccess}
          </div>
        )}
        {uploadError && (
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-caption)', color: 'var(--color-error)', fontWeight: 500 }}>
            ⚠ {uploadError}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" size="lg" loading={isStarting} style={{ width: '100%' }}>
        <span>{isStarting ? 'Preparing session...' : 'Begin Lesson'}</span>
        <span style={{ fontSize: '16px' }}>→</span>
      </Button>
    </form>
  );
};
