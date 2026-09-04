import React, { useState, useEffect, useCallback } from 'react';
import type {
  User as AppUser,
  TeachingSession,
  Document as KnowledgeDoc,
  WrongAssessmentQuestion,
  AssessmentAnalytics,
} from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { ContinueLearningCard } from '../dashboard/ContinueLearningCard';
import { StartLearningModal } from '../dashboard/StartLearningModal';
import { RecentDocumentsSection } from '../dashboard/RecentDocumentsSection';
import { RecommendedLearningSection } from '../dashboard/RecommendedLearningSection';
import { LearningMasterySection } from '../dashboard/LearningMasterySection';
import { QuickActionsBar } from '../dashboard/QuickActionsBar';

// ---------------------------------------------------------------
// Lumo Dashboard / Learning Home (Phase 2A Editorial Edition)
// Quiet, typographic launchpad into Lumo's learning experience.
// ---------------------------------------------------------------

export interface DashboardPageProps {
  user: AppUser | null;
  idToken: string;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  idToken,
  onNavigate,
}) => {
  // State
  const [sessions, setSessions] = useState<TeachingSession[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [dueReviews, setDueReviews] = useState<WrongAssessmentQuestion[]>([]);
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);

  // Loading flags
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Error states for resilience
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // Start Learning Modal State
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState('');
  const [modalSubject, setModalSubject] = useState('Physics');
  const [modalDocumentId, setModalDocumentId] = useState('none');

  // 1. Fetch teaching sessions
  const fetchSessions = useCallback(async () => {
    if (!idToken) return;
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await liveTutorApiClient.listTeachingSessions(idToken);
      setSessions(data);
    } catch (err: any) {
      console.warn('Failed to load teaching sessions:', err);
      setSessionsError('Could not load your recent learning sessions.');
    } finally {
      setSessionsLoading(false);
    }
  }, [idToken]);

  // 2. Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!idToken) return;
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const data = await liveTutorApiClient.listDocuments(idToken);
      setDocuments(data);
    } catch (err: any) {
      console.warn('Failed to load documents:', err);
      setDocumentsError('Could not load your study documents.');
    } finally {
      setDocumentsLoading(false);
    }
  }, [idToken]);

  // 3. Fetch due reviews
  const fetchDueReviews = useCallback(async () => {
    if (!idToken) return;
    setReviewsLoading(true);
    try {
      const data = await liveTutorApiClient.getDueReviews(idToken);
      setDueReviews(data);
    } catch (err) {
      console.warn('Failed to load due reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [idToken]);

  // 4. Fetch assessment analytics
  const fetchAnalytics = useCallback(async () => {
    if (!idToken) return;
    setAnalyticsLoading(true);
    try {
      const data = await liveTutorApiClient.getAssessmentAnalytics(idToken);
      setAnalytics(data);
    } catch (err) {
      console.warn('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [idToken]);

  // Initial load
  useEffect(() => {
    fetchSessions();
    fetchDocuments();
    fetchDueReviews();
    fetchAnalytics();
  }, [fetchSessions, fetchDocuments, fetchDueReviews, fetchAnalytics]);

  // Poll while any document is in pending/processing
  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === 'pending' || d.status === 'processing'
    );
    if (!hasProcessing) return;

    const timer = setInterval(() => {
      fetchDocuments();
    }, 3000);

    return () => clearInterval(timer);
  }, [documents, fetchDocuments]);

  // Action handlers
  const handleOpenStartModal = (topic = '', subject = 'Physics', docId = 'none') => {
    setModalTopic(topic);
    setModalSubject(subject);
    setModalDocumentId(docId);
    setIsStartModalOpen(true);
  };

  const handleContinueSession = (session: TeachingSession) => {
    // Navigate directly into the Learning Theater with the chosen session
    onNavigate(`/tutor?sessionId=${session.id}`);
  };

  const handleSelectDocument = (doc: KnowledgeDoc) => {
    const cleanTopic = doc.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    handleOpenStartModal(cleanTopic, 'Physics', doc.id);
  };

  const handleUploadFile = async (file: File) => {
    if (!idToken) return;
    setIsUploadingDoc(true);
    try {
      await liveTutorApiClient.uploadDocument(idToken, file);
      await fetchDocuments();
    } catch (err: any) {
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string, filename: string) => {
    if (!idToken) return;
    if (!window.confirm(`Remove "${filename}" from your study materials?`)) return;

    try {
      await liveTutorApiClient.deleteDocument(idToken, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleSelectRecommendation = (topic: string, subject: string) => {
    handleOpenStartModal(topic, subject);
  };

  const handleSessionStarted = (newSession: TeachingSession) => {
    onNavigate(`/tutor?sessionId=${newSession.id}`);
  };

  const firstName = user?.displayName
    ? user.displayName.split(' ')[0]
    : user?.email?.split('@')[0] || '';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--color-background)',
        paddingTop: 'var(--space-10)',
        paddingBottom: 'var(--space-24)',
      }}
    >
      <div className="lumo-container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {/* ========================================================= */}
          {/* 1. PERSONAL LEARNING HOME HERO                            */}
          {/* Strong typography, intentional whitespace, zero clutter.  */}
          {/* ========================================================= */}
          <section
            aria-label="Personal learning home"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              {firstName ? `${firstName}'s Learning Space` : 'Your Learning Space'}
            </span>

            <h1
              style={{
                fontSize: 'clamp(36px, 4.5vw, 54px)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.035em',
                lineHeight: 1.08,
                margin: 0,
              }}
            >
              Keep learning.
            </h1>

            <p
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                margin: 0,
                marginTop: '4px',
                maxWidth: '560px',
              }}
            >
              {sessions.length > 0
                ? 'Lumo remembers where you left off. Continue your visual lesson or explore a new concept.'
                : 'Select a topic or bring study material to start your first visual lesson.'}
            </p>
          </section>

          {/* ========================================================= */}
          {/* 2. SPACED REVIEWS WHISPER (if due)                        */}
          {/* Quiet, refined text alert rather than a loud card banner  */}
          {/* ========================================================= */}
          {dueReviews.length > 0 && !reviewsLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-warning-soft)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-body-sm)',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>●</span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  You have <strong>{dueReviews.length} concept review{dueReviews.length > 1 ? 's' : ''}</strong> scheduled for spaced practice.
                </span>
              </div>

              <button
                onClick={() => onNavigate('/mistakes')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-warning)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 'var(--text-caption)',
                  padding: 0,
                }}
              >
                Practice now &rarr;
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. CONTINUE LEARNING — THE PRIMARY FOCUS                  */}
          {/* Asymmetric, open editorial focal point                     */}
          {/* ========================================================= */}
          <section aria-labelledby="lumo-continue-label">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <span
                id="lumo-continue-label"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}
              >
                In Progress
              </span>

              {sessionsError && (
                <button
                  onClick={fetchSessions}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-orange)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Retry loading
                </button>
              )}
            </div>

            <ContinueLearningCard
              sessions={sessions}
              loading={sessionsLoading}
              onContinue={handleContinueSession}
              onStartNew={() => handleOpenStartModal()}
            />
          </section>

          {/* ========================================================= */}
          {/* 4. QUICK ACTIONS STRIP                                    */}
          {/* ========================================================= */}
          <QuickActionsBar
            onStartLearning={() => handleOpenStartModal()}
            onPractice={() => onNavigate('/practice')}
            onUploadMaterial={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
              fileInput?.click();
            }}
            onViewMistakes={() => onNavigate('/mistakes')}
            dueReviewsCount={dueReviews.length}
          />

          {/* ========================================================= */}
          {/* 5. RECENT STUDY MATERIAL                                  */}
          {/* Structured editorial list with hairline dividers          */}
          {/* ========================================================= */}
          {documentsError && (
            <div style={{ fontSize: '13px', color: 'var(--color-error)' }}>
              {documentsError}{' '}
              <button
                onClick={fetchDocuments}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-orange)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Retry
              </button>
            </div>
          )}

          <RecentDocumentsSection
            documents={documents}
            loading={documentsLoading}
            onSelectDocument={handleSelectDocument}
            onUploadFile={handleUploadFile}
            onDeleteDocument={handleDeleteDocument}
            onViewAllDocuments={() => onNavigate('/documents')}
            isUploading={isUploadingDoc}
          />

          {/* ========================================================= */}
          {/* 6. RECOMMENDED NEXT STEPS                                 */}
          {/* ========================================================= */}
          <RecommendedLearningSection
            sessions={sessions}
            dueReviews={dueReviews}
            loading={sessionsLoading || reviewsLoading}
            onSelectRecommendation={handleSelectRecommendation}
          />

          {/* ========================================================= */}
          {/* 7. LIGHTWEIGHT MASTERY ORIENTATION                        */}
          {/* ========================================================= */}
          <LearningMasterySection
            analytics={analytics}
            sessions={sessions}
            loading={analyticsLoading || sessionsLoading}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* START LEARNING MODAL                                      */}
      {/* ========================================================= */}
      <StartLearningModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        idToken={idToken}
        existingDocuments={documents}
        onDocumentUploaded={fetchDocuments}
        onSessionStarted={handleSessionStarted}
        initialTopic={modalTopic}
        initialSubject={modalSubject}
        initialDocumentId={modalDocumentId}
      />
    </div>
  );
};
