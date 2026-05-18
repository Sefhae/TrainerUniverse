'use client';

import Link from 'next/link';
import { ArrowRight, Globe, MapPin } from 'lucide-react';
import type { TrainerSummary } from '../types';
import { formatPrice, initials, resolveImage } from '../lib/format';
import StarRating from './StarRating';

export default function TrainerCard({ trainer }: { trainer: TrainerSummary }) {
  const photo = resolveImage(trainer.profilePhoto);
  const visibleSpecs = trainer.specialties.slice(0, 3);
  const extra = trainer.specialties.length - visibleSpecs.length;

  return (
    <Link
      href={`/trainers/${trainer.id}`}
      className="group flex flex-col border border-white/10 bg-charcoal transition-all duration-200 hover:border-volt"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
        {photo ? (
          <img
            src={photo}
            alt={trainer.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[450ms] group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-7xl text-white/10">{initials(trainer.name)}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/90 to-transparent" />
        <div className="absolute left-3 top-3">
          <span className="chip bg-ink/85 text-bone backdrop-blur">
            {trainer.isRemote ? (
              <>
                <Globe className="mr-1 h-3 w-3 text-volt" /> Remote
              </>
            ) : (
              <>
                <MapPin className="mr-1 h-3 w-3 text-volt" /> {trainer.location || 'In-Person'}
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl leading-none tracking-wide text-bone">{trainer.name}</h3>
        <p className="mt-2 line-clamp-1 text-sm text-bone/55">{trainer.tagline || 'Personal Trainer'}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleSpecs.map((s) => (
            <span key={s.id} className="chip border border-white/15 text-bone/70">
              {s.name}
            </span>
          ))}
          {extra > 0 && <span className="chip text-volt">+{extra}</span>}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <StarRating value={trainer.rating} size={14} tone="dark" />
          <span className="text-xs font-semibold text-bone">{trainer.rating.toFixed(1)}</span>
          <span className="text-xs text-bone/45">({trainer.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-bone/40">From</p>
            <p className="font-display text-3xl leading-none text-volt">
              {formatPrice(trainer.startingPrice)}
              <span className="ml-1 font-sans text-xs font-medium text-bone/45">/ session</span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-bone transition-colors duration-200 group-hover:text-volt">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
