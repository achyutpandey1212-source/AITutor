import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";
import { AvatarPlaceholder } from "../common/AvatarPlaceholder";

export const AvatarScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "100px 90px 140px 90px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 0.8, display: "flex", justifyContent: "center" }}>
        <AvatarPlaceholder
          expression={scene.avatar?.expression || "explaining"}
          size={340}
        />
      </div>

      <div style={{ flex: 1.2, maxWidth: "60%" }}>
        <h2
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#38bdf8",
            margin: "0 0 24px 0",
          }}
        >
          {scene.heading}
        </h2>

        {scene.subheading && (
          <p style={{ fontSize: 24, color: "#94a3b8", margin: "0 0 24px 0" }}>
            {scene.subheading}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(scene.bullets || []).map((bullet, idx) => {
            const bulletSpring = spring({
              frame: frame - 15 - idx * 12,
              fps,
              config: { damping: 14 },
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
                  transform: `translateX(${interpolate(bulletSpring, [0, 1], [40, 0])}px)`,
                  opacity: bulletSpring,
                }}
              >
                <span style={{ fontSize: 24, color: "#38bdf8" }}>💡</span>
                <span>{bullet}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};