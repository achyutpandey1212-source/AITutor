export interface TTSPlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  private getBestVoice(language: 'english' | 'hindi' | 'hinglish'): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const targetLangCode = language === 'hindi' ? 'hi' : language === 'hinglish' ? 'en-IN' : 'en';

    // 1. Try exact match (e.g. hi-IN or en-IN)
    let matched = this.voices.find(
      (v) => v.lang.toLowerCase() === targetLangCode.toLowerCase() || v.lang.toLowerCase().startsWith(targetLangCode.toLowerCase())
    );

    // 2. Fallback to any English voice
    if (!matched && language === 'hinglish') {
      matched = this.voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    }

    return matched || this.voices[0] || null;
  }

  public speak(
    normalizedText: string,
    language: 'english' | 'hindi' | 'hinglish' = 'english',
    callbacks?: TTSPlaybackCallbacks
  ): void {
    if (!this.isSupported() || !this.synth) {
      callbacks?.onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    if (!normalizedText.trim()) {
      callbacks?.onEnd?.();
      return;
    }

    // Cancel any previous active playback
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    const voice = this.getBestVoice(language);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = language === 'hindi' ? 'hi-IN' : language === 'hinglish' ? 'en-IN' : 'en-US';
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      callbacks?.onEnd?.();
    };

    utterance.onerror = (e: any) => {
      this.isSpeaking = false;
      console.warn('[TextToSpeechService] utterance error:', e);
      // 'interrupted' / 'canceled' is common when stopped by user
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        callbacks?.onError?.(`Audio playback failed: ${e.error}`);
      } else {
        callbacks?.onEnd?.();
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (err: any) {
      this.isSpeaking = false;
      callbacks?.onError?.(err.message || 'Failed to speak text');
    }
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const textToSpeechService = new TextToSpeechService();
