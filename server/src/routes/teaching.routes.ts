import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  ApiResponse,
  ClientAssessmentQuestion,
  LessonPlan,
  RespondSessionResponse,
  TeacherResponse,
  TeachingSession,
  TeachingState,
  TutorAction,
  TutorSessionContext,
  VoiceInteractionResponse,
} from '@ai-tutor/shared';
import {
  CreateLessonPlanRequestSchema,
  CreateSessionRequestSchema,
  RespondSessionRequestSchema,
  TeachingStateSchema,
  UpdateSessionRequestSchema,
  VoiceInteractionRequestSchema,
  normalizeTextForSpeech,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';
import { DocumentModel } from '../models/document.model.js';
import { isValidObjectId } from '../utils/objectid.util.js';
import { teacherEngine } from '../engine/teacher.engine.js';
import { documentService, retrievalService } from '../knowledge/index.js';
import { assessmentEngine } from '../assessment/assessment.engine.js';
import { assessmentSubmissionService } from '../assessment/assessment-submission.service.js';
import { wrongQuestionService } from '../assessment/wrong-question.service.js';
import { evaluateAssessmentTrigger } from '../assessment/assessment-triggers.util.js';

export const teachingRouter = Router();

function buildSessionContext(sessionDoc: any): TutorSessionContext {
  return {
    sessionId: sessionDoc._id.toString(),
    userId: sessionDoc.userId,
    subject: sessionDoc.subject || 'General',
    topic: sessionDoc.topic,
    language: sessionDoc.language || 'english',
    documentId: sessionDoc.documentId,
    documentTitle: sessionDoc.documentTitle,
    conversationHistory: sessionDoc.conversationHistory || [],
    activeConcept: sessionDoc.currentConcept || sessionDoc.topic,
    teachingState: sessionDoc.teachingState,
    assessmentSessionId: sessionDoc.assessmentSessionId,
    currentQuestionId: sessionDoc.currentQuestionId,
    currentMode: sessionDoc.currentMode || 'TEACHING',
    assessmentStatus: sessionDoc.assessmentStatus || 'NONE',
    updatedAt: sessionDoc.updatedAt ? sessionDoc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

function mapSessionDoc(sessionDoc: any): TeachingSession {
  return {
    id: sessionDoc._id.toString(),
    userId: sessionDoc.userId,
    topic: sessionDoc.topic,
    subject: sessionDoc.subject || 'General',
    documentId: sessionDoc.documentId,
    documentTitle: sessionDoc.documentTitle,
    learnerProfile: sessionDoc.learnerProfile,
    status: sessionDoc.status || 'active',
    currentConcept: sessionDoc.currentConcept,
    language: sessionDoc.language || 'english',
    teachingState: sessionDoc.teachingState,
    currentMode: sessionDoc.currentMode || 'TEACHING',
    assessmentSessionId: sessionDoc.assessmentSessionId,
    currentQuestionId: sessionDoc.currentQuestionId,
    assessmentStatus: sessionDoc.assessmentStatus || 'NONE',
    progressSummary: sessionDoc.progressSummary,
    conversationHistory: sessionDoc.conversationHistory || [],
    startedAt: sessionDoc.createdAt.toISOString(),
    updatedAt: sessionDoc.updatedAt.toISOString(),
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

      const { topic, subject, documentId, documentTitle, learnerProfile } = bodyParse.data;
      let effectiveTopic = topic?.trim();
      let effectiveSubject = subject || req.body?.subject || 'General';
      let effectiveDocTitle = documentTitle;

      // Validate study document selection if provided
      if (documentId) {
        if (!isValidObjectId(documentId)) {
          res.status(404).json({
            success: false,
            error: { message: 'Document not found or invalid format', code: 'DOCUMENT_NOT_FOUND' },
          });
          return;
        }

        const doc = await DocumentModel.findOne({ _id: documentId, userId });
        if (!doc) {
          res.status(403).json({
            success: false,
            error: { message: 'Forbidden: You do not own this document', code: 'FORBIDDEN' },
          });
          return;
        }

        if (doc.status !== 'ready') {
          res.status(400).json({
            success: false,
            error: {
              message: "Study material isn't ready yet. Please wait for indexing to finish.",
              code: 'DOCUMENT_NOT_READY',
            },
          });
          return;
        }

        effectiveDocTitle = doc.filename;
        if (!effectiveTopic) {
          effectiveTopic = doc.filename.replace(/\.[^/.]+$/, '');
        }
      }

      if (!effectiveTopic) {
        effectiveTopic = 'General Topic';
      }

      const initialProfile = {
        userId,
        preferredLanguage: learnerProfile?.preferredLanguage || 'english',
        educationLevel: learnerProfile?.educationLevel || 'beginner',
        learningGoal: learnerProfile?.learningGoal || `Understand fundamentals of ${effectiveTopic}`,
        explanationStyle: learnerProfile?.explanationStyle || 'simple',
      };

      const initialTeachingState: TeachingState = TeachingStateSchema.parse({
        currentConcept: effectiveTopic,
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
        topic: effectiveTopic,
        subject: effectiveSubject,
        documentId: documentId || undefined,
        documentTitle: effectiveDocTitle || undefined,
        learnerProfile: initialProfile,
        status: 'active',
        currentConcept: effectiveTopic,
        language: initialProfile.preferredLanguage,
        teachingState: initialTeachingState,
        currentMode: 'TEACHING',
        conversationHistory: [],
      });

      res.status(201).json({
        success: true,
        data: mapSessionDoc(sessionDoc),
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

// 1a. GET /api/teaching/sessions - Lists user's teaching sessions
teachingRouter.get(
  '/sessions',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<TeachingSession[]>>): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const sessionDocs = await TeachingSessionModel.find({ userId }).sort({ updatedAt: -1 }).limit(50);
      res.status(200).json({
        success: true,
        data: sessionDocs.map(mapSessionDoc),
      });
    } catch (error: any) {
      console.error('Error listing teaching sessions:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to list teaching sessions', code: 'SERVER_ERROR' },
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

      if (!isValidObjectId(sessionId)) {
        res.status(404).json({
          success: false,
          error: { message: 'Teaching session not found', code: 'SESSION_NOT_FOUND' },
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

      res.status(200).json({
        success: true,
        data: {
          session: mapSessionDoc(sessionDoc),
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

// 1c. PATCH /api/teaching/sessions/:sessionId - Updates teaching session status/progress
teachingRouter.patch(
  '/sessions/:sessionId',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<TeachingSession>>): Promise<void> => {
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

      if (!isValidObjectId(sessionId)) {
        res.status(404).json({
          success: false,
          error: { message: 'Teaching session not found', code: 'SESSION_NOT_FOUND' },
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
          error: { message: 'Forbidden: You do not own this session', code: 'FORBIDDEN' },
        });
        return;
      }

      const bodyParse = UpdateSessionRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid update payload', code: 'VALIDATION_ERROR', details: bodyParse.error.format() },
        });
        return;
      }

      const { status, currentConcept, currentMode, assessmentStatus, progressSummary } = bodyParse.data;
      if (status) sessionDoc.status = status;
      if (currentConcept) sessionDoc.currentConcept = currentConcept;
      if (currentMode) sessionDoc.currentMode = currentMode;
      if (assessmentStatus) sessionDoc.assessmentStatus = assessmentStatus;
      if (progressSummary) sessionDoc.progressSummary = progressSummary;
      await sessionDoc.save();

      res.status(200).json({
        success: true,
        data: mapSessionDoc(sessionDoc),
      });
    } catch (error: any) {
      console.error('Error updating teaching session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update session', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 1d. POST /api/teaching/sessions/:sessionId/resume - Resumes a paused or previous session
teachingRouter.post(
  '/sessions/:sessionId/resume',
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

      if (!isValidObjectId(sessionId)) {
        res.status(404).json({
          success: false,
          error: { message: 'Teaching session not found', code: 'SESSION_NOT_FOUND' },
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
          error: { message: 'Forbidden: You do not own this session', code: 'FORBIDDEN' },
        });
        return;
      }

      // Re-verify study document if bound
      if (sessionDoc.documentId) {
        const doc = await DocumentModel.findOne({ _id: sessionDoc.documentId, userId });
        if (doc) {
          sessionDoc.documentTitle = doc.filename;
        }
      }

      sessionDoc.status = 'active';
      await sessionDoc.save();

      res.status(200).json({
        success: true,
        data: {
          session: mapSessionDoc(sessionDoc),
          context: buildSessionContext(sessionDoc),
        },
      });
    } catch (error: any) {
      console.error('Error resuming teaching session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to resume session', code: 'SERVER_ERROR' },
      });
    }
  }
);

/**
 * Reusable core turn processing for both text (/respond) and voice (/voice) interactions.
 * Handles hint/give-up detection in ASSESSMENT mode, RAG document grounding,
 * deterministic assessment triggers, real AssessmentEngine invocation, and MongoDB turn persistence.
 */
async function processTurnCore(params: {
  userId: string;
  sessionDoc: any;
  message: string;
  mode: 'voice' | 'text';
  explicitLanguage?: 'english' | 'hindi' | 'hinglish';
  explicitKnowledge?: any;
  turnId?: string;
}): Promise<{
  teacherResponse: TeacherResponse;
  teachingState: TeachingState;
  sessionContext: TutorSessionContext;
  assessmentQuestion?: ClientAssessmentQuestion;
  tutorAction?: TutorAction;
  turnId: string;
  normalizedSpeechText: string;
  aiGenerationMs: number;
}> {
  const { userId, sessionDoc, message, mode, explicitLanguage, explicitKnowledge, turnId } = params;
  const targetLanguage = explicitLanguage || sessionDoc.language || 'english';
  const effectiveTurnId = turnId || `turn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // CASE 1: Student is in active ASSESSMENT mode waiting for student answer/action
  if (sessionDoc.currentMode === 'ASSESSMENT' && sessionDoc.assessmentStatus === 'WAITING_FOR_STUDENT') {
    const isHint = /\b(hint|help|clue|guide|assist|stuck|explain question|don't understand question)\b/i.test(message);
    const isGiveUp = /\b(can't solve|cannot solve|give up|don't know|tell me the answer|show solution|skip)\b/i.test(message);

    if (isHint) {
      const hintPrompt = `The student is working on an assessment question about "${sessionDoc.currentConcept || sessionDoc.topic}" and requested help/hint: "${message}". Give a brief, encouraging pedagogical hint pointing them in the right direction WITHOUT solving the problem or giving away the final answer.`;
      const aiStart = Date.now();
      const sessionData = mapSessionDoc(sessionDoc);
      sessionData.learnerProfile.preferredLanguage = targetLanguage;

      const teacherResponse = await teacherEngine.generateTeacherResponse(
        sessionData.learnerProfile,
        sessionData,
        sessionDoc.teachingState,
        hintPrompt
      );
      const aiGenerationMs = Date.now() - aiStart;

      // Keep in ASSESSMENT mode, waiting for student
      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
        {
          role: 'tutor',
          text: teacherResponse.responseText,
          type: 'assessment',
          intent: 'clarification',
          concept: sessionDoc.currentConcept,
          questionId: sessionDoc.currentQuestionId,
          turnId: effectiveTurnId,
          timestamp: new Date().toISOString(),
        }
      );
      await sessionDoc.save();

      let activeQ: ClientAssessmentQuestion | undefined;
      if (sessionDoc.currentQuestionId) {
        const qDoc = await assessmentSubmissionService.getQuestion(sessionDoc.currentQuestionId, userId);
        if (qDoc) activeQ = sanitizeQuestionForClient(qDoc);
      }

      return {
        teacherResponse,
        teachingState: sessionDoc.teachingState,
        sessionContext: buildSessionContext(sessionDoc),
        assessmentQuestion: activeQ,
        tutorAction: { type: 'WAIT_FOR_ANSWER', questionId: sessionDoc.currentQuestionId },
        turnId: effectiveTurnId,
        normalizedSpeechText: normalizeTextForSpeech(teacherResponse.responseText),
        aiGenerationMs,
      };
    }

    if (isGiveUp) {
      const solutionPrompt = `The student gave up on this question: "${message}". Explain the full, correct solution clearly and step-by-step so they learn the concept thoroughly.`;
      const aiStart = Date.now();
      const sessionData = mapSessionDoc(sessionDoc);
      sessionData.learnerProfile.preferredLanguage = targetLanguage;

      const teacherResponse = await teacherEngine.generateTeacherResponse(
        sessionData.learnerProfile,
        sessionData,
        sessionDoc.teachingState,
        solutionPrompt
      );
      const aiGenerationMs = Date.now() - aiStart;

      if (sessionDoc.currentConcept) {
        sessionDoc.teachingState.conceptsNeedingWork = Array.from(
          new Set([...(sessionDoc.teachingState.conceptsNeedingWork || []), sessionDoc.currentConcept])
        );
      }
      sessionDoc.teachingState.understanding = 'weak';
      sessionDoc.teachingState.recommendedNextAction = 'review';

      sessionDoc.currentMode = 'TEACHING';
      sessionDoc.assessmentStatus = 'COMPLETED';
      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
        {
          role: 'tutor',
          text: teacherResponse.responseText,
          type: 'assessment',
          intent: 'explanation',
          concept: sessionDoc.currentConcept,
          questionId: sessionDoc.currentQuestionId,
          turnId: effectiveTurnId,
          timestamp: new Date().toISOString(),
        }
      );
      await sessionDoc.save();

      return {
        teacherResponse,
        teachingState: sessionDoc.teachingState,
        sessionContext: buildSessionContext(sessionDoc),
        tutorAction: { type: 'EXPLAIN' },
        turnId: effectiveTurnId,
        normalizedSpeechText: normalizeTextForSpeech(teacherResponse.responseText),
        aiGenerationMs,
      };
    }
  }

  // CASE 2: Normal TEACHING mode
  let effectiveKnowledge = explicitKnowledge;
  if (!effectiveKnowledge) {
    const hasDocs = await documentService.hasReadyDocuments(userId);
    if (hasDocs) {
      const retrievalOptions = sessionDoc.documentId ? { documentIds: [sessionDoc.documentId] } : undefined;
      effectiveKnowledge = await retrievalService.retrieveKnowledgeContext(userId, message, retrievalOptions);
    }
  }

  const aiStart = Date.now();
  const sessionData = mapSessionDoc(sessionDoc);
  sessionData.learnerProfile.preferredLanguage = targetLanguage;

  const teacherResponse = await teacherEngine.generateTeacherResponse(
    sessionData.learnerProfile,
    sessionData,
    sessionDoc.teachingState,
    message,
    effectiveKnowledge
  );
  const aiGenerationMs = Date.now() - aiStart;

  const updatedState = teacherEngine.mergeTeachingState(
    sessionDoc.teachingState,
    teacherResponse.stateUpdate
  );

  let isMistakeDue = false;
  try {
    const dueList = await wrongQuestionService.getDueReviews(userId);
    isMistakeDue = dueList.length > 0;
  } catch {
    // Graceful fallback
  }

  const triggerResult = evaluateAssessmentTrigger({
    studentMessage: message,
    currentMode: sessionDoc.currentMode,
    assessmentStatus: sessionDoc.assessmentStatus,
    teachingState: updatedState,
    conversationHistory: sessionDoc.conversationHistory || [],
    teacherResponse,
    isMistakeDue,
  });

  let clientAssessmentQuestion: ClientAssessmentQuestion | undefined;
  let action: TutorAction = teacherResponse.action || { type: 'CONTINUE_TEACHING' };

  if (triggerResult.shouldAssess) {
    try {
      const plan = assessmentEngine.planAssessment({
        concept: updatedState.currentConcept || sessionDoc.topic,
        subject: sessionDoc.subject || 'General',
        grade: sessionDoc.learnerProfile.educationLevel,
        goal: 'practice',
        preferredDifficulty: triggerResult.difficulty,
        preferredQuestionType: triggerResult.questionType,
        teachingState: updatedState,
      });

      const strategy = plan.strategies[0];
      const serverQuestion = await assessmentEngine.generateQuestion({
        strategy,
        teachingState: updatedState,
        knowledgeContext: effectiveKnowledge,
      });

      await assessmentSubmissionService.saveQuestion(serverQuestion, userId, sessionDoc._id.toString());
      clientAssessmentQuestion = sanitizeQuestionForClient(serverQuestion);

      sessionDoc.currentMode = 'ASSESSMENT';
      sessionDoc.currentQuestionId = serverQuestion.questionId;
      sessionDoc.assessmentStatus = 'WAITING_FOR_STUDENT';

      action = {
        type: 'ASK_ASSESSMENT',
        questionType: triggerResult.questionType,
        difficulty: triggerResult.difficulty,
        questionId: serverQuestion.questionId,
        reason: triggerResult.reason,
      };

      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
        {
          role: 'tutor',
          text: teacherResponse.responseText,
          type: 'assessment',
          intent: 'question',
          concept: updatedState.currentConcept,
          questionId: serverQuestion.questionId,
          turnId: effectiveTurnId,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (assessErr) {
      console.error('[TeachingRoute] Assessment generation fallback:', assessErr);
      sessionDoc.currentMode = 'TEACHING';
      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
        { role: 'tutor', text: teacherResponse.responseText, type: mode, intent: teacherResponse.intent, turnId: effectiveTurnId, timestamp: new Date().toISOString() }
      );
    }
  } else {
    sessionDoc.currentMode = 'TEACHING';
    sessionDoc.assessmentStatus = 'NONE';
    sessionDoc.conversationHistory.push(
      { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
      { role: 'tutor', text: teacherResponse.responseText, type: mode, intent: teacherResponse.intent, turnId: effectiveTurnId, timestamp: new Date().toISOString() }
    );
  }

  sessionDoc.teachingState = updatedState;
  if (updatedState.currentConcept) {
    sessionDoc.currentConcept = updatedState.currentConcept;
  }
  sessionDoc.language = targetLanguage;
  await sessionDoc.save();

  return {
    teacherResponse,
    teachingState: updatedState,
    sessionContext: buildSessionContext(sessionDoc),
    assessmentQuestion: clientAssessmentQuestion,
    tutorAction: action,
    turnId: effectiveTurnId,
    normalizedSpeechText: normalizeTextForSpeech(teacherResponse.responseText),
    aiGenerationMs,
  };
}

// 2. POST /api/teaching/sessions/:sessionId/respond - Responds to student message in session
teachingRouter.post(
  '/sessions/:sessionId/respond',
  requireAuth,
  async (
    req: Request,
    res: Response<ApiResponse<RespondSessionResponse>>
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

      if (!isValidObjectId(sessionId)) {
        res.status(404).json({
          success: false,
          error: { message: 'Teaching session not found', code: 'SESSION_NOT_FOUND' },
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

      const result = await processTurnCore({
        userId,
        sessionDoc,
        message: bodyParse.data.message,
        mode: 'text',
        explicitKnowledge: bodyParse.data.knowledgeContext,
        turnId: bodyParse.data.turnId,
      });

      res.status(200).json({
        success: true,
        data: {
          teacherResponse: result.teacherResponse,
          teachingState: result.teachingState,
          sessionContext: result.sessionContext,
          assessmentQuestion: result.assessmentQuestion,
          tutorAction: result.tutorAction,
          turnId: result.turnId,
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

      if (!isValidObjectId(sessionId)) {
        res.status(404).json({
          success: false,
          error: { message: 'Teaching session not found', code: 'SESSION_NOT_FOUND' },
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

      const { transcript, language, knowledgeContext } = bodyParse.data;
      const result = await processTurnCore({
        userId,
        sessionDoc,
        message: transcript,
        mode: 'voice',
        explicitLanguage: language,
        explicitKnowledge: knowledgeContext,
        turnId: (req.body as any)?.turnId,
      });

      const backendDurationMs = Date.now() - startTime;

      res.status(200).json({
        success: true,
        data: {
          transcript,
          teacherResponse: result.teacherResponse,
          teachingState: result.teachingState,
          normalizedSpeechText: result.normalizedSpeechText,
          sessionContext: result.sessionContext,
          assessmentQuestion: result.assessmentQuestion,
          tutorAction: result.tutorAction,
          turnId: result.turnId,
          latency: {
            backendDurationMs,
            aiGenerationMs: result.aiGenerationMs,
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

