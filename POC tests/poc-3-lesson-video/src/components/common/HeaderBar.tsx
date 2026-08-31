import React from "react";

interface HeaderBarProps {
  title: string;
  grade: string;
  subject: string;
  sceneIndex: number;
  totalScenes: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  grade,
  subject,
  sceneIndex,
  totalScenes,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        left: 50,
        right: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.05em",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
          }}
        >
          {grade} • {subject}
        </span>
        <span
          style={{
            color: "#94a3b8",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </div>

      {/* Progress indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#64748b", fontSize: 16, fontWeight: 600 }}>
          Scene {sceneIndex + 1}/{totalScenes}
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === sceneIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= sceneIndex ? "#38bdf8" : "#334155",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
