import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { CinematicVideo } from '../ui/CinematicVideo';

interface MaterialSectionProps {
  onStart: () => void;
}

export const MaterialSection: React.FC<MaterialSectionProps> = ({ onStart }) => {
  const documents = [
    {
      id: 'doc-1',
      name: 'MIT_8.01_Mechanics_Lecture_4.pdf',
      subject: 'Physics',
      pages: 36,
      concepts: 14,
      topics: ['Rotational Inertia (I)', 'Torque & Angular Momentum', 'Gyroscopic Precession'],
      tutorNote: "I've matched the exact coordinate conventions from your professor's lecture slides. Let's break down Problem 4 on page 22.",
    },
    {
      id: 'doc-2',
      name: 'Campbell_Biology_Membranes_Ch7.pdf',
      subject: 'Biology',
      pages: 48,
      concepts: 22,
      topics: ['Osmoregulation in Plant Cells', 'Sodium-Potassium ATPase Pump', 'Receptor-Mediated Endocytosis'],
      tutorNote: 'Indexed all electrochemical gradient figures from Chapter 7. Ready to walk through cellular tonicity experiments.',
    },
    {
      id: 'doc-3',
      name: 'Organic_Chemistry_Reactions_Wade.pdf',
      subject: 'Chemistry',
      pages: 52,
      concepts: 19,
      topics: ['SN1 vs SN2 Mechanisms', 'Carbocation Rearrangement', 'Stereochemical Inversion'],
      tutorNote: 'Extracted nucleophilic attack pathways. We can simulate backside attack and Walden inversion in 3D.',
    },
  ];

  const [selectedDocId, setSelectedDocId] = useState(documents[0].id);
  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const [selectedTopic, setSelectedTopic] = useState(activeDoc.topics[0]);

  // Update selected topic when document changes
  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    const doc = documents.find((d) => d.id === docId);
    if (doc) setSelectedTopic(doc.topics[0]);
  };

  return (
    <section
      id="material"
      style={{
        padding: 'var(--space-20) var(--space-6)',
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
      }}
    >
      {/* Editorial Header */}
      <div style={{ maxWidth: '640px', marginBottom: 'var(--space-10)' }}>
        <p
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-orange)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Curriculum Intelligence
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 4.5vw, var(--text-h1))',
            fontWeight: 800,
            letterSpacing: 'var(--text-h1-ls)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.15,
            marginBottom: 'var(--space-4)',
          }}
        >
          Bring your own material.
        </h2>
        <p
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--text-body-lg-lh)',
          }}
        >
          Upload your textbook, lecture slides, or professor's syllabus. Lumo indexes your course materials so every explanation uses the exact terms and problem sets you need for your exam.
        </p>
      </div>

      {/* Interactive Document Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.25fr',
          gap: 'var(--space-8)',
          alignItems: 'stretch',
        }}
        className="lumo-material-grid"
      >
        {/* Left: Your Document Vault */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-cinematic)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
              Your Knowledge Vault
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-mint)', fontWeight: 600 }}>
              ● 3 Active Docs
            </span>
          </div>

          {documents.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected ? 'var(--color-surface-soft)' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border-subtle)'}`,
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--color-orange-soft)' : 'var(--color-surface-soft)',
                    color: isSelected ? 'var(--color-orange)' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                >
                  PDF
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {doc.name}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    <span>{doc.pages} pages</span>
                    <span>·</span>
                    <span>{doc.concepts} concepts indexed</span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Live Document Digitization & RAG Transformation Preview */}
          <div
            style={{
              marginTop: 'auto',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              background: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
              <CinematicVideo
                src="/videos/rag.mp4"
                poster="/videos/posters/rag.jpg"
                aspectRatio="16 / 9"
                style={{ width: '100%', height: '100%' }}
                objectFit="cover"
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(13, 15, 18, 0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--color-mint)',
                      animation: 'lumo-pulse 1.6s infinite',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#F7F5EF', fontWeight: 600 }}>
                    Physical Books & Notes → Semantic Vector Space
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-surface-soft)',
                borderTop: '1px solid var(--color-border-subtle)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Drop textbooks or handwritten pages
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-orange)', fontWeight: 700 }}>
                Instant Ingestion
              </span>
            </div>
          </div>
        </div>

        {/* Right: Topic Indexer & Session Configurator */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-cinematic)',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-orange-soft)',
                  color: 'var(--color-orange)',
                }}
              >
                {activeDoc.subject}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Indexed Document Context
              </span>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0 16px' }}>
              {activeDoc.name}
            </h3>

            {/* Extracted Core Topics */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                Select Extracted Topic:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeDoc.topics.map((t) => {
                  const isTopSelected = t === selectedTopic;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTopic(t)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: isTopSelected ? 'var(--color-orange-soft)' : 'var(--color-surface-soft)',
                        border: `1px solid ${isTopSelected ? 'var(--color-orange)' : 'var(--color-border-subtle)'}`,
                        color: isTopSelected ? 'var(--color-orange)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        transition: 'all var(--motion-fast) var(--ease-standard)',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lumo Tutor Contextual Briefing */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border-subtle)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--color-orange)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                L
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-orange)', textTransform: 'uppercase' }}>
                  Lumo Lesson Strategy
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                  "{activeDoc.tutorNote}"
                </p>
              </div>
            </div>
          </div>

          {/* Launch Lesson Button */}
          <Button variant="primary" size="lg" onClick={onStart} style={{ width: '100%' }}>
            <span>Launch Lesson on {selectedTopic}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .lumo-material-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
