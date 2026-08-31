import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";
import { AvatarPlaceholder } from "../common/AvatarPlaceholder";

export const IntroScene: React.FC<{ scene: Scene; title: string }> = ({ scene, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 12 } });
  const cardSpring = spring({ frame: frame - 10, fps, config: { damping: 14 } });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "100px 100px 140px 100px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, maxWidth: "62%" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(56, 189, 248, 0.15)",
            border: "1px solid #38bdf8",
            borderRadius: 8,
            padding: "6px 16px",
            color: "#38bdf8",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            transform: `scale(${titleSpring})`,
          }}
        >
          ✨ NEW LESSON
        </div>

        <h1
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 20px 0",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            opacity: titleSpring,
          }}
        >
          {scene.heading || title}
        </h1>

        {scene.subheading && (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              padding: "18px 24px",
              color: "#cbd5e1",
              fontSize: 24,
              lineHeight: 1.4,
              transform: `scale(${cardSpring})`,
              opacity: cardSpring,
            }}
          >
            🎯 <strong>Goal:</strong> {scene.subheading}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", flex: 0.8 }}>
        <AvatarPlaceholder expression="friendly" size={320} />
      </div>
    </div>
  );
};