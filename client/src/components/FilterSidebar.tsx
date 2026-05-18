import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { TrainerFilters } from '../hooks/useTrainers';
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  RATING_OPTIONS,
  SPECIALTY_OPTIONS,
} from '../lib/constants';
import { cn, formatPrice } from '../lib/format';

interface FilterSidebarProps {
  filters: TrainerFilters;
  setFilters: (partial: Partial<TrainerFilters>) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

const MODES: { value: TrainerFilters['mode']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'remote', label: 'Remote' },
  { value: 'in-person', label: 'In-Person' },
];

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
  onCommit,
}: {
  min: number;
  max: number;
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
          aria-label="Minimum price"
          className="range-thumb"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={localMin}
          onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - PRICE_STEP))}
        />
        <input
          type="range"
          aria-label="Maximum price"
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
  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="bg-charcoal">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h3 className="font-display text-xl tracking-wide text-bone">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-volt transition-colors duration-200 hover:text-bone"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="px-5 py-2">
        <FilterGroup title="Specialty">
          <div className="space-y-0.5">
            {SPECIALTY_OPTIONS.map((name) => (
              <CheckRow
                key={name}
                label={name}
                checked={filters.specialty.includes(name)}
                onToggle={() => setFilters({ specialty: toggleInList(filters.specialty, name) })}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Price / Session">
          <PriceRange
            min={filters.minPrice}
            max={filters.maxPrice}
            onCommit={(minPrice, maxPrice) => setFilters({ minPrice, maxPrice })}
          />
        </FilterGroup>

        <FilterGroup title="Location">
          <div className="grid grid-cols-3 gap-1">
            {MODES.map((m) => (
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

        <FilterGroup title="Rating">
          <div className="space-y-0.5">
            {RATING_OPTIONS.map((r) => (
              <RadioRow
                key={r.value}
                label={r.label}
                selected={filters.minRating === r.value}
                onSelect={() => setFilters({ minRating: r.value })}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Availability">
          <div className="space-y-0.5">
            {AVAILABILITY_OPTIONS.map((a) => (
              <CheckRow
                key={a.value}
                label={a.label}
                checked={filters.availability.includes(a.value)}
                onToggle={() => setFilters({ availability: toggleInList(filters.availability, a.value) })}
              />
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Experience">
          <div className="space-y-0.5">
            {EXPERIENCE_OPTIONS.map((e) => (
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
