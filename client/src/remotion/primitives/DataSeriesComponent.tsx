import React from 'react';
import type { VisualDataSeries, VisualGraphAxis } from '@ai-tutor/shared';
import {
  createCoordinateScaler,
  pointsToSmoothPath,
  pointsToStepPath,
  type PlotViewport,
} from './layout';

export interface DataSeriesComponentProps {
  series: VisualDataSeries;
  xAxis: VisualGraphAxis;
  yAxis: VisualGraphAxis;
  viewport: PlotViewport;
  color?: string;
  strokeWidth?: number;
  drawProgress?: number;
  opacity?: number;
}

export const DEFAULT_SERIES_PALETTE = [
  '#38bdf8', // sky blue
  '#f59e0b', // amber
  '#34d399', // emerald
  '#a855f7', // purple
  '#f43f5e', // rose
  '#06b6d4', // cyan
];

export const DataSeriesComponent: React.FC<DataSeriesComponentProps> = ({
  series,
  xAxis,
  yAxis,
  viewport,
  color = '#38bdf8',
  strokeWidth = 2,
  drawProgress = 1,
  opacity = 1,
}) => {
  const scaler = createCoordinateScaler(viewport, xAxis, yAxis);

  // Transform data points into pixel coordinates
  const pixelPoints: [number, number][] = series.points.map((p) => scaler.toPixelPoint(p));

  // Determine path based on curveType
  const curveType = series.curveType || 'linear';
  let pathD = '';

  if (pixelPoints.length > 0) {
    if (curveType === 'smooth') {
      pathD = pointsToSmoothPath(pixelPoints);
    } else if (curveType === 'step') {
      pathD = pointsToStepPath(pixelPoints);
    } else {
      // Linear
      pathD = pixelPoints.reduce(
        (acc, pt, idx) => (idx === 0 ? `M ${pt[0]} ${pt[1]}` : `${acc} L ${pt[0]} ${pt[1]}`),
        ''
      );
    }
  }

  // Highlight point if specified
  const highlightPixel = series.highlightPoint
    ? scaler.toPixelPoint(series.highlightPoint)
    : undefined;

  const lastPixel = pixelPoints[pixelPoints.length - 1];

  return (
    <g
      id={`series-${series.id}`}
      opacity={opacity}
      className="data-series-primitive"
    >
      {/* Series Line */}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={drawProgress < 1 ? '1000' : undefined}
          strokeDashoffset={drawProgress < 1 ? `${(1 - drawProgress) * 1000}` : undefined}
        />
      )}

      {/* Discrete Data Point Markers */}
      {pixelPoints.map((pt, idx) => (
        <circle
          key={`pt-${idx}`}
          cx={pt[0]}
          cy={pt[1]}
          r={2.5}
          fill="#0b0f17"
          stroke={color}
          strokeWidth={1.5}
        />
      ))}

      {/* Series Name Label at end of series */}
      {lastPixel && (
        <text
          x={lastPixel[0] + 8}
          y={lastPixel[1] + 3.5}
          fill={color}
          fontSize="10"
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {series.name}
        </text>
      )}

      {/* Highlighted Point Marker */}
      {highlightPixel && (
        <g transform={`translate(${highlightPixel[0]}, ${highlightPixel[1]})`}>
          {/* Outer Ring */}
          <circle
            cx={0}
            cy={0}
            r={7}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />
          {/* Inner Dot */}
          <circle cx={0} cy={0} r={3.5} fill={color} />
          {/* Coordinate Tooltip */}
          <g transform="translate(0, -14)">
            <rect
              x={-28}
              y={-12}
              width={56}
              height={16}
              rx={3}
              fill="#0b0f17"
              stroke={color}
              strokeWidth={0.75}
            />
            <text
              x={0}
              y={-1}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="9"
              fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {`(${series.highlightPoint![0]}, ${series.highlightPoint![1]})`}
            </text>
          </g>
        </g>
      )}
    </g>
  );
};
