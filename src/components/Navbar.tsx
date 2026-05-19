'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, useT } from '../hooks/useLanguage';
import { cn } from '../lib/format';

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-8 w-8 transition-transform duration-200 group-hover:scale-110">
        <rect width="64" height="64" fill="#C8FF00" />
        <path d="M37 8 L16 38 H30 L28 56 L48 26 H34 Z" fill="#0A0A0A" />
      </svg>
      <span className="font-display text-2xl leading-none tracking-[0.08em] text-bone">
        FIT<span className="text-volt">CONNECT</span>
      </span>
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
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
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

        <nav className="hidden items-center gap-9 md:flex">
          <Link href="/trainers" className={navLinkClass('/trainers')}>
            {t.nav.findTrainer}
          </Link>
          <Link href="/register" className={navLinkClass('/register')}>
            {t.nav.becomeTrainer}
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LangToggle />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="btn btn-sm btn-volt">
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
            <Link href="/trainers" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              {t.nav.findTrainer}
            </Link>
            <Link href="/register" className="py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bone/80">
              {t.nav.becomeTrainer}
            </Link>
            <div className="mt-3 flex flex-col gap-2.5 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="btn btn-volt w-full">
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
              <div className="flex justify-center pt-1">
                <LangToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
