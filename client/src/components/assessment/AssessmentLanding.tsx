import React, { useState, useEffect, useRef } from 'react';
import type {
  AssessmentAnalytics,
  AssessmentBookmark,
  ClientAssessmentQuestion,
  Document,
  WrongAssessmentQuestion,
} from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { Button } from '../ui/Button';

export interface AssessmentConfig {
  mode: 'practice' | 'mock' | 'quiz';
  subject: string;
  topic: string;
  grade?: string;
  difficulty: 'auto' | 'easy' | 'medium' | 'hard';
  questionType: 'auto' | 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'NUMERICAL' | 'IMAGE_SOLUTION';
  marks: 'auto' | '1' | '2' | '3' | '5';
  questionCount: number;
  documentId?: string;
  documentTitle?: string;
}

export interface AssessmentLandingProps {
  idToken: string;
  onStartSession: (config: AssessmentConfig) => void;
  onSelectSavedQuestion: (question: ClientAssessmentQuestion) => void;
  onSelectDueReview: (question: ClientAssessmentQuestion) => void;
  onNavigate: (path: string) => void;
}

type ActiveTab = 'create' | 'bookmarks' | 'reviews' | 'analytics';

const POPULAR_SUBJECTS = [
  'Physics',
  'Mathematics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English Literature',
  'Economics',
];

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  Physics: ["Snell's Law & Refraction", "Newton's Laws of Motion", 'Thermodynamics & Carnot Engine', 'Electromagnetic Induction'],
  Mathematics: ['Linear Equations in One Variable', 'Calculus: Derivatives & Chain Rule', 'Quadratic Equations', 'Matrices & Determinants'],
  Chemistry: ['Chemical Bonding & Molecular Structure', 'Equilibrium & Le Chatelier Principle', 'Organic Reaction Mechanisms', 'Electrochemistry'],
  Biology: ['Photosynthesis: Light & Dark Reactions', 'DNA Replication & Transcription', 'Human Circulatory System', 'Genetics & Mendelian Inheritance'],
  'Computer Science': ['Time Complexity & Big-O Notation', 'Binary Search Trees & Traversal', 'Dynamic Programming Fundamentals', 'Relational Database Normalization'],
};

