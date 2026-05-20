'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { LogIn, Send } from 'lucide-react';
import Modal from './Modal';
import api from '../api/client';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { cn } from '../lib/format';

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  trainerId: number;
  trainerName: string;
}

export default function MessageModal({ open, onClose, trainerId, trainerName }: MessageModalProps) {
  const { isAuthenticated, studentId } = useStudentAuth();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setContent('');
    setSent(false);
    setError('');
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !studentId) return;
    setSending(true);
    setError('');
    try {
      await api.post(`/messages/${trainerId}/${studentId}`, { content: content.trim() });
      setSent(true);
      setContent('');
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Message ${trainerName}`} subtitle="Start a conversation">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-volt/15">
            <LogIn className="h-6 w-6 text-volt" />
          </div>
          <p className="text-sm text-ink/65">You need to be logged in as a student to message trainers.</p>
          <Link href="/login" onClick={handleClose} className="btn btn-volt w-full">
            Log In
          </Link>
        </div>
      ) : sent ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-volt/15">
            <Send className="h-6 w-6 text-volt" />
          </div>
          <p className="font-semibold text-ink">Message sent!</p>
          <p className="text-sm text-ink/55">
            {trainerName} will reply in your dashboard messages.
          </p>
          <div className="flex w-full gap-3">
            <button onClick={() => setSent(false)} className="btn btn-outline-dark flex-1">
              Send another
            </button>
            <button onClick={handleClose} className="btn btn-volt flex-1">
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="msg-content">
              Your message
            </label>
            <textarea
              id="msg-content"
              rows={5}
              className={cn('field-input resize-none', error && 'field-input-invalid')}
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(''); }}
              placeholder={`Hi ${trainerName}, I'm interested in...`}
            />
            {error && <p className="field-error">{error}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn btn-outline-dark flex-1">
              Cancel
            </button>
            <button type="submit" disabled={sending || !content.trim()} className="btn btn-volt flex-1">
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
