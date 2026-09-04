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
    <nav
      aria-label="Lesson Progression"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.25rem 1rem',
        width: '100%',
        userSelect: 'none',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          minWidth: 'fit-content',
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const hasNext = index < steps.length - 1;

          return (
            <React.Fragment key={step.id || index}>
              <button
                onClick={() => isCompleted && onSelectStep?.(step.id)}
                disabled={!isCompleted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'transparent',
                  border: 'none',
                  padding: '0.2rem 0.35rem',
                  cursor: isCompleted ? 'pointer' : 'default',
                  transition: 'color var(--theater-transition-fast)',
                }}
                title={
                  isCompleted
                    ? `Click to replay: ${step.title}`
                    : isActive
                    ? `Current concept: ${step.title}`
                    : `Upcoming: ${step.title}`
                }
              >
                {/* Tiny active dot */}
                {isActive && (
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--theater-text-primary)',
                      display: 'inline-block',
                    }}
                  />
                )}

                {/* Concept Title */}
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 600 : isCompleted ? 450 : 400,
                    color: isActive
                      ? 'var(--theater-text-primary)'
                      : isCompleted
                      ? 'var(--theater-text-secondary)'
                      : 'var(--theater-text-faint)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {step.title}
                </span>
              </button>

              {/* Minimal Interpunct Divider */}
              {hasNext && (
                <span
                  style={{
                    color: 'var(--theater-text-faint)',
                    fontSize: '0.7rem',
                    opacity: 0.5,
                  }}
                >
                  ·
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
