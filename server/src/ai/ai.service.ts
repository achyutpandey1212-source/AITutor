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
      status === 401 ||
      status === 403 ||
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
    const primaryConfigured = this.primaryProvider.isConfigured();
    const fallbackConfigured = this.fallbackProvider.isConfigured();

    if (!primaryConfigured && !fallbackConfigured) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEYS or GROQ_API_KEYS in server/.env');
    }

    if (primaryConfigured) {
      try {
        const result = await this.primaryProvider.generateText(prompt, options);
        return {
          text: result.text,
          provider: this.primaryProvider.name,
          model: result.model,
          fallbackUsed: false,
        };
      } catch (primaryError: any) {
        console.warn(`[AIService] Primary provider (${this.primaryProvider.name}) failed:`, primaryError?.message || primaryError);

        if (this.isRecoverableProviderError(primaryError) && fallbackConfigured) {
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
    } else {
      // Direct fallback if primary not configured
      console.info(`[AIService] Primary provider not configured. Routing directly to fallback provider (${this.fallbackProvider.name})...`);
      const fallbackResult = await this.fallbackProvider.generateText(prompt, options);
      return {
        text: fallbackResult.text,
        provider: this.fallbackProvider.name,
        model: fallbackResult.model,
        fallbackUsed: true,
      };
    }
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<AIStructuredResponse<T>> {
    const primaryConfigured = this.primaryProvider.isConfigured();
    const fallbackConfigured = this.fallbackProvider.isConfigured();

    if (!primaryConfigured && !fallbackConfigured) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEYS or GROQ_API_KEYS in server/.env');
    }

    if (primaryConfigured) {
      try {
        const result = await this.primaryProvider.generateStructured<T>(prompt, schemaDescription, options);
        return {
          data: result.data,
          provider: this.primaryProvider.name,
          model: result.model,
          fallbackUsed: false,
        };
      } catch (primaryError: any) {
        console.warn(`[AIService] Primary provider structured generation failed:`, primaryError?.message || primaryError);

        if (this.isRecoverableProviderError(primaryError) && fallbackConfigured) {
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
    } else {
      console.info(`[AIService] Primary provider not configured. Routing structured output directly to fallback (${this.fallbackProvider.name})...`);
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
    }
  }

  async streamText(
    prompt: string | AIMessage[],
    onChunk: (chunk: string) => void,
    options?: AIGenerateOptions
  ): Promise<AITextResponse> {
    const primaryConfigured = this.primaryProvider.isConfigured();
    const fallbackConfigured = this.fallbackProvider.isConfigured();

    if (!primaryConfigured && !fallbackConfigured) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEYS or GROQ_API_KEYS in server/.env');
    }

    if (primaryConfigured) {
      try {
        const result = await this.primaryProvider.streamText(prompt, onChunk, options);
        return {
          text: result.fullText,
          provider: this.primaryProvider.name,
          model: result.model,
          fallbackUsed: false,
        };
      } catch (primaryError: any) {
        console.warn(`[AIService] Primary stream failed:`, primaryError?.message || primaryError);

        if (this.isRecoverableProviderError(primaryError) && fallbackConfigured) {
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
    } else {
      console.info(`[AIService] Primary provider not configured. Routing stream directly to fallback (${this.fallbackProvider.name})...`);
      const fallbackResult = await this.fallbackProvider.streamText(prompt, onChunk, options);
      return {
        text: fallbackResult.fullText,
        provider: this.fallbackProvider.name,
        model: fallbackResult.model,
        fallbackUsed: true,
      };
    }
  }
}

export const aiService = new AIService();
