import React, { useState, useEffect } from 'react';
import { LogoWordmark } from '../ui/Logo';
import { Button } from '../ui/Button';
import { useTheme } from '../../theme/ThemeContext';

// ---------------------------------------------------------------
// Lumo Navbar
// Responsive: desktop (horizontal) + mobile (drawer).
// Clean, minimal — logo on left, nav center, actions right.
// ---------------------------------------------------------------

interface NavbarProps {
  isAuthenticated: boolean;
  currentPath: string;
  userEmail?: string | null;
  onNavigate: (path: string) => void;
  onSignOut: () => void;
}

// ---- Sun / Moon icons ----
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ---------------------------------------------------------------
// NavLink helper
// ---------------------------------------------------------------
interface NavLinkProps {
  href: string;
  label: string;
  current: string;
  onClick: (path: string) => void;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, current, onClick, mobile }) => {
  const isActive = current === href || (href !== '/' && current.startsWith(href));
  return (
    <button
      onClick={() => onClick(href)}
      style={{
        background: 'none',
        border: 'none',
        padding: mobile ? '12px 0' : '6px 0',
        fontSize: mobile ? 'var(--text-h3)' : 'var(--text-body-sm)',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? 'var(--color-text-primary)' : 'var(--color-nav-text)',
        cursor: 'pointer',
        letterSpacing: '-0.01em',
        transition: 'color var(--motion-fast) var(--ease-standard)',
        display: 'block',
        width: mobile ? '100%' : 'auto',
        textAlign: mobile ? 'left' : 'center',
        borderBottom: isActive && !mobile ? '2px solid var(--color-orange)' : '2px solid transparent',
        lineHeight: 1.2,
      }}
    >
      {label}
    </button>
  );
};

// ---------------------------------------------------------------
// Main Navbar
// ---------------------------------------------------------------
export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  currentPath,
  userEmail,
  onNavigate,
  onSignOut,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const landingLinks = [
    { href: '/#learn',       label: 'Learn' },
    { href: '/#how',         label: 'How it works' },
    { href: '/#subjects',    label: 'Subjects' },
  ];

  const appLinks = [
    { href: '/dashboard',  label: 'Home' },
    { href: '/tutor',      label: 'Learn' },
    { href: '/practice',   label: 'Practice' },
    { href: '/documents',  label: 'Documents' },
  ];

  const links = isAuthenticated ? appLinks : landingLinks;

  // ---- Styles ----
  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    background: 'var(--color-nav-bg)',
    borderBottom: `1px solid ${scrolled ? 'var(--color-nav-border)' : 'transparent'}`,
    boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
    transition: `
      border-color var(--motion-fast) var(--ease-standard),
      box-shadow var(--motion-fast) var(--ease-standard)
    `,
    backdropFilter: 'none', // intentionally no blur — clean, confident
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 'var(--content-max-width)',
    marginInline: 'auto',
    paddingInline: 'var(--space-6)',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-6)',
  };

  const centerLinksStyle: React.CSSProperties = {
    display: 'none',
    alignItems: 'center',
    gap: 'var(--space-6)',
  };

  const rightActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flexShrink: 0,
  };

  const themeToggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: `
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard)
    `,
  };

  const mobileMenuBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
  };

  return (
    <>
      <nav style={navStyle} role="navigation" aria-label="Main navigation">
        <div style={innerStyle}>
          {/* Logo */}
          <button
            onClick={() => onNavigate(isAuthenticated ? '/dashboard' : '/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            aria-label="Go to Lumo home"
          >
            <LogoWordmark height={24} />
          </button>

          {/* Center links — hidden on mobile via inline style, shown via class override */}
          <div
            style={centerLinksStyle}
            className="lumo-nav-center"
          >
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                current={currentPath}
                onClick={(href) => {
                  if (href.startsWith('/#')) {
                    // Handle anchor-scroll on landing page
                    onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById(href.slice(2));
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  } else {
                    onNavigate(href);
                  }
                }}
              />
            ))}
          </div>

          {/* Right actions */}
          <div style={rightActionsStyle}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={themeToggleStyle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Desktop auth actions — hidden on mobile */}
            <div className="lumo-nav-auth">
              {isAuthenticated ? (
                <>
                  <span
                    className="lumo-nav-email"
                    style={{
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-muted)',
                      maxWidth: '160px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userEmail}
                  </span>
                  <Button variant="ghost" size="sm" onClick={onSignOut}>
                    Sign out
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('/tutor')}>
                    Start Learning
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('/signin')}>
                    Sign in
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('/signup')}>
                    Start Learning
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              style={mobileMenuBtnStyle}
              className="lumo-mobile-menu-btn"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
            background: 'var(--color-overlay)',
            animation: 'lumo-fade-in var(--motion-standard) var(--ease-enter) both',
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          width: 'min(320px, 90vw)',
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform var(--motion-moderate) var(--ease-standard)`,
        }}
        aria-hidden={!mobileOpen}
        className="lumo-mobile-drawer"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <LogoWordmark height={24} />
          <button onClick={() => setMobileOpen(false)} style={mobileMenuBtnStyle} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        {links.map((l) => (
          <NavLink
            key={l.href}
            href={l.href}
            label={l.label}
            current={currentPath}
            mobile
            onClick={(href) => {
              setMobileOpen(false);
              onNavigate(href.startsWith('/#') ? '/' : href);
            }}
          />
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {isAuthenticated ? (
            <>
              <Button variant="primary" size="md" onClick={() => { setMobileOpen(false); onNavigate('/tutor'); }} style={{ width: '100%' }}>
                Start Learning
              </Button>
              <Button variant="ghost" size="md" onClick={() => { setMobileOpen(false); onSignOut(); }} style={{ width: '100%' }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="md" onClick={() => { setMobileOpen(false); onNavigate('/signup'); }} style={{ width: '100%' }}>
                Start Learning
              </Button>
              <Button variant="ghost" size="md" onClick={() => { setMobileOpen(false); onNavigate('/signin'); }} style={{ width: '100%' }}>
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navbar responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .lumo-nav-center {
            display: flex !important;
          }
          .lumo-nav-auth {
            display: flex !important;
            align-items: center;
            gap: 8px;
          }
          .lumo-mobile-menu-btn {
            display: none !important;
          }
          .lumo-mobile-drawer {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .lumo-nav-auth {
            display: none !important;
          }
          .lumo-nav-email {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
