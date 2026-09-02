import type {
  AIGenerateOptions,
  AIMessage,
  AIStructuredResponse,
  AITextResponse,
} from '@ai-tutor/shared';
import type { IAIProvider } from './ai-provider.interface.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import { AITaskType, TASK_MODEL_MAPPINGS } from './ai.config.js';
import { classifyAIError } from './ai.errors.js';

export interface AIServiceGenerateOptions extends AIGenerateOptions {
  taskType?: AITaskType;
}

export class AIService {
  private primaryProvider: IAIProvider;
  private fallbackProvider: IAIProvider;

  constructor(primary?: IAIProvider, fallback?: IAIProvider) {
    this.primaryProvider = primary || new GeminiProvider();
    this.fallbackProvider = fallback || new GroqProvider();
  }

  public getPrimaryProvider(): IAIProvider {
    return this.primaryProvider;
  }

  public getFallbackProvider(): IAIProvider {
    return this.fallbackProvider;
  }

  /**
   * Resolves options based on explicit task type mapping.
   */
  private resolveOptions(options?: AIServiceGenerateOptions): AIGenerateOptions {
    if (!options?.taskType) {
      return options || {};
    }

    const taskConfig = TASK_MODEL_MAPPINGS[options.taskType];
    if (!taskConfig) {
      return options;
    }

    return {
      ...options,
      model: options.model || taskConfig.modelChain[0],
      temperature: options.temperature ?? taskConfig.temperature,
      maxTokens: options.maxTokens || taskConfig.maxTokens,
    };
  }

  async generateText(
    prompt: string | AIMessage[],
    options?: AIServiceGenerateOptions
  ): Promise<AITextResponse> {
    const resolvedOpts = this.resolveOptions(options);
    const primaryConfigured = this.primaryProvider.isConfigured();
    const fallbackConfigured = this.fallbackProvider.isConfigured();

    if (!primaryConfigured && !fallbackConfigured) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEYS or GROQ_API_KEYS in server/.env');
    }

    if (primaryConfigured) {
      try {
        const result = await this.primaryProvider.generateText(prompt, resolvedOpts);
        return {
          text: result.text,
          provider: this.primaryProvider.name,
          model: result.model,
          fallbackUsed: false,
        };
      } catch (primaryError: any) {
        const classified = classifyAIError(primaryError);
        console.warn(
          `[AIService] Primary provider (${this.primaryProvider.name}) failed with code ${classified.code}:`,
          classified.message
        );

        if (classified.isProviderRecoverable && fallbackConfigured) {
          console.info(`[AIService] Routing to fallback provider (${this.fallbackProvider.name})...`);
          try {
            const fallbackOpts: AIServiceGenerateOptions = {
              ...resolvedOpts,
              model: options?.model && !options.model.startsWith('gemini') ? options.model : undefined,
              taskType: 'fallback_reasoning',
            };
            const fallbackResult = await this.fallbackProvider.generateText(prompt, fallbackOpts);
            return {
              text: fallbackResult.text,
              provider: this.fallbackProvider.name,
              model: fallbackResult.model,
              fallbackUsed: true,
            };
          } catch (fallbackError: any) {
            const fallbackClassified = classifyAIError(fallbackError);
            console.error(
              `[AIService] Fallback provider (${this.fallbackProvider.name}) failed with code ${fallbackClassified.code}:`,
              fallbackClassified.message
            );
            throw new Error(
              `AI generation failed on both primary (${classified.code}) and fallback (${fallbackClassified.code}) providers.`
            );
          }
        }

        throw primaryError;
      }
    } else {
      console.info(
        `[AIService] Primary provider not configured. Routing directly to fallback (${this.fallbackProvider.name})...`
      );
      const fallbackResult = await this.fallbackProvider.generateText(prompt, resolvedOpts);
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
    options?: AIServiceGenerateOptions
  ): Promise<AIStructuredResponse<T>> {
    const resolvedOpts = this.resolveOptions(options);
    const primaryConfigured = this.primaryProvider.isConfigured();
    const fallbackConfigured = this.fallbackProvider.isConfigured();

    if (!primaryConfigured && !fallbackConfigured) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEYS or GROQ_API_KEYS in server/.env');
    }

