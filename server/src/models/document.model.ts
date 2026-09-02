import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import type { DocumentStatus, ExtractionMethod } from '@ai-tutor/shared';

export interface IDocumentModel extends MongooseDocument {
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  extractionMethod?: ExtractionMethod;
  pageCount?: number;
  chunkCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentMongooseSchema = new Schema<IDocumentModel>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
      index: true,
    },
    extractionMethod: {
      type: String,
      enum: ['pdf_text', 'gemini_fallback'],
      required: false,
    },
    pageCount: {
      type: Number,
      required: false,
      min: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    errorMessage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user document listings sorted by creation time
DocumentMongooseSchema.index({ userId: 1, createdAt: -1 });

export const DocumentModel = mongoose.model<IDocumentModel>('Document', DocumentMongooseSchema);
