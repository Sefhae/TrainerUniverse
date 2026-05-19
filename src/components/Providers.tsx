'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { LanguageProvider } from '../hooks/useLanguage';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
