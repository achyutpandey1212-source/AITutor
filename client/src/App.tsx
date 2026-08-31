import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config/firebase';
import type { ApiResponse, HealthStatus, User as AppUser } from '@ai-tutor/shared';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [syncedUser, setSyncedUser] = useState<AppUser | null>(null);
  const [idToken, setIdToken] = useState<string>('');
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Check health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json() as Promise<ApiResponse<HealthStatus>>)
      .then((res) => {
        if (res.success && res.data) setHealth(res.data);
      })
      .catch((err) => console.error('Health check error:', err));
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          await fetchMe(token);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to retrieve token');
        }
      } else {
        setIdToken('');
        setSyncedUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMe = async (token?: string) => {
    const bearerToken = token || idToken;
    if (!bearerToken) {
      setErrorMessage('No ID token available. Please sign in.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      const data: ApiResponse<AppUser> = await res.json();
      if (res.ok && data.success && data.data) {
        setSyncedUser(data.data);
        setStatusMessage('Successfully fetched /api/auth/me');
      } else {
        setErrorMessage(data.error?.message || `Error status: ${res.status}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch /api/auth/me');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setStatusMessage('Signed up successfully!');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatusMessage('Signed in successfully!');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMessage('');
    setStatusMessage('');
    try {
      await signOut(auth);
      setStatusMessage('Signed out successfully.');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1>AI Tutor - Auth & Database Foundation</h1>
      
      <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h3>Server & Database Status</h3>
        {health ? (
          <div>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Database:</strong> {health.database || 'unknown'}</p>
            <p><strong>Environment:</strong> {health.environment}</p>
          </div>
        ) : (
          <p>Connecting to backend...</p>
        )}
      </section>

      {statusMessage && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#e6fffa', color: '#234e52', borderRadius: '6px' }}>{statusMessage}</div>}
      {errorMessage && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fff5f5', color: '#c53030', borderRadius: '6px' }}>{errorMessage}</div>}

      <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h3>Authentication Verification</h3>
        
        {currentUser ? (
          <div>
            <p><strong>Firebase UID:</strong> {currentUser.uid}</p>
            <p><strong>Firebase Email:</strong> {currentUser.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => fetchMe()} disabled={loading} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                {loading ? 'Fetching...' : 'Re-fetch /api/auth/me'}
              </button>
              <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>

            {syncedUser && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7fafc', borderRadius: '6px' }}>
                <h4>MongoDB User Record:</h4>
                <pre style={{ fontSize: '0.85rem' }}>{JSON.stringify(syncedUser, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Sign In
              </button>
              <button type="button" onClick={handleSignUp} disabled={loading} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Sign Up
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default App;
