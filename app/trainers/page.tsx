'use client';

import { Suspense, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTrainers } from '../../src/hooks/useTrainers';
import FilterSidebar from '../../src/components/FilterSidebar';
import SortBar from '../../src/components/SortBar';
import TrainerCard from '../../src/components/TrainerCard';
import TrainerCardSkeleton from '../../src/components/TrainerCardSkeleton';
import EmptyState from '../../src/components/EmptyState';

function DirectoryContent() {
  const { trainers, total, loading, error, filters, setFilters, clearFilters, activeFilterCount } =
    useTrainers();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-ink text-bone">
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <p className="eyebrow text-volt">
            <span className="h-px w-8 bg-volt" />
            The Directory
          </p>
          <h1 className="mt-4 font-display text-6xl leading-none tracking-wide sm:text-7xl">
            Find Your Coach
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-bone/55">
            Every trainer is filterable by specialty, price, location and availability. Refine the
            list until it fits exactly what you need.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="no-scrollbar sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto border border-white/10">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          <div>
            <SortBar
              total={total}
              loading={loading}
              sort={filters.sort}
              onSortChange={(sort) => setFilters({ sort })}
              onOpenFilters={() => setDrawerOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            <div className="mt-7">
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TrainerCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <EmptyState
                  tone="dark"
                  title="Something went wrong"
                  message={error}
                  action={
                    <button onClick={() => window.location.reload()} className="btn btn-volt">
                      Try Again
                    </button>
                  }
                />
              ) : total === 0 ? (
                <EmptyState
                  tone="dark"
                  title="No trainers found"
                  message="No trainers match your current filters. Try widening your search or clearing a few filters."
                  action={
                    <button onClick={clearFilters} className="btn btn-volt">
                      Clear All Filters
                    </button>
                  }
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {trainers.map((trainer, i) => (
                    <div
                      key={trainer.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
                    >
                      <TrainerCard trainer={trainer} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="animate-fade-in fixed inset-0 z-[140] flex flex-col bg-ink lg:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-display text-xl tracking-wide">Refine</span>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close filters">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
          <div className="border-t border-white/10 p-4">
            <button onClick={() => setDrawerOpen(false)} className="btn btn-volt w-full">
              Show {loading ? '…' : total} {total === 1 ? 'Trainer' : 'Trainers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink text-bone">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TrainerCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <DirectoryContent />
    </Suspense>
  );
}
