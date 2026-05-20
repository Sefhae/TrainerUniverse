'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Check, Search } from 'lucide-react';
import type { TrainerFilters } from '../hooks/useTrainers';
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  RATING_OPTIONS,
  SPECIALTY_GROUPS,
} from '../lib/constants';
import { useT } from '../hooks/useLanguage';
import { cn, formatPrice } from '../lib/format';

function SelectRow({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full bg-white/5 border border-white/15 px-3 py-2 text-sm appearance-none cursor-pointer',
        'focus:outline-none focus:border-volt/60 transition-colors duration-200',
        value ? 'text-bone' : 'text-bone/45'
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-charcoal text-bone">
          {opt}
        </option>
      ))}
    </select>
  );
}

interface FilterSidebarProps {
  filters: TrainerFilters;
  setFilters: (partial: Partial<TrainerFilters>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-white/10 py-5 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/45">{title}</h4>
      {children}
    </div>
  );
}

function CheckRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="group flex w-full items-center gap-3 py-1.5">
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-200',
          checked ? 'border-volt bg-volt' : 'border-white/25 group-hover:border-white/50'
        )}
      >
        {checked && <Check className="h-3 w-3 text-ink" strokeWidth={4} />}
      </span>
      <span
        className={cn(
          'text-sm transition-colors duration-200',
          checked ? 'text-bone' : 'text-bone/65 group-hover:text-bone'
        )}
      >
        {label}
      </span>
    </button>
  );
}

function RadioRow({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="group flex w-full items-center gap-3 py-1.5">
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-200',
          selected ? 'border-volt' : 'border-white/25 group-hover:border-white/50'
        )}
      >
        {selected && <span className="h-2 w-2 bg-volt" />}
      </span>
      <span
        className={cn(
          'text-sm transition-colors duration-200',
          selected ? 'text-bone' : 'text-bone/65 group-hover:text-bone'
        )}
      >
        {label}
      </span>
    </button>
  );
}

