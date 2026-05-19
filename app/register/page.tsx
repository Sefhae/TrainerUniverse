'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { useAuth } from '../../src/hooks/useAuth';
import { useToast } from '../../src/hooks/useToast';
import { useT } from '../../src/hooks/useLanguage';
import { SPECIALTY_OPTIONS } from '../../src/lib/constants';
import { cn, getApiError } from '../../src/lib/format';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const t = useT();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleSpecialty = (s: string) => {
    setSpecialties((list) =>
      list.includes(s) ? list.filter((x) => x !== s) : [...list, s]
    );
    setErrors((p) => ({ ...p, specialties: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.register.nameRequired;
    if (!EMAIL_RE.test(email.trim())) errs.email = t.register.emailInvalid;
    if (password.length < 6) errs.password = t.register.passwordShort;
    if (specialties.length === 0) errs.specialties = t.register.specialtiesRequired;
    if (!agree) errs.agree = t.register.agreeRequired;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormError('');
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, specialties });
      toast.success(t.register.successMsg);
      router.replace('/dashboard');
    } catch (err) {
      setFormError(getApiError(err, t.register.fallbackError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink text-bone lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grain-layer" />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
        />
        <p className="eyebrow relative text-volt">
          <span className="h-px w-8 bg-volt" />
          {t.register.eyebrow}
        </p>
        <div className="relative">
          <h1 className="font-display text-7xl leading-[0.92] tracking-wide xl:text-8xl">
            {t.register.brandTitle1}
            <br />
            {t.register.brandTitle2}
            <br />
            <span className="text-volt">{t.register.brandTitle3}</span>
          </h1>
          <ul className="mt-8 space-y-3">
            {t.register.benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-bone/70">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-volt text-ink">
                  <Check className="h-3.5 w-3.5" strokeWidth={4} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[12px] uppercase tracking-[0.18em] text-bone/35">
          {t.register.brandTagline}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-bone px-5 py-14">
        <div className="w-full max-w-md">
          <h2 className="font-display text-5xl leading-none tracking-wide">{t.register.title}</h2>
          <p className="mt-2 text-sm text-ink/55">
            {t.register.hasAccount}{' '}
            <Link href="/login" className="font-semibold text-ink underline hover:text-ink/70">
              {t.register.logIn}
            </Link>
          </p>

          {formError && (
            <div className="mt-6 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="reg-name">
                {t.register.nameLabel}
              </label>
              <input
                id="reg-name"
                className={cn('field-input', errors.name && 'field-input-invalid')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: '' }));
                }}
                placeholder={t.register.namePlaceholder}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="reg-email">
                {t.register.emailLabel}
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                className={cn('field-input', errors.email && 'field-input-invalid')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder={t.register.emailPlaceholder}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="reg-password">
                {t.register.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn('field-input pr-12', errors.password && 'field-input-invalid')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder={t.register.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? t.register.hidePassword : t.register.showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 transition-colors duration-200 hover:text-ink"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div>
              <label className="field-label">{t.register.specialtiesLabel}</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((s) => {
                  const active = specialties.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={cn(
                        'chip border transition-colors duration-200',
                        active
                          ? 'border-ink bg-ink text-volt'
                          : 'border-ink/20 text-ink/60 hover:border-ink/50'
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {errors.specialties && <p className="field-error">{errors.specialties}</p>}
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setAgree((v) => !v);
                  setErrors((p) => ({ ...p, agree: '' }));
                }}
                className="flex items-start gap-3 text-left"
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-200',
                    agree ? 'border-ink bg-ink' : 'border-ink/30'
                  )}
                >
                  {agree && <Check className="h-3.5 w-3.5 text-volt" strokeWidth={4} />}
                </span>
                <span className="text-sm text-ink/65">{t.register.agreeText}</span>
              </button>
              {errors.agree && <p className="field-error">{errors.agree}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn btn-dark w-full">
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-bone border-t-transparent" />
              ) : (
                <>
                  {t.register.submit}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
