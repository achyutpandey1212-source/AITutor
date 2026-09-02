import { GoogleGenAI } from '@google/genai';
import type { AIGenerateOptions, AIMessage, AIProviderName } from '@ai-tutor/shared';
import type { IAIProvider } from '../ai-provider.interface.js';
import { KeyPool } from '../key-pool.js';
import { AI_CONFIG, AI_MODELS, GEMINI_REASONING_MODEL_CHAIN } from '../ai.config.js';
import { classifyAIError } from '../ai.errors.js';

export class GeminiProvider implements IAIProvider {
  public readonly name: AIProviderName = 'gemini';
  public readonly defaultModel = AI_MODELS.GEMINI.PRIMARY_REASONING;
  private keyPool: KeyPool | null = null;
  private clients = new Map<string, GoogleGenAI>();

  constructor(keys?: string[]) {
    if (keys && keys.length > 0) {
      this.keyPool = new KeyPool('gemini', keys);
    }
  }

  public getKeyPool(): KeyPool {
    if (!this.keyPool) {
      const configuredKeys: string[] = [];
      if (process.env.GEMINI_API_KEYS) {
        configuredKeys.push(...process.env.GEMINI_API_KEYS.split(','));
      } else if (process.env.GEMINI_API_KEY) {
        configuredKeys.push(process.env.GEMINI_API_KEY);
      }
      this.keyPool = new KeyPool('gemini', configuredKeys);
    }
    return this.keyPool;
  }

  isConfigured(): boolean {
    return this.getKeyPool().isConfigured();
  }

  private getClient(apiKey: string): GoogleGenAI {
    let client = this.clients.get(apiKey);
    if (!client) {
      client = new GoogleGenAI({ apiKey });
      this.clients.set(apiKey, client);
    }
    return client;
  }

