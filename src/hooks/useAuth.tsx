'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import api, { TOKEN_KEY } from '../api/client';
import type { AuthResponse, User } from '../types';

const AUTH_KEY = 'traineruniverse_auth';

interface AuthState {
  user: User | null;
  token: string | null;
  trainerId: number | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  specialties: string[];
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithData: (data: { token: string; user: User; trainerId: number | null }) => void;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

function readStoredAuth(): AuthState {
  try {
    if (typeof window === 'undefined') return { user: null, token: null, trainerId: null };
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(AUTH_KEY);
    if (token && raw) {
      const parsed = JSON.parse(raw) as { user: User; trainerId: number | null };
      return { token, user: parsed.user, trainerId: parsed.trainerId };
    }
  } catch {
    /* corrupt storage */
  }
  return { user: null, token: null, trainerId: null };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, trainerId: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredAuth());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: AuthState) => {
    if (next.token && next.user) {
      localStorage.setItem(TOKEN_KEY, next.token);
      localStorage.setItem(AUTH_KEY, JSON.stringify({ user: next.user, trainerId: next.trainerId }));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_KEY);
    }
    setState(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      persist({ user: data.user, token: data.token, trainerId: data.trainerId });
    },
    [persist]
  );

  const loginWithData = useCallback(
    (data: { token: string; user: User; trainerId: number | null }) => {
      persist({ user: data.user, token: data.token, trainerId: data.trainerId });
    },
    [persist]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      persist({ user: data.user, token: data.token, trainerId: data.trainerId });
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist({ user: null, token: null, trainerId: null });
  }, [persist]);

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: Boolean(state.token),
    hydrated,
    login,
    loginWithData,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
