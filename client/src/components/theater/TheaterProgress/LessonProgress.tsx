import React from 'react';

export interface ConceptStep {
  id: string;
  number: string;
  title: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface LessonProgressProps {
  steps: ConceptStep[];
  onSelectStep?: (stepId: string) => void;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  steps,
  onSelectStep,
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.65rem 1rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        userSelect: 'none',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          minWidth: 'fit-content',
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const hasNext = index < steps.length - 1;

          return (
            <React.Fragment key={step.id || index}>
              {/* Step Pill */}
              <div
                onClick={() => isCompleted && onSelectStep?.(step.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: isActive
                    ? '0.35rem 0.85rem 0.35rem 0.4rem'
                    : '0.3rem 0.75rem 0.3rem 0.4rem',
                  borderRadius: '999px',
                  background: isActive
                    ? 'rgba(226, 157, 75, 0.1)'
                    : isCompleted
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(226, 157, 75, 0.35)'
                    : isCompleted
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid transparent',
                  boxShadow: isActive
                    ? '0 0 16px rgba(226, 157, 75, 0.12)'
                    : 'none',
                  cursor: isCompleted ? 'pointer' : 'default',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                title={
                  isCompleted
                    ? `Click to replay ${step.title}`
                    : isActive
                    ? `Currently learning ${step.title}`
                    : `Upcoming: ${step.title}`
                }
              >
                {/* Number Badge or Checkmark */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isActive
                      ? '#E29D4B'
                      : isCompleted
                      ? 'rgba(85, 201, 138, 0.12)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isActive
                      ? '#080808'
                      : isCompleted
                      ? '#55C98A'
                      : '#777773',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--theater-font-sans)',
                  }}
                >
                  {isCompleted ? '✓' : step.number}
                </div>

                {/* Step Title */}
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                    color: isActive
                      ? '#F5F5F2'
                      : isCompleted
                      ? '#B8B8B3'
                      : '#777773',
                    fontFamily: 'var(--theater-font-sans)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                  }}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Line */}
              {hasNext && (
                <div
                  style={{
                    width: '24px',
                    height: '1px',
                    background: isCompleted
                      ? 'rgba(85, 201, 138, 0.25)'
                      : 'rgba(255, 255, 255, 0.07)',
                    transition: 'all 0.25s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
