import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type {
  VisualNode,
  VisualConnector,
  VisualAnnotation,
  VisualGraphAxis,
  VisualDataSeries,
  EquationLine,
  VisualPoint,
} from '@ai-tutor/shared';

import { autoLayoutNodes, type PlotViewport } from './layout';
import { VisualNodeComponent } from './VisualNodeComponent';
import { VisualConnectorComponent } from './VisualConnectorComponent';
import { VisualAnnotationComponent } from './VisualAnnotationComponent';
import { GraphAxesComponent } from './GraphAxesComponent';
import { DataSeriesComponent, DEFAULT_SERIES_PALETTE } from './DataSeriesComponent';
import { EquationComponent } from './EquationComponent';
import { PointPrimitive } from './VectorPrimitives';

/**
 * Safely accesses current Remotion frame or defaults to full reveal (frame 30)
 * when rendered in static React test environments.
 */
function useSafeRemotionFrame(): number {
  try {
    return useCurrentFrame();
  } catch {
    return 30;
  }
}

export interface UniversalPrimitiveRendererProps {
  width?: number;
  height?: number;
  viewBox?: string;

  // Primitives
  nodes?: VisualNode[];
  connectors?: VisualConnector[];
  annotations?: VisualAnnotation[];
  axes?: {
    x: VisualGraphAxis;
    y: VisualGraphAxis;
  };
  series?: VisualDataSeries[];
  equations?: EquationLine[];
  points?: VisualPoint[];

  // Animation directives
  animation?: {
    enterTransition?: 'fade' | 'draw' | 'stagger_reveal' | 'none';
    activeElements?: string[];
  };

  className?: string;
  style?: React.CSSProperties;
}

