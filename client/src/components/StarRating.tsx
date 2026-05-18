import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/format';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  tone?: 'light' | 'dark';
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  tone = 'light',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const emptyColor = tone === 'dark' ? 'text-white/20' : 'text-ink/15';
  const display = interactive && hover > 0 ? hover : value;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="inline-flex items-center" style={{ gap: Math.round(size * 0.12) }}>
        {Array.from({ length: max }).map((_, i) => {
          if (interactive) {
            const active = i < display;
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => onChange?.(i + 1)}
                className="transition-transform duration-150 hover:scale-110"
                aria-label={`Rate ${i + 1} of ${max}`}
              >
                <Star
                  style={{ width: size, height: size }}
                  className={active ? 'text-volt' : emptyColor}
                  fill={active ? '#C8FF00' : 'transparent'}
                  strokeWidth={2}
                />
              </button>
            );
          }

          const fill = Math.max(0, Math.min(1, display - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                style={{ width: size, height: size }}
                className={cn('absolute inset-0', emptyColor)}
                fill="currentColor"
                strokeWidth={0}
              />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star
                    style={{ width: size, height: size }}
                    className="text-volt"
                    fill="#C8FF00"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span
          className={cn('font-semibold tabular-nums', tone === 'dark' ? 'text-bone' : 'text-ink')}
          style={{ fontSize: Math.round(size * 0.82) }}
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
