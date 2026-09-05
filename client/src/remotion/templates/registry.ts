import type { VisualTemplate } from '@ai-tutor/shared';
import type { UniversalTemplateRenderer } from './types';

import { EditorialExplanationTemplate } from './renderers/EditorialExplanationTemplate';
import { RelationalDiagramTemplate } from './renderers/RelationalDiagramTemplate';
import { SpatialDiagramTemplate } from './renderers/SpatialDiagramTemplate';
import { SequentialProcessTemplate } from './renderers/SequentialProcessTemplate';
import { FormulaDerivationTemplate } from './renderers/FormulaDerivationTemplate';
import { CartesianGraphTemplate } from './renderers/CartesianGraphTemplate';
import { ComparisonMatrixTemplate } from './renderers/ComparisonMatrixTemplate';
import { CodeWalkthroughTemplate } from './renderers/CodeWalkthroughTemplate';
import {
  HistoricalTimelineTemplate,
  GroundedMediaTemplate,
  InteractiveSimulationTemplate,
} from './renderers/ReservedTemplates';

/**
 * Universal Template Registry mapping Phase 6A VisualTemplate identifiers
 * to their respective deterministic renderers.
 */
const TEMPLATE_REGISTRY = new Map<VisualTemplate, UniversalTemplateRenderer>([
  ['template.explanation.editorial', EditorialExplanationTemplate],
  ['template.diagram.relational', RelationalDiagramTemplate],
  ['template.diagram.spatial', SpatialDiagramTemplate],
  ['template.process.sequential', SequentialProcessTemplate],
  ['template.formula.derivation', FormulaDerivationTemplate],
  ['template.graph.cartesian', CartesianGraphTemplate],
  ['template.comparison.matrix', ComparisonMatrixTemplate],
  ['template.code.walkthrough', CodeWalkthroughTemplate],
  ['template.timeline.historical', HistoricalTimelineTemplate],
  ['template.media.grounded', GroundedMediaTemplate],
  ['template.simulation.interactive', InteractiveSimulationTemplate],
]);

/**
 * Resolves a template renderer deterministically from a template identifier.
 * If the template ID is omitted, unregistered, or invalid, gracefully falls back
 * to EditorialExplanationTemplate so rendering never throws or crashes.
 */
export function resolveTemplate(templateId?: string): UniversalTemplateRenderer {
  if (templateId && TEMPLATE_REGISTRY.has(templateId as VisualTemplate)) {
    return TEMPLATE_REGISTRY.get(templateId as VisualTemplate)!;
  }
  return EditorialExplanationTemplate;
}

/**
 * Returns true if the given template ID is explicitly registered.
 */
export function isTemplateRegistered(templateId: string): boolean {
  return TEMPLATE_REGISTRY.has(templateId as VisualTemplate);
}

/**
 * Returns an array of all registered template renderers.
 */
export function getAllRegisteredTemplates(): UniversalTemplateRenderer[] {
  return Array.from(TEMPLATE_REGISTRY.values());
}
