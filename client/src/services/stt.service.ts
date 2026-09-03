export interface SpeechToTextCallbacks {
  onInterimTranscript?: (interim: string) => void;
  onFinalTranscript?: (final: string) => void;
  onSpeechTurnDetected?: (finalTurnTranscript: string) => void;
  onError?: (error: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSessionActive: boolean = false;
  private isPaused: boolean = false;
  private currentLanguage: string = 'en-US';
  private callbacks: SpeechToTextCallbacks = {};
  private silenceTimer: any = null;
  private accumulatedTurnTranscript: string = '';
  private silenceDebounceMs: number = 1300; // 1.3 seconds silence after speech marks turn end

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.setupListeners();
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public setLanguage(lang: 'english' | 'hindi' | 'hinglish'): void {
    switch (lang) {
      case 'hindi':
        this.currentLanguage = 'hi-IN';
        break;
      case 'hinglish':
        // en-IN is optimal for Indian English and Hinglish phonetics in Web Speech API
        this.currentLanguage = 'en-IN';
        break;
      case 'english':
      default:
        this.currentLanguage = 'en-US';
        break;
    }
    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  public start(callbacks: SpeechToTextCallbacks): void {
    if (!this.isSupported()) {
      callbacks.onError?.('Speech-to-Text is not supported in this browser. Please use Chrome or Edge, or enter text manually.');
      return;
    }

    this.callbacks = callbacks;
    this.isSessionActive = true;
    this.isPaused = false;
    this.accumulatedTurnTranscript = '';
    this.clearSilenceTimer();

    this.startRecognitionInternal();
  }

  private startRecognitionInternal(): void {
    if (!this.recognition || this.isListening || this.isPaused) return;

    this.recognition.lang = this.currentLanguage;

    try {
      this.recognition.start();
      this.isListening = true;
      this.callbacks.onStateChange?.(true);
    } catch (err: any) {
      // 'already started' is common in Web Speech API
      if (!err?.message?.includes('already started')) {
        this.isListening = false;
        this.callbacks.onStateChange?.(false);
        this.callbacks.onError?.(err.message || 'Failed to start microphone speech recognition.');
      }
    }
  }

  public pauseCapture(): void {
    this.isPaused = true;
    this.clearSilenceTimer();
    this.accumulatedTurnTranscript = '';

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      } finally {
        this.isListening = false;
        this.callbacks.onStateChange?.(false);
      }
    }
  }

  public resumeCapture(): void {
    if (!this.isSessionActive) return;

    this.isPaused = false;
    this.accumulatedTurnTranscript = '';
    this.clearSilenceTimer();
    this.startRecognitionInternal();
  }

  public stop(): void {
    this.isSessionActive = false;
    this.isPaused = false;
    this.clearSilenceTimer();
    this.accumulatedTurnTranscript = '';

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore if already stopped
      } finally {
        this.isListening = false;
        this.callbacks.onStateChange?.(false);
      }
    }
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();

    if (!this.isSessionActive || this.isPaused) return;

    const trimmed = this.accumulatedTurnTranscript.trim();
    if (!trimmed) return;

    this.silenceTimer = setTimeout(() => {
      if (this.isSessionActive && !this.isPaused && trimmed) {
        const turnText = this.accumulatedTurnTranscript.trim();
        this.accumulatedTurnTranscript = '';
        this.callbacks.onSpeechTurnDetected?.(turnText);
      }
    }, this.silenceDebounceMs);
  }

  private setupListeners(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      if (this.isPaused) return;

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        this.callbacks.onInterimTranscript?.(interim);
        if (this.accumulatedTurnTranscript || interim.trim().length > 3) {
          this.resetSilenceTimer();
        }
      }

      if (final) {
        this.accumulatedTurnTranscript = this.accumulatedTurnTranscript
          ? `${this.accumulatedTurnTranscript} ${final.trim()}`
          : final.trim();

        this.callbacks.onFinalTranscript?.(this.accumulatedTurnTranscript);
        this.resetSilenceTimer();
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.isPaused) return;

      console.warn('[SpeechToTextService] recognition error:', event.error);
      let message = `Microphone error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        message = 'Microphone access was denied. Please allow microphone permissions in your browser.';
      } else if (event.error === 'no-speech') {
        // no-speech is normal during quiet periods in continuous listening
        return;
      }
      this.callbacks.onError?.(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onStateChange?.(false);

      // Auto-restart if session is active and not paused by TTS
      if (this.isSessionActive && !this.isPaused) {
        setTimeout(() => {
          if (this.isSessionActive && !this.isPaused) {
            this.startRecognitionInternal();
          }
        }, 300);
      }
    };
  }
}

export const speechToTextService = new SpeechToTextService();