  /**
   * Executes an operation across the model chain and key pool with bounded attempts (max 2 total),
   * strict request timeouts (10s), and instant model/provider escalation.
   */
  private async executeWithKeyAndModelRotation<R>(
    preferredModel: string,
    operation: (client: GoogleGenAI, activeModel: string, keySlot: number) => Promise<R>
  ): Promise<{ result: R; model: string }> {
    const pool = this.getKeyPool();
    if (!pool.isConfigured()) {
      throw new Error('GEMINI_API_KEYS or GEMINI_API_KEY environment variable is not configured');
    }

    // Determine model chain: preferred model first, then fallback chain
    const modelChain: string[] = [preferredModel];
    for (const fallbackModel of GEMINI_REASONING_MODEL_CHAIN) {
      if (!modelChain.includes(fallbackModel)) {
        modelChain.push(fallbackModel);
      }
    }

    let lastError: any = null;
    let totalAttempts = 0;
    const maxGlobalAttempts = AI_CONFIG.MAX_KEY_ATTEMPTS_PER_PROVIDER; // 2 attempts maximum per request

    for (const activeModel of modelChain) {
      if (totalAttempts >= maxGlobalAttempts) {
        break;
      }

      const keyInfo = pool.getNextKeyInfo();
      if (!keyInfo) {
        break;
      }

      totalAttempts++;
      const { key: apiKey, slotIndex } = keyInfo;
      const startTime = Date.now();

      try {
        const client = this.getClient(apiKey);

        // Wrap with bounded 10s timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`Gemini request timed out after ${AI_CONFIG.REQUEST_TIMEOUT_MS}ms`));
          }, AI_CONFIG.REQUEST_TIMEOUT_MS);
          timeoutId.unref?.();
        });

        const result = await Promise.race([
          operation(client, activeModel, slotIndex),
          timeoutPromise,
        ]);

        pool.markKeySuccess(apiKey);
        console.info(
          `[GeminiProvider] provider=gemini model=${activeModel} keySlot=${slotIndex} status=success durationMs=${
            Date.now() - startTime
          }`
        );

        return { result, model: activeModel };
      } catch (rawError: any) {
        lastError = rawError;
        const classified = classifyAIError(rawError);

        console.warn(
          `[GeminiProvider] provider=gemini model=${activeModel} keySlot=${slotIndex} code=${
            classified.code
          } durationMs=${Date.now() - startTime} message="${classified.message}"`
        );

        // If key level error: mark key unavailable
        if (classified.isKeyRecoverable) {
          pool.markKeyUnavailable(apiKey, undefined, classified.code);
        }

        // If non-recoverable client error (e.g. malformed request params): fail fast
        if (!classified.isProviderRecoverable && !classified.isKeyRecoverable && !classified.isModelError) {
          throw rawError;
        }

        // If we reached max bounded attempts (2 attempts total): break immediately to allow AIService fallback to Groq
        if (totalAttempts >= maxGlobalAttempts) {
          console.warn(
            `[GeminiProvider] Reached max attempt limit (${maxGlobalAttempts}). Escalating to fallback provider.`
          );
          break;
        }
      }
    }

    throw (
      lastError ||
      new Error('Gemini provider attempts exhausted. Escalating to fallback.')
    );
  }

  private formatContents(prompt: string | AIMessage[]): { contents: string; systemInstruction?: string } {
    if (typeof prompt === 'string') {
      return { contents: prompt };
    }

    let systemInstruction = '';
    const conversationParts: string[] = [];

    for (const msg of prompt) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        conversationParts.push(`${msg.role.toUpperCase()}: ${msg.content}`);
      }
    }

    return {
      contents: conversationParts.join('\n\n'),
      systemInstruction: systemInstruction || undefined,
    };
  }

  private cleanAndParseJson<T>(rawText: string): T {
    const text = rawText.trim();
    try {
      return JSON.parse(text) as T;
    } catch {
      let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/gi, '').trim();

      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }

      try {
        return JSON.parse(cleaned) as T;
      } catch (err: any) {
        throw new Error(
          `Failed to parse AI JSON response: ${err.message}. Raw text preview: ${text.substring(
            0,
            200
          )}`
        );
      }
    }
  }

  async generateText(
    prompt: string | AIMessage[],
    options?: AIGenerateOptions
  ): Promise<{ text: string; model: string }> {
    const preferredModel = options?.model || this.defaultModel;
    const { contents, systemInstruction } = this.formatContents(prompt);

    const { result, model } = await this.executeWithKeyAndModelRotation(
      preferredModel,
      async (ai, activeModel) => {
        const response = await ai.models.generateContent({
          model: activeModel,
          contents,
          config: {
            systemInstruction: options?.systemInstruction || systemInstruction,
            temperature: options?.temperature ?? 0.3,
            maxOutputTokens: options?.maxTokens || 4000,
          },
        });

        return response.text || '';
      }
    );

    return { text: result, model };
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; model: string }> {
    const preferredModel = options?.model || this.defaultModel;
    const { contents, systemInstruction } = this.formatContents(prompt);

    const structuredInstruction = `Respond ONLY with valid JSON conforming to this specification:\n${schemaDescription}\nDo not wrap in markdown codeblocks if possible, or output clean JSON only.`;

    const fullSystem = options?.systemInstruction || systemInstruction
      ? `${options?.systemInstruction || systemInstruction}\n\n${structuredInstruction}`
      : structuredInstruction;

    const { result, model } = await this.executeWithKeyAndModelRotation(
      preferredModel,
      async (ai, activeModel) => {
        const response = await ai.models.generateContent({
          model: activeModel,
          contents,
          config: {
            systemInstruction: fullSystem,
            responseMimeType: 'application/json',
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens || 4000,
          },
        });

        const text = response.text || '{}';
        return this.cleanAndParseJson<T>(text);
      }
    );

    return { data: result, model };
  }

  async streamText(
    prompt: string | AIMessage[],
    onChunk: (chunk: string) => void,
    options?: AIGenerateOptions
  ): Promise<{ fullText: string; model: string }> {
    const preferredModel = options?.model || this.defaultModel;
    const { contents, systemInstruction } = this.formatContents(prompt);

    const { result, model } = await this.executeWithKeyAndModelRotation(
      preferredModel,
      async (ai, activeModel) => {
        const responseStream = await ai.models.generateContentStream({
          model: activeModel,
          contents,
          config: {
            systemInstruction: options?.systemInstruction || systemInstruction,
            temperature: options?.temperature ?? 0.3,
            maxOutputTokens: options?.maxTokens || 4000,
          },
        });

        let fullText = '';
        for await (const chunk of responseStream) {
          const chunkText = chunk.text || '';
          if (chunkText) {
            fullText += chunkText;
            onChunk(chunkText);
          }
        }

        return fullText;
      }
    );

    return { fullText: result, model };
  }
}
