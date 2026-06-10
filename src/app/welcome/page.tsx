'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { useT } from '@/hooks/useLanguage';
import api from '@/lib/client';
import { getApiError } from '@/lib/format';

// Shown once after a brand-new Google sign-in, to pick trainer vs. student.
// /api/auth/complete-profile creates the matching profile, then we redirect.
export default function WelcomePage() {
  const t = useT().auth;
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pick = async (role: 'trainer' | 'student') => {
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/complete-profile', { role });
      router.replace(role === 'student' ? '/student/dashboard' : '/dashboard');
    } catch (err) {
      // No session here means they reached this page without signing in.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        router.replace('/login');
        return;
      }
      setError(getApiError(err, t.errRegisterFailed));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-bone px-5 py-14">
      <div className="w-full max-w-2xl">
        <h1 className="font-display text-4xl leading-none tracking-wide sm:text-5xl">{t.roleTitle}</h1>
        <p className="mt-2 text-sm text-ink/55">{t.chooseRoleGoogle}</p>

        {error && (
          <div className="mt-6 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(
            [
              { role: 'trainer', emoji: '🏋️', title: t.roleTrainer, desc: t.roleTrainerDesc, bg: 'bg-volt text-ink' },
              { role: 'student', emoji: '📚', title: t.roleStudent, desc: t.roleStudentDesc, bg: 'bg-ink text-bone' },
            ] as const
          ).map((c) => (
            <button
              key={c.role}
              type="button"
              disabled={submitting}
              onClick={() => pick(c.role)}
              className="group flex flex-col gap-4 border border-ink/15 bg-white p-6 text-left transition-all duration-200 hover:border-ink hover:shadow-lg disabled:opacity-50"
            >
              <div className={`flex h-10 w-10 items-center justify-center text-2xl ${c.bg}`}>{c.emoji}</div>
              <div>
                <p className="font-display text-xl tracking-wide">{c.title}</p>
                <p className="mt-1 text-sm text-ink/55">{c.desc}</p>
              </div>
              {submitting ? (
                <span className="h-4 w-4 animate-spin self-end rounded-full border-2 border-ink border-t-transparent" />
              ) : (
                <ArrowRight className="h-4 w-4 self-end text-ink/30 transition-colors group-hover:text-ink" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
