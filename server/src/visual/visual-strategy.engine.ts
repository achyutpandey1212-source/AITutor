import {
  TeachingContent,
  TeachingState,
  TutorVisualType,
  VisualBeat,
  VisualPlan,
  VisualPlanSchema,
  VisualStrategy,
} from '@ai-tutor/shared';
import { VisualAssetSearchService, defaultVisualAssetSearchService } from './visual-asset.search.js';
import { ContentToVisualTransformer } from './content-to-visual.js';

export interface VisualStrategyContext {
  topic: string;
  concept?: string;
  teachingContent: TeachingContent;
  teachingState?: TeachingState;
  documentId?: string;
  turnId: string;
  // Recent visual strategies used in current session (for visual fatigue mitigation)
  recentStrategies?: VisualStrategy[];
}

/**
 * Visual Strategy Engine:
 * Decides "What is the best visual representation for what the teacher is currently teaching?"
 * Generates an intentional VisualPlan consisting of:
 * - Selected pedagogical strategy
 * - Justification reason
 * - Multi-beat visual sequence with paced duration hints
 * - Matched or referenced asset IDs
 */
export class VisualStrategyEngine {
  constructor(
    private assetSearch: VisualAssetSearchService = defaultVisualAssetSearchService
  ) {}

  async planVisual(context: VisualStrategyContext): Promise<VisualPlan> {
    const { topic, concept, teachingContent, teachingState, documentId, turnId, recentStrategies = [] } = context;
    const text = teachingContent.speechText || teachingContent.displayText || '';
    const conceptStr = (concept || topic || '').toLowerCase();

    // 1. Check for relevant visual assets first (document-grounded or pre-indexed native)
    const assetResult = await this.assetSearch.searchVisualAssets({
      concept,
      topic,
      documentId,
      limit: 3,
    });

    // 2. Determine optimal visual strategy based on concept semantics and text clues
    let strategy = this.selectStrategy({
      text,
      concept: conceptStr,
      recentStrategies,
      hasDocAsset: assetResult.sourceType === 'UPLOADED_DOCUMENT',
    });

    // 3. Build multi-beat sequence for the chosen strategy
    const beats = await this.generateBeatsForStrategy({
      strategy,
      concept: concept || topic,
      topic,
      text,
      turnId,
      assetResult,
    });

    const assetIds = assetResult.candidateAssets.map((a: any) => a.assetId);

    const plan: VisualPlan = {
      conceptId: concept,
      turnId,
      strategy,
      reason: this.getStrategyReason(strategy, concept || topic),
      beats,
      assetIds,
    };

    return VisualPlanSchema.parse(plan);
  }

