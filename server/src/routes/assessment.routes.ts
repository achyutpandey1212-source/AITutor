import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import type {
  ApiResponse,
  AssessmentAnalyticsResponse,
  AssessmentBookmarkListResponse,
  AssessmentBookmarkResponse,
  AssessmentQuestionResponse,
  AssessmentSessionListResponse,
  AssessmentSessionResponse,
  AssessmentSubmissionResponse,
  EvaluationResultResponse,
  WrongQuestionListResponse,
} from '@ai-tutor/shared';
import {
  AssessmentSubmissionRequestSchema,
  CreateAssessmentRequestSchema,
  CreateAssessmentSessionRequestSchema,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { assessmentEngine } from '../assessment/assessment.engine.js';
import { assessmentSubmissionService } from '../assessment/assessment-submission.service.js';
import { assessmentSessionService } from '../assessment/assessment-session.service.js';
import { assessmentBookmarkService } from '../assessment/assessment-bookmark.service.js';
import { wrongQuestionService } from '../assessment/wrong-question.service.js';
import { assessmentAnalyticsService } from '../assessment/assessment-analytics.service.js';
import { teachingStateUpdater } from '../assessment/teaching-state-updater.js';
import { documentService, retrievalService } from '../knowledge/index.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';
import { isValidObjectId } from '../utils/objectid.util.js';

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

// ==========================================
// 1. QUESTION GENERATION & SUBMISSIONS
// ==========================================

// POST /api/assessments/generate - Generates a question & persists server-side
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
        teachingSessionId,
        assessmentSessionId,
        sessionId,
        targetSkill,
        targetMisconception,
        adaptiveContext,
      } = bodyParse.data;

      // Disambiguate session identifiers:
      // - AssessmentSession IDs are formatted as "ses_<timestamp>_<random>"
      // - TeachingSession IDs are 24-character hexadecimal MongoDB ObjectIds
      const effectiveAssessmentSessionId =
        assessmentSessionId || (sessionId?.startsWith('ses_') ? sessionId : undefined);
      const effectiveTeachingSessionId =
        teachingSessionId || (sessionId && !sessionId.startsWith('ses_') && isValidObjectId(sessionId) ? sessionId : undefined);

      // Extract existing teaching state if valid teachingSessionId provided
      let teachingState = undefined;
      let sessionDoc = null;
      if (effectiveTeachingSessionId && isValidObjectId(effectiveTeachingSessionId)) {
        try {
          sessionDoc = await TeachingSessionModel.findById(effectiveTeachingSessionId);
          if (sessionDoc && sessionDoc.userId === userId) {
            teachingState = sessionDoc.teachingState;
          }
        } catch {
          // Gracefully fallback if session query fails
        }
      }

      // Extract assessment session context if provided
      let assessmentSession = null;
      if (effectiveAssessmentSessionId) {
        try {
          assessmentSession = await assessmentSessionService.getSession(userId, effectiveAssessmentSessionId);
        } catch {
          // Gracefully fallback
        }
      }

      // Extract persistent student learner state
      const learnerState = await teachingStateUpdater.getLearnerState(userId);

      // Check RAG documents for grounding (filtered by session documentId if set)
      let knowledgeContext = undefined;
      const hasDocs = await documentService.hasReadyDocuments(userId);
      if (hasDocs) {
        const retrievalOptions = sessionDoc?.documentId ? { documentIds: [sessionDoc.documentId] } : undefined;
        knowledgeContext = await retrievalService.retrieveKnowledgeContext(userId, `${subject} ${concept}`, retrievalOptions);
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
      const effectiveSessionToSave = effectiveAssessmentSessionId || effectiveTeachingSessionId;
      await assessmentSubmissionService.saveQuestion(serverQuestion, userId, effectiveSessionToSave);

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

// POST /api/assessments/questions/:questionId/submit - Submits answer (MCQ, text, numerical)
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
        {
          sessionId: req.body?.sessionId,
          questionStartedAt: req.body?.questionStartedAt,
          knowledgeContext,
        }
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

// POST /api/assessments/questions/:questionId/submit-image - Submits handwritten image solution
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

      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const submission = await assessmentSubmissionService.submitAnswer(
        userId,
        questionId,
        {
          questionId,
          questionType: 'IMAGE_SOLUTION',
          imageReference: dataUri,
        },
        {
          sessionId: req.body?.sessionId,
          questionStartedAt: req.body?.questionStartedAt,
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

// POST /api/assessments/questions/:questionId/evaluate - Explicitly triggers/awaits evaluation
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

// GET /api/assessments/questions/:questionId/submission - Checks student's submission & evaluation status
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

// ==========================================
// 2. ASSESSMENT SESSIONS
// ==========================================

// POST /api/assessments/sessions - Starts a new assessment session
assessmentRouter.post(
  '/sessions',
  requireAuth,
  async (req: Request, res: Response<AssessmentSessionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bodyParse = CreateAssessmentSessionRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid session creation payload',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      const session = await assessmentSessionService.createSession(userId, bodyParse.data);
      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      console.error('Error creating assessment session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create assessment session', code: 'SESSION_ERROR' },
      });
    }
  }
);

