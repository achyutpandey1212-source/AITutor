import React from 'react';

export interface LandingPageProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, onNavigate }) => {
  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>AI Tutor</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem' }}>
        Your intelligent learning companion.
      </p>

      {isAuthenticated ? (
        <div>
          <button
            onClick={() => onNavigate('/dashboard')}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('/signin')}
            style={{
              padding: '0.75rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('/signup')}
            style={{
              padding: '0.75rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Create Account
          </button>
        </div>
      )}
    </div>
  );
};
