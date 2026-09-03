import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  ApiResponse,
  LessonPlan,
  TeacherResponse,
  TeachingSession,
  TeachingState,
  TutorSessionContext,
  VoiceInteractionResponse,
} from '@ai-tutor/shared';
import {
  CreateLessonPlanRequestSchema,
  CreateSessionRequestSchema,
  RespondSessionRequestSchema,
  TeachingStateSchema,
  VoiceInteractionRequestSchema,
  normalizeTextForSpeech,
} from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';
import { teacherEngine } from '../engine/teacher.engine.js';
import { documentService, retrievalService } from '../knowledge/index.js';

export const teachingRouter = Router();

function buildSessionContext(sessionDoc: any): TutorSessionContext {
  return {
    sessionId: sessionDoc._id.toString(),
    userId: sessionDoc.userId,
    subject: sessionDoc.subject || 'General',
    topic: sessionDoc.topic,
    language: sessionDoc.language || 'english',
    conversationHistory: sessionDoc.conversationHistory || [],
    activeConcept: sessionDoc.currentConcept || sessionDoc.topic,
    teachingState: sessionDoc.teachingState,
    assessmentSessionId: sessionDoc.assessmentSessionId,
    currentQuestionId: sessionDoc.currentQuestionId,
    currentMode: sessionDoc.currentMode || 'TEACHING',
    updatedAt: sessionDoc.updatedAt ? sessionDoc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

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
        subject: req.body?.subject || 'General',
        learnerProfile: initialProfile,
        status: 'active',
        currentConcept: topic,
        language: initialProfile.preferredLanguage,
        teachingState: initialTeachingState,
        currentMode: 'TEACHING',
        conversationHistory: [],
      });

      const createdSession: TeachingSession = {
        id: sessionDoc._id.toString(),
        userId: sessionDoc.userId,
        topic: sessionDoc.topic,
        subject: sessionDoc.subject || 'General',
        learnerProfile: sessionDoc.learnerProfile,
        status: sessionDoc.status,
        currentConcept: sessionDoc.currentConcept,
        language: sessionDoc.language,
        teachingState: sessionDoc.teachingState,
        currentMode: sessionDoc.currentMode || 'TEACHING',
        conversationHistory: sessionDoc.conversationHistory || [],
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

// 1b. GET /api/teaching/sessions/:sessionId - Retrieves teaching session details
teachingRouter.get(
  '/sessions/:sessionId',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<{ session: TeachingSession; context: TutorSessionContext }>>): Promise<void> => {
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
        subject: sessionDoc.subject || 'General',
        learnerProfile: sessionDoc.learnerProfile,
        status: sessionDoc.status,
        currentConcept: sessionDoc.currentConcept,
        language: sessionDoc.language,
        teachingState: sessionDoc.teachingState,
        currentMode: sessionDoc.currentMode || 'TEACHING',
        assessmentSessionId: sessionDoc.assessmentSessionId,
        currentQuestionId: sessionDoc.currentQuestionId,
        conversationHistory: sessionDoc.conversationHistory || [],
        startedAt: sessionDoc.createdAt.toISOString(),
        updatedAt: sessionDoc.updatedAt.toISOString(),
      };

      res.status(200).json({
        success: true,
        data: {
          session,
          context: buildSessionContext(sessionDoc),
        },
      });
    } catch (error: any) {
      console.error('Error fetching teaching session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch session', code: 'SERVER_ERROR' },
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
    res: Response<ApiResponse<{ teacherResponse: TeacherResponse; teachingState: TeachingState; sessionContext: TutorSessionContext }>>
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
        subject: sessionDoc.subject || 'General',
        learnerProfile: sessionDoc.learnerProfile,
        status: sessionDoc.status,
        currentConcept: sessionDoc.currentConcept,
        language: sessionDoc.language,
        teachingState: sessionDoc.teachingState,
        currentMode: sessionDoc.currentMode || 'TEACHING',
        assessmentSessionId: sessionDoc.assessmentSessionId,
        currentQuestionId: sessionDoc.currentQuestionId,
        conversationHistory: sessionDoc.conversationHistory || [],
        startedAt: sessionDoc.createdAt.toISOString(),
        updatedAt: sessionDoc.updatedAt.toISOString(),
      };

      const { message, knowledgeContext: explicitKnowledge } = bodyParse.data;

      // Automatically retrieve knowledge context if user has ready documents and none was passed
      let effectiveKnowledge = explicitKnowledge;
      if (!effectiveKnowledge) {
        const hasDocs = await documentService.hasReadyDocuments(userId);
        if (hasDocs) {
          const ragStart = Date.now();
          effectiveKnowledge = await retrievalService.retrieveKnowledgeContext(userId, message);
          if (effectiveKnowledge) {
            console.info(`[TeachingRoute] Injected ${effectiveKnowledge.retrievedChunks?.length || 0} RAG chunks (took ${Date.now() - ragStart}ms)`);
          }
        }
      }

      // Generate pedagogical response through TeacherEngine
      const teacherResponse = await teacherEngine.generateTeacherResponse(
        session.learnerProfile,
        session,
        session.teachingState,
        message,
        effectiveKnowledge
      );

      // Deterministically merge state update
      const updatedState = teacherEngine.mergeTeachingState(
        session.teachingState,
        teacherResponse.stateUpdate
      );

      // Determine new pedagogical mode
      let newMode: 'TEACHING' | 'ASSESSMENT' | 'FEEDBACK' | 'REVIEW' = 'TEACHING';
      if (teacherResponse.intent === 'question' || teacherResponse.teachingAction === 'assess') {
        newMode = 'ASSESSMENT';
      } else if (teacherResponse.intent === 'feedback') {
        newMode = 'FEEDBACK';
      }

      // Persist conversation turns & updated state
      const now = new Date().toISOString();
      sessionDoc.teachingState = updatedState;
      if (updatedState.currentConcept) {
        sessionDoc.currentConcept = updatedState.currentConcept;
      }
      sessionDoc.currentMode = newMode;
      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, timestamp: now },
        { role: 'tutor', text: teacherResponse.responseText, intent: teacherResponse.intent, timestamp: new Date().toISOString() }
      );
      await sessionDoc.save();

      res.status(200).json({
        success: true,
        data: {
          teacherResponse,
          teachingState: updatedState,
          sessionContext: buildSessionContext(sessionDoc),
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

// 3. POST /api/teaching/sessions/:sessionId/voice - Voice pipeline interaction endpoint
teachingRouter.post(
  '/sessions/:sessionId/voice',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<VoiceInteractionResponse>>): Promise<void> => {
    const startTime = Date.now();
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

      const bodyParse = VoiceInteractionRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid voice request payload',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

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

      const { transcript, language, knowledgeContext: explicitKnowledge } = bodyParse.data;

      // Allow voice request to dynamically set or respect session language
      const targetLanguage = language || sessionDoc.language || 'english';

      const session: TeachingSession = {
        id: sessionDoc._id.toString(),
        userId: sessionDoc.userId,
        topic: sessionDoc.topic,
        subject: sessionDoc.subject || 'General',
        learnerProfile: {
          ...sessionDoc.learnerProfile,
          preferredLanguage: targetLanguage,
        },
        status: sessionDoc.status,
        currentConcept: sessionDoc.currentConcept,
        language: targetLanguage,
        teachingState: sessionDoc.teachingState,
        currentMode: sessionDoc.currentMode || 'TEACHING',
        assessmentSessionId: sessionDoc.assessmentSessionId,
        currentQuestionId: sessionDoc.currentQuestionId,
        conversationHistory: sessionDoc.conversationHistory || [],
        startedAt: sessionDoc.createdAt.toISOString(),
        updatedAt: sessionDoc.updatedAt.toISOString(),
      };

      // Automatic RAG retrieval for voice question if user has ready documents
      let effectiveKnowledge = explicitKnowledge;
      if (!effectiveKnowledge) {
        const hasDocs = await documentService.hasReadyDocuments(userId);
        if (hasDocs) {
          const ragStart = Date.now();
          effectiveKnowledge = await retrievalService.retrieveKnowledgeContext(userId, transcript);
          if (effectiveKnowledge) {
            console.info(`[VoiceRoute] Grounded response with ${effectiveKnowledge.retrievedChunks?.length || 0} RAG chunks (took ${Date.now() - ragStart}ms)`);
          }
        }
      }

      const aiStart = Date.now();
      const teacherResponse = await teacherEngine.generateTeacherResponse(
        session.learnerProfile,
        session,
        session.teachingState,
        transcript,
        effectiveKnowledge
      );
      const aiGenerationMs = Date.now() - aiStart;

      // Merge state deterministically
      const updatedState = teacherEngine.mergeTeachingState(
        session.teachingState,
        teacherResponse.stateUpdate
      );

      // Determine new pedagogical mode
      let newMode: 'TEACHING' | 'ASSESSMENT' | 'FEEDBACK' | 'REVIEW' = 'TEACHING';
      if (teacherResponse.intent === 'question' || teacherResponse.teachingAction === 'assess') {
        newMode = 'ASSESSMENT';
      } else if (teacherResponse.intent === 'feedback') {
        newMode = 'FEEDBACK';
      }

      // Persist to MongoDB with conversation turns
      const now = new Date().toISOString();
      sessionDoc.teachingState = updatedState;
      if (updatedState.currentConcept) {
        sessionDoc.currentConcept = updatedState.currentConcept;
      }
      sessionDoc.language = targetLanguage;
      sessionDoc.currentMode = newMode;
      sessionDoc.conversationHistory.push(
        { role: 'student', text: transcript, timestamp: now },
        { role: 'tutor', text: teacherResponse.responseText, intent: teacherResponse.intent, timestamp: new Date().toISOString() }
      );
      await sessionDoc.save();

      // Normalize teacher response for speech synthesis
      const normalizedSpeechText = normalizeTextForSpeech(teacherResponse.responseText);
      const backendDurationMs = Date.now() - startTime;

      res.status(200).json({
        success: true,
        data: {
          transcript,
          teacherResponse,
          teachingState: updatedState,
          normalizedSpeechText,
          sessionContext: buildSessionContext(sessionDoc),
          latency: {
            backendDurationMs,
            aiGenerationMs,
          },
        },
      });
    } catch (error: any) {
      console.error('Error in voice session response:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Voice pipeline processing failed', code: 'VOICE_PIPELINE_ERROR' },
      });
    }
  }
);

// 4. POST /api/teaching/lesson-plan - Generates a structured lesson plan
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

      const { topic, learnerProfile, sessionId, knowledgeContext: explicitKnowledge } = bodyParse.data;

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

      // Automatic RAG retrieval for lesson plan topic if documents exist
      let effectiveKnowledge = explicitKnowledge;
      if (!effectiveKnowledge) {
        const hasDocs = await documentService.hasReadyDocuments(userId);
        if (hasDocs) {
          effectiveKnowledge = await retrievalService.retrieveKnowledgeContext(userId, topic);
        }
      }

      const lessonPlan = await teacherEngine.generateLessonPlan(topic, profile, {
        sessionId,
        knowledgeContext: effectiveKnowledge,
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

