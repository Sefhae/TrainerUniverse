'use client';

import Link from 'next/link';
import { useT } from '../hooks/useLanguage';
import BrandMark from './BrandMark';

export default function Footer() {
  const t = useT();
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-content/10 bg-surface text-content">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-8 w-8 text-content" />
              <span className="font-display text-2xl tracking-[0.08em]">
                TRAINER<span className="text-accent">UNIVERSE</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-content/55">{t.footer.desc}</p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-content/40">
              {t.footer.exploreTitle}
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-content/70 transition-colors duration-200 hover:text-accent">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link href="/trainers" className="text-content/70 transition-colors duration-200 hover:text-accent">
                  {t.footer.findTrainer}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-content/70 transition-colors duration-200 hover:text-accent">
                  {t.footer.faq}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-content/40">
              {t.footer.trainersTitle}
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/register" className="text-content/70 transition-colors duration-200 hover:text-accent">
                  {t.footer.becomeTrainer}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-content/70 transition-colors duration-200 hover:text-accent">
                  {t.footer.trainerLogin}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-content/10 pt-7 text-[12px] text-content/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} TrainerUniverse. {t.footer.allRightsReserved}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/user-agreement"
              className="uppercase tracking-[0.18em] transition-colors duration-200 hover:text-accent"
            >
              User Agreement
            </Link>
            <span className="hidden h-3 w-px bg-content/20 sm:block" />
            <p className="uppercase tracking-[0.18em]">{t.footer.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
