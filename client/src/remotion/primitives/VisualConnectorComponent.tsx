import React from 'react';
import type { VisualConnector, VisualNode, VisualPoint } from '@ai-tutor/shared';
import { getPerimeterIntersection } from './layout';

export interface VisualConnectorComponentProps {
  connector: VisualConnector;
  fromNode?: VisualNode;
  toNode?: VisualNode;
  fromPosition: VisualPoint;
  toPosition: VisualPoint;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  drawProgress?: number; // 0 to 1 for draw animation
}

export const VisualConnectorComponent: React.FC<VisualConnectorComponentProps> = ({
  connector,
  fromNode,
  toNode,
  fromPosition,
  toPosition,
  stroke = 'rgba(148, 163, 184, 0.65)',
  strokeWidth = 1.5,
  opacity = 1,
  drawProgress = 1,
}) => {
  // Compute perimeter intersection to prevent arrowheads from overlapping node bodies
  const fromShape = fromNode?.shape || 'box';
  const toShape = toNode?.shape || 'box';

  const startPt = getPerimeterIntersection(fromPosition, toPosition, fromShape, 6);
  const endPt = getPerimeterIntersection(toPosition, fromPosition, toShape, 6);

  // Apply draw progress for reveal animations
  const curEndX = startPt.x + (endPt.x - startPt.x) * drawProgress;
  const curEndY = startPt.y + (endPt.y - startPt.y) * drawProgress;

  const style = connector.style || 'solid';
  const strokeDasharray =
    style === 'dashed' ? '6 4' : style === 'dotted' ? '2 4' : undefined;

  const isDirected = connector.directed !== false;
  const isBidirectional = Boolean(connector.bidirectional);

  const markerEnd = isDirected ? 'url(#arrowhead-default)' : undefined;
  const markerStart = isBidirectional ? 'url(#arrowhead-start-default)' : undefined;

  // Midpoint for label
  const midX = (startPt.x + endPt.x) / 2;
  const midY = (startPt.y + endPt.y) / 2;

  return (
    <g
      id={`connector-${connector.id}`}
      opacity={opacity}
      className="visual-connector-primitive"
    >
      {/* Connector Line */}
      <line
        x1={startPt.x}
        y1={startPt.y}
        x2={curEndX}
        y2={curEndY}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        markerEnd={markerEnd}
        markerStart={markerStart}
      />

      {/* Optional Connector Label Badge */}
      {connector.label && drawProgress > 0.5 && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-35}
            y={-10}
            width={70}
            height={20}
            rx={4}
            fill="#0b0f17"
            stroke="rgba(100, 116, 139, 0.4)"
            strokeWidth={0.75}
          />
          <text
            x={0}
            y={1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#cbd5e1"
            fontSize="10"
            fontWeight="500"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
          >
            {connector.label}
          </text>
        </g>
      )}
    </g>
  );
};
