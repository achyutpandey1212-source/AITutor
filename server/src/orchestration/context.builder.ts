import type { ConversationContext } from './conversation.types.js';
import { defaultSessionMemoryService } from '../memory/session-memory.service.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';

export class ContextBuilder {
  /**
   * Constructs a compact, focused context object without dumping unbounded histories.
   */
  async buildContext(sessionId: string): Promise<ConversationContext | null> {
    const sessionDoc = await TeachingSessionModel.findById(sessionId).lean();
    if (!sessionDoc) return null;

    const memory = await defaultSessionMemoryService.getSessionMemory(sessionId);
    const lastSeg = memory.segments.length > 0 ? memory.segments[memory.segments.length - 1] : undefined;

    // Extract recent 6 turns for immediate pedagogical recency
    const recentHistory = (sessionDoc.conversationHistory || []).slice(-6).map((turn: any) => ({
      role: turn.role,
      text: turn.text,
      timestamp: turn.timestamp instanceof Date ? turn.timestamp.toISOString() : String(turn.timestamp),
    }));

    return {
      sessionId,
      topic: sessionDoc.topic || 'Lesson',
      subject: sessionDoc.subject || 'General',
      language: sessionDoc.language || 'english',
      currentConcept: sessionDoc.currentConcept || lastSeg?.concept || sessionDoc.topic,
      recentTurns: recentHistory,
      conceptsCovered: memory.conceptsCovered,
      currentVisualType: lastSeg?.visualBeats?.[0]?.type,
      currentVisualData: lastSeg?.visualBeats?.[0]?.data,
      currentVisualPlan: lastSeg?.visualPlan,
      lastTeachingSegment: lastSeg,
      assessmentState: {
        isActive: sessionDoc.currentMode === 'ASSESSMENT',
        currentQuestionId: sessionDoc.currentQuestionId,
        assessmentSessionId: sessionDoc.assessmentSessionId,
      },
      teachingState: sessionDoc.teachingState || {
        currentConcept: sessionDoc.topic,
        understanding: 'developing',
        confidence: 0.5,
        misconceptions: [],
        conceptsMastered: [],
        conceptsNeedingWork: [],
        lastStudentAction: 'unknown',
        recommendedNextAction: 'explain',
      },
    };
  }
}

export const defaultContextBuilder = new ContextBuilder();
