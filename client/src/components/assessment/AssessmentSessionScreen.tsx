import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  AssessmentSession,
  AssessmentSubmission,
  ClientAssessmentQuestion,
} from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { AssessmentRenderer } from './AssessmentRenderer';
import { Button } from '../ui/Button';
import type { AssessmentConfig } from './AssessmentLanding';

export interface AssessmentSessionSummary {
  session: AssessmentSession | null;
  mode: 'practice' | 'mock' | 'quiz';
  subject: string;
  topic: string;
  questions: ClientAssessmentQuestion[];
  submissions: Record<string, AssessmentSubmission>;
  totalMarksEarned: number;
  totalMarksPossible: number;
  accuracy: number;
  timeSpentSeconds: number;
  identifiedMisconceptions: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface AssessmentSessionScreenProps {
  idToken: string;
  config: AssessmentConfig;
  initialQuestion?: ClientAssessmentQuestion | null;
  onFinishSession: (summary: AssessmentSessionSummary) => void;
  onExit: () => void;
  onAskLumo?: (doubtContext: {
    subject?: string;
    topic?: string;
    concept?: string;
    question?: string;
    misconception?: string;
    feedback?: string;
  }) => void;
}

export const AssessmentSessionScreen: React.FC<AssessmentSessionScreenProps> = ({
  idToken,
  config,
  initialQuestion = null,
  onFinishSession,
  onExit,
  onAskLumo,
}) => {
  // Session & Question state
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [questions, setQuestions] = useState<ClientAssessmentQuestion[]>(
    initialQuestion ? [initialQuestion] : []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [submissions, setSubmissions] = useState<Record<string, AssessmentSubmission>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // UI & Loading state
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);

  // Timing
  const sessionStartTimeRef = useRef<number>(Date.now());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(() => {
    if (config.mode === 'mock') {
      return config.questionCount * 180; // 3 min per question in mock exam
    }
    return 0;
  });

  const currentQuestion = questions[currentIndex] || null;
  const isCurrentBookmarked = currentQuestion ? bookmarkedIds.has(currentQuestion.questionId) : false;
  const totalGoal = config.mode === 'quiz' ? 5 : config.questionCount;

  // Build summary helper
  const buildSummary = useCallback((): AssessmentSessionSummary => {
    let earned = 0;
    let possible = 0;
    let correctCount = 0;
    const allMisconceptions: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    questions.forEach((q) => {
      const sub = submissions[q.questionId];
      possible += q.marks || 1;

      if (sub?.evaluation) {
        earned += sub.score || 0;
        if (sub.evaluation.correct) {
          correctCount++;
          strengths.push(q.concept);
        } else {
          weaknesses.push(q.concept);
        }
        if (sub.evaluation.misconceptions) {
          sub.evaluation.misconceptions.forEach((m) => {
            if (!allMisconceptions.includes(m)) allMisconceptions.push(m);
          });
        }
      }
    });

    const attemptedCount = Object.keys(submissions).length;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const timeSpentSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);

    return {
      session,
      mode: config.mode,
      subject: config.subject,
      topic: config.topic,
      questions,
      submissions,
      totalMarksEarned: earned,
      totalMarksPossible: Math.max(possible, 1),
      accuracy,
      timeSpentSeconds,
      identifiedMisconceptions: allMisconceptions,
      strengths: Array.from(new Set(strengths)),
      weaknesses: Array.from(new Set(weaknesses)),
    };
  }, [questions, submissions, session, config]);

  // Complete session handler
  const handleFinalizeSession = useCallback(async () => {
    setIsFinishing(true);
    try {
      if (session?.id && idToken) {
        await liveTutorApiClient.completeAssessmentSession(idToken, session.id);
      }
    } catch (err) {
      console.warn('Could not mark session complete on server:', err);
    } finally {
      setIsFinishing(false);
      onFinishSession(buildSummary());
    }
  }, [session, idToken, onFinishSession, buildSummary]);

  // Countdown timer for Mock Test
  useEffect(() => {
    if (config.mode !== 'mock') return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalizeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.mode, handleFinalizeSession]);

  // Generate question function
  const fetchNextQuestion = useCallback(
    async (sessId?: string) => {
      if (!idToken) return;
      setIsLoadingQuestion(true);
      setError(null);

      try {
        const q = await liveTutorApiClient.generateAssessmentQuestion(idToken, {
          concept: config.topic,
          subject: config.subject,
          grade: config.grade,
          goal: config.mode === 'quiz' ? 'concept_check' : config.mode === 'mock' ? 'diagnostic' : 'practice',
          difficulty: config.difficulty !== 'auto' ? config.difficulty : undefined,
          questionType: config.questionType !== 'auto' ? config.questionType : undefined,
          marks: config.marks !== 'auto' ? parseInt(config.marks, 10) : undefined,
          assessmentSessionId: sessId || session?.id,
          sessionId: sessId || session?.id,
        });

        setQuestions((prev) => {
          // Avoid duplicate question insertion
          if (prev.some((item) => item.questionId === q.questionId)) return prev;
          return [...prev, q];
        });
      } catch (err: any) {
        console.error('Failed to generate question:', err);
        setError(err?.message || 'Could not generate next question. Please try again.');
      } finally {
        setIsLoadingQuestion(false);
      }
    },
    [idToken, config, session]
  );

