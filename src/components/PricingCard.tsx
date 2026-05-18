import type { PricingPackage } from '../types';
import { cn, formatPrice } from '../lib/format';

interface PricingCardProps {
  pkg: PricingPackage;
  onSelect?: () => void;
}

export default function PricingCard({ pkg, onSelect }: PricingCardProps) {
  const popular = pkg.isPopular;
  const perSession = pkg.sessions > 0 ? pkg.price / pkg.sessions : pkg.price;
  const sessionsLabel =
    pkg.sessions === 0
      ? 'Unlimited sessions'
      : pkg.sessions === 1
        ? 'Single session'
        : `${pkg.sessions} sessions`;

  return (
    <div
      className={cn(
        'relative flex flex-col border bg-charcoal p-7 transition-all duration-200',
        popular ? 'border-volt' : 'border-white/10 hover:border-white/30'
      )}
    >
      {popular && (
        <span className="absolute right-0 top-0 bg-volt px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
          Most Popular
        </span>
      )}

      <h3 className="font-display text-2xl tracking-wide text-bone">{pkg.name}</h3>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-bone/40">
        {sessionsLabel}
      </p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-6xl leading-none text-volt">{formatPrice(pkg.price)}</span>
      </div>
      {pkg.sessions > 1 && (
        <p className="mt-2 text-sm text-bone/50">{formatPrice(perSession)} per session</p>
      )}

      <p className="mt-5 flex-1 text-sm leading-relaxed text-bone/60">{pkg.description}</p>

      <button
        onClick={onSelect}
        className={cn('btn mt-7 w-full', popular ? 'btn-volt' : 'btn-outline-light')}
      >
        Get Started
      </button>
    </div>
  );
}
