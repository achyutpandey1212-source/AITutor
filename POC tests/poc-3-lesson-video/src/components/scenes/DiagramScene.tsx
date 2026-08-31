import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";

export const DiagramScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const diagramType = scene.diagramData?.type || "FORCE_MASS_ACCEL";

  const arrowLength = interpolate(frame, [10, 40], [20, 160], { extrapolateRight: "clamp" });
  const boxX = interpolate(frame, [35, 120], [250, 480], { extrapolateRight: "clamp" });
  const rayGlow = Math.sin(frame / 5) * 5;

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
      <h2
        style={{
          fontSize: 42,
          fontWeight: 800,
          color: "#ffffff",
          margin: "0 0 8px 0",
        }}
      >
        {scene.heading}
      </h2>

      {scene.subheading && (
        <p style={{ fontSize: 22, color: "#94a3b8", margin: "0 0 20px 0" }}>
          {scene.subheading}
        </p>
      )}

      <div
        style={{
          width: 820,
          height: 300,
          background: "rgba(15, 23, 42, 0.75)",
          border: "1.5px solid rgba(56, 189, 248, 0.3)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {diagramType.includes("PHOTOSYNTHESIS") ? (
          <svg width="780" height="270" viewBox="0 0 780 270">
            <circle cx="120" cy="80" r={40 + rayGlow} fill="#f59e0b" opacity="0.9" />
            <text x="120" y="85" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">
              ☀️ Sunlight
            </text>

            <path d="M 160 100 Q 250 120 340 140" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 4" fill="none" />

            <rect x="220" y="190" width="130" height="45" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="285" y="218" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">
              💧 H₂O + 💨 CO₂
            </text>

            <ellipse cx="430" cy="150" rx="90" ry="60" fill="#15803d" stroke="#4ade80" strokeWidth="3" />
            <text x="430" y="145" fill="#ffffff" fontSize="20" fontWeight="bold" textAnchor="middle">
              🍃 Leaf (Chloroplast)
            </text>
            <text x="430" y="168" fill="#dcfce7" fontSize="13" textAnchor="middle">
              Light Energy → Chemical Energy
            </text>

            <path d="M 520 150 L 610 150" stroke="#4ade80" strokeWidth="5" markerEnd="url(#arrowLeaf)" fill="none" />

            <rect x="620" y="125" width="140" height="55" rx="8" fill="#1e293b" stroke="#4ade80" strokeWidth="2" />
            <text x="690" y="150" fill="#4ade80" fontSize="16" fontWeight="bold" textAnchor="middle">
              🍎 Glucose
            </text>
            <text x="690" y="170" fill="#a7f3d0" fontSize="14" textAnchor="middle">
              + 🌬️ Oxygen (O₂)
            </text>

            <defs>
              <marker id="arrowLeaf" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
              </marker>
            </defs>
          </svg>
        ) : (
          <svg width="780" height="270" viewBox="0 0 780 270">
            <line x1="50" y1="210" x2="730" y2="210" stroke="#475569" strokeWidth="4" strokeDasharray="8 6" />

            <g transform={`translate(${boxX - arrowLength - 10}, 145)`}>
              <line x1="0" y1="0" x2={arrowLength} y2="0" stroke="#f43f5e" strokeWidth="8" />
              <polygon
                points={`${arrowLength}, -12 ${arrowLength + 20}, 0 ${arrowLength}, 12`}
                fill="#f43f5e"
              />
              <text x={arrowLength / 2} y="-14" fill="#f43f5e" fontSize="20" fontWeight="bold" textAnchor="middle">
                Applied Force (F)
              </text>
            </g>

            <g transform={`translate(${boxX}, 90)`}>
              <rect
                x="0"
                y="0"
                width="130"
                height="120"
                rx="12"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="3"
              />
              <text x="65" y="55" fill="#ffffff" fontSize="24" fontWeight="bold" textAnchor="middle">
                MASS (m)
              </text>
              <text x="65" y="85" fill="#bae6fd" fontSize="18" textAnchor="middle">
                m = 5 kg
              </text>
            </g>

            <g transform={`translate(${boxX + 20}, 50)`}>
              <line x1="0" y1="0" x2="90" y2="0" stroke="#22c55e" strokeWidth="5" />
              <polygon points="90, -7 104, 0 90, 7" fill="#22c55e" />
              <text x="50" y="-10" fill="#22c55e" fontSize="16" fontWeight="bold" textAnchor="middle">
                Acceleration (a ➜)
              </text>
            </g>
          </svg>
        )}
      </div>
    </div>
  );
};