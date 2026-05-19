'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, DollarSign, ExternalLink, Image as ImageIcon, Inbox, MessageSquare, Star, User, Users } from 'lucide-react';
import api from '../../src/api/client';
import { useAuth } from '../../src/hooks/useAuth';
import { useT } from '../../src/hooks/useLanguage';
import type { Trainer } from '../../src/types';
import { cn, initials, resolveImage } from '../../src/lib/format';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import ProfileEditor from '../../src/components/dashboard/ProfileEditor';
import PricingManager from '../../src/components/dashboard/PricingManager';
import WorkManager from '../../src/components/dashboard/WorkManager';
import ReviewsPanel from '../../src/components/dashboard/ReviewsPanel';
import StudentsPanel from '../../src/components/dashboard/StudentsPanel';
import TrainingCalendar from '../../src/components/dashboard/TrainingCalendar';
import MessagesPanel from '../../src/components/dashboard/MessagesPanel';
import SessionRequestsPanel from '../../src/components/dashboard/SessionRequestsPanel';

type SectionId = 'profile' | 'pricing' | 'work' | 'reviews' | 'students' | 'calendar' | 'messages' | 'requests';

function DashboardContent() {
  const { trainerId, user } = useAuth();
  const t = useT();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [section, setSection] = useState<SectionId>('profile');

  const load = useCallback(async () => {
    if (!trainerId) {
      setError(true);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<Trainer>(`/trainers/${trainerId}`);
      setTrainer(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-bone">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-bone px-5 text-center">
        <h1 className="font-display text-4xl tracking-wide">{t.dashboard.unavailableTitle}</h1>
        <p className="mt-2 text-sm text-ink/55">{t.dashboard.unavailableMsg}</p>
        <Link href="/login" className="btn btn-dark mt-6">
          {t.dashboard.backToLogin}
        </Link>
      </div>
    );
  }

  const sections: { id: SectionId; label: string; icon: typeof User; count?: number }[] = [
    { id: 'profile', label: t.dashboard.profile, icon: User },
    { id: 'pricing', label: t.dashboard.pricing, icon: DollarSign, count: trainer.packages.length },
    { id: 'work', label: t.dashboard.previousWork, icon: ImageIcon, count: trainer.previousWork.length },
    { id: 'reviews', label: t.dashboard.reviews, icon: Star, count: trainer.reviews.length },
    { id: 'requests', label: 'Requests', icon: Inbox },
    { id: 'students', label: t.dashboard.students, icon: Users },
    { id: 'calendar', label: t.dashboard.calendar, icon: CalendarDays },
    { id: 'messages', label: t.dashboard.messages, icon: MessageSquare },
  ];

  const photo = resolveImage(trainer.profilePhoto);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bone">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <div className="bg-ink text-bone">
              <div className="flex items-center gap-3 border-b border-white/10 p-5">
                <div className="h-12 w-12 shrink-0 overflow-hidden bg-charcoal">
                  {photo ? (
                    <img src={photo} alt={trainer.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-lg text-white/30">
                      {initials(trainer.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-tight">{trainer.name}</p>
                  <span
                    className={cn(
                      'mt-1 inline-block text-[10px] font-bold uppercase tracking-[0.12em]',
                      trainer.isPublished ? 'text-volt' : 'text-yellow-400'
                    )}
                  >
                    {trainer.isPublished ? t.dashboard.published : t.dashboard.draft}
                  </span>
                </div>
              </div>

              <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
                {sections.map((s) => {
                  const Icon = s.icon;
                  const active = section === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSection(s.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 lg:shrink',
                        active ? 'bg-volt text-ink' : 'text-bone/65 hover:bg-white/5 hover:text-bone'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 whitespace-nowrap">{s.label}</span>
                      {s.count !== undefined && (
                        <span
                          className={cn(
                            'text-xs tabular-nums',
                            active ? 'text-ink/60' : 'text-bone/35'
                          )}
                        >
                          {s.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 p-2">
                <Link
                  href={`/trainers/${trainer.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-bone/65 transition-colors duration-200 hover:text-volt"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.dashboard.viewPublicProfile}
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div>
            <div className="mb-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/45">
                {t.dashboard.title}
              </p>
              <h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">
                {t.dashboard.welcomeBack} {trainer.name.split(' ')[0]}
              </h1>
              <p className="mt-1 text-sm text-ink/55">{user?.email}</p>
            </div>

            {section === 'profile' && <ProfileEditor trainer={trainer} refresh={load} />}
            {section === 'pricing' && <PricingManager trainer={trainer} refresh={load} />}
            {section === 'work' && <WorkManager trainer={trainer} refresh={load} />}
            {section === 'reviews' && <ReviewsPanel trainer={trainer} />}
            {section === 'requests' && <SessionRequestsPanel />}
            {section === 'students' && <StudentsPanel />}
            {section === 'calendar' && <TrainingCalendar role="trainer" />}
            {section === 'messages' && (
              <MessagesPanel role="trainer" myTrainerId={trainerId ?? undefined} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
