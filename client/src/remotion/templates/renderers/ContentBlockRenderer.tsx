import type React from 'react';
import type {
  ContentBlock,
  InlineContent,
  BaseContentBlock,
} from '@ai-tutor/shared';
import { formatLatexFallback } from '@ai-tutor/shared';

/**
 * Renders an array of InlineContent with structured typographical styling.
 */
export const InlineContentRenderer: React.FC<{ items: InlineContent[] }> = ({ items }) => {
  return (
    <>
      {items.map((item, idx) => {
        const marks = item.marks || [];

        let style: React.CSSProperties = {};

        if (marks.includes('bold')) {
          style.fontWeight = 700;
          style.color = '#ffffff';
        }
        if (marks.includes('italic')) {
          style.fontStyle = 'italic';
        }
        if (marks.includes('highlight')) {
          style.backgroundColor = 'rgba(245, 158, 11, 0.22)';
          style.color = '#fef3c7';
          style.padding = '2px 7px';
          style.borderRadius = '4px';
          style.border = '1px solid rgba(245, 158, 11, 0.4)';
          style.fontWeight = 600;
        }
        if (marks.includes('term')) {
          style.color = '#38bdf8';
          style.borderBottom = '1.5px solid rgba(56, 189, 248, 0.6)';
          style.fontWeight = 600;
        }
        if (marks.includes('variable')) {
          style.fontFamily = "'Fira Code', 'Courier New', monospace";
          style.color = '#fbbf24';
          style.fontStyle = 'italic';
          style.fontSize = '0.95em';
          style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
          style.padding = '1px 4px';
          style.borderRadius = '3px';
        }
        if (marks.includes('emphasis')) {
          style.color = '#f8fafc';
          style.fontWeight = 600;
          style.letterSpacing = '0.01em';
        }
        if (marks.includes('definition')) {
          style.fontWeight = 650;
          style.color = '#38bdf8';
        }

        return (
          <span key={idx} style={style}>
            {item.text}
          </span>
        );
      })}
    </>
  );
};

export interface ContentBlockRendererProps {
  block: ContentBlock | BaseContentBlock;
  index?: number;
}

/**
 * Renders an individual semantic ContentBlock with editorial hierarchy.
 */
