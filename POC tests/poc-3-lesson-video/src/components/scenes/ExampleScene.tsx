import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";

export const ExampleScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const data = scene.exampleData || {
    problem: "Calculate the force required to accelerate a 4 kg mass at 5 m/s².",
    given: ["Mass (m) = 4 kg", "Acceleration (a) = 5 m/s²"],
    steps: ["Formula: F = m × a", "Calculation: F = 4 kg × 5 m/s²"],
    answer: "Force (F) = 20 N",
  };

  const problemSpring = spring({ frame, fps, config: { damping: 12 } });
  const givenSpring = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const stepsSpring = spring({ frame: frame - 25, fps, config: { damping: 12 } });
  const answerSpring = spring({ frame: frame - 40, fps, config: { damping: 10, stiffness: 120 } });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: "85px 80px 140px 80px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#6366f1",
          color: "#ffffff",
          padding: "4px 14px",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        WORKED EXAMPLE
      </div>

      <h2 style={{ fontSize: 38, fontWeight: 800, color: "#ffffff", margin: "0 0 20px 0" }}>
        {scene.heading}
      </h2>

      <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 960 }}>
        <div
          style={{
            flex: 1,
            background: "rgba(30, 41, 59, 0.8)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: 14,
            padding: "20px 24px",
            transform: `scale(${problemSpring})`,
            opacity: problemSpring,
          }}
        >
          <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            📝 Problem Statement
          </div>
          <p style={{ margin: "0 0 16px 0", color: "#f8fafc", fontSize: 20, lineHeight: 1.4 }}>
            {data.problem}
          </p>

          <div style={{ color: "#a5b4fc", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            📌 Given:
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#cbd5e1", fontSize: 19 }}>
            {data.given.map((g, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: 14,
              padding: "18px 24px",
              transform: `scale(${stepsSpring})`,
              opacity: stepsSpring,
            }}
          >
            <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              ⚙️ Solution Steps:
            </div>
            {data.steps.map((st, i) => (
              <div
                key={i}
                style={{
                  fontSize: 20,
                  color: "#e2e8f0",
                  fontFamily: "monospace",
                  marginBottom: 6,
                }}
              >
                {st}
              </div>
            ))}
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.3))",
              border: "2px solid #22c55e",
              borderRadius: 14,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: `scale(${answerSpring})`,
              opacity: answerSpring,
            }}
          >
            <span style={{ color: "#86efac", fontWeight: 700, fontSize: 18 }}>
              ✅ Result:
            </span>
            <span
              style={{
                color: "#ffffff",
                fontWeight: 900,
                fontSize: 26,
                fontFamily: "monospace",
              }}
            >
              {data.answer}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};