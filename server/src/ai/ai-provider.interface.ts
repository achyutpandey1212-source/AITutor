import type { AIGenerateOptions, AIMessage, AIProviderName } from '@ai-tutor/shared';

export interface IAIProvider {
  readonly name: AIProviderName;
  readonly defaultModel: string;
  isConfigured(): boolean;

  generateText(
    prompt: string | AIMessage[],
    options?: AIGenerateOptions
  ): Promise<{ text: string; model: string }>;

  generateStructured<T>(
    prompt: string | AIMessage[],
    schemaDescription: string,
    options?: AIGenerateOptions
  ): Promise<{ data: T; model: string }>;

  streamText(
    prompt: string | AIMessage[],
    onChunk: (chunk: string) => void,
    options?: AIGenerateOptions
  ): Promise<{ fullText: string; model: string }>;
}
