import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

// Helper to copy code to clipboard with visual feedback
const CodeBlock: React.FC<{ language?: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        margin: '14px 0',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-code-bg, #1a1d23)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono, monospace)',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--color-success, #10b981)' : '#cbd5e1',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            borderRadius: '4px',
            transition: 'color 0.15s ease',
          }}
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '12px 16px',
          overflowX: 'auto',
          fontSize: '13px',
          lineHeight: 1.55,
          fontFamily: 'var(--font-mono, "JetBrains Mono", Consolas, Menlo, monospace)',
          color: '#f8fafc',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Math block renderer
const MathBlock: React.FC<{ formula: string }> = ({ formula }) => (
  <div
    style={{
      margin: '14px 0',
      padding: '14px 18px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-hover)',
      border: '1px solid var(--color-border)',
      textAlign: 'center',
      overflowX: 'auto',
      fontFamily: '"KaTeX_Main", "Cambria Math", Georgia, serif',
      fontSize: '16px',
      color: 'var(--color-text-primary)',
      letterSpacing: '0.02em',
    }}
  >
    {formula}
  </div>
);

// Format inline elements: math, bold, italic, code
function renderInlineText(text: string): React.ReactNode[] {
  // Regex to split by inline code `...`, inline math $...$, bold **...**, italic *...*
  const regex = /(`[^`]+`|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.88em',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'var(--color-surface-hover)',
            color: 'var(--color-orange)',
            border: '1px solid var(--color-border)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      return (
        <span
          key={index}
          style={{
            fontFamily: '"KaTeX_Main", "Cambria Math", Georgia, serif',
            fontStyle: 'italic',
            padding: '1px 4px',
            borderRadius: '3px',
            background: 'var(--color-surface-hover)',
            color: 'var(--color-text-primary)',
            display: 'inline-block',
          }}
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={index} style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  style,
}) => {
  if (!content) return null;

  // Split into major chunks: code blocks, math blocks, and normal text
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block: ```lang
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      blocks.push(
        <CodeBlock key={`code-${i}`} language={language} code={codeLines.join('\n')} />
      );
      continue;
    }

    // Display Math Block: $$
    if (line.trim().startsWith('$$')) {
      const mathLines: string[] = [];
      const singleLineMath = line.trim().slice(2);
      if (singleLineMath.endsWith('$$') && singleLineMath.length > 2) {
        // Single line $$formula$$
        blocks.push(
          <MathBlock key={`math-${i}`} formula={singleLineMath.slice(0, -2).trim()} />
        );
        i++;
        continue;
      }
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const lastLine = lines[i].replace(/\$\$\s*$/, '');
        if (lastLine.trim()) mathLines.push(lastLine);
        i++;
      }
      blocks.push(
        <MathBlock key={`math-${i}`} formula={mathLines.join('\n').trim()} />
      );
      continue;
    }

    // Headings: #, ##, ###
    if (line.startsWith('# ')) {
      blocks.push(
        <h1
          key={`h1-${i}`}
          style={{
            fontSize: 'var(--text-h1, 32px)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            margin: '24px 0 12px 0',
            color: 'var(--color-text-primary)',
          }}
        >
          {renderInlineText(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2-${i}`}
          style={{
            fontSize: 'var(--text-h3, 22px)',
            fontWeight: 700,
            letterSpacing: '-0.018em',
            lineHeight: 1.25,
            margin: '20px 0 10px 0',
            color: 'var(--color-text-primary)',
          }}
        >
          {renderInlineText(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: 'var(--text-h4, 18px)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
            margin: '16px 0 8px 0',
            color: 'var(--color-text-primary)',
          }}
        >
          {renderInlineText(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push(
        <h4
          key={`h4-${i}`}
          style={{
            fontSize: 'var(--text-body-lg, 16px)',
            fontWeight: 600,
            letterSpacing: '-0.005em',
            lineHeight: 1.35,
            margin: '14px 0 6px 0',
            color: 'var(--color-text-primary)',
          }}
        >
          {renderInlineText(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote: >
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            margin: '14px 0',
            padding: '10px 16px',
            borderLeft: '3px solid var(--color-orange)',
            background: 'var(--color-surface-hover)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          {quoteLines.map((ql, qidx) => (
            <p key={qidx} style={{ margin: qidx > 0 ? '6px 0 0 0' : 0 }}>
              {renderInlineText(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Bullet List: - or *
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems: string[] = [line.trim().slice(2)];
      i++;
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul
          key={`ul-${i}`}
          style={{
            margin: '10px 0 14px 0',
            paddingLeft: '22px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.65,
          }}
        >
          {listItems.map((item, lidx) => (
            <li key={lidx} style={{ margin: '6px 0', lineHeight: 1.65 }}>
              {renderInlineText(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered List: 1. 2.
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems: string[] = [line.trim().replace(/^\d+\.\s/, '')];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push(
        <ol
          key={`ol-${i}`}
          style={{
            margin: '10px 0 14px 0',
            paddingLeft: '22px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.65,
          }}
        >
          {listItems.map((item, lidx) => (
            <li key={lidx} style={{ margin: '6px 0', lineHeight: 1.65 }}>
              {renderInlineText(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal Rule: ---
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push(
        <hr
          key={`hr-${i}`}
          style={{
            border: 'none',
            borderTop: '1px solid var(--color-border)',
            margin: '18px 0',
          }}
        />
      );
      i++;
      continue;
    }

    // Normal Paragraph
    if (line.trim()) {
      const paragraphLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('$$') &&
        !lines[i].startsWith('#') &&
        !lines[i].startsWith('> ') &&
        !lines[i].trim().startsWith('- ') &&
        !lines[i].trim().startsWith('* ') &&
        !/^\d+\.\s/.test(lines[i].trim()) &&
        lines[i].trim() !== '---' &&
        lines[i].trim() !== '***'
      ) {
        paragraphLines.push(lines[i]);
        i++;
      }
      blocks.push(
        <p
          key={`p-${i}`}
          style={{
            margin: '10px 0',
            lineHeight: 1.7,
            fontSize: 'var(--text-body-sm, 14.5px)',
            color: 'var(--color-text-primary)',
          }}
        >
          {renderInlineText(paragraphLines.join(' '))}
        </p>
      );
      continue;
    }

    i++;
  }

  return (
    <div
      className={className}
      style={{
        fontSize: 'var(--text-body-sm, 14.5px)',
        color: 'var(--color-text-primary)',
        ...style,
      }}
    >
      {blocks}
    </div>
  );
};
