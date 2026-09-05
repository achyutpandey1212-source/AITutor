import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';
import type { EquationLine } from '@ai-tutor/shared';
import { UniversalPrimitiveRenderer } from '../../primitives/UniversalPrimitiveRenderer';

export const FormulaDerivationTemplate: UniversalTemplateRenderer = {
  id: 'template.formula.derivation',
  name: 'Formula Derivation',
  description: 'Renders step-by-step mathematical derivations and equation transformations.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const payload = beat.visual?.payload || {};
    const title = payload.title || 'Mathematical Derivation';
    const subtitle = payload.subtitle;

    let equations: EquationLine[] = payload.equations || [];

    // Fallback: extract formula blocks from semantic content if payload equations were omitted
    if (equations.length === 0 && beat.content?.blocks) {
      const formulaBlocks = beat.content.blocks.filter((b) => b.type === 'formula');
      if (formulaBlocks.length > 0) {
        equations = formulaBlocks.map((fb: any, idx) => ({
          id: `eq-${idx + 1}`,
          latex: fb.latex,
          explanation: fb.explanation?.[0]?.text,
          isActiveStep: idx === formulaBlocks.length - 1,
        }));
      }
    }

    const headerHeight = 60;
    const canvasHeight = height - headerHeight;

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
        className="template-formula-derivation"
      >
        {/* Header */}
        <div style={{ height: `${headerHeight}px`, flexShrink: 0, marginBottom: '10px' }}>
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
              DERIVATION · {equations.length} STEPS
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

        {/* Derivation Surface */}
        <div style={{ flex: 1, width: '100%', height: `${canvasHeight}px` }}>
          <UniversalPrimitiveRenderer
            width={width - 72}
            height={canvasHeight - 48}
            equations={equations}
            annotations={payload.annotations}
            animation={beat.animation}
          />
        </div>
      </div>
    );
  },
};
