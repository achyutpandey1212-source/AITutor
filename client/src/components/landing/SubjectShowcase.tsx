import React, { useState } from 'react';
import { CinematicVideo } from '../ui/CinematicVideo';

export const SubjectShowcase: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<'physics' | 'biology' | 'chemistry' | 'math' | 'astronomy' | 'code'>('physics');
  const [viewMode, setViewMode] = useState<'cinematic' | 'diagram'>('cinematic');

  const subjects = [
    { id: 'physics',   name: 'Physics',     symbol: '⚡', color: 'var(--color-sky)', hasVideo: true, videoSrc: '/videos/physics.mp4', poster: '/videos/posters/physics.jpg' },
    { id: 'biology',   name: 'Biology',     symbol: '🌱', color: 'var(--color-mint)', hasVideo: true, videoSrc: '/videos/biology.mp4', poster: '/videos/posters/biology.jpg' },
    { id: 'chemistry', name: 'Chemistry',   symbol: '⚗️', color: 'var(--color-orange)', hasVideo: false },
    { id: 'math',      name: 'Mathematics', symbol: '∑',  color: '#D99527', hasVideo: false },
    { id: 'astronomy', name: 'Astronomy',   symbol: '🪐', color: 'var(--color-sky)', hasVideo: true, videoSrc: '/videos/astronomy.mp4', poster: '/videos/posters/astronomy.jpg' },
    { id: 'code',      name: 'Programming', symbol: '</>', color: 'var(--color-coral)', hasVideo: false },
  ] as const;

  const currentSub = subjects.find((s) => s.id === activeSubject);

  return (
    <section
      id="subjects"
      style={{
        padding: 'var(--space-20) var(--space-6)',
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
      }}
    >
      {/* Editorial Header */}
      <div style={{ maxWidth: '640px', marginBottom: 'var(--space-10)' }}>
        <p
          style={{
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-sky)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Subject-Native Visuals
        </p>
        <h2
          style={{
            fontSize: 'clamp(32px, 4.5vw, var(--text-h1))',
            fontWeight: 800,
            letterSpacing: 'var(--text-h1-ls)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.15,
            marginBottom: 'var(--space-4)',
          }}
        >
          Every subject has its own visual language.
        </h2>
        <p
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--text-body-lg-lh)',
          }}
        >
          Math requires tangent slopes. Physics requires force vectors. Biology requires molecular anatomy. Lumo speaks the visual dialect of every discipline.
        </p>
      </div>

      {/* Horizontal Subject Tab Selector */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          scrollbarWidth: 'none',
        }}
      >
        {subjects.map((sub) => {
          const isSelected = activeSubject === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                background: isSelected ? 'var(--color-surface)' : 'var(--color-surface-soft)',
                border: `1px solid ${isSelected ? 'var(--color-orange)' : 'var(--color-border-subtle)'}`,
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--motion-fast) var(--ease-standard)',
              }}
            >
              <span>{sub.symbol}</span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Stage Canvas Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-cinematic)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          minHeight: '380px',
        }}
        className="lumo-subject-stage-grid"
      >
        {/* Left: Concept Explanation */}
        <div
          style={{
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRight: '1px solid var(--color-border-subtle)',
          }}
        >
          {activeSubject === 'physics' && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sky)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Classical Mechanics
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px', color: 'var(--color-text-primary)' }}>
                Conservation of Momentum
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                When two bodies collide in an isolated system, the total vector momentum remains invariant. Lumo decomposes the vector velocities into orthogonal components.
              </p>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-sky-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--color-sky)', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                p_total = m₁v₁ + m₂v₂ = constant
              </div>
            </div>
          )}

          {activeSubject === 'biology' && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-mint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cellular Physiology
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px', color: 'var(--color-text-primary)' }}>
                Fluid Mosaic Membrane
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                Hydrophilic phosphate heads face aqueous compartments while hydrophobic lipid tails face inward, establishing a semi-permeable barrier for protein ion channels.
              </p>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-mint-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--color-mint)', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                ΔG = RT ln(C₂/C₁) + zFΔV
              </div>
            </div>
          )}

          {activeSubject === 'chemistry' && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Molecular Geometry
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px', color: 'var(--color-text-primary)' }}>
                Water Molecular Dipole
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                The two lone electron pairs on Oxygen push the O-H bonds into an asymmetric 104.5° bent structure, generating the electric dipole that enables liquid water.
              </p>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-orange-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--color-orange)', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                μ = q · d = 1.85 Debye (Bond Angle: 104.5°)
              </div>
            </div>
          )}

          {activeSubject === 'math' && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D99527', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Calculus & Analysis
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px', color: 'var(--color-text-primary)' }}>
                Derivative as Tangent Slope
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                As the secant interval Δx shrinks to zero, the chord line rotates continuously into the instantaneous tangent slope, giving the rate of change.
              </p>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-yellow-soft)', borderRadius: 'var(--radius-sm)', color: '#B8851A', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                f'(x) = lim[Δx→0] (f(x+Δx) - f(x)) / Δx
              </div>
            </div>
          )}

          {activeSubject === 'astronomy' && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sky)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Astrophysics
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px', color: 'var(--color-text-primary)' }}>
                Kepler's Law of Equal Areas
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                A line connecting a planet to the Sun sweeps out equal areas in equal time intervals: planets accelerate at perihelion and decelerate at aphelion.
              </p>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-sky-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--color-sky)', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                dA/dt = L / (2m) = constant
              </div>
            </div>
          )}

          {activeSubject === 'code' && (
            <div className="animate-fade-in">
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-coral)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Computer Science
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 12px', color: 'var(--color-text-primary)' }}>
                Recursive Call Frames
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
                Each recursive invocation pushes a localized stack frame containing parameters and return addresses, unwinding from the base case upwards.
              </p>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'var(--color-orange-soft)', borderRadius: 'var(--radius-sm)', color: 'var(--color-orange)', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                fib(n) = fib(n-1) + fib(n-2)
              </div>
            </div>
          )}
        </div>

        {/* Right: Subject Interactive Vector Graphic OR Cinematic Render */}
        <div
          style={{
            background: 'var(--color-surface-soft)',
            padding: currentSub?.hasVideo && viewMode === 'cinematic' ? '0' : 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Toggle if video is available */}
          {currentSub?.hasVideo && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 2,
                display: 'inline-flex',
                background: 'rgba(21, 24, 29, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                onClick={() => setViewMode('cinematic')}
                style={{
                  border: 'none',
                  background: viewMode === 'cinematic' ? 'var(--color-orange)' : 'transparent',
                  color: viewMode === 'cinematic' ? '#FFFFFF' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFFFFF' }} />
                Cinematic
              </button>
              <button
                onClick={() => setViewMode('diagram')}
                style={{
                  border: 'none',
                  background: viewMode === 'diagram' ? 'var(--color-orange)' : 'transparent',
                  color: viewMode === 'diagram' ? '#FFFFFF' : 'var(--color-text-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast) var(--ease-standard)',
                }}
              >
                Diagram
              </button>
            </div>
          )}

          {/* Render Cinematic Video when active and supported */}
          {currentSub?.hasVideo && viewMode === 'cinematic' ? (
            <div style={{ width: '100%', height: '100%', position: 'relative', minHeight: '340px' }}>
              <CinematicVideo
                src={currentSub.videoSrc}
                poster={currentSub.poster}
                aspectRatio="16 / 10"
                style={{ width: '100%', height: '100%', minHeight: '340px' }}
                objectFit="cover"
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '16px',
                  right: '16px',
                  padding: '6px 14px',
                  background: 'rgba(13, 15, 18, 0.75)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '12px', color: '#F7F5EF', fontWeight: 600 }}>
                  {activeSubject === 'physics' && 'Simulating Friction & Rotational Dynamics'}
                  {activeSubject === 'biology' && 'Simulating Phospholipid Bilayer & Molecular Motion'}
                  {activeSubject === 'astronomy' && 'Simulating Planetary Atmospheric Flow & Orbital Curvature'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-orange)', fontWeight: 700 }}>
                  Live Visual
                </span>
              </div>
            </div>
          ) : (
            <>
          {activeSubject === 'physics' && (
            <svg viewBox="0 0 360 200" style={{ width: '100%', height: 'auto', maxHeight: '220px' }}>
              {/* Collision Track */}
              <line x1="20" y1="150" x2="340" y2="150" stroke="var(--color-border)" strokeWidth="2" />
              {/* Cart 1 */}
              <rect x="70" y="105" width="60" height="40" rx="4" fill="var(--color-surface)" stroke="var(--color-sky)" strokeWidth="2" />
              <text x="100" y="130" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-text-primary)">m₁=2kg</text>
              <line x1="130" y1="125" x2="180" y2="125" stroke="var(--color-sky)" strokeWidth="2.5" markerEnd="url(#arrow-sky)" />
              <text x="145" y="115" fontSize="11" fontWeight="700" fill="var(--color-sky)">v₁ = +4 m/s</text>
              {/* Cart 2 */}
              <rect x="230" y="105" width="60" height="40" rx="4" fill="var(--color-surface)" stroke="var(--color-mint)" strokeWidth="2" />
              <text x="260" y="130" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-text-primary)">m₂=3kg</text>
              <line x1="230" y1="125" x2="195" y2="125" stroke="var(--color-mint)" strokeWidth="2.5" markerEnd="url(#arrow-mint)" />
              <text x="200" y="115" fontSize="11" fontWeight="700" fill="var(--color-mint)">v₂ = -1 m/s</text>
            </svg>
          )}

          {activeSubject === 'biology' && (
            <svg viewBox="0 0 360 200" style={{ width: '100%', height: 'auto', maxHeight: '220px' }}>
              {/* Bilayer Top Heads */}
              {[40, 75, 110, 250, 285, 320].map((x) => (
                <g key={x}>
                  <circle cx={x} cy="70" r="10" fill="var(--color-mint-soft)" stroke="var(--color-mint)" strokeWidth="2" />
                  <line x1={x - 3} y1="80" x2={x - 3} y2="105" stroke="var(--color-mint)" strokeWidth="1.5" />
                  <line x1={x + 3} y1="80" x2={x + 3} y2="105" stroke="var(--color-mint)" strokeWidth="1.5" />
                </g>
              ))}
              {/* Bilayer Bottom Heads */}
              {[40, 75, 110, 250, 285, 320].map((x) => (
                <g key={`b-${x}`}>
                  <circle cx={x} cy="140" r="10" fill="var(--color-mint-soft)" stroke="var(--color-mint)" strokeWidth="2" />
                  <line x1={x - 3} y1="130" x2={x - 3} y2="105" stroke="var(--color-mint)" strokeWidth="1.5" />
                  <line x1={x + 3} y1="130" x2={x + 3} y2="105" stroke="var(--color-mint)" strokeWidth="1.5" />
                </g>
              ))}
              {/* Transmembrane Protein Channel */}
              <rect x="155" y="55" width="50" height="100" rx="8" fill="var(--color-orange-soft)" stroke="var(--color-orange)" strokeWidth="2" />
              <text x="180" y="108" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--color-orange)">Ion Channel</text>
              {/* Ion diffusing through */}
              <circle cx="180" cy="35" r="6" fill="var(--color-sky)" />
              <text x="180" y="38" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">Na⁺</text>
              <line x1="180" y1="43" x2="180" y2="165" stroke="var(--color-sky)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          )}

          {activeSubject === 'chemistry' && (
            <svg viewBox="0 0 360 200" style={{ width: '100%', height: 'auto', maxHeight: '220px' }}>
              {/* Central Oxygen Atom */}
              <circle cx="180" cy="85" r="32" fill="var(--color-orange-soft)" stroke="var(--color-orange)" strokeWidth="3" />
              <text x="180" y="93" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--color-orange)">O</text>
              <text x="180" y="50" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-error)">δ⁻ (Partial Negative)</text>
              {/* Left Hydrogen Atom */}
              <line x1="158" y1="108" x2="110" y2="148" stroke="var(--color-text-secondary)" strokeWidth="4" />
              <circle cx="100" cy="155" r="18" fill="var(--color-surface)" stroke="var(--color-sky)" strokeWidth="2.5" />
              <text x="100" y="160" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-sky)">H</text>
              <text x="75" y="160" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-sky)">δ⁺</text>
              {/* Right Hydrogen Atom */}
              <line x1="202" y1="108" x2="250" y2="148" stroke="var(--color-text-secondary)" strokeWidth="4" />
              <circle cx="260" cy="155" r="18" fill="var(--color-surface)" stroke="var(--color-sky)" strokeWidth="2.5" />
              <text x="260" y="160" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--color-sky)">H</text>
              <text x="285" y="160" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-sky)">δ⁺</text>
              {/* Bond Angle Arc */}
              <path d="M 135,130 A 55 55 0 0 1 225,130" fill="none" stroke="var(--color-orange)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="180" y="145" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-orange)">104.5°</text>
            </svg>
          )}

          {activeSubject === 'math' && (
            <svg viewBox="0 0 360 200" style={{ width: '100%', height: 'auto', maxHeight: '220px' }}>
              {/* Coordinate Axes */}
              <line x1="40" y1="160" x2="320" y2="160" stroke="var(--color-border)" strokeWidth="1.5" />
              <line x1="70" y1="20" x2="70" y2="180" stroke="var(--color-border)" strokeWidth="1.5" />
              {/* Parabola Curve y = x^2 */}
              <path d="M 70,160 Q 160,160 270,30" fill="none" stroke="var(--color-text-primary)" strokeWidth="2.5" />
              <text x="280" y="40" fontSize="12" fontWeight="700" fill="var(--color-text-secondary)">f(x) = x²</text>
              {/* Point of Tangency */}
              <circle cx="180" cy="115" r="5" fill="var(--color-orange)" />
              {/* Tangent Line */}
              <line x1="120" y1="160" x2="240" y2="70" stroke="var(--color-orange)" strokeWidth="2" strokeDasharray="4 4" />
              <text x="220" y="65" fontSize="11" fontWeight="800" fill="var(--color-orange)">Tangent Slope f'(x) = 2x</text>
            </svg>
          )}

          {activeSubject === 'astronomy' && (
            <svg viewBox="0 0 360 200" style={{ width: '100%', height: 'auto', maxHeight: '220px' }}>
              {/* Elliptical Orbit */}
              <ellipse cx="180" cy="100" rx="140" ry="70" fill="none" stroke="var(--color-border)" strokeWidth="1.5" />
              {/* Sun at Primary Focus */}
              <circle cx="120" cy="100" r="16" fill="var(--color-yellow)" />
              <text x="120" y="104" textAnchor="middle" fontSize="10" fontWeight="800" fill="#713f12">Sun</text>
              {/* Swept Area Wedge 1 (Fast at Perihelion) */}
              <path d="M 120,100 L 40,100 A 140 70 0 0 1 55,70 Z" fill="var(--color-sky-soft)" stroke="var(--color-sky)" strokeWidth="1" />
              {/* Swept Area Wedge 2 (Slow at Aphelion) */}
              <path d="M 120,100 L 320,100 A 140 70 0 0 1 315,85 Z" fill="var(--color-sky-soft)" stroke="var(--color-sky)" strokeWidth="1" />
              <text x="80" y="85" fontSize="10" fontWeight="700" fill="var(--color-sky)">Area A₁</text>
              <text x="280" y="90" fontSize="10" fontWeight="700" fill="var(--color-sky)">Area A₂</text>
              {/* Planet */}
              <circle cx="40" cy="100" r="6" fill="var(--color-sky)" />
              <text x="180" y="185" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-text-muted)">
                Equal Areas in Equal Times (A₁ = A₂)
              </text>
            </svg>
          )}

          {activeSubject === 'code' && (
            <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px 12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-orange)', fontSize: '12px', fontFamily: 'monospace' }}>
                <span style={{ color: 'var(--color-orange)', fontWeight: 700 }}>[Frame 3]</span> fib(1) → returns 1
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '12px', fontFamily: 'monospace' }}>
                <span style={{ color: 'var(--color-sky)', fontWeight: 700 }}>[Frame 2]</span> fib(2) = fib(1) + fib(0)
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '12px', fontFamily: 'monospace' }}>
                <span style={{ color: 'var(--color-mint)', fontWeight: 700 }}>[Frame 1]</span> fib(3) = fib(2) + fib(1)
              </div>
              <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Call Stack Unwinding · Call Depth: 3
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .lumo-subject-stage-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
