import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  ApiResponse,
  ClientAssessmentQuestion,
  LessonBlueprint,
  LessonPlan,
  LessonProgressState,
  RespondSessionResponse,
  TeacherResponse,
  TeachingSession,
  TeachingState,
  TutorAction,
  TutorSessionContext,
  VoiceInteractionResponse,
} from '@ai-tutor/shared';
import {
  CreateLessonBlueprintRequestSchema,
  CreateLessonPlanRequestSchema,
  CreateSessionRequestSchema,
  ReplanLessonRequestSchema,
  RespondSessionRequestSchema,
  TeachingStateSchema,
  UpdateSessionRequestSchema,
  VoiceInteractionRequestSchema,
  normalizeTextForSpeech,
  normalizeTextForDisplay,
  cleanCaptionText,
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
import { lessonPlannerService } from '../lesson/lesson-planner.service.js';
import { defaultVisualStrategyEngine } from '../visual/visual-strategy.engine.js';
import { defaultVisualHistoryService } from '../visual/visual-history.service.js';
import { defaultVisualAssetRepository } from '../visual/visual-asset.repository.js';
import { defaultReplayService } from '../memory/replay.service.js';
import { defaultSessionMemoryService } from '../memory/session-memory.service.js';
import { defaultConversationOrchestrator } from '../orchestration/conversation.orchestrator.js';

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
    lessonBlueprint: sessionDoc.lessonBlueprint,
    lessonProgress: sessionDoc.lessonProgress,
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
    lessonBlueprint: sessionDoc.lessonBlueprint,
    lessonProgress: sessionDoc.lessonProgress,
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

      const {
        topic,
        subject,
        documentId,
        documentTitle,
        learnerProfile,
        availableMinutes,
        learningGoal,
        planBlueprint,
      } = bodyParse.data;
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

        // If topic omitted, fall back to document filename
        if (!effectiveTopic) {
          effectiveTopic = doc.filename.replace(/\.[^/.]+$/, '') || 'Document Study Session';
        }
        if (!effectiveDocTitle) {
          effectiveDocTitle = doc.filename;
        }
      }

      if (!effectiveTopic) {
        res.status(400).json({
          success: false,
          error: { message: 'Topic is required when no document is provided', code: 'TOPIC_REQUIRED' },
        });
        return;
      }

      const initialProfile = {
        userId,
        preferredLanguage: learnerProfile?.preferredLanguage || 'english',
        educationLevel: learnerProfile?.educationLevel || 'General',
        learningGoal: learningGoal || learnerProfile?.learningGoal || 'General understanding',
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

      // Optional initial blueprint generation
      let lessonBlueprint: LessonBlueprint | undefined = undefined;
      let lessonProgress: LessonProgressState | undefined = undefined;
      if (availableMinutes || planBlueprint) {
        try {
          lessonBlueprint = await lessonPlannerService.planLesson({
            topic: effectiveTopic,
            subject: effectiveSubject,
            learnerProfile: initialProfile,
            availableMinutes: availableMinutes || 30,
            learningGoal: initialProfile.learningGoal,
            documentId: documentId || undefined,
            userId,
          });
          lessonProgress = lessonPlannerService.initializeProgress(lessonBlueprint);
        } catch (planErr) {
          console.warn('[SessionRoute] Initial blueprint generation warning:', planErr);
        }
      }

      // Deterministic MongoDB persistence
      const sessionDoc = await TeachingSessionModel.create({
        userId,
        topic: effectiveTopic,
        subject: effectiveSubject,
        documentId: documentId || undefined,
        documentTitle: effectiveDocTitle || undefined,
        learnerProfile: initialProfile,
        status: 'active',
        currentConcept: lessonBlueprint?.conceptSequence[0]?.title || effectiveTopic,
        language: initialProfile.preferredLanguage,
        teachingState: initialTeachingState,
        currentMode: 'TEACHING',
        lessonBlueprint: lessonBlueprint || undefined,
        lessonProgress: lessonProgress || undefined,
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
}): Promise<RespondSessionResponse> {
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

      const speech = teacherResponse.speechText || normalizeTextForSpeech(teacherResponse.responseText);
      const caption = teacherResponse.captionText || cleanCaptionText(teacherResponse.responseText);
      const tc = {
        turnId: effectiveTurnId,
        concept: sessionDoc.currentConcept || sessionDoc.topic,
        speechText: speech,
        captionText: caption,
        displayText: teacherResponse.responseText,
        visual: teacherResponse.visual,
      };

      return {
        teacherResponse: {
          ...teacherResponse,
          speechText: speech,
          captionText: caption,
          teachingContent: tc,
        },
        teachingState: sessionDoc.teachingState,
        sessionContext: buildSessionContext(sessionDoc),
        assessmentQuestion: activeQ,
        tutorAction: { type: 'WAIT_FOR_ANSWER', questionId: sessionDoc.currentQuestionId },
        turnId: effectiveTurnId,
        speechText: speech,
        captionText: caption,
        visualPayload: teacherResponse.visual ? { type: teacherResponse.visual.type, ...teacherResponse.visual.data } : undefined,
        teachingContent: tc,
        normalizedSpeechText: speech,
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

      const speech = teacherResponse.speechText || normalizeTextForSpeech(teacherResponse.responseText);
      const caption = teacherResponse.captionText || cleanCaptionText(teacherResponse.responseText);
      const tc = {
        turnId: effectiveTurnId,
        concept: sessionDoc.currentConcept || sessionDoc.topic,
        speechText: speech,
        captionText: caption,
        displayText: teacherResponse.responseText,
        visual: teacherResponse.visual,
      };

      return {
        teacherResponse: {
          ...teacherResponse,
          speechText: speech,
          captionText: caption,
          teachingContent: tc,
        },
        teachingState: sessionDoc.teachingState,
        sessionContext: buildSessionContext(sessionDoc),
        tutorAction: { type: 'EXPLAIN' },
        turnId: effectiveTurnId,
        speechText: speech,
        captionText: caption,
        visualPayload: teacherResponse.visual ? { type: teacherResponse.visual.type, ...teacherResponse.visual.data } : undefined,
        teachingContent: tc,
        normalizedSpeechText: speech,
        aiGenerationMs,
      };
    }
  }

  // Phase 4: Unified Intent Routing through ConversationOrchestrator
  const studentIntent = defaultConversationOrchestrator.classifyIntent(
    message,
    sessionDoc.currentMode === 'ASSESSMENT'
  );

  // CASE 1.5: Deterministic Replay ("Explain that again", "Show me that formula again")
  if (studentIntent === 'REPLAY') {
    const replayResult = await defaultConversationOrchestrator.handleReplayRequest(
      sessionDoc._id.toString(),
      effectiveTurnId
    );

    if (replayResult) {
      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
        {
          role: 'tutor',
          text: replayResult.displayText,
          type: 'explanation',
          intent: 'explanation',
          concept: replayResult.teachingState.currentConcept,
          turnId: effectiveTurnId,
          timestamp: new Date().toISOString(),
        }
      );
      await sessionDoc.save();

      const tc = {
        turnId: effectiveTurnId,
        concept: replayResult.teachingState.currentConcept,
        speechText: replayResult.speechText || replayResult.displayText,
        captionText: replayResult.captionText,
        displayText: replayResult.displayText,
        visual: replayResult.visual,
        visualBeats: replayResult.visualBeats,
      };

      return {
        teacherResponse: {
          responseText: replayResult.displayText,
          language: targetLanguage,
          intent: 'explanation' as any,
          teachingAction: 'explain' as any,
          action: replayResult.tutorAction,
          speechText: replayResult.speechText,
          captionText: replayResult.captionText,
          teachingContent: tc,
          visualBeats: replayResult.visualBeats,
        },
        teachingState: sessionDoc.teachingState,
        sessionContext: buildSessionContext(sessionDoc),
        tutorAction: replayResult.tutorAction,
        turnId: effectiveTurnId,
        speechText: replayResult.speechText,
        captionText: replayResult.captionText,
        visualPayload: replayResult.visual ? { type: replayResult.visual.type, ...replayResult.visual.data } : undefined,
        teachingContent: tc,
        normalizedSpeechText: replayResult.speechText,
        aiGenerationMs: 5,
      };
    }
  }

  // CASE 1.6: Session Memory Query ("What did we learn today?")
  if (
    /what did we learn|summarize what we covered|what concepts did we (do|study|cover)|recap the session/i.test(
      message
    )
  ) {
    const memResult = await defaultConversationOrchestrator.handleSessionMemoryQuery(
      sessionDoc._id.toString(),
      effectiveTurnId
    );

    sessionDoc.conversationHistory.push(
      { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
      {
        role: 'tutor',
        text: memResult.displayText,
        type: 'explanation',
        intent: 'explanation',
        concept: sessionDoc.currentConcept || sessionDoc.topic,
        turnId: effectiveTurnId,
        timestamp: new Date().toISOString(),
      }
    );
    await sessionDoc.save();

    const tc = {
      turnId: effectiveTurnId,
      concept: sessionDoc.currentConcept || sessionDoc.topic,
      speechText: memResult.speechText || memResult.displayText,
      displayText: memResult.displayText,
      visual: memResult.visual,
    };

    return {
      teacherResponse: {
        responseText: memResult.displayText,
        language: targetLanguage,
        intent: 'explanation' as any,
        teachingAction: 'explain' as any,
        action: memResult.tutorAction,
        speechText: memResult.speechText,
        teachingContent: tc,
      },
      teachingState: sessionDoc.teachingState,
      sessionContext: buildSessionContext(sessionDoc),
      tutorAction: memResult.tutorAction,
      turnId: effectiveTurnId,
      speechText: memResult.speechText,
      visualPayload: memResult.visual ? { type: memResult.visual.type, ...memResult.visual.data } : undefined,
      teachingContent: tc,
      normalizedSpeechText: memResult.speechText,
      aiGenerationMs: 10,
    };
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

      // Ensure spoken introduction naturally introduces the formal question
      // without asking a competing conversational question at the same time
      let spokenAssessmentIntro = teacherResponse.responseText;
      if (/\?\s*$/i.test(spokenAssessmentIntro.trim())) {
        spokenAssessmentIntro = `${spokenAssessmentIntro.replace(/\?[^?]*$/i, '.')}. Let's check your understanding with this question!`;
      }

      sessionDoc.conversationHistory.push(
        { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
        {
          role: 'tutor',
          text: spokenAssessmentIntro,
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
    // Normal teaching mode (including conversational questions)
    if (action.type !== 'ASK_CONVERSATIONAL' && teacherResponse.intent === 'question') {
      action = { type: 'ASK_CONVERSATIONAL', reason: 'conversational_question' };
    }

    sessionDoc.currentMode = 'TEACHING';
    sessionDoc.assessmentStatus = 'NONE';
    sessionDoc.conversationHistory.push(
      { role: 'student', text: message, type: mode, turnId: effectiveTurnId, timestamp: now },
      {
        role: 'tutor',
        text: teacherResponse.responseText,
        type: mode,
        intent: teacherResponse.intent,
        concept: updatedState.currentConcept,
        turnId: effectiveTurnId,
        timestamp: new Date().toISOString(),
      }
    );
  }

  sessionDoc.teachingState = updatedState;
  if (updatedState.currentConcept) {
    sessionDoc.currentConcept = updatedState.currentConcept;
  }
  if (sessionDoc.lessonBlueprint && sessionDoc.lessonProgress) {
    const currentConceptId = sessionDoc.lessonProgress.currentConceptId;
    const currentConcept = sessionDoc.lessonBlueprint.conceptSequence?.find(
      (c: any) => c.id === currentConceptId
    );
    let conceptCompleted: string | undefined = undefined;
    if (
      currentConcept &&
      Array.isArray(updatedState.conceptsMastered) &&
      updatedState.conceptsMastered.includes(currentConcept.title)
    ) {
      conceptCompleted = currentConcept.id;
    }
    sessionDoc.lessonProgress = lessonPlannerService.advanceProgress(
      sessionDoc.lessonBlueprint,
      sessionDoc.lessonProgress,
      {
        conceptCompleted,
        minutesSpent: 1,
        assessmentUsed: clientAssessmentQuestion ? currentConceptId : undefined,
      }
    );
    sessionDoc.markModified('lessonProgress');
  }
  sessionDoc.language = targetLanguage;
  await sessionDoc.save();

  const finalResponseText =
    clientAssessmentQuestion && /\?\s*$/i.test(teacherResponse.responseText.trim())
      ? `${teacherResponse.responseText.replace(/\?[^?]*$/i, '.')}. Let's check your understanding with this question!`
      : teacherResponse.responseText;

  const rawSpeech = teacherResponse.speechText || finalResponseText;
  const normalizedSpeech = normalizeTextForSpeech(rawSpeech);
  const caption = teacherResponse.captionText || cleanCaptionText(finalResponseText);

  // Synchronize visual payload from teacher response or active lesson blueprint
  let effectiveVisual = teacherResponse.visual;
  if (!effectiveVisual && sessionDoc.lessonBlueprint) {
    const activeConceptId = sessionDoc.lessonProgress?.currentConceptId;
    const bpVisualReq = sessionDoc.lessonBlueprint.visualRequirements?.find(
      (v: any) => v.conceptId === activeConceptId && v.visualType !== 'NONE'
    );
    if (bpVisualReq) {
      effectiveVisual = {
        type: bpVisualReq.visualType,
        data: {
          title: sessionDoc.topic,
          heading: bpVisualReq.purpose,
          formula: bpVisualReq.keyElements?.[0],
          bullets: bpVisualReq.keyElements,
        },
      };
    }
  }

  if (!effectiveVisual) {
    effectiveVisual = {
      type: 'TEXT',
      data: {
        title: updatedState.currentConcept || sessionDoc.topic,
        heading: updatedState.currentConcept || sessionDoc.topic,
        text: caption,
      },
    };
  }

  const normalizedDisplay = normalizeTextForDisplay(finalResponseText);

  // Phase 3: Visual Intelligence & Strategy Selection
  let visualPlan: any = undefined;
  try {
    const recentHistory = await defaultVisualHistoryService.getSessionVisualHistory(sessionDoc._id.toString());
    const recentStrategies = recentHistory.slice(-5).map((h) => h.strategy);

    visualPlan = await defaultVisualStrategyEngine.planVisual({
      topic: sessionDoc.topic,
      concept: updatedState.currentConcept || sessionDoc.currentConcept,
      teachingContent: {
        turnId: effectiveTurnId,
        speechText: normalizedSpeech,
        captionText: caption,
        displayText: normalizedDisplay,
        visual: effectiveVisual,
      },
      teachingState: updatedState,
      documentId: sessionDoc.documentId,
      turnId: effectiveTurnId,
      recentStrategies,
    });

    // If teacherResponse did not provide multi-beat sequence, adopt the visualPlan beats
    if (!teacherResponse.visualBeats || teacherResponse.visualBeats.length <= 1) {
      if (visualPlan.beats && visualPlan.beats.length > 0) {
        teacherResponse.visualBeats = visualPlan.beats;
        effectiveVisual = {
          type: visualPlan.beats[0].type,
          data: visualPlan.beats[0].data,
        };
      }
    }

    // Persist to session visual history
    await defaultVisualHistoryService.recordVisualTurn({
      sessionId: sessionDoc._id.toString(),
      turnId: effectiveTurnId,
      conceptId: updatedState.currentConcept || sessionDoc.currentConcept,
      visualPlan,
      speechText: normalizedSpeech,
      displayText: normalizedDisplay,
      captionText: caption,
    });

    // Phase 3.5: Persist replayable teaching segment
    const segmentId = `seg_${sessionDoc._id.toString()}_${effectiveTurnId}_${Date.now().toString(36)}`;
    await defaultReplayService.saveSegment({
      segmentId,
      sessionId: sessionDoc._id.toString(),
      turnId: effectiveTurnId,
      conceptId: updatedState.currentConcept || sessionDoc.currentConcept,
      concept: updatedState.currentConcept || sessionDoc.topic,
      title: visualPlan?.beats?.[0]?.data?.title || updatedState.currentConcept || sessionDoc.topic,
      speechText: normalizedSpeech,
      displayText: normalizedDisplay,
      captionText: caption,
      visualPlan,
      visualBeats: teacherResponse.visualBeats || visualPlan?.beats || [],
      assetIds: visualPlan?.assetIds || [],
      durationMs: visualPlan?.beats?.reduce((s: number, b: any) => s + (b.durationHint || 5000), 0) || 5000,
      replayable: true,
      createdAt: new Date().toISOString(),
    });
  } catch (visErr) {
    console.warn('[TeachingRoute] Visual strategy planning / replay segment persistence warning:', visErr);
  }

  const teachingContent = {
    turnId: effectiveTurnId,
    concept: updatedState.currentConcept || sessionDoc.topic,
    speechText: normalizedSpeech,
    captionText: caption,
    displayText: normalizedDisplay,
    visual: effectiveVisual,
    visualBeats: teacherResponse.visualBeats,
    visualPlan,
  };

  return {
    teacherResponse: {
      ...teacherResponse,
      responseText: finalResponseText,
      speechText: normalizedSpeech,
      captionText: caption,
      visual: effectiveVisual,
      teachingContent,
    },
    teachingState: updatedState,
    sessionContext: buildSessionContext(sessionDoc),
    assessmentQuestion: clientAssessmentQuestion,
    tutorAction: action,
    turnId: effectiveTurnId,
    speechText: normalizedSpeech,
    captionText: caption,
    visualPayload: effectiveVisual ? { type: effectiveVisual.type, ...effectiveVisual.data } : undefined,
    teachingContent,
    normalizedSpeechText: normalizedSpeech,
    displayText: normalizedDisplay,
    visualBeats: teacherResponse.visualBeats,
    visualPlan,
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
        data: result,
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
          normalizedSpeechText: result.normalizedSpeechText || result.teacherResponse.responseText,
          speechText: result.speechText,
          captionText: result.captionText,
          visualPayload: result.visualPayload,
          teachingContent: result.teachingContent,
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

// 10. POST /api/teaching/sessions/:id/blueprint - Generates/binds a LessonBlueprint to session
teachingRouter.post(
  '/sessions/:id/blueprint',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      const sessionDoc = await TeachingSessionModel.findById(id);
      if (!sessionDoc) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
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

      const availableMinutes =
        typeof req.body?.availableMinutes === 'number' && req.body.availableMinutes > 0
          ? req.body.availableMinutes
          : 30;
      const learningGoal = req.body?.learningGoal || sessionDoc.learnerProfile?.learningGoal;

      const blueprint = await lessonPlannerService.planLesson({
        topic: sessionDoc.topic,
        subject: sessionDoc.subject,
        learnerProfile: sessionDoc.learnerProfile,
        availableMinutes,
        learningGoal,
        documentId: sessionDoc.documentId,
        sessionId: sessionDoc._id.toString(),
        userId,
      });

      const progress = lessonPlannerService.initializeProgress(blueprint);

      sessionDoc.lessonBlueprint = blueprint;
      sessionDoc.lessonProgress = progress;
      if (blueprint.conceptSequence[0]?.title) {
        sessionDoc.currentConcept = blueprint.conceptSequence[0].title;
      }
      sessionDoc.markModified('lessonBlueprint');
      sessionDoc.markModified('lessonProgress');
      await sessionDoc.save();

      res.status(200).json({
        success: true,
        data: blueprint,
        progress,
      });
    } catch (error: any) {
      console.error('Error generating lesson blueprint for session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to generate blueprint', code: 'BLUEPRINT_ERROR' },
      });
    }
  }
);

// 11. GET /api/teaching/sessions/:id/blueprint - Retrieves active LessonBlueprint for session
teachingRouter.get(
  '/sessions/:id/blueprint',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      const sessionDoc = await TeachingSessionModel.findById(id);
      if (!sessionDoc) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
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

      if (!sessionDoc.lessonBlueprint) {
        res.status(404).json({
          success: false,
          error: { message: 'No blueprint exists for this session', code: 'BLUEPRINT_NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sessionDoc.lessonBlueprint,
        progress: sessionDoc.lessonProgress,
      });
    } catch (error: any) {
      console.error('Error fetching lesson blueprint:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch blueprint', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 12. POST /api/teaching/sessions/:id/replan - Dynamically replans remaining concepts
teachingRouter.post(
  '/sessions/:id/replan',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
        });
        return;
      }

      const sessionDoc = await TeachingSessionModel.findById(id);
      if (!sessionDoc) {
        res.status(404).json({
          success: false,
          error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' },
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

      if (!sessionDoc.lessonBlueprint) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Cannot replan a session that has no initial blueprint',
            code: 'NO_BLUEPRINT',
          },
        });
        return;
      }

      const bodyParse = ReplanLessonRequestSchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid replanning request',
            code: 'VALIDATION_ERROR',
            details: bodyParse.error.format(),
          },
        });
        return;
      }

      const { reason, remainingMinutes, studentFeedback, focusAdjustment } = bodyParse.data;

      const replanResult = await lessonPlannerService.replanLesson({
        currentBlueprint: sessionDoc.lessonBlueprint,
        currentProgress:
          sessionDoc.lessonProgress ||
          lessonPlannerService.initializeProgress(sessionDoc.lessonBlueprint),
        triggerReason: reason,
        remainingMinutes,
        studentFeedback,
        focusAdjustment,
        teachingState: sessionDoc.teachingState,
      });

      sessionDoc.lessonBlueprint = replanResult.blueprint;
      sessionDoc.lessonProgress = replanResult.updatedProgress;
      if (replanResult.updatedProgress.currentConceptId) {
        const nextConcept = replanResult.blueprint.conceptSequence.find(
          (c: any) => c.id === replanResult.updatedProgress.currentConceptId
        );
        if (nextConcept?.title) {
          sessionDoc.currentConcept = nextConcept.title;
        }
      }
      sessionDoc.markModified('lessonBlueprint');
      sessionDoc.markModified('lessonProgress');
      await sessionDoc.save();

      res.status(200).json({
        success: true,
        data: replanResult.blueprint,
        progress: replanResult.updatedProgress,
        changeSummary: replanResult.changeSummary,
      });
    } catch (error: any) {
      console.error('Error replanning session:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to replan lesson', code: 'REPLAN_ERROR' },
      });
    }
  }
);

