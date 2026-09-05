import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';

export const CodeWalkthroughTemplate: UniversalTemplateRenderer = {
  id: 'template.code.walkthrough',
  name: 'Code Walkthrough',
  description: 'Renders code blocks with line highlighting, step walkthroughs, and annotations.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title || 'Code Walkthrough';
    const subtitle = payload.subtitle;

    let codeString = payload.code?.codeString;
    let language = payload.code?.language || 'typescript';
    let highlightLines = payload.code?.highlightLines || [];

    // Fallback: extract from semantic content code block if payload was omitted
    if (!codeString && beat.content?.blocks) {
      const codeBlock = beat.content.blocks.find((b) => b.type === 'code');
      if (codeBlock && codeBlock.type === 'code') {
        codeString = codeBlock.code;
        language = codeBlock.language;
      }
    }

    const lines = (codeString || '// No code provided').split('\n');

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '24px 36px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
        className="template-code-walkthrough"
      >
        {/* Header */}
        <div style={{ marginBottom: '14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              CODE · {language.toUpperCase()}
            </span>
          </div>
          <h2
            style={{
              margin: '6px 0 0 0',
              fontSize: '18px',
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Code Editor Surface */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#070a0f',
            borderRadius: '6px',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Editor Tab Bar */}
          <div
            style={{
              height: '32px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '6px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span
              style={{
                marginLeft: '10px',
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: "'Fira Code', monospace",
              }}
            >
              example.{language === 'typescript' ? 'ts' : language === 'python' ? 'py' : 'txt'}
            </span>
          </div>

          {/* Code Lines with Line Numbers */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 0',
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = highlightLines.includes(lineNum);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: isHighlighted ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    borderLeft: isHighlighted ? '3px solid #38bdf8' : '3px solid transparent',
                    padding: '1px 16px 1px 12px',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      color: isHighlighted ? '#38bdf8' : '#475569',
                      fontSize: '11px',
                      textAlign: 'right',
                      userSelect: 'none',
                      marginRight: '16px',
                    }}
                  >
                    {lineNum}
                  </span>
                  <span
                    style={{
                      color: isHighlighted ? '#f8fafc' : '#cbd5e1',
                      fontWeight: isHighlighted ? 500 : 400,
                      whiteSpace: 'pre',
                    }}
                  >
                    {line || ' '}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
