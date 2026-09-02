import crypto from 'crypto';
import { QdrantClient } from '@qdrant/js-client-rest';
import type { DocumentChunk } from '@ai-tutor/shared';
import { EmbeddingService } from '../embedding.service.js';

export interface QdrantPointPayload {
  userId: string;
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  text: string;
  filename?: string;
  pageStart?: number;
  pageEnd?: number;
  metadata?: Record<string, any>;
}

export interface QdrantSearchResult {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  filename?: string;
  pageStart?: number;
  pageEnd?: number;
  score: number;
}

/**
 * Service managing Qdrant vector database interactions with strict multi-tenant isolation.
 */
export class QdrantService {
  public static readonly DEFAULT_COLLECTION = 'ai_tutor_knowledge';

  private client: QdrantClient | null = null;
  private collectionName: string;
  private isInitialized = false;

  constructor(collectionName?: string) {
    this.collectionName =
      collectionName || process.env.QDRANT_COLLECTION || QdrantService.DEFAULT_COLLECTION;
  }

  private getClient(): QdrantClient {
    if (!this.client) {
      const url = process.env.QDRANT_URL || 'http://localhost:6333';
      const apiKey = process.env.QDRANT_API_KEY || undefined;
      this.client = new QdrantClient({ url, apiKey });
    }
    return this.client;
  }

  /**
   * Deterministically converts a string key into a valid RFC 4122 UUID for Qdrant point IDs.
   */
  private generateDeterministicUuid(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
  }

  /**
   * Ensures the Qdrant collection exists with proper dimensions and Cosine distance metric.
   */
  async ensureCollection(vectorDimension = EmbeddingService.VECTOR_DIMENSION): Promise<void> {
    if (this.isInitialized) return;

    try {
      const client = this.getClient();
      const collections = await client.getCollections();
      const exists = collections.collections.some((c) => c.name === this.collectionName);

      if (!exists) {
        console.info(`[QdrantService] Creating collection '${this.collectionName}' with dimension ${vectorDimension}...`);
        await client.createCollection(this.collectionName, {
          vectors: {
            size: vectorDimension,
            distance: 'Cosine',
          },
        });

        // Create payload index on userId for fast tenant filtering
        try {
          await client.createPayloadIndex(this.collectionName, {
            field_name: 'userId',
            field_schema: 'keyword',
          });
          await client.createPayloadIndex(this.collectionName, {
            field_name: 'documentId',
            field_schema: 'keyword',
          });
        } catch (indexErr) {
          console.warn('[QdrantService] Payload index setup notice:', indexErr);
        }
      }

      this.isInitialized = true;
    } catch (err: any) {
      console.error('[QdrantService] Failed to ensure Qdrant collection:', err.message);
      throw err;
    }
  }

  /**
   * Upserts chunk embeddings into Qdrant with associated payload metadata.
   */
  async upsertChunks(
    userId: string,
    chunks: DocumentChunk[],
    embeddings: number[][]
  ): Promise<void> {
    if (chunks.length === 0 || chunks.length !== embeddings.length) {
      throw new Error('Chunk and embedding lengths must match and be non-empty');
    }

    await this.ensureCollection(embeddings[0].length);
    const client = this.getClient();

    const points = chunks.map((chunk, idx) => {
      const pointId = this.generateDeterministicUuid(`${chunk.documentId}_${chunk.chunkIndex}`);
      const payload: QdrantPointPayload = {
        userId,
        documentId: chunk.documentId,
        chunkId: chunk.chunkId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        filename: chunk.metadata?.filename,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        metadata: chunk.metadata,
      };

      return {
        id: pointId,
        vector: embeddings[idx],
        payload: payload as any,
      };
    });

    await client.upsert(this.collectionName, {
      wait: true,
      points,
    });
  }

  /**
   * Searches for top-K matching vectors for a given user.
   * STRICT SECURITY: userId filter is mandatory to ensure complete multi-tenant isolation.
   */
  async search(
    userId: string,
    queryVector: number[],
    limit = 12,
    documentIds?: string[]
  ): Promise<QdrantSearchResult[]> {
    if (!userId) {
      throw new Error('Security violation: userId is required for Qdrant vector search');
    }

    await this.ensureCollection(queryVector.length);
    const client = this.getClient();

    const mustFilters: any[] = [
      {
        key: 'userId',
        match: { value: userId },
      },
    ];

    if (documentIds && documentIds.length > 0) {
      mustFilters.push({
        key: 'documentId',
        match: { any: documentIds },
      });
    }

    const response = await client.query(this.collectionName, {
      query: queryVector,
      limit,
      filter: {
        must: mustFilters,
      },
      with_payload: true,
    });

    const hits = response.points || [];
    return hits.map((hit: any) => {
      const p = (hit.payload || {}) as QdrantPointPayload;
      return {
        chunkId: p.chunkId || String(hit.id),
        documentId: p.documentId,
        chunkIndex: p.chunkIndex || 0,
        text: p.text || '',
        filename: p.filename,
        pageStart: p.pageStart,
        pageEnd: p.pageEnd,
        score: hit.score || 0,
      };
    });
  }

  /**
   * Deletes all vectors for a specific document belonging to a user.
   */
  async deleteByDocument(userId: string, documentId: string): Promise<void> {
    if (!userId || !documentId) {
      throw new Error('userId and documentId required for deletion');
    }

    await this.ensureCollection();
    const client = this.getClient();

    await client.delete(this.collectionName, {
      wait: true,
      filter: {
        must: [
          { key: 'userId', match: { value: userId } },
          { key: 'documentId', match: { value: documentId } },
        ],
      },
    });
  }
}

export const qdrantService = new QdrantService();
