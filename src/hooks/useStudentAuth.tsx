'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import api from '../api/client';
import type { User } from '../types';

const STUDENT_TOKEN_KEY = 'traineruniverse_student_token';
const STUDENT_AUTH_KEY = 'traineruniverse_student_auth';

interface StudentAuthState {
  user: User | null;
  token: string | null;
  studentId: number | null;
}

interface StudentAuthContextValue extends StudentAuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

function readStoredAuth(): StudentAuthState {
  try {
    if (typeof window === 'undefined') return { user: null, token: null, studentId: null };
    const token = localStorage.getItem(STUDENT_TOKEN_KEY);
    const raw = localStorage.getItem(STUDENT_AUTH_KEY);
    if (token && raw) {
      const parsed = JSON.parse(raw) as { user: User; studentId: number | null };
      return { token, user: parsed.user, studentId: parsed.studentId };
    }
  } catch { /* corrupt */ }
  return { user: null, token: null, studentId: null };
}

const StudentAuthContext = createContext<StudentAuthContextValue | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudentAuthState>(readStoredAuth);

  const persist = useCallback((next: StudentAuthState) => {
    if (next.token && next.user) {
      localStorage.setItem(STUDENT_TOKEN_KEY, next.token);
      localStorage.setItem(STUDENT_AUTH_KEY, JSON.stringify({ user: next.user, studentId: next.studentId }));
      // Also set the shared token key so the api client sends it
      localStorage.setItem('traineruniverse_token', next.token);
    } else {
      localStorage.removeItem(STUDENT_TOKEN_KEY);
      localStorage.removeItem(STUDENT_AUTH_KEY);
      localStorage.removeItem('traineruniverse_token');
    }
    setState(next);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User; studentId: number }>(
      '/auth/student-login',
      { email, password }
    );
    persist({ user: data.user, token: data.token, studentId: data.studentId });
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User; studentId: number }>(
      '/auth/student-register',
      { name, email, password }
    );
    persist({ user: data.user, token: data.token, studentId: data.studentId });
  }, [persist]);

  const logout = useCallback(() => {
    persist({ user: null, token: null, studentId: null });
  }, [persist]);

  return (
    <StudentAuthContext.Provider value={{
      ...state,
      isAuthenticated: Boolean(state.token),
      login,
      register,
      logout,
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth(): StudentAuthContextValue {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error('useStudentAuth must be used within StudentAuthProvider');
  return ctx;
}
