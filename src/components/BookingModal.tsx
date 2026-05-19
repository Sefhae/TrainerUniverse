'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, LogIn } from 'lucide-react';
import Modal from './Modal';
import api from '../api/client';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { cn, formatPrice } from '../lib/format';
import type { PricingPackage } from '../types';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  trainerId: number;
  trainerName: string;
  packages: PricingPackage[];
}

export default function BookingModal({
  open,
  onClose,
  trainerId,
  trainerName,
  packages,
}: BookingModalProps) {
  const { isAuthenticated } = useStudentAuth();
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function handleClose() {
    setSelectedPkg(null);
    setMessage('');
    setError('');
    setDone(false);
    onClose();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/session-requests', {
        trainerId,
        packageId: selectedPkg,
        message: message.trim(),
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Book a Session" subtitle={`Request a session with ${trainerName}`} size="md">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center bg-ink text-volt">
            <LogIn className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-ink">Login required</p>
            <p className="mt-1 text-sm text-ink/55">
              You need a student account to book a session.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/student/login" className="btn btn-dark" onClick={handleClose}>
              Log In
            </Link>
            <Link href="/student/register" className="btn btn-outline-dark" onClick={handleClose}>
              Register
            </Link>
          </div>
        </div>
      ) : done ? (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center bg-volt text-ink">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-ink">Request sent!</p>
            <p className="mt-1 text-sm text-ink/55">
              {trainerName} will review your request and get back to you.
            </p>
          </div>
          <button onClick={handleClose} className="btn btn-dark">
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {/* Package selection */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
              Select a Package
            </p>
            {packages.length === 0 ? (
              <p className="text-sm text-ink/50">This trainer has no packages listed yet.</p>
            ) : (
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkg(pkg.id === selectedPkg ? null : pkg.id)}
                    className={cn(
                      'w-full border p-4 text-left transition-colors duration-150',
                      selectedPkg === pkg.id
                        ? 'border-ink bg-ink text-bone'
                        : 'border-ink/15 bg-white hover:border-ink/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-snug">{pkg.name}</p>
                        {pkg.description && (
                          <p className={cn('mt-0.5 text-sm', selectedPkg === pkg.id ? 'text-bone/65' : 'text-ink/55')}>
                            {pkg.description}
                          </p>
                        )}
                        <p className={cn('mt-1 text-xs font-semibold', selectedPkg === pkg.id ? 'text-bone/50' : 'text-ink/40')}>
                          {pkg.sessions} {pkg.sessions === 1 ? 'session' : 'sessions'}
                        </p>
                      </div>
                      <p className={cn('shrink-0 font-display text-2xl leading-none', selectedPkg === pkg.id ? 'text-volt' : 'text-ink')}>
                        {formatPrice(pkg.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="field-label" htmlFor="booking-message">
              Message <span className="font-normal normal-case tracking-normal text-ink/40">(optional)</span>
            </label>
            <textarea
              id="booking-message"
              rows={3}
              className="field-input resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the trainer about your goals..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn btn-outline-dark flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-volt flex-1"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
