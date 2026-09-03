import React, { useState, useEffect } from 'react';
import type {
  AssessmentAnalytics,
  AssessmentBookmark,
  AssessmentDifficulty,
  AssessmentEvaluationMode,
  AssessmentGoal,
  AssessmentQuestionType,
  AssessmentSession,
  AssessmentSubmission,
  ClientAssessmentQuestion,
  WrongAssessmentQuestion,
} from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { AssessmentRenderer } from './AssessmentRenderer';

export interface AssessmentPracticeScreenProps {
  idToken: string | null;
  readyDocsCount?: number;
}

type AssessmentTab = 'practice' | 'bookmarks' | 'reviews' | 'analytics';

export const AssessmentPracticeScreen: React.FC<AssessmentPracticeScreenProps> = ({
  idToken,
  readyDocsCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<AssessmentTab>('practice');

  // Generator & Session Form State
  const [subject, setSubject] = useState<string>('Mathematics');
  const [concept, setConcept] = useState<string>('Linear Equations in One Variable');
  const [grade, setGrade] = useState<string>('Class 8');
  const [goal, setGoal] = useState<AssessmentGoal>('practice');
  const [preferredDifficulty, setPreferredDifficulty] = useState<string>('auto');
  const [preferredQuestionType, setPreferredQuestionType] = useState<string>('auto');
  const [targetMarks, setTargetMarks] = useState<string>('auto');

  // Active Session & Question State
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ClientAssessmentQuestion | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<AssessmentSubmission | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<string>(new Date().toISOString());

  // Data Collections State
  const [bookmarks, setBookmarks] = useState<AssessmentBookmark[]>([]);
  const [dueReviews, setDueReviews] = useState<WrongAssessmentQuestion[]>([]);
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Check bookmark status whenever currentQuestion changes
  useEffect(() => {
    if (idToken && currentQuestion?.questionId) {
      liveTutorApiClient
        .isQuestionBookmarked(idToken, currentQuestion.questionId)
        .then(setIsBookmarked)
        .catch(() => setIsBookmarked(false));
    }
  }, [idToken, currentQuestion]);

  // Load bookmarks, reviews, or analytics when switching tabs
  useEffect(() => {
    if (!idToken) return;
    if (activeTab === 'bookmarks') {
      loadBookmarks();
    } else if (activeTab === 'reviews') {
      loadReviews();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [idToken, activeTab]);

  const loadBookmarks = async () => {
    if (!idToken) return;
    try {
      const data = await liveTutorApiClient.getBookmarks(idToken);
      setBookmarks(data);
    } catch (err: any) {
      console.error('Error loading bookmarks:', err);
    }
  };

  const loadReviews = async () => {
    if (!idToken) return;
    try {
      const data = await liveTutorApiClient.getDueReviews(idToken);
      setDueReviews(data);
    } catch (err: any) {
      console.error('Error loading due reviews:', err);
    }
  };

  const loadAnalytics = async () => {
    if (!idToken) return;
    try {
      const data = await liveTutorApiClient.getAssessmentAnalytics(idToken);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      setError('Please sign in first to start a practice session.');
      return;
    }
    if (!concept.trim() || !subject.trim()) {
      setError('Subject and concept are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = await liveTutorApiClient.createAssessmentSession(idToken, {
        subject: subject.trim(),
        grade: grade.trim() || undefined,
        topic: concept.trim(),
        concepts: [concept.trim()],
        goal,
        startingDifficulty: preferredDifficulty !== 'auto' ? (preferredDifficulty as AssessmentDifficulty) : 'medium',
      });

      setActiveSession(session);
      await generateNextQuestionForSession(session);
    } catch (err: any) {
      console.error('Error starting assessment session:', err);
      setError(err?.message || 'Failed to start session.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextQuestionForSession = async (session?: AssessmentSession | null) => {
    if (!idToken) return;
    setIsLoading(true);
    setError(null);
    setCurrentQuestion(null);
    setLatestSubmission(null);
    setQuestionStartTime(new Date().toISOString());

    try {
      const marksNum = targetMarks !== 'auto' ? parseInt(targetMarks, 10) : undefined;
      const diffEnum = preferredDifficulty !== 'auto' ? (preferredDifficulty as AssessmentDifficulty) : undefined;
      const qTypeEnum = preferredQuestionType !== 'auto' ? (preferredQuestionType as AssessmentQuestionType) : undefined;
      const evalModeEnum =
        qTypeEnum === 'IMAGE_SOLUTION'
          ? ('IMAGE_SOLUTION' as AssessmentEvaluationMode)
          : qTypeEnum === 'NUMERICAL' && marksNum && marksNum >= 3
          ? ('IMAGE_SOLUTION' as AssessmentEvaluationMode)
          : undefined;

      const question = await liveTutorApiClient.generateAssessmentQuestion(idToken, {
        concept: concept.trim(),
        subject: subject.trim(),
        grade: grade.trim() || undefined,
        goal,
        difficulty: diffEnum,
        questionType: qTypeEnum,
        evaluationMode: evalModeEnum,
        marks: marksNum,
        assessmentSessionId: session?.id || activeSession?.id,
        sessionId: session?.id || activeSession?.id,
      });

      setCurrentQuestion(question);
    } catch (err: any) {
      console.error('Error generating question:', err);
      setError(err?.message || 'Failed to generate question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!idToken || !currentQuestion) return;
    try {
      if (isBookmarked) {
        await liveTutorApiClient.unbookmarkQuestion(idToken, currentQuestion.questionId);
        setIsBookmarked(false);
        showNotification('Question removed from bookmarks.');
      } else {
        await liveTutorApiClient.bookmarkQuestion(idToken, currentQuestion.questionId);
        setIsBookmarked(true);
        showNotification('Question saved to bookmarks! 🔖');
      }
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleCompleteSession = async () => {
    if (!idToken || !activeSession) return;
    try {
      const completed = await liveTutorApiClient.completeAssessmentSession(idToken, activeSession.id);
      setActiveSession(completed);
      showNotification('Session completed! 🎉 Check your updated analytics.');
    } catch (err: any) {
      console.error('Error completing session:', err);
    }
  };

  const handleSubmitted = (submission: AssessmentSubmission) => {
    setLatestSubmission(submission);
    if (activeSession) {
      // Update local session counter
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              attemptedQuestionCount: prev.attemptedQuestionCount + 1,
              correctCount: prev.correctCount + (submission.evaluation?.correct ? 1 : 0),
              earnedMarks: prev.earnedMarks + (submission.score || 0),
              totalMarks: prev.totalMarks + (currentQuestion?.marks || 1),
              accuracy: Math.round(
                ((prev.correctCount + (submission.evaluation?.correct ? 1 : 0)) /
                  (prev.attemptedQuestionCount + 1)) *
                  100
              ),
            }
          : null
      );
    }
  };

  const handleRetrySavedQuestion = (q: ClientAssessmentQuestion) => {
    setCurrentQuestion(q);
    setLatestSubmission(null);
    setQuestionStartTime(new Date().toISOString());
    setActiveTab('practice');
  };

  return (
    <section
      style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>
          📝 Assessment, Practice & Mistakes Tracker
        </h2>
        {readyDocsCount > 0 && (
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              background: '#dcfce7',
              color: '#166534',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            📚 RAG Grounding Active ({readyDocsCount} study docs)
          </span>
        )}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('practice')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'practice' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'practice' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'practice' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          🎯 Practice Session
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bookmarks' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'bookmarks' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'bookmarks' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          🔖 Saved Questions ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'reviews' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'reviews' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          📚 Due Reviews & Mistakes ({dueReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.5rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          📊 Performance Analytics
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            background: '#ecfdf5',
            border: '1px solid #6ee7b7',
            color: '#065f46',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {notification}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* TAB 1: PRACTICE SESSION */}
      {activeTab === 'practice' && (
        <div>
          {/* Active Session Progress Banner */}
          {activeSession && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#166534' }}>
                  🎯 Active Session: {activeSession.subject} — {activeSession.topic || activeSession.concepts[0]}
                </span>
                <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.2rem' }}>
                  Questions Attempted: <strong>{activeSession.attemptedQuestionCount}</strong> | Accuracy: <strong>{activeSession.accuracy}%</strong> | Marks Earned: <strong>{activeSession.earnedMarks} / {activeSession.totalMarks}</strong>
                </div>
              </div>

              {activeSession.status === 'IN_PROGRESS' && (
                <button
                  onClick={handleCompleteSession}
                  style={{
                    padding: '0.4rem 0.9rem',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  🏁 Complete Session
                </button>
              )}
            </div>
          )}

          {/* Form to Start or Configure Practice */}
          <form
            onSubmit={handleStartSession}
            style={{
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Subject:
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science (General)</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English Literature & Grammar</option>
                  <option value="Social Studies">Social Studies / History / Civics</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Grade / Class:
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Class 8, Grade 10"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Assessment Goal:
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as AssessmentGoal)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="concept_check">Concept Check (1 Question)</option>
                  <option value="practice">Targeted Practice Session</option>
                  <option value="diagnostic">Diagnostic Assessment</option>
                  <option value="mastery_verification">Mastery Verification</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Concept / Topic:
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Linear Equations in One Variable, Photosynthesis, Quadratic Formulas"
                required
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Difficulty:
                </label>
                <select
                  value={preferredDifficulty}
                  onChange={(e) => setPreferredDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="auto">Auto (Adaptive)</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Question Type:
                </label>
                <select
                  value={preferredQuestionType}
                  onChange={(e) => setPreferredQuestionType(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="auto">Auto (Subject-Aware)</option>
                  <option value="MCQ">MCQ</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                  <option value="LONG_ANSWER">Long Answer</option>
                  <option value="NUMERICAL">Numerical</option>
                  <option value="IMAGE_SOLUTION">Image Solution (Handwritten)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Marks Target:
                </label>
                <select
                  value={targetMarks}
                  onChange={(e) => setTargetMarks(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="auto">Auto</option>
                  <option value="1">1 Mark</option>
                  <option value="2">2 Marks</option>
                  <option value="3">3 Marks</option>
                  <option value="5">5 Marks (e.g. Image Solution)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !idToken}
              style={{
                padding: '0.65rem 1.5rem',
                background: isLoading || !idToken ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: isLoading || !idToken ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
              }}
            >
              {isLoading ? 'Generating Question with AI...' : activeSession ? '🎯 Generate Next Question' : '🚀 Start Practice Session'}
            </button>
          </form>

          {/* Render Active Question */}
          {currentQuestion && idToken && (
            <div>
              {/* Question Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button
                  onClick={handleToggleBookmark}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: isBookmarked ? '#fef3c7' : '#f8fafc',
                    color: isBookmarked ? '#92400e' : '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isBookmarked ? '🔖 Saved to Bookmarks' : '🔖 Save Question'}
                </button>
              </div>

              <AssessmentRenderer
                question={currentQuestion}
                idToken={idToken}
                onSubmitted={handleSubmitted}
                initialSubmission={latestSubmission}
                sessionId={activeSession?.id}
                questionStartedAt={questionStartTime}
              />

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => generateNextQuestionForSession()}
                  disabled={isLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: '#334155',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  🔄 New Question
                </button>

                {latestSubmission?.evaluation && (
                  <button
                    onClick={() => generateNextQuestionForSession()}
                    disabled={isLoading}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    🎯 Next Adaptive Question ({latestSubmission.evaluation.recommendedAction.replace('_', ' ')})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKMARKS / SAVED QUESTIONS */}
      {activeTab === 'bookmarks' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            🔖 Your Saved Questions
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Questions you bookmarked for later review. Practice them anytime.
          </p>

          {bookmarks.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
              No bookmarked questions yet. Click <strong>"🔖 Save Question"</strong> during practice to save challenging questions!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookmarks.map((bmk) => (
                <div
                  key={bmk.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      {bmk.question?.subject} • {bmk.question?.concept} • {bmk.question?.difficulty.toUpperCase()} • {bmk.question?.marks} Marks
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                      {bmk.question?.question || `Question ID: ${bmk.questionId}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {bmk.question && (
                      <button
                        onClick={() => handleRetrySavedQuestion(bmk.question!)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        🎯 Practice
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!idToken) return;
                        await liveTutorApiClient.unbookmarkQuestion(idToken, bmk.questionId);
                        setBookmarks((prev) => prev.filter((b) => b.id !== bmk.id));
                        showNotification('Removed bookmark.');
                      }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DUE REVIEWS & MISTAKES */}
      {activeTab === 'reviews' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            📚 Spaced Review & Mistakes Tracker
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Questions you previously missed are scheduled for review using spaced repetition (3 days, then 7 days) until mastered.
          </p>

          {dueReviews.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#15803d', background: '#f0fdf4', borderRadius: '8px' }}>
              🎉 All caught up! You have no questions due for review right now.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dueReviews.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #fed7aa',
                    borderRadius: '6px',
                    background: '#fffbeb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9a3412', marginBottom: '0.25rem', fontWeight: 600 }}>
                      ⚠️ Needs Review (Attempt #{item.attemptCount}) • {item.subject} • {item.concept}
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                      {item.question?.question || `Question ID: ${item.questionId}`}
                    </div>
                    {item.misconceptions && item.misconceptions.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
                        Identified misconception: {item.misconceptions.join(', ')}
                      </div>
                    )}
                  </div>

                  <div>
                    {item.question && (
                      <button
                        onClick={() => handleRetrySavedQuestion(item.question!)}
                        style={{
                          padding: '0.45rem 1rem',
                          background: '#ea580c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        🔄 Reattempt Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PERFORMANCE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            📊 Assessment Performance Analytics
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Aggregated performance metrics derived deterministically from your question attempt history.
          </p>

          {!analytics ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
              No assessment analytics available yet. Start practicing questions to see your metrics!
            </div>
          ) : (
            <div>
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Attempts</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{analytics.totalAttempts}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Overall Accuracy</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: analytics.overallAccuracy >= 75 ? '#16a34a' : '#ea580c' }}>
                    {analytics.overallAccuracy}%
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Average Score</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb' }}>{analytics.averageScore} / 5.0</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Distinct Questions</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#7c3aed' }}>{analytics.totalQuestions}</div>
                </div>
              </div>

              {/* Concept Mastery Breakdown */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '0.75rem' }}>Concept Mastery</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(analytics.byConcept).map(([conceptName, cData]) => (
                    <div
                      key={conceptName}
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{conceptName}</span>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                        Attempted: {cData.attempted} | Accuracy: <strong>{cData.accuracy}%</strong> | Mastery: <strong>{Math.round(cData.mastery * 100)}%</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Granular Skill Proficiencies */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '0.75rem' }}>Skill Proficiencies</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {Object.entries(analytics.skillBreakdown).map(([skillName, score]) => (
                    <div key={skillName} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                        {skillName.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        {Math.round(score * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
