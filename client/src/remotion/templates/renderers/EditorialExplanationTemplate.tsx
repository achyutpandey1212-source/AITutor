import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';
import { ContentBlockRenderer } from './ContentBlockRenderer';

export const EditorialExplanationTemplate: UniversalTemplateRenderer = {
  id: 'template.explanation.editorial',
  name: 'Editorial Explanation',
  description: 'Renders semantic text, definitions, examples, and formulas with high-end editorial hierarchy.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const blocks = beat.content?.blocks || [];
    const title = beat.visual?.payload?.title;
    const subtitle = beat.visual?.payload?.subtitle;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          padding: '32px 48px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          color: '#f1f5f9',
          background: 'transparent',
        }}
        className="template-editorial-explanation"
      >
        {/* Editorial Header */}
        {(title || subtitle) && (
          <div
            style={{
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
            }}
          >
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: '25px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#f8fafc',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '6px 0 0 0',
                  fontSize: '14px',
                  color: '#94a3b8',
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Semantic Content Blocks */}
        {blocks.length > 0 ? (
          <div style={{ flex: 1 }}>
            {blocks.map((block, idx) => (
              <ContentBlockRenderer key={idx} block={block} index={idx} />
            ))}
          </div>
        ) : (
          /* Graceful Fallback if blocks are empty */
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#cbd5e1',
              textAlign: 'center',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            {beat.displayText}
          </div>
        )}
      </div>
    );
  },
};
