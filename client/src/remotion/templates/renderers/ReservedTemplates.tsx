import type { UniversalTemplateRenderer, UniversalTemplateContext } from '../types';

export const HistoricalTimelineTemplate: UniversalTemplateRenderer = {
  id: 'template.timeline.historical',
  name: 'Historical Timeline (Reserved)',
  description: 'Reserved template boundary for chronological and historical timeline visualizations.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const timeline = beat.visual?.payload?.timeline || [];
    const title = beat.visual?.payload?.title || 'Historical Timeline';

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          padding: '32px 48px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
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
            TIMELINE
          </span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            {title}
          </h2>
        </div>

        {/* Lightweight Chronological Event Stack */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            borderLeft: '2px solid rgba(56, 189, 248, 0.35)',
            paddingLeft: '20px',
            marginLeft: '12px',
          }}
        >
          {timeline.length > 0 ? (
            timeline.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '20px', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-26px',
                    top: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.isMilestone ? '#38bdf8' : '#64748b',
                    border: '2px solid #0b0f17',
                  }}
                />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                  {item.timestamp}
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.5 }}>
                    {item.description}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', paddingTop: '12px' }}>
              {beat.displayText}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const GroundedMediaTemplate: UniversalTemplateRenderer = {
  id: 'template.media.grounded',
  name: 'Grounded Media (Reserved)',
  description: 'Reserved template boundary for grounded textbook imagery and authentic media assets.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const media = beat.visual?.payload?.media;
    const title = beat.visual?.payload?.title || 'Visual Evidence';

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          padding: '24px 36px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
      >
        <div style={{ marginBottom: '14px' }}>
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
            MEDIA ARTIFACT
          </span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            {title}
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.4)',
            borderRadius: '6px',
            padding: '20px',
          }}
        >
          {media?.url ? (
            <img
              src={media.url}
              alt={media.caption || title}
              style={{
                maxWidth: '100%',
                maxHeight: '80%',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12.5px', lineHeight: 1.6 }}>
              <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '6px' }}>
                Asset Pending Acquisition
              </div>
              <div>{media?.caption || beat.displayText}</div>
            </div>
          )}
          {media?.caption && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
              {media.caption} {media.sourceCredit ? `· Source: ${media.sourceCredit}` : ''}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const InteractiveSimulationTemplate: UniversalTemplateRenderer = {
  id: 'template.simulation.interactive',
  name: 'Interactive Simulation (Reserved)',
  description: 'Reserved template boundary for interactive and generative simulations.',

  render: ({ beat, width, height }: UniversalTemplateContext) => {
    const title = beat.visual?.payload?.title || 'Interactive Simulation';

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${width}px`,
          maxHeight: `${height}px`,
          padding: '24px 36px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          background: 'transparent',
        }}
      >
        <div style={{ marginBottom: '14px' }}>
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
            SIMULATION
          </span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
            {title}
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.4)',
            borderRadius: '6px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            SIMULATION ENGINE BOUNDARY
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '13px', maxWidth: '480px', lineHeight: 1.6 }}>
            {beat.displayText}
          </div>
        </div>
      </div>
    );
  },
};
