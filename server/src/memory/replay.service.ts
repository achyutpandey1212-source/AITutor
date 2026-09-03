import type { ReplayResponse, ReplaySegment, VisualBeat } from '@ai-tutor/shared';
import { IReplayRepository, defaultReplayRepository } from './replay.repository.js';
import { defaultVisualAssetRepository } from '../visual/visual-asset.repository.js';

export class ReplayService {
  constructor(private replayRepo: IReplayRepository = defaultReplayRepository) {}

  /**
   * Reconstructs the exact teaching experience without calling any LLM.
   * Resolves referenced asset IDs to ensure visual continuity.
   */
  async replaySegment(segmentId: string): Promise<ReplayResponse | null> {
    const segment = await this.replayRepo.getById(segmentId);
    if (!segment || !segment.replayable) return null;

    // Resolve referenced visual assets if present
    const resolvedBeats: VisualBeat[] = [];
    for (const beat of segment.visualBeats || []) {
      const beatCopy: VisualBeat = { ...beat, data: { ...(beat.data || {}) } };
      const targetAssetId = beatCopy.assetId || (segment.assetIds && segment.assetIds[0]);
      if (targetAssetId) {
        try {
          const asset = await defaultVisualAssetRepository.getAsset(targetAssetId);
          if (asset && beatCopy.data) {
            if (asset.url) beatCopy.data.assetUrl = asset.url;
            beatCopy.data.assetId = asset.assetId;
          }
        } catch {
          // Graceful fallback: maintain existing beat data without failing replay
        }
      }
      resolvedBeats.push(beatCopy);
    }

    return {
      segment: {
        ...segment,
        visualBeats: resolvedBeats,
      },
      deterministic: true,
      mode: 'DETERMINISTIC',
      speechText: segment.speechText,
      displayText: segment.displayText,
      captionText: segment.captionText,
      visualBeats: resolvedBeats,
      turnId: segment.turnId,
      concept: segment.concept,
      message: `Replaying explanation for ${segment.concept}`,
    };
  }

  /**
   * Replays the latest segment for a given concept in a session.
   */
  async replayConcept(sessionId: string, conceptId: string): Promise<ReplayResponse | null> {
    const segments = await this.replayRepo.getByConcept(sessionId, conceptId);
    if (segments.length === 0) return null;
    const latestSegment = segments[segments.length - 1];
    return this.replaySegment(latestSegment.segmentId);
  }

  /**
   * Saves a new replayable teaching segment.
   */
  async saveSegment(segment: ReplaySegment): Promise<ReplaySegment> {
    return this.replayRepo.save(segment);
  }
}

export const defaultReplayService = new ReplayService();
