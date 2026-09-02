import mongoose from 'mongoose';
import {
  AssessmentBookmark,
  AssessmentBookmarkSchema,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { AssessmentBookmarkModel } from '../models/assessment-bookmark.model.js';
import { AssessmentQuestionModel } from '../models/assessment-question.model.js';

export class AssessmentBookmarkService {
  private inMemoryBookmarks = new Map<string, AssessmentBookmark>();

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private getCompositeKey(userId: string, questionId: string): string {
    return `${userId}__${questionId}`;
  }

  /**
   * Bookmarks a question idempotently.
   */
  async bookmarkQuestion(
    userId: string,
    questionId: string,
    notes?: string
  ): Promise<AssessmentBookmark> {
    const bookmarkId = `bmk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const bookmarkData: AssessmentBookmark = {
      id: bookmarkId,
      userId,
      questionId,
      savedAt: now,
      notes,
    };

    const validated = AssessmentBookmarkSchema.parse(bookmarkData);

    if (this.isMongoConnected()) {
      try {
        await AssessmentBookmarkModel.findOneAndUpdate(
          { userId, questionId },
          {
            $setOnInsert: {
              _id: bookmarkId,
              userId,
              questionId,
              savedAt: new Date(),
            },
            $set: { notes, updatedAt: new Date() },
          },
          { upsert: true, new: true }
        );
      } catch {
        this.inMemoryBookmarks.set(this.getCompositeKey(userId, questionId), validated);
      }
    } else {
      this.inMemoryBookmarks.set(this.getCompositeKey(userId, questionId), validated);
    }

    return validated;
  }

  /**
   * Removes a bookmark.
   */
  async unbookmarkQuestion(userId: string, questionId: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      try {
        const res = await AssessmentBookmarkModel.deleteOne({ userId, questionId });
        if (res && res.deletedCount && res.deletedCount > 0) {
          return true;
        }
      } catch {
        // fallback
      }
    }

    const key = this.getCompositeKey(userId, questionId);
    if (this.inMemoryBookmarks.has(key)) {
      this.inMemoryBookmarks.delete(key);
      return true;
    }

    return false;
  }

  /**
   * Checks if a question is bookmarked by a user.
   */
  async isBookmarked(userId: string, questionId: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      try {
        const exists = await AssessmentBookmarkModel.exists({ userId, questionId });
        if (exists) return true;
      } catch {
        // fallback
      }
    }

    return this.inMemoryBookmarks.has(this.getCompositeKey(userId, questionId));
  }

  /**
   * Gets all bookmarks for a user, populated with question data.
   */
  async getBookmarks(userId: string): Promise<AssessmentBookmark[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await AssessmentBookmarkModel.find({ userId })
          .sort({ createdAt: -1 })
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

            return AssessmentBookmarkSchema.parse({
              id: (doc as any)._id?.toString() || (doc as any).id,
              userId: doc.userId,
              questionId: doc.questionId,
              savedAt: doc.savedAt ? new Date(doc.savedAt).toISOString() : new Date().toISOString(),
              notes: doc.notes,
              question: sanitizedQ,
            });
          });
        }
      } catch {
        // fallback
      }
    }

    return Array.from(this.inMemoryBookmarks.values()).filter((b) => b.userId === userId);
  }
}

export const assessmentBookmarkService = new AssessmentBookmarkService();
