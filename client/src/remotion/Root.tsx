import React from 'react';
import { Composition } from 'remotion';
import { LiveClassroomComposition } from './compositions/LiveClassroomComposition';
import { UniversalClassroomComposition } from './compositions/UniversalClassroomComposition';
import { DEFAULT_VISUAL_STATE } from './types/visual.types';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LiveClassroom"
        component={LiveClassroomComposition as React.ComponentType<any>}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          visualState: DEFAULT_VISUAL_STATE,
        }}
      />
      <Composition
        id="UniversalClassroom"
        component={UniversalClassroomComposition as React.ComponentType<any>}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};