// GET /api/assessments/sessions - Lists user's sessions
assessmentRouter.get(
  '/sessions',
  requireAuth,
  async (req: Request, res: Response<AssessmentSessionListResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const sessions = await assessmentSessionService.listSessions(userId);
      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error: any) {
      console.error('Error listing assessment sessions:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to list assessment sessions', code: 'SESSION_ERROR' },
      });
    }
  }
);

// GET /api/assessments/sessions/:sessionId - Retrieves session details
assessmentRouter.get(
  '/sessions/:sessionId',
  requireAuth,
  async (req: Request, res: Response<AssessmentSessionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const session = await assessmentSessionService.getSession(userId, sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error: any) {
      console.error('Error fetching session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch session', code: 'SESSION_ERROR' },
      });
    }
  }
);

// PATCH /api/assessments/sessions/:sessionId - Pauses or Resumes session
assessmentRouter.patch(
  '/sessions/:sessionId',
  requireAuth,
  async (req: Request, res: Response<AssessmentSessionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { sessionId } = req.params;
      const { action } = req.body; // 'pause' | 'resume'

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      let updatedSession = null;
      if (action === 'pause') {
        updatedSession = await assessmentSessionService.pauseSession(userId, sessionId);
      } else if (action === 'resume') {
        updatedSession = await assessmentSessionService.resumeSession(userId, sessionId);
      } else {
        res.status(400).json({
          success: false,
          error: { message: "Invalid action. Expected 'pause' or 'resume'.", code: 'INVALID_ACTION' },
        });
        return;
      }

      if (!updatedSession) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found or cannot be updated', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedSession,
      });
    } catch (error: any) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update session', code: 'SESSION_ERROR' },
      });
    }
  }
);

// POST /api/assessments/sessions/:sessionId/complete - Completes a session
assessmentRouter.post(
  '/sessions/:sessionId/complete',
  requireAuth,
  async (req: Request, res: Response<AssessmentSessionResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { sessionId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const completed = await assessmentSessionService.completeSession(userId, sessionId);
      if (!completed) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: completed,
      });
    } catch (error: any) {
      console.error('Error completing session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to complete session', code: 'SESSION_ERROR' },
      });
    }
  }
);

// ==========================================
// 3. QUESTION HISTORY
// ==========================================

// GET /api/assessments/history - Lists user's question and attempt history
assessmentRouter.get(
  '/history',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const { subject, concept, difficulty, sessionId, correctOnly } = req.query;

      const history = await assessmentSubmissionService.getUserQuestionHistory(userId, {
        subject: typeof subject === 'string' ? subject : undefined,
        concept: typeof concept === 'string' ? concept : undefined,
        difficulty: typeof difficulty === 'string' ? difficulty : undefined,
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
        correctOnly: correctOnly === 'true',
      });

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Error fetching question history:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch question history', code: 'HISTORY_ERROR' },
      });
    }
  }
);

