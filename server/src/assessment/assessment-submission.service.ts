import mongoose from 'mongoose';
import type {
  AssessmentQuestion,
  AssessmentSubmission,
  AssessmentSubmissionRequest,
  AssessmentSubmissionStatus,
  EvaluationResult,
  KnowledgeContext,
  TeachingState,
} from '@ai-tutor/shared';
import {
  AssessmentQuestionSchema,
  AssessmentSubmissionRequestSchema,
  AssessmentSubmissionSchema,
} from '@ai-tutor/shared';
import { AssessmentQuestionModel } from '../models/assessment-question.model.js';
import { AssessmentSubmissionModel } from '../models/assessment-submission.model.js';
import { AssessmentValidator } from './assessment.validation.js';
import { assessmentEvaluatorService } from './assessment-evaluator.service.js';
import { assessmentSessionService } from './assessment-session.service.js';

export class AssessmentSubmissionService {
  private inMemoryQuestions = new Map<string, AssessmentQuestion>();
  private inMemorySubmissions = new Map<string, AssessmentSubmission>();

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Persists a server-side AssessmentQuestion record.
   */
  async saveQuestion(
    question: AssessmentQuestion,
    userId: string,
    sessionId?: string,
    assessmentId?: string
  ): Promise<AssessmentQuestion> {
    const validation = AssessmentValidator.validateQuestion(question);
    if (!validation.isValid) {
      throw new Error(`Cannot save invalid question: ${validation.errors.join('; ')}`);
    }

    const effectiveSessionId: string | undefined =
      typeof sessionId === 'string'
        ? sessionId
        : typeof question.metadata?.sessionId === 'string'
        ? question.metadata.sessionId
        : undefined;

    const effectiveAssessmentId: string | undefined =
      typeof assessmentId === 'string'
        ? assessmentId
        : typeof question.metadata?.assessmentId === 'string'
        ? question.metadata.assessmentId
        : undefined;

    const savedData: AssessmentQuestion = {
      ...question,
      metadata: {
        ...question.metadata,
        userId,
        sessionId: effectiveSessionId,
        assessmentId: effectiveAssessmentId,
      },
    };

    if (this.isMongoConnected()) {
      try {
        const doc = await AssessmentQuestionModel.findOneAndUpdate(
          { questionId: question.questionId },
          {
            ...question,
            userId,
            sessionId: effectiveSessionId,
            assessmentId: effectiveAssessmentId,
          },
          { upsert: true, new: true }
        );

        if (effectiveSessionId) {
          await assessmentSessionService.addQuestionToSession(userId, effectiveSessionId, question.questionId);
        }

        return AssessmentQuestionSchema.parse({
          questionId: doc.questionId,
          concept: doc.concept,
          subject: doc.subject,
          grade: doc.grade,
          difficulty: doc.difficulty,
          questionType: doc.questionType,
          evaluationMode: doc.evaluationMode,
          marks: doc.marks,
          question: doc.question,
          context: doc.context,
          options: doc.options,
          correctOptionId: doc.correctOptionId,
          expectedAnswer: doc.expectedAnswer,
          rubric: doc.rubric,
          submissionGuidance: doc.submissionGuidance,
          requiresImageUpload: doc.requiresImageUpload,
          ragGrounded: doc.ragGrounded,
          groundingSources: doc.groundingSources,
          metadata: doc.metadata,
        });
      } catch {
        // fallback
      }
    }

    this.inMemoryQuestions.set(question.questionId, savedData);
    if (effectiveSessionId) {
      await assessmentSessionService.addQuestionToSession(userId, effectiveSessionId, question.questionId);
    }
    return savedData;
  }

