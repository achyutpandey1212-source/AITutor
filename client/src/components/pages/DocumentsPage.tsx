import React from 'react';
import { DocumentManager } from '../DocumentManager';

export interface DocumentsPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ idToken, onNavigate }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '1.5rem auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, color: '#0f172a' }}>Study Knowledge & Documents</h1>
        <button
          onClick={() => onNavigate('/dashboard')}
          style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          &larr; Dashboard
        </button>
      </div>

      <DocumentManager idToken={idToken} />
    </div>
  );
};
