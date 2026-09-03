export interface TTSPlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private activeUtteranceId: number = 0;

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

  private splitSentences(text: string): string[] {
    const raw = text.trim();
    if (!raw) return [];
    // Split by punctuation followed by space or newline, while keeping sensible chunk sizes
    const chunks = raw
      .replace(/([.!?])\s+/g, '$1|~|')
      .split('|~|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return chunks.length > 0 ? chunks : [raw];
  }

  public speak(
    normalizedText: string,
    language: 'english' | 'hindi' | 'hinglish' = 'english',
    callbacks?: TTSPlaybackCallbacks,
    _turnId?: string
  ): void {
    if (!this.isSupported() || !this.synth) {
      callbacks?.onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    if (!normalizedText.trim()) {
      callbacks?.onEnd?.();
      return;
    }

    // Cancel any previous playback and invalidate stale generation IDs
    this.cancel();
    const currentUtteranceId = ++this.activeUtteranceId;

    const sentences = this.splitSentences(normalizedText);
    const voice = this.getBestVoice(language);
    const langCode = language === 'hindi' ? 'hi-IN' : language === 'hinglish' ? 'en-IN' : 'en-US';

    let hasStarted = false;

    sentences.forEach((sentence, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === sentences.length - 1;

      const utterance = new SpeechSynthesisUtterance(sentence);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = langCode;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (currentUtteranceId !== this.activeUtteranceId) return;
        this.isSpeaking = true;
        if (isFirst && !hasStarted) {
          hasStarted = true;
          callbacks?.onStart?.();
        }
      };

      utterance.onend = () => {
        if (currentUtteranceId !== this.activeUtteranceId) return;
        if (isLast) {
          this.isSpeaking = false;
          callbacks?.onEnd?.();
        }
      };

      utterance.onerror = (e: any) => {
        if (currentUtteranceId !== this.activeUtteranceId) return;
        this.isSpeaking = false;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          callbacks?.onError?.(`Audio playback failed: ${e.error}`);
        }
      };

      try {
        this.synth?.speak(utterance);
      } catch (err: any) {
        if (currentUtteranceId !== this.activeUtteranceId) return;
        this.isSpeaking = false;
        callbacks?.onError?.(err.message || 'Failed to speak text');
      }
    });
  }

  public cancel(): void {
    // Increment generation ID to immediately invalidate pending callbacks
    this.activeUtteranceId++;
    this.isSpeaking = false;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
  }

  public stop(): void {
    this.cancel();
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const textToSpeechService = new TextToSpeechService();
