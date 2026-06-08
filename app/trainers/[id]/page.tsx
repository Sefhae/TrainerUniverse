'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Award, CalendarCheck, Clock, Globe, MapPin, MessageCircle, Star } from 'lucide-react';
import VerifiedBadge from '../../../src/components/VerifiedBadge';
import api from '../../../src/api/client';
import type { Review, Trainer } from '../../../src/types';
import { cn, formatPrice, initials, resolveImage } from '../../../src/lib/format';
import StarRating from '../../../src/components/StarRating';
import PricingCard from '../../../src/components/PricingCard';
import WorkGallery from '../../../src/components/WorkGallery';
import ReviewCard from '../../../src/components/ReviewCard';
import AvailabilityCalendar from '../../../src/components/AvailabilityCalendar';
import EmptyState from '../../../src/components/EmptyState';
import BookingModal from '../../../src/components/BookingModal';
import MessageModal from '../../../src/components/MessageModal';
import ReviewModal from '../../../src/components/ReviewModal';

function SectionHeading({
  eyebrow,
  title,
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <div>
      <p className={cn('eyebrow', tone === 'dark' ? 'text-accent' : 'text-ink/50')}>
        <span className={cn('h-px w-8', tone === 'dark' ? 'bg-accent' : 'bg-ink/40')} />
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-4xl leading-none tracking-wide sm:text-5xl',
          tone === 'dark' ? 'text-content' : 'text-ink'
        )}
      >
        {title}
      </h2>
    </div>
  );
}

