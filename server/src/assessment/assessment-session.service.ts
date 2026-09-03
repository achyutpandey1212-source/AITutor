import mongoose from 'mongoose';
import {
  AssessmentSession,
  AssessmentSessionSchema,
  AssessmentSessionStatus,
  CreateAssessmentSessionRequest,
} from '@ai-tutor/shared';
import { AssessmentSessionModel } from '../models/assessment-session.model.js';

export class AssessmentSessionService {
  private inMemorySessions = new Map<string, AssessmentSession>();

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Creates a new persistent assessment session.
   */
  async createSession(
    userId: string,
    req: CreateAssessmentSessionRequest
  ): Promise<AssessmentSession> {
    const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const sessionData: AssessmentSession = {
      id: sessionId,
      userId,
      subject: req.subject,
      grade: req.grade,
      topic: req.topic,
      concepts: req.concepts || [],
      goal: req.goal || 'practice',
      mode: req.mode || 'adaptive',
      startingDifficulty: req.startingDifficulty || 'medium',
      questionIds: [],
      attemptedQuestionCount: 0,
      correctCount: 0,
      totalMarks: 0,
      earnedMarks: 0,
      accuracy: 0,
      status: 'IN_PROGRESS',
      startedAt: now,
      lastActivityAt: now,
    };

    const validated = AssessmentSessionSchema.parse(sessionData);

    if (this.isMongoConnected()) {
      try {
        await AssessmentSessionModel.create({
          ...validated,
          sessionId,
        });
      } catch {
        this.inMemorySessions.set(sessionId, validated);
      }
    } else {
      this.inMemorySessions.set(sessionId, validated);
    }

    return validated;
  }

  /**
   * Retrieves a session by ID ensuring tenant isolation.
   */
  async getSession(userId: string, sessionId: string): Promise<AssessmentSession | null> {
    if (this.isMongoConnected()) {
      try {
        const doc = await AssessmentSessionModel.findOne({ sessionId, userId }).lean();
        if (doc) {
          return AssessmentSessionSchema.parse({
            id: doc.sessionId || (doc as any)._id?.toString() || (doc as any).id,
            userId: doc.userId,
            subject: doc.subject,
            grade: doc.grade,
            topic: doc.topic,
            concepts: doc.concepts || [],
            goal: doc.goal,
            mode: doc.mode,
            startingDifficulty: doc.startingDifficulty,
            currentQuestionId: doc.currentQuestionId,
            questionIds: doc.questionIds || [],
            attemptedQuestionCount: doc.attemptedQuestionCount || 0,
            correctCount: doc.correctCount || 0,
            totalMarks: doc.totalMarks || 0,
            earnedMarks: doc.earnedMarks || 0,
            accuracy: doc.accuracy || 0,
            status: doc.status as AssessmentSessionStatus,
            startedAt: doc.startedAt ? new Date(doc.startedAt).toISOString() : new Date().toISOString(),
            lastActivityAt: doc.lastActivityAt ? new Date(doc.lastActivityAt).toISOString() : new Date().toISOString(),
            completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : undefined,
            metadata: doc.metadata,
          });
        }
      } catch {
        // fallback
      }
    }

    const inMem = this.inMemorySessions.get(sessionId);
    if (inMem && inMem.userId === userId) {
      return inMem;
    }

    return null;
  }

