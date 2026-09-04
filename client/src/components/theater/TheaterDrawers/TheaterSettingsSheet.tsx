import React, { useState, useEffect } from 'react';
import { textToSpeechService } from '../../../services/tts.service';
import { speechToTextService } from '../../../services/stt.service';
import { IconSettings, IconPause } from '../TheaterIcons';

export interface TheaterSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: 'english' | 'hindi' | 'hinglish';
  onSelectLanguage: (lang: 'english' | 'hindi' | 'hinglish') => void;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  onPauseSession?: () => void;
  onEndSession: () => void;
}

export const TheaterSettingsSheet: React.FC<TheaterSettingsSheetProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  captionsEnabled,
  onToggleCaptions,
  onPauseSession,
  onEndSession,
}) => {
  const [speed, setSpeed] = useState<number>(() => textToSpeechService.getRate());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(() => textToSpeechService.getVoiceURI());
  const [previewing, setPreviewing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const vList = textToSpeechService.getVoicesList();
      setVoices(vList);
      setSpeed(textToSpeechService.getRate());
      setSelectedVoiceURI(textToSpeechService.getVoiceURI());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    textToSpeechService.setRate(newSpeed);
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri);
    textToSpeechService.setVoiceURI(uri);
  };

  const handlePreviewVoice = () => {
    setPreviewing(true);
    const greeting =
      selectedLanguage === 'hindi'
        ? 'नमस्ते! मैं ल्यूमो हूँ, आपका व्यक्तिगत एआई ट्यूटर।'
        : selectedLanguage === 'hinglish'
        ? 'Hello! Main Lumo hoon, aapka personal AI tutor.'
        : 'Hello! I am Lumo, your personal AI tutor.';
    textToSpeechService.previewVoice(greeting);
    setTimeout(() => setPreviewing(false), 2500);
  };

  return (
    <aside
      aria-label="Classroom Settings"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'min(380px, 92vw)',
        height: '100vh',
        background: 'var(--theater-surface)',
        borderLeft: '1px solid var(--theater-border-medium)',
        boxShadow: 'var(--theater-shadow-stage)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'theaterSlideInRight 0.25s var(--theater-ease)',
        color: 'var(--theater-text-primary)',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--theater-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <IconSettings size={18} style={{ color: 'var(--theater-text-primary)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
              Classroom Settings
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)' }}>
              Voice, language, narration & session controls
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid var(--theater-border-subtle)',
            borderRadius: 'var(--theater-radius-sm)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theater-text-muted)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all var(--theater-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-primary)';
            e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-muted)';
            e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.6rem',
        }}
      >
        {/* 1. Teaching Language */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--theater-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Teaching Language
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {(['english', 'hindi', 'hinglish'] as const).map((lang) => {
              const isActive = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onSelectLanguage(lang)}
                  style={{
                    padding: '0.5rem 0.4rem',
                    borderRadius: 'var(--theater-radius-sm)',
                    border: isActive
                      ? '1px solid var(--theater-accent)'
                      : '1px solid var(--theater-border-subtle)',
                    background: isActive
                      ? 'var(--theater-accent)'
                      : 'var(--theater-surface-elevated)',
                    color: isActive ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 450,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all var(--theater-transition-fast)',
                  }}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Narration Speed */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--theater-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Narration Speed
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {[0.75, 1.0, 1.25, 1.5].map((s) => {
              const isActive = speed === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  style={{
                    padding: '0.45rem 0.2rem',
                    borderRadius: 'var(--theater-radius-sm)',
                    border: isActive
                      ? '1px solid var(--theater-accent)'
                      : '1px solid var(--theater-border-subtle)',
                    background: isActive
                      ? 'var(--theater-accent)'
                      : 'var(--theater-surface-elevated)',
                    color: isActive ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 600 : 450,
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all var(--theater-transition-fast)',
                  }}
                >
                  {s}x
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Captions & Subtitles */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--theater-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Subtitles & Captions
          </label>
          <button
            onClick={onToggleCaptions}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--theater-radius-md)',
              border: captionsEnabled
                ? '1px solid var(--theater-accent)'
                : '1px solid var(--theater-border-subtle)',
              background: captionsEnabled
                ? 'var(--theater-accent)'
                : 'var(--theater-surface-elevated)',
              color: captionsEnabled ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'all var(--theater-transition-fast)',
            }}
          >
            <span>Live Subtitles on Stage</span>
            <span style={{ fontWeight: 600 }}>{captionsEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 4. Tutor Voice Selection & Audio */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--theater-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Tutor Voice
            </label>
            <button
              onClick={handlePreviewVoice}
              disabled={previewing}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--theater-text-primary)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: previewing ? 'default' : 'pointer',
                padding: '0.1rem 0.3rem',
                opacity: previewing ? 0.6 : 1,
              }}
            >
              {previewing ? '▶ Playing...' : '▶ Test Voice'}
            </button>
          </div>

          {voices.length > 0 ? (
            <select
              value={selectedVoiceURI || ''}
              onChange={(e) => handleVoiceChange(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--theater-surface-sunken)',
                color: 'var(--theater-text-primary)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-sm)',
                padding: '0.5rem 0.6rem',
                fontSize: '0.78rem',
                outline: 'none',
                fontFamily: 'var(--theater-font-sans)',
              }}
            >
              <option value="">Default ({selectedLanguage})</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--theater-text-muted)' }}>
              Standard browser voice active
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--theater-text-muted)' }}>
            <span>Microphone:</span>
            <span style={{ color: 'var(--theater-text-primary)' }}>
              {speechToTextService.isSupported() ? '● Ready (Browser STT)' : '● Not supported'}
            </span>
          </div>
        </div>

        {/* 5. Session Controls */}
        <div
          style={{
            borderTop: '1px solid var(--theater-border-subtle)',
            paddingTop: '1.25rem',
            marginTop: 'auto',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--theater-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
            }}
          >
            Session Management
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* PAUSE */}
            {onPauseSession && (
              <div
                style={{
                  background: 'var(--theater-surface-elevated)',
                  border: '1px solid var(--theater-border-subtle)',
                  borderRadius: 'var(--theater-radius-md)',
                  padding: '0.75rem 0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
                    Pause Lesson
                  </span>
                  <button
                    onClick={() => {
                      onPauseSession();
                      onClose();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: 'var(--theater-surface)',
                      border: '1px solid var(--theater-border-medium)',
                      borderRadius: 'var(--theater-radius-xs)',
                      color: 'var(--theater-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 550,
                      padding: '0.3rem 0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all var(--theater-transition-fast)',
                    }}
                  >
                    <IconPause size={11} />
                    <span>Pause</span>
                  </button>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--theater-text-muted)', lineHeight: 1.4 }}>
                  Temporarily steps away. Speech and visual progression pause while preserving full learning state.
                </span>
              </div>
            )}

            {/* END */}
            <div
              style={{
                background: 'var(--theater-surface-elevated)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-md)',
                padding: '0.75rem 0.95rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
                  End Session
                </span>
                <button
                  onClick={() => {
                    onEndSession();
                    onClose();
                  }}
                  style={{
                    background: 'var(--theater-surface-sunken)',
                    border: '1px solid var(--theater-border-medium)',
                    borderRadius: 'var(--theater-radius-xs)',
                    color: 'var(--theater-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 550,
                    padding: '0.3rem 0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all var(--theater-transition-fast)',
                  }}
                >
                  End & Review
                </button>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--theater-text-muted)', lineHeight: 1.4 }}>
                Finishes lesson and generates your end-of-session mastery summary.
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
