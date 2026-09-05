import React from 'react';
import type { VisualNode, VisualPoint } from '@ai-tutor/shared';
import { getNodeDimensions } from './layout';

export interface VisualNodeComponentProps {
  node: VisualNode;
  resolvedPosition: VisualPoint;
  isActive?: boolean;
  opacity?: number;
  scale?: number;
}

interface CategoryStyle {
  border: string;
  fill: string;
  activeBorder: string;
  activeFill: string;
  text: string;
  subtext: string;
  iconBg: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  primary: {
    border: 'rgba(56, 189, 248, 0.45)',
    fill: 'rgba(14, 165, 233, 0.08)',
    activeBorder: '#38bdf8',
    activeFill: 'rgba(14, 165, 233, 0.18)',
    text: '#f8fafc',
    subtext: '#94a3b8',
    iconBg: 'rgba(56, 189, 248, 0.15)',
  },
  secondary: {
    border: 'rgba(148, 163, 184, 0.35)',
    fill: 'rgba(148, 163, 184, 0.06)',
    activeBorder: '#cbd5e1',
    activeFill: 'rgba(148, 163, 184, 0.15)',
    text: '#f1f5f9',
    subtext: '#94a3b8',
    iconBg: 'rgba(148, 163, 184, 0.12)',
  },
  accent: {
    border: 'rgba(245, 158, 11, 0.45)',
    fill: 'rgba(245, 158, 11, 0.08)',
    activeBorder: '#f59e0b',
    activeFill: 'rgba(245, 158, 11, 0.18)',
    text: '#fef3c7',
    subtext: '#d97706',
    iconBg: 'rgba(245, 158, 11, 0.15)',
  },
  neutral: {
    border: 'rgba(100, 116, 139, 0.35)',
    fill: 'rgba(15, 23, 42, 0.75)',
    activeBorder: '#94a3b8',
    activeFill: 'rgba(30, 41, 59, 0.85)',
    text: '#e2e8f0',
    subtext: '#64748b',
    iconBg: 'rgba(100, 116, 139, 0.15)',
  },
  muted: {
    border: 'rgba(51, 65, 85, 0.35)',
    fill: 'rgba(15, 23, 42, 0.45)',
    activeBorder: '#64748b',
    activeFill: 'rgba(30, 41, 59, 0.65)',
    text: '#94a3b8',
    subtext: '#475569',
    iconBg: 'rgba(51, 65, 85, 0.15)',
  },
};

export const VisualNodeComponent: React.FC<VisualNodeComponentProps> = ({
  node,
  resolvedPosition,
  isActive = false,
  opacity = 1,
  scale = 1,
}) => {
  const shape = node.shape || 'box';
  const category = node.category || 'neutral';
  const dims = getNodeDimensions(node);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.neutral;

  const strokeColor = isActive ? style.activeBorder : style.border;
  const fillColor = isActive ? style.activeFill : style.fill;
  const strokeWidth = isActive ? 1.75 : 1;

  const cx = resolvedPosition.x;
  const cy = resolvedPosition.y;
  const halfW = dims.width / 2;
  const halfH = dims.height / 2;

  const renderShapePath = () => {
    switch (shape) {
      case 'circle':
        return (
          <circle
            cx={cx}
            cy={cy}
            r={dims.radius || 35}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'pill':
        return (
          <rect
            x={cx - halfW}
            y={cy - halfH}
            width={dims.width}
            height={dims.height}
            rx={dims.height / 2}
            ry={dims.height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'diamond': {
        const points = `${cx},${cy - halfH} ${cx + halfW},${cy} ${cx},${cy + halfH} ${cx - halfW},${cy}`;
        return (
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        );
      }
      case 'card':
        return (
          <rect
            x={cx - halfW}
            y={cy - halfH}
            width={dims.width}
            height={dims.height}
            rx={8}
            ry={8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'box':
      default:
        return (
          <rect
            x={cx - halfW}
            y={cy - halfH}
            width={dims.width}
            height={dims.height}
            rx={4}
            ry={4}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  const hasSublabel = Boolean(node.sublabel);
  const labelY = hasSublabel ? cy - 3 : cy + 4;
  const sublabelY = cy + 13;

  return (
    <g
      id={`node-${node.id}`}
      opacity={opacity}
      transform={scale !== 1 ? `translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})` : undefined}
      className="visual-node-primitive"
    >
      {/* Node Geometry */}
      {renderShapePath()}

      {/* Optional Icon Glyph Indicator */}
      {node.iconRef && (
        <circle
          cx={cx - halfW + 14}
          cy={cy}
          r={6}
          fill={style.iconBg}
          stroke={strokeColor}
          strokeWidth={0.75}
        />
      )}

      {/* Node Text Label */}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={style.text}
        fontSize={shape === 'card' ? '13' : '12'}
        fontWeight="600"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        letterSpacing="-0.01em"
      >
        {node.label}
      </text>

      {/* Optional Sublabel */}
      {node.sublabel && (
        <text
          x={cx}
          y={sublabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={style.subtext}
          fontSize="10"
          fontWeight="400"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
        >
          {node.sublabel}
        </text>
      )}
    </g>
  );
};
