import type {
  ConceptMemory,
  ReplaySegment,
  SessionMemory,
} from '@ai-tutor/shared';
import { IReplayRepository, defaultReplayRepository } from './replay.repository.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';

export class SessionMemoryService {
  constructor(private replayRepo: IReplayRepository = defaultReplayRepository) {}

  /**
   * Builds full session memory summary including covered concepts and replayable segments.
   */
  async getSessionMemory(sessionId: string): Promise<SessionMemory> {
    const segments = await this.replayRepo.getSessionSegments(sessionId);

    // Query session doc for metadata if available
    let topic = 'AI Tutor Classroom';
    let subject = 'General';
    let startedAt = new Date().toISOString();
    let updatedAt = startedAt;

    try {
      const sessionDoc = await TeachingSessionModel.findById(sessionId).lean();
      if (sessionDoc) {
        topic = sessionDoc.topic || topic;
        subject = sessionDoc.subject || subject;
        startedAt = sessionDoc.createdAt instanceof Date ? sessionDoc.createdAt.toISOString() : String(sessionDoc.createdAt);
        updatedAt = sessionDoc.updatedAt instanceof Date ? sessionDoc.updatedAt.toISOString() : String(sessionDoc.updatedAt);
      }
    } catch {
      // Graceful fallback if not mongoose ObjectId
    }

    const conceptsCovered: string[] = [];
    const seenConcepts = new Set<string>();
    let totalDurationMs = 0;

    for (const seg of segments) {
      if (seg.concept && !seenConcepts.has(seg.concept)) {
        seenConcepts.add(seg.concept);
        conceptsCovered.push(seg.concept);
      }
      totalDurationMs += seg.durationMs || 5000;
    }

    return {
      sessionId,
      topic,
      subject,
      conceptsCovered,
      segments,
      totalDurationMs,
      startedAt,
      updatedAt,
    };
  }

  /**
   * Returns all teaching segments associated with a particular concept.
   */
  async getConceptHistory(sessionId: string, conceptId: string): Promise<ConceptMemory> {
    const segments = await this.replayRepo.getByConcept(sessionId, conceptId);
    const keyFormulas: string[] = [];

    for (const seg of segments) {
      for (const beat of seg.visualBeats || []) {
        if (beat.type === 'FORMULA' && beat.data?.formula) {
          keyFormulas.push(beat.data.formula);
        }
      }
    }

    return {
      conceptId,
      conceptTitle: segments[0]?.concept || conceptId,
      segmentIds: segments.map((s) => s.segmentId),
      segments,
      keyFormulas: Array.from(new Set(keyFormulas)),
      firstExplainedAt: segments[0]?.createdAt,
      lastExplainedAt: segments[segments.length - 1]?.createdAt,
    };
  }

  /**
   * Searches for segments in the session matching a keyword or phrase.
   */
  async findRelevantSegments(sessionId: string, query: string): Promise<ReplaySegment[]> {
    return this.replayRepo.search(sessionId, query);
  }

  /**
   * Retrieves the most recently explained concept segment in the session.
   */
  async getLastExplainedConcept(sessionId: string): Promise<ReplaySegment | null> {
    const segments = await this.replayRepo.getSessionSegments(sessionId);
    if (segments.length === 0) return null;
    return segments[segments.length - 1];
  }

  /**
   * Retrieves a specific segment by ID.
   */
  async getReplaySegment(segmentId: string): Promise<ReplaySegment | null> {
    return this.replayRepo.getById(segmentId);
  }
}

export const defaultSessionMemoryService = new SessionMemoryService();
