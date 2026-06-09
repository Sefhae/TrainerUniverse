import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

interface EmptyStateProps {
  title: string;
  message: string;
  tone?: 'light' | 'dark';
  action?: ReactNode;
}

function DumbbellArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="square"
      className={className}
    >
      <line x1="22" y1="32" x2="42" y2="32" />
      <rect x="14" y="22" width="9" height="20" />
      <rect x="41" y="22" width="9" height="20" />
      <rect x="7" y="26" width="7" height="12" />
      <rect x="50" y="26" width="7" height="12" />
    </svg>
  );
}

export default function EmptyState({ title, message, tone = 'light', action }: EmptyStateProps) {
  const dark = tone === 'dark';
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div
        className={cn(
          'flex h-24 w-24 items-center justify-center border',
          dark ? 'border-content/10 bg-content/[0.03]' : 'border-ink/10 bg-ink/[0.03]'
        )}
      >
        <DumbbellArt className={cn('h-11 w-11', dark ? 'text-content/25' : 'text-ink/25')} />
      </div>
      <h3
        className={cn(
          'mt-7 font-display text-3xl tracking-wide',
          dark ? 'text-content' : 'text-ink'
        )}
      >
        {title}
      </h3>
      <p className={cn('mt-2 max-w-sm text-sm leading-relaxed', dark ? 'text-content/50' : 'text-ink/55')}>
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
