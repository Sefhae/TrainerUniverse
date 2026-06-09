'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import api from '../lib/client';

const ADMIN_TOKEN_KEY = 'traineruniverse_admin_token';

interface AdminAuthState {
  token: string | null;
}

interface AdminAuthContextValue extends AdminAuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function readStored(): AdminAuthState {
  try {
    if (typeof window === 'undefined') return { token: null };
    return { token: localStorage.getItem(ADMIN_TOKEN_KEY) };
  } catch {
    return { token: null };
  }
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>(readStored);

  const persist = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem('traineruniverse_token', token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    setState({ token });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string }>('/admin/login', { email, password });
    persist(data.token);
  }, [persist]);

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  return (
    <AdminAuthContext.Provider value={{ ...state, isAuthenticated: Boolean(state.token), login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
