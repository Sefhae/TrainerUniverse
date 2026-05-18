import Link from 'next/link';

export default function Footer() {
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
                FIT<span className="text-volt">CONNECT</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-bone/55">
              The marketplace for elite personal training. Find a coach who matches your goals,
              your schedule, and your ambition.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">
              Explore
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/trainers" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  Find a Trainer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone/40">
              For Trainers
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/register" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  Become a Trainer
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-bone/70 transition-colors duration-200 hover:text-volt">
                  Trainer Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-[12px] text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FitConnect. All rights reserved.</p>
          <p className="uppercase tracking-[0.18em]">Train smarter. Go further.</p>
        </div>
      </div>
    </footer>
  );
}
