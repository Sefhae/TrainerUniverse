'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, CalendarDays,
  LogOut, Trash2, Eye, EyeOff, ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../../../src/hooks/useAdminAuth';
import api from '../../../src/api/client';
import { cn } from '../../../src/lib/format';

type Section = 'overview' | 'trainers' | 'students' | 'sessions';

interface Stats {
  trainers: number;
  published: number;
  students: number;
  sessions: number;
  messages: number;
}

interface AdminTrainer {
  id: number;
  name: string;
  email: string;
  specialties: string | null;
  is_published: number;
  student_count: number;
  session_count: number;
  created_at: string;
}

interface AdminStudent {
  id: number;
  name: string;
  email: string;
  trainer_name: string | null;
  session_count: number;
  created_at: string;
}

interface AdminSession {
  id: number;
  title: string;
  trainer_name: string;
  student_name: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
}

const NAV: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'trainers',  label: 'Trainers',  icon: Users },
  { id: 'students',  label: 'Students',  icon: GraduationCap },
  { id: 'sessions',  label: 'Sessions',  icon: CalendarDays },
];

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-volt" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'confirmed' ? 'bg-volt/20 text-volt' :
    status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
    'bg-yellow-500/20 text-yellow-400';
  return (
    <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', cls)}>
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { isAuthenticated, logout } = useAdminAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');

  const [stats, setStats] = useState<Stats | null>(null);
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/admin/login');
  }, [isAuthenticated, router]);

  const loadStats = useCallback(async () => {
    const { data } = await api.get<Stats>('/admin/stats');
    setStats(data);
  }, []);

  const loadTrainers = useCallback(async () => {
    const { data } = await api.get<AdminTrainer[]>('/admin/trainers');
    setTrainers(data);
  }, []);

  const loadStudents = useCallback(async () => {
    const { data } = await api.get<AdminStudent[]>('/admin/students');
    setStudents(data);
  }, []);

  const loadSessions = useCallback(async () => {
    const { data } = await api.get<AdminSession[]>('/admin/sessions');
    setSessions(data);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    const load = async () => {
      try {
        await Promise.all([loadStats(), loadTrainers(), loadStudents(), loadSessions()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, loadStats, loadTrainers, loadStudents, loadSessions]);

  async function deleteTrainer(id: number) {
    if (!confirm('Delete this trainer and all their data?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/trainers/${id}`);
      setTrainers((p) => p.filter((t) => t.id !== id));
      loadStats();
    } finally {
      setDeleting(null);
    }
  }

  async function togglePublished(trainer: AdminTrainer) {
    setToggling(trainer.id);
    try {
      await api.put(`/admin/trainers/${trainer.id}`, { isPublished: !trainer.is_published });
      setTrainers((p) => p.map((t) => t.id === trainer.id ? { ...t, is_published: t.is_published ? 0 : 1 } : t));
    } finally {
      setToggling(null);
    }
  }

  async function deleteStudent(id: number) {
    if (!confirm('Delete this student and all their data?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/students/${id}`);
      setStudents((p) => p.filter((s) => s.id !== id));
      loadStats();
    } finally {
      setDeleting(null);
    }
  }

  async function deleteSession(id: number) {
    if (!confirm('Delete this session?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/sessions/${id}`);
      setSessions((p) => p.filter((s) => s.id !== id));
      loadStats();
    } finally {
      setDeleting(null);
    }
  }

  function handleLogout() {
    logout();
    router.replace('/admin/login');
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-bone">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/8 bg-ink">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-white/8 px-5 py-5">
          <ShieldCheck className="h-5 w-5 text-volt" />
          <span className="font-display text-lg tracking-wide">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors',
                section === id ? 'bg-volt text-ink' : 'text-bone/55 hover:bg-white/5 hover:text-bone'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/8 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold text-bone/40 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">

          {/* ── Overview ── */}
          {section === 'overview' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Overview</h1>
              <p className="mt-1 text-sm text-bone/40">Platform-wide statistics</p>

              {loading ? <Spinner /> : stats && (
                <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { label: 'Trainers',  value: stats.trainers  },
                    { label: 'Published', value: stats.published },
                    { label: 'Students',  value: stats.students  },
                    { label: 'Sessions',  value: stats.sessions  },
                    { label: 'Messages',  value: stats.messages  },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-white/10 bg-white/4 p-5">
                      <p className="font-display text-4xl tabular-nums text-volt">{value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-bone/40">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {/* Recent trainers */}
                <div className="border border-white/10">
                  <div className="border-b border-white/10 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-bone/40">Recent Trainers</p>
                  </div>
                  <div className="divide-y divide-white/8">
                    {trainers.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-bone/40">{t.email}</p>
                        </div>
                        <span className={cn('text-[10px] font-bold uppercase', t.is_published ? 'text-volt' : 'text-bone/30')}>
                          {t.is_published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent students */}
                <div className="border border-white/10">
                  <div className="border-b border-white/10 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-bone/40">Recent Students</p>
                  </div>
                  <div className="divide-y divide-white/8">
                    {students.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold">{s.name}</p>
                          <p className="text-xs text-bone/40">{s.email}</p>
                        </div>
                        <span className="text-xs text-bone/40">{s.trainer_name ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Trainers ── */}
          {section === 'trainers' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Trainers</h1>
              <p className="mt-1 text-sm text-bone/40">{trainers.length} total</p>

              {loading ? <Spinner /> : (
                <div className="mt-8 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-white/4 text-left">
                      <tr>
                        {['ID', 'Name', 'Email', 'Specialties', 'Status', 'Students', 'Sessions', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-bone/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {trainers.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-bone/40">{t.id}</td>
                          <td className="px-4 py-3 font-semibold">{t.name}</td>
                          <td className="px-4 py-3 text-bone/60">{t.email}</td>
                          <td className="px-4 py-3 text-bone/50 text-xs">{t.specialties || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={cn('text-[10px] font-bold uppercase', t.is_published ? 'text-volt' : 'text-bone/30')}>
                              {t.is_published ? 'Live' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{t.student_count}</td>
                          <td className="px-4 py-3 text-center">{t.session_count}</td>
                          <td className="px-4 py-3 text-xs text-bone/40">
                            {new Date(t.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePublished(t)}
                                disabled={toggling === t.id}
                                title={t.is_published ? 'Unpublish' : 'Publish'}
                                className="p-1.5 text-bone/40 hover:text-volt disabled:opacity-40"
                              >
                                {t.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => deleteTrainer(t.id)}
                                disabled={deleting === t.id}
                                className="p-1.5 text-bone/40 hover:text-red-400 disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Students ── */}
          {section === 'students' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Students</h1>
              <p className="mt-1 text-sm text-bone/40">{students.length} total</p>

              {loading ? <Spinner /> : (
                <div className="mt-8 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-white/4 text-left">
                      <tr>
                        {['ID', 'Name', 'Email', 'Trainer', 'Sessions', 'Joined', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-bone/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-bone/40">{s.id}</td>
                          <td className="px-4 py-3 font-semibold">{s.name}</td>
                          <td className="px-4 py-3 text-bone/60">{s.email}</td>
                          <td className="px-4 py-3 text-bone/50">{s.trainer_name ?? '—'}</td>
                          <td className="px-4 py-3 text-center">{s.session_count}</td>
                          <td className="px-4 py-3 text-xs text-bone/40">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deleteStudent(s.id)}
                              disabled={deleting === s.id}
                              className="p-1.5 text-bone/40 hover:text-red-400 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Sessions ── */}
          {section === 'sessions' && (
            <div>
              <h1 className="font-display text-4xl tracking-wide">Sessions</h1>
              <p className="mt-1 text-sm text-bone/40">{sessions.length} total</p>

              {loading ? <Spinner /> : (
                <div className="mt-8 overflow-x-auto border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="border-b border-white/10 bg-white/4 text-left">
                      <tr>
                        {['ID', 'Title', 'Trainer', 'Student', 'Scheduled', 'Duration', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-bone/40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-bone/40">{s.id}</td>
                          <td className="px-4 py-3 font-semibold">{s.title}</td>
                          <td className="px-4 py-3 text-bone/60">{s.trainer_name}</td>
                          <td className="px-4 py-3 text-bone/60">{s.student_name}</td>
                          <td className="px-4 py-3 text-xs text-bone/50">
                            {new Date(s.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="px-4 py-3 text-bone/50">{s.duration_min} min</td>
                          <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deleteSession(s.id)}
                              disabled={deleting === s.id}
                              className="p-1.5 text-bone/40 hover:text-red-400 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
