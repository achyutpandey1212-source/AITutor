import { CohereClient } from 'cohere-ai';

export interface EmbeddingConfig {
  model?: string;
  vectorDimension?: number;
  batchSize?: number;
}

/**
 * Dedicated Cohere Embedding Service.
 * Centralizes embedding models, vector dimensions, batching, and input types.
 */
export class EmbeddingService {
  public static readonly DEFAULT_MODEL = 'embed-english-v3.0';
  public static readonly VECTOR_DIMENSION = 1024;
  public static readonly DEFAULT_BATCH_SIZE = 64;

  private client: CohereClient | null = null;
  private model: string;
  private vectorDimension: number;
  private batchSize: number;

  constructor(apiKey?: string, config?: EmbeddingConfig) {
    this.model = config?.model || process.env.COHERE_EMBED_MODEL || EmbeddingService.DEFAULT_MODEL;
    this.vectorDimension = config?.vectorDimension || EmbeddingService.VECTOR_DIMENSION;
    this.batchSize = config?.batchSize || EmbeddingService.DEFAULT_BATCH_SIZE;

    const token = apiKey || process.env.COHERE_API_KEY;
    if (token) {
      this.client = new CohereClient({ token });
    }
  }

  /**
   * Returns whether Cohere is configured with an API key.
   */
  isConfigured(): boolean {
    if (!this.client) {
      const token = process.env.COHERE_API_KEY;
      if (token) {
        this.client = new CohereClient({ token });
        return true;
      }
      return false;
    }
    return true;
  }

  private getClient(): CohereClient {
    if (!this.client) {
      const token = process.env.COHERE_API_KEY;
      if (!token) {
        throw new Error('COHERE_API_KEY is not configured in server/.env');
      }
      this.client = new CohereClient({ token });
    }
    return this.client;
  }

  public getVectorDimension(): number {
    return this.vectorDimension;
  }

  public getModelName(): string {
    return this.model;
  }

  /**
   * Embeds a batch of texts for document storage with inputType="search_document".
   * Automatically divides chunks into optimal sub-batches to avoid API payload limits.
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embedBatch(texts, 'search_document');
  }

  /**
   * Embeds a student search query with inputType="search_query".
   */
  async embedQuery(query: string): Promise<number[]> {
    const vectors = await this.embedBatch([query], 'search_query');
    if (vectors.length === 0 || vectors[0].length === 0) {
      throw new Error('Cohere returned empty embedding for query');
    }
    return vectors[0];
  }

  /**
   * Low-level batched embedding call.
   */
  private async embedBatch(
    texts: string[],
    inputType: 'search_document' | 'search_query'
  ): Promise<number[][]> {
    if (texts.length === 0) return [];
    const client = this.getClient();

    const allVectors: number[][] = [];

    // Process in sub-batches
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);

      const response = await client.embed({
        texts: batch,
        model: this.model,
        inputType,
        embeddingTypes: ['float'],
      });

      // Handle both float array mapping and direct matrix output formats
      let embeddings: number[][] = [];
      if (response.embeddings && Array.isArray(response.embeddings)) {
        embeddings = response.embeddings as number[][];
      } else if (response.embeddings && (response.embeddings as any).float) {
        embeddings = (response.embeddings as any).float as number[][];
      } else {
        throw new Error('Unexpected embedding response format from Cohere API');
      }

      for (const vec of embeddings) {
        allVectors.push(vec);
      }
    }

    return allVectors;
  }
}

export const embeddingService = new EmbeddingService();
