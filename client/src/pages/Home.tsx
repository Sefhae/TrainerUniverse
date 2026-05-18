import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import api from '../api/client';
import type { TrainerSummary, TrainersResponse } from '../types';
import TrainerCard from '../components/TrainerCard';
import TrainerCardSkeleton from '../components/TrainerCardSkeleton';
import StarRating from '../components/StarRating';

const ROTATING = ['TRAINER', 'COACH', 'MENTOR', 'PARTNER'];

const STATS = [
  { value: '500+', label: 'Elite Trainers' },
  { value: '10K+', label: 'Sessions Booked' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '4.8', label: 'Average Rating' },
];

const STEPS = [
  {
    n: '01',
    title: 'Browse Trainers',
    text: 'Filter by specialty, price, location and availability to find coaches built around your goals.',
  },
  {
    n: '02',
    title: 'Explore Profiles',
    text: 'Dig into credentials, transformation galleries, real client reviews and transparent pricing.',
  },
  {
    n: '03',
    title: 'Start Training',
    text: 'Book a call, lock in your package, and begin your transformation with a coach who gets you.',
  },
];

const TESTIMONIALS = [
  { quote: 'I found a strength coach in minutes. Six months later I deadlift double what I used to.', name: 'Rachel M.', role: 'Strength client', rating: 5 },
  { quote: 'The reviews and transformation photos made choosing a trainer genuinely easy.', name: 'Daniel R.', role: 'Weight-loss client', rating: 5 },
  { quote: 'My boxing coach is incredible — FitConnect matched me perfectly on the first try.', name: 'Natalie S.', role: 'Boxing client', rating: 5 },
  { quote: 'Remote yoga that actually fits my schedule. I have never been this mobile.', name: 'Olivia T.', role: 'Yoga client', rating: 5 },
  { quote: 'Down 30 pounds and my energy is through the roof. Worth every single session.', name: 'James O.', role: 'Nutrition client', rating: 5 },
  { quote: 'Came back from an ACL injury stronger than before thanks to my rehab coach.', name: 'Chris B.', role: 'Rehab client', rating: 5 },
];

const HERO_SHOTS = [
  { src: 'https://loremflickr.com/820/1080/gym,workout?lock=31', label: 'Strength & Conditioning' },
  { src: 'https://loremflickr.com/720/680/basketball,sport?lock=47', label: 'Basketball' },
  { src: 'https://loremflickr.com/720/680/swimming,pool?lock=58', label: 'Swimming' },
];

function HeroImage({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden bg-charcoal">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-3xl text-white/10">FitConnect</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/90 to-transparent" />
      <span className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-volt">
        {label}
      </span>
    </div>
  );
}

