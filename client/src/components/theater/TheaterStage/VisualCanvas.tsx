import React, { useMemo } from 'react';
import type {
  TutorVisualState,
  UniversalTeachingBeat,
  VisualIntent,
  VisualTemplate,
  VisualConnector,
} from '@ai-tutor/shared';
import {
  mapLegacyVisualTypeToUniversalIntent,
  buildVisualForBeat,
} from '@ai-tutor/shared';
import { UniversalClassroomComposition } from '../../../remotion/compositions/UniversalClassroomComposition';

export interface VisualCanvasProps {
  visualState: TutorVisualState;
  captionsEnabled?: boolean;
}

/** Map a VisualIntent to the most appropriate VisualTemplate id. */
function intentToTemplateId(intent: VisualIntent): VisualTemplate {
  switch (intent) {
    case 'DIAGRAM':
      return 'template.diagram.relational';
    case 'PROCESS':
      return 'template.process.sequential';
    case 'FORMULA':
      return 'template.formula.derivation';
    case 'COMPARISON':
      return 'template.comparison.matrix';
    case 'GRAPH':
      return 'template.graph.cartesian';
    case 'CODE':
      return 'template.code.walkthrough';
    case 'TIMELINE':
      return 'template.timeline.historical';
    case 'MEDIA':
      return 'template.media.grounded';
    case 'SIMULATION':
      return 'template.simulation.interactive';
    default:
      return 'template.explanation.editorial';
  }
}

/** Convert TutorVisualState → minimal UniversalTeachingBeat, then enrich via buildVisualForBeat. */
function visualStateToUniversalBeat(vs: TutorVisualState): UniversalTeachingBeat {
  const intent = mapLegacyVisualTypeToUniversalIntent(vs.visualType || 'TEXT');
  const templateId = intentToTemplateId(intent);

  // Title shown in the template header area
  const titleText = vs.visualData?.title || vs.concept || vs.topic || '';

  // Body text — only use if it's distinct from the title
  const rawBodyText =
    vs.visualData?.text ||
    vs.captionText ||
    '';
  const bodyText = rawBodyText && rawBodyText !== titleText ? rawBodyText : '';

  // Content blocks — parse definition or bullets or paragraphs
  const blocks: UniversalTeachingBeat['content']['blocks'] = [];

  const isDefinition =
    vs.visualType === 'HIGHLIGHT' ||
    /definition|what is|define\b/i.test(vs.concept || '') ||
    Boolean(vs.visualData?.heading && /definition|law|principle/i.test(vs.visualData.heading));

  if (isDefinition && (bodyText || vs.visualData?.heading)) {
    const term = vs.concept || vs.visualData?.heading || titleText;
    const defText = bodyText || vs.visualData?.text || vs.captionText || term;
    blocks.push({
      type: 'definition',
      term,
      definition: [{ text: defText }],
    });
  } else if (vs.visualData?.bullets && vs.visualData.bullets.length > 0) {
    blocks.push({
      type: 'list',
      ordered: false,
      items: vs.visualData.bullets.map((b: string) => [{ text: b }]),
    });
  } else if (bodyText) {
    blocks.push({
      type: 'paragraph',
      content: [{ text: bodyText }],
    });
  }

  // Collect ALL available text so builders can extract entities (e.g. cell organelles)
  // Priority: full teaching speech from data.text > captionText > concept name
  const allAvailableText = [
    vs.visualData?.text,
    vs.captionText,
    vs.visualData?.subtitle,
    vs.concept,
    vs.topic,
  ]
    .filter(Boolean)
    .join(' ');

  // Connectors from edges if flowchart
  const rawNodes = (vs.visualData as any)?.nodes;
  const rawEdges = (vs.visualData as any)?.edges;
  let connectors: VisualConnector[] | undefined = (vs.visualData as any)?.connectors;
  if (!connectors && rawEdges && Array.isArray(rawEdges)) {
    connectors = rawEdges.map((e: any, idx: number): VisualConnector => ({
      id: `c-legacy-${idx + 1}`,
      fromNodeId: e.from,
      toNodeId: e.to,
      directed: true,
      style: 'solid',
    }));
  }

  const legacyData = (vs.visualData || {}) as any;

  const baseBeat: UniversalTeachingBeat = {
    beatIndex: vs.activeBeatIndex ?? 0,
    beatId: vs.turnId || `live-${Date.now()}`,
    content: { blocks },
    // Use allAvailableText so entity-extraction in builders (e.g. RelationalDiagramBuilder) works
    speechText: allAvailableText,
    displayText: bodyText || vs.captionText || titleText,
    captionText: vs.captionText || '',
    visual: {
      intent,
      templateId,
      environment: 'NEUTRAL',
      payload: {
        title: titleText,
        // Only set subtitle if topic is meaningfully different from title
        ...(vs.topic && vs.topic !== titleText ? { subtitle: vs.topic } : {}),
        // Forward pre-computed payload fields from the legacy visual data
        ...(rawNodes ? { nodes: rawNodes } : {}),
        ...(connectors ? { connectors } : {}),
        ...(legacyData.axes ? { axes: legacyData.axes } : {}),
        ...(legacyData.series ? { series: legacyData.series } : {}),
        ...(legacyData.formula
          ? { equations: [{ id: 'eq-0', latex: legacyData.formula, explanation: legacyData.formulaExplanation }] }
          : {}),
        ...(vs.visualData?.comparison
          ? {
              comparison: {
                columns: [
                  { id: 'left', header: vs.visualData.comparison.leftTitle },
                  { id: 'right', header: vs.visualData.comparison.rightTitle },
                ],
                rows: vs.visualData.comparison.items.map((item: any) => ({
                  label: item.feature,
                  values: { left: item.leftValue, right: item.rightValue },
                })),
              },
            }
          : {}),
      },
    },
    animation: {
      enterTransition: intent === 'PROCESS' ? 'stagger_reveal' : 'fade',
      activeElements: [],
    },
    avatar: {
      framing: 'medium',
      gesture: 'neutral',
      gazeTarget: 'student',
    },
  };

  try {
    return buildVisualForBeat(baseBeat);
  } catch {
    return baseBeat;
  }
}

/**
 * VisualCanvas renders the UniversalClassroomComposition directly as a React component
 * (not inside a Remotion <Player>), so it fills its container naturally without
 * the letterboxing / black-bar problem that the Player's fixed-aspect ratio causes.
 */
export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  visualState,
  captionsEnabled = false,
}) => {
  const beat = useMemo(() => visualStateToUniversalBeat(visualState), [visualState]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <UniversalClassroomComposition
        beat={beat}
        captionsEnabled={captionsEnabled}
      />
    </div>
  );
};
