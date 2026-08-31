import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const SubtitleBox: React.FC<{ narration: string }> = ({ narration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 35,
        left: 60,
        right: 60,
        padding: "18px 26px",
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: "#0284c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 20 }}>🎙️</span>
      </div>
      <p
        style={{
          margin: 0,
          color: "#f8fafc",
          fontSize: 22,
          lineHeight: 1.45,
          fontWeight: 500,
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        {narration}
      </p>
    </div>
  );
};
