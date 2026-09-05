import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';
import { UniversalPrimitiveRenderer } from '../../primitives/UniversalPrimitiveRenderer';

export const SpatialDiagramTemplate: UniversalTemplateRenderer = {
  id: 'template.diagram.spatial',
  name: 'Spatial Diagram',
  description: 'Composes nodes, spatial points, and connectors where relative 2D positions define the explanation.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title;
    const subtitle = payload.subtitle;

    const headerHeight = title || subtitle ? 55 : 0;
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
          padding: '20px 28px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
        className="template-spatial-diagram"
      >
        {(title || subtitle) && (
          <div style={{ height: `${headerHeight}px`, flexShrink: 0, marginBottom: '6px' }}>
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#f8fafc',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div style={{ flex: 1, width: '100%', height: `${diagramHeight}px` }}>
          <UniversalPrimitiveRenderer
            width={width - 56}
            height={diagramHeight - 40}
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
