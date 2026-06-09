'use client';

import { useState, type FormEvent } from 'react';
import { useLanguage, useT } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn, getApiError } from '@/lib/format';
import api from '@/lib/client';

export default function SettingsPanel() {
  const t = useT();
  const td = t.dashboard;
  const { lang, setLang } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (password && password !== confirm) {
      toast.error(td.passwordMismatch);
      return;
    }
    setSaving(true);
    try {
      await api.put('/account', {
        currentPassword,
        email: email.trim(),
        ...(password ? { password } : {}),
      });
      toast.success(td.accountUpdated);
      setCurrentPassword('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-ink/10 bg-white p-6">
        <h2 className="font-display text-2xl tracking-wide">{td.settings}</h2>
        <p className="mt-1 text-sm text-ink/50">{td.settingsDesc}</p>
      </div>

      {/* Account — email & password */}
      <div className="border border-ink/10 bg-white p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">{td.account}</h3>
        <p className="mt-1 mb-4 text-sm text-ink/55">{td.accountDesc}</p>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="acct-email">{td.emailLabel}</label>
            <input
              id="acct-email"
              type="email"
              autoComplete="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="acct-pw">{td.newPassword}</label>
              <input
                id="acct-pw"
                type="password"
                autoComplete="new-password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={td.passwordHint}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="acct-confirm">{td.confirmPassword}</label>
              <input
                id="acct-confirm"
                type="password"
                autoComplete="new-password"
                className="field-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="acct-current">{td.currentPassword}</label>
            <input
              id="acct-current"
              type="password"
              autoComplete="current-password"
              className="field-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-ink/45">{td.currentPasswordHint}</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !currentPassword} className="btn btn-dark disabled:opacity-50">
              {saving ? '…' : td.saveChanges}
            </button>
          </div>
        </form>
      </div>

      {/* Language */}
      <div className="border border-ink/10 bg-white p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">{td.language}</h3>
        <p className="mt-1 mb-4 text-sm text-ink/55">{td.languageDesc}</p>
        <div className="flex flex-wrap gap-3">
          {([
            { id: 'en', label: 'English' },
            { id: 'tr', label: 'Türkçe' },
            { id: 'es', label: 'Español' },
          ] as const).map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={cn(
                'border px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors duration-200',
                lang === l.id
                  ? 'border-ink bg-ink text-volt'
                  : 'border-ink/20 bg-white text-ink/50 hover:border-ink/50 hover:text-ink'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
