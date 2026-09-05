import React from 'react';
import type { UniversalTeachingBeat } from '@ai-tutor/shared';
import { UniversalTemplateEngine } from '../templates/UniversalTemplateEngine';

export const DEFAULT_UNIVERSAL_BEAT: UniversalTeachingBeat = {
  beatIndex: 0,
  beatId: 'beat-default',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 1,
        content: [{ text: 'Universal AI Classroom' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'Lumo provides ' },
          { text: 'subject-agnostic visual teaching', marks: ['bold', 'term'] },
          { text: ' across mathematics, sciences, humanities, and engineering.' },
        ],
      },
      {
        type: 'note',
        variant: 'info',
        content: [
          {
            text: 'Visual layouts are dynamically composed from pedagogical intent and semantic data blocks.',
          },
        ],
      },
    ],
  },
  speechText: 'Welcome to the universal AI classroom. Ask about any subject to begin.',
  displayText: 'Welcome to the Universal AI Classroom. Ask about any subject to begin learning.',
  captionText: 'Welcome to the Universal AI Classroom.',
  visual: {
    intent: 'EXPLANATION',
    templateId: 'template.explanation.editorial',
    environment: 'NEUTRAL',
    payload: {
      title: 'Universal AI Classroom',
      subtitle: 'Dynamic Subject-Agnostic Teaching Engine',
    },
  },
  animation: {
    enterTransition: 'fade',
    activeElements: [],
  },
  avatar: {
    framing: 'medium',
    gesture: 'welcoming',
    gazeTarget: 'student',
  },
};

export interface UniversalClassroomCompositionProps {
  beat?: UniversalTeachingBeat;
  captionsEnabled?: boolean;
  width?: number;
  height?: number;
}

export const UniversalClassroomComposition: React.FC<UniversalClassroomCompositionProps> = ({
  beat = DEFAULT_UNIVERSAL_BEAT,
  captionsEnabled = false,
  width = 1280,
  height = 720,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#070a0f',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
      className="universal-classroom-composition"
    >
      {/* Main Visual Stage Area — full height, all space given to the template */}
      <div
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <UniversalTemplateEngine
          beat={beat}
          width={width}
          height={captionsEnabled ? height - 52 : height}
        />
      </div>

      {/* Bottom Subtitle / Narration Bar — only when captions are on */}
      {captionsEnabled && (
        <div
          style={{
            height: '52px',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid rgba(51, 65, 85, 0.25)',
            backgroundColor: 'rgba(11, 15, 23, 0.9)',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#e2e8f0',
              textAlign: 'center',
              maxWidth: '960px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {beat.captionText || beat.displayText}
          </p>
        </div>
      )}
    </div>
  );
};
