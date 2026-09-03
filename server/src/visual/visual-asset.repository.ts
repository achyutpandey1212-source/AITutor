import {
  VisualAsset,
  VisualAssetSchema,
  VisualAssetSource,
} from '@ai-tutor/shared';

export interface VisualAssetSearchQuery {
  concept?: string;
  topic?: string;
  keywords?: string[];
  visualType?: string;
  documentId?: string;
  limit?: number;
}

export interface IVisualAssetRepository {
  getAsset(assetId: string): Promise<VisualAsset | null>;
  saveAsset(asset: VisualAsset): Promise<VisualAsset>;
  searchAssets(query: VisualAssetSearchQuery): Promise<VisualAsset[]>;
  listByDocument(documentId: string): Promise<VisualAsset[]>;
  listByConcept(conceptId: string): Promise<VisualAsset[]>;
}

/**
 * Pre-indexed Native Remotion Visual Assets.
 * These give the tutor a rich catalog of reusable native classroom visuals.
 */
export const NATIVE_REMOTION_ASSETS: VisualAsset[] = [
  {
    assetId: 'native:reflection-ray-diagram:v1',
    source: 'REMOTION_NATIVE',
    title: 'Law of Reflection Ray Diagram',
    description: 'Plane mirror with normal line, incident ray, reflected ray, and angle markers θi = θr',
    conceptIds: ['reflection', 'laws_of_reflection', 'light_reflection'],
    topic: 'Light: Reflection & Refraction',
    metadata: {
      visualType: 'DIAGRAM',
      recommendedBeats: 3,
      tags: ['physics', 'optics', 'reflection', 'snell', 'normal'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    assetId: 'native:snell-law-refraction:v1',
    source: 'REMOTION_NATIVE',
    title: "Snell's Law of Refraction Vector Diagram",
    description: 'Light ray travelling across media boundary with angles of incidence and refraction',
    conceptIds: ['refraction', 'snells_law', 'refractive_index'],
    topic: 'Light: Reflection & Refraction',
    metadata: {
      visualType: 'DIAGRAM',
      formula: 'n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)',
      tags: ['physics', 'optics', 'refraction', 'snell', 'medium'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    assetId: 'native:mirror-formula-setup:v1',
    source: 'REMOTION_NATIVE',
    title: 'Concave Mirror Optical Bench Diagram',
    description: 'Principal axis showing pole, focus, center of curvature, object distance u, image distance v',
    conceptIds: ['mirror_formula', 'spherical_mirrors', 'focal_length'],
    topic: 'Light: Reflection & Refraction',
    metadata: {
      visualType: 'DIAGRAM',
      formula: '1/f = 1/v + 1/u',
      tags: ['physics', 'optics', 'mirror', 'concave', 'focal'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    assetId: 'native:photosynthesis-flow:v1',
    source: 'REMOTION_NATIVE',
    title: 'Photosynthesis Biochemical Process Flow',
    description: 'Sunlight + Chlorophyll + Water + CO2 yielding Glucose and Oxygen',
    conceptIds: ['photosynthesis', 'autotrophic_nutrition', 'chlorophyll'],
    topic: 'Life Processes',
    metadata: {
      visualType: 'FLOWCHART',
      tags: ['biology', 'chlorophyll', 'plants', 'energy', 'glucose'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    assetId: 'native:convex-lens-refraction:v1',
    source: 'REMOTION_NATIVE',
    title: 'Convex Lens Image Formation',
    description: 'Parallel incident rays converging at principal focus',
    conceptIds: ['lenses', 'convex_lens', 'lens_formula'],
    topic: 'Light: Reflection & Refraction',
    metadata: {
      visualType: 'PROCESS_ANIMATION',
      tags: ['physics', 'optics', 'lens', 'convex', 'converging'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Storage-agnostic Visual Asset Repository.
 * Can store in-memory, query MongoDB, or serve as a gateway to cloud providers.
 */
export class InMemoryVisualAssetRepository implements IVisualAssetRepository {
  private assets: Map<string, VisualAsset> = new Map();

  constructor(initialAssets: VisualAsset[] = NATIVE_REMOTION_ASSETS) {
    for (const asset of initialAssets) {
      this.assets.set(asset.assetId, VisualAssetSchema.parse(asset));
    }
  }

  async getAsset(assetId: string): Promise<VisualAsset | null> {
    return this.assets.get(assetId) || null;
  }

  async saveAsset(asset: VisualAsset): Promise<VisualAsset> {
    const validated = VisualAssetSchema.parse(asset);
    this.assets.set(validated.assetId, validated);
    return validated;
  }

  async searchAssets(query: VisualAssetSearchQuery): Promise<VisualAsset[]> {
    const limit = query.limit || 10;
    const results: { asset: VisualAsset; score: number }[] = [];

    const queryTokens = [
      ...(query.concept ? query.concept.toLowerCase().split(/[_\s-]+/) : []),
      ...(query.topic ? query.topic.toLowerCase().split(/[_\s-]+/) : []),
      ...(query.keywords ? query.keywords.map((k) => k.toLowerCase()) : []),
    ].filter((t) => t.length > 2);

    for (const asset of this.assets.values()) {
      let score = 0;

      // Match document filter
      if (query.documentId && asset.documentId && asset.documentId !== query.documentId) {
        continue;
      }

      // Check concept ID match
      if (query.concept) {
        const cLower = query.concept.toLowerCase();
        if (asset.conceptIds.some((cid) => cid.toLowerCase().includes(cLower) || cLower.includes(cid.toLowerCase()))) {
          score += 15;
        }
      }

      // Check visual type match
      if (query.visualType && asset.metadata?.visualType === query.visualType) {
        score += 5;
      }

      // Match tokens against title, description, topic
      const titleLower = asset.title.toLowerCase();
      const descLower = (asset.description || '').toLowerCase();
      const topicLower = (asset.topic || '').toLowerCase();

      for (const token of queryTokens) {
        if (titleLower.includes(token)) score += 4;
        if (topicLower.includes(token)) score += 3;
        if (descLower.includes(token)) score += 2;
      }

      if (score > 0) {
        results.push({ asset, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map((r) => r.asset);
  }

  async listByDocument(documentId: string): Promise<VisualAsset[]> {
    return Array.from(this.assets.values()).filter((a) => a.documentId === documentId);
  }

  async listByConcept(conceptId: string): Promise<VisualAsset[]> {
    const cLower = conceptId.toLowerCase();
    return Array.from(this.assets.values()).filter((a) =>
      a.conceptIds.some((cid) => cid.toLowerCase().includes(cLower) || cLower.includes(cid.toLowerCase()))
    );
  }

  /**
   * Clears or re-initializes (useful in test environments)
   */
  reset(initialAssets: VisualAsset[] = NATIVE_REMOTION_ASSETS) {
    this.assets.clear();
    for (const asset of initialAssets) {
      this.assets.set(asset.assetId, VisualAssetSchema.parse(asset));
    }
  }
}

export const defaultVisualAssetRepository = new InMemoryVisualAssetRepository();
