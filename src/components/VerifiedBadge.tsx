'use client';

import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/format';

export default function VerifiedBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(false);

  const iconClass = {
    sm: 'h-4 w-4 sm:h-5 sm:w-5',
    md: 'h-5 w-5',
    lg: 'h-9 w-9',
  }[size];

  return (
    <span
      className="relative inline-flex shrink-0 cursor-pointer"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
    >
      <ShieldCheck className={cn(iconClass, 'text-accent')} aria-label="Verified trainer" />

      {open && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 w-56 -translate-x-1/2 border border-accent/30 bg-surface px-3.5 py-3 shadow-2xl">
          <span className="mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Verified Trainer</span>
          </span>
          <span className="block text-[11px] leading-relaxed text-content/70">
            This trainer has passed a background check and had their qualifications, certifications and profile information reviewed and approved by our team.
          </span>
          {/* arrow */}
          <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-accent/30 bg-surface" />
        </span>
      )}
    </span>
  );
}
