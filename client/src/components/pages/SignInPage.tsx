import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LogoWordmark } from '../ui/Logo';
import { CinematicVideo } from '../ui/CinematicVideo';
import { useTheme } from '../../theme/ThemeContext';

// ---------------------------------------------------------------
// SignInPage — Ultra-premium Socratic Auth Experience
// Preserves all existing routing & Firebase auth contracts.
// Adds Google OAuth and cinematic brand storytelling.
// ---------------------------------------------------------------

export interface SignInPageProps {
  onNavigate: (path: string) => void;
  onSuccess: () => void;
}

// ---- SVG Icons for High Craft UI ----
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onSuccess }) => {
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSubmitting = emailLoading || googleLoading;

  // Friendly error message parser
  const parseAuthError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = (err as { code: string }).code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        return 'Invalid email or password. Please verify your credentials.';
      }
      if (code === 'auth/invalid-email') {
        return 'Please enter a valid email address.';
      }
      if (code === 'auth/user-disabled') {
        return 'This account has been disabled. Please contact support.';
      }
      if (code === 'auth/network-request-failed') {
        return 'Network connection issue. Please check your internet connection.';
      }
      if (code === 'auth/too-many-requests') {
        return 'Too many failed attempts. Please wait a moment before trying again.';
      }
    }
    return err instanceof Error ? err.message : 'Sign in failed. Please try again.';
  };

  // 1. Email & Password Sign In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onSuccess();
      onNavigate('/dashboard');
    } catch (err: unknown) {
      setError(parseAuthError(err));
    } finally {
      setEmailLoading(false);
    }
  };

  // 2. Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onNavigate('/dashboard');
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        ((err as { code: string }).code === 'auth/popup-closed-by-user' ||
         (err as { code: string }).code === 'auth/cancelled-popup-request')
      ) {
        // User closed popup deliberately — do not show error
        return;
      }
      setError(parseAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ============================================================ */}
      {/* LEFT COLUMN: Premium Auth Form Container                      */}
      {/* ============================================================ */}
      <div
        style={{
          flex: '1 1 540px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--space-6) var(--space-8) var(--space-8)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top bar: Brand + Theme Toggle */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '460px',
            margin: '0 auto',
            paddingBottom: 'var(--space-4)',
          }}
        >
          <button
            onClick={() => onNavigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'opacity var(--motion-fast) var(--ease-standard)',
            }}
            aria-label="Return to Lumo home"
          >
            <LogoWordmark height={26} />
          </button>

          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--motion-fast) var(--ease-standard)',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </header>

        {/* Central Card / Form */}
        <main
          style={{
            width: '100%',
            maxWidth: '440px',
            margin: 'var(--space-6) auto',
            animation: 'lumo-fade-up var(--motion-moderate) var(--ease-enter) both',
          }}
        >
          {/* Headline & Subtitle */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-orange-soft)',
                color: 'var(--color-orange)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-3)',
              }}
            >
              <span>✦</span> Socratic Intelligence
            </div>
            <h1
              style={{
                fontSize: 'clamp(26px, 3.2vw, 32px)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--color-text-primary)',
                margin: '0 0 8px 0',
                lineHeight: 1.15,
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Sign in to resume your active learning session.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-error-soft)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-error)',
                lineHeight: 1.45,
                animation: 'lumo-fade-in var(--motion-fast) var(--ease-enter)',
              }}
            >
              <AlertCircleIcon />
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          {/* Google 1-Click OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--motion-fast) var(--ease-standard)',
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.borderColor = 'var(--color-border-focus)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {googleLoading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid var(--color-border)',
                  borderTopColor: 'var(--color-orange)',
                  borderRadius: '50%',
                  animation: 'lumo-spin 0.8s linear infinite',
                }}
              />
            ) : (
              <GoogleIcon />
            )}
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: 'var(--space-6) 0',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span
              style={{
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              disabled={isSubmitting}
              autoComplete="email"
              leadingElement={<MailIcon />}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                disabled={isSubmitting}
                autoComplete="current-password"
                leadingElement={<LockIcon />}
                trailingElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={emailLoading}
              disabled={isSubmitting}
              style={{
                width: '100%',
                marginTop: 'var(--space-2)',
                boxShadow: 'var(--shadow-glow-orange)',
                fontWeight: 600,
              }}
            >
              Sign In to Lumo
            </Button>
          </form>

          {/* Switch to SignUp */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              background: 'var(--color-surface-soft)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            Don't have a Lumo account?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-orange)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0 2px',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                textDecoration: 'none',
              }}
            >
              Create an account
            </button>
          </div>
        </main>

        {/* Footer info & back link */}
        <footer
          style={{
            width: '100%',
            maxWidth: '440px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: 'var(--text-caption)',
            color: 'var(--color-text-muted)',
          }}
        >
          <button
            onClick={() => onNavigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color var(--motion-fast) var(--ease-standard)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            ← Return to home
          </button>
          <span>🔒 Secured with Firebase</span>
        </footer>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: Cinematic Socratic Showcase                     */}
      {/* Visible on desktop (width >= 960px)                          */}
      {/* ============================================================ */}
      <div
        className="lumo-auth-showcase"
        style={{
          flex: '1 1 50%',
          position: 'relative',
          background: '#0D0F12',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(32px, 5vw, 64px)',
        }}
      >
        {/* Background Atmospheric Video Loop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.45,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        >
          <CinematicVideo
            src="/videos/hero.mp4"
            poster="/videos/posters/hero.jpg"
            alt="Lumo Socratic Engine"
            priority
            aspectRatio="auto"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Ambient Gradient Overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 80% 20%, rgba(255, 90, 54, 0.18) 0%, transparent 60%), linear-gradient(180deg, rgba(13, 15, 18, 0.4) 0%, rgba(13, 15, 18, 0.88) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Tag */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-orange)',
                boxShadow: '0 0 8px var(--color-orange)',
              }}
            />
            Visual Learning Engine
          </div>
        </div>

        {/* Storytelling & Testimonial Preview */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '520px' }}>
          <blockquote
            style={{
              margin: '0 0 var(--space-6) 0',
              padding: 0,
              fontFamily: 'var(--font-family-serif)',
              fontSize: 'clamp(22px, 2.4vw, 30px)',
              lineHeight: 1.35,
              color: '#F0EDE6',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            “True mastery isn't memorizing facts. It's building the mental model until the mechanics become intuitive.”
          </blockquote>

          {/* Mini Interactive Preview Card */}
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                Active Concept
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                Newtonian Mechanics · Dynamic Incline
              </div>
            </div>
            <div
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(85, 201, 138, 0.15)',
                border: '1px solid rgba(85, 201, 138, 0.3)',
                color: '#55C98A',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              94% Mastery Retention
            </div>
          </div>
        </div>
      </div>

      {/* Responsive media query for showcase pane */}
      <style>{`
        @media (max-width: 959px) {
          .lumo-auth-showcase {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
