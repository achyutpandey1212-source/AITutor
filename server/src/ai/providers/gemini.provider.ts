import { GoogleGenAI } from '@google/genai';
import type { AIGenerateOptions, AIMessage, AIProviderName } from '@ai-tutor/shared';
import type { IAIProvider } from '../ai-provider.interface.js';
import { KeyPool } from '../key-pool.js';

export class GeminiProvider implements IAIProvider {
  public readonly name: AIProviderName = 'gemini';
  public readonly defaultModel = 'gemini-2.5-flash';
  private keyPool: KeyPool;
  private clients = new Map<string, GoogleGenAI>();

  constructor(keys?: string[]) {
    if (keys && keys.length > 0) {
      this.keyPool = new KeyPool('gemini', keys);
    } else {
      const configuredKeys: string[] = [];
      if (process.env.GEMINI_API_KEYS) {
        configuredKeys.push(...process.env.GEMINI_API_KEYS.split(','));
      } else if (process.env.GEMINI_API_KEY) {
        configuredKeys.push(process.env.GEMINI_API_KEY);
      }
      this.keyPool = new KeyPool('gemini', configuredKeys);
    }
  }

  isConfigured(): boolean {
    return this.keyPool.isConfigured();
  }

  public getKeyPool(): KeyPool {
    return this.keyPool;
  }

  private getClient(apiKey: string): GoogleGenAI {
    let client = this.clients.get(apiKey);
    if (!client) {
      client = new GoogleGenAI({ apiKey });
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
      status === 403 ||
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('resource exhausted') ||
      message.includes('api_key') ||
      message.includes('unauthorized') ||
      message.includes('invalid api key')
    );
  }

  private async executeWithKeyRotation<R>(
    operation: (client: GoogleGenAI) => Promise<R>
  ): Promise<R> {
    const totalKeys = this.keyPool.getKeyCount();
    if (totalKeys === 0) {
      throw new Error('GEMINI_API_KEY or GEMINI_API_KEYS environment variable is not configured');
    }

    let lastError: any = null;
    const attemptedKeys = new Set<string>();

    while (attemptedKeys.size < totalKeys) {
      const apiKey = this.keyPool.getNextKey();
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
          this.keyPool.markKeyUnavailable(apiKey);
          // Try next available key from the pool
          continue;
        }
        // Non-key/fatal programming error, throw immediately
        throw error;
      }
    }

    throw lastError || new Error('All Gemini API keys in the pool are currently unavailable/exhausted');
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

  async generateText(
    prompt: string | AIMessage[],
    options?: AIGenerateOptions
  ): Promise<{ text: string; model: string }> {
    const model = options?.model || this.defaultModel;
    const { contents, systemInstruction } = this.formatContents(prompt);

    return this.executeWithKeyRotation(async (ai) => {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: options?.systemInstruction || systemInstruction,
          temperature: options?.temperature,
          maxOutputTokens: options?.maxTokens,
        },
      });

      const text = response.text || '';
      return { text, model };
    });
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; model: string }> {
    const model = options?.model || this.defaultModel;
    const { contents, systemInstruction } = this.formatContents(prompt);

    const structuredInstruction = `Respond ONLY with valid JSON conforming to this specification:\n${schemaDescription}\nDo not wrap in markdown codeblocks if possible, or output clean JSON only.`;

    const fullSystem = options?.systemInstruction || systemInstruction
      ? `${options?.systemInstruction || systemInstruction}\n\n${structuredInstruction}`
      : structuredInstruction;

    return this.executeWithKeyRotation(async (ai) => {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: fullSystem,
          responseMimeType: 'application/json',
          temperature: options?.temperature ?? 0.1,
          maxOutputTokens: options?.maxTokens,
        },
      });

      const text = response.text || '{}';
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
    const { contents, systemInstruction } = this.formatContents(prompt);

    return this.executeWithKeyRotation(async (ai) => {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: options?.systemInstruction || systemInstruction,
          temperature: options?.temperature,
          maxOutputTokens: options?.maxTokens,
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

      return { fullText, model };
    });
  }
}
