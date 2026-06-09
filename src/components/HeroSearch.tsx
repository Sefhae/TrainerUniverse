'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, Globe, MapPin, Search, Video } from 'lucide-react';
import CitySearch from './CitySearch';
import { SPECIALTY_OPTIONS } from '../lib/constants';
import { useT } from '../hooks/useLanguage';
import { useSyncedRotation } from '../hooks/useSyncedRotation';

const POPULAR = ['Gym Training', 'Boxing', 'Yoga', 'Nutrition', 'Mathematics', 'Programming'];

export default function HeroSearch() {
  const t = useT();
  const router = useRouter();
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [mode, setMode] = useState<'all' | 'remote' | 'in-person'>('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [modeOpen, setModeOpen] = useState(false);
  const specRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);

  const rotating = t.home.searchRotating;
  const wordIndex = useSyncedRotation(rotating.length);
  // Reserve the widest word's width so the suffix ("for you") never shifts as
  // the rotating word changes length.
  const longestWord = rotating.reduce((a, b) => (b.length >= a.length ? b : a), rotating[0] ?? '');

  useEffect(() => {
    const q = specialty.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const filtered = SPECIALTY_OPTIONS.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
    setSuggestions(filtered);
    setOpen(filtered.length > 0);
    setHighlighted(0);
  }, [specialty]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (specRef.current && !specRef.current.contains(e.target as Node)) setOpen(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setModeOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const MODES = [
    { id: 'all', label: t.home.searchModeAny, icon: Globe },
    { id: 'remote', label: t.home.searchModeOnline, icon: Video },
    { id: 'in-person', label: t.home.searchModeInPerson, icon: MapPin },
  ] as const;
  const currentMode = MODES.find((m) => m.id === mode) ?? MODES[0];
  const CurrentModeIcon = currentMode.icon;

  function go(spec: string, c = city) {
    const params = new URLSearchParams();
    const s = spec.trim();
    if (s) {
      const match = SPECIALTY_OPTIONS.find((o) => o.toLowerCase() === s.toLowerCase());
      params.set('specialty', match ?? s);
    }
    if (c.trim()) params.set('city', c.trim());
    if (mode !== 'all') params.set('mode', mode);
    router.push('/trainers' + (params.toString() ? '?' + params.toString() : ''));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter') go(specialty);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = suggestions[highlighted];
      if (pick) {
        setSpecialty(pick);
        setOpen(false);
        go(pick);
      } else {
        go(specialty);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] flex-col justify-center overflow-hidden border-b border-content/10 bg-surface text-content">
      <div className="grain-layer" />
      {/* Light-mode hero backdrop: a clean tonal spotlight — no pattern. Hidden in
          dark where the soft glows carry the space. */}
      <div
        className="pointer-events-none absolute inset-0 hidden theme-light:block"
        style={{ background: 'radial-gradient(125% 75% at 50% 12%, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0) 58%)' }}
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-[0.18] blur-3xl theme-light:opacity-[0.16]"
        style={{ background: 'radial-gradient(circle, rgb(var(--glow)) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-3xl theme-light:opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, rgb(var(--glow)) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-5 py-20 text-center lg:px-8">
        <p className="eyebrow animate-fade-up justify-center text-accent">
          <span className="h-px w-8 bg-accent" />
          {t.home.eyebrow}
          <span className="h-px w-8 bg-accent" />
        </p>

        <h1
          className="animate-fade-up mt-6 font-display text-5xl leading-[0.95] tracking-wide sm:text-7xl xl:text-8xl"
          style={{ animationDelay: '0.08s' }}
        >
          <span className="block">{t.home.searchTitle1}</span>
          <span className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 sm:mt-3">
            {/* Fixed-width slot: invisible sizer holds the widest word so the
                suffix stays put; the live word + highlight are centered over it. */}
            <span className="relative inline-block text-center">
              <span aria-hidden className="invisible px-[0.12em]">{longestWord}</span>
              <span className="absolute inset-0">
                <span className="relative inline-block px-[0.12em]">
                  <span
                    key={`highlight-${wordIndex}`}
                    aria-hidden
                    className="animate-highlight-swipe absolute inset-x-0 inset-y-[0.04em] origin-left rounded-[4px] bg-volt"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    key={`${wordIndex}-${rotating[wordIndex % rotating.length]}`}
                    className="animate-word-slide relative inline-block text-ink"
                  >
                    {rotating[wordIndex % rotating.length]}
                  </span>
                </span>
              </span>
            </span>
            <span className="text-content">{t.home.searchTitleSuffix}</span>
          </span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-xl text-base text-content/60 sm:text-lg"
          style={{ animationDelay: '0.16s' }}
        >
          {t.home.searchSubtitle}
        </p>

        <div className="animate-fade-up mx-auto mt-10 max-w-4xl" style={{ animationDelay: '0.24s' }}>
          <div className="flex flex-col gap-1.5 border border-content/15 bg-surface-2/95 p-1.5 shadow-xl shadow-black/5 backdrop-blur sm:flex-row sm:items-stretch sm:gap-2 sm:p-2">
            <div ref={specRef} className="relative flex-[1.7]">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-content/45 sm:left-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => specialty.trim() && suggestions.length > 0 && setOpen(true)}
                placeholder={t.home.searchSpecialtyPlaceholder}
                autoComplete="off"
                className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-content placeholder:text-content/55 focus:outline-none sm:py-4 sm:pl-12 sm:pr-4 sm:text-base"
              />
              {open && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto border border-content/15 bg-surface-2 text-left shadow-2xl">
                  {suggestions.map((s, i) => (
                    <li
                      key={s}
                      onMouseDown={() => {
                        setSpecialty(s);
                        setOpen(false);
                        go(s);
                      }}
                      onMouseEnter={() => setHighlighted(i)}
                      className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                        i === highlighted ? 'bg-volt/20 text-accent' : 'text-content/80 hover:bg-content/5'
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hidden w-px self-stretch bg-content/10 sm:block" />

            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-content/45 sm:left-4 sm:h-5 sm:w-5" />
              <CitySearch
                value={city}
                onChange={setCity}
                placeholder={t.home.searchCityPlaceholder}
                className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-content placeholder:text-content/55 focus:outline-none sm:py-4 sm:pl-12 sm:pr-4 sm:text-base"
              />
            </div>

            <div className="hidden w-px self-stretch bg-content/10 sm:block" />

            <div ref={modeRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setModeOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={modeOpen}
                className="flex h-full w-full items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-content/70 transition-colors hover:text-content sm:py-0"
              >
                <CurrentModeIcon className="h-4 w-4 shrink-0 text-content/55" />
                <span className="text-content/55">{t.home.searchModeLabel}:</span>
                <span>{currentMode.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${modeOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {modeOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full z-50 mt-2 min-w-[13rem] border border-content/15 bg-surface-2 py-1 text-left shadow-2xl"
                >
                  <li className="px-4 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-content/35">
                    {t.home.searchModeHelp}
                  </li>
                  {MODES.map(({ id, label, icon: Icon }) => (
                    <li
                      key={id}
                      role="option"
                      aria-selected={mode === id}
                      onMouseDown={() => {
                        setMode(id);
                        setModeOpen(false);
                      }}
                      className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        mode === id ? 'bg-volt/20 text-accent' : 'text-content/80 hover:bg-content/5'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-70" />
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => go(specialty)}
              className="btn btn-volt shrink-0 justify-center py-3 text-[11px] sm:py-3.5 sm:text-[13px] sm:px-8"
            >
              {t.home.searchButton}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-content/40">
              {t.home.popularLabel}
            </span>
            {POPULAR.map((p) => (
              <button
                key={p}
                onClick={() => go(p, city)}
                className="border border-content/15 px-3 py-1.5 text-xs text-content/70 transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#discover"
        className="group absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-1 text-content/40 transition-colors duration-200 hover:text-accent"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{t.home.scrollHint}</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