    if (primaryConfigured) {
      try {
        const result = await this.primaryProvider.generateStructured<T>(
          prompt,
          schemaDescription,
          resolvedOpts
        );
        return {
          data: result.data,
          provider: this.primaryProvider.name,
          model: result.model,
          fallbackUsed: false,
        };
      } catch (primaryError: any) {
        const classified = classifyAIError(primaryError);
        console.warn(
          `[AIService] Primary provider structured generation failed with code ${classified.code}:`,
          classified.message
        );

        if (classified.isProviderRecoverable && fallbackConfigured) {
          console.info(
            `[AIService] Routing structured request to fallback provider (${this.fallbackProvider.name})...`
          );
          try {
            const fallbackOpts: AIServiceGenerateOptions = {
              ...resolvedOpts,
              model: options?.model && !options.model.startsWith('gemini') ? options.model : undefined,
              taskType: 'fallback_reasoning',
            };
            const fallbackResult = await this.fallbackProvider.generateStructured<T>(
              prompt,
              schemaDescription,
              fallbackOpts
            );
            return {
              data: fallbackResult.data,
              provider: this.fallbackProvider.name,
              model: fallbackResult.model,
              fallbackUsed: true,
            };
          } catch (fallbackError: any) {
            const fallbackClassified = classifyAIError(fallbackError);
            console.error(
              `[AIService] Fallback structured generation failed with code ${fallbackClassified.code}:`,
              fallbackClassified.message
            );
            throw new Error(
              `Structured generation failed on both primary (${classified.code}) and fallback (${fallbackClassified.code}) providers.`
            );
          }
        }

        throw primaryError;
      }
    } else {
      console.info(
        `[AIService] Primary provider not configured. Routing structured request directly to fallback (${this.fallbackProvider.name})...`
      );
      const fallbackResult = await this.fallbackProvider.generateStructured<T>(
        prompt,
        schemaDescription,
        resolvedOpts
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
    options?: AIServiceGenerateOptions
  ): Promise<AITextResponse> {
    const resolvedOpts = this.resolveOptions(options);
    const primaryConfigured = this.primaryProvider.isConfigured();
    const fallbackConfigured = this.fallbackProvider.isConfigured();

    if (!primaryConfigured && !fallbackConfigured) {
      throw new Error('No AI providers configured. Set GEMINI_API_KEYS or GROQ_API_KEYS in server/.env');
    }

    if (primaryConfigured) {
      try {
        const result = await this.primaryProvider.streamText(prompt, onChunk, resolvedOpts);
        return {
          text: result.fullText,
          provider: this.primaryProvider.name,
          model: result.model,
          fallbackUsed: false,
        };
      } catch (primaryError: any) {
        const classified = classifyAIError(primaryError);
        console.warn(
          `[AIService] Primary stream failed with code ${classified.code}:`,
          classified.message
        );

        if (classified.isProviderRecoverable && fallbackConfigured) {
          console.info(`[AIService] Routing stream to fallback provider (${this.fallbackProvider.name})...`);
          try {
            const fallbackOpts: AIServiceGenerateOptions = {
              ...resolvedOpts,
              model: options?.model && !options.model.startsWith('gemini') ? options.model : undefined,
              taskType: 'fallback_reasoning',
            };
            const fallbackResult = await this.fallbackProvider.streamText(
              prompt,
              onChunk,
              fallbackOpts
            );
            return {
              text: fallbackResult.fullText,
              provider: this.fallbackProvider.name,
              model: fallbackResult.model,
              fallbackUsed: true,
            };
          } catch (fallbackError: any) {
            const fallbackClassified = classifyAIError(fallbackError);
            console.error(
              `[AIService] Fallback stream failed with code ${fallbackClassified.code}:`,
              fallbackClassified.message
            );
            throw new Error(
              `Streaming failed on both primary (${classified.code}) and fallback (${fallbackClassified.code}) providers.`
            );
          }
        }

        throw primaryError;
      }
    } else {
      console.info(
        `[AIService] Primary provider not configured. Routing stream directly to fallback (${this.fallbackProvider.name})...`
      );
      const fallbackResult = await this.fallbackProvider.streamText(prompt, onChunk, resolvedOpts);
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
