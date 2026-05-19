'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { LanguageProvider } from '../hooks/useLanguage';
import { StudentAuthProvider } from '../hooks/useStudentAuth';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StudentAuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