export default function TrainerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    window.scrollTo(0, 0);
    api
      .get<Trainer>(`/trainers/${id}`)
      .then((res) => {
        if (!cancelled) setTrainer(res.data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleReviewSubmitted = (review: Review) => {
    setTrainer((t) => {
      if (!t) return t;
      const reviews = [review, ...t.reviews];
      const reviewCount = reviews.length;
      const rating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10;
      return { ...t, reviews, reviewCount, rating };
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="h-6 w-32 animate-pulse bg-content/10" />
          <div className="mt-10 flex flex-col gap-8 sm:flex-row">
            <div className="h-56 w-56 shrink-0 animate-pulse bg-content/10" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-14 w-2/3 animate-pulse bg-content/10" />
              <div className="h-5 w-1/2 animate-pulse bg-content/5" />
              <div className="h-5 w-40 animate-pulse bg-content/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !trainer) {
    return (
      <div className="min-h-[78vh] bg-surface">
        <EmptyState
          tone="dark"
          title="Trainer Not Found"
          message="We couldn't find this trainer. They may have removed their profile."
          action={
            <Link href="/trainers" className="btn btn-volt">
              Browse All Trainers
            </Link>
          }
        />
      </div>
    );
  }

  const cover = resolveImage(trainer.coverPhoto);
  const photo = resolveImage(trainer.profilePhoto);
  const visibleWork = trainer.previousWork.filter((w) => w.isVisible);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface text-content">
        {cover && (
          <div className="absolute inset-0">
            <img src={cover} alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/85 to-surface/60" />
          </div>
        )}
        <div className="grain-layer" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <Link
            href="/trainers"
            className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-content/55 transition-colors duration-200 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            All Trainers
          </Link>

          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end">
            <div className="h-48 w-48 shrink-0 overflow-hidden border-2 border-accent bg-surface-2 lg:h-56 lg:w-56">
              {photo ? (
                <img src={photo} alt={trainer.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-6xl text-white/15">
                    {initials(trainer.name)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              {!trainer.isPublished && (
                <span className="chip mb-3 bg-yellow-400/20 text-yellow-300">Unpublished Profile</span>
              )}
              <div className="flex flex-wrap gap-1.5">
                {trainer.specialties.map((s) => (
                  <span key={s.id} className="chip border border-content/20 text-content/80">
                    {s.name}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 font-display text-6xl leading-[0.92] tracking-wide sm:text-7xl lg:text-8xl">
                {trainer.name}
                {trainer.isVerified && (
                  <span className="ml-3 inline-block align-middle">
                    <VerifiedBadge size="lg" />
                  </span>
                )}
              </h1>
              <p className="mt-2 max-w-2xl text-base text-content/65 sm:text-lg">{trainer.tagline}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <StarRating value={trainer.rating} size={16} tone="dark" />
                  <span className="font-semibold text-content">{trainer.rating.toFixed(1)}</span>
                  <span className="text-content/45">({trainer.reviewCount} reviews)</span>
                </span>
                {trainer.isRemote && (
                  <span className="flex items-center gap-1.5 text-content/65">
                    <Globe className="h-4 w-4 text-accent" /> Remote Available
                  </span>
                )}
                {trainer.location && (
                  <span className="flex items-center gap-1.5 text-content/65">
                    <MapPin className="h-4 w-4 text-accent" /> {trainer.location}
                  </span>
                )}
                {!trainer.isRemote && !trainer.location && (
                  <span className="flex items-center gap-1.5 text-content/65">
                    <MapPin className="h-4 w-4 text-accent" /> In-Person
                  </span>
                )}
                <span className="text-content/65">{trainer.yearsExperience} years experience</span>
              </div>
            </div>

            <div className="sm:pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-content/40">
                Starting from
              </p>
              <p className="font-display text-5xl leading-none text-accent">
                {formatPrice(trainer.startingPrice)}
                <span className="ml-1 font-sans text-sm font-medium text-content/50">/ session</span>
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[12px] text-content/55">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Responds {trainer.responseTime}
              </p>
              <button onClick={() => setContactOpen(true)} className="btn btn-volt mt-4 w-full">
                <CalendarCheck className="h-4 w-4" />
                Book a Session
              </button>
              <button onClick={() => setMessageOpen(true)} className="btn btn-outline-light mt-2 w-full">
                <MessageCircle className="h-4 w-4" />
                Send a Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-bone text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
            <div>
              <SectionHeading eyebrow="About" title="Meet Your Coach" />
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink/70">
                {trainer.bio || 'This trainer has not written a bio yet.'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-px self-start border border-ink/10 bg-ink/10 lg:grid-cols-1">
              {[
                { value: `${trainer.yearsExperience}`, label: 'Years Coaching' },
                { value: `${trainer.reviewCount}`, label: 'Client Reviews' },
                { value: trainer.rating.toFixed(1), label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-bone px-5 py-6 text-center lg:text-left">
                  <p className="font-display text-5xl leading-none text-ink">{stat.value}</p>
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-ink text-content">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <SectionHeading eyebrow="Pricing" title="Training Packages" tone="dark" />
          {trainer.packages.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {trainer.packages.map((pkg) => (
                <PricingCard key={pkg.id} pkg={pkg} onSelect={() => setContactOpen(true)} />
              ))}
            </div>
          ) : (
            <EmptyState
              tone="dark"
              title="No Packages Yet"
              message="This trainer has not published any pricing packages."
            />
          )}
        </div>
      </section>

      {/* Transformation gallery */}
      <section className="bg-bone text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <SectionHeading eyebrow="Previous Work" title="Transformation Gallery" />
          {visibleWork.length > 0 ? (
            <>
              <p className="mt-4 max-w-xl text-sm text-ink/55">
                Real results from real clients — every transformation below is shared with the
                client&apos;s consent.
              </p>
              <div className="mt-10">
                <WorkGallery items={visibleWork} />
              </div>
            </>
          ) : (
            <EmptyState
              title="No Transformations Yet"
              message="This trainer has not added any case studies to their profile."
            />
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-ink text-content">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Reviews" title="Client Reviews" tone="dark" />
            <button onClick={() => setReviewOpen(true)} className="btn btn-volt self-start sm:self-auto">
              <Star className="h-4 w-4" />
              Leave a Review
            </button>
          </div>

          <div className="mt-8 flex items-center gap-5 border-y border-content/10 py-6">
            <p className="font-display text-7xl leading-none text-accent">
              {trainer.rating.toFixed(1)}
            </p>
            <div>
              <StarRating value={trainer.rating} size={20} tone="dark" />
              <p className="mt-1.5 text-sm text-content/55">
                Based on {trainer.reviewCount} {trainer.reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {trainer.reviews.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {trainer.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} tone="dark" />
              ))}
            </div>
          ) : (
            <EmptyState
              tone="dark"
              title="No Reviews Yet"
              message="Be the first to share your experience with this trainer."
              action={
                <button onClick={() => setReviewOpen(true)} className="btn btn-volt">
                  Write a Review
                </button>
              }
            />
          )}
        </div>
      </section>

      {/* Credentials + availability */}
      <section className="bg-bone text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Credentials" title="Certifications" />
              {trainer.certifications.length > 0 ? (
                <ul className="mt-8 space-y-3">
                  {trainer.certifications.map((cert) => (
                    <li key={cert.id} className="flex items-start gap-4 border border-ink/10 bg-white p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-volt">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold leading-snug text-ink">{cert.name}</p>
                        <p className="mt-0.5 text-sm text-ink/55">
                          {cert.issuer}
                          {cert.year ? ` · ${cert.year}` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-8 border border-ink/10 bg-white p-8 text-center text-sm text-ink/50">
                  No certifications listed.
                </p>
              )}
            </div>

            <div>
              <SectionHeading eyebrow="Schedule" title="General Availability" />
              <p className="mt-4 text-sm text-ink/55">
                A snapshot of when this trainer typically takes sessions. Reach out to confirm exact
                times.
              </p>
              <div className="mt-6">
                <AvailabilityCalendar availability={trainer.availability} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        trainerId={trainer.id}
        trainerName={trainer.name}
        packages={trainer.packages}
      />
      <MessageModal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        trainerId={trainer.id}
        trainerName={trainer.name}
      />
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        trainerId={trainer.id}
        trainerName={trainer.name}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
