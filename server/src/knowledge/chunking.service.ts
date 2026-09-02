import type { DocumentChunk } from '@ai-tutor/shared';

export interface ChunkingOptions {
  targetTokens?: number;
  overlapTokens?: number;
  minTokens?: number;
  maxTokens?: number;
}

/**
 * Deterministic, structure-aware text chunking service.
 * Breaks documents into coherent passages preserving paragraphs and sentence boundaries.
 */
export class ChunkingService {
  // Configurable Defaults (~4 characters per token estimate)
  public static readonly DEFAULT_TARGET_TOKENS = 600; // ~2400 chars
  public static readonly DEFAULT_OVERLAP_TOKENS = 80;  // ~320 chars (~13% overlap)
  public static readonly DEFAULT_MIN_TOKENS = 50;     // ~200 chars
  public static readonly DEFAULT_MAX_TOKENS = 850;    // ~3400 chars
  private static readonly CHARS_PER_TOKEN = 4;

  /**
   * Deterministically cleans and normalizes raw text before chunking.
   */
  static cleanText(text: string): string {
    if (!text) return '';

    return text
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove null / non-printable control characters (except tabs and newlines)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Replace 3+ newlines with 2 newlines (preserve paragraphs)
      .replace(/\n{3,}/g, '\n\n')
      // Replace multiple horizontal spaces/tabs with a single space
      .replace(/[^\S\n]+/g, ' ')
      .trim();
  }

  /**
   * Estimates token count deterministically based on word and character counts.
   */
  static estimateTokenCount(text: string): number {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    const charEstimate = Math.ceil(text.length / this.CHARS_PER_TOKEN);
    // Weighted blend of word count (~1.3 tokens/word) and char length estimate
    return Math.max(1, Math.round(words * 1.25 * 0.5 + charEstimate * 0.5));
  }

  /**
   * Deterministically splits text into structure-aware chunks.
   */
  static chunkDocument(
    documentId: string,
    rawText: string,
    filename: string,
    pageCount?: number,
    options?: ChunkingOptions
  ): DocumentChunk[] {
    const cleaned = this.cleanText(rawText);
    if (!cleaned) return [];

    const targetTokens = options?.targetTokens || this.DEFAULT_TARGET_TOKENS;
    const overlapTokens = options?.overlapTokens || this.DEFAULT_OVERLAP_TOKENS;
    const minTokens = options?.minTokens || this.DEFAULT_MIN_TOKENS;
    const maxTokens = options?.maxTokens || this.DEFAULT_MAX_TOKENS;

    const targetChars = targetTokens * this.CHARS_PER_TOKEN;
    const overlapChars = overlapTokens * this.CHARS_PER_TOKEN;

    // 1. Break text into structural blocks (paragraphs)
    const paragraphs = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 0);

    // If any single paragraph is too large, sub-split it by sentences
    const atomicBlocks: string[] = [];
    for (const para of paragraphs) {
      if (this.estimateTokenCount(para) > maxTokens) {
        // Split by sentence boundaries (.!?)
        const sentences = para.match(/[^.!?]+(?:[.!?]+["']?|$)/g) || [para];
        for (const s of sentences) {
          const trimmed = s.trim();
          if (trimmed) atomicBlocks.push(trimmed);
        }
      } else {
        atomicBlocks.push(para.trim());
      }
    }

    const chunks: DocumentChunk[] = [];
    let currentBlockParts: string[] = [];
    let currentLength = 0;

    const flushChunk = () => {
      if (currentBlockParts.length === 0) return;
      const chunkText = currentBlockParts.join('\n\n').trim();
      const tokenCount = this.estimateTokenCount(chunkText);

      // Only push if above minimum or if it's the only chunk
      if (tokenCount >= minTokens || chunks.length === 0) {
        const chunkIndex = chunks.length;
        const chunkId = `${documentId}_chk_${chunkIndex}`;
        
        // Approximate page boundaries across the document if pageCount is known
        let pageStart: number | undefined;
        let pageEnd: number | undefined;
        if (pageCount && pageCount > 1) {
          const approxFraction = chunkIndex / Math.max(1, paragraphs.length || 1);
          pageStart = Math.min(pageCount, Math.max(1, Math.floor(approxFraction * pageCount) + 1));
          pageEnd = pageStart;
        } else if (pageCount === 1) {
          pageStart = 1;
          pageEnd = 1;
        }

        chunks.push({
          documentId,
          chunkId,
          chunkIndex,
          text: chunkText,
          pageStart,
          pageEnd,
          metadata: {
            filename,
            wordCount: chunkText.split(/\s+/).length,
            tokenEstimate: tokenCount,
          },
        });
      } else if (chunks.length > 0) {
        // Merge small leftover into previous chunk if within max tokens
        const prev = chunks[chunks.length - 1];
        const combinedText = `${prev.text}\n\n${chunkText}`;
        if (this.estimateTokenCount(combinedText) <= maxTokens) {
          prev.text = combinedText;
          if (prev.metadata) {
            prev.metadata.wordCount = combinedText.split(/\s+/).length;
            prev.metadata.tokenEstimate = this.estimateTokenCount(combinedText);
          }
        }
      }

      // Compute overlap blocks for next chunk
      if (overlapChars > 0 && currentBlockParts.length > 1) {
        let overlapAccum = 0;
        const overlapParts: string[] = [];
        for (let i = currentBlockParts.length - 1; i >= 0; i--) {
          overlapAccum += currentBlockParts[i].length;
          overlapParts.unshift(currentBlockParts[i]);
          if (overlapAccum >= overlapChars) break;
        }
        currentBlockParts = overlapParts;
        currentLength = currentBlockParts.reduce((acc, p) => acc + p.length + 2, 0);
      } else {
        currentBlockParts = [];
        currentLength = 0;
      }
    };

    for (const block of atomicBlocks) {
      if (currentLength + block.length > targetChars && currentBlockParts.length > 0) {
        flushChunk();
      }
      currentBlockParts.push(block);
      currentLength += block.length + 2; // account for newline join
    }

    if (currentBlockParts.length > 0) {
      flushChunk();
    }

    return chunks;
  }
}
