export interface SpeechToTextCallbacks {
  onInterimTranscript?: (interim: string) => void;
  onFinalTranscript?: (final: string) => void;
  onError?: (error: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

export class SpeechToTextService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'en-US';
  private callbacks: SpeechToTextCallbacks = {};

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
      callbacks.onError?.('Speech-to-Text is not supported in this browser. Please use Chrome, Edge, or enter text manually.');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.callbacks = callbacks;
    this.recognition.lang = this.currentLanguage;

    try {
      this.recognition.start();
      this.isListening = true;
      this.callbacks.onStateChange?.(true);
    } catch (err: any) {
      this.isListening = false;
      this.callbacks.onStateChange?.(false);
      this.callbacks.onError?.(err.message || 'Failed to start microphone speech recognition.');
    }
  }

  public stop(): void {
    if (!this.isListening || !this.recognition) {
      return;
    }

    try {
      this.recognition.stop();
    } catch {
      // Ignore if already stopped
    } finally {
      this.isListening = false;
      this.callbacks.onStateChange?.(false);
    }
  }

  private setupListeners(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
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

      if (interim && this.callbacks.onInterimTranscript) {
        this.callbacks.onInterimTranscript(interim);
      }

      if (final && this.callbacks.onFinalTranscript) {
        this.callbacks.onFinalTranscript(final);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('[SpeechToTextService] recognition error:', event.error);
      let message = `Microphone error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        message = 'Microphone access was denied. Please allow microphone permissions in your browser.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak into your microphone and try again.';
      }
      this.callbacks.onError?.(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onStateChange?.(false);
    };
  }
}

export const speechToTextService = new SpeechToTextService();
