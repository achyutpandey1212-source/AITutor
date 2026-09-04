import React from 'react';
import { IconCheck } from '../TheaterIcons';

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
        padding: '0.45rem 1rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
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
              {/* Step Item */}
              <button
                onClick={() => isCompleted && onSelectStep?.(step.id)}
                disabled={!isCompleted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: isActive
                    ? '0.3rem 0.75rem 0.3rem 0.35rem'
                    : '0.25rem 0.65rem 0.25rem 0.35rem',
                  borderRadius: 'var(--theater-radius-pill)',
                  background: isActive
                    ? 'var(--theater-surface-elevated)'
                    : isCompleted
                    ? 'var(--theater-surface)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid var(--theater-accent)'
                    : isCompleted
                    ? '1px solid var(--theater-border-subtle)'
                    : '1px solid transparent',
                  cursor: isCompleted ? 'pointer' : 'default',
                  transition: 'all var(--theater-transition-fast)',
                }}
                title={
                  isCompleted
                    ? `Click to replay ${step.title}`
                    : isActive
                    ? `Currently learning: ${step.title}`
                    : `Upcoming: ${step.title}`
                }
              >
                {/* Number Badge or Checkmark */}
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isActive
                      ? 'var(--theater-accent)'
                      : isCompleted
                      ? 'var(--theater-accent-mint-subtle)'
                      : 'var(--theater-surface-hover)',
                    color: isActive
                      ? 'var(--theater-accent-contrast)'
                      : isCompleted
                      ? 'var(--theater-accent-mint)'
                      : 'var(--theater-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                  }}
                >
                  {isCompleted ? <IconCheck size={11} /> : step.number}
                </div>

                {/* Step Title */}
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                    color: isActive
                      ? 'var(--theater-text-primary)'
                      : isCompleted
                      ? 'var(--theater-text-secondary)'
                      : 'var(--theater-text-muted)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {step.title}
                </span>
              </button>

              {/* Subtle Connecting Line */}
              {hasNext && (
                <div
                  style={{
                    width: '16px',
                    height: '1px',
                    background: isCompleted
                      ? 'var(--theater-accent-mint)'
                      : 'var(--theater-border-subtle)',
                    opacity: isCompleted ? 0.4 : 1,
                    transition: 'all var(--theater-transition-fast)',
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
