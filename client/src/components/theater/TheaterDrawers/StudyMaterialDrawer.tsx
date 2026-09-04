import React from 'react';
import { IconMaterials } from '../TheaterIcons';

export interface StudyMaterialDrawerProps {
  documentTitle?: string;
  documentId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StudyMaterialDrawer: React.FC<StudyMaterialDrawerProps> = ({
  documentTitle,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      aria-label="Study Material Grounding"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'min(380px, 90vw)',
        height: '100vh',
        background: 'var(--theater-surface)',
        borderLeft: '1px solid var(--theater-border-medium)',
        boxShadow: 'var(--theater-shadow-stage)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'theaterSlideInRight 0.25s var(--theater-ease)',
        color: 'var(--theater-text-primary)',
        fontFamily: 'var(--theater-font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--theater-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <IconMaterials size={18} style={{ color: 'var(--theater-text-primary)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: 'var(--theater-text-primary)' }}>
              Study Material
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--theater-text-muted)' }}>
              Document grounding & syllabus context
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid var(--theater-border-subtle)',
            borderRadius: 'var(--theater-radius-sm)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theater-text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all var(--theater-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-primary)';
            e.currentTarget.style.borderColor = 'var(--theater-border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--theater-text-muted)';
            e.currentTarget.style.borderColor = 'var(--theater-border-subtle)';
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {documentTitle ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '1.1rem',
                background: 'var(--theater-surface-elevated)',
                border: '1px solid var(--theater-border-medium)',
                borderRadius: 'var(--theater-radius-md)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--theater-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Active Document
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--theater-text-primary)', marginTop: '0.35rem' }}>
                {documentTitle}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: 'var(--theater-text-muted)', lineHeight: 1.45 }}>
                Lumo is using this document to ground definitions, formulas, and syllabus requirements.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'var(--theater-surface-sunken)',
                border: '1px solid var(--theater-border-subtle)',
                borderRadius: 'var(--theater-radius-md)',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--theater-text-primary)', fontWeight: 600 }}>
                Study Tips
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.1rem',
                  fontSize: '0.8rem',
                  color: 'var(--theater-text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                <li>Ask Lumo to explain specific sections, diagrams, or exercises from your notes.</li>
                <li>Say: <em>&quot;Explain Figure 3 from my document&quot;</em> or <em>&quot;Quiz me on this chapter&quot;</em>.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--theater-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            <p>No document attached to this session.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--theater-text-faint)' }}>
              Lumo is teaching using its broad scientific and mathematical knowledge base.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
