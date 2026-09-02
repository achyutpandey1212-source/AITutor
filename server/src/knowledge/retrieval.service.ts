import type {
  KnowledgeChunk,
  KnowledgeContext,
  RAGQueryRequest,
  RAGSearchResult,
} from '@ai-tutor/shared';
import { embeddingService, EmbeddingService } from './embedding.service.js';
import { qdrantService, QdrantService } from './vector/qdrant.service.js';
import { rerankService, RerankService } from './rerank.service.js';

export class RetrievalService {
  private embedding: EmbeddingService;
  private qdrant: QdrantService;
  private reranker: RerankService;

  constructor(
    customEmbedding?: EmbeddingService,
    customQdrant?: QdrantService,
    customReranker?: RerankService
  ) {
    this.embedding = customEmbedding || embeddingService;
    this.qdrant = customQdrant || qdrantService;
    this.reranker = customReranker || rerankService;
  }

  /**
   * Retrieves and reranks relevant document chunks for a student query.
   * Enforces multi-tenant isolation via userId.
   */
  async retrieve(
    userId: string,
    request: RAGQueryRequest
  ): Promise<RAGSearchResult> {
    const totalStart = Date.now();
    const { query, documentIds, topK = 12, topN = 4 } = request;

    // 1. Generate query embedding via Cohere
    const embedStart = Date.now();
    const queryVector = await this.embedding.embedQuery(query);
    const queryEmbeddingMs = Date.now() - embedStart;

    // 2. Retrieve top-K vector candidates from Qdrant with tenant filter
    const vectorStart = Date.now();
    const candidates = await this.qdrant.search(userId, queryVector, topK, documentIds);
    const vectorSearchMs = Date.now() - vectorStart;

    // 3. Rerank candidates with Cohere Rerank down to top-N
    const { rerankedChunks, rerankApplied, durationMs: rerankMs } =
      await this.reranker.rerank(query, candidates, topN);

    const totalRetrievalMs = Date.now() - totalStart;

    return {
      query,
      retrievedChunks: rerankedChunks,
      totalCandidates: candidates.length,
      rerankApplied,
      latency: {
        queryEmbeddingMs,
        vectorSearchMs,
        rerankMs,
        totalRetrievalMs,
      },
    };
  }

  /**
   * Helper to convert RAG search results directly into the KnowledgeContext contract
   * for consumption by TeacherEngine.
   */
  async retrieveKnowledgeContext(
    userId: string,
    query: string,
    options?: { documentIds?: string[]; topK?: number; topN?: number }
  ): Promise<KnowledgeContext | undefined> {
    try {
      const searchResult = await this.retrieve(userId, {
        query,
        documentIds: options?.documentIds,
        topK: options?.topK || 12,
        topN: options?.topN || 4,
      });

      if (searchResult.retrievedChunks.length === 0) {
        return undefined;
      }

      const knowledgeChunks: KnowledgeChunk[] = searchResult.retrievedChunks.map((c) => ({
        text: c.text,
        source: c.filename || `Document ${c.documentId}`,
        chunkId: c.chunkId,
        documentId: c.documentId,
        chunkIndex: c.chunkIndex,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        filename: c.filename,
        relevance: c.finalScore,
        rerankScore: c.rerankScore,
      }));

      return {
        sourceType: 'uploaded_document',
        retrievedChunks: knowledgeChunks,
        rerankApplied: searchResult.rerankApplied,
        totalChunksFound: searchResult.totalCandidates,
      };
    } catch (err: any) {
      console.warn('[RetrievalService] Knowledge retrieval degraded/skipped:', err.message);
      return undefined;
    }
  }
}

export const retrievalService = new RetrievalService();
