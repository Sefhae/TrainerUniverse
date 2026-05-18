'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?from=' + encodeURIComponent(pathname));
    }
  }, [isAuthenticated, router, pathname]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
