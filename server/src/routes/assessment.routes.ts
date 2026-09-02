import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import type {
  ApiResponse,
  AssessmentQuestionResponse,
  AssessmentSubmissionResponse,
  EvaluationResultResponse,
} from '@ai-tutor/shared';
import {
  AssessmentSubmissionRequestSchema,
  CreateAssessmentRequestSchema,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { assessmentEngine } from '../assessment/assessment.engine.js';
import { assessmentSubmissionService } from '../assessment/assessment-submission.service.js';
import { teachingStateUpdater } from '../assessment/teaching-state-updater.js';
import { documentService, retrievalService } from '../knowledge/index.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';

export const assessmentRouter = Router();

// Configure Multer for image solution uploads (JPEG, PNG, WebP; max 10MB)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMime.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// 1. POST /api/assessments/generate - Generates a question & persists server-side
assessmentRouter.post(
  '/generate',
  requireAuth,
  async (req: Request, res: Response<AssessmentQuestionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bodyParse = CreateAssessmentRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid assessment generation request',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      const {
        concept,
        subject,
        grade,
        difficulty,
        questionType,
        evaluationMode,
        marks,
        goal,
        sessionId,
        targetSkill,
        targetMisconception,
        adaptiveContext,
      } = bodyParse.data;

      // Extract existing teaching state if sessionId provided
      let teachingState = undefined;
      if (sessionId) {
        const sessionDoc = await TeachingSessionModel.findById(sessionId);
        if (sessionDoc && sessionDoc.userId === userId) {
          teachingState = sessionDoc.teachingState;
        }
      }

      // Extract persistent student learner state
      const learnerState = await teachingStateUpdater.getLearnerState(userId);

      // Check RAG documents for grounding
      let knowledgeContext = undefined;
      const hasDocs = await documentService.hasReadyDocuments(userId);
      if (hasDocs) {
        knowledgeContext = await retrievalService.retrieveKnowledgeContext(userId, `${subject} ${concept}`);
      }

      // Deterministically plan strategy with learnerState & adaptive signals
      const plan = assessmentEngine.planAssessment({
        concept,
        subject,
        grade,
        goal: goal || 'concept_check',
        preferredDifficulty: difficulty,
        preferredQuestionType: questionType,
        preferredEvaluationMode: evaluationMode,
        targetMarks: marks,
        teachingState,
        learnerState,
        targetSkill,
        targetMisconception,
        adaptiveContext,
      });

      const strategy = plan.strategies[0];

      // Generate structured question with surface form variation
      const serverQuestion = await assessmentEngine.generateQuestion({
        strategy,
        teachingState,
        learnerState,
        knowledgeContext,
      });

      // Persist server-side question with answer key & rubrics intact
      await assessmentSubmissionService.saveQuestion(serverQuestion, userId, sessionId);

      // Return sanitized question to client
      const clientQuestion = sanitizeQuestionForClient(serverQuestion);

      res.status(200).json({
        success: true,
        data: clientQuestion,
      });
    } catch (error: any) {
      console.error('Error generating assessment question:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to generate assessment question', code: 'ASSESSMENT_ERROR' },
      });
    }
  }
);

// 2. POST /api/assessments/questions/:questionId/submit - Submits answer (MCQ, text, numerical)
assessmentRouter.post(
  '/questions/:questionId/submit',
  requireAuth,
  async (req: Request, res: Response<AssessmentSubmissionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { questionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bodyParse = AssessmentSubmissionRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid submission payload',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      // Check RAG documents for evaluation grounding
      let knowledgeContext = undefined;
      const hasDocs = await documentService.hasReadyDocuments(userId);
      if (hasDocs) {
        knowledgeContext = await retrievalService.retrieveKnowledgeContext(userId, questionId);
      }

      const submission = await assessmentSubmissionService.submitAnswer(
        userId,
        questionId,
        bodyParse.data,
        { knowledgeContext }
      );

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      console.error('Error submitting assessment answer:', error);
      const isClientError = error.message?.includes('not found') || error.message?.includes('mismatch');
      res.status(isClientError ? 400 : 500).json({
        success: false,
        error: { message: error.message || 'Failed to submit answer', code: 'SUBMISSION_ERROR' },
      });
    }
  }
);

// 3. POST /api/assessments/questions/:questionId/submit-image - Submits handwritten image solution
assessmentRouter.post(
  '/questions/:questionId/submit-image',
  requireAuth,
  imageUpload.single('image'),
  async (req: Request, res: Response<AssessmentSubmissionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { questionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'No solution image uploaded. Please upload a clear photo of your work.', code: 'IMAGE_REQUIRED' },
        });
        return;
      }

      // Encode image buffer as base64 Data URI
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const submission = await assessmentSubmissionService.submitAnswer(
        userId,
        questionId,
        {
          questionId,
          questionType: 'IMAGE_SOLUTION',
          imageReference: dataUri,
        }
      );

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      console.error('Error submitting assessment image:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to submit solution image', code: 'IMAGE_SUBMISSION_ERROR' },
      });
    }
  }
);

// 4. POST /api/assessments/questions/:questionId/evaluate - Explicitly triggers/awaits evaluation
assessmentRouter.post(
  '/questions/:questionId/evaluate',
  requireAuth,
  async (req: Request, res: Response<EvaluationResultResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { questionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      // Check RAG documents
      let knowledgeContext = undefined;
      const hasDocs = await documentService.hasReadyDocuments(userId);
      if (hasDocs) {
        knowledgeContext = await retrievalService.retrieveKnowledgeContext(userId, questionId);
      }

      const evaluation = await assessmentSubmissionService.triggerEvaluation(userId, questionId, {
        knowledgeContext,
      });

      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (error: any) {
      console.error('Error evaluating assessment question:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Evaluation failed', code: 'EVALUATION_ERROR' },
      });
    }
  }
);

// 5. GET /api/assessments/questions/:questionId/submission - Checks student's submission & evaluation status
assessmentRouter.get(
  '/questions/:questionId/submission',
  requireAuth,
  async (req: Request, res: Response<AssessmentSubmissionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { questionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const submission = await assessmentSubmissionService.getSubmission(userId, questionId);
      if (!submission) {
        res.status(404).json({
          success: false,
          error: { message: 'No submission found for this question', code: 'SUBMISSION_NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      console.error('Error fetching submission:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch submission', code: 'SERVER_ERROR' },
      });
    }
  }
);
