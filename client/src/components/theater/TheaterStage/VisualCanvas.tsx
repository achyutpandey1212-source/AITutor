import React, { useMemo } from 'react';
import { Player } from '@remotion/player';
import type { TutorVisualState } from '@ai-tutor/shared';
import { LiveClassroomComposition } from '../../../remotion/compositions/LiveClassroomComposition';

export interface VisualCanvasProps {
  visualState: TutorVisualState;
  captionsEnabled?: boolean;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  visualState,
  captionsEnabled = false,
}) => {
  const inputProps = useMemo(
    () => ({ visualState, captionsEnabled }),
    [visualState, captionsEnabled]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#0A0A0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
          objectFit: 'contain',
        }}
        controls={false}
        autoPlay
        loop
      />
    </div>
  );
};
