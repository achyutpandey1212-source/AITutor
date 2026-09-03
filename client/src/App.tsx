import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from './config/firebase';
import type { ApiResponse, User as AppUser } from '@ai-tutor/shared';

// Page Components
import { LandingPage } from './components/pages/LandingPage';
import { SignInPage } from './components/pages/SignInPage';
import { SignUpPage } from './components/pages/SignUpPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { TutorPage } from './components/pages/TutorPage';
import { PracticePage } from './components/pages/PracticePage';
import { BookmarksPage } from './components/pages/BookmarksPage';
import { MistakesPage } from './components/pages/MistakesPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { DocumentsPage } from './components/pages/DocumentsPage';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [syncedUser, setSyncedUser] = useState<AppUser | null>(null);
  const [idToken, setIdToken] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  // Sync route with browser history
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Firebase auth state observer & MongoDB sync
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
      navigate('/signin');
    } catch {
      // ignore
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        Loading AI Tutor...
      </div>
    );
  }

  const isAuthenticated = Boolean(currentUser && idToken);

  // Protected Route Guards
  const protectedRoutes = ['/dashboard', '/tutor', '/practice', '/bookmarks', '/mistakes', '/analytics', '/documents'];
  if (!isAuthenticated && protectedRoutes.includes(currentPath)) {
    return <SignInPage onNavigate={navigate} onSuccess={() => navigate('/dashboard')} />;
  }

  // Render appropriate page view
  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage isAuthenticated={isAuthenticated} onNavigate={navigate} />;

      case '/signin':
        return isAuthenticated ? (
          <DashboardPage user={syncedUser} idToken={idToken} onNavigate={navigate} onSignOut={handleSignOut} />
        ) : (
          <SignInPage onNavigate={navigate} onSuccess={() => navigate('/dashboard')} />
        );

      case '/signup':
        return isAuthenticated ? (
          <DashboardPage user={syncedUser} idToken={idToken} onNavigate={navigate} onSignOut={handleSignOut} />
        ) : (
          <SignUpPage onNavigate={navigate} onSuccess={() => navigate('/dashboard')} />
        );

      case '/dashboard':
        return <DashboardPage user={syncedUser} idToken={idToken} onNavigate={navigate} onSignOut={handleSignOut} />;

      case '/tutor':
        return <TutorPage idToken={idToken} onNavigate={navigate} />;

      case '/practice':
        return <PracticePage idToken={idToken} onNavigate={navigate} />;

      case '/bookmarks':
        return <BookmarksPage idToken={idToken} onNavigate={navigate} />;

      case '/mistakes':
        return <MistakesPage idToken={idToken} onNavigate={navigate} />;

      case '/analytics':
        return <AnalyticsPage idToken={idToken} onNavigate={navigate} />;

      case '/documents':
        return <DocumentsPage idToken={idToken} onNavigate={navigate} />;

      default:
        return <LandingPage isAuthenticated={isAuthenticated} onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Minimal Top Navigation Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#0f172a',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          🎓 <span>AI Tutor</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/tutor')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
              >
                Tutor
              </button>
              <button
                onClick={() => navigate('/practice')}
                style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Practice
              </button>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#64748b' }}>{currentUser?.email}</span>
              <button
                onClick={handleSignOut}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/signin')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.35rem 0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main>{renderCurrentPage()}</main>
    </div>
  );
};

export default App;

