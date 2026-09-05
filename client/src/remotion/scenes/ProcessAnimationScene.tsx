import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type { TutorVisualData } from '../types/visual.types';

export interface ProcessAnimationSceneProps {
  data?: TutorVisualData;
}

export const ProcessAnimationScene: React.FC<ProcessAnimationSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();

  const title = data?.title || 'Light Wave Refraction Process';
  const stages = data?.processAnimation?.stages || [
    { stageNumber: 1, label: 'Medium 1 (Air)', description: 'Light approaches boundary at angle θi' },
    { stageNumber: 2, label: 'Boundary Interface', description: 'Wavefront slows down in denser medium' },
    { stageNumber: 3, label: 'Medium 2 (Glass)', description: 'Ray bends towards the normal line' },
  ];

  // Ray progress animation from frame 0 to 60
  const rayProgress = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });

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
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#f59e0b',
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '3px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          Dynamic Process Simulation
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

      {/* Interactive Vector Canvas */}
      <div
        style={{
          width: '640px',
          height: '260px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        {/* Boundary Interface Line */}
        <div
          style={{
            position: 'absolute',
            top: '130px',
            left: '0',
            width: '100%',
            height: '2px',
            background: 'rgba(56, 189, 248, 0.6)',
          }}
        />
        {/* Normal Line (Dashed) */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '320px',
            width: '2px',
            height: '220px',
            borderLeft: '2px dashed rgba(148, 163, 184, 0.4)',
          }}
        />

        {/* Medium Labels */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', fontSize: '13px', color: '#94a3b8' }}>
          Medium 1 (Rare, Speed v₁)
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', fontSize: '13px', color: '#38bdf8' }}>
          Medium 2 (Dense, Speed v₂ &lt; v₁)
        </div>

        {/* Dynamic Vector Ray */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Incident segment */}
          <line
            x1="120"
            y1="40"
            x2={Math.min(320, 120 + rayProgress * 400)}
            y2={Math.min(130, 40 + rayProgress * 180)}
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Refracted segment (activates once ray crosses normal boundary at x=320) */}
          {rayProgress > 0.5 && (
            <line
              x1="320"
              y1="130"
              x2={320 + (rayProgress - 0.5) * 260}
              y2={130 + (rayProgress - 0.5) * 160}
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>

      {/* Process Stages Indicators */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          maxWidth: '640px',
          justifyContent: 'center',
        }}
      >
        {stages.map((stage: any, idx: number) => {
          const isActive = (frame / 20) >= idx;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                background: isActive ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${isActive ? 'rgba(245, 158, 11, 0.4)' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '11px',
                textAlign: 'center',
                color: isActive ? '#f8fafc' : '#64748b',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{stage.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{stage.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