export const AssessmentLanding: React.FC<AssessmentLandingProps> = ({
  idToken,
  onStartSession,
  onSelectSavedQuestion,
  onSelectDueReview,
  onNavigate: _onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');

  // Configuration State
  const [mode, setMode] = useState<'practice' | 'mock' | 'quiz'>('practice');
  const [subject, setSubject] = useState<string>('Physics');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>("Snell's Law & Refraction");
  const [grade, setGrade] = useState<string>('Class 11');
  const [difficulty, setDifficulty] = useState<'auto' | 'easy' | 'medium' | 'hard'>('auto');
  const [questionType, setQuestionType] = useState<
    'auto' | 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'NUMERICAL' | 'IMAGE_SOLUTION'
  >('auto');
  const [marks, setMarks] = useState<'auto' | '1' | '2' | '3' | '5'>('auto');
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Documents & Grounding State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('none');
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Secondary collections
  const [bookmarks, setBookmarks] = useState<AssessmentBookmark[]>([]);
  const [dueReviews, setDueReviews] = useState<WrongAssessmentQuestion[]>([]);
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);

  // Loading & Notification States
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveSubject = subject === 'Other' ? customSubject.trim() : subject;

  // Load documents and stats on mount
  useEffect(() => {
    if (!idToken) return;

    setIsLoadingDocs(true);
    liveTutorApiClient
      .listDocuments(idToken)
      .then((docs) => {
        setDocuments(docs);
      })
      .catch((err) => {
        console.warn('Could not load user documents:', err);
      })
      .finally(() => {
        setIsLoadingDocs(false);
      });

    // Pre-fetch counts for badges
    liveTutorApiClient
      .getBookmarks(idToken)
      .then(setBookmarks)
      .catch(() => {});

    liveTutorApiClient
      .getDueReviews(idToken)
      .then(setDueReviews)
      .catch(() => {});
  }, [idToken]);

  // Load tab-specific data when active tab changes
  useEffect(() => {
    if (!idToken) return;

    if (activeTab === 'bookmarks') {
      setIsLoadingData(true);
      liveTutorApiClient
        .getBookmarks(idToken)
        .then(setBookmarks)
        .catch(console.error)
        .finally(() => setIsLoadingData(false));
    } else if (activeTab === 'reviews') {
      setIsLoadingData(true);
      liveTutorApiClient
        .getDueReviews(idToken)
        .then(setDueReviews)
        .catch(console.error)
        .finally(() => setIsLoadingData(false));
    } else if (activeTab === 'analytics') {
      setIsLoadingData(true);
      liveTutorApiClient
        .getAssessmentAnalytics(idToken)
        .then(setAnalytics)
        .catch(console.error)
        .finally(() => setIsLoadingData(false));
    }
  }, [idToken, activeTab]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !idToken) return;

    setIsUploadingDoc(true);
    setError(null);

    try {
      const doc = await liveTutorApiClient.uploadDocument(idToken, file);
      setDocuments((prev) => [doc, ...prev]);
      setSelectedDocId(doc.id);
      showToast(`Document "${doc.filename}" uploaded & selected for grounding!`);
    } catch (err: any) {
      console.error('Document upload failed:', err);
      setError(err?.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveSubject) {
      setError('Please choose or enter a subject.');
      return;
    }
    if (!topic.trim()) {
      setError('Please specify a concept or topic to assess.');
      return;
    }

    const selectedDoc = documents.find((d) => d.id === selectedDocId);

    onStartSession({
      mode,
      subject: effectiveSubject,
      topic: topic.trim(),
      grade: grade.trim() || undefined,
      difficulty,
      questionType,
      marks,
      questionCount: mode === 'quiz' ? 5 : questionCount,
      documentId: selectedDocId !== 'none' ? selectedDocId : undefined,
      documentTitle: selectedDoc?.filename,
    });
  };

  const handleRemoveBookmark = async (questionId: string) => {
    if (!idToken) return;
    try {
      await liveTutorApiClient.unbookmarkQuestion(idToken, questionId);
      setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
      showToast('Removed from bookmarks');
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1rem 3rem' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '2rem' }}>
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
          Lumo Assessment
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 8px 0',
          }}
        >
          Test your understanding. Find the gaps.
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 1.5,
            maxWidth: '680px',
          }}
        >
          Adaptive practice, timed mock exams, and misconception diagnosis grounded in your study notes.
        </p>
      </div>

      {/* Due Reviews Quick Alert Banner */}
      {dueReviews.length > 0 && activeTab !== 'reviews' && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {dueReviews.length} {dueReviews.length === 1 ? 'question' : 'questions'} due for spaced review
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Review questions you missed earlier to reinforce concepts before they fade.
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('reviews')}>
            Review Mistakes &rarr;
          </Button>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--color-mint-soft)',
            border: '1px solid var(--color-mint)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '1.25rem',
          }}
        >
          {notification}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--color-surface-hover)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '1.25rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'create' ? '2px solid var(--color-orange)' : '2px solid transparent',
            color: activeTab === 'create' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'create' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all var(--motion-fast) var(--ease-standard)',
          }}
        >
          ✦ New Assessment
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bookmarks' ? '2px solid var(--color-orange)' : '2px solid transparent',
            color: activeTab === 'bookmarks' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'bookmarks' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all var(--motion-fast) var(--ease-standard)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Saved Questions</span>
          {bookmarks.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                background: 'var(--color-surface-hover)',
                color: 'var(--color-text-secondary)',
                fontWeight: 700,
              }}
            >
              {bookmarks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '2px solid var(--color-orange)' : '2px solid transparent',
            color: activeTab === 'reviews' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'reviews' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all var(--motion-fast) var(--ease-standard)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Spaced Reviews</span>
          {dueReviews.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                background: 'var(--color-orange-soft)',
                color: 'var(--color-orange)',
                fontWeight: 700,
              }}
            >
              {dueReviews.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--color-orange)' : '2px solid transparent',
            color: activeTab === 'analytics' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'analytics' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all var(--motion-fast) var(--ease-standard)',
          }}
        >
          Mastery Analytics
        </button>
      </div>

      {/* TAB 1: NEW ASSESSMENT CONFIGURATION */}
      {activeTab === 'create' && (
        <div>
          {/* Mode Selector Cards */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Select Assessment Mode
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Practice Mode */}
              <div
                onClick={() => setMode('practice')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${mode === 'practice' ? 'var(--color-orange)' : 'var(--color-border)'}`,
                  background: mode === 'practice' ? 'var(--color-surface)' : 'var(--color-surface-soft)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                  boxShadow: mode === 'practice' ? 'var(--shadow-md)' : 'none',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'var(--color-mint-soft)',
                      color: 'var(--color-mint)',
                    }}
                  >
                    Recommended
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Targeted Practice
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  Step-by-step learning with instant explanations and misconception diagnosis on each question.
                </div>
              </div>

              {/* Mock Test Mode */}
              <div
                onClick={() => setMode('mock')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${mode === 'mock' ? 'var(--color-orange)' : 'var(--color-border)'}`,
                  background: mode === 'mock' ? 'var(--color-surface)' : 'var(--color-surface-soft)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                  boxShadow: mode === 'mock' ? 'var(--shadow-md)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⏱️</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'var(--color-surface-hover)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Exam Conditions
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Timed Mock Test
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  Simulated test environment with countdown timer, question navigator, and deferred score evaluation.
                </div>
              </div>

              {/* Quick Quiz Mode */}
              <div
                onClick={() => setMode('quiz')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${mode === 'quiz' ? 'var(--color-orange)' : 'var(--color-border)'}`,
                  background: mode === 'quiz' ? 'var(--color-surface)' : 'var(--color-surface-soft)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                  boxShadow: mode === 'quiz' ? 'var(--shadow-md)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'var(--color-sky-soft)',
                      color: 'var(--color-sky)',
                    }}
                  >
                    5 Questions
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Conceptual Quiz
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  Rapid conceptual check to quickly benchmark your core intuition and spot blind spots.
                </div>
              </div>
            </div>
          </div>

          {/* Setup Form */}
          <form
            onSubmit={handleStart}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Subject Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                }}
              >
                Subject
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {POPULAR_SUBJECTS.map((sub) => {
                  const isSelected = subject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setSubject(sub);
                        if (TOPIC_SUGGESTIONS[sub]) {
                          setTopic(TOPIC_SUGGESTIONS[sub][0]);
                        }
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: `1px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border)'}`,
                        background: isSelected ? 'var(--color-orange-soft)' : 'var(--color-surface-soft)',
                        color: isSelected ? 'var(--color-orange)' : 'var(--color-text-primary)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--motion-fast) var(--ease-standard)',
                      }}
                    >
                      {sub}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSubject('Other')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: `1px solid ${subject === 'Other' ? 'var(--color-orange)' : 'var(--color-border)'}`,
                    background: subject === 'Other' ? 'var(--color-orange-soft)' : 'var(--color-surface-soft)',
                    color: subject === 'Other' ? 'var(--color-orange)' : 'var(--color-text-primary)',
                    fontSize: '13px',
                    fontWeight: subject === 'Other' ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  Other…
                </button>
              </div>

              {subject === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom subject (e.g. World History, Macroeconomics)"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    marginTop: '6px',
                  }}
                />
              )}
            </div>

            {/* Topic & Grade */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Topic or Concept
                </label>
                <input
                  type="text"
                  placeholder="e.g. Snell's Law & Total Internal Reflection"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                {/* Topic quick suggestions */}
                {TOPIC_SUGGESTIONS[subject] && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {TOPIC_SUGGESTIONS[subject].map((sugg) => (
                      <span
                        key={sugg}
                        onClick={() => setTopic(sugg)}
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginRight: '6px',
                        }}
                      >
                        {sugg}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Grade / Academic Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 11, Grade 10, Undergraduate"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Document Grounding (RAG) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Study Material Grounding (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingDoc}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-orange)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isUploadingDoc ? 'Uploading notes…' : '+ Upload Notes'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md"
                  style={{ display: 'none' }}
                />
              </div>

              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                disabled={isLoadingDocs}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                }}
              >
                <option value="none">General Syllabus (No specific notes attached)</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    📄 {doc.filename} {doc.status !== 'ready' ? `(${doc.status})` : ''}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                When selected, Lumo extracts formulas, terminology, and problems directly from your uploaded material.
              </div>
            </div>

            {/* Fine-Tuning Grid: Difficulty, Question Type, Count */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '1.75rem',
              }}
            >
              {/* Difficulty */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="auto">Adaptive (Recommended)</option>
                  <option value="easy">Easy (Foundations)</option>
                  <option value="medium">Medium (Standard Exam)</option>
                  <option value="hard">Hard (Deep Thinking)</option>
                </select>
              </div>

              {/* Question Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Question Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="auto">Auto (Subject-Aware)</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="SHORT_ANSWER">Short Answer (1-2 sentences)</option>
                  <option value="LONG_ANSWER">Long Answer (Conceptual)</option>
                  <option value="NUMERICAL">Numerical Problem</option>
                  <option value="IMAGE_SOLUTION">Handwritten Solution (Photo)</option>
                </select>
              </div>

              {/* Target Marks */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Marks Target
                </label>
                <select
                  value={marks}
                  onChange={(e) => setMarks(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <option value="auto">Auto (Adaptive)</option>
                  <option value="1">1 Mark (Concept Check)</option>
                  <option value="2">2 Marks (Short Problem)</option>
                  <option value="3">3 Marks (Detailed)</option>
                  <option value="5">5 Marks (Structured / Long)</option>
                </select>
              </div>

              {/* Question Count / Target */}
              {mode !== 'quiz' && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    Question Target
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value={5}>5 Questions ({mode === 'mock' ? '15 min' : 'quick'})</option>
                    <option value={10}>10 Questions ({mode === 'mock' ? '30 min' : 'standard'})</option>
                    <option value={15}>15 Questions ({mode === 'mock' ? '45 min' : 'in-depth'})</option>
                    <option value={20}>20 Questions ({mode === 'mock' ? '60 min' : 'comprehensive'})</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
              <Button type="submit" variant="primary" size="lg">
                {mode === 'practice'
                  ? '✦ Start Practice Session'
                  : mode === 'mock'
                  ? `✦ Start Timed Mock Test (${questionCount * 3} min)`
                  : '✦ Start Conceptual Quiz (5 Qs)'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SAVED QUESTIONS (BOOKMARKS) */}
      {activeTab === 'bookmarks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                Saved Questions
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Questions you bookmarked during practice to review again.
              </p>
            </div>
          </div>

          {isLoadingData ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading saved questions…
            </div>
          ) : bookmarks.length === 0 ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔖</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                No saved questions yet
              </div>
              <div style={{ fontSize: '13px' }}>
                Click the <strong>Bookmark</strong> button during any practice question to save it here for later.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookmarks.map((bmk) => (
                <div
                  key={bmk.id}
                  style={{
                    padding: '16px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {bmk.question?.subject} &bull; {bmk.question?.concept} &bull; {bmk.question?.difficulty} &bull; {bmk.question?.marks} Marks
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                      {bmk.question?.question || `Question ID: ${bmk.questionId}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {bmk.question && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectSavedQuestion(bmk.question as ClientAssessmentQuestion)}
                      >
                        Practice &rarr;
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBookmark(bmk.questionId)}
                    >
                      Remove
                    </Button>
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
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
              Spaced Review & Mistakes Tracker
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Questions you missed earlier, scheduled using spaced repetition (3 days, then 7 days) until mastered.
            </p>
          </div>

          {isLoadingData ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Checking for due reviews…
            </div>
          ) : dueReviews.length === 0 ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                background: 'var(--color-mint-soft)',
                border: '1px solid var(--color-mint)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-mint)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                All caught up!
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                You have no questions due for spaced review right now. Keep practicing!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dueReviews.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: 600, marginBottom: '4px' }}>
                      ⚠️ Needs Review (Attempt #{item.attemptCount}) &bull; {item.subject} &bull; {item.concept}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                      {item.question?.question || `Question ID: ${item.questionId}`}
                    </div>
                    {item.misconceptions && item.misconceptions.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        Diagnosed misconception: <span style={{ color: 'var(--color-warning)', fontWeight: 500 }}>{item.misconceptions.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    {item.question && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectDueReview(item.question as ClientAssessmentQuestion)}
                      >
                        Reattempt Now &rarr;
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MASTERY & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
              Assessment Performance & Mastery
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Performance metrics derived deterministically from your question attempt history.
            </p>
          </div>

          {isLoadingData ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading performance analytics…
            </div>
          ) : !analytics ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
              }}
            >
              No assessment data recorded yet. Complete a few practice sessions to see your mastery metrics!
            </div>
          ) : (
            <div>
              {/* Stat Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '1.75rem',
                }}
              >
                <div
                  style={{
                    background: 'var(--color-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                    Total Attempts
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {analytics.totalAttempts}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--color-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                    Overall Accuracy
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: analytics.overallAccuracy >= 75 ? 'var(--color-mint)' : 'var(--color-orange)',
                    }}
                  >
                    {analytics.overallAccuracy}%
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--color-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                    Average Score
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-sky)' }}>
                    {analytics.averageScore} / 5.0
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--color-surface)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                    Distinct Questions
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {analytics.totalQuestions}
                  </div>
                </div>
              </div>

              {/* Concept Mastery Breakdown */}
              {Object.keys(analytics.byConcept).length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                    Concept Mastery
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(analytics.byConcept).map(([conceptName, cData]) => (
                      <div
                        key={conceptName}
                        style={{
                          padding: '12px 16px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>
                          {conceptName}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          Attempts: {cData.attempted} &bull; Accuracy: <strong>{cData.accuracy}%</strong> &bull; Mastery:{' '}
                          <strong style={{ color: cData.mastery >= 0.75 ? 'var(--color-mint)' : 'var(--color-text-primary)' }}>
                            {Math.round(cData.mastery * 100)}%
                          </strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