export const UniversalPrimitiveRenderer: React.FC<UniversalPrimitiveRendererProps> = ({
  width = 960,
  height = 540,
  viewBox,
  nodes = [],
  connectors = [],
  annotations = [],
  axes,
  series = [],
  equations = [],
  points = [],
  animation = { enterTransition: 'fade', activeElements: [] },
  className = '',
  style = {},
}) => {
  const frame = useSafeRemotionFrame();

  const enterTransition = animation.enterTransition || 'fade';
  const activeElements = animation.activeElements || [];

  // Global enter animation factor
  const globalFade =
    enterTransition === 'none'
      ? 1
      : interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const drawProgress =
    enterTransition === 'draw'
      ? interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' })
      : 1;

  // 1. Resolve Node Positions (Deterministic Auto-layout if omitted)
  const resolvedPositions = React.useMemo(() => {
    return autoLayoutNodes(nodes, width - 80, height - 80);
  }, [nodes, width, height]);

  // Node lookup map for connector endpoint resolution
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, VisualNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  // 2. Resolve Graph Viewport if axes exist
  const graphViewport: PlotViewport = React.useMemo(() => {
    return {
      x: 90,
      y: 50,
      width: width - 180,
      height: height - 120,
    };
  }, [width, height]);

  // 3. Staggered node animation calculation
  const getNodeAnim = (_nodeId: string, index: number) => {
    if (enterTransition === 'stagger_reveal') {
      const delay = index * 4;
      const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
        extrapolateRight: 'clamp',
      });
      const scale = interpolate(frame, [delay, delay + 10], [0.9, 1], {
        extrapolateRight: 'clamp',
      });
      return { opacity, scale };
    }
    return { opacity: globalFade, scale: 1 };
  };

  const vBox = viewBox || `0 0 ${width} ${height}`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'transparent',
        ...style,
      }}
      className={`universal-primitive-renderer ${className}`}
    >
      <svg
        viewBox={vBox}
        width="100%"
        height="100%"
        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* SVG Marker Definitions for Connectors and Axes */}
        <defs>
          {/* Default Forward Arrowhead */}
          <marker
            id="arrowhead-default"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="rgba(148, 163, 184, 0.85)" />
          </marker>

          {/* Default Reverse Arrowhead (for bidirectional) */}
          <marker
            id="arrowhead-start-default"
            viewBox="0 0 10 10"
            refX="1"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="rgba(148, 163, 184, 0.85)" />
          </marker>

          {/* Graph Axis Arrowhead */}
          <marker
            id="arrowhead-axis"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1 L 8 4 L 0 7 z" fill="rgba(148, 163, 184, 0.7)" />
          </marker>
        </defs>

        {/* LAYER 1: Graph Axes & Grid */}
        {axes && (
          <GraphAxesComponent
            xAxis={axes.x}
            yAxis={axes.y}
            viewport={graphViewport}
            opacity={globalFade}
          />
        )}

        {/* LAYER 2: Data Series */}
        {axes &&
          series.map((s, idx) => (
            <DataSeriesComponent
              key={s.id || idx}
              series={s}
              xAxis={axes.x}
              yAxis={axes.y}
              viewport={graphViewport}
              color={DEFAULT_SERIES_PALETTE[idx % DEFAULT_SERIES_PALETTE.length]}
              drawProgress={drawProgress}
              opacity={globalFade}
            />
          ))}

        {/* LAYER 3: Connectors between nodes */}
        {connectors.map((connector, cIdx) => {
          const fromPos = resolvedPositions.get(connector.fromNodeId);
          const toPos = resolvedPositions.get(connector.toNodeId);

          if (!fromPos || !toPos) {
            return null;
          }

          let connectorProgress = drawProgress;
          let connectorOpacity = globalFade;

          if (enterTransition === 'stagger_reveal') {
            const startDelay = cIdx * 4 + 2;
            connectorProgress = interpolate(frame, [startDelay, startDelay + 8], [0, 1], {
              extrapolateRight: 'clamp',
            });
            connectorOpacity = interpolate(frame, [startDelay, startDelay + 6], [0, 1], {
              extrapolateRight: 'clamp',
            });
          }

          return (
            <VisualConnectorComponent
              key={connector.id}
              connector={connector}
              fromNode={nodeMap.get(connector.fromNodeId)}
              toNode={nodeMap.get(connector.toNodeId)}
              fromPosition={fromPos}
              toPosition={toPos}
              drawProgress={connectorProgress}
              opacity={connectorOpacity}
            />
          );
        })}

        {/* LAYER 4: Visual Nodes */}
        {nodes.map((node, index) => {
          const pos = resolvedPositions.get(node.id) || { x: width / 2, y: height / 2 };
          const isActive = activeElements.includes(node.id);
          const { opacity, scale } = getNodeAnim(node.id, index);

          return (
            <VisualNodeComponent
              key={node.id}
              node={node}
              resolvedPosition={pos}
              isActive={isActive}
              opacity={opacity}
              scale={scale}
            />
          );
        })}

        {/* LAYER 5: Vector Points */}
        {points.map((pt, idx) => (
          <PointPrimitive
            key={`pt-${idx}`}
            x={pt.x}
            y={pt.y}
            opacity={globalFade}
          />
        ))}

        {/* LAYER 6: Annotations & Callouts */}
        {annotations.map((ann) => {
          const resolvedPos = ann.position || { x: 50, y: height - 100 };
          const targetPos = ann.targetId ? resolvedPositions.get(ann.targetId) : undefined;

          return (
            <VisualAnnotationComponent
              key={ann.id}
              annotation={ann}
              resolvedPosition={resolvedPos}
              targetPosition={targetPos}
              opacity={globalFade}
            />
          );
        })}

        {/* LAYER 7: Equations */}
        {equations.length > 0 && (
          <EquationComponent
            equations={equations}
            x={Math.max(40, (width - 640) / 2)}
            y={Math.max(40, (height - equations.length * 52) / 2)}
            width={Math.min(640, width - 80)}
            opacity={globalFade}
          />
        )}
      </svg>
    </div>
  );
};
