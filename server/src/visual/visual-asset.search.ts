import { VisualAsset } from '@ai-tutor/shared';
import { IVisualAssetRepository, defaultVisualAssetRepository } from './visual-asset.repository.js';
import { DocumentVisualAssetRepository, defaultDocumentVisualAssetRepository } from './document-asset.repository.js';

export interface AssetSearchRequest {
  concept?: string;
  topic?: string;
  keywords?: string[];
  visualType?: string;
  documentId?: string;
  limit?: number;
}

export interface RankedVisualSearchResult {
  primaryAsset: VisualAsset | null;
  candidateAssets: VisualAsset[];
  sourceType: 'UPLOADED_DOCUMENT' | 'REMOTION_NATIVE' | 'NONE';
  fallbackToNative: boolean;
}

/**
 * Visual Asset Search Service.
 * Implements pedagogical priority:
 * 1. Document-grounded figures if available and relevant.
 * 2. High-relevance native Remotion assets.
 * 3. Graceful fallback indicating that a native scene should be generated.
 */
export class VisualAssetSearchService {
  constructor(
    private assetRepo: IVisualAssetRepository = defaultVisualAssetRepository,
    private docRepo: DocumentVisualAssetRepository = defaultDocumentVisualAssetRepository
  ) {}

  async searchVisualAssets(req: AssetSearchRequest): Promise<RankedVisualSearchResult> {
    let docAssets: VisualAsset[] = [];

    // 1. Try uploaded document assets if documentId is provided
    if (req.documentId) {
      docAssets = await this.docRepo.findAssetsForDocument(req.documentId, req.concept);
    }

    // 2. Query general asset repository (includes pre-indexed Remotion assets)
    const repoResults = await this.assetRepo.searchAssets({
      concept: req.concept,
      topic: req.topic,
      keywords: req.keywords,
      visualType: req.visualType,
      documentId: req.documentId,
      limit: req.limit || 5,
    });

    // Merge without duplicates
    const seenIds = new Set<string>();
    const candidates: VisualAsset[] = [];

    for (const a of [...docAssets, ...repoResults]) {
      if (!seenIds.has(a.assetId)) {
        seenIds.add(a.assetId);
        candidates.push(a);
      }
    }

    if (candidates.length === 0) {
      return {
        primaryAsset: null,
        candidateAssets: [],
        sourceType: 'NONE',
        fallbackToNative: true,
      };
    }

    const primary = candidates[0];
    return {
      primaryAsset: primary,
      candidateAssets: candidates,
      sourceType: primary.source === 'UPLOADED_DOCUMENT' ? 'UPLOADED_DOCUMENT' : 'REMOTION_NATIVE',
      fallbackToNative: primary.source !== 'UPLOADED_DOCUMENT',
    };
  }
}

export const defaultVisualAssetSearchService = new VisualAssetSearchService();