  /**
   * Deterministic & context-aware strategy selection
   */
  private selectStrategy(params: {
    text: string;
    concept: string;
    recentStrategies: VisualStrategy[];
    hasDocAsset: boolean;
  }): VisualStrategy {
    const { text, concept, recentStrategies, hasDocAsset } = params;
    const combined = `${concept} ${text}`.toLowerCase();

    // If an uploaded document figure specifically matches the concept, prioritize it
    if (hasDocAsset && !recentStrategies.slice(-2).includes('PDF_ASSET')) {
      return 'PDF_ASSET';
    }

    // Mathematical problem or numerical calculation -> WORKED_EXAMPLE
    if (
      /numerical|calculate|solve|example problem|find the|given:|substituting/i.test(text) &&
      /=\s*[-+]?\d|sin\(/i.test(text)
    ) {
      return 'WORKED_EXAMPLE';
    }

    // Spatial/relational structure → DIAGRAM
    if (
      /diagram|structure|relationship|component|organ|system|network|parts of|anatomy|architecture|connected to|made of|consists of/i.test(combined) ||
      /reflection|ray|mirror|lens|surface|incident ray|reflected ray|normal line/i.test(combined)
    ) {
      if (!recentStrategies.slice(-2).includes('DIAGRAM')) {
        return 'DIAGRAM';
      }
    }

    // Pure mathematical formula or equation definition → FORMULA
    if (
      /formula|equation|law|theorem|rule|expression|derivation/i.test(concept) ||
      (text.includes('=') && /fraction|proportional|ratio|equation|derivative|integral/i.test(text)) ||
      /snell's law|mirror formula|lens formula|1\/f|sin\(i\)|refractive index/i.test(concept)
    ) {
      if (!recentStrategies.slice(-2).includes('FORMULA')) {
        return 'FORMULA';
      }
    }

    // Sequential process, cycle, stages, or steps -> FLOWCHART
    if (
      /photosynthesis|cycle|digest|stages|steps of|flow|pipeline|mechanism|pathway/i.test(combined) ||
      /first.*then.*finally|step 1|stage 1/i.test(text)
    ) {
      if (!recentStrategies.slice(-2).includes('FLOWCHART')) {
        return 'FLOWCHART';
      }
    }

    // Comparison, differences, or vs -> COMPARISON
    if (
      /versus|vs\b|difference between|compare|whereas|convex vs concave|reflection vs refraction/i.test(combined)
    ) {
      return 'COMPARISON';
    }

    // Dynamic movement, propagation, or wave transformation -> PROCESS_ANIMATION
    if (
      /entering|bends towards|bending of light|animation|movement|propagation|passes through/i.test(combined)
    ) {
      if (!recentStrategies.slice(-2).includes('PROCESS_ANIMATION')) {
        return 'PROCESS_ANIMATION';
      }
    }

    // Real world intuitive setup -> ILLUSTRATION
    if (
      /real world|straw in water|imagine|spoon|pool looks shallow|everyday life|analogy/i.test(combined)
    ) {
      return 'ILLUSTRATION';
    }

    // Summary / takeaway -> RECAP
    if (/summary|takeaway|recap|remember these/i.test(text)) {
      return 'RECAP';
    }

    // Single key definition or law statement -> HIGHLIGHT
    if (/key point|crucial definition|golden rule|note that/i.test(text)) {
      return 'HIGHLIGHT';
    }

    // Visual fatigue mitigation: if previous was TEXT_EXPLANATION, prefer HIGHLIGHT or ILLUSTRATION
    const lastStrategy = recentStrategies[recentStrategies.length - 1];
    if (lastStrategy === 'TEXT_EXPLANATION') {
      return 'HIGHLIGHT';
    }

    return 'TEXT_EXPLANATION';
  }

  /**
   * Generates a pedagogically paced multi-beat visual sequence
   */
  private async generateBeatsForStrategy(params: {
    strategy: VisualStrategy;
    concept: string;
    topic: string;
    text: string;
    turnId: string;
    assetResult: any;
  }): Promise<VisualBeat[]> {
    const { strategy, concept, text, assetResult } = params;

    switch (strategy) {
      case 'FLOWCHART': {
        const fc = ContentToVisualTransformer.transformToFlowchart(text, concept);
        return [
          {
            beatIndex: 0,
            type: 'FLOWCHART',
            data: fc.data,
            durationHint: 6000,
            transitionIn: 'fade',
          },
          {
            beatIndex: 1,
            type: 'HIGHLIGHT',
            data: {
              title: concept,
              heading: 'Key Sequence Outcome',
              text: 'Process proceeds sequentially through governed energy/matter transformations.',
            },
            durationHint: 5000,
            transitionIn: 'pop',
          },
        ];
      }

      case 'COMPARISON': {
        const comp = ContentToVisualTransformer.transformToComparison(text, 'Property A', 'Property B');
        return [
          {
            beatIndex: 0,
            type: 'COMPARISON',
            data: comp.data,
            durationHint: 7000,
            transitionIn: 'slide',
          },
        ];
      }

      case 'WORKED_EXAMPLE': {
        const we = ContentToVisualTransformer.transformToWorkedExample({
          text,
          fallbackTitle: `Worked Problem: ${concept}`,
        });
        return [
          {
            beatIndex: 0,
            type: 'FORMULA',
            data: {
              title: concept,
              formula: we.data?.workedExample?.formulaUsed || '1/f = 1/v + 1/u',
              formulaLabel: 'Governing Formula',
            },
            durationHint: 5000,
            transitionIn: 'fade',
          },
          {
            beatIndex: 1,
            type: 'WORKED_EXAMPLE',
            data: we.data,
            durationHint: 8000,
            transitionIn: 'pop',
          },
        ];
      }

      case 'PROCESS_ANIMATION': {
        const pa = ContentToVisualTransformer.transformToProcessAnimation({
          title: `Process: ${concept}`,
          stages: [
            { stageNumber: 1, label: 'Initial State', description: `Beginning of the process for ${concept}` },
            { stageNumber: 2, label: 'Transition', description: `Key change or transformation occurs` },
            { stageNumber: 3, label: 'Final State', description: `Outcome or result of the process` },
          ],
          animationType: 'step',
        });
        return [
          {
            beatIndex: 0,
            type: 'PROCESS_ANIMATION',
            data: pa.data,
            durationHint: 6500,
            transitionIn: 'fade',
          },
        ];
      }

      case 'PDF_ASSET': {
        const asset = assetResult.primaryAsset;
        return [
          {
            beatIndex: 0,
            type: 'DIAGRAM',
            data: {
              title: asset?.title || concept,
              subtitle: `Document Reference (Page ${asset?.pageNumber || 1})`,
              assetUrl: asset?.url,
              assetId: asset?.assetId,
              text: asset?.description || 'Extracted textbook illustration for concept clarity.',
            },
            durationHint: 7000,
            transitionIn: 'fade',
            assetId: asset?.assetId,
          },
        ];
      }

      case 'FORMULA': {
        // Extract formula-like content from text; Universal Visual Builder will refine this
        const formulaMatch = text.match(/\b[A-Za-z_]\s*=\s*[^\n.]+/);
        const formulaStr = formulaMatch ? formulaMatch[0].trim() : concept;
        return [
          {
            beatIndex: 0,
            type: 'FORMULA',
            data: {
              title: concept,
              formula: formulaStr,
              formulaLabel: 'Key Formula',
              formulaExplanation: text.substring(0, 200),
            },
            durationHint: 6000,
            transitionIn: 'fade',
          },
        ];
      }

      case 'DIAGRAM': {
        return [
          {
            beatIndex: 0,
            type: 'DIAGRAM',
            data: {
              title: concept,
              diagramType: 'relational',
              text: text.substring(0, 300),
            },
            durationHint: 6000,
            transitionIn: 'fade',
          },
        ];
      }

      case 'ILLUSTRATION': {
        return [
          {
            beatIndex: 0,
            type: 'ILLUSTRATION',
            data: {
              title: concept,
              heading: 'Real-World Observation',
              text: 'Notice how a pencil appears bent when placed in a half-filled glass of water.',
            },
            durationHint: 5000,
            transitionIn: 'fade',
          },
        ];
      }

      case 'RECAP': {
        return [
          {
            beatIndex: 0,
            type: 'RECAP',
            data: {
              title: `Recap: ${concept}`,
              bullets: [
                'Fundamental physical law and cause',
                'Governing mathematical relationship',
                'Key exam sign convention caution',
              ],
            },
            durationHint: 6000,
            transitionIn: 'fade',
          },
        ];
      }

      default: {
        return [
          {
            beatIndex: 0,
            type: 'TEXT',
            data: {
              title: concept,
              heading: 'Key Conceptual Insight',
              bullets: [
                'Core principle articulated clearly for understanding.',
                'Grounds mathematical definitions in intuitive physical behavior.',
              ],
            },
            durationHint: 5000,
            transitionIn: 'fade',
          },
        ];
      }
    }
  }

  private getStrategyReason(strategy: VisualStrategy, concept: string): string {
    switch (strategy) {
      case 'DIAGRAM':
        return `Spatial relationships and ray geometry are central to understanding ${concept}.`;
      case 'FLOWCHART':
        return `Sequential transformation stages best communicate the step-by-step nature of ${concept}.`;
      case 'FORMULA':
        return `Mathematical equation clearly expresses the exact quantitative ratio for ${concept}.`;
      case 'WORKED_EXAMPLE':
        return `Numerical calculation demonstrates practical formula application and unit substitution.`;
      case 'COMPARISON':
        return `Side-by-side contrast highlights critical distinctions and prevents common misconceptions.`;
      case 'PROCESS_ANIMATION':
        return `Temporal transition illustrates ray bending across media boundary over time.`;
      case 'PDF_ASSET':
        return `Document-grounded figure directly correlates with the student's uploaded textbook.`;
      case 'ILLUSTRATION':
        return `Real-world hook connects abstract physical optics to everyday observations.`;
      case 'RECAP':
        return `Summary card consolidates takeaways before proceeding to assessment or next concept.`;
      default:
        return `Structured visual card emphasizes core principles cleanly without teacher script overflow.`;
    }
  }
}

export const defaultVisualStrategyEngine = new VisualStrategyEngine();
