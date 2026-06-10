'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStudentAuth } from '@/hooks/useStudentAuth';
import { useToast } from '@/hooks/useToast';
import { cn, getApiError } from '@/lib/format';
import { PASSWORD_RULES, validatePassword } from '@/lib/password';
import { useT } from '@/hooks/useLanguage';
import api from '@/lib/client';
import { createClient } from '@/utils/supabase/client';

type Mode = 'login' | 'register';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
type Step = 'credentials' | 'role';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function AuthForm() {
  const t = useT().auth;
  const { loginWithData, register } = useAuth();
  const { loginWithData: studentLoginWithData, register: studentRegister } = useStudentAuth();
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  // Arriving via "Get Started" (/register → /login?mode=register) opens the
  // Create Account view; everything else defaults to Log In.
  const modeParam = searchParams.get('mode');
  const [mode, setMode] = useState<Mode>(modeParam === 'register' ? 'register' : 'login');
  const [step, setStep] = useState<Step>('credentials');

  // Keep the view in sync with the URL: clicking "Log In" in the navbar (→ /login)
  // while on the Create Account view (/login?mode=register) is a soft navigation
  // that doesn't remount this form, so react to the param change here too.
  useEffect(() => {
    setMode(modeParam === 'register' ? 'register' : 'login');
    setStep('credentials');
    setAccepted(false);
    setErrors({});
    setFormError('');
  }, [modeParam]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setStep('credentials');
    setAccepted(false);
    setErrors({});
    setFormError('');
  }

  const handleGoogle = async () => {
    setFormError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser is redirected to Google, so we only reach here on error.
    if (error) setFormError(error.message);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = t.errEmailRequired;
    if (!password) errs.password = t.errPasswordRequired;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormError('');
    setSubmitting(true);
    try {
      const { data } = await api.post<{
        user: { id: number; email: string; role: string };
        trainerId: number | null;
        studentId: number | null;
      }>('/auth/unified-login', { email: email.trim(), password });

      if (data.user.role === 'trainer') {
        loginWithData({ user: data.user as never, trainerId: data.trainerId });
        toast.success(t.toastWelcomeBack);
        router.replace('/dashboard');
      } else {
        studentLoginWithData({ user: data.user as never, studentId: data.studentId });
        router.replace('/student/dashboard');
      }
    } catch (err) {
      setFormError(getApiError(err, t.errIncorrectLogin));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCredentials = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.errNameRequired;
    if (!EMAIL_RE.test(email.trim())) errs.email = t.errEmailInvalid;
    if (validatePassword(password)) errs.password = t.errPasswordInvalid;
    if (!accepted) errs.accepted = t.errAcceptRequired;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setFormError('');
    setStep('role');
  };

  const handleRolePick = async (role: 'trainer' | 'student') => {
    setFormError('');
    setSubmitting(true);
    try {
      if (role === 'trainer') {
        const res = await register({ name: name.trim(), email: email.trim(), password, specialties: [] });
        if (res.needsConfirmation) {
          toast.success(t.toastConfirmEmail);
          setMode('login');
          setStep('credentials');
        } else {
          toast.success(t.toastAccountCreated);
          router.replace('/dashboard');
        }
      } else {
        const res = await studentRegister(name.trim(), email.trim(), password);
        if (res.needsConfirmation) {
          toast.success(t.toastConfirmEmail);
          setMode('login');
          setStep('credentials');
        } else {
          router.replace('/student/dashboard');
        }
      }
    } catch (err) {
      setFormError(getApiError(err, t.errRegisterFailed));
      setStep('credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-surface text-content lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grain-layer" />
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
        />
        <p className="eyebrow relative text-accent">
          <span className="h-px w-8 bg-accent" />
          {t.brandEyebrow}
        </p>
        <div className="relative space-y-10">
          <h1 className="font-display text-6xl leading-[0.92] tracking-wide xl:text-7xl">
            {t.brandTitle1}
            <br />
            <span className="text-accent">{t.brandTitle2}</span>
          </h1>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-accent/70">
                {t.forTrainers}
              </p>
              <ul className="space-y-3">
                {t.trainerBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-content/70">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-volt text-ink">
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-accent/70">
                {t.forStudents}
              </p>
              <ul className="space-y-3">
                {t.studentBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-content/70">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-volt/20 text-accent">
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="relative text-[12px] uppercase tracking-[0.18em] text-content/35">
          {t.brandTagline}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-bone px-5 py-14">
        <div className="w-full max-w-md">

          {/* Mode tabs — hidden on role-pick step */}
          {step !== 'role' && (
            <div className="mb-8 flex border border-ink/15 bg-white">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    'flex-1 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200',
                    mode === m ? 'bg-ink text-bone' : 'text-ink/45 hover:text-ink'
                  )}
                >
                  {m === 'login' ? t.tabLogin : t.tabRegister}
                </button>
              ))}
            </div>
          )}

          {formError && (
            <div className="mb-6 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Social sign-in — available on both Log In and Create Account steps */}
          {step !== 'role' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-3 border border-ink/15 bg-white py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
              >
                <GoogleIcon />
                {t.continueWithGoogle}
              </button>
              <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink/35">
                <span className="h-px flex-1 bg-ink/10" />
                {t.orDivider}
                <span className="h-px flex-1 bg-ink/10" />
              </div>
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <h2 className="font-display text-5xl leading-none tracking-wide">{t.loginTitle}</h2>
              <p className="mt-2 text-sm text-ink/55">
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-ink underline hover:text-ink/70"
                >
                  {t.createOne}
                </button>
              </p>

              <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
                <div>
                  <label className="field-label" htmlFor="login-email">{t.emailLabel}</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    className={cn('field-input', errors.email && 'field-input-invalid')}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    placeholder={t.emailPlaceholder}
                  />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="login-password">{t.passwordLabel}</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={cn('field-input pr-12', errors.password && 'field-input-invalid')}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                      placeholder={t.loginPasswordPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>

                <button type="submit" disabled={submitting} className="btn btn-dark w-full">
                  {submitting
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-bone border-t-transparent" />
                    : <><span>{t.loginSubmit}</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              {/* Demo box */}
              <div className="mt-6 border border-ink/10 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">{t.demoTitle}</p>
                <div className="mt-2 space-y-1 text-sm text-ink/60">
                  <p>{t.demoTrainer}: <span className="font-mono">marcus@fitconnect.com · trainer123</span></p>
                  <p>{t.demoStudent}: <span className="font-mono">demo.student@fitconnect.com · student123</span></p>
                </div>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setEmail('marcus@fitconnect.com'); setPassword('trainer123'); }}
                    className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink underline hover:text-ink/60"
                  >
                    {t.fillTrainer}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('demo.student@fitconnect.com'); setPassword('student123'); }}
                    className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink underline hover:text-ink/60"
                  >
                    {t.fillStudent}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── REGISTER: Step 1 — credentials ── */}
          {mode === 'register' && step === 'credentials' && (
            <>
              <h2 className="font-display text-5xl leading-none tracking-wide">{t.registerTitle}</h2>
              <p className="mt-2 text-sm text-ink/55">
                {t.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-ink underline hover:text-ink/70"
                >
                  {t.logIn}
                </button>
              </p>

              <form onSubmit={handleCredentials} noValidate className="mt-6 space-y-4">
                <div>
                  <label className="field-label" htmlFor="reg-name">{t.nameLabel}</label>
                  <input
                    id="reg-name"
                    className={cn('field-input', errors.name && 'field-input-invalid')}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                    placeholder="Alex Morgan"
                  />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="reg-email">{t.emailLabel}</label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className={cn('field-input', errors.email && 'field-input-invalid')}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    placeholder={t.emailPlaceholder}
                  />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="reg-password">{t.passwordLabel}</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={cn('field-input pr-12', errors.password && 'field-input-invalid')}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                      placeholder={t.registerPasswordPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="field-error">{errors.password}</p>}
                  <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(password);
                      return (
                        <li
                          key={rule.id}
                          className={cn(
                            'flex items-center gap-1.5 text-[11px] transition-colors',
                            ok ? 'text-green-600' : 'text-ink/40'
                          )}
                        >
                          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                            {ok ? (
                              <Check className="h-3 w-3" strokeWidth={3} />
                            ) : (
                              <span className="h-1 w-1 rounded-full bg-ink/30" />
                            )}
                          </span>
                          {t.pwRules[rule.id as keyof typeof t.pwRules]}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <label className="flex items-start gap-2.5 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => { setAccepted(e.target.checked); setErrors((p) => ({ ...p, accepted: '' })); }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                    />
                    <span>
                      {t.agreePrefix}
                      <a
                        href="/user-agreement"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-ink underline hover:text-ink/70"
                      >
                        {t.agreeLink}
                      </a>
                      {t.agreeSuffix}
                    </span>
                  </label>
                  {errors.accepted && <p className="field-error">{errors.accepted}</p>}
                </div>

                <button type="submit" className="btn btn-dark w-full">
                  {t.continue}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}

          {/* ── REGISTER: Step 2 — role picker ── */}
          {mode === 'register' && step === 'role' && (
            <>
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.back}
              </button>

              <h2 className="font-display text-4xl leading-none tracking-wide">{t.roleTitle}</h2>
              <p className="mt-2 text-sm text-ink/55">{t.roleSubtitle}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* Trainer card */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRolePick('trainer')}
                  className="group flex flex-col gap-4 border border-ink/15 bg-white p-6 text-left transition-all duration-200 hover:border-ink hover:shadow-lg disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center bg-volt text-2xl">
                    🏋️
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-wide">{t.roleTrainer}</p>
                    <p className="mt-1 text-sm text-ink/55">
                      {t.roleTrainerDesc}
                    </p>
                  </div>
                  <ul className="mt-auto space-y-1.5">
                    {t.trainerBenefits.slice(0, 3).map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-ink/50">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" strokeWidth={3} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {submitting
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent self-end" />
                    : <ArrowRight className="h-4 w-4 self-end text-ink/30 transition-colors group-hover:text-ink" />}
                </button>

                {/* Student card */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRolePick('student')}
                  className="group flex flex-col gap-4 border border-ink/15 bg-white p-6 text-left transition-all duration-200 hover:border-ink hover:shadow-lg disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center bg-ink text-2xl">
                    📚
                  </div>
                  <div>
                    <p className="font-display text-xl tracking-wide">{t.roleStudent}</p>
                    <p className="mt-1 text-sm text-ink/55">
                      {t.roleStudentDesc}
                    </p>
                  </div>
                  <ul className="mt-auto space-y-1.5">
                    {t.studentBenefits.slice(0, 3).map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-ink/50">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-ink/40" strokeWidth={3} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {submitting
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent self-end" />
                    : <ArrowRight className="h-4 w-4 self-end text-ink/30 transition-colors group-hover:text-ink" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-72px)] bg-bone" />}>
      <AuthForm />
    </Suspense>
  );
}
