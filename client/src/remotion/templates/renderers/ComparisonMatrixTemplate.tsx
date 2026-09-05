import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';

export const ComparisonMatrixTemplate: UniversalTemplateRenderer = {
  id: 'template.comparison.matrix',
  name: 'Comparison Matrix',
  description: 'Renders structured comparative analyses and matrices across concepts or entities.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title || 'Comparative Analysis';
    const subtitle = payload.subtitle;

    const comparison = payload.comparison;
    const columns = comparison?.columns || [
      { id: 'left', header: 'Option A' },
      { id: 'right', header: 'Option B' },
    ];
    const rows = comparison?.rows || [];

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
          padding: '28px 40px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
        className="template-comparison-matrix"
      >
        {/* Header */}
        <div style={{ marginBottom: '18px' }}>
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
              COMPARISON
            </span>
          </div>
          <h2
            style={{
              margin: '6px 0 0 0',
              fontSize: '20px',
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Matrix Table */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '6px',
            border: '1px solid rgba(51, 65, 85, 0.45)',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
                <th
                  style={{
                    padding: '12px 18px',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                    width: '28%',
                  }}
                >
                  Feature / Aspect
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    style={{
                      padding: '12px 18px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                      borderLeft: '1px solid rgba(51, 65, 85, 0.3)',
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    backgroundColor:
                      rIdx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.25)',
                    borderBottom: '1px solid rgba(51, 65, 85, 0.25)',
                  }}
                >
                  <td
                    style={{
                      padding: '12px 18px',
                      color: '#f1f5f9',
                      fontSize: '12.5px',
                      fontWeight: 600,
                    }}
                  >
                    {row.label}
                  </td>
                  {columns.map((col) => {
                    const val = row.values[col.id] ?? '—';
                    return (
                      <td
                        key={col.id}
                        style={{
                          padding: '12px 18px',
                          color: '#cbd5e1',
                          fontSize: '12.5px',
                          lineHeight: 1.5,
                          borderLeft: '1px solid rgba(51, 65, 85, 0.25)',
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
