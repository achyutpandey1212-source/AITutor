import { aiService, AIService } from '../../ai/ai.service.js';

export interface GeminiExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Fallback AI document understanding & OCR extractor.
 * Invoked when deterministic extraction quality is poor, corrupted, or empty.
 * Routes through the standard AIService with key pooling and fallback support.
 */
export class GeminiExtractor {
  private ai: AIService;

  constructor(customAiService?: AIService) {
    this.ai = customAiService || aiService;
  }

  /**
   * Performs document understanding and text reconstruction using the configured AI provider.
   */
  async extractAndClean(
    rawText: string,
    filename: string
  ): Promise<GeminiExtractionResult> {
    try {
      const prompt = `You are an expert OCR and educational document understanding system.
An uploaded study document (${filename}) had poor or corrupted deterministic text extraction.

Your task:
1. Reconstruct, transcribe, and clean the educational content into coherent, well-structured text.
2. Preserve all core principles, definitions, equations, headers, lists, and explanations accurately.
3. Remove corrupted OCR artifacts, broken character encoding, and stray noise.
4. Do not summarize or invent fake facts; retain the full teaching content.

--- DOCUMENT DATA ---
${rawText ? rawText.substring(0, 15000) : '[Scanned document text was empty or corrupted]'}
`;

      const response = await this.ai.generateText(prompt, {
        taskType: 'document_understanding',
        systemInstruction:
          'You are a high-fidelity educational document extraction assistant. Output clean, readable, comprehensive study material text.',
        temperature: 0.1,
        maxTokens: 4000,
      });

      const cleanedText = (response.text || '').trim();
      if (!cleanedText) {
        return {
          success: false,
          text: '',
          error: 'Gemini extraction returned empty text',
        };
      }

      return {
        success: true,
        text: cleanedText,
      };
    } catch (err: any) {
      return {
        success: false,
        text: '',
        error: err.message || 'Gemini document understanding fallback failed',
      };
    }
  }
}

export const geminiExtractor = new GeminiExtractor();
