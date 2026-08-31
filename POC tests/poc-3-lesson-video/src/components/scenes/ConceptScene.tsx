import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";

export const ConceptScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: "100px 90px 140px 90px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#ffffff",
          margin: "0 0 10px 0",
          textAlign: "center",
          transform: `scale(${titleSpring})`,
          opacity: titleSpring,
        }}
      >
        {scene.heading}
      </h2>

      {scene.subheading && (
        <p
          style={{
            fontSize: 24,
            color: "#94a3b8",
            margin: "0 0 35px 0",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {scene.subheading}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            (scene.bullets || []).length > 2 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          gap: 24,
          width: "100%",
        }}
      >
        {(scene.bullets || []).map((bullet, idx) => {
          const cardSpring = spring({
            frame: frame - 10 - idx * 10,
            fps,
            config: { damping: 12 },
          });

          return (
            <div
              key={idx}
              style={{
                background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))",
                border: "1.5px solid rgba(56, 189, 248, 0.3)",
                borderRadius: 16,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
                opacity: cardSpring,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "rgba(56, 189, 248, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "#38bdf8",
                  fontWeight: 700,
                }}
              >
                0{idx + 1}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: "#f1f5f9",
                  fontWeight: 500,
                }}
              >
                {bullet}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};