  // Initialize session and first question on mount
  useEffect(() => {
    if (!idToken) return;

    let isMounted = true;

    const init = async () => {
      try {
        const newSession = await liveTutorApiClient.createAssessmentSession(idToken, {
          subject: config.subject,
          topic: config.topic,
          grade: config.grade,
          concepts: [config.topic],
          goal: config.mode === 'quiz' ? 'concept_check' : config.mode === 'mock' ? 'diagnostic' : 'practice',
          startingDifficulty: config.difficulty !== 'auto' ? config.difficulty : 'medium',
          totalQuestionGoal: totalGoal,
        });

        if (!isMounted) return;
        setSession(newSession);

        if (!initialQuestion) {
          await fetchNextQuestion(newSession.id);
        }
      } catch (err: any) {
        console.warn('Could not create assessment session, falling back to standalone practice:', err);
        if (!initialQuestion && isMounted) {
          fetchNextQuestion();
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [idToken]); // only once on mount

  // Check bookmark status when question changes
  useEffect(() => {
    if (!idToken || !currentQuestion?.questionId) return;

    liveTutorApiClient
      .isQuestionBookmarked(idToken, currentQuestion.questionId)
      .then((isSaved) => {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(currentQuestion.questionId);
          else next.delete(currentQuestion.questionId);
          return next;
        });
      })
      .catch(() => {});
  }, [idToken, currentQuestion]);

  const handleToggleBookmark = async () => {
    if (!idToken || !currentQuestion) return;
    const qId = currentQuestion.questionId;

    try {
      if (bookmarkedIds.has(qId)) {
        await liveTutorApiClient.unbookmarkQuestion(idToken, qId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(qId);
          return next;
        });
      } else {
        await liveTutorApiClient.bookmarkQuestion(idToken, qId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.add(qId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleQuestionSubmitted = (sub: AssessmentSubmission) => {
    setSubmissions((prev) => ({
      ...prev,
      [sub.questionId]: sub,
    }));
  };

  const handleNext = async () => {
    // If next question already exists in questions array, move forward
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Otherwise generate the next question
    if (questions.length < totalGoal) {
      await fetchNextQuestion();
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all questions in the target
      handleFinalizeSession();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Format time remaining MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(submissions).length;
  const isCurrentAnswered = currentQuestion ? Boolean(submissions[currentQuestion.questionId]) : false;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1rem 4rem' }}>
      {/* Top Bar Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          &larr; Exit Session
        </button>

        {/* Center: Context & Mode Badge */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {config.subject} &bull; {config.topic}
          </div>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background:
                config.mode === 'mock'
                  ? 'var(--color-surface-hover)'
                  : config.mode === 'quiz'
                  ? 'var(--color-sky-soft)'
                  : 'var(--color-mint-soft)',
              color:
                config.mode === 'mock'
                  ? 'var(--color-text-primary)'
                  : config.mode === 'quiz'
                  ? 'var(--color-sky)'
                  : 'var(--color-mint)',
            }}
          >
            {config.mode === 'mock' ? 'Timed Mock Exam' : config.mode === 'quiz' ? 'Conceptual Quiz' : 'Targeted Practice'}
          </span>
        </div>

        {/* Right: Actions (Timer, Bookmark, Finish) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mock Test Countdown Timer */}
          {config.mode === 'mock' && (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background:
                  timeRemainingSeconds < 120
                    ? 'var(--color-error-soft, #fef2f2)'
                    : timeRemainingSeconds < 300
                    ? 'var(--color-warning-soft, #fffbeb)'
                    : 'var(--color-surface)',
                color:
                  timeRemainingSeconds < 120
                    ? 'var(--color-error, #dc2626)'
                    : timeRemainingSeconds < 300
                    ? 'var(--color-warning, #d97706)'
                    : 'var(--color-text-primary)',
              }}
            >
              ⏱️ {formatTimer(timeRemainingSeconds)}
            </div>
          )}

          {/* Bookmark Button */}
          {currentQuestion && (
            <button
              type="button"
              onClick={handleToggleBookmark}
              title={isCurrentBookmarked ? 'Bookmarked' : 'Bookmark Question'}
              style={{
                padding: '6px 10px',
                background: isCurrentBookmarked ? 'var(--color-orange-soft)' : 'var(--color-surface)',
                border: `1px solid ${isCurrentBookmarked ? 'var(--color-orange)' : 'var(--color-border)'}`,
                color: isCurrentBookmarked ? 'var(--color-orange)' : 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <span>{isCurrentBookmarked ? '🔖 Saved' : '🔖 Save'}</span>
            </button>
          )}

          {/* Complete / Finish Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (answeredCount < totalGoal && config.mode === 'mock') {
                setShowFinishConfirm(true);
              } else {
                handleFinalizeSession();
              }
            }}
            disabled={isFinishing}
          >
            {isFinishing ? 'Finishing…' : 'Finish Session'}
          </Button>
        </div>
      </div>

      {/* Progress Bar & Question Step Indicator */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Question {currentIndex + 1} of {Math.max(questions.length, totalGoal)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {answeredCount} of {Math.max(questions.length, totalGoal)} answered
          </span>
        </div>

        {/* Progress Track */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'var(--color-border-subtle)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(answeredCount / Math.max(questions.length, totalGoal)) * 100}%`,
              background: 'var(--color-orange)',
              transition: 'width var(--motion-medium) var(--ease-standard)',
            }}
          />
        </div>
      </div>

      {/* Mock Test Question Navigator (Pills) */}
      {config.mode === 'mock' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '1.5rem',
            padding: '10px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {Array.from({ length: totalGoal }).map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const q = questions[idx];
            const isAnswered = q ? Boolean(submissions[q.questionId]) : false;
            const isFlagged = q ? bookmarkedIds.has(q.questionId) : false;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (idx < questions.length) {
                    setCurrentIndex(idx);
                  }
                }}
                disabled={idx >= questions.length}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  border: isCurrent
                    ? '2px solid var(--color-orange)'
                    : `1px solid ${isAnswered ? 'var(--color-mint)' : 'var(--color-border)'}`,
                  background: isAnswered
                    ? 'var(--color-mint-soft)'
                    : isCurrent
                    ? 'var(--color-surface-hover)'
                    : 'var(--color-surface)',
                  color: isAnswered
                    ? 'var(--color-mint)'
                    : isCurrent
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-muted)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: idx < questions.length ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {idx + 1}
                {isFlagged && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-orange)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--color-surface-hover)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Question Container / Loading State */}
      {isLoadingQuestion && !currentQuestion && (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>✨</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Lumo is crafting your question…
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Grounding concepts from {config.topic}
          </div>
        </div>
      )}

      {/* Active Question Render */}
      {currentQuestion && (
        <div>
          <AssessmentRenderer
            key={currentQuestion.questionId}
            question={currentQuestion}
            idToken={idToken}
            onSubmitted={handleQuestionSubmitted}
            initialSubmission={submissions[currentQuestion.questionId] || null}
            sessionId={session?.id}
            hideEvaluation={config.mode === 'mock'}
            onAskLumo={
              onAskLumo
                ? (doubt) =>
                    onAskLumo({
                      subject: config.subject,
                      topic: config.topic,
                      concept: currentQuestion.concept,
                      question: doubt.question || currentQuestion.question,
                      misconception: doubt.misconception,
                      feedback: doubt.feedback,
                    })
                : undefined
            }
          />

          {/* Session Question Footer Actions */}
          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Previous Button (if multiple questions available) */}
            <div>
              {currentIndex > 0 && (
                <Button variant="secondary" size="md" onClick={handlePrevious}>
                  &larr; Previous Question
                </Button>
              )}
            </div>

            {/* Next / Finish Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Practice mode: Generate alternative question */}
              {config.mode === 'practice' && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => fetchNextQuestion()}
                  disabled={isLoadingQuestion}
                >
                  🔄 Another Question
                </Button>
              )}

              {/* Next Question or Finish */}
              {currentIndex + 1 < totalGoal ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={isLoadingQuestion || (config.mode !== 'mock' && !isCurrentAnswered)}
                >
                  {isLoadingQuestion ? 'Generating…' : 'Next Question \u2192'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleFinalizeSession}
                  disabled={isFinishing || (config.mode !== 'mock' && !isCurrentAnswered)}
                >
                  {isFinishing ? 'Analyzing Results…' : 'Complete & View Results \u2192'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit Session */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px 0' }}>
              Exit assessment?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Your progress in this session will be preserved in your history. Are you sure you want to return to the landing screen?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(false)}>
                Stay in Session
              </Button>
              <Button variant="primary" size="sm" onClick={onExit}>
                Yes, Exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Finish with Unanswered Questions */}
      {showFinishConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px 0' }}>
              Unanswered Questions
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              You have answered {answeredCount} out of {totalGoal} questions. Unanswered questions will receive 0 marks. Submit anyway?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowFinishConfirm(false)}>
                Continue Test
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowFinishConfirm(false);
                  handleFinalizeSession();
                }}
              >
                Submit Exam Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
