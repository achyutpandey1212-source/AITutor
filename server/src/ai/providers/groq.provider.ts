import Groq from 'groq-sdk';
import type { AIGenerateOptions, AIMessage, AIProviderName } from '@ai-tutor/shared';
import type { IAIProvider } from '../ai-provider.interface.js';
import { KeyPool } from '../key-pool.js';

export class GroqProvider implements IAIProvider {
  public readonly name: AIProviderName = 'groq';
  public readonly defaultModel = 'llama-3.3-70b-versatile';
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

  private getClient(apiKey: string): Groq {
    let client = this.clients.get(apiKey);
    if (!client) {
      client = new Groq({ apiKey });
      this.clients.set(apiKey, client);
    }
    return client;
  }

  private isKeyRecoverableError(error: any): boolean {
    if (!error) return false;
    const message = (error.message || '').toLowerCase();
    const status = error.status || error.statusCode || error.response?.status;

    return (
      status === 429 ||
      status === 401 ||
      status === 403 ||
      message.includes('rate limit') ||
      message.includes('rate_limit_exceeded') ||
      message.includes('quota') ||
      message.includes('api_key') ||
      message.includes('invalid api key') ||
      message.includes('unauthorized')
    );
  }

  private async executeWithKeyRotation<R>(
    operation: (client: Groq) => Promise<R>
  ): Promise<R> {
    const pool = this.getKeyPool();
    const totalKeys = pool.getKeyCount();
    if (totalKeys === 0) {
      throw new Error('GROQ_API_KEY or GROQ_API_KEYS environment variable is not configured');
    }

    let lastError: any = null;
    const attemptedKeys = new Set<string>();

    while (attemptedKeys.size < totalKeys) {
      const apiKey = pool.getNextKey();
      if (!apiKey || attemptedKeys.has(apiKey)) {
        break;
      }

      attemptedKeys.add(apiKey);
      try {
        const client = this.getClient(apiKey);
        return await operation(client);
      } catch (error: any) {
        lastError = error;
        if (this.isKeyRecoverableError(error)) {
          pool.markKeyUnavailable(apiKey);
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('All Groq API keys in the pool are currently unavailable/exhausted');
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
    const model = options?.model || this.defaultModel;
    const messages = this.formatMessages(prompt, options?.systemInstruction);

    return this.executeWithKeyRotation(async (groq) => {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
      });

      const text = completion.choices[0]?.message?.content || '';
      return { text, model };
    });
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; model: string }> {
    const model = options?.model || this.defaultModel;
    const structuredInstruction = `You must return ONLY valid JSON matching this schema:\n${schemaDescription}\nDo not include any explanation, intro, or wrapping outside the JSON object.`;

    const systemInstruction = options?.systemInstruction
      ? `${options.systemInstruction}\n\n${structuredInstruction}`
      : structuredInstruction;

    const messages = this.formatMessages(prompt, systemInstruction);

    return this.executeWithKeyRotation(async (groq) => {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        response_format: { type: 'json_object' },
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.maxTokens,
      });

      const text = completion.choices[0]?.message?.content || '{}';
      try {
        const data = JSON.parse(text) as T;
        return { data, model };
      } catch {
        const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const data = JSON.parse(cleaned) as T;
        return { data, model };
      }
    });
  }

  async streamText(
    prompt: string | AIMessage[],
    onChunk: (chunk: string) => void,
    options?: AIGenerateOptions
  ): Promise<{ fullText: string; model: string }> {
    const model = options?.model || this.defaultModel;
    const messages = this.formatMessages(prompt, options?.systemInstruction);

    return this.executeWithKeyRotation(async (groq) => {
      const stream = await groq.chat.completions.create({
        messages,
        model,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        stream: true,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          onChunk(content);
        }
      }

      return { fullText, model };
    });
  }
}
