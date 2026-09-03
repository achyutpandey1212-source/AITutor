import {
  VisualHistoryEntry,
  VisualSessionTimeline,
  VisualTimelineEntry,
  VisualPlan,
} from '@ai-tutor/shared';
import { VisualHistoryModel } from '../models/visual-history.model.js';

export class VisualHistoryService {
  /**
   * Persists a visual history record for a completed teaching turn.
   */
  async recordVisualTurn(params: {
    sessionId: string;
    turnId: string;
    conceptId?: string;
    visualPlan: VisualPlan;
    speechText?: string;
    displayText?: string;
    captionText?: string;
    durationMs?: number;
  }): Promise<VisualHistoryEntry> {
    const { sessionId, turnId, conceptId, visualPlan, speechText, displayText, captionText, durationMs } = params;
    const visualId = `vis_${sessionId}_${turnId}_${Date.now().toString(36)}`;

    const entry: VisualHistoryEntry = {
      visualId,
      sessionId,
      turnId,
      conceptId: conceptId || visualPlan.conceptId,
      strategy: visualPlan.strategy,
      beats: visualPlan.beats,
      assetIds: visualPlan.assetIds || [],
      createdAt: new Date().toISOString(),
      durationMs: durationMs || visualPlan.beats.reduce((s, b) => s + (b.durationHint || 5000), 0),
      replayable: true,
      speechText,
      displayText,
      captionText,
    };

    try {
      await VisualHistoryModel.create({
        ...entry,
        createdAt: new Date(entry.createdAt),
      });
    } catch (err) {
      console.warn('[VisualHistoryService] Warning persisting to Mongo, keeping memory entry:', err);
    }

    return entry;
  }

  /**
   * Retrieves all visual history entries for a given session.
   */
  async getSessionVisualHistory(sessionId: string): Promise<VisualHistoryEntry[]> {
    try {
      const docs = await VisualHistoryModel.find({ sessionId }).sort({ createdAt: 1 }).lean();
      return docs.map((d: any) => ({
        visualId: d.visualId,
        sessionId: d.sessionId,
        turnId: d.turnId,
        conceptId: d.conceptId,
        strategy: d.strategy,
        beats: d.beats,
        assetIds: d.assetIds || [],
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
        durationMs: d.durationMs,
        replayable: d.replayable !== undefined ? d.replayable : true,
        speechText: d.speechText,
        displayText: d.displayText,
        captionText: d.captionText,
      }));
    } catch (err) {
      console.warn('[VisualHistoryService] Error querying MongoDB:', err);
      return [];
    }
  }

  /**
   * Retrieves a single visual history entry by visualId.
   */
  async getVisualHistoryEntry(visualId: string): Promise<VisualHistoryEntry | null> {
    try {
      const doc = await VisualHistoryModel.findOne({ visualId }).lean();
      if (!doc) return null;
      const d: any = doc;
      return {
        visualId: d.visualId,
        sessionId: d.sessionId,
        turnId: d.turnId,
        conceptId: d.conceptId,
        strategy: d.strategy,
        beats: d.beats,
        assetIds: d.assetIds || [],
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
        durationMs: d.durationMs,
        replayable: d.replayable !== undefined ? d.replayable : true,
        speechText: d.speechText,
        displayText: d.displayText,
        captionText: d.captionText,
      };
    } catch (err) {
      console.warn('[VisualHistoryService] Error querying MongoDB entry:', err);
      return null;
    }
  }

  /**
   * Generates a structured timeline of visual progression for a session.
   */
  async getSessionTimeline(sessionId: string): Promise<VisualSessionTimeline> {
    const history = await this.getSessionVisualHistory(sessionId);

    const entries: VisualTimelineEntry[] = history.map((h) => ({
      visualId: h.visualId,
      turnId: h.turnId,
      conceptId: h.conceptId,
      startedAt: h.createdAt,
      strategy: h.strategy,
      beatCount: h.beats.length,
      title: h.beats[0]?.data?.title || h.conceptId || 'Visual Segment',
      firstBeatType: h.beats[0]?.type,
    }));

    return {
      sessionId,
      entries,
    };
  }

  /**
   * Returns deterministic replay payload for a specific visualId without re-calling the LLM.
   */
  async getReplayPayload(visualId: string) {
    const entry = await this.getVisualHistoryEntry(visualId);
    if (!entry) return null;

    return {
      visualId: entry.visualId,
      turnId: entry.turnId,
      conceptId: entry.conceptId,
      strategy: entry.strategy,
      speechText: entry.speechText,
      displayText: entry.displayText,
      captionText: entry.captionText,
      visualBeats: entry.beats,
      initialVisual: entry.beats[0]
        ? { type: entry.beats[0].type, data: entry.beats[0].data }
        : undefined,
    };
  }
}

export const defaultVisualHistoryService = new VisualHistoryService();
