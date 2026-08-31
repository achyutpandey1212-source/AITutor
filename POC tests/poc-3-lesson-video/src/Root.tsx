import React from "react";
import { Composition } from "remotion";
import { LessonVideo } from "./LessonVideo";
import { LessonPlan } from "./schema/lessonPlanSchema";
import defaultNewtonPlan from "./fixtures/newtonLessonPlan.json";

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  const plan: LessonPlan = defaultNewtonPlan as unknown as LessonPlan;
  const totalSeconds = plan.scenes.reduce((acc, scene) => acc + scene.duration, 0);
  const durationInFrames = Math.max(90, Math.round(totalSeconds * fps));

  return (
    <>
      <Composition
        id="LessonVideo"
        component={LessonVideo as React.FC<any>}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1920}
        height={1080}
        defaultProps={{
          plan,
          audioClips: {},
        }}
        calculateMetadata={({ props }) => {
          const targetPlan = (props?.plan || plan) as LessonPlan;
          const secs = targetPlan.scenes.reduce((acc, scene) => acc + scene.duration, 0);
          return {
            durationInFrames: Math.max(90, Math.round(secs * fps)),
            props: {
              plan: targetPlan,
              audioClips: props?.audioClips || {},
            },
          };
        }}
      />
    </>
  );
};