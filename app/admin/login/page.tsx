'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAdminAuth } from '../../../src/hooks/useAdminAuth';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin/dashboard');
    } catch {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center bg-volt">
            <Shield className="h-7 w-7 text-ink" />
          </div>
          <h1 className="mt-5 font-display text-3xl tracking-wide text-content">Admin Access</h1>
          <p className="mt-1 text-sm text-content/40">Restricted area — authorised personnel only</p>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-content/10 bg-content/5 p-6">
          {error && (
            <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-content/40">
              Email / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full border border-content/10 bg-content/5 px-3 py-2.5 text-sm text-content placeholder:text-content/25 focus:border-volt focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-content/40">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-content/10 bg-content/5 px-3 py-2.5 pr-10 text-sm text-content placeholder:text-content/25 focus:border-volt focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content/30 hover:text-content"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-volt py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition hover:bg-volt/90 disabled:opacity-50"
          >
            {loading ? '…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