  /**
   * Lists sessions for a user.
   */
  async listSessions(userId: string, limit = 20): Promise<AssessmentSession[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await AssessmentSessionModel.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        if (docs && docs.length > 0) {
          return docs.map((doc) =>
            AssessmentSessionSchema.parse({
              id: doc.sessionId || (doc as any)._id?.toString() || (doc as any).id,
              userId: doc.userId,
              subject: doc.subject,
              grade: doc.grade,
              topic: doc.topic,
              concepts: doc.concepts || [],
              goal: doc.goal,
              mode: doc.mode,
              startingDifficulty: doc.startingDifficulty,
              currentQuestionId: doc.currentQuestionId,
              questionIds: doc.questionIds || [],
              attemptedQuestionCount: doc.attemptedQuestionCount || 0,
              correctCount: doc.correctCount || 0,
              totalMarks: doc.totalMarks || 0,
              earnedMarks: doc.earnedMarks || 0,
              accuracy: doc.accuracy || 0,
              status: doc.status as AssessmentSessionStatus,
              startedAt: doc.startedAt ? new Date(doc.startedAt).toISOString() : new Date().toISOString(),
              lastActivityAt: doc.lastActivityAt ? new Date(doc.lastActivityAt).toISOString() : new Date().toISOString(),
              completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : undefined,
              metadata: doc.metadata,
            })
          );
        }
      } catch {
        // fallback
      }
    }

    return Array.from(this.inMemorySessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Links a new question ID to an active session.
   */
  async addQuestionToSession(
    userId: string,
    sessionId: string,
    questionId: string
  ): Promise<AssessmentSession | null> {
    const session = await this.getSession(userId, sessionId);
    if (!session) return null;

    if (!session.questionIds.includes(questionId)) {
      session.questionIds.push(questionId);
    }
    session.currentQuestionId = questionId;
    session.lastActivityAt = new Date().toISOString();

    if (this.isMongoConnected()) {
      try {
        await AssessmentSessionModel.updateOne(
          { sessionId, userId },
          {
            $addToSet: { questionIds: questionId },
            currentQuestionId: questionId,
            lastActivityAt: new Date(),
          }
        );
      } catch {
        this.inMemorySessions.set(sessionId, session);
      }
    } else {
      this.inMemorySessions.set(sessionId, session);
    }

    return session;
  }

  /**
   * Updates session metrics upon completing a question submission.
   */
  async updateSessionProgress(
    userId: string,
    sessionId: string,
    marksEarned: number,
    totalAvailableMarks: number,
    isCorrect: boolean
  ): Promise<AssessmentSession | null> {
    const session = await this.getSession(userId, sessionId);
    if (!session) return null;

    session.attemptedQuestionCount += 1;
    if (isCorrect) {
      session.correctCount += 1;
    }
    session.earnedMarks += marksEarned;
    session.totalMarks += totalAvailableMarks;
    session.accuracy = session.attemptedQuestionCount > 0
      ? Math.round((session.correctCount / session.attemptedQuestionCount) * 100)
      : 0;
    session.lastActivityAt = new Date().toISOString();

    if (this.isMongoConnected()) {
      try {
        await AssessmentSessionModel.updateOne(
          { sessionId, userId },
          {
            $inc: {
              attemptedQuestionCount: 1,
              correctCount: isCorrect ? 1 : 0,
              earnedMarks: marksEarned,
              totalMarks: totalAvailableMarks,
            },
            accuracy: session.accuracy,
            lastActivityAt: new Date(),
          }
        );
      } catch {
        this.inMemorySessions.set(sessionId, session);
      }
    } else {
      this.inMemorySessions.set(sessionId, session);
    }

    return session;
  }

  /**
   * Pauses an active session.
   */
  async pauseSession(userId: string, sessionId: string): Promise<AssessmentSession | null> {
    const session = await this.getSession(userId, sessionId);
    if (!session || session.status === 'COMPLETED') return null;

    session.status = 'PAUSED';
    session.lastActivityAt = new Date().toISOString();

    if (this.isMongoConnected()) {
      try {
        await AssessmentSessionModel.updateOne(
          { sessionId, userId },
          { status: 'PAUSED', lastActivityAt: new Date() }
        );
      } catch {
        this.inMemorySessions.set(sessionId, session);
      }
    } else {
      this.inMemorySessions.set(sessionId, session);
    }

    return session;
  }

  /**
   * Resumes a paused session.
   */
  async resumeSession(userId: string, sessionId: string): Promise<AssessmentSession | null> {
    const session = await this.getSession(userId, sessionId);
    if (!session || session.status === 'COMPLETED') return null;

    session.status = 'IN_PROGRESS';
    session.lastActivityAt = new Date().toISOString();

    if (this.isMongoConnected()) {
      try {
        await AssessmentSessionModel.updateOne(
          { sessionId, userId },
          { status: 'IN_PROGRESS', lastActivityAt: new Date() }
        );
      } catch {
        this.inMemorySessions.set(sessionId, session);
      }
    } else {
      this.inMemorySessions.set(sessionId, session);
    }

    return session;
  }

  /**
   * Completes a session.
   */
  async completeSession(userId: string, sessionId: string): Promise<AssessmentSession | null> {
    const session = await this.getSession(userId, sessionId);
    if (!session) return null;

    session.status = 'COMPLETED';
    session.completedAt = new Date().toISOString();
    session.lastActivityAt = session.completedAt;

    if (this.isMongoConnected()) {
      try {
        await AssessmentSessionModel.updateOne(
          { sessionId, userId },
          {
            status: 'COMPLETED',
            completedAt: new Date(),
            lastActivityAt: new Date(),
          }
        );
      } catch {
        this.inMemorySessions.set(sessionId, session);
      }
    } else {
      this.inMemorySessions.set(sessionId, session);
    }

    return session;
  }
}

export const assessmentSessionService = new AssessmentSessionService();
