import React from 'react';
import { LogoWordmark } from '../ui/Logo';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-12) var(--space-6)',
        background: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <LogoWordmark height={36} />
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            AI-native learning environment built for real understanding.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              const el = document.getElementById('how');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            How it works
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('subjects');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Subjects
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('material');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Curriculum
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('theater');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
          >
            Learning Theater
          </button>
          <button
            onClick={() => onNavigate('/signin')}
            style={{ background: 'none', border: 'none', color: 'var(--color-orange)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign in
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 'var(--content-max-width)',
          margin: 'var(--space-8) auto 0',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>© 2026 Lumo — Learn anything. Your way.</span>
        <span>Built with care for students and thinkers.</span>
      </div>
    </footer>
  );
};
