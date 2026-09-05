import React, { useState, useEffect, useMemo } from 'react';
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
    } else {
      textToSpeechService.stopPreview();
      setPreviewing(false);
    }
  }, [isOpen]);

  // Clean up any preview on unmount
  useEffect(() => {
    return () => {
      textToSpeechService.stopPreview();
    };
  }, []);

  // Filter voices intelligently based on active language
  const availableVoices = useMemo(() => {
    if (voices.length === 0) return [];
    if (selectedLanguage === 'hindi') {
      const hindi = voices.filter((v) => v.lang.toLowerCase().startsWith('hi'));
      if (hindi.length > 0) return hindi;
      const indian = voices.filter((v) => v.lang.toLowerCase().includes('in'));
      return indian.length > 0 ? indian : voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    }
    if (selectedLanguage === 'hinglish') {
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
  }, [voices, selectedLanguage]);

  if (!isOpen) return null;

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    textToSpeechService.setRate(newSpeed);
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri || null);
    textToSpeechService.setVoiceURI(uri || null);
  };

  const handleTogglePreviewVoice = (voiceUri?: string) => {
    if (previewing) {
      textToSpeechService.stopPreview();
      setPreviewing(false);
      return;
    }

    setPreviewing(true);
    const greeting =
      selectedLanguage === 'hindi'
        ? 'नमस्ते! मैं ल्यूमो हूँ, आपका व्यक्तिगत एआई ट्यूटर।'
        : selectedLanguage === 'hinglish'
        ? 'Hello! Main Lumo hoon, aapka personal AI tutor.'
        : 'Hello! I am Lumo, your personal AI tutor.';

    textToSpeechService.previewVoice(
      greeting,
      voiceUri || selectedVoiceURI || undefined,
      () => setPreviewing(false),
      () => setPreviewing(false)
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session Preferences"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 49,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(0, 0, 0, 0.32)',
        backdropFilter: 'blur(3px)',
        animation: 'theaterOverlayFadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          textToSpeechService.stopPreview();
          onClose();
        }
      }}
    >
      <div
        style={{
          width: 'min(490px, 94vw)',
          maxHeight: 'min(680px, 86vh)',
          background: 'var(--theater-surface)',
          borderRadius: 'var(--theater-radius-xl)',
          border: '1px solid var(--theater-border-medium)',
          boxShadow: 'var(--theater-shadow-stage)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--theater-font-sans)',
          color: 'var(--theater-text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.35rem',
            borderBottom: '1px solid var(--theater-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <IconSettings size={16} style={{ color: 'var(--theater-text-primary)' }} />
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: 'var(--theater-text-primary)',
                }}
              >
                Session Preferences
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--theater-text-muted)' }}>
                Language, tutor voice, speed & session controls
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              textToSpeechService.stopPreview();
              onClose();
            }}
            title="Close preferences (Esc)"
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

        {/* Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.35rem',
          }}
        >
          {/* 1. Teaching Language */}
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--theater-text-muted)',
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
                background: 'var(--theater-surface-sunken)',
                padding: '3px',
                borderRadius: 'var(--theater-radius-md)',
                border: '1px solid var(--theater-border-subtle)',
              }}
            >
              {(
                [
                  { id: 'english', label: 'English' },
                  { id: 'hinglish', label: 'Hinglish' },
                  { id: 'hindi', label: 'Hindi' },
                ] as const
              ).map((lang) => {
                const isActive = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => onSelectLanguage(lang.id)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--theater-radius-sm)',
                      border: 'none',
                      background: isActive ? 'var(--theater-accent)' : 'transparent',
                      color: isActive ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all var(--theater-transition-fast)',
                    }}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tutor Voice & Audio Preview */}
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
                  color: 'var(--theater-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Tutor Voice
              </div>
              <button
                onClick={() => handleTogglePreviewVoice()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: previewing ? 'var(--theater-accent)' : 'var(--theater-surface-elevated)',
                  color: previewing ? 'var(--theater-accent-contrast)' : 'var(--theater-text-primary)',
                  border: '1px solid var(--theater-border-medium)',
                  borderRadius: 'var(--theater-radius-xs)',
                  fontSize: '0.72rem',
                  fontWeight: 550,
                  padding: '0.22rem 0.55rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--theater-font-sans)',
                  transition: 'all var(--theater-transition-fast)',
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
                  background: 'var(--theater-surface-sunken)',
                  color: 'var(--theater-text-primary)',
                  border: '1px solid var(--theater-border-subtle)',
                  borderRadius: 'var(--theater-radius-md)',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.78rem',
                  outline: 'none',
                  fontFamily: 'var(--theater-font-sans)',
                  cursor: 'pointer',
                }}
              >
                <option value="">System Default ({selectedLanguage})</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            ) : (
              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--theater-text-muted)',
                  background: 'var(--theater-surface-sunken)',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--theater-radius-md)',
                  border: '1px solid var(--theater-border-subtle)',
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
                fontSize: '0.71rem',
                color: 'var(--theater-text-muted)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: speechToTextService.isSupported()
                    ? 'var(--theater-accent)'
                    : 'var(--theater-text-muted)',
                }}
              />
              <span>
                {speechToTextService.isSupported()
                  ? 'Microphone: Speech recognition ready'
                  : 'Microphone: Not supported in this browser'}
              </span>
            </div>
          </div>

          {/* 3. Narration Speed */}
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--theater-text-muted)',
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
                background: 'var(--theater-surface-sunken)',
                padding: '3px',
                borderRadius: 'var(--theater-radius-md)',
                border: '1px solid var(--theater-border-subtle)',
              }}
            >
              {[0.75, 1.0, 1.25, 1.5].map((s) => {
                const isActive = speed === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    style={{
                      padding: '0.42rem 0.2rem',
                      borderRadius: 'var(--theater-radius-sm)',
                      border: 'none',
                      background: isActive ? 'var(--theater-accent)' : 'transparent',
                      color: isActive ? 'var(--theater-accent-contrast)' : 'var(--theater-text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--theater-font-sans)',
                      transition: 'all var(--theater-transition-fast)',
                    }}
                  >
                    {s}×
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Subtitles & Captions */}
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--theater-text-muted)',
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
                background: 'var(--theater-surface-sunken)',
                borderRadius: 'var(--theater-radius-md)',
                border: '1px solid var(--theater-border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--theater-text-primary)' }}>
                  Live Subtitles on Stage
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--theater-text-muted)', marginTop: '0.1rem' }}>
                  Display synchronized speech subtitles during lesson narration
                </div>
              </div>
              <button
                onClick={onToggleCaptions}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--theater-radius-sm)',
                  border: captionsEnabled
                    ? '1px solid var(--theater-accent)'
                    : '1px solid var(--theater-border-medium)',
                  background: captionsEnabled ? 'var(--theater-accent)' : 'var(--theater-surface-elevated)',
                  color: captionsEnabled ? 'var(--theater-accent-contrast)' : 'var(--theater-text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--theater-font-sans)',
                  transition: 'all var(--theater-transition-fast)',
                }}
              >
                {captionsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* 5. Session Management Controls */}
          <div
            style={{
              borderTop: '1px solid var(--theater-border-subtle)',
              paddingTop: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--theater-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Session Management
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {onPauseSession && (
                <button
                  onClick={() => {
                    textToSpeechService.stopPreview();
                    onPauseSession();
                    onClose();
                  }}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 0.8rem',
                    background: 'var(--theater-surface-elevated)',
                    border: '1px solid var(--theater-border-medium)',
                    borderRadius: 'var(--theater-radius-md)',
                    color: 'var(--theater-text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 550,
                    cursor: 'pointer',
                    fontFamily: 'var(--theater-font-sans)',
                    transition: 'all var(--theater-transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                  }}
                >
                  <IconPause size={12} />
                  <span>Pause Lesson</span>
                </button>
              )}

              <button
                onClick={() => {
                  textToSpeechService.stopPreview();
                  onEndSession();
                  onClose();
                }}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.55rem 0.8rem',
                  background: 'var(--theater-surface-sunken)',
                  border: '1px solid var(--theater-border-medium)',
                  borderRadius: 'var(--theater-radius-md)',
                  color: 'var(--theater-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 550,
                  cursor: 'pointer',
                  fontFamily: 'var(--theater-font-sans)',
                  transition: 'all var(--theater-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theater-border-medium)';
                }}
              >
                <span>End & Review</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
