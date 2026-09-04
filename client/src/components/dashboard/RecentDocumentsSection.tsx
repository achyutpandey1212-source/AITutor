import React, { useRef, useState } from 'react';
import type { Document as KnowledgeDoc } from '@ai-tutor/shared';
import { Skeleton } from '../ui/Skeleton';

// ---------------------------------------------------------------
// Lumo Recent Documents Component (Editorial Edition)
// Clean, structured material list with hairline dividers.
// No clunky rounded cards.
// ---------------------------------------------------------------

export interface RecentDocumentsSectionProps {
  documents: KnowledgeDoc[];
  loading?: boolean;
  onSelectDocument: (doc: KnowledgeDoc) => void;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteDocument: (docId: string, filename: string) => Promise<void>;
  onViewAllDocuments?: () => void;
  isUploading?: boolean;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const RecentDocumentsSection: React.FC<RecentDocumentsSectionProps> = ({
  documents,
  loading = false,
  onSelectDocument,
  onUploadFile,
  onDeleteDocument,
  onViewAllDocuments,
  isUploading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayedDocs = documents.slice(0, 4);

  return (
    <section aria-labelledby="lumo-docs-heading" style={{ paddingTop: 'var(--space-2)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
          <h3
            id="lumo-docs-heading"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Study Material
          </h3>
          {documents.length > 0 && (
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              {documents.length} source{documents.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {documents.length > 4 && onViewAllDocuments && (
            <button
              onClick={onViewAllDocuments}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-caption)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              View all ({documents.length}) &rarr;
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-orange)',
              fontSize: 'var(--text-caption)',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isUploading ? 'Uploading…' : '+ Add material'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4) 0' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '44px' }}>
              <Skeleton width="40%" height="16px" />
              <Skeleton width="20%" height="14px" />
              <Skeleton width="100px" height="14px" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-6) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            maxWidth: '520px',
          }}
        >
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', margin: 0 }}>
            No study material uploaded yet.
          </p>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            Upload textbook chapters or notes to ground your AI lessons in your own curriculum.
          </p>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-orange)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              + Upload your first PDF
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayedDocs.map((doc) => {
            const isReady = doc.status === 'ready';
            const isProcessing = doc.status === 'processing' || doc.status === 'pending';
            const isHovered = hoveredDocId === doc.id;

            return (
              <div
                key={doc.id}
                onMouseEnter={() => setHoveredDocId(doc.id)}
                onMouseLeave={() => setHoveredDocId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  transition: 'background var(--motion-fast) var(--ease-standard)',
                  gap: 'var(--space-4)',
                }}
              >
                {/* Document Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>📄</span>
                    <span
                      style={{
                        fontSize: 'var(--text-body)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={doc.filename}
                    >
                      {doc.filename}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      paddingLeft: '22px',
                    }}
                  >
                    <span>{formatFileSize(doc.size)}</span>
                    <span>·</span>
                    <span>{doc.chunkCount > 0 ? `${doc.chunkCount} concepts indexed` : isProcessing ? 'Indexing...' : 'Pending'}</span>
                    <span>·</span>
                    <span>Added {formatRelativeDate(doc.createdAt)}</span>
                    {isProcessing && (
                      <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>· Processing</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>
                  {isHovered && (
                    <button
                      onClick={() => onDeleteDocument(doc.id, doc.filename)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Remove document"
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                    >
                      Remove
                    </button>
                  )}

                  <button
                    onClick={() => isReady && onSelectDocument(doc)}
                    disabled={!isReady}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isReady ? 'var(--color-orange)' : 'var(--color-text-muted)',
                      fontSize: 'var(--text-body-sm)',
                      fontWeight: 600,
                      cursor: isReady ? 'pointer' : 'default',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    onMouseEnter={(e) => {
                      if (isReady) e.currentTarget.style.background = 'var(--color-surface-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    {isReady ? 'Learn with this →' : 'Processing…'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
