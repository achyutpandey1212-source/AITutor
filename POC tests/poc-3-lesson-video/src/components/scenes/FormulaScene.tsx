import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";

export const FormulaScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const formulaSpring = spring({ frame, fps, config: { damping: 10, stiffness: 100 } });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: "90px 80px 140px 80px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "#94a3b8",
          margin: "0 0 16px 0",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {scene.heading}
      </h2>

      <div
        style={{
          background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))",
          border: "2px solid #38bdf8",
          borderRadius: 20,
          padding: "24px 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 50px rgba(56, 189, 248, 0.3)",
          transform: `scale(${formulaSpring})`,
          marginBottom: 30,
        }}
      >
        <span
          style={{
            fontSize: 78,
            fontWeight: 900,
            fontFamily: "'Courier New', Courier, monospace",
            color: "#ffffff",
            letterSpacing: "0.05em",
            textShadow: "0 4px 20px rgba(56, 189, 248, 0.8)",
          }}
        >
          {scene.formula || "F = m · a"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          width: "100%",
        }}
      >
        {(scene.formulaBreakdown || []).map((item, idx) => {
          const itemSpring = spring({
            frame: frame - 15 - idx * 10,
            fps,
            config: { damping: 12 },
          });

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                maxWidth: 280,
                background: "rgba(30, 41, 59, 0.85)",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `translateY(${interpolate(itemSpring, [0, 1], [30, 0])}px)`,
                opacity: itemSpring,
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: "#38bdf8",
                  fontFamily: "monospace",
                  marginBottom: 6,
                }}
              >
                {item.symbol}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#f8fafc",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {item.meaning}
              </div>
              {item.unit && (
                <div
                  style={{
                    fontSize: 15,
                    color: "#94a3b8",
                    background: "rgba(15, 23, 42, 0.8)",
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  Unit: {item.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};