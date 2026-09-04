import React from 'react';
import type { TutorVisualState } from '@ai-tutor/shared';
import { DEFAULT_VISUAL_STATE } from '../types/visual.types';
import { TitleScene } from '../scenes/TitleScene';
import { TextScene } from '../scenes/TextScene';
import { DiagramScene } from '../scenes/DiagramScene';
import { FormulaScene } from '../scenes/FormulaScene';
import { HighlightScene } from '../scenes/HighlightScene';
import { RecapScene } from '../scenes/RecapScene';
import { IllustrationScene } from '../scenes/IllustrationScene';
// Phase 3 scenes:
import { FlowchartScene } from '../scenes/FlowchartScene';
import { ComparisonScene } from '../scenes/ComparisonScene';
import { ProcessAnimationScene } from '../scenes/ProcessAnimationScene';
import { WorkedExampleScene } from '../scenes/WorkedExampleScene';

export interface LiveClassroomCompositionProps {
  visualState?: TutorVisualState;
  captionsEnabled?: boolean;
}

export const LiveClassroomComposition: React.FC<LiveClassroomCompositionProps> = ({
  visualState = DEFAULT_VISUAL_STATE,
  captionsEnabled: propCaptionsEnabled,
}) => {
  const {
    topic = 'AI Tutor Classroom',
    concept = 'Core Concepts',
    avatarState = 'IDLE',
    visualType = 'TITLE',
    visualData,
    captionText,
    captionsEnabled = false,
  } = visualState;

  // Prop takes precedence if provided, otherwise check state (default: false)
  const showCaptions = propCaptionsEnabled !== undefined ? propCaptionsEnabled : captionsEnabled;

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
      case 'FLOWCHART':
        return <FlowchartScene data={visualData} />;
      case 'COMPARISON':
        return <ComparisonScene data={visualData} />;
      case 'PROCESS_ANIMATION':
        return <ProcessAnimationScene data={visualData} />;
      case 'WORKED_EXAMPLE':
        return <WorkedExampleScene data={visualData} />;
      case 'PDF_ASSET':
      case 'IMAGE_ASSET':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Document Learning Asset
            </div>
            <h3 style={{ color: '#f8fafc', margin: '0 0 12px 0' }}>
              {visualData?.title || concept}
            </h3>
            {visualData?.assetUrl ? (
              <img
                src={visualData.assetUrl}
                alt={visualData.title || 'Document figure'}
                style={{
                  maxWidth: '85%',
                  maxHeight: '60%',
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div
                style={{
                  width: '80%',
                  height: '180px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px dashed rgba(56, 189, 248, 0.4)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              >
                📄 {visualData?.text || 'Textbook Figure / Diagram Reference'}
              </div>
            )}
          </div>
        );
      case 'TEXT':
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

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0A0A0B',
        backgroundImage:
          'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0)',
        backgroundSize: '32px 32px',
        color: '#F5F5F2',
        fontFamily: 'var(--theater-font-sans), system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '2.5rem 3rem',
      }}
    >
      {/* Full Digital Blackboard Canvas — 100% focused on pedagogical visuals */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {renderScene()}

        {/* Subtitle / Caption Layer (when enabled) */}
        {showCaptions && captionText && avatarState === 'SPEAKING' && (
          <div
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: '85%',
              backgroundColor: 'rgba(16, 16, 17, 0.94)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '0.45rem 1.4rem',
              color: '#F5F5F2',
              fontSize: '0.92rem',
              fontWeight: 500,
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              zIndex: 20,
              lineHeight: 1.4,
            }}
          >
            {captionText}
          </div>
        )}
      </div>
    </div>
  );
};
