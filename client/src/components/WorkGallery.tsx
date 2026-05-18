import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PreviousWork } from '../types';
import { resolveImage } from '../lib/format';

export default function WorkGallery({ items }: { items: PreviousWork[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = () => setActive(null);
  const step = (delta: number) =>
    setActive((cur) => (cur === null ? cur : (cur + delta + items.length) % items.length));

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, items.length]);

  const current = active !== null ? items[active] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const photo = resolveImage(item.photo);
          return (
            <button
              key={item.id}
              onClick={() => setActive(i)}
              className="group relative aspect-square overflow-hidden border border-white/10 bg-ink text-left transition-colors duration-200 hover:border-volt"
            >
              {photo ? (
                <img
                  src={photo}
                  alt={item.goal || item.studentName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-5xl text-white/10">FC</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              {item.duration && (
                <span className="chip absolute right-3 top-3 bg-ink/80 text-bone backdrop-blur">
                  {item.duration}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-2xl leading-none tracking-wide text-bone">
                  {item.studentName || 'Client'}
                </p>
                {item.goal && <p className="mt-1.5 text-xs font-semibold text-volt">{item.goal}</p>}
              </div>
            </button>
          );
        })}
      </div>

      {current && (
        <div
          className="animate-fade-in fixed inset-0 z-[160] flex items-center justify-center bg-ink/95 p-4 sm:p-8"
          onMouseDown={close}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-5 top-5 text-bone/60 transition-colors duration-200 hover:text-volt"
          >
            <X className="h-7 w-7" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/15 p-2 text-bone transition-colors duration-200 hover:border-volt hover:text-volt sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/15 p-2 text-bone transition-colors duration-200 hover:border-volt hover:text-volt sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="animate-scale-in grid max-h-[88vh] w-full max-w-4xl overflow-hidden bg-charcoal md:grid-cols-[1.2fr_1fr]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="aspect-square bg-ink md:aspect-auto">
              {resolveImage(current.photo) ? (
                <img
                  src={resolveImage(current.photo)}
                  alt={current.goal || current.studentName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center">
                  <span className="font-display text-7xl text-white/10">FC</span>
                </div>
              )}
            </div>
            <div className="flex flex-col p-7">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-volt">
                Transformation
              </span>
              <h3 className="mt-2 font-display text-4xl leading-none tracking-wide text-bone">
                {current.studentName || 'Client'}
              </h3>
              <div className="mt-5 space-y-3">
                {current.goal && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/40">
                      Goal Achieved
                    </p>
                    <p className="text-sm text-bone">{current.goal}</p>
                  </div>
                )}
                {current.duration && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/40">
                      Duration
                    </p>
                    <p className="text-sm text-bone">{current.duration}</p>
                  </div>
                )}
              </div>
              {current.description && (
                <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-relaxed text-bone/65">
                  {current.description}
                </p>
              )}
              <p className="mt-auto pt-6 text-[11px] italic text-bone/35">
                Shared with the client’s consent.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
