import type { Review } from '../types';
import { cn, initials, timeAgo } from '../lib/format';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  tone?: 'light' | 'dark';
}

export default function ReviewCard({ review, tone = 'light' }: ReviewCardProps) {
  const dark = tone === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col border p-6 transition-colors duration-200',
        dark ? 'border-content/10 bg-surface-2 hover:border-content/25' : 'border-ink/10 bg-white'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center font-display text-lg leading-none',
            dark ? 'bg-volt text-ink' : 'bg-ink text-volt'
          )}
        >
          {initials(review.reviewerName)}
        </div>
        <div className="min-w-0">
          <p className={cn('truncate font-semibold leading-tight', dark ? 'text-content' : 'text-ink')}>
            {review.reviewerName}
          </p>
          <p className={cn('text-xs', dark ? 'text-content/40' : 'text-ink/45')}>
            {timeAgo(review.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <StarRating value={review.rating} size={15} tone={tone} />
      </div>

      <p className={cn('mt-3 text-sm leading-relaxed', dark ? 'text-content/70' : 'text-ink/70')}>
        &ldquo;{review.comment}&rdquo;
      </p>
    </div>
  );
}
