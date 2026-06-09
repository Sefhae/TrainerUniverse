'use client';

import { useState, type FormEvent } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import api from '@/lib/client';
import { useToast } from '@/hooks/useToast';
import { cn, getApiError } from '@/lib/format';
import type { Review } from '@/lib/types';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  trainerId: number;
  trainerName: string;
  onSubmitted: (review: Review) => void;
}

export default function ReviewModal({
  open,
  onClose,
  trainerId,
  trainerName,
  onSubmitted,
}: ReviewModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setRating(0);
    setComment('');
    setErrors({});
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name.';
    if (rating < 1) e.rating = 'Please select a star rating.';
    if (comment.trim().length < 10) e.comment = 'Please write at least 10 characters.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const { data } = await api.post<Review>(`/trainers/${trainerId}/reviews`, {
        reviewerName: name.trim(),
        rating,
        comment: comment.trim(),
      });
      toast.success('Thanks! Your review has been posted.');
      onSubmitted(data);
      reset();
      onClose();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Leave a Review" subtitle={`Share your experience with ${trainerName}`}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label className="field-label" htmlFor="review-name">
            Your Name
          </label>
          <input
            id="review-name"
            className={cn('field-input', errors.name && 'field-input-invalid')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: '' }));
            }}
            placeholder="Jordan Avery"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="field-label">Your Rating</label>
          <div className="flex items-center gap-3 border border-ink/15 bg-white px-4 py-3">
            <StarRating
              value={rating}
              interactive
              size={30}
              onChange={(v) => {
                setRating(v);
                setErrors((p) => ({ ...p, rating: '' }));
              }}
            />
            <span className="text-sm font-medium text-ink/55">
              {rating > 0 ? `${rating} / 5` : 'Tap to rate'}
            </span>
          </div>
          {errors.rating && <p className="field-error">{errors.rating}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="review-comment">
            Your Review
          </label>
          <textarea
            id="review-comment"
            rows={4}
            className={cn('field-input resize-none', errors.comment && 'field-input-invalid')}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setErrors((p) => ({ ...p, comment: '' }));
            }}
            placeholder="What was your experience like? What results did you see?"
          />
          {errors.comment && <p className="field-error">{errors.comment}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn btn-outline-dark flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-volt flex-1">
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
            ) : (
              'Post Review'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
