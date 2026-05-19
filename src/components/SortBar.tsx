'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { SORT_OPTIONS } from '../lib/constants';
import { useT } from '../hooks/useLanguage';

interface SortBarProps {
  total: number;
  loading: boolean;
  sort: string;
  onSortChange: (sort: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export default function SortBar({
  total,
  loading,
  sort,
  onSortChange,
  onOpenFilters,
  activeFilterCount,
}: SortBarProps) {
  const t = useT();

  const sortOptions = SORT_OPTIONS.map((opt, i) => ({
    value: opt.value,
    label: t.sort.options[i],
  }));

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl leading-none text-bone">
          {loading ? '—' : total}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bone/45">
          {total === 1 ? t.sort.trainerSingular : t.sort.trainerPlural}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenFilters}
          className="relative flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-bone transition-colors duration-200 hover:border-volt hover:text-volt lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t.sort.filtersLabel}
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center bg-volt text-[10px] font-bold text-ink">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="relative">
          <label className="sr-only" htmlFor="sort-select">
            {t.sort.label}
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="cursor-pointer appearance-none border border-white/15 bg-charcoal py-2.5 pl-4 pr-10 text-[12px] font-semibold uppercase tracking-[0.08em] text-bone outline-none transition-colors duration-200 hover:border-white/40 focus:border-volt"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-charcoal">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/50" />
        </div>
      </div>
    </div>
  );
}
