import type { Document, DocumentStatus, ExtractionMethod } from '@ai-tutor/shared';
import { DocumentModel } from '../models/document.model.js';

export class DocumentService {
  /**
   * Creates a new document record in MongoDB with status="pending".
   */
  async createPendingDocument(
    userId: string,
    filename: string,
    mimeType: string,
    size: number
  ): Promise<Document> {
    const doc = await DocumentModel.create({
      userId,
      filename,
      mimeType,
      size,
      status: 'pending',
      chunkCount: 0,
    });

    return this.mapToDocument(doc);
  }

  /**
   * Updates document processing status and metrics in MongoDB.
   */
  async updateStatus(
    documentId: string,
    status: DocumentStatus,
    updates?: {
      extractionMethod?: ExtractionMethod;
      pageCount?: number;
      chunkCount?: number;
      errorMessage?: string;
    }
  ): Promise<Document | null> {
    const doc = await DocumentModel.findByIdAndUpdate(
      documentId,
      {
        status,
        ...(updates?.extractionMethod && { extractionMethod: updates.extractionMethod }),
        ...(updates?.pageCount !== undefined && { pageCount: updates.pageCount }),
        ...(updates?.chunkCount !== undefined && { chunkCount: updates.chunkCount }),
        ...(updates?.errorMessage !== undefined && { errorMessage: updates.errorMessage }),
      },
      { new: true }
    );

    return doc ? this.mapToDocument(doc) : null;
  }

  /**
   * Retrieves document metadata by ID and verifies owner identity.
   */
  async getDocument(documentId: string, userId: string): Promise<Document | null> {
    const doc = await DocumentModel.findOne({ _id: documentId, userId });
    return doc ? this.mapToDocument(doc) : null;
  }

  /**
   * Lists all uploaded documents for a specific user.
   */
  async listUserDocuments(userId: string): Promise<Document[]> {
    const docs = await DocumentModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map((d) => this.mapToDocument(d));
  }

  /**
   * Checks whether the user has at least one ready document.
   */
  async hasReadyDocuments(userId: string): Promise<boolean> {
    const count = await DocumentModel.countDocuments({ userId, status: 'ready' });
    return count > 0;
  }

  /**
   * Deletes a document record from MongoDB.
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    const res = await DocumentModel.deleteOne({ _id: documentId, userId });
    return res.deletedCount > 0;
  }

  private mapToDocument(doc: any): Document {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      status: doc.status,
      extractionMethod: doc.extractionMethod,
      pageCount: doc.pageCount,
      chunkCount: doc.chunkCount || 0,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      errorMessage: doc.errorMessage,
    };
  }
}

export const documentService = new DocumentService();
