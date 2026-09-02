import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  ApiResponse,
  LessonPlan,
  TeacherResponse,
  TeachingSession,
  TeachingState,
} from '@ai-tutor/shared';
import {
  CreateLessonPlanRequestSchema,
  CreateSessionRequestSchema,
  RespondSessionRequestSchema,
  TeachingStateSchema,
} from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';
import { teacherEngine } from '../engine/teacher.engine.js';

export const teachingRouter = Router();

// 1. POST /api/teaching/sessions - Creates a new teaching session
teachingRouter.post(
  '/sessions',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<TeachingSession>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized: missing user identity', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bodyParse = CreateSessionRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid session creation request',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      const { topic, learnerProfile } = bodyParse.data;
      const initialProfile = {
        userId,
        preferredLanguage: learnerProfile?.preferredLanguage || 'english',
        educationLevel: learnerProfile?.educationLevel || 'beginner',
        learningGoal: learnerProfile?.learningGoal || 'Understand fundamentals',
        explanationStyle: learnerProfile?.explanationStyle || 'simple',
      };

      const initialTeachingState: TeachingState = TeachingStateSchema.parse({
        currentConcept: topic,
        understanding: 'unknown',
        confidence: 0.5,
        misconceptions: [],
        conceptsMastered: [],
        conceptsNeedingWork: [],
        lastStudentAction: 'unknown',
        recommendedNextAction: 'explain',
      });

      // Deterministic MongoDB persistence
      const sessionDoc = await TeachingSessionModel.create({
        userId,
        topic,
        learnerProfile: initialProfile,
        status: 'active',
        currentConcept: topic,
        language: initialProfile.preferredLanguage,
        teachingState: initialTeachingState,
      });

      const createdSession: TeachingSession = {
        id: sessionDoc._id.toString(),
        userId: sessionDoc.userId,
        topic: sessionDoc.topic,
        learnerProfile: sessionDoc.learnerProfile,
        status: sessionDoc.status,
        currentConcept: sessionDoc.currentConcept,
        language: sessionDoc.language,
        teachingState: sessionDoc.teachingState,
        startedAt: sessionDoc.createdAt.toISOString(),
        updatedAt: sessionDoc.updatedAt.toISOString(),
      };

      res.status(201).json({
        success: true,
        data: createdSession,
      });
    } catch (error: any) {
      console.error('Error creating teaching session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create teaching session', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 2. POST /api/teaching/sessions/:sessionId/respond - Responds to student message in session
teachingRouter.post(
  '/sessions/:sessionId/respond',
  requireAuth,
  async (
    req: Request,
    res: Response<ApiResponse<{ teacherResponse: TeacherResponse; teachingState: TeachingState }>>
  ): Promise<void> => {
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

      const bodyParse = RespondSessionRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid message payload',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      // Find session and verify user ownership
      const sessionDoc = await TeachingSessionModel.findById(sessionId);
      if (!sessionDoc) {
        res.status(404).json({
          success: false,
          error: { message: 'Teaching session not found', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      if (sessionDoc.userId !== userId) {
        res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this teaching session', code: 'FORBIDDEN' },
        });
        return;
      }

      const session: TeachingSession = {
        id: sessionDoc._id.toString(),
        userId: sessionDoc.userId,
        topic: sessionDoc.topic,
        learnerProfile: sessionDoc.learnerProfile,
        status: sessionDoc.status,
        currentConcept: sessionDoc.currentConcept,
        language: sessionDoc.language,
        teachingState: sessionDoc.teachingState,
        startedAt: sessionDoc.createdAt.toISOString(),
        updatedAt: sessionDoc.updatedAt.toISOString(),
      };

      const { message, knowledgeContext } = bodyParse.data;

      // Generate pedagogical response through TeacherEngine
      const teacherResponse = await teacherEngine.generateTeacherResponse(
        session.learnerProfile,
        session,
        session.teachingState,
        message,
        knowledgeContext
      );

      // Deterministically merge state update
      const updatedState = teacherEngine.mergeTeachingState(
        session.teachingState,
        teacherResponse.stateUpdate
      );

      // Persist updated state and currentConcept
      sessionDoc.teachingState = updatedState;
      if (updatedState.currentConcept) {
        sessionDoc.currentConcept = updatedState.currentConcept;
      }
      await sessionDoc.save();

      res.status(200).json({
        success: true,
        data: {
          teacherResponse,
          teachingState: updatedState,
        },
      });
    } catch (error: any) {
      console.error('Error in session response:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to process student message', code: 'TEACHER_ERROR' },
      });
    }
  }
);

// 3. POST /api/teaching/lesson-plan - Generates a structured lesson plan
teachingRouter.post(
  '/lesson-plan',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<LessonPlan>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const bodyParse = CreateLessonPlanRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid lesson plan request',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      const { topic, learnerProfile, sessionId, knowledgeContext } = bodyParse.data;

      // If sessionId is passed, verify ownership
      if (sessionId) {
        const sessionDoc = await TeachingSessionModel.findById(sessionId);
        if (!sessionDoc) {
          res.status(404).json({
            success: false,
            error: { message: 'Referenced session not found', code: 'SESSION_NOT_FOUND' },
          });
          return;
        }
        if (sessionDoc.userId !== userId) {
          res.status(403).json({
            success: false,
            error: { message: 'Forbidden: You do not own this session', code: 'FORBIDDEN' },
          });
          return;
        }
      }

      const profile = learnerProfile || {
        userId,
        preferredLanguage: 'english',
        educationLevel: 'beginner',
        learningGoal: 'Master fundamentals',
        explanationStyle: 'simple',
      };

      const lessonPlan = await teacherEngine.generateLessonPlan(topic, profile, {
        sessionId,
        knowledgeContext,
      });

      res.status(200).json({
        success: true,
        data: lessonPlan,
      });
    } catch (error: any) {
      console.error('Error generating lesson plan:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to generate lesson plan', code: 'LESSON_PLAN_ERROR' },
      });
    }
  }
);
