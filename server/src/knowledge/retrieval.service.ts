import crypto from 'crypto';
import type {
  KnowledgeChunk,
  KnowledgeContext,
  RAGQueryRequest,
  RAGSearchResult,
} from '@ai-tutor/shared';
import { embeddingService, EmbeddingService } from './embedding.service.js';
import { qdrantService, QdrantService, QdrantSearchResult } from './vector/qdrant.service.js';
import { rerankService, RerankService } from './rerank.service.js';
import { documentService, DocumentService } from './document.service.js';

export class RetrievalService {
  public static readonly DEFAULT_RERANK_MIN_SCORE = 0.25;
  public static readonly DEFAULT_VECTOR_MIN_SCORE = 0.40;

  private embedding: EmbeddingService;
  private qdrant: QdrantService;
  private reranker: RerankService;
  private documents: DocumentService;
  private rerankMinScore: number;
  private vectorMinScore: number;

  constructor(
    customEmbedding?: EmbeddingService,
    customQdrant?: QdrantService,
    customReranker?: RerankService,
    customDocuments?: DocumentService
  ) {
    this.embedding = customEmbedding || embeddingService;
    this.qdrant = customQdrant || qdrantService;
    this.reranker = customReranker || rerankService;
    this.documents = customDocuments || documentService;

    this.rerankMinScore = parseFloat(
      process.env.RAG_RERANK_MIN_SCORE || String(RetrievalService.DEFAULT_RERANK_MIN_SCORE)
    );
    this.vectorMinScore = parseFloat(
      process.env.RAG_VECTOR_MIN_SCORE || String(RetrievalService.DEFAULT_VECTOR_MIN_SCORE)
    );
  }

  /**
   * Deterministically deduplicates candidate chunks based on text content hash and chunk identity.
   */
  public deduplicateCandidates(candidates: QdrantSearchResult[]): QdrantSearchResult[] {
    const seenHashes = new Set<string>();
    const seenIdentities = new Set<string>();
    const deduplicated: QdrantSearchResult[] = [];

    for (const candidate of candidates) {
      // Content hash for normalized text
      const textNormalized = candidate.text.trim().toLowerCase().replace(/\s+/g, ' ');
      const contentHash = crypto.createHash('md5').update(textNormalized).digest('hex');

      // Logical identity (filename + chunkIndex)
      const logicalId = `${candidate.filename || candidate.documentId}_chk_${candidate.chunkIndex}`;

      if (!seenHashes.has(contentHash) && !seenIdentities.has(logicalId)) {
        seenHashes.add(contentHash);
        seenIdentities.add(logicalId);
        deduplicated.push(candidate);
      }
    }

    return deduplicated;
  }

  /**
   * Retrieves, deduplicates, reranks, and gates candidate chunks based on relevance.
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
    const rawCandidates = await this.qdrant.search(userId, queryVector, topK, documentIds);
    const vectorSearchMs = Date.now() - vectorStart;

    // 3. Deduplicate candidate chunks
    const deduplicatedCandidates = this.deduplicateCandidates(rawCandidates);

    // 4. Rerank candidates with Cohere Rerank down to top-N
    const { rerankedChunks, rerankApplied, durationMs: rerankMs } =
      await this.reranker.rerank(query, deduplicatedCandidates, topN);

    // 5. Relevance Gating Policy:
    // Reject weak or unrelated candidates to prevent grounding on irrelevant context.
    const threshold = rerankApplied ? this.rerankMinScore : this.vectorMinScore;
    const trustworthyChunks = rerankedChunks.filter(
      (chunk) => (chunk.finalScore ?? 0) >= threshold
    );

    const totalRetrievalMs = Date.now() - totalStart;

    return {
      query,
      retrievedChunks: trustworthyChunks,
      totalCandidates: rawCandidates.length,
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
   * Formulates an explicit KnowledgeContext contract for TeacherEngine:
   * - hasUploadedDocuments: true/false
   * - relevantContextFound: true/false
   * - retrievedChunks: trustworthy chunks passing relevance gate
   */
  async retrieveKnowledgeContext(
    userId: string,
    query: string,
    options?: { documentIds?: string[]; topK?: number; topN?: number }
  ): Promise<KnowledgeContext> {
    const hasDocs = await this.documents.hasReadyDocuments(userId);

    // Case A: No documents uploaded by user
    if (!hasDocs) {
      return {
        sourceType: 'uploaded_document',
        hasUploadedDocuments: false,
        relevantContextFound: false,
        retrievedChunks: [],
      };
    }

    try {
      const searchResult = await this.retrieve(userId, {
        query,
        documentIds: options?.documentIds,
        topK: options?.topK || 12,
        topN: options?.topN || 4,
      });

      const relevantChunks: KnowledgeChunk[] = searchResult.retrievedChunks.map((c) => ({
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

      const relevantContextFound = relevantChunks.length > 0;

      return {
        sourceType: 'uploaded_document',
        hasUploadedDocuments: true,
        relevantContextFound,
        retrievedChunks: relevantChunks,
        rerankApplied: searchResult.rerankApplied,
        totalChunksFound: searchResult.totalCandidates,
        relevanceThreshold: searchResult.rerankApplied ? this.rerankMinScore : this.vectorMinScore,
      };
    } catch (err: any) {
      console.warn('[RetrievalService] RAG search degraded:', err.message);
      return {
        sourceType: 'uploaded_document',
        hasUploadedDocuments: true,
        relevantContextFound: false,
        retrievedChunks: [],
      };
    }
  }
}

export const retrievalService = new RetrievalService();
