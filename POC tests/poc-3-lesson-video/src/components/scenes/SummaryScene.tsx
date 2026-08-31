import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";
import { AvatarPlaceholder } from "../common/AvatarPlaceholder";

export const SummaryScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 12 } });

  const points = scene.summaryPoints || scene.bullets || [
    "Force produces acceleration on any mass.",
    "Formula: F = m × a (measured in Newtons).",
    "Heavier objects need more force to achieve the same speed.",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "90px 90px 140px 90px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1.2, maxWidth: "62%" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid #22c55e",
            borderRadius: 8,
            padding: "6px 16px",
            color: "#4ade80",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          🎓 LESSON RECAP
        </div>

        <h2
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 24px 0",
            transform: `scale(${titleSpring})`,
          }}
        >
          {scene.heading || "Key Takeaways"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {points.map((pt, idx) => {
            const ptSpring = spring({
              frame: frame - 15 - idx * 12,
              fps,
              config: { damping: 12 },
            });

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(30, 41, 59, 0.75)",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  fontSize: 22,
                  color: "#f8fafc",
                  transform: `translateX(${interpolate(ptSpring, [0, 1], [-30, 0])}px)`,
                  opacity: ptSpring,
                }}
              >
                <span style={{ fontSize: 24, color: "#22c55e" }}>⭐</span>
                <span>{pt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", flex: 0.8 }}>
        <AvatarPlaceholder expression="enthusiastic" size={330} />
      </div>
    </div>
  );
};