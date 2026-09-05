import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TutorVisualData } from '../types/visual.types';

export interface WorkedExampleSceneProps {
  data?: TutorVisualData;
}

export const WorkedExampleScene: React.FC<WorkedExampleSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = data?.title || 'Worked Numerical Example';
  const we = data?.workedExample || {
    problem: 'An object is placed 30 cm in front of a concave mirror of focal length 15 cm. Find image distance v.',
    given: ['u = -30 cm', 'f = -15 cm'],
    formulaUsed: '1/f = 1/v + 1/u',
    steps: [
      { stepNumber: 1, description: 'Given Values', expression: 'u = -30 cm, f = -15 cm' },
      { stepNumber: 2, description: 'Apply Mirror Formula', expression: '1/(-15) = 1/v + 1/(-30)' },
      { stepNumber: 3, description: 'Rearrange for 1/v', expression: '1/v = -1/15 + 1/30 = -1/30' },
      { stepNumber: 4, description: 'Invert for Result', expression: 'v = -30 cm' },
    ],
    finalAnswer: 'v = -30 cm (Real, inverted image formed at center of curvature)',
  };

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 28px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ opacity: titleOpacity, textAlign: 'center', marginBottom: '16px' }}>
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '3px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          Step-by-Step Calculation
        </span>
        <h2
          style={{
            color: '#f8fafc',
            fontSize: '19px',
            fontWeight: 700,
            margin: '6px 0 0 0',
          }}
        >
          {title}
        </h2>
      </div>

      {/* Problem Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '8px',
          padding: '12px 18px',
          marginBottom: '14px',
          fontSize: '14px',
          color: '#cbd5e1',
          lineHeight: 1.45,
        }}
      >
        <strong style={{ color: '#38bdf8' }}>Problem: </strong>
        {we.problem}
      </div>

      {/* Steps Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '14px',
        }}
      >
        {we.steps.map((step: any, idx: number) => {
          const delay = 8 + idx * 10;
          const stepSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          return (
            <div
              key={idx}
              style={{
                opacity: stepSpring,
                transform: `translateX(${(1 - stepSpring) * -12}px)`,
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '6px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
              }}
            >
              <div style={{ color: '#94a3b8', fontWeight: 500 }}>
                <span style={{ color: '#10b981', fontWeight: 700, marginRight: '8px' }}>
                  {step.stepNumber}.
                </span>
                {step.description}
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  color: '#f8fafc',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  fontSize: '12px',
                }}
              >
                {step.expression}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Answer Banner */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateRight: 'clamp' }),
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '8px',
          padding: '12px 18px',
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: 700,
          color: '#34d399',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
        }}
      >
        ✔ {we.finalAnswer}
      </div>
    </div>
  );
};
