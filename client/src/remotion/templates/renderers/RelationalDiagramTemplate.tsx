import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';
import { UniversalPrimitiveRenderer } from '../../primitives/UniversalPrimitiveRenderer';

export const RelationalDiagramTemplate: UniversalTemplateRenderer = {
  id: 'template.diagram.relational',
  name: 'Relational Diagram',
  description: 'Composes nodes, connectors, and callouts into relational or branching conceptual diagrams.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title;
    const subtitle = payload.subtitle;

    const headerHeight = title || subtitle ? 60 : 0;
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
        className="template-relational-diagram"
      >
        {/* Optional Title Header */}
        {(title || subtitle) && (
          <div style={{ height: `${headerHeight}px`, flexShrink: 0, marginBottom: '8px' }}>
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Diagram Surface */}
        <div style={{ flex: 1, width: '100%', height: `${diagramHeight}px` }}>
          <UniversalPrimitiveRenderer
            width={width - 64}
            height={diagramHeight - 48}
            nodes={payload.nodes}
            connectors={payload.connectors}
            annotations={payload.annotations}
            animation={beat.animation}
          />
        </div>
      </div>
    );
  },
};