function PriceRange({
  min,
  max,
  minLabel,
  maxLabel,
  onCommit,
}: {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onCommit: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  useEffect(() => {
    setLocalMin(min);
    setLocalMax(max);
  }, [min, max]);

  useEffect(() => {
    if (localMin === min && localMax === max) return;
    const t = window.setTimeout(() => onCommit(localMin, localMax), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMin, localMax]);

  const pct = (v: number) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="bg-ink px-2.5 py-1 font-semibold text-bone">{formatPrice(localMin)}</span>
        <span className="text-bone/30">—</span>
        <span className="bg-ink px-2.5 py-1 font-semibold text-bone">
          {formatPrice(localMax)}
          {localMax >= PRICE_MAX ? '+' : ''}
        </span>
      </div>
      <div className="relative mb-1 h-1 bg-white/15">
        <div
          className="absolute h-1 bg-volt"
          style={{ left: `${pct(localMin)}%`, right: `${100 - pct(localMax)}%` }}
        />
        <input
          type="range"
          aria-label={minLabel}
          className="range-thumb"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={localMin}
          onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - PRICE_STEP))}
        />
        <input
          type="range"
          aria-label={maxLabel}
          className="range-thumb"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={localMax}
          onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin + PRICE_STEP))}
        />
      </div>
      <div className="flex justify-between text-[11px] text-bone/35">
        <span>{formatPrice(PRICE_MIN)}</span>
        <span>{formatPrice(PRICE_MAX)}+</span>
      </div>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  setFilters,
  clearFilters,
  activeFilterCount,
}: FilterSidebarProps) {
  const t = useT();
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        setCities(d.cities ?? []);
        setStates(d.states ?? []);
      })
      .catch(() => {});
  }, []);

  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const modeOptions = [
    { value: 'all' as const, label: t.filters.all },
    { value: 'remote' as const, label: t.filters.remote },
    { value: 'in-person' as const, label: t.filters.inPerson },
  ];

  const availabilityOptions = AVAILABILITY_OPTIONS.map((opt, i) => ({
    value: opt.value,
    label: t.filters.availabilityLabels[i],
  }));

  const experienceOptions = EXPERIENCE_OPTIONS.map((opt, i) => ({
    value: opt.value,
    label: t.filters.experienceLabels[i],
  }));

  const ratingOptions = RATING_OPTIONS.map((opt, i) => ({
    value: opt.value,
    label: t.filters.ratingLabels[i],
  }));

  return (
    <div className="bg-charcoal">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h3 className="font-display text-xl tracking-wide text-bone">{t.filters.title}</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-volt transition-colors duration-200 hover:text-bone"
          >
            {t.filters.clearAll} ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="px-5 py-2">
        <FilterGroup title={t.filters.specialty}>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-bone/35" />
            <input
              type="text"
              value={specialtySearch}
              onChange={(e) => setSpecialtySearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full bg-white/5 border border-white/15 pl-8 pr-3 py-2 text-sm text-bone placeholder:text-bone/35 focus:outline-none focus:border-volt/60 transition-colors duration-200"
            />
          </div>
          <div className="space-y-3">
            {SPECIALTY_GROUPS.map((group) => {
              const q = specialtySearch.toLowerCase();
              const visible = group.options.filter((o) => o.toLowerCase().includes(q));
              if (visible.length === 0) return null;
              return (
                <div key={group.label}>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-bone/30">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {visible.map((name) => (
                      <CheckRow
                        key={name}
                        label={name}
                        checked={filters.specialty.includes(name)}
                        onToggle={() => setFilters({ specialty: toggleInList(filters.specialty, name) })}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup title={t.filters.pricePerSession}>
          <PriceRange
            min={filters.minPrice}
            max={filters.maxPrice}
            minLabel={t.filters.minPrice}
            maxLabel={t.filters.maxPrice}
            onCommit={(minPrice, maxPrice) => setFilters({ minPrice, maxPrice })}
          />
        </FilterGroup>

        <FilterGroup title={t.filters.location}>
          <div className="grid grid-cols-3 gap-1">
            {modeOptions.map((m) => (
              <button
                key={m.value}
                onClick={() => setFilters({ mode: m.value })}
                className={cn(
                  'py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200',
                  filters.mode === m.value
                    ? 'bg-volt text-ink'
                    : 'bg-white/5 text-bone/60 hover:bg-white/10 hover:text-bone'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title={t.filters.city}>
          <SelectRow
            value={filters.city}
            options={cities}
            placeholder={t.filters.allCities}
            onChange={(city) => setFilters({ city })}
          />
        </FilterGroup>

        <FilterGroup title={t.filters.county}>
          <SelectRow
            value={filters.state}
            options={states}
            placeholder={t.filters.allCounties}
            onChange={(state) => setFilters({ state })}
          />
        </FilterGroup>

        <FilterGroup title={t.filters.rating}>
          <div className="space-y-0.5">
            {ratingOptions.map((r) => (
              <RadioRow
                key={r.value}
                label={r.label}
                selected={filters.minRating === r.value}
                onSelect={() => setFilters({ minRating: r.value })}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title={t.filters.availability}>
          <div className="space-y-0.5">
            {availabilityOptions.map((a) => (
              <CheckRow
                key={a.value}
                label={a.label}
                checked={filters.availability.includes(a.value)}
                onToggle={() => setFilters({ availability: toggleInList(filters.availability, a.value) })}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title={t.filters.experience}>
          <div className="space-y-0.5">
            {experienceOptions.map((e) => (
              <CheckRow
                key={e.value}
                label={e.label}
                checked={filters.experience.includes(e.value)}
                onToggle={() => setFilters({ experience: toggleInList(filters.experience, e.value) })}
              />
            ))}
          </div>
        </FilterGroup>
      </div>
    </div>
  );
}
