import type {
  AIGenerateOptions,
  AIMessage,
  AIStructuredResponse,
  AITextResponse,
} from '@ai-tutor/shared';
import type { IAIProvider } from './ai-provider.interface.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';

export class AIService {
  private primaryProvider: IAIProvider;
  private fallbackProvider: IAIProvider;

  constructor(primary?: IAIProvider, fallback?: IAIProvider) {
    this.primaryProvider = primary || new GeminiProvider();
    this.fallbackProvider = fallback || new GroqProvider();
  }

  private isRecoverableProviderError(error: any): boolean {
    if (!error) return false;
    const message = (error.message || '').toLowerCase();
    const status = error.status || error.statusCode || error.response?.status;

    // Network / Rate Limit / Service unavailable / Quota exceeded / Provider key issues
    if (
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('fetch failed') ||
      message.includes('econnrefused') ||
      message.includes('timeout') ||
      message.includes('overloaded') ||
      message.includes('resource exhausted') ||
      message.includes('api_key') ||
      message.includes('unauthorized') ||
      message.includes('not configured')
    ) {
      return true;
    }

    return false;
  }

  async generateText(
    prompt: string | AIMessage[],
    options?: AIGenerateOptions
  ): Promise<AITextResponse> {
    try {
      if (!this.primaryProvider.isConfigured()) {
        throw new Error('Primary provider (Gemini) is not configured with GEMINI_API_KEY');
      }
      const result = await this.primaryProvider.generateText(prompt, options);
      return {
        text: result.text,
        provider: this.primaryProvider.name,
        model: result.model,
        fallbackUsed: false,
      };
    } catch (primaryError: any) {
      console.warn(`[AIService] Primary provider (${this.primaryProvider.name}) failed:`, primaryError?.message || primaryError);

      if (this.isRecoverableProviderError(primaryError) && this.fallbackProvider.isConfigured()) {
        console.info(`[AIService] Attempting fallback to ${this.fallbackProvider.name}...`);
        try {
          const fallbackResult = await this.fallbackProvider.generateText(prompt, options);
          return {
            text: fallbackResult.text,
            provider: this.fallbackProvider.name,
            model: fallbackResult.model,
            fallbackUsed: true,
          };
        } catch (fallbackError: any) {
          console.error(`[AIService] Fallback provider (${this.fallbackProvider.name}) also failed:`, fallbackError?.message || fallbackError);
          throw new Error(`AI generation failed on both primary and fallback providers: ${primaryError.message} | Fallback: ${fallbackError.message}`);
        }
      }

      throw primaryError;
    }
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<AIStructuredResponse<T>> {
    try {
      if (!this.primaryProvider.isConfigured()) {
        throw new Error('Primary provider (Gemini) is not configured with GEMINI_API_KEY');
      }
      const result = await this.primaryProvider.generateStructured<T>(prompt, schemaDescription, options);
      return {
        data: result.data,
        provider: this.primaryProvider.name,
        model: result.model,
        fallbackUsed: false,
      };
    } catch (primaryError: any) {
      console.warn(`[AIService] Primary provider structured generation failed:`, primaryError?.message || primaryError);

      if (this.isRecoverableProviderError(primaryError) && this.fallbackProvider.isConfigured()) {
        console.info(`[AIService] Attempting fallback to ${this.fallbackProvider.name} for structured output...`);
        try {
          const fallbackResult = await this.fallbackProvider.generateStructured<T>(
            prompt,
            schemaDescription,
            options
          );
          return {
            data: fallbackResult.data,
            provider: this.fallbackProvider.name,
            model: fallbackResult.model,
            fallbackUsed: true,
          };
        } catch (fallbackError: any) {
          console.error(`[AIService] Fallback structured generation failed:`, fallbackError?.message || fallbackError);
          throw new Error(`Structured AI generation failed on both providers: ${primaryError.message}`);
        }
      }

      throw primaryError;
    }
  }

  async streamText(
    prompt: string | AIMessage[],
    onChunk: (chunk: string) => void,
    options?: AIGenerateOptions
  ): Promise<AITextResponse> {
    try {
      if (!this.primaryProvider.isConfigured()) {
        throw new Error('Primary provider (Gemini) is not configured with GEMINI_API_KEY');
      }
      const result = await this.primaryProvider.streamText(prompt, onChunk, options);
      return {
        text: result.fullText,
        provider: this.primaryProvider.name,
        model: result.model,
        fallbackUsed: false,
      };
    } catch (primaryError: any) {
      console.warn(`[AIService] Primary stream failed:`, primaryError?.message || primaryError);

      if (this.isRecoverableProviderError(primaryError) && this.fallbackProvider.isConfigured()) {
        console.info(`[AIService] Attempting stream fallback to ${this.fallbackProvider.name}...`);
        try {
          const fallbackResult = await this.fallbackProvider.streamText(prompt, onChunk, options);
          return {
            text: fallbackResult.fullText,
            provider: this.fallbackProvider.name,
            model: fallbackResult.model,
            fallbackUsed: true,
          };
        } catch (fallbackError: any) {
          console.error(`[AIService] Fallback stream failed:`, fallbackError?.message || fallbackError);
          throw new Error(`Streaming failed on both providers: ${primaryError.message}`);
        }
      }

      throw primaryError;
    }
  }
}

export const aiService = new AIService();