  /**
   * Retrieves a stored server-side AssessmentQuestion with tenant check.
   */
  async getQuestion(questionId: string, userId?: string): Promise<AssessmentQuestion | null> {
    if (this.isMongoConnected()) {
      try {
        const query: any = { questionId };
        if (userId) {
          query.userId = userId;
        }

        const doc = await AssessmentQuestionModel.findOne(query);
        if (doc) {
          return AssessmentQuestionSchema.parse({
            questionId: doc.questionId,
            concept: doc.concept,
            subject: doc.subject,
            grade: doc.grade,
            difficulty: doc.difficulty,
            questionType: doc.questionType,
            evaluationMode: doc.evaluationMode,
            marks: doc.marks,
            question: doc.question,
            context: doc.context,
            options: doc.options,
            correctOptionId: doc.correctOptionId,
            expectedAnswer: doc.expectedAnswer,
            rubric: doc.rubric,
            submissionGuidance: doc.submissionGuidance,
            requiresImageUpload: doc.requiresImageUpload,
            ragGrounded: doc.ragGrounded,
            groundingSources: doc.groundingSources,
            metadata: doc.metadata,
          });
        }
      } catch {
        // fallback
      }
    }

    const inMem = this.inMemoryQuestions.get(questionId);
    if (!inMem) return null;
    if (userId && inMem.metadata?.userId && String(inMem.metadata.userId) !== userId) return null;
    return inMem;
  }

  /**
   * Submits a student answer with multi-attempt support, validation, timing tracking, and non-blocking background evaluation.
   */
  async submitAnswer(
    userId: string,
    questionId: string,
    submissionReq: AssessmentSubmissionRequest,
    options?: {
      assessmentId?: string;
      sessionId?: string;
      questionStartedAt?: string;
      knowledgeContext?: KnowledgeContext;
      teachingState?: Partial<TeachingState>;
    }
  ): Promise<AssessmentSubmission> {
    // 1. Validate submission contract via Zod
    const validatedRequest = AssessmentSubmissionRequestSchema.parse(submissionReq);

    // 2. Fetch server-side question and verify authorization
    const serverQuestion = await this.getQuestion(questionId, userId);
    if (!serverQuestion) {
      throw new Error('Question not found or unauthorized access');
    }

    // 3. Question type integrity check
    const isMatchingType =
      validatedRequest.questionType === serverQuestion.questionType ||
      (serverQuestion.evaluationMode === 'IMAGE_SOLUTION' &&
        validatedRequest.questionType === 'IMAGE_SOLUTION');

    if (!isMatchingType) {
      throw new Error(
        `Question type mismatch: expected '${serverQuestion.questionType}', received '${validatedRequest.questionType}'`
      );
    }

    // 4. Concurrency & duplicate pending check
    if (this.isMongoConnected()) {
      try {
        const pending = await AssessmentSubmissionModel.findOne({
          userId,
          questionId,
          status: { $in: ['SUBMITTED', 'EVALUATING'] },
        });
        if (pending) {
          return this.toSubmissionEntity(pending);
        }
      } catch {
        // fallback
      }
    } else {
      const inMemPending = Array.from(this.inMemorySubmissions.values()).find(
        (s) => s.userId === userId && s.questionId === questionId && ['SUBMITTED', 'EVALUATING'].includes(s.status)
      );
      if (inMemPending) {
        return inMemPending;
      }
    }

    // Time tracking calculation
    const now = new Date();
    let questionStartedAt: Date | undefined;
    let timeTakenMs: number | undefined;

    if (options?.questionStartedAt) {
      questionStartedAt = new Date(options.questionStartedAt);
      if (!isNaN(questionStartedAt.getTime())) {
        timeTakenMs = Math.max(0, now.getTime() - questionStartedAt.getTime());
      }
    }

    const effectiveSessionId: string | undefined =
      typeof options?.sessionId === 'string'
        ? options.sessionId
        : typeof serverQuestion.metadata?.sessionId === 'string'
        ? serverQuestion.metadata.sessionId
        : undefined;
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 5. Create new submission record
    let newEntity: AssessmentSubmission;

    if (this.isMongoConnected()) {
      try {
        const previousAttemptsCount = await AssessmentSubmissionModel.countDocuments({
          userId,
          questionId,
        });

        const newDoc = await AssessmentSubmissionModel.create({
          userId,
          questionId,
          assessmentId: options?.assessmentId || serverQuestion.metadata?.assessmentId,
          sessionId: effectiveSessionId,
          attemptNumber: previousAttemptsCount + 1,
          questionType: serverQuestion.questionType,
          evaluationMode: serverQuestion.evaluationMode,
          selectedOption: validatedRequest.selectedOption,
          answer: validatedRequest.answer,
          imageReference: validatedRequest.imageReference,
          status: 'SUBMITTED',
          submittedAt: now,
          questionStartedAt,
          timeTakenMs,
        });

        newEntity = this.toSubmissionEntity(newDoc);
      } catch {
        newEntity = this.createInMemorySubmissionEntity(
          submissionId,
          userId,
          questionId,
          serverQuestion,
          validatedRequest,
          effectiveSessionId,
          now,
          questionStartedAt,
          timeTakenMs
        );
      }
    } else {
      newEntity = this.createInMemorySubmissionEntity(
        submissionId,
        userId,
        questionId,
        serverQuestion,
        validatedRequest,
        effectiveSessionId,
        now,
        questionStartedAt,
        timeTakenMs
      );
    }

    this.inMemorySubmissions.set(newEntity.id, newEntity);

    // 6. Evaluation triggering
    if (serverQuestion.questionType === 'MCQ') {
      const evaluationResult = await assessmentEvaluatorService.evaluateSubmission(
        userId,
        serverQuestion,
        newEntity,
        options
      );
      newEntity.status = evaluationResult.evaluationStatus;
      newEntity.score = evaluationResult.score;
      newEntity.feedback = evaluationResult.feedback;
      newEntity.evaluation = evaluationResult;
      this.inMemorySubmissions.set(newEntity.id, newEntity);
      return newEntity;
    } else {
      this.triggerEvaluation(userId, questionId, options, newEntity.id).catch((err) => {
        console.error(`[AssessmentSubmission] Background evaluation failed for question ${questionId}:`, err);
      });
      return newEntity;
    }
  }

