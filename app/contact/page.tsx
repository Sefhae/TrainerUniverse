'use client';

import { useState } from 'react';
import { Mail, Clock, CheckCircle, Send } from 'lucide-react';
import { useT } from '../../src/hooks/useLanguage';
import { cn } from '../../src/lib/format';
import api from '../../src/api/client';

const inputCls =
  'w-full border border-content/10 bg-content/5 px-4 py-3 text-sm text-content placeholder-content/30 transition-colors focus:border-volt/50 focus:outline-none';

export default function ContactPage() {
  const t = useT();
  const c = t.contact;

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    if (!form.name.trim()) return c.nameRequired;
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return c.emailInvalid;
    if (!form.message.trim()) return c.messageRequired;
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSending(true);
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch {
      setError(c.fallbackError);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-content">
      {/* Hero */}
      <section className="border-b border-content/8 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-accent">{c.eyebrow}</p>
          <h1 className="font-display text-5xl tracking-wide md:text-6xl">{c.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-content/55">{c.desc}</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">

          {/* Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center gap-5 py-16 text-center">
                <CheckCircle className="h-14 w-14 text-accent" />
                <h2 className="font-display text-3xl tracking-wide">{c.successTitle}</h2>
                <p className="max-w-sm text-content/55">{c.successDesc}</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-2 text-sm font-semibold text-accent hover:underline"
                >
                  {c.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-content/40">
                      {c.nameLabel}
                    </label>
                    <input
                      className={inputCls}
                      placeholder={c.namePlaceholder}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-content/40">
                      {c.emailLabel}
                    </label>
                    <input
                      type="email"
                      className={inputCls}
                      placeholder={c.emailPlaceholder}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-content/40">
                    {c.subjectLabel}
                  </label>
                  <input
                    className={inputCls}
                    placeholder={c.subjectPlaceholder}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-content/40">
                    {c.messageLabel}
                  </label>
                  <textarea
                    rows={6}
                    className={cn(inputCls, 'resize-none')}
                    placeholder={c.messagePlaceholder}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {error && (
                  <p className="rounded border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-volt flex items-center gap-2 px-8 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {sending ? c.sending : c.submit}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-6">
            <div className="border border-content/10 bg-content/[0.03] p-6">
              <p className="mb-5 text-xs font-bold uppercase tracking-widest text-content/40">{c.infoTitle}</p>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-volt/10">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-content/35">Email</p>
                    <a
                      href="mailto:support@traineruniverse.com"
                      className="mt-0.5 block text-sm text-content/80 hover:text-accent"
                    >
                      {c.emailInfo}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-volt/10">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-content/35">{c.hoursTitle}</p>
                    <p className="mt-0.5 text-sm text-content/80">{c.hoursInfo}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-content/10 bg-content/[0.03] p-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-content/40">Quick links</p>
              <div className="space-y-2">
                {[
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Find a Trainer', href: '/trainers' },
                  { label: 'Become a Trainer', href: '/register' },
                ].map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center justify-between text-sm text-content/60 hover:text-accent"
                  >
                    {label}
                    <span className="text-content/30">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