// ==========================================
// Phase 3: Visual Intelligence & Asset Routes
// ==========================================

// 8. GET /api/teaching/sessions/:sessionId/visual-history - Retrieves complete visual history for a session
teachingRouter.get(
  '/sessions/:sessionId/visual-history',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const history = await defaultVisualHistoryService.getSessionVisualHistory(sessionId);
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve visual history', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 9. GET /api/teaching/sessions/:sessionId/visual-timeline - Retrieves chronological visual timeline for a session
teachingRouter.get(
  '/sessions/:sessionId/visual-timeline',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const timeline = await defaultVisualHistoryService.getSessionTimeline(sessionId);
      res.status(200).json({
        success: true,
        data: timeline,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve visual timeline', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 10. POST /api/teaching/sessions/:sessionId/visual-history/:visualId/replay - Returns deterministic replay payload
teachingRouter.post(
  '/sessions/:sessionId/visual-history/:visualId/replay',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { visualId } = req.params;
      const replayPayload = await defaultVisualHistoryService.getReplayPayload(visualId);
      if (!replayPayload) {
        res.status(404).json({
          success: false,
          error: { message: 'Visual history record not found for replay', code: 'NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: replayPayload,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to reconstruct replay', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 11. GET /api/teaching/visual-assets/:assetId - Retrieves visual asset metadata
teachingRouter.get(
  '/visual-assets/:assetId',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { assetId } = req.params;
      const asset = await defaultVisualAssetRepository.getAsset(assetId);
      if (!asset) {
        res.status(404).json({
          success: false,
          error: { message: 'Visual asset not found', code: 'NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve visual asset', code: 'SERVER_ERROR' },
      });
    }
  }
);

// =========================================================================
// Phase 3.5: Replay & Session Memory Endpoints
// =========================================================================

// 12. GET /api/teaching/sessions/:sessionId/memory - Returns session memory summary
teachingRouter.get(
  '/sessions/:sessionId/memory',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const memory = await defaultSessionMemoryService.getSessionMemory(sessionId);
      res.status(200).json({
        success: true,
        data: memory,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve session memory', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 13. GET /api/teaching/sessions/:sessionId/replay-segments - Returns replayable segments
teachingRouter.get(
  '/sessions/:sessionId/replay-segments',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const query = req.query.query as string | undefined;
      const segments = query
        ? await defaultSessionMemoryService.findRelevantSegments(sessionId, query)
        : await defaultSessionMemoryService.getSessionMemory(sessionId).then((m) => m.segments);

      res.status(200).json({
        success: true,
        data: segments,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to list replay segments', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 14. GET /api/teaching/sessions/:sessionId/replay-segments/:segmentId - Returns a specific segment
teachingRouter.get(
  '/sessions/:sessionId/replay-segments/:segmentId',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { segmentId } = req.params;
      const segment = await defaultSessionMemoryService.getReplaySegment(segmentId);
      if (!segment) {
        res.status(404).json({
          success: false,
          error: { message: 'Replay segment not found', code: 'NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: segment,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve replay segment', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 15. POST /api/teaching/sessions/:sessionId/replay-segments/:segmentId/replay - Deterministic replay
teachingRouter.post(
  '/sessions/:sessionId/replay-segments/:segmentId/replay',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { segmentId } = req.params;
      const replayPayload = await defaultReplayService.replaySegment(segmentId);
      if (!replayPayload) {
        res.status(404).json({
          success: false,
          error: { message: 'Replay segment not found or not replayable', code: 'NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: replayPayload,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to execute replay', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 16. GET /api/teaching/sessions/:sessionId/concepts/:conceptId/history - Concept teaching history
teachingRouter.get(
  '/sessions/:sessionId/concepts/:conceptId/history',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId, conceptId } = req.params;
      const conceptMemory = await defaultSessionMemoryService.getConceptHistory(sessionId, conceptId);
      res.status(200).json({
        success: true,
        data: conceptMemory,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to retrieve concept history', code: 'SERVER_ERROR' },
      });
    }
  }
);

// =========================================================================
// Phase 4: Live Interactive Classroom & Orchestration Endpoints
// =========================================================================

// 17. POST /api/teaching/sessions/:sessionId/interrupt - Atomic barge-in cancellation
teachingRouter.post(
  '/sessions/:sessionId/interrupt',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId } = req.params;
      defaultConversationOrchestrator.handleInterruption(sessionId);
      res.status(200).json({
        success: true,
        data: { message: 'Turn interrupted and invalidated', sessionId },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to interrupt session', code: 'SERVER_ERROR' },
      });
    }
  }
);

// 18. GET /api/teaching/sessions/:sessionId/summary - Session summary from memory
teachingRouter.get(
  '/sessions/:sessionId/summary',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const memory = await defaultSessionMemoryService.getSessionMemory(sessionId);
      const sessionDoc = await TeachingSessionModel.findById(sessionId).lean();

      // Extract formulas and concepts covered
      const keyFormulas: string[] = [];
      for (const seg of memory.segments) {
        for (const beat of seg.visualBeats || []) {
          if (beat.type === 'FORMULA' && beat.data?.formula) {
            keyFormulas.push(beat.data.formula);
          }
        }
      }

      const summary = {
        sessionId,
        topic: memory.topic,
        subject: memory.subject,
        conceptsCovered: memory.conceptsCovered,
        keyFormulas: Array.from(new Set(keyFormulas)),
        weakConcepts: sessionDoc?.teachingState?.conceptsNeedingWork || [],
        strongConcepts: sessionDoc?.teachingState?.conceptsMastered || [],
        totalDurationMs: memory.totalDurationMs,
        turnCount: memory.segments.length,
        startedAt: memory.startedAt,
        endedAt: new Date().toISOString(),
      };

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { message: err.message || 'Failed to generate session summary', code: 'SERVER_ERROR' },
      });
    }
  }
);

