import type { ExtractionMethod } from '@ai-tutor/shared';
import { PDFExtractor } from './extraction/pdf-extractor.js';
import { geminiExtractor, GeminiExtractor } from './extraction/gemini-extractor.js';
import { ChunkingService } from './chunking.service.js';
import { embeddingService, EmbeddingService } from './embedding.service.js';
import { qdrantService, QdrantService } from './vector/qdrant.service.js';
import { documentService, DocumentService } from './document.service.js';

export interface IngestionTelemetry {
  documentId: string;
  filename: string;
  extractionMethod: ExtractionMethod;
  pageCount: number;
  chunkCount: number;
  extractionDurationMs: number;
  chunkingDurationMs: number;
  embeddingDurationMs: number;
  upsertDurationMs: number;
  totalDurationMs: number;
}

/**
 * Orchestrates asynchronous document ingestion:
 * Deterministic extraction -> Gemini fallback -> Chunking -> Cohere embedding -> Qdrant indexing.
 */
export class IngestionService {
  private gemini: GeminiExtractor;
  private embedding: EmbeddingService;
  private qdrant: QdrantService;
  private documents: DocumentService;

  constructor(
    customGemini?: GeminiExtractor,
    customEmbedding?: EmbeddingService,
    customQdrant?: QdrantService,
    customDocuments?: DocumentService
  ) {
    this.gemini = customGemini || geminiExtractor;
    this.embedding = customEmbedding || embeddingService;
    this.qdrant = customQdrant || qdrantService;
    this.documents = customDocuments || documentService;
  }

  /**
   * Processes an uploaded document asynchronously in the background.
   */
  async processDocument(
    documentId: string,
    userId: string,
    filename: string,
    fileBuffer: Buffer
  ): Promise<void> {
    const totalStart = Date.now();
    console.info(`[IngestionService] Starting ingestion for doc=${documentId} file="${filename}" user=${userId}`);

    try {
      await this.documents.updateStatus(documentId, 'processing');

      // 1. Deterministic PDF Extraction
      const extractStart = Date.now();
      let extractedText = '';
      let pageCount = 1;
      let extractionMethod: ExtractionMethod = 'pdf_text';

      const pdfResult = await PDFExtractor.extractText(fileBuffer);
      pageCount = pdfResult.pageCount || 1;

      if (pdfResult.success && pdfResult.isUsable) {
        extractedText = pdfResult.text;
        extractionMethod = 'pdf_text';
        console.info(`[IngestionService] Deterministic PDF extraction succeeded (pages=${pageCount}, quality=${pdfResult.qualityScore.toFixed(2)})`);
      } else {
        // Fallback: Gemini document understanding
        console.warn(`[IngestionService] Deterministic extraction unusable (${pdfResult.error || 'poor quality'}). Invoking Gemini fallback...`);
        const geminiResult = await this.gemini.extractAndClean(pdfResult.text, filename);
        if (!geminiResult.success || !geminiResult.text) {
          throw new Error(`Document extraction failed completely: ${geminiResult.error || 'Gemini could not transcribe document'}`);
        }
        extractedText = geminiResult.text;
        extractionMethod = 'gemini_fallback';
        console.info(`[IngestionService] Gemini document fallback extraction succeeded`);
      }
      const extractionDurationMs = Date.now() - extractStart;

      // 2. Deterministic Chunking
      const chunkStart = Date.now();
      const chunks = ChunkingService.chunkDocument(
        documentId,
        extractedText,
        filename,
        pageCount
      );

      if (chunks.length === 0) {
        throw new Error('No valid text chunks could be produced from document content');
      }
      const chunkingDurationMs = Date.now() - chunkStart;
      console.info(`[IngestionService] Chunking produced ${chunks.length} chunks`);

      // 3. Batched Cohere Embedding
      const embedStart = Date.now();
      const chunkTexts = chunks.map((c) => c.text);
      const embeddings = await this.embedding.embedDocuments(chunkTexts);
      const embeddingDurationMs = Date.now() - embedStart;
      console.info(`[IngestionService] Generated ${embeddings.length} embeddings in ${embeddingDurationMs}ms`);

      // 4. Qdrant Vector Upsert with tenant isolation
      const upsertStart = Date.now();
      await this.qdrant.upsertChunks(userId, chunks, embeddings);
      const upsertDurationMs = Date.now() - upsertStart;
      console.info(`[IngestionService] Indexed ${chunks.length} vectors in Qdrant in ${upsertDurationMs}ms`);

      const safePageCount = typeof pageCount === 'number' && !isNaN(pageCount) && pageCount > 0 
        ? Math.floor(pageCount) 
        : 1;

      // 5. Update MongoDB Status to 'ready'
      await this.documents.updateStatus(documentId, 'ready', {
        extractionMethod,
        pageCount: safePageCount,
        chunkCount: chunks.length,
      });

      const totalDurationMs = Date.now() - totalStart;
      const telemetry: IngestionTelemetry = {
        documentId,
        filename,
        extractionMethod,
        pageCount,
        chunkCount: chunks.length,
        extractionDurationMs,
        chunkingDurationMs,
        embeddingDurationMs,
        upsertDurationMs,
        totalDurationMs,
      };

      console.info(`[IngestionService] Ingestion completed successfully for doc=${documentId}:`, telemetry);
    } catch (err: any) {
      console.error(`[IngestionService] Ingestion FAILED for doc=${documentId}:`, err.message);
      await this.documents.updateStatus(documentId, 'failed', {
        errorMessage: err.message || 'Ingestion pipeline failure',
      });
    }
  }
}

export const ingestionService = new IngestionService();
