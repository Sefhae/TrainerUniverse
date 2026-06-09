'use client';

import { StudentAuthProvider } from '@/hooks/useStudentAuth';
import type { ReactNode } from 'react';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentAuthProvider>{children}</StudentAuthProvider>;
}