function HeroCollage() {
  return (
    <div className="relative">
      {/* grid-breaking volt accent */}
      <div className="absolute -right-4 -top-4 hidden h-24 w-24 bg-volt sm:block" />

      <div className="relative grid aspect-[5/6] grid-cols-2 grid-rows-2 gap-3">
        <div className="row-span-2 border border-white/10">
          <HeroImage src={HERO_SHOTS[0].src} label={HERO_SHOTS[0].label} />
        </div>
        <div className="border border-white/10">
          <HeroImage src={HERO_SHOTS[1].src} label={HERO_SHOTS[1].label} />
        </div>
        <div className="border border-volt">
          <HeroImage src={HERO_SHOTS[2].src} label={HERO_SHOTS[2].label} />
        </div>
      </div>

      {/* floating rating badge */}
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 border border-white/15 bg-ink px-4 py-3 shadow-2xl shadow-black/40 sm:flex">
        <Star className="h-7 w-7 text-volt" fill="#C8FF00" strokeWidth={0} />
        <div>
          <p className="font-display text-2xl leading-none text-bone">4.8 / 5</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bone/45">
            Average trainer rating
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);
  const [featured, setFeatured] = useState<TrainerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setWordIndex((i) => (i + 1) % ROTATING.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<TrainersResponse>('/trainers', { params: { sort: 'top-rated' } })
      .then((res) => {
        if (!cancelled) setFeatured(res.data.trainers.slice(0, 6));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollCarousel = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-ink text-bone">
        <div className="grain-layer" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8FF00 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:pb-28 lg:pt-24">
          {/* Copy */}
          <div>
            <p className="eyebrow animate-fade-up text-volt">
              <span className="h-px w-8 bg-volt" />
              The Personal Training Marketplace
            </p>

            <h1 className="mt-6 font-display leading-[0.9] tracking-wide">
              <span
                className="animate-fade-up block text-6xl sm:text-7xl xl:text-8xl"
                style={{ animationDelay: '0.08s' }}
              >
                Find Your Perfect
              </span>
              <span
                key={wordIndex}
                className="animate-fade-up mt-1 block text-7xl text-volt sm:text-8xl xl:text-9xl"
              >
                {ROTATING[wordIndex]}
              </span>
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-bone/60 sm:text-lg"
              style={{ animationDelay: '0.16s' }}
            >
              Browse elite coaches in strength, HIIT, yoga, boxing, nutrition and more. Real
              reviews, real results, real transformations — matched to your goals.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '0.24s' }}
            >
              <Link to="/trainers" className="btn btn-volt w-full sm:w-auto">
                Find a Trainer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn btn-outline-light w-full sm:w-auto">
                Become a Trainer
              </Link>
            </div>
          </div>

          {/* Image composition */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HeroCollage />
          </div>
        </div>
      </section>

      {/* ---------- Stats bar ---------- */}
      <section className="bg-volt text-ink">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="px-5 py-10 text-center">
              <p className="font-display text-5xl leading-none tracking-wide lg:text-6xl">{s.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Featured trainers ---------- */}
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-volt">
                <span className="h-px w-8 bg-volt" />
                Top Rated
              </p>
              <h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">
                Featured Trainers
              </h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => scrollCarousel(-1)}
                aria-label="Scroll left"
                className="border border-white/15 p-3 transition-colors duration-200 hover:border-volt hover:text-volt"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                aria-label="Scroll right"
                className="border border-white/15 p-3 transition-colors duration-200 hover:border-volt hover:text-volt"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
          >
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
            <Link to="/trainers" className="btn btn-outline-light">
              View All Trainers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="bg-bone text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="text-center">
            <p className="eyebrow justify-center text-ink/50">
              <span className="h-px w-8 bg-ink/40" />
              How It Works
              <span className="h-px w-8 bg-ink/40" />
            </p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">
              Three Steps to Stronger
            </h2>
          </div>

          <div className="mt-14 grid gap-px bg-ink/10 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="group bg-bone p-8 transition-colors duration-200 lg:p-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-7xl leading-none text-ink/10 transition-colors duration-200 group-hover:text-volt">
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

      {/* ---------- Testimonials ---------- */}
      <section className="overflow-hidden bg-ink text-bone">
        <div className="mx-auto max-w-7xl px-5 pt-20 lg:px-8 lg:pt-28">
          <p className="eyebrow text-volt">
            <span className="h-px w-8 bg-volt" />
            Real Results
          </p>
          <h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">
            What Members Say
          </h2>
        </div>

        <div className="marquee-wrap mt-12 pb-20 lg:pb-28">
          <div className="marquee-track flex w-max gap-5 animate-marquee">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <figure
                key={i}
                className="flex w-[340px] shrink-0 flex-col border border-white/10 bg-charcoal p-7"
              >
                <Quote className="h-7 w-7 text-volt" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-bone/75">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="font-semibold text-bone">{t.name}</p>
                    <p className="text-xs text-bone/45">{t.role}</p>
                  </div>
                  <StarRating value={t.rating} size={13} tone="dark" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-volt text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl">
                Ready to train
                <br />
                like you mean it?
              </h2>
              <p className="mt-5 max-w-md text-base text-ink/70">
                Join thousands of people who found their perfect coach on FitConnect — or grow your
                own training business with us.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/trainers" className="btn btn-dark w-full justify-between">
                Find a Trainer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="btn w-full justify-between border border-ink/30 bg-transparent text-ink hover:bg-ink hover:text-bone"
              >
                Become a Trainer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
