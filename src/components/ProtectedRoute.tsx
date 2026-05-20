'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login?from=' + encodeURIComponent(pathname));
    }
  }, [hydrated, isAuthenticated, router, pathname]);

  if (!hydrated) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
