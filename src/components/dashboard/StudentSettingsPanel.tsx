'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Camera, UserCircle } from 'lucide-react';
import { useLanguage, useT } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { cn, getApiError, resolveImage } from '../../lib/format';
import api from '../../api/client';
import ImageCropModal from '../ImageCropModal';

export default function StudentSettingsPanel({ onPhotoChange }: { onPhotoChange?: (url: string) => void }) {
  const t = useT();
  const td = t.dashboard;
  const { lang, setLang } = useLanguage();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    api
      .get<{ email: string; profilePhoto: string }>('/student/profile')
      .then(({ data }) => { setEmail(data.email); setPhoto(data.profilePhoto); })
      .catch(() => {});
  }, []);

  async function uploadBlob(blob: Blob) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('profilePhoto', blob, 'avatar.jpg');
      const { data } = await api.post<{ profilePhoto: string }>('/student/profile', fd);
      setPhoto(data.profilePhoto);
      onPhotoChange?.(data.profilePhoto);
      setPendingFile(null);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUploading(false);
    }
  }

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

  const img = resolveImage(photo);

  return (
    <div className="space-y-6">
      <div className="border border-ink/10 bg-white p-6">
        <h2 className="font-display text-2xl tracking-wide">{td.settings}</h2>
        <p className="mt-1 text-sm text-ink/50">{td.settingsDesc}</p>
      </div>

      {/* Profile photo */}
      <div className="border border-ink/10 bg-white p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">{td.profilePhoto}</h3>
        <div className="mt-4 flex items-center gap-5">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-bone">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-full w-full text-ink/20" strokeWidth={1} />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPendingFile(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn btn-outline-dark flex items-center gap-2 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            {uploading ? td.uploading : td.changePhoto}
          </button>
        </div>
      </div>

      {/* Account — email & password */}
      <div className="border border-ink/10 bg-white p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">{td.account}</h3>
        <p className="mt-1 mb-4 text-sm text-ink/55">{td.accountDesc}</p>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="s-acct-email">{td.emailLabel}</label>
            <input
              id="s-acct-email"
              type="email"
              autoComplete="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="s-acct-pw">{td.newPassword}</label>
              <input
                id="s-acct-pw"
                type="password"
                autoComplete="new-password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={td.passwordHint}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="s-acct-confirm">{td.confirmPassword}</label>
              <input
                id="s-acct-confirm"
                type="password"
                autoComplete="new-password"
                className="field-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="s-acct-current">{td.currentPassword}</label>
            <input
              id="s-acct-current"
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

      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          title={td.adjustPhoto}
          zoomLabel={td.zoom}
          saveLabel={td.apply}
          cancelLabel={td.cancel}
          onCancel={() => setPendingFile(null)}
          onSave={uploadBlob}
        />
      )}
    </div>
  );
}
