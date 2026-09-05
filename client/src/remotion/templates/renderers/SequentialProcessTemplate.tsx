import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';
import type { VisualNode, VisualConnector } from '@ai-tutor/shared';
import { UniversalPrimitiveRenderer } from '../../primitives/UniversalPrimitiveRenderer';

export const SequentialProcessTemplate: UniversalTemplateRenderer = {
  id: 'template.process.sequential',
  name: 'Sequential Process',
  description: 'Renders step-by-step linear or staged pipelines (Step 1 → Step 2 → Step 3).',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title || 'Process Flow';
    const subtitle = payload.subtitle;

    let nodes: VisualNode[] = payload.nodes || [];
    let connectors: VisualConnector[] = payload.connectors || [];

    // Auto-generate pipeline if nodes were omitted but step blocks exist in content
    if (nodes.length === 0 && beat.content?.blocks) {
      const stepBlocks = beat.content.blocks.filter((b) => b.type === 'step');
      if (stepBlocks.length > 0) {
        nodes = stepBlocks.map((sb: any) => ({
          id: `step-${sb.stepNumber}`,
          label: sb.title || `Step ${sb.stepNumber}`,
          sublabel: sb.content?.[0]?.text,
          shape: 'box',
          category: sb.stepNumber === 1 ? 'primary' : 'secondary',
        }));

        connectors = [];
        for (let i = 0; i < nodes.length - 1; i++) {
          connectors.push({
            id: `c-step-${i}`,
            fromNodeId: nodes[i]!.id,
            toNodeId: nodes[i + 1]!.id,
            directed: true,
            style: 'solid',
          });
        }
      }
    }

    const headerHeight = 60;
    const diagramHeight = height - headerHeight;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '24px 32px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
        className="template-sequential-process"
      >
        {/* Header with Process Stage Tracker */}
        <div style={{ height: `${headerHeight}px`, flexShrink: 0, marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              PROCESS · {nodes.length} STAGES
            </span>
          </div>
          <h2
            style={{
              margin: '6px 0 0 0',
              fontSize: '18px',
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Process Diagram Surface */}
        <div style={{ flex: 1, width: '100%', height: `${diagramHeight}px` }}>
          <UniversalPrimitiveRenderer
            width={width - 64}
            height={diagramHeight - 48}
            nodes={nodes}
            connectors={connectors}
            annotations={payload.annotations}
            animation={beat.animation}
          />
        </div>
      </div>
    );
  },
};
