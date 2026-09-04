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
        background: 'rgba(11, 14, 20, 0.96)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--theater-shadow-drawer)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'theaterSlideInRight 0.25s var(--theater-ease-out)',
        color: '#FFFFFF',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <IconMaterials size={18} style={{ color: 'var(--theater-accent-mint)' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
              Study Material
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#7E8695' }}>
              Document grounding & syllabus context
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8C96A5',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8C96A5')}
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
                background: 'rgba(85, 201, 138, 0.06)',
                border: '1px solid rgba(85, 201, 138, 0.25)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#55C98A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Active Document
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', marginTop: '0.35rem' }}>
                📚 {documentTitle}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: '#B4BAC5', lineHeight: 1.45 }}>
                Lumo is using this document to ground definitions, formulas, and syllabus requirements.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 700 }}>
                💡 Pro Tips
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.1rem',
                  fontSize: '0.8rem',
                  color: '#7E8695',
                  lineHeight: 1.55,
                }}
              >
                <li>Ask Lumo to explain specific sections, diagrams, or exercises from your notes.</li>
                <li>Say: <em>&quot;Explain Figure 3 from my document&quot;</em> or <em>&quot;Quiz me on this chapter&quot;</em>.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ color: '#7E8695', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
            <p>No document attached to this session.</p>
            <p style={{ fontSize: '0.78rem', color: '#4B5260' }}>
              Lumo is teaching using its broad scientific and mathematical knowledge base.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
