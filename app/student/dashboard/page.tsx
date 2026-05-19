'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, MessageSquare, LogOut, LayoutDashboard,
  Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useStudentAuth } from '../../../src/hooks/useStudentAuth';
import { useT } from '../../../src/hooks/useLanguage';
import { cn, resolveImage } from '../../../src/lib/format';
import api from '../../../src/api/client';
import TrainingCalendar from '../../../src/components/dashboard/TrainingCalendar';
import MessagesPanel from '../../../src/components/dashboard/MessagesPanel';
import type { TrainingSession } from '../../../src/types';

type Section = 'overview' | 'calendar' | 'messages';

interface TrainerInfo {
  id: number;
  name: string;
  tagline: string;
  profilePhoto: string;
  specialties: { id: number; name: string }[];
}

export default function StudentDashboardPage() {
  const { user, studentId, isAuthenticated, logout } = useStudentAuth();
  const t = useT();
  const sp = t.studentPortal;
  const router = useRouter();
  const [section, setSection] = useState<Section>('overview');
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/student/login');
    }
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<TrainingSession[]>('/sessions');
      setSessions(data);
      if (data.length > 0) {
        const tId = data[0].trainerId;
        const { data: td } = await api.get<TrainerInfo>(`/trainers/${tId}`);
        setTrainer(td);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  function handleLogout() {
    logout();
    router.push('/student/login');
  }

  const now = new Date();
  const upcoming = sessions.filter(
    (s) => new Date(s.scheduledAt) >= now && s.status !== 'cancelled'
  );
  const completed = sessions.filter(
    (s) => new Date(s.scheduledAt) < now && s.status === 'confirmed'
  );
  const pendingChanges = sessions.filter((s) => s.pendingChangeRequest);

  const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: sp.overview, icon: LayoutDashboard },
    { id: 'calendar', label: t.sessionCalendar.title, icon: CalendarDays },
    { id: 'messages', label: t.chat.title, icon: MessageSquare },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bone">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <div className="bg-ink text-bone">
              {/* Student identity */}
              <div className="flex items-center gap-3 border-b border-white/10 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-volt font-display text-lg text-ink">
                  {(user?.email?.charAt(0) ?? 'S').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-tight">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="truncate text-xs text-bone/50">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 lg:shrink',
                        active
                          ? 'bg-volt text-ink'
                          : 'text-bone/65 hover:bg-white/5 hover:text-bone'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="border-t border-white/10 p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-bone/65 transition-colors duration-200 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {sp.logOut}
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {/* Page heading */}
            <div className="mb-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                {sp.dashboardTitle}
              </p>
              <h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">
                {user?.email?.split('@')[0]}
              </h1>
              <p className="mt-1 text-sm text-ink/55">{user?.email}</p>
            </div>

            {/* ── Overview ── */}
            {section === 'overview' && (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {([
                    { label: sp.totalSessions, value: sessions.length, icon: CalendarDays, color: 'text-ink' },
                    { label: sp.upcomingSessions, value: upcoming.length, icon: Clock, color: 'text-volt' },
                    { label: sp.completedSessions, value: completed.length, icon: CheckCircle2, color: 'text-green-600' },
                    { label: sp.pendingChanges, value: pendingChanges.length, icon: AlertCircle, color: 'text-amber-500' },
                  ] as const).map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="border border-ink/10 bg-white p-4">
                      <div className={cn('mb-2', color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-display text-3xl tabular-nums">{value}</p>
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
                    </div>
                  ))}
                </div>

                {/* My Trainer card */}
                <div className="border border-ink/10 bg-white">
                  <div className="border-b border-ink/10 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/40">{sp.myTrainer}</p>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
                    </div>
                  ) : trainer ? (
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        {trainer.profilePhoto ? (
                          <img
                            src={resolveImage(trainer.profilePhoto) || trainer.profilePhoto}
                            alt={trainer.name}
                            className="h-16 w-16 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-volt font-display text-xl text-ink">
                            {trainer.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-lg font-semibold leading-tight">{trainer.name}</p>
                          <p className="text-sm text-ink/55">{trainer.tagline}</p>
                        </div>
                      </div>
                      {trainer.specialties.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {trainer.specialties.map((s) => (
                            <span
                              key={s.id}
                              className="bg-bone px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/60"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/trainers/${trainer.id}`}
                        className="mt-4 inline-block text-sm font-semibold text-ink/50 underline hover:text-ink"
                      >
                        {sp.viewProfile} →
                      </Link>
                    </div>
                  ) : (
                    <p className="px-5 py-8 text-sm text-ink/50">{sp.noTrainer}</p>
                  )}
                </div>

                {/* Upcoming sessions list */}
                <div className="border border-ink/10 bg-white">
                  <div className="border-b border-ink/10 px-5 py-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/40">{sp.upcomingSessions}</p>
                  </div>
                  {upcoming.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-ink/50">{sp.noSessions}</p>
                  ) : (
                    <div className="divide-y divide-ink/8">
                      {upcoming.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-start justify-between gap-4 px-5 py-4">
                          <div className="min-w-0">
                            <p className="font-semibold">{s.title}</p>
                            <p className="mt-0.5 text-sm text-ink/55">
                              {new Date(s.scheduledAt).toLocaleString([], {
                                weekday: 'short', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                              {' · '}{s.durationMin} min
                            </p>
                            {s.pendingChangeRequest && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                                <AlertCircle className="h-3 w-3" />
                                {sp.pendingChanges}
                              </p>
                            )}
                          </div>
                          <span className={cn(
                            'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            s.status === 'confirmed' ? 'bg-volt text-ink' :
                            s.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          )}>
                            {t.sessionCalendar[s.status as 'confirmed' | 'pending' | 'cancelled']}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {upcoming.length > 5 && (
                    <div className="border-t border-ink/10 px-5 py-3">
                      <button
                        onClick={() => setSection('calendar')}
                        className="text-sm font-semibold text-ink/55 underline hover:text-ink"
                      >
                        {t.sessionCalendar.title} →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Calendar ── */}
            {section === 'calendar' && (
              <TrainingCalendar
                role="student"
                studentId={studentId ?? undefined}
                trainerId={trainer?.id}
              />
            )}

            {/* ── Messages ── */}
            {section === 'messages' && trainer && (
              <MessagesPanel
                role="student"
                myStudentId={studentId ?? undefined}
                myTrainerId={trainer.id}
              />
            )}
            {section === 'messages' && !loading && !trainer && (
              <p className="py-12 text-center text-sm text-ink/50">{sp.noTrainer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
