import React, { useState } from 'react';
import type { AssessmentSessionSummary } from './AssessmentSessionScreen';
import { MarkdownRenderer } from '../ai/MarkdownRenderer';
import { Button } from '../ui/Button';

export interface AssessmentResultsScreenProps {
  idToken: string;
  summary: AssessmentSessionSummary;
  onRetake: () => void;
  onBackToLanding: () => void;
  onAskLumo: (doubtContext: {
    subject?: string;
    topic?: string;
    concept?: string;
    question?: string;
    misconception?: string;
    feedback?: string;
  }) => void;
}

export const AssessmentResultsScreen: React.FC<AssessmentResultsScreenProps> = ({
  idToken: _idToken,
  summary,
  onRetake,
  onBackToLanding,
  onAskLumo,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    summary.questions[0]?.questionId || null
  );

  const getScoreHeadline = (accuracy: number) => {
    if (accuracy >= 85) return 'Exceptional Mastery & Retention';
    if (accuracy >= 70) return 'Solid Understanding · Minor Blind Spots';
    if (accuracy >= 50) return 'Developing Intuition · Needs Targeted Review';
    return 'Foundational Gaps Identified';
  };

  const getScoreColor = (accuracy: number) => {
    if (accuracy >= 75) return 'var(--color-mint)';
    if (accuracy >= 50) return 'var(--color-orange)';
    return 'var(--color-error)';
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1rem 4rem' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-text-muted)',
            marginBottom: '6px',
          }}
        >
          Assessment Report
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 6px 0',
          }}
        >
          {getScoreHeadline(summary.accuracy)}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
          {summary.subject} &bull; {summary.topic} &bull;{' '}
          {summary.mode === 'mock'
            ? 'Timed Mock Exam'
            : summary.mode === 'quiz'
            ? 'Conceptual Quiz'
            : 'Targeted Practice'}
        </p>
      </div>

      {/* Primary Score & Metrics Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Main Percentage Circle / Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                border: `3px solid ${getScoreColor(summary.accuracy)}`,
                background: 'var(--color-surface-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: getScoreColor(summary.accuracy),
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {summary.accuracy}%
              </span>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Accuracy
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                Earned {summary.totalMarksEarned} of {summary.totalMarksPossible} marks
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Questions</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {Object.keys(summary.submissions).length} / {summary.questions.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Time Spent</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formatTime(summary.timeSpentSeconds)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Misconceptions</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: summary.identifiedMisconceptions.length > 0 ? 'var(--color-warning)' : 'var(--color-mint)' }}>
                {summary.identifiedMisconceptions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Split */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Strengths */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-mint-soft)',
              border: '1px solid var(--color-mint)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-mint)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &check; Conceptual Strengths
            </div>
            {summary.strengths.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                {summary.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Complete more correct responses to reveal strength areas.
              </div>
            )}
          </div>

          {/* Weaknesses */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-orange-soft)',
              border: '1px solid var(--color-orange)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-orange)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              &rarr; Needs Focus
            </div>
            {summary.weaknesses.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                {summary.weaknesses.map((weak, i) => (
                  <li key={i}>{weak}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--color-mint)', fontWeight: 500 }}>
                &check; No weak concepts detected in this attempt!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Misconceptions Diagnosis Card */}
      {summary.identifiedMisconceptions.length > 0 && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Diagnosed Conceptual Misconceptions ({summary.identifiedMisconceptions.length})
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Lumo detected these specific flaws in reasoning during your assessment. Clarifying them now will prevent recurring mistakes:
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                onAskLumo({
                  subject: summary.subject,
                  topic: summary.topic,
                  misconception: summary.identifiedMisconceptions.join('; '),
                  question: `Can you explain the difference and clear up these misconceptions: ${summary.identifiedMisconceptions.join(', ')}?`,
                })
              }
            >
              ✦ Ask Lumo to Explain &rarr;
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {summary.identifiedMisconceptions.map((misc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: 'var(--color-surface-hover)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                }}
              >
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>•</span>
                <span>{misc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Review List */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Question Breakdown & Step Evaluation
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {summary.questions.map((q, idx) => {
            const sub = summary.submissions[q.questionId];
            const isCorrect = sub?.evaluation?.correct ?? false;
            const isExpanded = expandedQuestionId === q.questionId;

            return (
              <div
                key={q.questionId}
                style={{
                  background: 'var(--color-surface)',
                  border: `1px solid ${isCorrect ? 'var(--color-border)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.questionId)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--color-surface-soft)' : 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isCorrect ? 'var(--color-mint-soft)' : 'var(--color-orange-soft)',
                        color: isCorrect ? 'var(--color-mint)' : 'var(--color-orange)',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Question {idx + 1} &bull; {q.concept} &bull; {q.marks || 1} Marks
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {q.question}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isCorrect ? 'var(--color-mint)' : 'var(--color-orange)',
                      }}
                    >
                      {sub ? `${sub.score || 0} / ${q.marks || 1} marks` : 'Unanswered'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div style={{ padding: '18px', borderTop: '1px solid var(--color-border-subtle)' }}>
                    {/* Full Question Text with Math */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Question
                      </div>
                      <MarkdownRenderer content={q.question} />
                    </div>

                    {/* Student's Answer */}
                    {sub && (
                      <div
                        style={{
                          padding: '10px 14px',
                          background: 'var(--color-surface-hover)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '14px',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Your Answer
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                          {sub.selectedOption
                            ? `Selected Option: ${sub.selectedOption}`
                            : sub.answer
                            ? sub.answer
                            : sub.imageReference
                            ? 'Handwritten solution image submitted'
                            : '—'}
                        </div>
                      </div>
                    )}

                    {/* Feedback & Step Evaluation */}
                    {sub?.evaluation ? (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Evaluation Feedback
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                          <MarkdownRenderer content={sub.evaluation.feedback} />
                        </div>

                        {/* Step by step breakdown if available */}
                        {sub.evaluation.stepEvaluation && sub.evaluation.stepEvaluation.length > 0 && (
                          <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                              Step-by-Step Scoring
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {sub.evaluation.stepEvaluation.map((step, sIdx) => (
                                <div
                                  key={sIdx}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-surface-soft)',
                                    border: '1px solid var(--color-border-subtle)',
                                    fontSize: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                      Step {step.step}:
                                    </span>{' '}
                                    <span style={{ color: 'var(--color-text-secondary)' }}>{step.feedback}</span>
                                  </div>
                                  {step.score !== undefined && step.maxScore !== undefined && (
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        color: step.score === step.maxScore ? 'var(--color-mint)' : 'var(--color-orange)',
                                      }}
                                    >
                                      {step.score} / {step.maxScore}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action: Ask Lumo about this specific doubt */}
                        {!isCorrect && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onAskLumo({
                                  subject: summary.subject,
                                  topic: summary.topic,
                                  concept: q.concept,
                                  question: q.question,
                                  feedback: sub.evaluation?.feedback,
                                  misconception: sub.evaluation?.misconceptions?.[0],
                                })
                              }
                            >
                              ✦ Ask Lumo about this mistake &rarr;
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        No evaluation recorded for this question.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Bottom Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.5rem',
        }}
      >
        <Button variant="ghost" size="md" onClick={onBackToLanding}>
          &larr; Back to Practice Home
        </Button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {summary.identifiedMisconceptions.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                onAskLumo({
                  subject: summary.subject,
                  topic: summary.topic,
                  misconception: summary.identifiedMisconceptions.join('; '),
                  question: `I just finished an assessment on ${summary.topic}. Can you help me clarify: ${summary.identifiedMisconceptions.join(', ')}?`,
                })
              }
            >
              ✦ Ask Lumo About Doubts
            </Button>
          )}

          <Button variant="primary" size="md" onClick={onRetake}>
            Practice Again &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
