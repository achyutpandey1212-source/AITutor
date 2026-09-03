import {
  VisualAsset,
  VisualAssetSchema,
} from '@ai-tutor/shared';
import { IVisualAssetRepository, defaultVisualAssetRepository } from './visual-asset.repository.js';

export interface DocumentFigureMetadata {
  figureId: string;
  documentId: string;
  pageNumber: number;
  title: string;
  caption?: string;
  surroundingText?: string;
  figureUrl?: string;
  conceptHints?: string[];
}

/**
 * Repository abstraction for visual material extracted or referenced in uploaded documents.
 * In production, this indexes figures/diagrams detected in uploaded PDFs.
 * Gracefully falls back to Remotion native assets when figures are not found.
 */
export class DocumentVisualAssetRepository {
  constructor(private assetRepo: IVisualAssetRepository = defaultVisualAssetRepository) {}

  /**
   * Registers a detected figure from an uploaded PDF document.
   */
  async indexDocumentFigure(meta: DocumentFigureMetadata): Promise<VisualAsset> {
    const asset: VisualAsset = {
      assetId: `doc:${meta.documentId}:fig:${meta.figureId}`,
      source: 'UPLOADED_DOCUMENT',
      url: meta.figureUrl || `/api/documents/${meta.documentId}/pages/${meta.pageNumber}/figure/${meta.figureId}`,
      mimeType: 'image/png',
      title: meta.title || `Figure from Page ${meta.pageNumber}`,
      description: meta.caption || meta.surroundingText?.substring(0, 150),
      conceptIds: meta.conceptHints || [],
      pageNumber: meta.pageNumber,
      documentId: meta.documentId,
      metadata: {
        surroundingText: meta.surroundingText,
        extractedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    return this.assetRepo.saveAsset(asset);
  }

  /**
   * Finds visual assets specifically belonging to an uploaded document.
   */
  async findAssetsForDocument(
    documentId: string,
    concept?: string
  ): Promise<VisualAsset[]> {
    const docAssets = await this.assetRepo.listByDocument(documentId);
    if (!concept) return docAssets;

    const cLower = concept.toLowerCase();
    return docAssets.filter(
      (a: VisualAsset) =>
        a.title.toLowerCase().includes(cLower) ||
        (a.description && a.description.toLowerCase().includes(cLower)) ||
        a.conceptIds.some((cid: string) => cid.toLowerCase().includes(cLower))
    );
  }
}

export const defaultDocumentVisualAssetRepository = new DocumentVisualAssetRepository();
