import Groq from 'groq-sdk';
import type { AIGenerateOptions, AIMessage, AIProviderName } from '@ai-tutor/shared';
import type { IAIProvider } from '../ai-provider.interface.js';
import { KeyPool } from '../key-pool.js';
import { AI_CONFIG, AI_MODELS, GROQ_MODEL_CHAIN } from '../ai.config.js';
import { classifyAIError } from '../ai.errors.js';

export class GroqProvider implements IAIProvider {
  public readonly name: AIProviderName = 'groq';
  public readonly defaultModel = AI_MODELS.GROQ.PRIMARY;
  private keyPool: KeyPool | null = null;
  private clients = new Map<string, Groq>();

  constructor(keys?: string[]) {
    if (keys && keys.length > 0) {
      this.keyPool = new KeyPool('groq', keys);
    }
  }

  public getKeyPool(): KeyPool {
    if (!this.keyPool) {
      const configuredKeys: string[] = [];
      if (process.env.GROQ_API_KEYS) {
        configuredKeys.push(...process.env.GROQ_API_KEYS.split(','));
      } else if (process.env.GROQ_API_KEY) {
        configuredKeys.push(process.env.GROQ_API_KEY);
      }
      this.keyPool = new KeyPool('groq', configuredKeys);
    }
    return this.keyPool;
  }

  isConfigured(): boolean {
    return this.getKeyPool().isConfigured();
  }

  supportsCapability(capability: import('../ai.config.js').AICapability): boolean {
    // Groq models (Qwen 3.8 / 3.6) support text, structured reasoning, generation, text evaluation, and lightweight.
    // They do NOT support multimodal image evaluation or vision.
    switch (capability) {
      case 'MULTIMODAL_ASSESSMENT_EVALUATION':
      case 'VISION':
        return false;
      default:
        return true;
    }
  }

  private getClient(apiKey: string): Groq {
    let client = this.clients.get(apiKey);
    if (!client) {
      client = new Groq({ apiKey });
      this.clients.set(apiKey, client);
    }
    return client;
  }

  /**
   * Executes an operation across the Groq model chain and key pool with bounded attempts (max 2),
   * strict request timeouts, and instant fallback error signaling.
   */
  private async executeWithKeyAndModelRotation<R>(
    preferredModel: string,
    operation: (client: Groq, activeModel: string, keySlot: number) => Promise<R>,
    options?: AIGenerateOptions
  ): Promise<{ result: R; model: string }> {
    const pool = this.getKeyPool();
    if (!pool.isConfigured()) {
      throw new Error('GROQ_API_KEYS or GROQ_API_KEY environment variable is not configured');
    }

    const timeoutMs = options?.timeoutMs || AI_CONFIG.DEFAULT_TIMEOUT_MS;

    const modelChain: string[] = [preferredModel];
    for (const fallbackModel of GROQ_MODEL_CHAIN) {
      if (!modelChain.includes(fallbackModel)) {
        modelChain.push(fallbackModel);
      }
    }

    let lastError: any = null;
    let totalAttempts = 0;
    const maxGlobalAttempts = AI_CONFIG.MAX_KEY_ATTEMPTS_PER_PROVIDER; // 2 attempts maximum

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

        const timeoutPromise = new Promise<never>((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error(`Groq request timed out after ${timeoutMs}ms`));
          }, timeoutMs);
          timeoutId.unref?.();
        });

        const result = await Promise.race([
          operation(client, activeModel, slotIndex),
          timeoutPromise,
        ]);

        pool.markKeySuccess(apiKey);
        console.info(
          `[GroqProvider] provider=groq model=${activeModel} keySlot=${slotIndex} status=success durationMs=${
            Date.now() - startTime
          }`
        );

        return { result, model: activeModel };
      } catch (rawError: any) {
        lastError = rawError;
        const classified = classifyAIError(rawError);

        console.warn(
          `[GroqProvider] provider=groq model=${activeModel} keySlot=${slotIndex} code=${
            classified.code
          } durationMs=${Date.now() - startTime} message="${classified.message}"`
        );

        if (classified.isKeyRecoverable) {
          pool.markKeyUnavailable(apiKey, undefined, classified.code);
        }

        if (!classified.isProviderRecoverable && !classified.isKeyRecoverable && !classified.isModelError) {
          throw rawError;
        }

        if (totalAttempts >= maxGlobalAttempts) {
          break;
        }
      }
    }

    throw (
      lastError ||
      new Error('Groq provider attempts exhausted.')
    );
  }

  private formatMessages(
    prompt: string | AIMessage[],
    systemInstruction?: string
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    if (typeof prompt === 'string') {
      messages.push({ role: 'user', content: prompt });
    } else {
      for (const msg of prompt) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    return messages;
  }

  async generateText(
    prompt: string | AIMessage[],
    options?: AIGenerateOptions
  ): Promise<{ text: string; model: string }> {
    const preferredModel = options?.model || this.defaultModel;
    const messages = this.formatMessages(prompt, options?.systemInstruction);

    const { result, model } = await this.executeWithKeyAndModelRotation(
      preferredModel,
      async (groq, activeModel) => {
        const completion = await groq.chat.completions.create({
          messages,
          model: activeModel,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens || 3000,
        });

        return completion.choices[0]?.message?.content || '';
      },
      options
    );

    return { text: result, model };
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; model: string }> {
    const preferredModel = options?.model || this.defaultModel;
    const structuredInstruction = `You must return ONLY valid JSON matching this schema:\n${schemaDescription}\nDo not include any explanation, intro, or wrapping outside the JSON object.`;

    const systemInstruction = options?.systemInstruction
      ? `${options.systemInstruction}\n\n${structuredInstruction}`
      : structuredInstruction;

    const messages = this.formatMessages(prompt, systemInstruction);

    const { result, model } = await this.executeWithKeyAndModelRotation(
      preferredModel,
      async (groq, activeModel) => {
        const completion = await groq.chat.completions.create({
          messages,
          model: activeModel,
          response_format: { type: 'json_object' },
          temperature: options?.temperature ?? 0.1,
          max_tokens: options?.maxTokens || 3000,
        });

        const text = completion.choices[0]?.message?.content || '{}';
        try {
          return JSON.parse(text) as T;
        } catch {
          const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
          return JSON.parse(cleaned) as T;
        }
      },
      options
    );

    return { data: result, model };
  }

  async streamText(
    prompt: string | AIMessage[],
    onChunk: (chunk: string) => void,
    options?: AIGenerateOptions
  ): Promise<{ fullText: string; model: string }> {
    const preferredModel = options?.model || this.defaultModel;
    const messages = this.formatMessages(prompt, options?.systemInstruction);

    const { result, model } = await this.executeWithKeyAndModelRotation(
      preferredModel,
      async (groq, activeModel) => {
        const stream = await groq.chat.completions.create({
          messages,
          model: activeModel,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens || 3000,
          stream: true,
        });

        let fullText = '';
        for await (const chunk of stream) {
          const chunkText = chunk.choices[0]?.delta?.content || '';
          if (chunkText) {
            fullText += chunkText;
            onChunk(chunkText);
          }
        }
        return fullText;
      },
      options
    );

    return { fullText: result, model };
  }
}
