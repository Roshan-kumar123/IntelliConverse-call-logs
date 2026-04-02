import { createContext, useContext, useState, useCallback } from 'react';

interface AuthUser {
  name: string;
  email: string;
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'ic_auth_user';

// The 4-step next-auth credentials login flow against prod.ic6e.aionos.ai
// proxied via /auth-api in both dev (vite proxy) and prod (vercel.json rewrite)
async function doLogin(email: string, password: string): Promise<AuthUser> {
  // Step 1: get CSRF token
  const csrfRes = await fetch('/auth-api/api/auth/csrf', {
    credentials: 'include',
  });
  if (!csrfRes.ok) throw new Error('Failed to get CSRF token');
  const { csrfToken } = await csrfRes.json();

  // Step 2: submit credentials
  const callbackRes = await fetch('/auth-api/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    credentials: 'include',
    redirect: 'manual',
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: '/',
      json: 'true',
    }).toString(),
  });

  // next-auth returns 302 on success, 200 with error on failure
  if (callbackRes.status !== 200 && callbackRes.status !== 302 && callbackRes.type !== 'opaqueredirect') {
    throw new Error('Login failed — invalid credentials');
  }

  // Try to parse body for error message (next-auth sends {url} on success via json:true)
  if (callbackRes.status === 200) {
    try {
      const body = await callbackRes.json();
      if (body?.error) throw new Error('Invalid email or password');
    } catch (e) {
      if (e instanceof Error && e.message === 'Invalid email or password') throw e;
      // JSON parse failed = redirect happened = OK
    }
  }

  // Step 3: get session with accessToken
  const sessionRes = await fetch('/auth-api/api/auth/session', {
    credentials: 'include',
  });
  if (!sessionRes.ok) throw new Error('Failed to get session');
  const session = await sessionRes.json();

  const accessToken = session?.accessToken ?? session?.user?.accessToken;
  const name = session?.user?.name ?? session?.user?.email ?? email;
  const userEmail = session?.user?.email ?? email;

  if (!accessToken) throw new Error('Login succeeded but no access token returned');

  return { name, email: userEmail, accessToken };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Read from localStorage synchronously during initial render — no useEffect delay
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as AuthUser;
    } catch { /* ignore */ }
    return null;
  });
  const [loading] = useState(false); // no async loading needed — read is synchronous

  const login = useCallback(async (email: string, password: string) => {
    const authUser = await doLogin(email, password);
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
