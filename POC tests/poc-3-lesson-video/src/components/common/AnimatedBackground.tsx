import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const AnimatedBackground: React.FC<{ accentColor?: string }> = ({
  accentColor = "#38bdf8",
}) => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 300], [0, 40], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#090d16",
        backgroundImage: `radial-gradient(circle at ${40 + shift * 0.2}% ${30 + shift * 0.1}%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
};
