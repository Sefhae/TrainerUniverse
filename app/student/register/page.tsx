'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '../../../src/hooks/useStudentAuth';
import { useT } from '../../../src/hooks/useLanguage';

export default function StudentRegisterPage() {
  const t = useT();
  const sp = t.studentPortal;
  const { register } = useStudentAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError(sp.nameRequired); return; }
    if (!email.includes('@')) { setError(sp.emailInvalid); return; }
    if (password.length < 6) { setError(sp.passwordShort); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
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
          <h1 className="mt-4 font-display text-2xl tracking-wide">{sp.registerTitle}</h1>
          <p className="mt-2 text-sm text-ink/55">{sp.registerDesc}</p>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-ink/10 bg-white p-6">
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              {sp.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={sp.namePlaceholder}
              className="w-full border border-ink/20 bg-bone px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>

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
            {loading ? '…' : sp.registerBtn}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/55">
          {sp.hasAccount}{' '}
          <Link href="/student/login" className="font-semibold text-ink underline hover:no-underline">
            {sp.goToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
