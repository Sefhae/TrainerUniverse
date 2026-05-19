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
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {trainer.isRemote && (
            <span className="chip bg-ink/85 text-bone backdrop-blur">
              <Globe className="mr-1 h-3 w-3 text-volt" /> Remote
            </span>
          )}
          {trainer.location && (
            <span className="chip bg-ink/85 text-bone backdrop-blur">
              <MapPin className="mr-1 h-3 w-3 text-volt" /> {trainer.location}
            </span>
          )}
          {!trainer.isRemote && !trainer.location && (
            <span className="chip bg-ink/85 text-bone backdrop-blur">
              <MapPin className="mr-1 h-3 w-3 text-volt" /> In-Person
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="font-display text-lg leading-none tracking-wide text-bone sm:text-2xl">{trainer.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-bone/55 sm:mt-2 sm:text-sm">{trainer.tagline || 'Personal Trainer'}</p>

        <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
          {visibleSpecs.map((s) => (
            <span key={s.id} className="chip border border-white/15 text-bone/70">
              {s.name}
            </span>
          ))}
          {extra > 0 && <span className="chip text-volt">+{extra}</span>}
        </div>

        <div className="mt-2 flex items-center gap-1.5 sm:mt-4 sm:gap-2">
          <StarRating value={trainer.rating} size={12} tone="dark" />
          <span className="text-xs font-semibold text-bone">{trainer.rating.toFixed(1)}</span>
          <span className="hidden text-xs text-bone/45 sm:inline">({trainer.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-2 sm:pt-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-bone/40 sm:text-[10px]">From</p>
            <p className="font-display text-xl leading-none text-volt sm:text-3xl">
              {formatPrice(trainer.startingPrice)}
              <span className="ml-0.5 font-sans text-[10px] font-medium text-bone/45 sm:ml-1 sm:text-xs">/ session</span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-bone transition-colors duration-200 group-hover:text-volt sm:text-[11px]">
            View
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1 sm:h-3.5 sm:w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
