import {
  TutorVisualData,
  TutorVisualType,
} from '@ai-tutor/shared';

export interface ExtractedVisualContent {
  type: TutorVisualType;
  data: TutorVisualData;
}

/**
 * ContentToVisualTransformer:
 * Deterministically parses or transforms teaching explanations into
 * clean, structured Remotion-native visual data models without dumping conversational narration prose.
 */
export class ContentToVisualTransformer {
  /**
   * Transforms sequential process text into a structured Flowchart data payload.
   */
  static transformToFlowchart(
    text: string,
    fallbackTitle = 'Process Flow'
  ): ExtractedVisualContent {
    // Look for arrows (->, =>, →), numbered steps (1., 2., 3.), or delimiters (then, next)
    const lines = text.split(/\n|\s*->\s*|\s*→\s*|\s*=>\s*/).map((l) => l.trim()).filter(Boolean);
    const nodes: { id: string; label: string; subtext?: string; type: 'start' | 'step' | 'result' }[] = [];
    const edges: { from: string; to: string }[] = [];

    // Extract key steps (clean of conversational words)
    const cleanedSteps: string[] = [];
    for (const line of lines) {
      const step = line.replace(/^\d+[\.\)]\s*/, '').replace(/^Step\s*\d+:\s*/i, '').trim();
      if (step.length > 2 && step.length < 80) {
        cleanedSteps.push(step);
      }
    }

    const stepsToUse = cleanedSteps.length >= 2 ? cleanedSteps.slice(0, 6) : [
      'Input / Trigger',
      'Core Process',
      'Outcome / Product',
    ];

    stepsToUse.forEach((label, idx) => {
      const id = `node_${idx + 1}`;
      const type = idx === 0 ? 'start' : idx === stepsToUse.length - 1 ? 'result' : 'step';
      nodes.push({ id, label, type });
      if (idx > 0) {
        edges.push({ from: `node_${idx}`, to: id });
      }
    });

    return {
      type: 'FLOWCHART',
      data: {
        title: fallbackTitle,
        nodes,
        edges,
      },
    };
  }

  /**
   * Transforms comparative text into a structured Comparison payload (Left vs Right).
   */
  static transformToComparison(
    text: string,
    leftTitle = 'Concept A',
    rightTitle = 'Concept B'
  ): ExtractedVisualContent {
    const items: { feature: string; leftValue: string; rightValue: string }[] = [];

    // Look for common comparison pairs or lines containing "vs", "whereas", "while"
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    for (const line of lines) {
      const vsMatch = line.match(/(.+?)(?::|\s+(?:vs|whereas|while)\s+)(.+)/i);
      if (vsMatch && items.length < 5) {
        items.push({
          feature: `Property ${items.length + 1}`,
          leftValue: vsMatch[1].trim().replace(/^[-*•]\s*/, ''),
          rightValue: vsMatch[2].trim().replace(/^[-*•]\s*/, ''),
        });
      }
    }

    if (items.length === 0) {
      items.push(
        { feature: 'Definition', leftValue: 'Primary characteristics', rightValue: 'Alternative mechanism' },
        { feature: 'Key Rule', leftValue: 'Condition A applies', rightValue: 'Condition B applies' },
        { feature: 'Example', leftValue: 'Case study 1', rightValue: 'Case study 2' }
      );
    }

    return {
      type: 'COMPARISON',
      data: {
        title: `${leftTitle} vs ${rightTitle}`,
        comparison: {
          leftTitle,
          rightTitle,
          items,
        },
      },
    };
  }

  /**
   * Transforms numerical/physics problem solving into a structured Worked Example payload.
   */
  static transformToWorkedExample(params: {
    problem?: string;
    text: string;
    fallbackTitle?: string;
  }): ExtractedVisualContent {
    const { problem, text, fallbackTitle } = params;

    // Detect formulas like 1/f = 1/v + 1/u or sin(i)/sin(r) = n
    const formulaMatch = text.match(/(?:formula|equation|using)\s*[:=]?\s*([^\n.,;]+)/i);
    const formulaUsed = formulaMatch ? formulaMatch[1].trim() : undefined;

    // Detect given values (e.g. u = -30cm, f = -15cm, i = 45 deg)
    const givenMatches = text.match(/(?:[a-zA-Z]\s*=\s*[-+]?\d+(?:\.\d+)?(?:\s*[a-zA-Z°]+)?)/g) || [];
    const given = givenMatches.length > 0 ? Array.from(new Set(givenMatches)).slice(0, 4) : ['Given quantities'];

    // Detect final answer (e.g. v = -60cm, n = 1.5, answer = ...)
    const answerMatch = text.match(/(?:answer|therefore|yields|result|v\s*=|n\s*=|f\s*=)\s*[:=]?\s*([^\n.]+)/i);
    const finalAnswer = answerMatch ? answerMatch[1].trim() : 'Computed Solution';

    const steps = [
      { stepNumber: 1, description: 'Identify Given Parameters', expression: given.join(', ') },
      { stepNumber: 2, description: 'Apply Governing Formula', expression: formulaUsed || 'Standard Formula' },
      { stepNumber: 3, description: 'Substitute & Calculate', expression: `Solve for target variable` },
      { stepNumber: 4, description: 'Final Result', expression: finalAnswer },
    ];

    return {
      type: 'WORKED_EXAMPLE',
      data: {
        title: fallbackTitle || 'Worked Numerical Example',
        workedExample: {
          problem: problem || 'Calculate unknown optical/physical parameter',
          given,
          formulaUsed,
          steps,
          finalAnswer,
        },
      },
    };
  }

  /**
   * Transforms dynamic phenomenon explanation into a Process Animation payload.
   */
  static transformToProcessAnimation(params: {
    title: string;
    stages: { stageNumber: number; label: string; description: string }[];
    animationType?: 'ray_bend' | 'flow' | 'cycle' | 'step';
  }): ExtractedVisualContent {
    return {
      type: 'PROCESS_ANIMATION',
      data: {
        title: params.title,
        processAnimation: {
          title: params.title,
          stages: params.stages,
          animationType: params.animationType || 'step',
        },
      },
    };
  }
}
