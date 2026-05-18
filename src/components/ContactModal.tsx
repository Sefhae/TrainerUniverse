'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import Modal from './Modal';
import { useToast } from '../hooks/useToast';
import { cn } from '../lib/format';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  trainerName: string;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function ContactModal({ open, onClose, trainerName }: ContactModalProps) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'Tell the trainer a little more (10+ characters).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setForm({ name: '', email: '', message: '' });
      setErrors({});
      toast.success(`Your message has been sent to ${trainerName}.`);
      onClose();
    }, 850);
  };

  return (
    <Modal open={open} onClose={onClose} title="Book a Call" subtitle={`Reach out to ${trainerName}`}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className="field-label" htmlFor="contact-name">
            Your Name
          </label>
          <input
            id="contact-name"
            className={cn('field-input', errors.name && 'field-input-invalid')}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Jordan Avery"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="contact-email">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            className={cn('field-input', errors.email && 'field-input-invalid')}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={4}
            className={cn('field-input resize-none', errors.message && 'field-input-invalid')}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Tell the trainer about your goals and what you're looking for..."
          />
          {errors.message && <p className="field-error">{errors.message}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn btn-outline-dark flex-1">
            Cancel
          </button>
          <button type="submit" disabled={sending} className="btn btn-volt flex-1">
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
