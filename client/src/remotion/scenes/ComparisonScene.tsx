import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TutorVisualData } from '../types/visual.types';

export interface ComparisonSceneProps {
  data?: TutorVisualData;
}

export const ComparisonScene: React.FC<ComparisonSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = data?.title || 'Concept Comparison';
  const comparison = data?.comparison || {
    leftTitle: 'Concept A',
    rightTitle: 'Concept B',
    items: [
      { feature: 'Governing Rule', leftValue: 'Condition A', rightValue: 'Condition B' },
      { feature: 'Medium Dependence', leftValue: 'Low', rightValue: 'High' },
      { feature: 'Key Application', leftValue: 'Mirrors & reflection', rightValue: 'Lenses & refraction' },
    ],
  };

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const leftSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const rightSpring = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

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
      {/* Header */}
      <div
        style={{
          opacity: titleSpring,
          transform: `scale(${0.9 + titleSpring * 0.1})`,
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#a855f7',
            background: 'rgba(168, 85, 247, 0.12)',
            padding: '3px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        >
          Side-by-Side Comparison
        </span>
        <h2
          style={{
            color: '#f8fafc',
            fontSize: '20px',
            fontWeight: 700,
            margin: '6px 0 0 0',
          }}
        >
          {title}
        </h2>
      </div>

      {/* Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          width: '100%',
          maxWidth: '680px',
        }}
      >
        {/* Left Card */}
        <div
          style={{
            opacity: leftSpring,
            transform: `translateX(${(1 - leftSpring) * -20}px)`,
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#38bdf8',
              borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
              paddingBottom: '8px',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {comparison.leftTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {comparison.items.map((item: any, i: number) => (
              <div key={i} style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                  {item.feature}:
                </span>
                <span style={{ color: '#f1f5f9' }}>{item.leftValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card */}
        <div
          style={{
            opacity: rightSpring,
            transform: `translateX(${(1 - rightSpring) * 20}px)`,
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#c084fc',
              borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
              paddingBottom: '8px',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {comparison.rightTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {comparison.items.map((item: any, i: number) => (
              <div key={i} style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                  {item.feature}:
                </span>
                <span style={{ color: '#f1f5f9' }}>{item.rightValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