// ==========================================
// 4. BOOKMARKS / SAVED QUESTIONS
// ==========================================

// POST /api/assessments/questions/:questionId/bookmark - Bookmarks a question
assessmentRouter.post(
  '/questions/:questionId/bookmark',
  requireAuth,
  async (req: Request, res: Response<AssessmentBookmarkResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { questionId } = req.params;
      const { notes } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bookmark = await assessmentBookmarkService.bookmarkQuestion(userId, questionId, notes);
      res.status(200).json({
        success: true,
        data: bookmark,
      });
    } catch (error: any) {
      console.error('Error saving bookmark:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to save bookmark', code: 'BOOKMARK_ERROR' },
      });
    }
  }
);

// DELETE /api/assessments/questions/:questionId/bookmark - Removes a bookmark
assessmentRouter.delete(
  '/questions/:questionId/bookmark',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<{ unbookmarked: boolean }>>): Promise<void> => {
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

      const removed = await assessmentBookmarkService.unbookmarkQuestion(userId, questionId);
      res.status(200).json({
        success: true,
        data: { unbookmarked: removed },
      });
    } catch (error: any) {
      console.error('Error removing bookmark:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to remove bookmark', code: 'BOOKMARK_ERROR' },
      });
    }
  }
);

// GET /api/assessments/bookmarks - Retrieves all bookmarked questions for user
assessmentRouter.get(
  '/bookmarks',
  requireAuth,
  async (req: Request, res: Response<AssessmentBookmarkListResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bookmarks = await assessmentBookmarkService.getBookmarks(userId);
      res.status(200).json({
        success: true,
        data: bookmarks,
      });
    } catch (error: any) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch bookmarks', code: 'BOOKMARK_ERROR' },
      });
    }
  }
);

// GET /api/assessments/questions/:questionId/bookmark - Checks if question is bookmarked
assessmentRouter.get(
  '/questions/:questionId/bookmark',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<{ bookmarked: boolean }>>): Promise<void> => {
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

      const isSaved = await assessmentBookmarkService.isBookmarked(userId, questionId);
      res.status(200).json({
        success: true,
        data: { bookmarked: isSaved },
      });
    } catch (error: any) {
      console.error('Error checking bookmark:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to check bookmark', code: 'BOOKMARK_ERROR' },
      });
    }
  }
);

// ==========================================
// 5. WRONG QUESTIONS & DUE REVIEWS
// ==========================================

// GET /api/assessments/wrong - Retrieves active wrong questions
assessmentRouter.get(
  '/wrong',
  requireAuth,
  async (req: Request, res: Response<WrongQuestionListResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const wrongQuestions = await wrongQuestionService.getWrongQuestions(userId);
      res.status(200).json({
        success: true,
        data: wrongQuestions,
      });
    } catch (error: any) {
      console.error('Error fetching wrong questions:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch wrong questions', code: 'WRONG_QUESTIONS_ERROR' },
      });
    }
  }
);

// GET /api/assessments/reviews/due - Retrieves questions due for spaced reattempt review
assessmentRouter.get(
  '/reviews/due',
  requireAuth,
  async (req: Request, res: Response<WrongQuestionListResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const dueReviews = await wrongQuestionService.getDueReviews(userId);
      res.status(200).json({
        success: true,
        data: dueReviews,
      });
    } catch (error: any) {
      console.error('Error fetching due reviews:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch due reviews', code: 'DUE_REVIEWS_ERROR' },
      });
    }
  }
);

// ==========================================
// 6. ASSESSMENT ANALYTICS
// ==========================================

// GET /api/assessments/analytics - Returns user's assessment performance analytics
assessmentRouter.get(
  '/analytics',
  requireAuth,
  async (req: Request, res: Response<AssessmentAnalyticsResponse>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const analytics = await assessmentAnalyticsService.getUserAnalytics(userId);
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Error computing assessment analytics:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to compute analytics', code: 'ANALYTICS_ERROR' },
      });
    }
  }
);
