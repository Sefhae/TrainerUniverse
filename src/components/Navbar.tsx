'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, ChevronDown, Cpu, Globe, HeartPulse, LogOut, Menu, Trophy, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { useLanguage, useT } from '../hooks/useLanguage';
import { cn } from '../lib/format';
import { SPECIALTY_GROUPS } from '../lib/constants';

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-110">
        <circle cx="20" cy="20" r="20" fill="#C8FF00" />
        <ellipse cx="20" cy="20" rx="13" ry="4.5" fill="none" stroke="#0A0A0A" strokeWidth="1.2"
          transform="rotate(-38 20 20)" opacity="0.3" />
        <path d="M24 4 L12 22 H20 L16 36 L28 18 H20 Z" fill="#0A0A0A" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-display text-[22px] tracking-[0.06em] text-bone">TRAINER</span>
        <span className="font-display text-[13px] tracking-[0.28em] text-volt">UNIVERSE</span>
      </div>
    </Link>
  );
}

function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => setLang('en')}
        className={cn(
          'px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200',
          lang === 'en' ? 'text-volt' : 'text-bone/40 hover:text-bone'
        )}
      >
        EN
      </button>
      <span className="text-[10px] text-bone/20">|</span>
      <button
        onClick={() => setLang('tr')}
        className={cn(
          'px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200',
          lang === 'tr' ? 'text-volt' : 'text-bone/40 hover:text-bone'
        )}
      >
        TR
      </button>
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated: isTrainerAuth, hydrated: trainerHydrated, logout: trainerLogout } = useAuth();
  const { isAuthenticated: isStudentAuth, hydrated: studentHydrated, logout: studentLogout } = useStudentAuth();
  const isAuthenticated = isTrainerAuth || isStudentAuth;
  // Only reflect auth state once both providers have read storage, so the first
  // client render matches the (always logged-out) server render.
  const showAuthed = trainerHydrated && studentHydrated && isAuthenticated;
  // Send each role to its own dashboard — students don't have a trainer token,
  // so /dashboard's ProtectedRoute would bounce them to /login.
  const dashboardHref = isTrainerAuth ? '/dashboard' : '/student/dashboard';
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(SPECIALTY_GROUPS[0].label);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const groupIcons: Record<string, React.ReactNode> = {
    'Sports & Athletics': <Trophy className="h-3.5 w-3.5 shrink-0" />,
    'Wellness & Health':  <HeartPulse className="h-3.5 w-3.5 shrink-0" />,
    'Academic':           <BookOpen className="h-3.5 w-3.5 shrink-0" />,
    'Creative & Tech':    <Cpu className="h-3.5 w-3.5 shrink-0" />,
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (isTrainerAuth) trainerLogout();
    if (isStudentAuth) studentLogout();
    router.push('/');
  };

  const navLinkClass = (path: string) =>
    cn(
      'text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200',
      pathname === path || pathname.startsWith(path + '/')
        ? 'text-volt'
        : 'text-bone/70 hover:text-bone'
    );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center md:flex">
          <Link href="/" className={navLinkClass('/')}>
            {t.nav.home}
          </Link>
          <span className="mx-6 h-4 w-px bg-white/20" />

          {/* Find Trainer dropdown */}
          <div
            ref={categoriesRef}
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <Link
              href="/trainers"
              className={cn(navLinkClass('/trainers'), 'flex items-center gap-1')}
            >
              {t.nav.findTrainer}
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  categoriesOpen ? 'rotate-180' : ''
                )}
              />
            </Link>

            {categoriesOpen && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                <div className="flex w-[520px] border border-white/10 bg-ink shadow-2xl">
                  {/* Left: category group list */}
                  <div className="w-[200px] shrink-0 border-r border-white/10 py-2">
                    <p className="px-4 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-bone/30">
                      Browse by Category
                    </p>
                    {SPECIALTY_GROUPS.map((group) => (
                      <Link
                        key={group.label}
                        href={`/trainers?specialty=${group.options.map(encodeURIComponent).join(',')}`}
                        onMouseEnter={() => setActiveGroup(group.label)}
                        onClick={() => setCategoriesOpen(false)}
                        className={cn(
                          'flex w-full items-center gap-2.5 justify-between px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors duration-150',
                          activeGroup === group.label
                            ? 'bg-white/8 text-volt'
                            : 'text-bone/60 hover:bg-white/5 hover:text-bone'
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          {groupIcons[group.label]}
                          {group.label}
                        </span>
                        <ChevronDown className="-rotate-90 h-3 w-3 opacity-50 shrink-0" />
                      </Link>
                    ))}
                    <div className="border-t border-white/10 px-4 pt-3 pb-2">
                      <Link
                        href="/trainers"
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-volt hover:text-bone transition-colors duration-200"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        View All Trainers →
                      </Link>
                    </div>
                  </div>

                  {/* Right: specialties for active group */}
                  <div className="flex-1 p-4">
                    {SPECIALTY_GROUPS.filter((g) => g.label === activeGroup).map((group) => (
                      <div key={group.label}>
                        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-volt/70">
                          {group.label}
                        </p>
                        <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                          {group.options.map((name) => (
                            <li key={name}>
                              <Link
                                href={`/trainers?specialty=${encodeURIComponent(name)}`}
                                className="block py-1 text-[12px] text-bone/65 transition-colors duration-150 hover:text-volt"
                                onClick={() => setCategoriesOpen(false)}
                              >
                                {name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!showAuthed && (
            <>
              <span className="mx-6 h-4 w-px bg-white/20" />
              <Link href="/register" className={navLinkClass('/register')}>
                {t.nav.becomeTrainer}
              </Link>
            </>
          )}
          <span className="mx-6 h-4 w-px bg-white/20" />
          <Link href="/faq" className={navLinkClass('/faq')}>
            {t.nav.faq}
          </Link>
          <span className="mx-6 h-4 w-px bg-white/20" />
          <Link href="/contact" className={navLinkClass('/contact')}>
            {t.nav.contact}
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LangToggle />
          <span className="h-4 w-px bg-white/20" />
          {showAuthed ? (
            <>
              <Link href={dashboardHref} className="btn btn-sm btn-volt">
                {t.nav.dashboard}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-bone/60 transition-colors duration-200 hover:text-bone"
              >
                <LogOut className="h-4 w-4" />
                {t.nav.logOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-bone/70 transition-colors duration-200 hover:text-bone"
              >
                {t.nav.logIn}
              </Link>
              <Link href="/register" className="btn btn-sm btn-volt">
                {t.nav.getStarted}
              </Link>
            </>
          )}
        </div>

        <button
          className="text-bone md:hidden"
          aria-label={t.nav.toggleMenu}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="animate-slide-down border-t border-white/10 bg-ink md:hidden">
          <nav className="flex flex-col px-5 py-4">
            <Link href="/" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              {t.nav.home}
            </Link>
            <Link href="/trainers" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              {t.nav.findTrainer}
            </Link>
            {!showAuthed && (
              <Link href="/register" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
                {t.nav.becomeTrainer}
              </Link>
            )}
            <Link href="/faq" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              {t.nav.faq}
            </Link>
            <Link href="/contact" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              {t.nav.contact}
            </Link>
            <div className="mt-3 flex flex-col gap-2.5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between pb-1">
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-bone/40">
                  <Globe className="h-4 w-4" />
                  {t.nav.language}
                </span>
                <LangToggle />
              </div>
              {showAuthed ? (
                <>
                  <Link href={dashboardHref} className="btn btn-volt w-full">
                    {t.nav.dashboard}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline-light w-full">
                    {t.nav.logOut}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className="btn btn-volt w-full">
                    {t.nav.getStarted}
                  </Link>
                  <Link href="/login" className="btn btn-outline-light w-full">
                    {t.nav.logIn}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
