import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import type {
  ApiResponse,
  Document,
  DocumentListResponse,
  DocumentUploadResponse,
  RAGSearchResult,
} from '@ai-tutor/shared';
import { RAGQueryRequestSchema } from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  documentService,
  ingestionService,
  qdrantService,
  retrievalService,
} from '../knowledge/index.js';

export const knowledgeRouter = Router();

// Configure Multer for in-memory file uploads (max 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter: (_req, file, cb) => {
    // Accept PDFs and plain text files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('text/') ||
      file.originalname.toLowerCase().endsWith('.pdf') ||
      file.originalname.toLowerCase().endsWith('.txt') ||
      file.originalname.toLowerCase().endsWith('.md')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text documents are supported'));
    }
  },
});

// 1. POST /api/knowledge/documents - Uploads document and triggers async ingestion
knowledgeRouter.post(
  '/documents',
  requireAuth,
  upload.single('file'),
  async (req: Request, res: Response<DocumentUploadResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized: missing user identity', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'No file uploaded. Please provide a PDF or text file.', code: 'FILE_REQUIRED' },
        });
        return;
      }

      const { originalname, mimetype, size, buffer } = req.file;

      // 1. Create document in MongoDB with status="pending"
      const pendingDoc = await documentService.createPendingDocument(
        userId,
        originalname,
        mimetype || 'application/pdf',
        size
      );

      // 2. Launch background ingestion asynchronously without blocking the response
      ingestionService
        .processDocument(pendingDoc.id, userId, originalname, buffer)
        .catch((err) => {
          console.error(`[knowledge.routes] Async ingestion failed for doc=${pendingDoc.id}:`, err);
        });

      // 3. Return 202 Accepted with pending document
      res.status(202).json({
        success: true,
        data: pendingDoc,
      });
    } catch (error: any) {
      console.error('[knowledge.routes] Error in document upload endpoint:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to initiate document upload', code: 'UPLOAD_ERROR' },
      });
    }
  }
);

// 2. GET /api/knowledge/documents - Lists all documents for the authenticated user
knowledgeRouter.get(
  '/documents',
  requireAuth,
  async (req: Request, res: Response<DocumentListResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const documents = await documentService.listUserDocuments(userId);

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error: any) {
      console.error('[knowledge.routes] Error listing user documents:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to list documents', code: 'LIST_ERROR' },
      });
    }
  }
);

// 3. GET /api/knowledge/documents/:documentId - Retrieves specific document metadata & status
knowledgeRouter.get(
  '/documents/:documentId',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<Document>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { documentId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const doc = await documentService.getDocument(documentId, userId);
      if (!doc) {
        res.status(404).json({
          success: false,
          error: { message: 'Document not found or access denied', code: 'DOCUMENT_NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error: any) {
      console.error('[knowledge.routes] Error fetching document:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get document', code: 'GET_ERROR' },
      });
    }
  }
);

// 4. DELETE /api/knowledge/documents/:documentId - Deletes document and its vector embeddings
knowledgeRouter.delete(
  '/documents/:documentId',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<{ deleted: boolean }>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { documentId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const doc = await documentService.getDocument(documentId, userId);
      if (!doc) {
        res.status(404).json({
          success: false,
          error: { message: 'Document not found', code: 'DOCUMENT_NOT_FOUND' },
        });
        return;
      }

      // Delete vectors from Qdrant
      try {
        await qdrantService.deleteByDocument(userId, documentId);
      } catch (vecErr: any) {
        console.warn(`[knowledge.routes] Warning: Failed to clean Qdrant vectors for doc=${documentId}:`, vecErr.message);
      }

      // Delete metadata from MongoDB
      const deleted = await documentService.deleteDocument(documentId, userId);

      res.status(200).json({
        success: true,
        data: { deleted },
      });
    } catch (error: any) {
      console.error('[knowledge.routes] Error deleting document:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to delete document', code: 'DELETE_ERROR' },
      });
    }
  }
);

// 5. POST /api/knowledge/search - Protected debug/retrieval verification endpoint
knowledgeRouter.post(
  '/search',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<RAGSearchResult>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bodyParse = RAGQueryRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid RAG query request',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      const searchResult = await retrievalService.retrieve(userId, bodyParse.data);

      res.status(200).json({
        success: true,
        data: searchResult,
      });
    } catch (error: any) {
      console.error('[knowledge.routes] Error in RAG search endpoint:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'RAG search failed', code: 'RETRIEVAL_ERROR' },
      });
    }
  }
);
