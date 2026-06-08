'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import api from '../src/api/client';
import type { TrainerSummary, TrainersResponse } from '../src/types';
import TrainerCard from '../src/components/TrainerCard';
import TrainerCardSkeleton from '../src/components/TrainerCardSkeleton';
import StarRating from '../src/components/StarRating';
import HeroSearch from '../src/components/HeroSearch';
import { useT } from '../src/hooks/useLanguage';
import { useSyncedRotation } from '../src/hooks/useSyncedRotation';

const TESTIMONIALS = [
  { quote: 'I found a strength coach in minutes. Six months later I deadlift double what I used to.', name: 'Rachel M.', role: 'Strength client', rating: 5 },
  { quote: 'My maths tutor took me from failing to top of my class in one term. Genuinely life-changing.', name: 'Amir K.', role: 'Mathematics student', rating: 5 },
  { quote: 'My boxing coach is incredible — TrainerUniverse matched me perfectly on the first try.', name: 'Natalie S.', role: 'Boxing client', rating: 5 },
  { quote: 'Remote yoga that actually fits my schedule. I have never been this mobile.', name: 'Olivia T.', role: 'Yoga client', rating: 5 },
  { quote: 'Zero coding knowledge to landing a junior dev role — my programming coach made it happen.', name: 'Sam L.', role: 'Programming student', rating: 5 },
  { quote: 'Came back from an ACL injury stronger than before thanks to my rehab coach.', name: 'Chris B.', role: 'Rehab client', rating: 5 },
  { quote: 'My graphic design mentor helped me build a portfolio that got me freelance clients within weeks.', name: 'Maya R.', role: 'Design student', rating: 5 },
  { quote: 'Down 30 pounds and my energy is through the roof. Worth every single session.', name: 'James O.', role: 'Nutrition client', rating: 5 },
];

const HERO_SRCS = [
  'https://loremflickr.com/820/1080/sport,athlete?lock=100',
  'https://loremflickr.com/720/680/yoga,wellness?lock=101',
  'https://loremflickr.com/720/680/computer,coding?lock=61',
];

function HeroImage({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden bg-surface-2">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-3xl text-content/10">TrainerUniverse</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface/90 to-transparent" />
      <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
        {label}
      </span>
    </div>
  );
}

