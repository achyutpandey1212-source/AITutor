import React from 'react';
import type { VisualAnnotation, VisualPoint } from '@ai-tutor/shared';

export interface VisualAnnotationComponentProps {
  annotation: VisualAnnotation;
  resolvedPosition: VisualPoint;
  targetPosition?: VisualPoint;
  opacity?: number;
}

interface AnnotationTheme {
  border: string;
  fill: string;
  badgeBg: string;
  badgeText: string;
  textColor: string;
  guideStroke: string;
  tag: string;
}

const THEMES: Record<string, AnnotationTheme> = {
  note: {
    border: 'rgba(56, 189, 248, 0.4)',
    fill: 'rgba(15, 23, 42, 0.85)',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeText: '#38bdf8',
    textColor: '#e2e8f0',
    guideStroke: 'rgba(56, 189, 248, 0.4)',
    tag: 'NOTE',
  },
  observation: {
    border: 'rgba(52, 211, 153, 0.4)',
    fill: 'rgba(15, 23, 42, 0.85)',
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    badgeText: '#34d399',
    textColor: '#e2e8f0',
    guideStroke: 'rgba(52, 211, 153, 0.4)',
    tag: 'OBSERVATION',
  },
  rule: {
    border: 'rgba(251, 191, 36, 0.4)',
    fill: 'rgba(15, 23, 42, 0.85)',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
    badgeText: '#fbbf24',
    textColor: '#fef3c7',
    guideStroke: 'rgba(251, 191, 36, 0.4)',
    tag: 'RULE',
  },
  warning: {
    border: 'rgba(248, 113, 113, 0.4)',
    fill: 'rgba(15, 23, 42, 0.85)',
    badgeBg: 'rgba(248, 113, 113, 0.15)',
    badgeText: '#f87171',
    textColor: '#fee2e2',
    guideStroke: 'rgba(248, 113, 113, 0.4)',
    tag: 'CAUTION',
  },
};

export const VisualAnnotationComponent: React.FC<VisualAnnotationComponentProps> = ({
  annotation,
  resolvedPosition,
  targetPosition,
  opacity = 1,
}) => {
  const theme = THEMES[annotation.calloutType] || THEMES.note;
  const x = resolvedPosition.x;
  const y = resolvedPosition.y;

  const boxWidth = 180;
  const boxHeight = 56;

  return (
    <g
      id={`annotation-${annotation.id}`}
      opacity={opacity}
      className="visual-annotation-primitive"
    >
      {/* Optional Pointer/Guide Line to Target Element */}
      {targetPosition && (
        <line
          x1={x}
          y1={y}
          x2={targetPosition.x}
          y2={targetPosition.y}
          stroke={theme.guideStroke}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}

      {/* Target Marker Dot */}
      {targetPosition && (
        <circle
          cx={targetPosition.x}
          cy={targetPosition.y}
          r={3}
          fill={theme.badgeText}
        />
      )}

      {/* Annotation Box */}
      <rect
        x={x}
        y={y}
        width={boxWidth}
        height={boxHeight}
        rx={5}
        fill={theme.fill}
        stroke={theme.border}
        strokeWidth={1}
      />

      {/* Tag Badge */}
      <rect
        x={x + 8}
        y={y + 8}
        width={theme.tag.length * 6.5 + 8}
        height={14}
        rx={3}
        fill={theme.badgeBg}
      />
      <text
        x={x + 12}
        y={y + 19}
        fill={theme.badgeText}
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="0.05em"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
      >
        {theme.tag}
      </text>

      {/* Annotation Text */}
      <text
        x={x + 8}
        y={y + 36}
        fill={theme.textColor}
        fontSize="10"
        fontWeight="400"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
      >
        {annotation.text.length > 28 ? `${annotation.text.slice(0, 26)}...` : annotation.text}
      </text>
    </g>
  );
};
