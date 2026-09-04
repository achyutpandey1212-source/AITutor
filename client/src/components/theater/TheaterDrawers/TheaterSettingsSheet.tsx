import React, { useState, useEffect } from 'react';
import { textToSpeechService } from '../../../services/tts.service';
import { speechToTextService } from '../../../services/stt.service';

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
        background: '#0B0B0C',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--theater-shadow-drawer)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'theaterSlideInRight 0.25s var(--theater-ease-out)',
        color: '#F5F5F2',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'rgba(16, 16, 17, 0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem', color: '#E29D4B' }}>⚙</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, color: '#F5F5F2' }}>
              Classroom Settings
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#777773' }}>
              Voice, language, narration & session controls
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#777773',
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F2')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#777773')}
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
              color: '#777773',
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
                    borderRadius: '8px',
                    border: isActive
                      ? '1px solid rgba(226, 157, 75, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    background: isActive
                      ? 'rgba(226, 157, 75, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#F5B942' : '#B8B8B3',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all 0.15s ease',
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
              color: '#777773',
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
                    borderRadius: '8px',
                    border: isActive
                      ? '1px solid rgba(226, 157, 75, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    background: isActive
                      ? 'rgba(226, 157, 75, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#F5B942' : '#B8B8B3',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all 0.15s ease',
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
              color: '#777773',
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
              borderRadius: '10px',
              border: captionsEnabled
                ? '1px solid rgba(85, 201, 138, 0.35)'
                : '1px solid rgba(255, 255, 255, 0.07)',
              background: captionsEnabled
                ? 'rgba(85, 201, 138, 0.08)'
                : 'rgba(255, 255, 255, 0.03)',
              color: captionsEnabled ? '#55C98A' : '#B8B8B3',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--theater-font-sans)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>💬 Live Subtitles on Stage</span>
            <span style={{ fontWeight: 700 }}>{captionsEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 4. Tutor Voice Selection & Audio */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#777773',
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
                color: '#E29D4B',
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
                background: '#141416',
                color: '#F5F5F2',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
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
            <div style={{ fontSize: '0.75rem', color: '#777773' }}>
              Standard browser voice active
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.72rem', color: '#777773' }}>
            <span>Microphone:</span>
            <span style={{ color: speechToTextService.isSupported() ? '#55C98A' : '#E05252' }}>
              {speechToTextService.isSupported() ? '● Ready (Browser STT)' : '● Not supported'}
            </span>
          </div>
        </div>

        {/* 5. Session Controls — Pause vs End Distinct Semantics */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.25rem',
            marginTop: 'auto',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#777773',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.75rem',
            }}
          >
            Session Management
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* PAUSE: Temporary step away, resumable, neutral/calm styling */}
            {onPauseSession && (
              <div
                style={{
                  background: 'rgba(226, 157, 75, 0.05)',
                  border: '1px solid rgba(226, 157, 75, 0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem 0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F5B942' }}>
                    Pause Lesson
                  </span>
                  <button
                    onClick={() => {
                      onPauseSession();
                      onClose();
                    }}
                    style={{
                      background: 'rgba(226, 157, 75, 0.15)',
                      border: '1px solid rgba(226, 157, 75, 0.35)',
                      borderRadius: '6px',
                      color: '#F5B942',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.3rem 0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Pause ⏸
                  </button>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#B8B8B3', lineHeight: 1.4 }}>
                  Temporarily steps away. Speech and visual progression pause while preserving full learning state.
                </span>
              </div>
            )}

            {/* END: Complete session, destructive restrained red styling */}
            <div
              style={{
                background: 'rgba(224, 82, 82, 0.05)',
                border: '1px solid rgba(224, 82, 82, 0.2)',
                borderRadius: '12px',
                padding: '0.75rem 0.95rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FF8F78' }}>
                  End Session
                </span>
                <button
                  onClick={() => {
                    onEndSession();
                    onClose();
                  }}
                  style={{
                    background: 'rgba(224, 82, 82, 0.15)',
                    border: '1px solid rgba(224, 82, 82, 0.35)',
                    borderRadius: '6px',
                    color: '#FF8F78',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  End & Review 🛑
                </button>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#B8B8B3', lineHeight: 1.4 }}>
                Finishes lesson and generates your end-of-session mastery summary. Session is marked complete.
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