  private createInMemorySubmissionEntity(
    id: string,
    userId: string,
    questionId: string,
    serverQuestion: AssessmentQuestion,
    validatedRequest: AssessmentSubmissionRequest,
    sessionId: string | undefined,
    now: Date,
    questionStartedAt?: Date,
    timeTakenMs?: number
  ): AssessmentSubmission {
    return AssessmentSubmissionSchema.parse({
      id,
      userId,
      questionId,
      sessionId,
      questionType: serverQuestion.questionType,
      evaluationMode: serverQuestion.evaluationMode,
      selectedOption: validatedRequest.selectedOption,
      answer: validatedRequest.answer,
      imageReference: validatedRequest.imageReference,
      status: 'SUBMITTED',
      submittedAt: now.toISOString(),
      questionStartedAt: questionStartedAt?.toISOString(),
      timeTakenMs,
    });
  }

  /**
   * Triggers evaluation for a submission with atomic concurrency locking.
   */
  async triggerEvaluation(
    userId: string,
    questionId: string,
    options?: {
      knowledgeContext?: KnowledgeContext;
      teachingState?: Partial<TeachingState>;
    },
    submissionId?: string
  ): Promise<EvaluationResult> {
    const serverQuestion = await this.getQuestion(questionId, userId);
    if (!serverQuestion) {
      throw new Error('Question not found or unauthorized access');
    }

    let submissionEntity = submissionId ? this.inMemorySubmissions.get(submissionId) : null;

    if (!submissionEntity) {
      submissionEntity = await this.getSubmission(userId, questionId);
    }

    if (!submissionEntity) {
      throw new Error('No submission found to evaluate');
    }

    try {
      const evaluationResult = await assessmentEvaluatorService.evaluateSubmission(
        userId,
        serverQuestion,
        submissionEntity,
        options
      );

      submissionEntity.status = evaluationResult.evaluationStatus;
      submissionEntity.score = evaluationResult.score;
      submissionEntity.feedback = evaluationResult.feedback;
      submissionEntity.evaluation = evaluationResult;
      this.inMemorySubmissions.set(submissionEntity.id, submissionEntity);

      return evaluationResult;
    } catch (err: any) {
      console.error(`[AssessmentSubmission] Evaluation processing error for question ${questionId}:`, err);
      if (submissionEntity) {
        submissionEntity.status = 'FAILED';
        submissionEntity.feedback = 'We could not evaluate this answer right now. Your submission is saved. Please try again.';
        this.inMemorySubmissions.set(submissionEntity.id, submissionEntity);
      }
      throw err;
    }
  }

