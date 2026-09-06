import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import type { ApiResponse, User as AppUser } from '@ai-tutor/shared';
import { Logo } from './components/ui/Logo';

// Page Components — all existing pages preserved
import { LandingPage } from './components/pages/LandingPage';
import { SignInPage } from './components/pages/SignInPage';
import { SignUpPage } from './components/pages/SignUpPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { TutorPage } from './components/pages/TutorPage';
import { LearnPage } from './components/pages/LearnPage';
import { PracticePage } from './components/pages/PracticePage';
import { BookmarksPage } from './components/pages/BookmarksPage';
import { MistakesPage } from './components/pages/MistakesPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { LumoAIPage } from './components/pages/LumoAIPage';

// Standalone Avatar Lab (lazy-loaded for isolated bundle size)
const AvatarLabPage = React.lazy(() => import('./components/avatarLab/AvatarLabPage'));

// Lumo Navigation Shell
import { Navbar } from './components/navigation/Navbar';

// ---------------------------------------------------------------
// Pages where the Navbar should NOT appear
// (e.g. Theater full-screen, auth pages with their own layout)
// ---------------------------------------------------------------
const NAV_HIDDEN_PATHS = new Set(['/signin', '/signup', '/avatar-lab']);

// ---------------------------------------------------------------
// Lumo loading screen
// ---------------------------------------------------------------
const LoadingScreen: React.FC = () => {
  const [showReassurance, setShowReassurance] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReassurance(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
        gap: '16px',
        padding: '0 24px',
        boxSizing: 'border-box',
      }}
    >
      <Logo
        height={64}
        style={{
          opacity: 0.25,
          animation: 'lumo-pulse 1.6s ease-in-out infinite',
        }}
      />
      <span
        style={{
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        Loading…
      </span>

      <p
        style={{
          margin: '8px 0 0 0',
          maxWidth: '420px',
          textAlign: 'center',
          fontSize: 'var(--text-caption, 12px)',
          lineHeight: '1.6',
          color: 'var(--color-text-muted)',
          opacity: showReassurance ? 1 : 0,
          transition: 'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: showReassurance ? 'auto' : 'none',
        }}
      >
        Taking a little longer? Don't worry — Lumo is preparing a few powerful AI tools in the background. Give it a moment, and we'll be ready to learn.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------
// App
// All auth and routing logic is preserved exactly as-is.
// Only the presentation shell has changed.
// ---------------------------------------------------------------
export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [syncedUser, setSyncedUser] = useState<AppUser | null>(null);
  const [idToken, setIdToken] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` || '/' : '/'
  );

  // Sync route with browser history — unchanged
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(`${window.location.pathname}${window.location.search}` || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Firebase auth state observer & MongoDB sync — unchanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          await fetchMe(token);
        } catch {
          // ignore
        }
      } else {
        setIdToken('');
        setSyncedUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ApiResponse<AppUser> = await res.json();
      if (res.ok && data.success && data.data) {
        setSyncedUser(data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIdToken('');
      setCurrentUser(null);
      setSyncedUser(null);
      navigate('/');
    } catch {
      // ignore
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  const isAuthenticated = Boolean(currentUser && idToken);
  const pathname = currentPath.split('?')[0] || '/';
  const searchStr = currentPath.includes('?') ? currentPath.slice(currentPath.indexOf('?')) : '';
  const queryParams = new URLSearchParams(searchStr);

  // Protected Route Guards — unchanged
  const protectedRoutes = [
    '/dashboard',
    '/tutor',
    '/practice',
    '/bookmarks',
    '/mistakes',
    '/analytics',
    '/documents',
    '/ai',
    '/app/ai',
  ];
  if (!isAuthenticated && protectedRoutes.includes(pathname)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
        <SignInPage onNavigate={navigate} onSuccess={() => navigate('/dashboard')} />
      </div>
    );
  }

  // Render page — all routes preserved exactly
  const renderCurrentPage = () => {
    switch (pathname) {
      case '/':
        return <LandingPage isAuthenticated={isAuthenticated} onNavigate={navigate} />;

      case '/signin':
        return isAuthenticated
          ? <DashboardPage user={syncedUser} idToken={idToken} onNavigate={navigate} onSignOut={handleSignOut} />
          : <SignInPage onNavigate={navigate} onSuccess={() => navigate('/dashboard')} />;

      case '/signup':
        return isAuthenticated
          ? <DashboardPage user={syncedUser} idToken={idToken} onNavigate={navigate} onSignOut={handleSignOut} />
          : <SignUpPage onNavigate={navigate} onSuccess={() => navigate('/dashboard')} />;

      case '/dashboard':
        return <DashboardPage user={syncedUser} idToken={idToken} onNavigate={navigate} onSignOut={handleSignOut} />;

      case '/tutor': {
        const sessionId = queryParams.get('sessionId');
        if (sessionId) {
          return (
            <TutorPage
              idToken={idToken}
              onNavigate={navigate}
              initialSessionId={sessionId}
              initialTopic={queryParams.get('topic') || undefined}
              initialSubject={queryParams.get('subject') || undefined}
              initialDocumentId={queryParams.get('documentId') || undefined}
            />
          );
        }
        return (
          <LearnPage
            idToken={idToken}
            onNavigate={navigate}
            initialTopic={queryParams.get('topic') || undefined}
            initialSubject={queryParams.get('subject') || undefined}
            initialDocumentId={queryParams.get('documentId') || undefined}
          />
        );
      }

      case '/practice':
        return <PracticePage idToken={idToken} onNavigate={navigate} initialQuestionId={queryParams.get('questionId') || undefined} />;

      case '/bookmarks':
        return <BookmarksPage idToken={idToken} onNavigate={navigate} />;

      case '/mistakes':
        return <MistakesPage idToken={idToken} onNavigate={navigate} />;

      case '/analytics':
        return <AnalyticsPage idToken={idToken} onNavigate={navigate} />;

      case '/documents':
        return <DocumentsPage idToken={idToken} onNavigate={navigate} />;

      case '/ai':
      case '/app/ai':
        return (
          <LumoAIPage
            idToken={idToken}
            initialTopic={queryParams.get('topic') || undefined}
            initialSubject={queryParams.get('subject') || undefined}
            initialConcept={queryParams.get('concept') || undefined}
            initialDocumentId={queryParams.get('documentId') || undefined}
            initialDocumentTitle={queryParams.get('documentTitle') || undefined}
            initialPrompt={queryParams.get('prompt') || queryParams.get('doubt') || undefined}
            from={queryParams.get('from') || undefined}
          />
        );

      case '/avatar-lab':
        return (
          <React.Suspense fallback={<LoadingScreen />}>
            <AvatarLabPage onNavigate={navigate} />
          </React.Suspense>
        );

      default:
        return <LandingPage isAuthenticated={isAuthenticated} onNavigate={navigate} />;
    }
  };

  // Auth pages and full-screen routes get their own layout (no shared navbar)
  const hideNav = NAV_HIDDEN_PATHS.has(pathname);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Lumo Navigation — hidden on auth pages */}
      {!hideNav && (
        <Navbar
          isAuthenticated={isAuthenticated}
          currentPath={pathname}
          userEmail={currentUser?.email}
          onNavigate={navigate}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main content area */}
      <main>{renderCurrentPage()}</main>
    </div>
  );
};

export default App;
