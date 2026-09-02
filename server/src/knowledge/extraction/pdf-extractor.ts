import { PDFParse } from 'pdf-parse';

export interface PDFExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  qualityScore: number; // 0 to 1
  isUsable: boolean;
  error?: string;
}

/**
 * Deterministic local PDF text extractor using pdf-parse.
 * Validates text quality to determine if deterministic extraction is usable
 * or if fallback to Gemini document understanding is required.
 */
export class PDFExtractor {
  /**
   * Minimum average characters per page to consider digital text valid and usable.
   */
  private static readonly MIN_CHARS_PER_PAGE = 30;
  private static readonly MIN_TOTAL_CHARS = 40;

  /**
   * Extracts text from a PDF Buffer and evaluates extraction quality deterministically.
   */
  static async extractText(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
    let parser: any = null;
    try {
      parser = new PDFParse({ data: pdfBuffer });
      const textResult = await parser.getText();
      let pageCount = 1;

      try {
        const info = await parser.getInfo();
        if (info) {
          if (typeof info.pageCount === 'number' && info.pageCount > 0) {
            pageCount = Math.floor(info.pageCount);
          } else if (typeof info.numpages === 'number' && info.numpages > 0) {
            pageCount = Math.floor(info.numpages);
          } else if (Array.isArray(info.pages) && info.pages.length > 0) {
            pageCount = info.pages.length;
          } else {
            pageCount = 1;
          }
        }
      } catch {
        pageCount = 1;
      }

      // Clean basic whitespace to assess true content length
      const rawText = typeof textResult === 'string' ? textResult : (textResult?.text || '');
      const cleaned = rawText.replace(/\s+/g, ' ').trim();
      const totalChars = cleaned.length;

      // Quality evaluation
      if (totalChars === 0) {
        return {
          success: true,
          text: '',
          pageCount,
          qualityScore: 0,
          isUsable: false,
          error: 'Extracted text is completely empty (likely a scanned image PDF).',
        };
      }

      const avgCharsPerPage = totalChars / pageCount;
      const isUsable = totalChars >= this.MIN_TOTAL_CHARS && avgCharsPerPage >= this.MIN_CHARS_PER_PAGE;
      
      // Calculate quality score (0.0 to 1.0)
      const qualityScore = Math.min(1.0, Math.max(0.0, avgCharsPerPage / 250));

      return {
        success: true,
        text: rawText,
        pageCount,
        qualityScore,
        isUsable,
      };
    } catch (err: any) {
      return {
        success: false,
        text: '',
        pageCount: 0,
        qualityScore: 0,
        isUsable: false,
        error: err.message || 'PDF extraction failed',
      };
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // ignore cleanup error
        }
      }
    }
  }
}
