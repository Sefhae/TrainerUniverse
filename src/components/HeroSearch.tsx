'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, MapPin, Search } from 'lucide-react';
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const specRef = useRef<HTMLDivElement>(null);

  const rotating = t.home.searchRotating;
  const wordIndex = useSyncedRotation(rotating.length);

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
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function go(spec: string, c = city) {
    const params = new URLSearchParams();
    const s = spec.trim();
    if (s) {
      const match = SPECIALTY_OPTIONS.find((o) => o.toLowerCase() === s.toLowerCase());
      params.set('specialty', match ?? s);
    }
    if (c.trim()) params.set('city', c.trim());
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
    <section className="relative flex min-h-[calc(100vh-72px)] flex-col justify-center overflow-hidden border-b border-white/10 bg-ink text-bone">
      <div className="grain-layer" />
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-5 py-20 text-center lg:px-8">
        <p className="eyebrow animate-fade-up justify-center text-volt">
          <span className="h-px w-8 bg-volt" />
          {t.home.eyebrow}
          <span className="h-px w-8 bg-volt" />
        </p>

        <h1
          className="animate-fade-up mt-6 font-display text-5xl leading-[0.95] tracking-wide sm:text-7xl xl:text-8xl"
          style={{ animationDelay: '0.08s' }}
        >
          <span className="block">{t.home.searchTitle1}</span>
          <span className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 sm:mt-3">
            <span className="relative inline-block">
              <span
                key={`highlight-${wordIndex}`}
                aria-hidden
                className="animate-highlight-swipe absolute inset-x-0 inset-y-[0.04em] origin-left rounded-[4px] bg-volt"
                style={{ animationDelay: '0.1s' }}
              />
              <span
                key={`${wordIndex}-${rotating[wordIndex % rotating.length]}`}
                className="animate-word-slide relative inline-block px-[0.12em] text-ink"
              >
                {rotating[wordIndex % rotating.length]}
              </span>
            </span>
            <span className="text-bone">{t.home.searchTitleSuffix}</span>
          </span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-xl text-base text-bone/60 sm:text-lg"
          style={{ animationDelay: '0.16s' }}
        >
          {t.home.searchSubtitle}
        </p>

        <div className="animate-fade-up mx-auto mt-10 max-w-3xl" style={{ animationDelay: '0.24s' }}>
          <div className="flex flex-col gap-2 border border-white/15 bg-charcoal/60 p-2 backdrop-blur sm:flex-row sm:items-stretch">
            <div ref={specRef} className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-bone/35" />
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => specialty.trim() && suggestions.length > 0 && setOpen(true)}
                placeholder={t.home.searchSpecialtyPlaceholder}
                autoComplete="off"
                className="w-full bg-transparent py-4 pl-12 pr-4 text-base text-bone placeholder:text-bone/40 focus:outline-none"
              />
              {open && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto border border-white/15 bg-[#1a1a1a] text-left shadow-2xl">
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
                        i === highlighted ? 'bg-volt/20 text-volt' : 'text-bone/80 hover:bg-white/5'
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hidden w-px self-stretch bg-white/10 sm:block" />

            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-bone/35" />
              <CitySearch
                value={city}
                onChange={setCity}
                placeholder={t.home.searchCityPlaceholder}
                className="w-full bg-transparent py-4 pl-12 pr-4 text-base text-bone placeholder:text-bone/40 focus:outline-none"
              />
            </div>

            <button
              onClick={() => go(specialty)}
              className="btn btn-volt shrink-0 justify-center sm:px-8"
            >
              {t.home.searchButton}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bone/40">
              {t.home.popularLabel}
            </span>
            {POPULAR.map((p) => (
              <button
                key={p}
                onClick={() => go(p, city)}
                className="border border-white/15 px-3 py-1.5 text-xs text-bone/70 transition-colors duration-200 hover:border-volt hover:text-volt"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#discover"
        className="group absolute inset-x-0 bottom-6 mx-auto flex w-fit flex-col items-center gap-1 text-bone/40 transition-colors duration-200 hover:text-volt"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{t.home.scrollHint}</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
