import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TutorVisualData } from '../types/visual.types';

export interface FlowchartSceneProps {
  data?: TutorVisualData;
}

export const FlowchartScene: React.FC<FlowchartSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = data?.title || 'Process Flow';
  const nodes = data?.nodes || [
    { id: '1', label: 'Initial State', type: 'start' as const },
    { id: '2', label: 'Process / Reaction', type: 'step' as const },
    { id: '3', label: 'Final Outcome', type: 'result' as const },
  ];

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 15], [-12, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 32px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Title Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          marginBottom: '28px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '3px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          Flowchart & Process
        </span>
        <h2
          style={{
            color: '#f8fafc',
            fontSize: '22px',
            fontWeight: 700,
            margin: '8px 0 0 0',
          }}
        >
          {title}
        </h2>
      </div>

      {/* Sequential Flow Nodes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          maxWidth: '90%',
        }}
      >
        {nodes.map((node: any, index: number) => {
          const delay = 10 + index * 12;
          const nodeSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          const isStart = node.type === 'start';
          const isResult = node.type === 'result';

          const borderColor = isStart
            ? 'rgba(56, 189, 248, 0.5)'
            : isResult
            ? 'rgba(74, 222, 128, 0.5)'
            : 'rgba(148, 163, 184, 0.25)';

          const bgColor = isStart
            ? 'rgba(14, 165, 233, 0.12)'
            : isResult
            ? 'rgba(34, 197, 94, 0.12)'
            : 'rgba(30, 41, 59, 0.7)';

          return (
            <React.Fragment key={node.id || index}>
              {/* Flowchart Node Box */}
              <div
                style={{
                  opacity: nodeSpring,
                  transform: `scale(${0.85 + nodeSpring * 0.15}) translateY(${(1 - nodeSpring) * 10}px)`,
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '12px 18px',
                  minWidth: '130px',
                  maxWidth: '180px',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                    fontWeight: 600,
                  }}
                >
                  Step {index + 1}
                </div>
                <div
                  style={{
                    color: '#f1f5f9',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {node.label}
                </div>
                {node.subtext && (
                  <div
                    style={{
                      color: '#94a3b8',
                      fontSize: '11px',
                      marginTop: '4px',
                    }}
                  >
                    {node.subtext}
                  </div>
                )}
              </div>

              {/* Arrow Connector (if not last) */}
              {index < nodes.length - 1 && (
                <div
                  style={{
                    opacity: interpolate(frame, [delay + 6, delay + 14], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
