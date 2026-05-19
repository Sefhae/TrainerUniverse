'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '../../../src/hooks/useStudentAuth';
import { useT } from '../../../src/hooks/useLanguage';

export default function StudentLoginPage() {
  const t = useT();
  const sp = t.studentPortal;
  const { login } = useStudentAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function fillDemo() {
    setEmail('demo.student@fitconnect.com');
    setPassword('student123');
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push('/student/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || sp.fallbackError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block font-display text-3xl tracking-[0.08em] text-ink">
            TRAINER<span className="text-volt">UNIVERSE</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl tracking-wide">{sp.loginTitle}</h1>
          <p className="mt-2 text-sm text-ink/55">{sp.loginDesc}</p>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-ink/10 bg-white p-6">
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              {sp.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={sp.emailPlaceholder}
              className="w-full border border-ink/20 bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              {sp.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={sp.passwordPlaceholder}
                className="w-full border border-ink/20 bg-bone px-3 py-2.5 pr-10 text-sm focus:border-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                aria-label={showPw ? sp.hidePassword : sp.showPassword}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-dark w-full disabled:opacity-50">
            {loading ? '…' : sp.loginBtn}
          </button>
        </form>

        <div className="mt-6 border border-ink/10 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
            {sp.demoTitle}
          </p>
          <p className="mt-1 text-sm text-ink/60">{sp.demoCredentials}</p>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink underline hover:text-ink/60"
          >
            {sp.demoFill}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-ink/55">
          {sp.noAccount}{' '}
          <Link href="/student/register" className="font-semibold text-ink underline hover:no-underline">
            {sp.goToRegister}
          </Link>
        </p>
      </div>
    </div>
  );
}
