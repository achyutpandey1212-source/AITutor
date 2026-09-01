import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config/firebase';
import type { ApiResponse, HealthStatus, User as AppUser, AITestResponse } from '@ai-tutor/shared';

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

  // AI Test State
  const [aiPrompt, setAiPrompt] = useState<string>('Explain quantum computing in one sentence.');
  const [aiResult, setAiResult] = useState<AITestResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiStreamText, setAiStreamText] = useState<string>('');

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
        setAiResult(null);
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
        setStatusMessage('Successfully authenticated and synchronized with MongoDB');
      } else {
        setErrorMessage(data.error?.message || `Error status: ${res.status}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch /api/auth/me');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAi = async () => {
    if (!idToken) {
      setErrorMessage('Please sign in first to test protected AI endpoints');
      return;
    }
    setAiLoading(true);
    setErrorMessage('');
    setAiStreamText('');
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data: ApiResponse<AITestResponse> = await res.json();
      if (res.ok && data.success && data.data) {
        setAiResult(data.data);
      } else {
        setErrorMessage(data.error?.message || 'AI request failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error calling /api/ai/test');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTestStream = async () => {
    if (!idToken) {
      setErrorMessage('Please sign in first to test streaming AI endpoints');
      return;
    }
    setAiLoading(true);
    setErrorMessage('');
    setAiStreamText('');
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/test/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Streaming failed: HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullStream = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value);
        const lines = textChunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.replace('data: ', ''));
              if (parsed.chunk) {
                fullStream += parsed.chunk;
                setAiStreamText(fullStream);
              }
            } catch {
              // ignore SSE formatting lines
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Stream read error');
    } finally {
      setAiLoading(false);
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
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem', maxWidth: '680px', margin: '0 auto' }}>
      <h1>AI Tutor - Milestone 3: AI Provider Layer</h1>
      
      <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h3>Server Status</h3>
        {health ? (
          <div>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Database:</strong> {health.database || 'unknown'}</p>
          </div>
        ) : (
          <p>Connecting to backend...</p>
        )}
      </section>

      {statusMessage && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#e6fffa', color: '#234e52', borderRadius: '6px' }}>{statusMessage}</div>}
      {errorMessage && <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fff5f5', color: '#c53030', borderRadius: '6px' }}>{errorMessage}</div>}

      <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h3>Authentication & User Record</h3>
        
        {currentUser ? (
          <div>
            <p><strong>Authenticated UID:</strong> {currentUser.uid}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            {syncedUser && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                <strong>MongoDB Sync:</strong> ID: {syncedUser.id} | Email: {syncedUser.email}
              </div>
            )}
            <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              Sign Out
            </button>
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

      {currentUser && (
        <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
          <h3>AI Provider Verification (Gemini Primary / Groq Fallback)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label>Prompt:</label>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleTestAi}
                disabled={aiLoading}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                {aiLoading ? 'Generating...' : 'Generate Text (POST /api/ai/test)'}
              </button>
              <button
                onClick={handleTestStream}
                disabled={aiLoading}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px' }}
              >
                {aiLoading ? 'Streaming...' : 'Stream Text (POST /api/ai/test/stream)'}
              </button>
            </div>
          </div>

          {aiResult && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <h4>AI Response:</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{aiResult.response}</p>
              <hr style={{ margin: '1rem 0', borderColor: '#e2e8f0' }} />
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                <strong>Provider:</strong> {aiResult.provider} | <strong>Model:</strong> {aiResult.model} | <strong>Fallback Used:</strong> {aiResult.fallbackUsed ? 'Yes' : 'No'}
              </p>
            </div>
          )}

          {aiStreamText && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <h4>Streaming Response:</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{aiStreamText}</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default App;
