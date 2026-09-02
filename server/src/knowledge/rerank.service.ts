import { CohereClient } from 'cohere-ai';
import type { RetrievedChunk } from '@ai-tutor/shared';
import type { QdrantSearchResult } from './vector/qdrant.service.js';
import { AI_MODELS } from '../ai/ai.config.js';

export interface RerankResult {
  rerankedChunks: RetrievedChunk[];
  rerankApplied: boolean;
  durationMs: number;
}

/**
 * Dedicated Cohere Rerank Service.
 * Reorders candidate chunks using rerank-v4.0-fast to distinguish semantically relevant educational passages.
 * Degrades gracefully to raw vector similarity ranking if unavailable.
 */
export class RerankService {
  public static readonly DEFAULT_MODEL = AI_MODELS.COHERE.RERANK;

  private client: CohereClient | null = null;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.model = model || process.env.COHERE_RERANK_MODEL || RerankService.DEFAULT_MODEL;
    const token = apiKey || process.env.COHERE_API_KEY;
    if (token) {
      this.client = new CohereClient({ token });
    }
  }

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
        throw new Error('COHERE_API_KEY is not configured for Rerank');
      }
      this.client = new CohereClient({ token });
    }
    return this.client;
  }

  /**
   * Reranks candidate chunks based on student query.
   * If Cohere Rerank is unavailable or fails, gracefully falls back to vector scores.
   */
  async rerank(
    query: string,
    candidates: QdrantSearchResult[],
    topN = 4
  ): Promise<RerankResult> {
    const startTime = Date.now();

    if (candidates.length === 0) {
      return {
        rerankedChunks: [],
        rerankApplied: false,
        durationMs: 0,
      };
    }

    // If only 1 candidate, or less than topN, or Cohere not configured, use vector ranking
    if (candidates.length === 1 || !this.isConfigured()) {
      const fallback = candidates.slice(0, topN).map((c) => ({
        chunkId: c.chunkId,
        documentId: c.documentId,
        chunkIndex: c.chunkIndex,
        text: c.text,
        filename: c.filename,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        vectorScore: c.score,
        rerankScore: undefined,
        finalScore: c.score,
      }));

      return {
        rerankedChunks: fallback,
        rerankApplied: false,
        durationMs: Date.now() - startTime,
      };
    }

    try {
      const client = this.getClient();
      const documents = candidates.map((c) => ({ text: c.text }));

      const response = await client.rerank({
        model: this.model,
        query,
        documents,
        topN: Math.min(topN, candidates.length),
      });

      const reranked: RetrievedChunk[] = [];
      for (const item of response.results) {
        const candidate = candidates[item.index];
        if (candidate) {
          reranked.push({
            chunkId: candidate.chunkId,
            documentId: candidate.documentId,
            chunkIndex: candidate.chunkIndex,
            text: candidate.text,
            filename: candidate.filename,
            pageStart: candidate.pageStart,
            pageEnd: candidate.pageEnd,
            vectorScore: candidate.score,
            rerankScore: item.relevanceScore,
            finalScore: item.relevanceScore,
          });
        }
      }

      return {
        rerankedChunks: reranked,
        rerankApplied: true,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      console.warn('[RerankService] Cohere Rerank failed, falling back to vector score ranking:', err.message);

      // Graceful fallback to top-N vector sorted candidates
      const fallback = candidates
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map((c) => ({
          chunkId: c.chunkId,
          documentId: c.documentId,
          chunkIndex: c.chunkIndex,
          text: c.text,
          filename: c.filename,
          pageStart: c.pageStart,
          pageEnd: c.pageEnd,
          vectorScore: c.score,
          rerankScore: undefined,
          finalScore: c.score,
        }));

      return {
        rerankedChunks: fallback,
        rerankApplied: false,
        durationMs: Date.now() - startTime,
      };
    }
  }
}

export const rerankService = new RerankService();
