import React, { useState, useEffect } from 'react';
import type { Document as KnowledgeDoc } from '@ai-tutor/shared';
import type { WorkspaceContext } from './types';
import { liveTutorApiClient } from '../../services/api.service';
import { Button } from '../ui/Button';

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext: WorkspaceContext;
  onSaveContext: (ctx: WorkspaceContext) => void;
  idToken: string;
}

export const ContextModal: React.FC<ContextModalProps> = ({
  isOpen,
  onClose,
  currentContext,
  onSaveContext,
  idToken,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'topic'>('documents');
  const [subject, setSubject] = useState(currentContext.subject || '');
  const [topic, setTopic] = useState(currentContext.topic || '');
  const [concept, setConcept] = useState(currentContext.concept || '');
  const [selectedDocId, setSelectedDocId] = useState(currentContext.documentId || '');
  const [selectedDocTitle, setSelectedDocTitle] = useState(currentContext.documentTitle || '');

  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject(currentContext.subject || '');
      setTopic(currentContext.topic || '');
      setConcept(currentContext.concept || '');
      setSelectedDocId(currentContext.documentId || '');
      setSelectedDocTitle(currentContext.documentTitle || '');
      loadDocuments();
    }
  }, [isOpen, currentContext]);

  const loadDocuments = async () => {
    if (!idToken) return;
    setIsLoadingDocs(true);
    try {
      const docs = await liveTutorApiClient.listDocuments(idToken);
      setDocuments(docs.filter((d) => d.status === 'ready'));
    } catch (err: any) {
      console.warn('Failed to load user documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !idToken) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await liveTutorApiClient.uploadDocument(idToken, file);
      setSelectedDocId(uploaded.id);
      setSelectedDocTitle(uploaded.filename);
      await loadDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSaveContext({
      subject: subject.trim() || undefined,
      topic: topic.trim() || undefined,
      concept: concept.trim() || undefined,
      documentId: selectedDocId || undefined,
      documentTitle: selectedDocTitle || undefined,
    });
    onClose();
  };

  const handleClearAll = () => {
    onSaveContext({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        background: 'var(--color-overlay)',
        backdropFilter: 'blur(2px)',
        animation: 'lumo-fade-in var(--motion-fast) var(--ease-enter)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'lumo-slide-up var(--motion-moderate) var(--ease-enter)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 'var(--text-body-lg)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Attach Learning Context
            </h3>
            <p
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                margin: '2px 0 0 0',
              }}
            >
              Ground Lumo in your syllabus or course material.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 20px',
            gap: '16px',
            background: 'var(--color-surface-hover)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 0',
              fontSize: 'var(--text-body-sm)',
              fontWeight: activeTab === 'documents' ? 700 : 500,
              color: activeTab === 'documents' ? 'var(--color-orange)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'documents' ? '2px solid var(--color-orange)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Study Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topic')}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 0',
              fontSize: 'var(--text-body-sm)',
              fontWeight: activeTab === 'topic' ? 700 : 500,
              color: activeTab === 'topic' ? 'var(--color-orange)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'topic' ? '2px solid var(--color-orange)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            Subject & Topic
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'documents' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Your Documents
                </span>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                  <span>{isUploading ? 'Uploading…' : '+ Upload Document'}</span>
                </label>
              </div>

              {uploadError && (
                <div style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)' }}>
                  {uploadError}
                </div>
              )}

              {isLoadingDocs ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  Loading study material…
                </div>
              ) : documents.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-body-sm)',
                  }}
                >
                  No documents uploaded yet. Upload a PDF or textbook chapter to ground Lumo in your notes.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {documents.map((doc) => {
                    const isSelected = selectedDocId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDocId('');
                            setSelectedDocTitle('');
                          } else {
                            setSelectedDocId(doc.id);
                            setSelectedDocTitle(doc.filename);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border)'}`,
                          background: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                          cursor: 'pointer',
                          transition: 'all var(--motion-fast) var(--ease-standard)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>📄</span>
                          <div>
                            <div style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {doc.filename}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {(doc.size / 1024 / 1024).toFixed(1)} MB · Ready for Q&A
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border)'}`,
                            background: isSelected ? 'var(--color-orange)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics, Mathematics, Biology"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-body-sm)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newton's Laws, Thermodynamics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-body-sm)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-body-sm)', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                  Specific Concept (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Newton's Second Law, Friction"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-body-sm)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-surface)',
          }}
        >
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear Context
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Context
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
