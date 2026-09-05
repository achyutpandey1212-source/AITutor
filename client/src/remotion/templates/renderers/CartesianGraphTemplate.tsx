import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';
import type { VisualGraphAxis } from '@ai-tutor/shared';
import { UniversalPrimitiveRenderer } from '../../primitives/UniversalPrimitiveRenderer';

export const CartesianGraphTemplate: UniversalTemplateRenderer = {
  id: 'template.graph.cartesian',
  name: 'Cartesian Graph',
  description: 'Renders 2D coordinate graphs, functions, and numerical curves with data series.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title || 'Cartesian Coordinate Graph';
    const subtitle = payload.subtitle;

    const defaultAxes: { x: VisualGraphAxis; y: VisualGraphAxis } = {
      x: { label: 'x', min: -5, max: 5 },
      y: { label: 'y', min: -5, max: 5 },
    };

    const axes = payload.axes || defaultAxes;
    const series = payload.series || [];

    const headerHeight = title || subtitle ? 55 : 0;
    const graphHeight = height - headerHeight;

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
          padding: '20px 32px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
        className="template-cartesian-graph"
      >
        {/* Header */}
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

        {/* Graph Surface */}
        <div style={{ flex: 1, width: '100%', height: `${graphHeight}px` }}>
          <UniversalPrimitiveRenderer
            width={width - 64}
            height={graphHeight - 40}
            axes={axes}
            series={series}
            annotations={payload.annotations}
            animation={beat.animation}
          />
        </div>
      </div>
    );
  },
};
