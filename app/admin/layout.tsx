'use client';

import { AdminAuthProvider } from '../../src/hooks/useAdminAuth';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
