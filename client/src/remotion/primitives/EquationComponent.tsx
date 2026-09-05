import React from 'react';
import type { EquationLine } from '@ai-tutor/shared';
import { formatLatexFallback } from './layout';

export interface EquationComponentProps {
  equations: EquationLine[];
  x?: number;
  y?: number;
  width?: number;
  lineHeight?: number;
  opacity?: number;
  activeLineIndex?: number;
}

export const EquationComponent: React.FC<EquationComponentProps> = ({
  equations,
  x = 0,
  y = 0,
  width = 600,
  lineHeight = 52,
  opacity = 1,
  activeLineIndex,
}) => {
  return (
    <g
      id="equation-block-primitive"
      opacity={opacity}
      transform={`translate(${x}, ${y})`}
      className="equation-primitive"
    >
      {equations.map((eq, index) => {
        const isActive =
          activeLineIndex !== undefined ? activeLineIndex === index : Boolean(eq.isActiveStep);

        const formattedMath = formatLatexFallback(eq.latex);
        const lineY = index * lineHeight;

        const borderColor = isActive ? 'rgba(56, 189, 248, 0.45)' : 'rgba(51, 65, 85, 0.3)';
        const bgColor = isActive ? 'rgba(14, 165, 233, 0.08)' : 'rgba(15, 23, 42, 0.5)';
        const textColor = isActive ? '#f8fafc' : '#94a3b8';
        const mathColor = isActive ? '#38bdf8' : '#cbd5e1';

        return (
          <g key={eq.id || index} transform={`translate(0, ${lineY})`}>
            {/* Row Container */}
            <rect
              x={0}
              y={0}
              width={width}
              height={lineHeight - 8}
              rx={6}
              fill={bgColor}
              stroke={borderColor}
              strokeWidth={isActive ? 1.5 : 1}
            />

            {/* Active Indicator Bar */}
            {isActive && (
              <rect
                x={0}
                y={6}
                width={3.5}
                height={lineHeight - 20}
                rx={1.75}
                fill="#38bdf8"
              />
            )}

            {/* Step Number Tag */}
            <text
              x={16}
              y={(lineHeight - 8) / 2 + 4}
              fill="#64748b"
              fontSize="11"
              fontWeight="600"
              fontFamily="Inter, monospace"
            >
              {`(${index + 1})`}
            </text>

            {/* Formatted Math Expression */}
            <text
              x={50}
              y={(lineHeight - 8) / 2 + 5}
              fill={mathColor}
              fontSize="15"
              fontWeight="600"
              fontFamily="'Fira Code', 'Courier New', monospace"
              letterSpacing="0.02em"
            >
              {formattedMath}
            </text>

            {/* Optional Step Explanation */}
            {eq.explanation && (
              <text
                x={width - 16}
                y={(lineHeight - 8) / 2 + 4}
                textAnchor="end"
                fill={textColor}
                fontSize="11"
                fontWeight="400"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {eq.explanation}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
