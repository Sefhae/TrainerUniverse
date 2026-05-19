'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, AlertCircle, Check, Pencil, Trash2,
} from 'lucide-react';
import api from '../../api/client';
import { useT } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../lib/format';
import type { TrainingSession } from '../../types';

interface Student { id: number; name: string; }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toLocalDatetimeString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface SessionFormState {
  studentId: string;
  title: string;
  scheduledAt: string;
  durationMin: string;
  notes: string;
}

interface ChangeRequestFormState {
  proposedAt: string;
  message: string;
}

interface ModalState {
  type: 'add' | 'edit' | 'changeRequest';
  session?: TrainingSession;
}

export default function TrainingCalendar({ role = 'trainer', studentId: myStudentId, trainerId: myTrainerId }: {
  role?: 'trainer' | 'student';
  studentId?: number;
  trainerId?: number;
}) {
  const t = useT();
  const toast = useToast();
  const today = new Date();

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [form, setForm] = useState<SessionFormState>({
    studentId: '', title: '', scheduledAt: '', durationMin: '60', notes: '',
  });
  const [crForm, setCrForm] = useState<ChangeRequestFormState>({ proposedAt: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<TrainingSession[]>('/sessions');
      setSessions(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (role === 'trainer') {
      api.get<Student[]>('/trainer/students').then(({ data }) => setStudents(data)).catch(() => {});
    }
  }, [role]);

  // Calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function sessionsOnDay(d: Date) {
    return sessions.filter((s) => isSameDay(new Date(s.scheduledAt), d));
  }

  function openAdd(day: Date) {
    if (role !== 'trainer') return;
    if (students.length === 0) {
      toast.error(t.sessionCalendar.noStudentsEnrolled);
      return;
    }
    const dt = new Date(day);
    dt.setHours(9, 0, 0, 0);
    setForm({
      studentId: students[0]?.id.toString() ?? '',
      title: '',
      scheduledAt: toLocalDatetimeString(dt),
      durationMin: '60',
      notes: '',
    });
    setModal({ type: 'add' });
  }

  function openEdit(s: TrainingSession) {
    if (role !== 'trainer') return;
    setForm({
      studentId: s.studentId.toString(),
      title: s.title,
      scheduledAt: toLocalDatetimeString(new Date(s.scheduledAt)),
      durationMin: s.durationMin.toString(),
      notes: s.notes,
    });
    setModal({ type: 'edit', session: s });
  }

  function openChangeRequest(s: TrainingSession) {
    setCrForm({ proposedAt: toLocalDatetimeString(new Date(s.scheduledAt)), message: '' });
    setModal({ type: 'changeRequest', session: s });
  }

  async function saveSession() {
    if (!form.scheduledAt || !form.studentId) return;
    setSaving(true);
    try {
      if (modal?.type === 'add') {
        await api.post('/sessions', {
          studentId: Number(form.studentId),
          title: form.title || undefined,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMin: Number(form.durationMin),
          notes: form.notes,
        });
      } else if (modal?.type === 'edit' && modal.session) {
        await api.put(`/sessions/${modal.session.id}`, {
          title: form.title || undefined,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMin: Number(form.durationMin),
          notes: form.notes,
        });
      }
      setModal(null);
      load();
    } catch {
      toast.error('Error saving session.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSession(id: number) {
    setDeleting(id);
    try {
      await api.delete(`/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Error deleting session.');
    } finally {
      setDeleting(null);
    }
  }

  async function submitChangeRequest() {
    if (!modal?.session || !crForm.proposedAt) return;
    setSaving(true);
    try {
      await api.post(`/sessions/${modal.session.id}/change-requests`, {
        proposedAt: new Date(crForm.proposedAt).toISOString(),
        message: crForm.message,
      });
      toast.success(t.sessionCalendar.changeRequestSent);
      setModal(null);
      load();
    } catch {
      toast.error('Error submitting request.');
    } finally {
      setSaving(false);
    }
  }

  async function respondToRequest(crId: number, action: 'approve' | 'reject') {
    try {
      await api.put(`/change-requests/${crId}`, { action });
      load();
    } catch {
      toast.error('Error responding to request.');
    }
  }

  const daySessionsSelected = selectedDay ? sessionsOnDay(selectedDay) : [];

  function statusColor(status: string) {
    if (status === 'confirmed') return 'bg-volt text-ink';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between border border-ink/10 bg-white px-4 py-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 text-ink/50 transition hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl tracking-wide">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded border border-ink/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink/55 hover:text-ink"
          >
            {t.sessionCalendar.today}
          </button>
        </div>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 text-ink/50 transition hover:text-ink"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="border border-ink/10 bg-white">
          <div className="grid grid-cols-7 border-b border-ink/10">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-widest text-ink/40">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="border-b border-r border-ink/5 min-h-[80px]" />;
              const daySessionsList = sessionsOnDay(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const hasPending = daySessionsList.some((s) => s.pendingChangeRequest);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'min-h-[80px] cursor-pointer border-b border-r border-ink/5 p-1.5 transition-colors',
                    isSelected ? 'bg-volt/10 ring-1 ring-inset ring-volt' : 'hover:bg-ink/[0.02]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center text-sm font-semibold',
                        isToday ? 'bg-ink text-bone rounded-full' : 'text-ink/70'
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {hasPending && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {daySessionsList.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className={cn('truncate rounded px-1 py-0.5 text-[10px] font-semibold', statusColor(s.status))}
                      >
                        {s.studentName} — {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ))}
                    {daySessionsList.length > 2 && (
                      <div className="px-1 text-[10px] text-ink/40">+{daySessionsList.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div ref={panelRef} className="border border-ink/10 bg-white">
          {selectedDay ? (
            <>
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                    {selectedDay.toLocaleDateString('default', { weekday: 'long' })}
                  </p>
                  <p className="font-display text-lg leading-tight">
                    {selectedDay.toLocaleDateString('default', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                {role === 'trainer' && (
                  <button
                    onClick={() => openAdd(selectedDay)}
                    className="flex items-center gap-1.5 bg-volt px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition hover:bg-volt/80"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t.sessionCalendar.addSession}
                  </button>
                )}
              </div>

              <div className="divide-y divide-ink/8">
                {daySessionsList.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-ink/40">
                    {t.sessionCalendar.noSessions}
                  </p>
                ) : (
                  daySessionsList.map((s) => (
                    <div key={s.id} className="px-4 py-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight">{s.title}</p>
                          <p className="text-sm text-ink/55">{s.studentName}</p>
                        </div>
                        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', statusColor(s.status))}>
                          {t.sessionCalendar[s.status as 'confirmed' | 'pending' | 'cancelled']}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-ink/50">
                        <Clock className="h-3 w-3" />
                        {new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}{s.durationMin} min
                      </div>

                      {s.notes && <p className="text-xs text-ink/60 italic">{s.notes}</p>}

                      {/* Pending change request */}
                      {s.pendingChangeRequest && (
                        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs space-y-1">
                          <p className="font-semibold text-amber-700 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {t.sessionCalendar.pendingRequest}
                          </p>
                          <p className="text-amber-600">
                            {t.sessionCalendar.proposedBy}: {s.pendingChangeRequest.requestedBy}
                          </p>
                          <p className="text-amber-600">
                            → {new Date(s.pendingChangeRequest.proposedAt).toLocaleString()}
                          </p>
                          {s.pendingChangeRequest.message && (
                            <p className="text-amber-600 italic">"{s.pendingChangeRequest.message}"</p>
                          )}
                          {/* Show approve/reject to the OTHER party */}
                          {((role === 'trainer' && s.pendingChangeRequest.requestedBy === 'student') ||
                            (role === 'student' && s.pendingChangeRequest.requestedBy === 'trainer')) && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => respondToRequest(s.pendingChangeRequest!.id, 'approve')}
                                className="flex items-center gap-1 bg-green-600 px-2 py-1 text-white font-semibold"
                              >
                                <Check className="h-3 w-3" /> {t.sessionCalendar.approve}
                              </button>
                              <button
                                onClick={() => respondToRequest(s.pendingChangeRequest!.id, 'reject')}
                                className="flex items-center gap-1 border border-red-300 px-2 py-1 text-red-600 font-semibold"
                              >
                                <X className="h-3 w-3" /> {t.sessionCalendar.reject}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {role === 'trainer' && (
                          <>
                            <button
                              onClick={() => openEdit(s)}
                              className="flex items-center gap-1.5 border border-ink/15 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:text-ink"
                            >
                              <Pencil className="h-3 w-3" /> {t.sessionCalendar.editSession}
                            </button>
                            <button
                              onClick={() => deleteSession(s.id)}
                              disabled={deleting === s.id}
                              className="flex items-center gap-1.5 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-500 hover:border-red-400 disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              {deleting === s.id ? '…' : t.sessionCalendar.deleteSession}
                            </button>
                          </>
                        )}
                        {!s.pendingChangeRequest && (
                          <button
                            onClick={() => openChangeRequest(s)}
                            className="flex items-center gap-1.5 border border-ink/15 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:text-ink"
                          >
                            {t.sessionCalendar.requestChange}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-ink/35">
              ← Select a day to see sessions
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add / Edit session */}
      {modal && (modal.type === 'add' || modal.type === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg tracking-wide">
                {modal.type === 'add' ? t.sessionCalendar.addSession : t.sessionCalendar.editSession}
              </h3>
              <button onClick={() => setModal(null)} className="text-ink/40 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {modal.type === 'add' && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                    {t.sessionCalendar.student}
                  </label>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                    className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t.sessionCalendar.sessionTitle}
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Training Session"
                  className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t.sessionCalendar.scheduledAt}
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t.sessionCalendar.duration}
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.durationMin}
                  onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
                  className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t.sessionCalendar.notes}
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/10 px-5 py-4">
              <button onClick={() => setModal(null)} className="btn btn-outline-dark">
                {t.sessionCalendar.cancel}
              </button>
              <button onClick={saveSession} disabled={saving} className="btn btn-dark disabled:opacity-50">
                {saving ? '…' : t.sessionCalendar.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change request */}
      {modal?.type === 'changeRequest' && modal.session && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h3 className="font-display text-lg tracking-wide">{t.sessionCalendar.requestChange}</h3>
              <button onClick={() => setModal(null)} className="text-ink/40 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t.sessionCalendar.proposedDate}
                </label>
                <input
                  type="datetime-local"
                  value={crForm.proposedAt}
                  onChange={(e) => setCrForm((f) => ({ ...f, proposedAt: e.target.value }))}
                  className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                  {t.sessionCalendar.changeMessage}
                </label>
                <textarea
                  value={crForm.message}
                  onChange={(e) => setCrForm((f) => ({ ...f, message: e.target.value }))}
                  rows={2}
                  className="w-full border border-ink/20 bg-bone px-3 py-2 text-sm focus:border-ink focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/10 px-5 py-4">
              <button onClick={() => setModal(null)} className="btn btn-outline-dark">
                {t.sessionCalendar.cancel}
              </button>
              <button onClick={submitChangeRequest} disabled={saving || !crForm.proposedAt} className="btn btn-dark disabled:opacity-50">
                {saving ? '…' : t.sessionCalendar.requestChange}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
