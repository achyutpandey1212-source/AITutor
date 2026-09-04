import React, { useState, useEffect } from 'react';
import type { ClientAssessmentQuestion } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { AssessmentLanding, type AssessmentConfig } from '../assessment/AssessmentLanding';
import {
  AssessmentSessionScreen,
  type AssessmentSessionSummary,
} from '../assessment/AssessmentSessionScreen';
import { AssessmentResultsScreen } from '../assessment/AssessmentResultsScreen';

export interface PracticePageProps {
  idToken: string;
  onNavigate: (path: string) => void;
  initialQuestionId?: string;
}

type PracticeView = 'landing' | 'session' | 'results';

export const PracticePage: React.FC<PracticePageProps> = ({
  idToken,
  onNavigate,
  initialQuestionId,
}) => {
  const [view, setView] = useState<PracticeView>('landing');
  const [activeConfig, setActiveConfig] = useState<AssessmentConfig>({
    mode: 'practice',
    subject: 'Physics',
    topic: "Snell's Law & Refraction",
    difficulty: 'auto',
    questionType: 'auto',
    marks: 'auto',
    questionCount: 5,
  });
  const [activeInitialQuestion, setActiveInitialQuestion] = useState<ClientAssessmentQuestion | null>(
    null
  );
  const [lastSummary, setLastSummary] = useState<AssessmentSessionSummary | null>(null);
  const [isLoadingInitialQuestion, setIsLoadingInitialQuestion] = useState<boolean>(false);
  const [initialError, setInitialError] = useState<string | null>(null);

  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const effectiveQuestionId = initialQuestionId || queryParams?.get('questionId') || undefined;

  // If directed to a specific question ID (e.g. from Bookmarks, Mistakes, or deep link)
  useEffect(() => {
    if (idToken && effectiveQuestionId) {
      setIsLoadingInitialQuestion(true);
      setInitialError(null);

      liveTutorApiClient
        .getQuestion(idToken, effectiveQuestionId)
        .then((q) => {
          setActiveInitialQuestion(q);
          setActiveConfig({
            mode: 'practice',
            subject: q.subject,
            topic: q.concept,
            difficulty: (q.difficulty as any) || 'auto',
            questionType: (q.questionType as any) || 'auto',
            marks: 'auto',
            questionCount: 1,
          });
          setView('session');
        })
        .catch((err) => {
          console.error('[PracticePage] Failed to load initial question:', err);
          setInitialError(`Unable to load question: ${err?.message || 'Not found'}`);
        })
        .finally(() => {
          setIsLoadingInitialQuestion(false);
        });
    }
  }, [idToken, effectiveQuestionId]);

  // Handler: Start session from landing configuration
  const handleStartSession = (config: AssessmentConfig) => {
    setActiveConfig(config);
    setActiveInitialQuestion(null);
    setView('session');
  };

  // Handler: Reattempt a saved question
  const handleSelectSavedQuestion = (question: ClientAssessmentQuestion) => {
    setActiveInitialQuestion(question);
    setActiveConfig({
      mode: 'practice',
      subject: question.subject,
      topic: question.concept,
      difficulty: (question.difficulty as any) || 'auto',
      questionType: (question.questionType as any) || 'auto',
      marks: 'auto',
      questionCount: 1,
    });
    setView('session');
  };

  // Handler: Reattempt a due review
  const handleSelectDueReview = (question: ClientAssessmentQuestion) => {
    setActiveInitialQuestion(question);
    setActiveConfig({
      mode: 'practice',
      subject: question.subject,
      topic: question.concept,
      difficulty: (question.difficulty as any) || 'auto',
      questionType: (question.questionType as any) || 'auto',
      marks: 'auto',
      questionCount: 1,
    });
    setView('session');
  };

  // Handler: Session completion
  const handleFinishSession = (summary: AssessmentSessionSummary) => {
    setLastSummary(summary);
    setView('results');
  };

  // Handler: Retake / practice again
  const handleRetake = () => {
    setActiveInitialQuestion(null);
    setView('session');
  };

  // Handler: Ask Lumo with doubt context
  const handleAskLumo = (doubtContext: {
    subject?: string;
    topic?: string;
    concept?: string;
    question?: string;
    misconception?: string;
    feedback?: string;
  }) => {
    const params = new URLSearchParams();
    if (doubtContext.subject) params.set('subject', doubtContext.subject);
    if (doubtContext.topic) params.set('topic', doubtContext.topic);
    if (doubtContext.concept) params.set('concept', doubtContext.concept);
    params.set('from', 'practice');

    let prompt = '';
    if (doubtContext.misconception) {
      prompt = `I am reviewing my assessment on ${doubtContext.topic || 'this topic'}. I had a misconception: "${doubtContext.misconception}". Can you help me understand what went wrong and how to think about it correctly?`;
    } else if (doubtContext.question) {
      prompt = `Can you explain how to solve this question from my assessment: "${doubtContext.question}"?`;
    }

    if (prompt) {
      params.set('doubt', prompt);
    }

    onNavigate(`/ai?${params.toString()}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
        paddingTop: '1.5rem',
      }}
    >
      {/* Top Breadcrumb Bar */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto 1.5rem',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px',
            }}
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Assessment</span>
          {view !== 'landing' && (
            <>
              <span>/</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {view === 'session' ? 'In Progress' : 'Results'}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          style={{
            padding: '5px 12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all var(--motion-fast) var(--ease-standard)',
          }}
        >
          &larr; Dashboard
        </button>
      </div>

      {/* Initial Question Loading / Error */}
      {isLoadingInitialQuestion && (
        <div style={{ maxWidth: '860px', margin: '3rem auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading question…
        </div>
      )}

      {initialError && (
        <div
          style={{
            maxWidth: '860px',
            margin: '2rem auto',
            padding: '16px',
            background: 'var(--color-surface-hover)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>{initialError}</div>
          <button
            type="button"
            onClick={() => {
              setInitialError(null);
              setView('landing');
            }}
            style={{
              padding: '6px 14px',
              background: 'var(--color-orange)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to Assessment Home
          </button>
        </div>
      )}

      {/* View 1: Assessment Landing & Configuration */}
      {!isLoadingInitialQuestion && !initialError && view === 'landing' && (
        <AssessmentLanding
          idToken={idToken}
          onStartSession={handleStartSession}
          onSelectSavedQuestion={handleSelectSavedQuestion}
          onSelectDueReview={handleSelectDueReview}
          onNavigate={onNavigate}
        />
      )}

      {/* View 2: Active Session Screen */}
      {!isLoadingInitialQuestion && !initialError && view === 'session' && (
        <AssessmentSessionScreen
          idToken={idToken}
          config={activeConfig}
          initialQuestion={activeInitialQuestion}
          onFinishSession={handleFinishSession}
          onExit={() => setView('landing')}
          onAskLumo={handleAskLumo}
        />
      )}

      {/* View 3: Assessment Results & Mastery */}
      {!isLoadingInitialQuestion && !initialError && view === 'results' && lastSummary && (
        <AssessmentResultsScreen
          idToken={idToken}
          summary={lastSummary}
          onRetake={handleRetake}
          onBackToLanding={() => setView('landing')}
          onAskLumo={handleAskLumo}
        />
      )}
    </div>
  );
};