export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ block, index = 0 }) => {
  switch (block.type) {
    case 'heading': {
      const isH1 = block.level === 1;
      const isH2 = block.level === 2;
      return (
        <div
          style={{
            marginTop: index === 0 ? '0' : isH1 ? '24px' : '18px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              fontSize: isH1 ? '22px' : isH2 ? '18px' : '15px',
              fontWeight: 700,
              color: isH1 ? '#f8fafc' : '#f1f5f9',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            <InlineContentRenderer items={block.content} />
          </div>
        </div>
      );
    }

    case 'paragraph':
      return (
        <p
          style={{
            margin: '0 0 14px 0',
            fontSize: '16.5px',
            lineHeight: 1.7,
            color: '#cbd5e1',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          <InlineContentRenderer items={block.content} />
        </p>
      );

    case 'definition':
      return (
        <div
          style={{
            margin: '20px 0',
            padding: '24px 28px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            borderLeft: '5px solid #38bdf8',
            borderRadius: '0 10px 10px 0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderLeftWidth: '5px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              padding: '3px 10px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          >
            DEFINITION
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#f8fafc',
              lineHeight: 1.25,
              marginBottom: '14px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            {block.term}
          </div>
          <div
            style={{
              fontSize: '18px',
              lineHeight: 1.65,
              color: '#cbd5e1',
              fontWeight: 400,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            <InlineContentRenderer items={block.definition} />
          </div>
        </div>
      );

    case 'example':
      return (
        <div
          style={{
            margin: '14px 0',
            padding: '12px 16px',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              marginBottom: '6px',
            }}
          >
            {block.title ? `EXAMPLE · ${block.title}` : 'EXAMPLE'}
          </div>
          <div style={{ color: '#cbd5e1' }}>
            {block.content.map((subBlock, sIdx) => (
              <ContentBlockRenderer key={sIdx} block={subBlock} index={sIdx} />
            ))}
          </div>
        </div>
      );

    case 'quote':
      return (
        <blockquote
          style={{
            margin: '14px 0',
            padding: '8px 16px',
            borderLeft: '2.5px solid #64748b',
            fontStyle: 'italic',
            color: '#cbd5e1',
            backgroundColor: 'rgba(15, 23, 42, 0.3)',
          }}
        >
          <div style={{ fontSize: '13.5px', lineHeight: 1.6 }}>
            <InlineContentRenderer items={block.content} />
          </div>
          {block.attribution && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '11px',
                fontStyle: 'normal',
                color: '#94a3b8',
                fontWeight: 500,
              }}
            >
              — {block.attribution}
            </div>
          )}
        </blockquote>
      );

    case 'note': {
      const variantColors: Record<string, { border: string; bg: string; title: string }> = {
        info: { border: 'rgba(56, 189, 248, 0.35)', bg: 'rgba(14, 165, 233, 0.06)', title: '#38bdf8' },
        observation: { border: 'rgba(52, 211, 153, 0.35)', bg: 'rgba(16, 185, 129, 0.06)', title: '#34d399' },
        rule: { border: 'rgba(251, 191, 36, 0.35)', bg: 'rgba(245, 158, 11, 0.06)', title: '#fbbf24' },
        warning: { border: 'rgba(248, 113, 113, 0.35)', bg: 'rgba(239, 68, 68, 0.06)', title: '#f87171' },
        tip: { border: 'rgba(192, 132, 252, 0.35)', bg: 'rgba(168, 85, 247, 0.06)', title: '#c084fc' },
      };
      const v = variantColors[block.variant || 'info'] || variantColors.info;
      return (
        <div
          style={{
            margin: '12px 0',
            padding: '10px 14px',
            backgroundColor: v.bg,
            border: `1px solid ${v.border}`,
            borderRadius: '5px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: v.title,
              marginBottom: '4px',
            }}
          >
            {block.variant.toUpperCase()}
          </div>
          <div style={{ fontSize: '12.5px', lineHeight: 1.55, color: '#e2e8f0' }}>
            <InlineContentRenderer items={block.content} />
          </div>
        </div>
      );
    }

    case 'formula':
      return (
        <div
          style={{
            margin: '14px 0',
            padding: '12px 18px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#38bdf8',
              fontFamily: "'Fira Code', 'Courier New', monospace",
              letterSpacing: '0.02em',
            }}
          >
            {formatLatexFallback(block.latex)}
          </div>
          {block.explanation && block.explanation.length > 0 && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '11px',
                color: '#94a3b8',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <InlineContentRenderer items={block.explanation} />
            </div>
          )}
        </div>
      );

    case 'list': {
      const isOrdered = Boolean(block.ordered);
      return (
        <div style={{ margin: '12px 0 16px 0' }}>
          {block.items.map((item, iIdx) => (
            <div
              key={iIdx}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '10px',
                marginBottom: '8px',
                fontSize: '16px',
                lineHeight: 1.65,
                color: '#e2e8f0',
              }}
            >
              <span
                style={{
                  color: '#38bdf8',
                  fontSize: isOrdered ? '14px' : '14px',
                  fontWeight: 700,
                  minWidth: isOrdered ? '22px' : '10px',
                }}
              >
                {isOrdered ? `${iIdx + 1}.` : '•'}
              </span>
              <div>
                <InlineContentRenderer items={item} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'step':
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            margin: '10px 0',
            padding: '10px 14px',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(51, 65, 85, 0.35)',
            borderRadius: '6px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '1px',
            }}
          >
            {block.stepNumber}
          </div>
          <div style={{ flex: 1 }}>
            {block.title && (
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#f8fafc',
                  marginBottom: '3px',
                }}
              >
                {block.title}
              </div>
            )}
            <div style={{ fontSize: '12.5px', lineHeight: 1.55, color: '#cbd5e1' }}>
              <InlineContentRenderer items={block.content} />
            </div>
          </div>
        </div>
      );

    case 'code':
      return (
        <div
          style={{
            margin: '12px 0',
            backgroundColor: '#070a0f',
            border: '1px solid rgba(51, 65, 85, 0.4)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '5px 12px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
              fontSize: '10px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            {block.language || 'code'}
          </div>
          <pre
            style={{
              margin: 0,
              padding: '12px',
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: '12px',
              lineHeight: 1.5,
              color: '#e2e8f0',
              overflowX: 'auto',
            }}
          >
            <code>{block.code}</code>
          </pre>
          {block.caption && (
            <div
              style={{
                padding: '4px 12px 6px',
                fontSize: '10.5px',
                color: '#94a3b8',
                borderTop: '1px solid rgba(51, 65, 85, 0.2)',
              }}
            >
              {block.caption}
            </div>
          )}
        </div>
      );

    case 'table':
      return (
        <div
          style={{
            margin: '14px 0',
            overflowX: 'auto',
            border: '1px solid rgba(51, 65, 85, 0.35)',
            borderRadius: '6px',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                {block.headers.map((header, hIdx) => (
                  <th
                    key={hIdx}
                    style={{
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#f8fafc',
                      borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                    }}
                  >
                    <InlineContentRenderer items={header} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.3)',
                    borderBottom: '1px solid rgba(51, 65, 85, 0.2)',
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '8px 12px', color: '#cbd5e1' }}>
                      <InlineContentRenderer items={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
};
