'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';
import { useToast } from '../../src/hooks/useToast';
import { useT } from '../../src/hooks/useLanguage';
import { cn, getApiError } from '../../src/lib/format';
import api from '../../src/api/client';

type Role = 'trainer' | 'student';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const t = useT();

  const initialRole: Role = searchParams.get('role') === 'student' ? 'student' : 'trainer';
  const from = searchParams.get('from') || '/dashboard';

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function switchRole(next: Role) {
    setRole(next);
    setErrors({});
    setFormError('');
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = t.login.emailRequired;
    if (!password) errs.password = t.login.passwordRequired;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormError('');
    setSubmitting(true);

    try {
      if (role === 'trainer') {
        await login(email.trim(), password);
        toast.success(t.login.successMsg);
        router.replace(from);
      } else {
        const { data } = await api.post<{ token: string; user: { id: number; email: string; role: string }; studentId: number }>(
          '/auth/student-login',
          { email: email.trim(), password }
        );
        localStorage.setItem('traineruniverse_student_token', data.token);
        localStorage.setItem('traineruniverse_student_auth', JSON.stringify({ user: data.user, studentId: data.studentId }));
        localStorage.setItem('traineruniverse_token', data.token);
        router.replace('/student/dashboard');
      }
    } catch (err) {
      setFormError(getApiError(err, role === 'trainer' ? t.login.fallbackError : t.studentPortal.fallbackError));
    } finally {
      setSubmitting(false);
    }
  };

  const useDemo = () => {
    setEmail('marcus@fitconnect.com');
    setPassword('trainer123');
    setErrors({});
    setFormError('');
  };

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink text-bone lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grain-layer" />
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
        />
        <p className="eyebrow relative text-volt">
          <span className="h-px w-8 bg-volt" />
          {t.login.eyebrow}
        </p>
        <div className="relative">
          <h1 className="font-display text-7xl leading-[0.92] tracking-wide xl:text-8xl">
            {t.login.brandTitle1}
            <br />
            {t.login.brandTitle2}
            <br />
            <span className="text-volt">{t.login.brandTitle3}</span>
          </h1>
          <p className="mt-6 max-w-sm text-bone/55">{t.login.brandDesc}</p>
        </div>
        <p className="relative text-[12px] uppercase tracking-[0.18em] text-bone/35">
          {t.login.brandTagline}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-bone px-5 py-14">
        <div className="w-full max-w-md">

          {/* Role toggle */}
          <div className="mb-8 flex border border-ink/15 bg-white">
            {(['trainer', 'student'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={cn(
                  'flex-1 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200',
                  role === r ? 'bg-ink text-bone' : 'text-ink/45 hover:text-ink'
                )}
              >
                {r === 'trainer' ? t.login.trainerTab : t.login.studentTab}
              </button>
            ))}
          </div>

          <h2 className="font-display text-5xl leading-none tracking-wide">
            {role === 'trainer' ? t.login.title : t.studentPortal.loginTitle}
          </h2>
          <p className="mt-2 text-sm text-ink/55">
            {role === 'trainer' ? (
              <>
                {t.login.newAccount}{' '}
                <Link href="/register" className="font-semibold text-ink underline hover:text-ink/70">
                  {t.login.becomeTrainer}
                </Link>
              </>
            ) : (
              <>
                {t.studentPortal.noAccount}{' '}
                <Link href="/student/register" className="font-semibold text-ink underline hover:text-ink/70">
                  {t.studentPortal.goToRegister}
                </Link>
              </>
            )}
          </p>

          {formError && (
            <div className="mt-6 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="login-email">
                {t.login.emailLabel}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className={cn('field-input', errors.email && 'field-input-invalid')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder={t.login.emailPlaceholder}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="login-password">
                {t.login.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn('field-input pr-12', errors.password && 'field-input-invalid')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder={t.login.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? t.login.hidePassword : t.login.showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 transition-colors duration-200 hover:text-ink"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn btn-dark w-full">
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-bone border-t-transparent" />
              ) : (
                <>
                  {role === 'trainer' ? t.login.submit : t.studentPortal.loginBtn}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {role === 'trainer' && (
            <div className="mt-6 border border-ink/10 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                {t.login.demoTitle}
              </p>
              <p className="mt-1 text-sm text-ink/60">{t.login.demoCredentials}</p>
              <button
                type="button"
                onClick={useDemo}
                className="mt-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink underline hover:text-ink/60"
              >
                {t.login.demoFill}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-72px)] bg-bone" />}>
      <LoginForm />
    </Suspense>
  );
}
