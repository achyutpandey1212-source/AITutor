import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Document, RAGSearchResult } from '@ai-tutor/shared';
import { liveTutorApiClient } from '../services/api.service';

export interface DocumentManagerProps {
  idToken: string | null;
  onDocumentsUpdated?: (readyCount: number) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ idToken, onDocumentsUpdated }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // RAG Search Debug Tester State
  const [searchQuery, setSearchQuery] = useState<string>('What are the key laws of motion?');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<RAGSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!idToken) return;
    try {
      const docs = await liveTutorApiClient.listDocuments(idToken);
      setDocuments(docs);
      const readyCount = docs.filter((d) => d.status === 'ready').length;
      if (onDocumentsUpdated) {
        onDocumentsUpdated(readyCount);
      }
    } catch (err: any) {
      console.error('Error listing documents:', err);
    }
  }, [idToken, onDocumentsUpdated]);

  // Initial load
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll while any document is in pending or processing status
  useEffect(() => {
    const hasActiveProcessing = documents.some(
      (d) => d.status === 'pending' || d.status === 'processing'
    );

    if (!hasActiveProcessing) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 2500);

    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !idToken) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploadedDoc = await liveTutorApiClient.uploadDocument(idToken, file);
      setUploadSuccess(`Uploaded "${file.name}"! Ingestion is in progress...`);
      setDocuments((prev) => [uploadedDoc, ...prev]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, filename: string) => {
    if (!idToken) return;
    if (!window.confirm(`Delete document "${filename}" and its vector index?`)) return;

    try {
      await liveTutorApiClient.deleteDocument(idToken, documentId);
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      if (searchResult) setSearchResult(null);
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const result = await liveTutorApiClient.searchKnowledge(idToken, {
        query: searchQuery.trim(),
        topK: 10,
        topN: 3,
      });
      setSearchResult(result);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusBadge = (status: Document['status'], errorMessage?: string) => {
    switch (status) {
      case 'ready':
        return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '0.8rem', fontWeight: 600 }}>✅ Ready</span>;
      case 'processing':
        return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '0.8rem', fontWeight: 600 }}>🔄 Processing...</span>;
      case 'pending':
        return <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '0.8rem', fontWeight: 600 }}>⏳ Queued</span>;
      case 'failed':
        return (
          <span
            title={errorMessage || 'Ingestion failed'}
            style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', fontWeight: 600, cursor: 'help' }}
          >
            ❌ Failed ({errorMessage ? errorMessage.substring(0, 30) + '...' : 'Error'})
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <section style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
      <h2>📚 Study Knowledge & Document Ingestion (M6 RAG)</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Upload textbook chapters or study notes (.pdf). The system extracts, chunks, embeds with Cohere, and indexes in Qdrant for grounded voice tutoring.
      </p>

      {/* Upload Box */}
      <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".pdf,text/plain"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={isUploading || !idToken}
            style={{ fontSize: '0.9rem' }}
          />
          {isUploading && <span style={{ color: '#2563eb', fontStyle: 'italic', fontSize: '0.9rem' }}>Uploading & queuing background ingestion...</span>}
        </div>

        {uploadSuccess && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#ecfdf5', color: '#065f46', borderRadius: '4px', fontSize: '0.85rem' }}>
            {uploadSuccess}
          </div>
        )}
        {uploadError && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#fef2f2', color: '#991b1b', borderRadius: '4px', fontSize: '0.85rem' }}>
            {uploadError}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0 }}>Uploaded Study Documents ({documents.length})</h4>
          <button
            onClick={fetchDocuments}
            disabled={!idToken}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
          >
            🔄 Refresh List
          </button>
        </div>

        {documents.length === 0 ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem', margin: '0.5rem 0' }}>
            No documents uploaded yet. Upload a PDF to empower the tutor with your curriculum.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.5rem' }}>Filename</th>
                  <th style={{ padding: '0.5rem' }}>Size</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Chunks</th>
                  <th style={{ padding: '0.5rem' }}>Extraction</th>
                  <th style={{ padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 500 }}>{doc.filename}</td>
                    <td style={{ padding: '0.5rem', color: '#64748b' }}>{formatFileSize(doc.size)}</td>
                    <td style={{ padding: '0.5rem' }}>{getStatusBadge(doc.status, doc.errorMessage)}</td>
                    <td style={{ padding: '0.5rem' }}>{doc.chunkCount > 0 ? `${doc.chunkCount} vectors` : '-'}</td>
                    <td style={{ padding: '0.5rem', color: '#64748b' }}>
                      {doc.extractionMethod === 'pdf_text' ? 'Deterministic PDF' : doc.extractionMethod === 'gemini_fallback' ? 'Gemini Fallback' : '-'}
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                        style={{ padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive RAG Retrieval Debugger */}
      <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>🔍 RAG Semantic Retrieval & Rerank Tester</h4>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
          Query your indexed vectors in Qdrant and inspect Cohere Rerank relevance scores in real-time.
        </p>

        <form onSubmit={handleTestSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask a question about your uploaded documents..."
            disabled={searchLoading || !idToken}
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
          />
          <button
            type="submit"
            disabled={searchLoading || !idToken || !searchQuery.trim()}
            style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {searchLoading ? 'Searching...' : 'Search Vectors'}
          </button>
        </form>

        {searchError && (
          <div style={{ padding: '0.5rem', background: '#fef2f2', color: '#991b1b', borderRadius: '4px', fontSize: '0.85rem' }}>
            {searchError}
          </div>
        )}

        {searchResult && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.8rem', color: '#334155' }}>
              <span>Candidates: <strong>{searchResult.totalCandidates}</strong></span>
              <span>Rerank Used: <strong>{searchResult.rerankApplied ? 'Cohere Rerank' : 'Vector Rank Only'}</strong></span>
              <span>Query Embed: <strong>{searchResult.latency.queryEmbeddingMs}ms</strong></span>
              <span>Qdrant Search: <strong>{searchResult.latency.vectorSearchMs}ms</strong></span>
              <span>Rerank: <strong>{searchResult.latency.rerankMs}ms</strong></span>
              <span>Total Latency: <strong>{searchResult.latency.totalRetrievalMs}ms</strong></span>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {searchResult.retrievedChunks.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>No matching chunks found.</p>
              ) : (
                searchResult.retrievedChunks.map((chunk, i) => (
                  <div key={chunk.chunkId} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      <span><strong>Chunk #{i + 1}</strong>: {chunk.filename || chunk.documentId} (index: {chunk.chunkIndex})</span>
                      <span>
                        {chunk.rerankScore !== undefined && <span>Rerank Score: <strong>{chunk.rerankScore.toFixed(3)}</strong> | </span>}
                        Vector Score: <strong>{chunk.vectorScore.toFixed(3)}</strong>
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4', color: '#1e293b' }}>{chunk.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
