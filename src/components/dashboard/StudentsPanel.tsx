'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import api from '../../api/client';
import { useT } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

interface Student {
  id: number;
  name: string;
  email: string;
  enrolledAt: string;
  sessionCount: number;
}

export default function StudentsPanel() {
  const t = useT();
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

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
      showToast(t.students.addSuccess, 'success');
      setEmail('');
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg?.includes('already')) showToast(t.students.alreadyEnrolled, 'error');
      else if (msg?.includes('No student')) showToast(t.students.notFound, 'error');
      else showToast(msg || 'Error', 'error');
    } finally {
      setEnrolling(false);
    }
  }

  async function remove(studentId: number) {
    setRemoving(studentId);
    try {
      await api.delete(`/trainer/students?studentId=${studentId}`);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch {
      showToast('Error removing student.', 'error');
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add student */}
      <div className="border border-ink/10 bg-white p-5">
        <h2 className="mb-4 font-display text-xl tracking-wide">{t.students.addStudent}</h2>
        <form onSubmit={enroll} className="flex gap-3">
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
            className="btn btn-dark flex items-center gap-2 disabled:opacity-50"
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
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-volt font-display text-base font-bold text-ink">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s.name}</p>
                <p className="truncate text-sm text-ink/55">{s.email}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-volt">
                  {s.sessionCount} {t.students.sessionCount}
                </p>
                <p className="text-xs text-ink/40">
                  {t.students.enrolledSince}{' '}
                  {new Date(s.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => remove(s.id)}
                disabled={removing === s.id}
                className="shrink-0 p-2 text-ink/30 transition-colors hover:text-red-500 disabled:opacity-50"
                aria-label={t.students.removeStudent}
              >
                {removing === s.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink block" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