function HeroCollage({ avgRatingLabel, shots }: { avgRatingLabel: string; shots: readonly string[] }) {
  return (
    <div className="relative">
      <div className="absolute -right-4 -top-4 hidden h-24 w-24 bg-volt sm:block" />
      <div className="relative grid aspect-[5/6] grid-cols-2 grid-rows-2 gap-3">
        <div className="row-span-2 border border-content/10">
          <HeroImage src={HERO_SRCS[0]} label={shots[0]} />
        </div>
        <div className="border border-content/10">
          <HeroImage src={HERO_SRCS[1]} label={shots[1]} />
        </div>
        <div className="border border-volt">
          <HeroImage src={HERO_SRCS[2]} label={shots[2]} />
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 border border-content/15 bg-surface px-4 py-3 shadow-2xl shadow-black/40 sm:flex">
        <Star className="h-7 w-7 text-accent" fill="#C8FF00" strokeWidth={0} />
        <div>
          <p className="font-display text-2xl leading-none text-content">4.8 / 5</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-content/45">
            {avgRatingLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const t = useT();
  const wordIndex = useSyncedRotation(t.home.rotating.length);
  const [featured, setFeatured] = useState<TrainerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<TrainersResponse>('/trainers', { params: { sort: 'top-rated' } })
      .then((res) => { if (!cancelled) setFeatured(res.data.trainers.slice(0, 6)); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scrollCarousel = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Search-first landing */}
      <HeroSearch />

      {/* Hero */}
      <section id="discover" className="relative overflow-hidden bg-surface text-content scroll-mt-[72px]">
        <div className="grain-layer" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <p className="eyebrow animate-fade-up text-accent">
              <span className="h-px w-8 bg-volt" />
              {t.home.eyebrow}
            </p>
            <h1 className="mt-6 font-display leading-[0.9] tracking-wide">
              <span className="animate-fade-up block text-6xl sm:text-7xl xl:text-8xl" style={{ animationDelay: '0.08s' }}>
                {t.home.heroLine1}
              </span>
              <span
                key={`${wordIndex}-${t.home.rotating[wordIndex]}`}
                className="animate-fade-up mt-1 inline-block text-7xl text-accent sm:text-8xl xl:text-9xl theme-light:bg-volt theme-light:px-3 theme-light:text-ink"
              >
                {t.home.rotating[wordIndex]}
              </span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-content/60 sm:text-lg" style={{ animationDelay: '0.16s' }}>
              {t.home.heroDesc}
            </p>
            <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '0.24s' }}>
              <Link href="/trainers" className="btn btn-volt w-full sm:w-auto">
                {t.home.findTrainer}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="btn btn-outline-light w-full sm:w-auto">
                {t.home.becomeTrainer}
              </Link>
            </div>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HeroCollage avgRatingLabel={t.home.avgRatingLabel} shots={t.home.heroShots} />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-volt text-ink">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px lg:grid-cols-4">
          {t.home.stats.map((s) => (
            <div key={s.label} className="px-5 py-10 text-center">
              <p className="font-display text-5xl leading-none tracking-wide lg:text-6xl">{s.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured trainers */}
      <section className="bg-surface text-content">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-accent">
                <span className="h-px w-8 bg-volt" />
                {t.home.featuredEyebrow}
              </p>
              <h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">
                {t.home.featuredTitle}
              </h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => scrollCarousel(-1)}
                aria-label={t.home.scrollLeft}
                className="border border-content/15 p-3 transition-colors duration-200 hover:border-volt hover:text-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                aria-label={t.home.scrollRight}
                className="border border-content/15 p-3 transition-colors duration-200 hover:border-volt hover:text-accent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div ref={carouselRef} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[290px] shrink-0 snap-start">
                    <TrainerCardSkeleton />
                  </div>
                ))
              : featured.map((trainer) => (
                  <div key={trainer.id} className="w-[290px] shrink-0 snap-start">
                    <TrainerCard trainer={trainer} />
                  </div>
                ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/trainers" className="btn btn-outline-light">
              {t.home.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bone text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="text-center">
            <p className="eyebrow justify-center text-ink/50">
              <span className="h-px w-8 bg-ink/40" />
              {t.home.howEyebrow}
              <span className="h-px w-8 bg-ink/40" />
            </p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">
              {t.home.howTitle}
            </h2>
          </div>
          <div className="mt-14 grid gap-px bg-ink/10 md:grid-cols-3">
            {t.home.steps.map((step) => (
              <div key={step.n} className="group bg-bone p-8 transition-colors duration-200 lg:p-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-7xl leading-none text-ink/10 transition-colors duration-200 group-hover:text-accent">
                    {step.n}
                  </span>
                  <span className="h-px flex-1 bg-ink/15" />
                </div>
                <h3 className="mt-6 font-display text-3xl tracking-wide">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="overflow-hidden bg-surface text-content">
        <div className="mx-auto max-w-7xl px-5 pt-20 lg:px-8 lg:pt-28">
          <p className="eyebrow text-accent">
            <span className="h-px w-8 bg-volt" />
            {t.home.testimonialsEyebrow}
          </p>
          <h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">
            {t.home.testimonialsTitle}
          </h2>
        </div>
        <div className="marquee-wrap mt-12 pb-20 lg:pb-28">
          <div className="marquee-track flex w-max gap-5 animate-marquee">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, i) => (
              <figure key={i} className="flex w-[340px] shrink-0 flex-col border border-content/10 bg-surface-2 p-7">
                <Quote className="h-7 w-7 text-accent" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-content/75">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between border-t border-content/10 pt-4">
                  <div>
                    <p className="font-semibold text-content">{testimonial.name}</p>
                    <p className="text-xs text-content/45">{testimonial.role}</p>
                  </div>
                  <StarRating value={testimonial.rating} size={13} tone="dark" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-volt text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl">
                {t.home.ctaTitle1}
                <br />
                {t.home.ctaTitle2}
              </h2>
              <p className="mt-5 max-w-md text-base text-ink/70">{t.home.ctaDesc}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/trainers" className="btn btn-dark w-full justify-between">
                {t.home.findTrainer}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="btn w-full justify-between border border-ink/30 bg-transparent text-ink hover:bg-ink hover:text-bone"
              >
                {t.home.becomeTrainer}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
