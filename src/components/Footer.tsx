'use client';

import Link from 'next/link';
import { useT } from '../hooks/useLanguage';

export default function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink text-bone">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 64 64" className="h-8 w-8">
                <rect width="64" height="64" fill="#C8FF00" />
                <path d="M37 8 L16 38 H30 L28 56 L48 26 H34 Z" fill="#0A0A0A" />
              </svg>
              <span className="font-display text-2xl tracking-[0.08em]">
                TRAINER<span className="text-volt">UNIVERSE</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-bone/55">{t.footer.desc}</p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">
              {t.footer.exploreTitle}
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link href="/trainers" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  {t.footer.findTrainer}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  {t.footer.faq}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">
              {t.footer.trainersTitle}
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/register" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  {t.footer.becomeTrainer}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  {t.footer.trainerLogin}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-[12px] text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} TrainerUniverse. {t.footer.allRightsReserved}</p>
          <p className="uppercase tracking-[0.18em]">{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
