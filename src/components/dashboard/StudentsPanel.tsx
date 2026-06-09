'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Users, Clock, ChevronRight } from 'lucide-react';
import api from '../../lib/client';
import { useT } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import Modal from '../Modal';

interface Student {
  id: number;
  name: string;
  email: string;
  enrolledAt: string;
  sessionCount: number;
  removalPending: boolean;
}

export default function StudentsPanel() {
  const t = useT();
  const toast = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [detail, setDetail] = useState<Student | null>(null);
  const [reason, setReason] = useState('');
  const [requesting, setRequesting] = useState(false);

  async function load() {
    try {
      const { data } = await api.get<Student[]>('/trainer/students');
      setStudents(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function enroll(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEnrolling(true);
    try {
      await api.post('/trainer/students', { email: email.trim() });
      toast.success(t.students.addSuccess);
      setEmail('');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg?.includes('already')) toast.error(t.students.alreadyEnrolled);
      else if (msg?.includes('No student')) toast.error(t.students.notFound);
      else toast.error(msg || 'Error');
    } finally {
      setEnrolling(false);
    }
  }

  async function requestRemoval() {
    if (!detail) return;
    setRequesting(true);
    try {
      await api.post('/trainer/students/removal', { studentId: detail.id, reason: reason.trim() });
      toast.success('Removal requested — pending TrainerUniverse approval.');
      setDetail(null);
      setReason('');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Error');
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add student */}
      <div className="border border-ink/10 bg-white p-5">
        <h2 className="mb-4 font-display text-xl tracking-wide">{t.students.addStudent}</h2>
        <form onSubmit={enroll} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.students.addByEmail}
            className="flex-1 border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={enrolling || !email.trim()}
            className="btn btn-dark flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {enrolling ? '…' : t.students.enrollBtn}
          </button>
        </form>
      </div>

      {/* Students list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-ink/20 py-16 text-center">
          <Users className="h-10 w-10 text-ink/25" />
          <p className="font-semibold">{t.students.noStudents}</p>
          <p className="max-w-xs text-sm text-ink/50">{t.students.noStudentsDesc}</p>
        </div>
      ) : (
        <div className="divide-y divide-ink/8 border border-ink/10 bg-white">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => { setReason(''); setDetail(s); }}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/[0.02]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-volt font-display text-base font-bold text-ink">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s.name}</p>
                <p className="truncate text-sm text-ink/55">{s.email}</p>
              </div>
              {s.removalPending && (
                <span className="hidden items-center gap-1 bg-yellow-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-yellow-700 sm:inline-flex">
                  <Clock className="h-3 w-3" /> Removal pending
                </span>
              )}
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-volt">
                  {s.sessionCount} {t.students.sessionCount}
                </p>
                <p className="text-xs text-ink/40">
                  {t.students.enrolledSince} {new Date(s.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink/30" />
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={detail !== null}
        onClose={() => { setDetail(null); setReason(''); }}
        title="Student Details"
        size="sm"
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-volt font-display text-xl font-bold text-ink">
                {detail.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl tracking-wide">{detail.name}</p>
                <p className="truncate text-sm text-ink/55">{detail.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-ink/10 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                  {t.students.sessionCount}
                </p>
                <p className="mt-1 font-display text-2xl">{detail.sessionCount}</p>
              </div>
              <div className="border border-ink/10 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                  {t.students.enrolledSince}
                </p>
                <p className="mt-1 text-sm font-semibold">{new Date(detail.enrolledAt).toLocaleDateString()}</p>
              </div>
            </div>

            {detail.removalPending ? (
              <div className="flex items-center gap-2 border border-yellow-300 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-700">
                <Clock className="h-4 w-4 shrink-0" />
                Removal request pending TrainerUniverse approval.
              </div>
            ) : (
              <div className="border-t border-ink/10 pt-4">
                <label className="field-label" htmlFor="removal-reason">
                  Reason for removal (optional)
                </label>
                <textarea
                  id="removal-reason"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="field-input resize-none"
                  placeholder="Why do you want to remove this student?"
                />
                <button
                  onClick={requestRemoval}
                  disabled={requesting}
                  className="btn mt-3 w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {requesting ? 'Requesting…' : 'Request Removal'}
                </button>
                <p className="mt-2 text-[11px] leading-relaxed text-ink/45">
                  A TrainerUniverse admin must approve the request before the student is removed from your roster.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
