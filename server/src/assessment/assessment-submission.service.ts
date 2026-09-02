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

export class AssessmentSubmissionService {
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

    const doc = await AssessmentQuestionModel.findOneAndUpdate(
      { questionId: question.questionId },
      {
        ...question,
        userId,
        sessionId: sessionId || question.metadata?.sessionId,
        assessmentId: assessmentId || question.metadata?.assessmentId,
      },
      { upsert: true, new: true }
    );

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

  /**
   * Retrieves a stored server-side AssessmentQuestion with tenant check.
   */
  async getQuestion(questionId: string, userId?: string): Promise<AssessmentQuestion | null> {
    const query: any = { questionId };
    if (userId) {
      query.userId = userId;
    }

    const doc = await AssessmentQuestionModel.findOne(query);
    if (!doc) {
      return null;
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
  }

  /**
   * Submits a student answer with strict validation, duplicate prevention, and non-blocking background AI evaluation.
   */
  async submitAnswer(
    userId: string,
    questionId: string,
    submissionReq: AssessmentSubmissionRequest,
    options?: {
      assessmentId?: string;
      sessionId?: string;
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

    // 4. Duplicate submission protection: Check if student already submitted this question
    const existingSubmission = await AssessmentSubmissionModel.findOne({
      userId,
      questionId,
    });

    if (existingSubmission) {
      console.info(`[AssessmentSubmission] Idempotent hit: returning existing submission for question ${questionId}`);
      return this.toSubmissionEntity(existingSubmission);
    }

    // 5. Initial creation
    const newDoc = await AssessmentSubmissionModel.create({
      userId,
      questionId,
      assessmentId: options?.assessmentId || serverQuestion.metadata?.assessmentId,
      sessionId: options?.sessionId || serverQuestion.metadata?.sessionId,
      questionType: serverQuestion.questionType,
      evaluationMode: serverQuestion.evaluationMode,
      selectedOption: validatedRequest.selectedOption,
      answer: validatedRequest.answer,
      imageReference: validatedRequest.imageReference,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    });

    const initialEntity = this.toSubmissionEntity(newDoc);

    // 6. Evaluation triggering:
    if (serverQuestion.questionType === 'MCQ') {
      // MCQ is deterministic and synchronous (0ms overhead)
      await assessmentEvaluatorService.evaluateSubmission(
        userId,
        serverQuestion,
        initialEntity,
        options
      );
      const updated = await AssessmentSubmissionModel.findById(newDoc._id);
      return this.toSubmissionEntity(updated);
    } else {
      // Non-blocking asynchronous background evaluation for Text, Numerical, and Image Solution
      this.triggerEvaluation(userId, questionId, options).catch((err) => {
        console.error(`[AssessmentSubmission] Background evaluation failed for question ${questionId}:`, err);
      });
      return initialEntity;
    }
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
    }
  ): Promise<EvaluationResult> {
    const serverQuestion = await this.getQuestion(questionId, userId);
    if (!serverQuestion) {
      throw new Error('Question not found or unauthorized access');
    }

    // Atomic lock: Transition SUBMITTED -> EVALUATING
    const lockedDoc = await AssessmentSubmissionModel.findOneAndUpdate(
      {
        userId,
        questionId,
        status: { $in: ['SUBMITTED', 'FAILED', 'NEEDS_REVIEW'] },
      },
      {
        status: 'EVALUATING',
      },
      { new: true }
    );

    let submissionDoc = lockedDoc;
    if (!submissionDoc) {
      submissionDoc = await AssessmentSubmissionModel.findOne({ userId, questionId });
      if (!submissionDoc) {
        throw new Error('No submission found to evaluate');
      }
      if (submissionDoc.status === 'EVALUATED' && submissionDoc.evaluation) {
        return submissionDoc.evaluation as EvaluationResult;
      }
      if (submissionDoc.status === 'EVALUATING') {
        console.info(`[AssessmentSubmission] Evaluation already in progress for question ${questionId}`);
      }
    }

    const submissionEntity = this.toSubmissionEntity(submissionDoc);

    try {
      const evaluationResult = await assessmentEvaluatorService.evaluateSubmission(
        userId,
        serverQuestion,
        submissionEntity,
        options
      );

      return evaluationResult;
    } catch (err: any) {
      console.error(`[AssessmentSubmission] Evaluation processing error for question ${questionId}:`, err);
      await AssessmentSubmissionModel.findOneAndUpdate(
        { userId, questionId },
        {
          status: 'FAILED',
          feedback: 'We could not evaluate this answer right now. Your submission is saved. Please try again.',
        }
      );
      throw err;
    }
  }

  /**
   * Retrieves a student's submission for a question.
   */
  async getSubmission(userId: string, questionId: string): Promise<AssessmentSubmission | null> {
    const doc = await AssessmentSubmissionModel.findOne({ userId, questionId });
    if (!doc) {
      return null;
    }
    return this.toSubmissionEntity(doc);
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
      score: typeof doc.score === 'number' ? doc.score : undefined,
      feedback: doc.feedback,
      evaluation: doc.evaluation || undefined,
      metadata: doc.metadata,
    });
  }
}

export const assessmentSubmissionService = new AssessmentSubmissionService();
