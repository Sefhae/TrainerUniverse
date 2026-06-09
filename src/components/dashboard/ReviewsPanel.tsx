import type { Trainer } from '@/lib/types';
import StarRating from '@/components/StarRating';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';

export default function ReviewsPanel({ trainer }: { trainer: Trainer }) {
  const { reviews, rating, reviewCount } = trainer;

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-3xl tracking-wide">Your Reviews</h2>
        <p className="mt-1 text-sm text-ink/55">
          Reviews are posted by clients and visitors — they cannot be edited or removed.
        </p>
      </header>

      {reviewCount > 0 && (
        <div className="mb-6 flex items-center gap-5 border border-ink/10 bg-white p-6">
          <p className="font-display text-6xl leading-none text-ink">{rating.toFixed(1)}</p>
          <div>
            <StarRating value={rating} size={20} />
            <p className="mt-1.5 text-sm text-ink/55">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} received
            </p>
          </div>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} tone="light" />
          ))}
        </div>
      ) : (
        <div className="border border-ink/10 bg-white">
          <EmptyState
            title="No Reviews Yet"
            message="Once clients leave reviews on your public profile, they'll appear here."
          />
        </div>
      )}
    </div>
  );
}
