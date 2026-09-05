import React from 'react';
import type { VisualPoint } from '@ai-tutor/shared';

export interface PointPrimitiveProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  opacity?: number;
}

export const PointPrimitive: React.FC<PointPrimitiveProps> = ({
  x,
  y,
  radius = 4,
  fill = '#38bdf8',
  stroke = '#0b0f17',
  strokeWidth = 1.5,
  label,
  labelPosition = 'top',
  opacity = 1,
}) => {
  const getLabelOffset = (): { dx: number; dy: number; anchor: 'middle' | 'start' | 'end' } => {
    switch (labelPosition) {
      case 'bottom':
        return { dx: 0, dy: radius + 14, anchor: 'middle' };
      case 'left':
        return { dx: -radius - 6, dy: 4, anchor: 'end' };
      case 'right':
        return { dx: radius + 6, dy: 4, anchor: 'start' };
      case 'top':
      default:
        return { dx: 0, dy: -radius - 6, anchor: 'middle' };
    }
  };

  const { dx, dy, anchor } = getLabelOffset();

  return (
    <g opacity={opacity} className="vector-primitive-point">
      <circle cx={x} cy={y} r={radius} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {label && (
        <text
          x={x + dx}
          y={y + dy}
          fill="#cbd5e1"
          fontSize="11"
          fontWeight="500"
          textAnchor={anchor}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export interface LinePrimitiveProps {
  from: VisualPoint;
  to: VisualPoint;
  style?: 'solid' | 'dashed' | 'dotted';
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export const LinePrimitive: React.FC<LinePrimitiveProps> = ({
  from,
  to,
  style = 'solid',
  stroke = '#64748b',
  strokeWidth = 1.5,
  opacity = 1,
}) => {
  const strokeDasharray =
    style === 'dashed' ? '6 4' : style === 'dotted' ? '2 4' : undefined;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      opacity={opacity}
      className="vector-primitive-line"
    />
  );
};

export interface ArrowPrimitiveProps {
  from: VisualPoint;
  to: VisualPoint;
  style?: 'solid' | 'dashed' | 'dotted';
  stroke?: string;
  strokeWidth?: number;
  headSize?: number;
  bidirectional?: boolean;
  markerEndId?: string;
  markerStartId?: string;
  opacity?: number;
}

export const ArrowPrimitive: React.FC<ArrowPrimitiveProps> = ({
  from,
  to,
  style = 'solid',
  stroke = '#94a3b8',
  strokeWidth = 1.5,
  markerEndId = 'arrowhead-default',
  markerStartId = 'arrowhead-start-default',
  bidirectional = false,
  opacity = 1,
}) => {
  const strokeDasharray =
    style === 'dashed' ? '6 4' : style === 'dotted' ? '2 4' : undefined;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      strokeLinecap="round"
      markerEnd={`url(#${markerEndId})`}
      markerStart={bidirectional ? `url(#${markerStartId})` : undefined}
      opacity={opacity}
      className="vector-primitive-arrow"
    />
  );
};

export interface MeasurementLinePrimitiveProps {
  from: VisualPoint;
  to: VisualPoint;
  label?: string;
  stroke?: string;
  tickLength?: number;
  strokeWidth?: number;
  opacity?: number;
}

export const MeasurementLinePrimitive: React.FC<MeasurementLinePrimitiveProps> = ({
  from,
  to,
  label,
  stroke = '#94a3b8',
  tickLength = 6,
  strokeWidth = 1,
  opacity = 1,
}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <g opacity={opacity} className="vector-primitive-measurement">
      {/* Dimension Line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray="3 3"
      />
      {/* End Ticks */}
      <line
        x1={from.x - nx * tickLength}
        y1={from.y - ny * tickLength}
        x2={from.x + nx * tickLength}
        y2={from.y + ny * tickLength}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <line
        x1={to.x - nx * tickLength}
        y1={to.y - ny * tickLength}
        x2={to.x + nx * tickLength}
        y2={to.y + ny * tickLength}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Dimension Label */}
      {label && (
        <text
          x={midX + nx * 10}
          y={midY + ny * 10}
          fill="#cbd5e1"
          fontSize="10"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {label}
        </text>
      )}
    </g>
  );
};
