import mongoose from 'mongoose';
import {
  AssessmentQuestion,
  AssessmentSubmission,
  EvaluationResult,
  WrongAssessmentQuestion,
  WrongAssessmentQuestionSchema,
  WrongQuestionReviewStatus,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { WrongAssessmentQuestionModel } from '../models/wrong-assessment-question.model.js';
import { AssessmentQuestionModel } from '../models/assessment-question.model.js';

export interface WrongReviewPolicyConfig {
  intervalsMs: number[];
  masteryPercentageThreshold: number;
}

export const DEFAULT_WRONG_REVIEW_POLICY: WrongReviewPolicyConfig = {
  intervalsMs: [
    3 * 24 * 60 * 60 * 1000, // 3 days for 1st failed attempt
    7 * 24 * 60 * 60 * 1000, // 7 days for 2nd+ failed attempts
  ],
  masteryPercentageThreshold: 75,
};

export class WrongQuestionService {
  private policy: WrongReviewPolicyConfig;
  private inMemoryWrongQuestions = new Map<string, WrongAssessmentQuestion>();

  constructor(customPolicy?: Partial<WrongReviewPolicyConfig>) {
    this.policy = {
      ...DEFAULT_WRONG_REVIEW_POLICY,
      ...customPolicy,
    };
  }

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private getCompositeKey(userId: string, questionId: string): string {
    return `${userId}__${questionId}`;
  }

  /**
   * Records or updates a wrong question record when a student makes an error.
   */
  async recordWrongQuestion(
    userId: string,
    question: AssessmentQuestion,
    submission: AssessmentSubmission,
    evaluation: EvaluationResult
  ): Promise<WrongAssessmentQuestion | null> {
    // Low confidence / review-needed submissions must NOT be added to wrong question pool
    if (
      evaluation.evaluationStatus === 'NEEDS_REVIEW' ||
      evaluation.confidence < 0.5 ||
      (evaluation.failureReason && evaluation.failureReason !== 'NONE')
    ) {
      return null;
    }

    // Only record if score is below the threshold
    if (evaluation.percentage >= this.policy.masteryPercentageThreshold && evaluation.correct) {
      return null;
    }

    const key = this.getCompositeKey(userId, question.questionId);
    let existing = await this.getWrongQuestion(userId, question.questionId);

    const now = new Date();
    const attemptCount = existing ? existing.attemptCount + 1 : 1;
    const intervalIdx = Math.min(attemptCount - 1, this.policy.intervalsMs.length - 1);
    const nextReviewAt = new Date(now.getTime() + this.policy.intervalsMs[intervalIdx]);

    const weakSkills: string[] = [];
    if (evaluation.conceptAssessment) {
      if (evaluation.conceptAssessment.understanding === 'weak') weakSkills.push('understanding');
      if (evaluation.conceptAssessment.methodSelection === 'weak') weakSkills.push('method_selection');
      if (evaluation.conceptAssessment.calculation === 'weak') weakSkills.push('calculation');
      if (evaluation.conceptAssessment.completeness === 'weak') weakSkills.push('completeness');
      if (evaluation.conceptAssessment.reasoning === 'weak') weakSkills.push('reasoning');
    }

    const wrongData: WrongAssessmentQuestion = {
      id: existing?.id || `wrg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      questionId: question.questionId,
      submissionId: submission.id,
      subject: question.subject,
      concept: question.concept,
      difficulty: question.difficulty,
      questionType: question.questionType,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      misconceptions: evaluation.misconceptions || [],
      weakSkills,
      attemptCount,
      firstFailedAt: existing ? existing.firstFailedAt : now.toISOString(),
      lastAttemptedAt: now.toISOString(),
      nextReviewAt: nextReviewAt.toISOString(),
      reviewStatus: 'SCHEDULED',
    };

    const validated = WrongAssessmentQuestionSchema.parse(wrongData);

    if (this.isMongoConnected()) {
      try {
        await WrongAssessmentQuestionModel.findOneAndUpdate(
          { userId, questionId: question.questionId },
          {
            $setOnInsert: {
              _id: validated.id,
              firstFailedAt: new Date(validated.firstFailedAt),
            },
            $set: {
              submissionId: validated.submissionId,
              subject: validated.subject,
              concept: validated.concept,
              difficulty: validated.difficulty,
              questionType: validated.questionType,
              score: validated.score,
              maxScore: validated.maxScore,
              percentage: validated.percentage,
              misconceptions: validated.misconceptions,
              weakSkills: validated.weakSkills,
              attemptCount: validated.attemptCount,
              lastAttemptedAt: new Date(validated.lastAttemptedAt),
              nextReviewAt: new Date(validated.nextReviewAt!),
              reviewStatus: 'SCHEDULED',
            },
          },
          { upsert: true, new: true }
        );
      } catch {
        this.inMemoryWrongQuestions.set(key, validated);
      }
    } else {
      this.inMemoryWrongQuestions.set(key, validated);
    }

    return validated;
  }

  /**
   * Resolves a wrong question record to MASTERED upon a successful reattempt.
   */
  async resolveCorrectReattempt(userId: string, questionId: string): Promise<boolean> {
    const key = this.getCompositeKey(userId, questionId);
    if (this.isMongoConnected()) {
      try {
        const res = await WrongAssessmentQuestionModel.updateOne(
          { userId, questionId },
          {
            $set: {
              reviewStatus: 'MASTERED',
              lastAttemptedAt: new Date(),
            },
          }
        );
        if (res && res.modifiedCount && res.modifiedCount > 0) {
          return true;
        }
      } catch {
        // fallback
      }
    }

    const inMem = this.inMemoryWrongQuestions.get(key);
    if (inMem) {
      inMem.reviewStatus = 'MASTERED';
      inMem.lastAttemptedAt = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Retrieves a single wrong question state.
   */
  async getWrongQuestion(userId: string, questionId: string): Promise<WrongAssessmentQuestion | null> {
    if (this.isMongoConnected()) {
      try {
        const doc = await WrongAssessmentQuestionModel.findOne({ userId, questionId }).lean();
        if (doc) {
          return WrongAssessmentQuestionSchema.parse({
            id: (doc as any)._id?.toString() || (doc as any).id,
            userId: doc.userId,
            questionId: doc.questionId,
            submissionId: doc.submissionId,
            subject: doc.subject,
            concept: doc.concept,
            difficulty: doc.difficulty,
            questionType: doc.questionType,
            score: doc.score,
            maxScore: doc.maxScore,
            percentage: doc.percentage,
            misconceptions: doc.misconceptions || [],
            weakSkills: doc.weakSkills || [],
            attemptCount: doc.attemptCount,
            firstFailedAt: doc.firstFailedAt ? new Date(doc.firstFailedAt).toISOString() : new Date().toISOString(),
            lastAttemptedAt: doc.lastAttemptedAt ? new Date(doc.lastAttemptedAt).toISOString() : new Date().toISOString(),
            nextReviewAt: doc.nextReviewAt ? new Date(doc.nextReviewAt).toISOString() : undefined,
            reviewStatus: doc.reviewStatus as WrongQuestionReviewStatus,
          });
        }
      } catch {
        // fallback
      }
    }

    return this.inMemoryWrongQuestions.get(this.getCompositeKey(userId, questionId)) || null;
  }

  /**
   * Lists wrong questions for a user, optionally filtered by review status.
   */
  async getWrongQuestions(
    userId: string,
    status?: WrongQuestionReviewStatus
  ): Promise<WrongAssessmentQuestion[]> {
    if (this.isMongoConnected()) {
      try {
        const query: any = { userId };
        if (status) {
          query.reviewStatus = status;
        } else {
          query.reviewStatus = { $in: ['ACTIVE', 'SCHEDULED'] };
        }

        const docs = await WrongAssessmentQuestionModel.find(query)
          .sort({ nextReviewAt: 1, lastAttemptedAt: -1 })
          .lean();

        if (docs && docs.length > 0) {
          const questionIds = docs.map((d) => d.questionId);
          const questions = await AssessmentQuestionModel.find({
            questionId: { $in: questionIds },
          }).lean();

          const questionMap = new Map(questions.map((q) => [q.questionId, q]));

          return docs.map((doc) => {
            const rawQ = questionMap.get(doc.questionId);
            const sanitizedQ = rawQ ? sanitizeQuestionForClient(rawQ as any) : undefined;

            return WrongAssessmentQuestionSchema.parse({
              id: (doc as any)._id?.toString() || (doc as any).id,
              userId: doc.userId,
              questionId: doc.questionId,
              submissionId: doc.submissionId,
              subject: doc.subject,
              concept: doc.concept,
              difficulty: doc.difficulty,
              questionType: doc.questionType,
              score: doc.score,
              maxScore: doc.maxScore,
              percentage: doc.percentage,
              misconceptions: doc.misconceptions || [],
              weakSkills: doc.weakSkills || [],
              attemptCount: doc.attemptCount,
              firstFailedAt: doc.firstFailedAt ? new Date(doc.firstFailedAt).toISOString() : new Date().toISOString(),
              lastAttemptedAt: doc.lastAttemptedAt ? new Date(doc.lastAttemptedAt).toISOString() : new Date().toISOString(),
              nextReviewAt: doc.nextReviewAt ? new Date(doc.nextReviewAt).toISOString() : undefined,
              reviewStatus: doc.reviewStatus as WrongQuestionReviewStatus,
              question: sanitizedQ,
            });
          });
        }
      } catch {
        // fallback
      }
    }

    return Array.from(this.inMemoryWrongQuestions.values()).filter((w) => {
      if (w.userId !== userId) return false;
      if (status) return w.reviewStatus === status;
      return ['ACTIVE', 'SCHEDULED'].includes(w.reviewStatus);
    });
  }

  /**
   * Retrieves all questions that are due for review (nextReviewAt <= asOfDate).
   */
  async getDueReviews(
    userId: string,
    asOfDate: Date = new Date()
  ): Promise<WrongAssessmentQuestion[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await WrongAssessmentQuestionModel.find({
          userId,
          reviewStatus: { $in: ['ACTIVE', 'SCHEDULED'] },
          nextReviewAt: { $lte: asOfDate },
        })
          .sort({ nextReviewAt: 1 })
          .lean();

        if (docs && docs.length > 0) {
          const questionIds = docs.map((d) => d.questionId);
          const questions = await AssessmentQuestionModel.find({
            questionId: { $in: questionIds },
          }).lean();

          const questionMap = new Map(questions.map((q) => [q.questionId, q]));

          return docs.map((doc) => {
            const rawQ = questionMap.get(doc.questionId);
            const sanitizedQ = rawQ ? sanitizeQuestionForClient(rawQ as any) : undefined;

            return WrongAssessmentQuestionSchema.parse({
              id: (doc as any)._id?.toString() || (doc as any).id,
              userId: doc.userId,
              questionId: doc.questionId,
              submissionId: doc.submissionId,
              subject: doc.subject,
              concept: doc.concept,
              difficulty: doc.difficulty,
              questionType: doc.questionType,
              score: doc.score,
              maxScore: doc.maxScore,
              percentage: doc.percentage,
              misconceptions: doc.misconceptions || [],
              weakSkills: doc.weakSkills || [],
              attemptCount: doc.attemptCount,
              firstFailedAt: doc.firstFailedAt ? new Date(doc.firstFailedAt).toISOString() : new Date().toISOString(),
              lastAttemptedAt: doc.lastAttemptedAt ? new Date(doc.lastAttemptedAt).toISOString() : new Date().toISOString(),
              nextReviewAt: doc.nextReviewAt ? new Date(doc.nextReviewAt).toISOString() : undefined,
              reviewStatus: doc.reviewStatus as WrongQuestionReviewStatus,
              question: sanitizedQ,
            });
          });
        }
      } catch {
        // fallback
      }
    }

    const asOfISO = asOfDate.toISOString();
    return Array.from(this.inMemoryWrongQuestions.values()).filter((w) => {
      if (w.userId !== userId) return false;
      if (!['ACTIVE', 'SCHEDULED'].includes(w.reviewStatus)) return false;
      return w.nextReviewAt ? w.nextReviewAt <= asOfISO : true;
    });
  }
}

export const wrongQuestionService = new WrongQuestionService();
