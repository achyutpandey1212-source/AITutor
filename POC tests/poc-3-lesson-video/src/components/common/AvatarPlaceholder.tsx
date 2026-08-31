import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface AvatarProps {
  expression?: "friendly" | "explaining" | "enthusiastic" | "questioning";
  position?: "left" | "right" | "center";
  size?: number;
}

export const AvatarPlaceholder: React.FC<AvatarProps> = ({
  expression = "friendly",
  position = "right",
  size = 280,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 120 },
  });

  // Bobbing / talking animation
  const bobbing = Math.sin(frame / 6) * 4;
  const mouthOpen = Math.abs(Math.sin(frame / 4)) * 8;

  // Eyebrow lift on questioning / enthusiastic
  const browOffset = expression === "questioning" ? -6 : expression === "enthusiastic" ? -4 : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${scale}) translateY(${bobbing}px)`,
        filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.4))",
      }}
    >
      <svg width={size} height={size * 1.15} viewBox="0 0 200 230" fill="none">
        {/* Glow halo */}
        <circle cx="100" cy="95" r="70" fill="url(#avatarGlow)" opacity="0.4" />

        {/* Shoulders / Lab coat */}
        <path
          d="M 30 220 C 30 160, 60 145, 100 145 C 140 145, 170 160, 170 220 Z"
          fill="#1e293b"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        {/* Lab coat collar */}
        <polygon points="100,145 75,185 100,195 125,185" fill="#38bdf8" />
        <polygon points="100,195 90,230 110,230" fill="#0284c7" />

        {/* Head */}
        <circle cx="100" cy="95" r="50" fill="#fed7aa" stroke="#ea580c" strokeWidth="2.5" />

        {/* Hair */}
        <path
          d="M 50 90 C 45 50, 75 35, 100 35 C 125 35, 155 50, 150 90 C 140 60, 60 60, 50 90 Z"
          fill="#334155"
        />

        {/* Eyebrows */}
        <path
          d={`M 70 ${75 + browOffset} Q 80 ${72 + browOffset} 90 ${75 + browOffset}`}
          stroke="#1e293b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d={`M 110 ${75 + (expression === "questioning" ? browOffset - 3 : browOffset)} Q 120 ${72 + browOffset} 130 ${75 + browOffset}`}
          stroke="#1e293b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Eyes / Glasses */}
        <circle cx="80" cy="90" r="12" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
        <circle cx="120" cy="90" r="12" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
        <line x1="92" y1="90" x2="108" y2="90" stroke="#0284c7" strokeWidth="3" />

        {/* Pupils */}
        <circle cx="80" cy="90" r="5" fill="#0f172a" />
        <circle cx="120" cy="90" r="5" fill="#0f172a" />
        <circle cx="82" cy="88" r="2" fill="#ffffff" />
        <circle cx="122" cy="88" r="2" fill="#ffffff" />

        {/* Smile / Mouth */}
        {expression === "enthusiastic" ? (
          <path
            d={`M 85 115 Q 100 ${125 + mouthOpen} 115 115 Z`}
            fill="#e11d48"
            stroke="#9f1239"
            strokeWidth="2"
          />
        ) : (
          <ellipse
            cx="100"
            cy="118"
            rx="12"
            ry={3 + mouthOpen * 0.6}
            fill="#9f1239"
          />
        )}

        <defs>
          <radialGradient id="avatarGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 95) rotate(90) scale(70)">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Name Badge */}
      <div
        style={{
          marginTop: -10,
          background: "rgba(15, 23, 42, 0.9)",
          border: "1.5px solid #38bdf8",
          borderRadius: 20,
          padding: "4px 14px",
          color: "#38bdf8",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.05em",
        }}
      >
        AI TEACHER
      </div>
    </div>
  );
};