  /**
   * Retrieves a student's latest submission for a question.
   */
  async getSubmission(userId: string, questionId: string): Promise<AssessmentSubmission | null> {
    if (this.isMongoConnected()) {
      try {
        const doc = await AssessmentSubmissionModel.findOne({ userId, questionId }).sort({
          createdAt: -1,
        });
        if (doc) {
          return this.toSubmissionEntity(doc);
        }
      } catch {
        // fallback
      }
    }

    const inMemList = Array.from(this.inMemorySubmissions.values())
      .filter((s) => s.userId === userId && s.questionId === questionId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return inMemList[0] || null;
  }

  /**
   * Retrieves all attempt submissions for a question.
   */
  async getSubmissionHistory(userId: string, questionId: string): Promise<AssessmentSubmission[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await AssessmentSubmissionModel.find({ userId, questionId }).sort({
          createdAt: 1,
        });
        if (docs && docs.length > 0) {
          return docs.map((d) => this.toSubmissionEntity(d));
        }
      } catch {
        // fallback
      }
    }

    return Array.from(this.inMemorySubmissions.values())
      .filter((s) => s.userId === userId && s.questionId === questionId)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }

  /**
   * Retrieves all question history for a user with optional filtering.
   */
  async getUserQuestionHistory(
    userId: string,
    filter?: {
      subject?: string;
      concept?: string;
      difficulty?: string;
      sessionId?: string;
      correctOnly?: boolean;
    }
  ): Promise<Array<{ question: AssessmentQuestion; latestSubmission?: AssessmentSubmission }>> {
    const historyItems: Array<{ question: AssessmentQuestion; latestSubmission?: AssessmentSubmission }> = [];

    const allQuestions = Array.from(this.inMemoryQuestions.values()).filter((q) => {
      if (q.metadata?.userId && q.metadata.userId !== userId) return false;
      if (filter?.subject && q.subject !== filter.subject) return false;
      if (filter?.concept && q.concept !== filter.concept) return false;
      if (filter?.difficulty && q.difficulty !== filter.difficulty) return false;
      if (filter?.sessionId && q.metadata?.sessionId !== filter.sessionId) return false;
      return true;
    });

    for (const q of allQuestions) {
      const latestSub = await this.getSubmission(userId, q.questionId);
      if (filter?.correctOnly && (!latestSub || !latestSub.evaluation?.correct)) {
        continue;
      }
      historyItems.push({
        question: q,
        latestSubmission: latestSub || undefined,
      });
    }

    return historyItems;
  }

  private toSubmissionEntity(doc: any): AssessmentSubmission {
    return AssessmentSubmissionSchema.parse({
      id: doc._id ? doc._id.toString() : doc.id,
      userId: doc.userId,
      assessmentId: doc.assessmentId,
      sessionId: doc.sessionId,
      questionId: doc.questionId,
      questionType: doc.questionType,
      evaluationMode: doc.evaluationMode,
      selectedOption: doc.selectedOption,
      answer: doc.answer,
      imageReference: doc.imageReference,
      status: doc.status,
      submittedAt: doc.submittedAt instanceof Date ? doc.submittedAt.toISOString() : String(doc.submittedAt),
      questionStartedAt: doc.questionStartedAt ? new Date(doc.questionStartedAt).toISOString() : undefined,
      timeTakenMs: doc.timeTakenMs,
      score: typeof doc.score === 'number' ? doc.score : undefined,
      feedback: doc.feedback,
      evaluation: doc.evaluation || undefined,
      metadata: doc.metadata,
    });
  }
}

export const assessmentSubmissionService = new AssessmentSubmissionService();
