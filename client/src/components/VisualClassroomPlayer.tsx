import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import type { TutorVisualState, TutorVisualType } from '@ai-tutor/shared';
import { LiveClassroomComposition } from '../remotion/compositions/LiveClassroomComposition';

export interface VisualClassroomPlayerProps {
  visualState: TutorVisualState;
  onSelectScene?: (type: TutorVisualType) => void;
  onRunDemoFlow?: () => void;
  isDemoRunning?: boolean;
}

export const VisualClassroomPlayer: React.FC<VisualClassroomPlayerProps> = ({
  visualState,
  onSelectScene,
  onRunDemoFlow,
  isDemoRunning = false,
}) => {
  // Input props passed deterministically to the Remotion Composition
  const inputProps = useMemo(() => ({ visualState }), [visualState]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '480px',
        background: '#0f172a',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Remotion Player Viewport */}
      <div
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          background: '#070b14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Player
          component={LiveClassroomComposition as React.ComponentType<any>}
          inputProps={inputProps}
          durationInFrames={300}
          fps={30}
          compositionWidth={1280}
          compositionHeight={720}
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '16/9',
            maxHeight: '100%',
          }}
          controls={false}
          autoPlay
          loop
        />
      </div>

      {/* Developer Verification & Scene Switcher Toolbar */}
      <div
        style={{
          padding: '0.6rem 1rem',
          background: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
            SCENE:
          </span>
          {(['TITLE', 'TEXT', 'DIAGRAM', 'FORMULA', 'HIGHLIGHT', 'RECAP', 'ILLUSTRATION'] as TutorVisualType[]).map((sceneType) => {
            const isActive = visualState.visualType === sceneType;
            return (
              <button
                key={sceneType}
                type="button"
                onClick={() => onSelectScene?.(sceneType)}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border: isActive ? '1px solid #38bdf8' : '1px solid #475569',
                  background: isActive ? '#0284c7' : '#334155',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {sceneType}
              </button>
            );
          })}
          {(visualState.totalBeats || 1) > 1 && (
            <span
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.72rem',
                color: '#a5b4fc',
                fontWeight: 600,
              }}
            >
              Beat {(visualState.activeBeatIndex || 0) + 1} of {visualState.totalBeats}
            </span>
          )}
        </div>

        {onRunDemoFlow && (
          <button
            type="button"
            onClick={onRunDemoFlow}
            disabled={isDemoRunning}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: isDemoRunning ? '#d97706' : '#2563eb',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isDemoRunning ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {isDemoRunning ? '⏳ Playing Demo Flow...' : '▶ Run Demo Flow (Title → Assessment)'}
          </button>
        )}
      </div>
    </div>
  );
};
