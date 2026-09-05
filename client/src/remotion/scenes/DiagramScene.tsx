import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface DiagramSceneProps {
  concept?: string;
  label?: string;
}

export const DiagramScene: React.FC<DiagramSceneProps> = ({
  concept = 'Refraction at Interface',
  label = 'Ray Diagram: Air to Glass',
}) => {
  const frame = useCurrentFrame();

  // Ray drawing animations
  const incidentProgress = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const refractedProgress = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const labelsOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' });

  // Geometry: center boundary at y=160, point of incidence at (260, 160)
  // Incident ray start: (100, 40), end: (260, 160)
  const incStartX = 110;
  const incStartY = 50;
  const incEndX = 260;
  const incEndY = 160;

  const currentIncX = incStartX + (incEndX - incStartX) * incidentProgress;
  const currentIncY = incStartY + (incEndY - incStartY) * incidentProgress;

  // Refracted ray start: (260, 160), end: (340, 270) (steeper downwards, bending toward normal)
  const refStartX = 260;
  const refStartY = 160;
  const refEndX = 330;
  const refEndY = 270;

  const currentRefX = refStartX + (refEndX - refStartX) * refractedProgress;
  const currentRefY = refStartY + (refEndY - refStartY) * refractedProgress;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '1.25rem 2rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '880px',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {concept}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '0.98rem' }}>{label}</span>
      </div>

      {/* SVG Diagram Canvas */}
      <svg
        viewBox="0 0 520 310"
        style={{
          width: '100%',
          maxWidth: '880px',
          height: '400px',
          background: '#090d16',
          borderRadius: '16px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
        }}
      >
        <defs>
          <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </linearGradient>
          <marker
            id="arrowInc"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
          </marker>
          <marker
            id="arrowRef"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Medium Regions */}
        {/* Air Area (Top) */}
        <rect x="0" y="0" width="520" height="160" fill="transparent" />
        <text x="25" y="40" fill="#94a3b8" fontSize="13" fontWeight="700" letterSpacing="1">
          AIR (Rarer Medium, n₁ = 1.0)
        </text>

        {/* Glass Area (Bottom) */}
        <rect x="0" y="160" width="520" height="150" fill="url(#glassGradient)" />
        <text x="25" y="290" fill="#60a5fa" fontSize="13" fontWeight="700" letterSpacing="1">
          GLASS (Denser Medium, n₂ = 1.5)
        </text>

        {/* Interface Boundary Line */}
        <line x1="10" y1="160" x2="510" y2="160" stroke="#475569" strokeWidth="2.5" />
        <text x="430" y="152" fill="#64748b" fontSize="11">
          Interface
        </text>

        {/* Normal Line (Perpendicular Dashed) */}
        <line
          x1="260"
          y1="20"
          x2="260"
          y2="300"
          stroke="#ef4444"
          strokeWidth="1.75"
          strokeDasharray="5,4"
        />
        <text x="265" y="32" fill="#f87171" fontSize="11" fontWeight="600">
          Normal (N)
        </text>

        {/* Incident Ray */}
        <line
          x1={incStartX}
          y1={incStartY}
          x2={currentIncX}
          y2={currentIncY}
          stroke="#facc15"
          strokeWidth="3.5"
          markerEnd={incidentProgress > 0.5 ? 'url(#arrowInc)' : undefined}
        />
        {labelsOpacity > 0 && (
          <g opacity={labelsOpacity}>
            <text x="80" y="85" fill="#facc15" fontSize="12" fontWeight="700">
              Incident Ray
            </text>
            {/* Angle of incidence arc note */}
            <path d="M 235 160 A 25 25 0 0 1 245 138" fill="none" stroke="#facc15" strokeWidth="1.5" />
            <text x="236" y="130" fill="#facc15" fontSize="12" fontWeight="700">
              θᵢ
            </text>
          </g>
        )}

        {/* Refracted Ray */}
        {incidentProgress >= 0.8 && (
          <line
            x1={refStartX}
            y1={refStartY}
            x2={currentRefX}
            y2={currentRefY}
            stroke="#38bdf8"
            strokeWidth="3.5"
            markerEnd={refractedProgress > 0.5 ? 'url(#arrowRef)' : undefined}
          />
        )}
        {labelsOpacity > 0 && (
          <g opacity={labelsOpacity}>
            <text x="350" y="240" fill="#38bdf8" fontSize="12" fontWeight="700">
              Refracted Ray
            </text>
            {/* Angle of refraction arc note */}
            <path d="M 260 195 A 35 35 0 0 0 282 188" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="278" y="212" fill="#38bdf8" fontSize="12" fontWeight="700">
              θᵣ
            </text>
          </g>
        )}

        {/* Point of incidence dot */}
        <circle cx="260" cy="160" r="4.5" fill="#ffffff" />
      </svg>

      {/* Observation takeaway badge */}
      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.65rem 1.4rem',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '10px',
          color: '#e2e8f0',
          fontSize: '1rem',
          fontWeight: 550,
          textAlign: 'center',
          maxWidth: '880px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        💡 <strong>Observation:</strong> Light ray slows down in glass and bends <em>towards the normal</em> (θᵣ &lt; θᵢ).
      </div>
    </div>
  );
};
