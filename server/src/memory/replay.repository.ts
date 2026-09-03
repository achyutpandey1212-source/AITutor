import type { ReplaySegment } from '@ai-tutor/shared';
import { ReplaySegmentModel } from '../models/replay-segment.model.js';

export interface IReplayRepository {
  save(segment: ReplaySegment): Promise<ReplaySegment>;
  getById(segmentId: string): Promise<ReplaySegment | null>;
  getByTurnId(turnId: string): Promise<ReplaySegment | null>;
  getByConcept(sessionId: string, conceptId: string): Promise<ReplaySegment[]>;
  getSessionSegments(sessionId: string): Promise<ReplaySegment[]>;
  search(sessionId: string, query: string): Promise<ReplaySegment[]>;
}

export class MongoReplayRepository implements IReplayRepository {
  private inMemoryFallback: Map<string, ReplaySegment> = new Map();

  async save(segment: ReplaySegment): Promise<ReplaySegment> {
    this.inMemoryFallback.set(segment.segmentId, segment);
    try {
      await ReplaySegmentModel.findOneAndUpdate(
        { segmentId: segment.segmentId },
        {
          ...segment,
          createdAt: new Date(segment.createdAt),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[MongoReplayRepository] Failed to persist to Mongo, cached in memory:', err);
    }
    return segment;
  }

  async getById(segmentId: string): Promise<ReplaySegment | null> {
    try {
      const doc = await ReplaySegmentModel.findOne({ segmentId }).lean();
      if (doc) return this.mapDocToSegment(doc);
    } catch (err) {
      console.warn('[MongoReplayRepository] Error finding segment by ID:', err);
    }
    return this.inMemoryFallback.get(segmentId) || null;
  }

  async getByTurnId(turnId: string): Promise<ReplaySegment | null> {
    try {
      const doc = await ReplaySegmentModel.findOne({ turnId }).lean();
      if (doc) return this.mapDocToSegment(doc);
    } catch (err) {
      console.warn('[MongoReplayRepository] Error finding segment by turnId:', err);
    }
    for (const seg of this.inMemoryFallback.values()) {
      if (seg.turnId === turnId) return seg;
    }
    return null;
  }

  async getByConcept(sessionId: string, conceptId: string): Promise<ReplaySegment[]> {
    try {
      const docs = await ReplaySegmentModel.find({
        sessionId,
        $or: [
          { conceptId: new RegExp(`^${conceptId}$`, 'i') },
          { concept: new RegExp(conceptId, 'i') },
        ],
      })
        .sort({ createdAt: 1 })
        .lean();

      if (docs.length > 0) {
        return docs.map((d: any) => this.mapDocToSegment(d));
      }
    } catch (err) {
      console.warn('[MongoReplayRepository] Error finding segments by concept:', err);
    }

    const cLower = conceptId.toLowerCase();
    const fallbackList: ReplaySegment[] = [];
    for (const seg of this.inMemoryFallback.values()) {
      if (
        seg.sessionId === sessionId &&
        ((seg.conceptId && seg.conceptId.toLowerCase() === cLower) ||
          seg.concept.toLowerCase().includes(cLower))
      ) {
        fallbackList.push(seg);
      }
    }
    return fallbackList.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getSessionSegments(sessionId: string): Promise<ReplaySegment[]> {
    try {
      const docs = await ReplaySegmentModel.find({ sessionId }).sort({ createdAt: 1 }).lean();
      if (docs.length > 0) {
        return docs.map((d: any) => this.mapDocToSegment(d));
      }
    } catch (err) {
      console.warn('[MongoReplayRepository] Error finding session segments:', err);
    }

    const fallbackList: ReplaySegment[] = [];
    for (const seg of this.inMemoryFallback.values()) {
      if (seg.sessionId === sessionId) {
        fallbackList.push(seg);
      }
    }
    return fallbackList.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async search(sessionId: string, query: string): Promise<ReplaySegment[]> {
    const qLower = query.toLowerCase().trim();
    const all = await this.getSessionSegments(sessionId);
    return all.filter((s) => {
      return (
        s.concept.toLowerCase().includes(qLower) ||
        (s.title && s.title.toLowerCase().includes(qLower)) ||
        s.displayText.toLowerCase().includes(qLower) ||
        s.speechText.toLowerCase().includes(qLower) ||
        (s.conceptId && s.conceptId.toLowerCase().includes(qLower))
      );
    });
  }

  private mapDocToSegment(doc: any): ReplaySegment {
    return {
      segmentId: doc.segmentId,
      sessionId: doc.sessionId,
      turnId: doc.turnId,
      conceptId: doc.conceptId,
      concept: doc.concept,
      title: doc.title,
      speechText: doc.speechText,
      displayText: doc.displayText,
      captionText: doc.captionText,
      visualPlan: doc.visualPlan,
      visualBeats: doc.visualBeats || [],
      assetIds: doc.assetIds || [],
      durationMs: doc.durationMs,
      replayable: doc.replayable !== undefined ? doc.replayable : true,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    };
  }
}

export const defaultReplayRepository: IReplayRepository = new MongoReplayRepository();
