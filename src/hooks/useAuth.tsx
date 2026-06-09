'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '@/lib/client';
import type { AuthResponse, User } from '@/lib/types';

interface AuthState {
  user: User | null;
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
  loginWithData: (data: { user: User; trainerId: number | null }) => void;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const EMPTY: AuthState = { user: null, trainerId: null };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // On load, ask the server who we are (reads the Supabase session cookie).
  // Only adopt the session here if it belongs to a trainer/admin account.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<AuthResponse>('/auth/me');
        if (active && data.user && data.user.role !== 'student') {
          setState({ user: data.user, trainerId: data.trainerId });
        }
      } catch {
        /* not logged in */
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setState({ user: data.user, trainerId: data.trainerId });
  }, []);

  const loginWithData = useCallback((data: { user: User; trainerId: number | null }) => {
    setState({ user: data.user, trainerId: data.trainerId });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    setState({ user: data.user, trainerId: data.trainerId });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setState(EMPTY);
  }, []);

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: Boolean(state.user),
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
