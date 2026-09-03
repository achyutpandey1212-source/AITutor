import React from 'react';
import type { TutorVisualState } from '@ai-tutor/shared';
import { DEFAULT_VISUAL_STATE } from '../types/visual.types';
import { AvatarPlaceholder } from '../components/AvatarPlaceholder';
import { TitleScene } from '../scenes/TitleScene';
import { TextScene } from '../scenes/TextScene';
import { DiagramScene } from '../scenes/DiagramScene';
import { FormulaScene } from '../scenes/FormulaScene';
import { HighlightScene } from '../scenes/HighlightScene';
import { RecapScene } from '../scenes/RecapScene';
import { IllustrationScene } from '../scenes/IllustrationScene';

export interface LiveClassroomCompositionProps {
  visualState?: TutorVisualState;
}

export const LiveClassroomComposition: React.FC<LiveClassroomCompositionProps> = ({
  visualState = DEFAULT_VISUAL_STATE,
}) => {
  const {
    topic = 'AI Tutor Classroom',
    concept = 'Core Concepts',
    mode = 'TEACHING',
    avatarState = 'IDLE',
    visualType = 'TITLE',
    visualData,
    captionText,
    activeBeatIndex = 0,
    totalBeats = 1,
  } = visualState;

  const renderScene = () => {
    switch (visualType) {
      case 'TITLE':
        return (
          <TitleScene
            title={visualData?.title || topic}
            subtitle={visualData?.subtitle || 'Interactive Live Learning Session'}
            concept={concept}
          />
        );
      case 'HIGHLIGHT':
        return (
          <HighlightScene
            heading={visualData?.heading || 'Key Term'}
            text={visualData?.text || concept}
            subtitle={visualData?.subtitle}
            concept={concept}
          />
        );
      case 'RECAP':
        return (
          <RecapScene
            heading={visualData?.heading || 'Quick Recap'}
            bullets={visualData?.bullets}
            concept={concept}
          />
        );
      case 'ILLUSTRATION':
        return (
          <IllustrationScene
            heading={visualData?.heading || 'Real-World Hook'}
            text={visualData?.text}
            subtitle={visualData?.subtitle}
            concept={concept}
          />
        );
      case 'TEXT':
      case 'COMPARISON':
      case 'PROCESS':
      case 'EXAMPLE':
        return (
          <TextScene
            heading={visualData?.heading || visualData?.title || concept || 'Key Concept'}
            text={visualData?.text}
            bullets={visualData?.bullets}
            concept={concept}
          />
        );
      case 'DIAGRAM':
        return (
          <DiagramScene
            concept={concept || 'Optical Physics'}
            label={visualData?.heading || visualData?.title || 'Interactive Ray Diagram'}
          />
        );
      case 'FORMULA':
        return (
          <FormulaScene
            formulaLabel={visualData?.formulaLabel || visualData?.heading || 'MATHEMATICAL FORMULA'}
            formula={visualData?.formula}
            concept={concept}
            variables={visualData?.variables}
            explanation={visualData?.formulaExplanation || visualData?.text}
          />
        );
      case 'NONE':
      default:
        return (
          <TitleScene
            title={visualData?.title || topic}
            subtitle={visualData?.subtitle || 'AI Tutor Live Classroom'}
            concept={concept}
          />
        );
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'ASSESSMENT':
        return { bg: '#581c87', text: '#f3e8ff', border: '#a855f7', label: 'ASSESSMENT MODE' };
      case 'FEEDBACK':
        return { bg: '#14532d', text: '#dcfce7', border: '#22c55e', label: 'EVALUATION & FEEDBACK' };
      case 'REVIEW':
        return { bg: '#1e3a8a', text: '#dbeafe', border: '#3b82f6', label: 'REVIEW MODE' };
      case 'TEACHING':
      default:
        return { bg: '#0369a1', text: '#e0f2fe', border: '#38bdf8', label: 'LIVE TEACHING' };
    }
  };

  const modeBadge = getModeColor();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#070b14',
        backgroundImage:
          'radial-gradient(rgba(30, 41, 59, 0.4) 1px, transparent 0), linear-gradient(to bottom, #070b14, #0b1120)',
        backgroundSize: '24px 24px, 100% 100%',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Classroom Header Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.9rem 1.5rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          background: 'rgba(11, 17, 32, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.01em' }}>
              {topic}
            </div>
            {concept && (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                Active Concept: <strong style={{ color: '#38bdf8' }}>{concept}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: modeBadge.bg,
              color: modeBadge.text,
              border: `1px solid ${modeBadge.border}`,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {modeBadge.label}
          </span>
        </div>
      </header>

      {/* Classroom Stage: Left Avatar + Center/Right Blackboard Visual Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          gap: '1.5rem',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Persistent Teacher Avatar Box */}
        <div style={{ flexShrink: 0 }}>
          <AvatarPlaceholder avatarState={avatarState} />
        </div>

        {/* Live Visual Board */}
        <div
          style={{
            flex: 1,
            height: '100%',
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '16px',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderScene()}

          {/* Subtitle / Caption Layer (Phase 2.5) */}
          {captionText && avatarState === 'SPEAKING' && (
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '85%',
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '10px',
                padding: '0.45rem 1.25rem',
                color: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 500,
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                zIndex: 20,
                lineHeight: 1.4,
              }}
            >
              💬 {captionText}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Status Ribbon */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1.5rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          background: 'rgba(11, 17, 32, 0.7)',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <div>
          <span>🎓 AI Tutor Visual Classroom</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <span style={{ color: '#94a3b8' }}>Scene: {visualType}</span>
          {totalBeats > 1 && (
            <span
              style={{
                marginLeft: '0.65rem',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '4px',
                padding: '0.1rem 0.4rem',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              Beat {activeBeatIndex + 1} / {totalBeats}
            </span>
          )}
        </div>

        {mode === 'ASSESSMENT' ? (
          <div style={{ color: '#c084fc', fontWeight: 600 }}>
            📝 Assessment Active on Right Panel • Board Preserved
          </div>
        ) : (
          <div>Barge-In Ready • Interrupt anytime by speaking</div>
        )}
      </footer>
    </div>
  );
};
