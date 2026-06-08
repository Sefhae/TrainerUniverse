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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl leading-none text-content">
          {loading ? '—' : total}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-content/45">
          {total === 1 ? t.sort.trainerSingular : t.sort.trainerPlural}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFilters}
          className="relative flex items-center gap-2 border border-content/15 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-content transition-colors duration-200 hover:border-accent hover:text-accent lg:hidden"
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
            className="w-full cursor-pointer appearance-none border border-content/15 bg-surface-2 py-2.5 pl-3 pr-9 text-[12px] font-semibold uppercase tracking-[0.08em] text-content outline-none transition-colors duration-200 hover:border-content/40 focus:border-volt sm:w-auto sm:pl-4"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-2">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content/50" />
        </div>
      </div>
    </div>
  );
}
