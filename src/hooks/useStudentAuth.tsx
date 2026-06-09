'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '@/lib/client';
import type { StudentAuthResponse, User } from '@/lib/types';

interface StudentAuthState {
  user: User | null;
  studentId: number | null;
}

interface StudentAuthContextValue extends StudentAuthState {
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithData: (data: { user: User; studentId: number | null }) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const EMPTY: StudentAuthState = { user: null, studentId: null };

const StudentAuthContext = createContext<StudentAuthContextValue | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudentAuthState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from the Supabase session cookie; only adopt it for student accounts.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<{ user: User; studentId: number | null }>('/auth/me');
        if (active && data.user && data.user.role === 'student') {
          setState({ user: data.user, studentId: data.studentId });
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
    const { data } = await api.post<StudentAuthResponse>('/auth/student-login', { email, password });
    setState({ user: data.user, studentId: data.studentId });
  }, []);

  const loginWithData = useCallback((data: { user: User; studentId: number | null }) => {
    setState({ user: data.user, studentId: data.studentId });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<StudentAuthResponse>('/auth/student-register', { name, email, password });
    setState({ user: data.user, studentId: data.studentId });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setState(EMPTY);
  }, []);

  return (
    <StudentAuthContext.Provider
      value={{
        ...state,
        isAuthenticated: Boolean(state.user),
        hydrated,
        login,
        loginWithData,
        register,
        logout,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth(): StudentAuthContextValue {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}
