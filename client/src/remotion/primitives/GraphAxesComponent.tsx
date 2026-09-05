import React from 'react';
import type { VisualGraphAxis } from '@ai-tutor/shared';
import type { PlotViewport } from './layout';

export interface GraphAxesComponentProps {
  xAxis: VisualGraphAxis;
  yAxis: VisualGraphAxis;
  viewport: PlotViewport;
  stroke?: string;
  gridStroke?: string;
  labelColor?: string;
  tickColor?: string;
  showGrid?: boolean;
  opacity?: number;
}

export const GraphAxesComponent: React.FC<GraphAxesComponentProps> = ({
  xAxis,
  yAxis,
  viewport,
  stroke = 'rgba(148, 163, 184, 0.7)',
  gridStroke = 'rgba(51, 65, 85, 0.35)',
  labelColor = '#cbd5e1',
  tickColor = '#94a3b8',
  showGrid = true,
  opacity = 1,
}) => {
  const { x, y, width, height } = viewport;

  // Generate ticks if not explicitly provided
  const getTicks = (axis: VisualGraphAxis): number[] => {
    if (axis.ticks && axis.ticks.length > 0) {
      return axis.ticks;
    }
    const span = axis.max - axis.min;
    if (span <= 0) return [axis.min];
    const steps = 5;
    const step = span / steps;
    const ticks: number[] = [];
    for (let i = 0; i <= steps; i++) {
      ticks.push(Number((axis.min + i * step).toFixed(2)));
    }
    return ticks;
  };

  const xTicks = getTicks(xAxis);
  const yTicks = getTicks(yAxis);

  const xSpan = xAxis.max - xAxis.min || 1;
  const ySpan = yAxis.max - yAxis.min || 1;

  const toPixelX = (val: number) => x + ((val - xAxis.min) / xSpan) * width;
  const toPixelY = (val: number) => y + height - ((val - yAxis.min) / ySpan) * height;

  const originX = toPixelX(Math.max(xAxis.min, Math.min(xAxis.max, 0)));
  const originY = toPixelY(Math.max(yAxis.min, Math.min(yAxis.max, 0)));

  return (
    <g opacity={opacity} className="graph-axes-primitive">
      {/* Grid Lines */}
      {showGrid && (
        <g className="grid-lines">
          {/* Vertical Grid Lines */}
          {xTicks.map((val, idx) => {
            const px = toPixelX(val);
            return (
              <line
                key={`vgrid-${idx}`}
                x1={px}
                y1={y}
                x2={px}
                y2={y + height}
                stroke={gridStroke}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            );
          })}
          {/* Horizontal Grid Lines */}
          {yTicks.map((val, idx) => {
            const py = toPixelY(val);
            return (
              <line
                key={`hgrid-${idx}`}
                x1={x}
                y1={py}
                x2={x + width}
                y2={py}
                stroke={gridStroke}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            );
          })}
        </g>
      )}

      {/* Main Axis Lines */}
      {/* X Axis Line */}
      <line
        x1={x}
        y1={originY}
        x2={x + width}
        y2={originY}
        stroke={stroke}
        strokeWidth={1.5}
        markerEnd="url(#arrowhead-axis)"
      />
      {/* Y Axis Line */}
      <line
        x1={originX}
        y1={y + height}
        x2={originX}
        y2={y}
        stroke={stroke}
        strokeWidth={1.5}
        markerEnd="url(#arrowhead-axis)"
      />

      {/* X Axis Ticks & Numbers */}
      {xTicks.map((val, idx) => {
        const px = toPixelX(val);
        return (
          <g key={`xtick-${idx}`} transform={`translate(${px}, ${originY})`}>
            <line x1={0} y1={0} x2={0} y2={5} stroke={stroke} strokeWidth={1} />
            <text
              x={0}
              y={17}
              textAnchor="middle"
              fill={tickColor}
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Y Axis Ticks & Numbers */}
      {yTicks.map((val, idx) => {
        const py = toPixelY(val);
        return (
          <g key={`ytick-${idx}`} transform={`translate(${originX}, ${py})`}>
            <line x1={-5} y1={0} x2={0} y2={0} stroke={stroke} strokeWidth={1} />
            <text
              x={-8}
              y={3.5}
              textAnchor="end"
              fill={tickColor}
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* X Axis Label */}
      <text
        x={x + width}
        y={originY + 30}
        textAnchor="end"
        fill={labelColor}
        fontSize="11"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {xAxis.label} {xAxis.unit ? `(${xAxis.unit})` : ''}
      </text>

      {/* Y Axis Label */}
      <text
        x={originX - 10}
        y={y - 12}
        textAnchor="start"
        fill={labelColor}
        fontSize="11"
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {yAxis.label} {yAxis.unit ? `(${yAxis.unit})` : ''}
      </text>
    </g>
  );
};
