import React from 'react';
import type { UniversalTeachingBeat } from '@ai-tutor/shared';
import { resolveTemplate } from './registry';
import type { UniversalTemplateContext } from './types';

export interface UniversalTemplateEngineProps {
  beat: UniversalTeachingBeat;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface TemplateErrorBoundaryProps {
  fallbackText: string;
  children: React.ReactNode;
}

interface TemplateErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TemplateErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UniversalTemplateEngine caught rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            color: '#cbd5e1',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '540px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}
            >
              VISUAL RECOVERY FALLBACK
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              {this.props.fallbackText}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Universal Template Engine:
 * Resolves the visual template from beat.visual.templateId and orchestrates
 * its rendering through the chosen template renderer into the 2D primitives layer.
 */
export const UniversalTemplateEngine: React.FC<UniversalTemplateEngineProps> = ({
  beat,
  width = 960,
  height = 540,
  className = '',
  style = {},
}) => {
  const templateRenderer = resolveTemplate(beat.visual?.templateId);

  const context: UniversalTemplateContext = {
    beat,
    width,
    height,
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'transparent',
        ...style,
      }}
      className={`universal-template-engine ${className}`}
    >
      <TemplateErrorBoundary fallbackText={beat.displayText}>
        {templateRenderer.render(context)}
      </TemplateErrorBoundary>
    </div>
  );
};
