import React from 'react';

// ---------------------------------------------------------------
// Lumo Skeleton Component
// Calm shimmer loading state matching Lumo surface tokens
// ---------------------------------------------------------------

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        background: 'var(--color-surface-soft)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'translateX(-100%)',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
          animation: 'lumo-shimmer 1.8s infinite',
        }}
      />
      <style>{`
        @keyframes lumo-shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
