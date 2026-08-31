import React from "react";
import { Audio, Series, useVideoConfig } from "remotion";
import { LessonPlan, Scene } from "./schema/lessonPlanSchema";
import { AnimatedBackground } from "./components/common/AnimatedBackground";
import { HeaderBar } from "./components/common/HeaderBar";
import { SubtitleBox } from "./components/common/SubtitleBox";

import { IntroScene } from "./components/scenes/IntroScene";
import { AvatarScene } from "./components/scenes/AvatarScene";
import { ConceptScene } from "./components/scenes/ConceptScene";
import { FormulaScene } from "./components/scenes/FormulaScene";
import { DiagramScene } from "./components/scenes/DiagramScene";
import { ExampleScene } from "./components/scenes/ExampleScene";
import { QuestionScene } from "./components/scenes/QuestionScene";
import { SummaryScene } from "./components/scenes/SummaryScene";

interface LessonVideoProps {
  plan: LessonPlan;
  audioClips?: Record<string, string>;
}

export const LessonVideo: React.FC<LessonVideoProps> = ({ plan, audioClips = {} }) => {
  const { fps } = useVideoConfig();

  const renderSceneContent = (scene: Scene) => {
    switch (scene.type) {
      case "INTRO":
        return <IntroScene scene={scene} title={plan.title} />;
      case "AVATAR_EXPLANATION":
        return <AvatarScene scene={scene} />;
      case "CONCEPT":
        return <ConceptScene scene={scene} />;
      case "FORMULA":
        return <FormulaScene scene={scene} />;
      case "DIAGRAM":
        return <DiagramScene scene={scene} />;
      case "EXAMPLE":
        return <ExampleScene scene={scene} />;
      case "QUESTION":
        return <QuestionScene scene={scene} />;
      case "SUMMARY":
        return <SummaryScene scene={scene} />;
      default:
        return <ConceptScene scene={scene} />;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#090d16",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <AnimatedBackground />

      <Series>
        {plan.scenes.map((scene, idx) => {
          const durationInFrames = Math.max(30, Math.round(scene.duration * fps));
          const audioSrc = audioClips[scene.id];

          return (
            <Series.Sequence key={scene.id || idx} durationInFrames={durationInFrames}>
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <HeaderBar
                  title={plan.title}
                  grade={plan.grade}
                  subject={plan.subject}
                  sceneIndex={idx}
                  totalScenes={plan.scenes.length}
                />

                {renderSceneContent(scene)}

                <SubtitleBox narration={scene.narration} />

                {audioSrc && <Audio src={audioSrc} />}
              </div>
            </Series.Sequence>
          );
        })}
      </Series>
    </div>
  );
};