'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useT } from '@/hooks/useLanguage';
import { cn } from '@/lib/format';

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-content/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 py-5 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            'text-base font-semibold leading-snug transition-colors duration-200',
            open ? 'text-accent' : 'text-content'
          )}
        >
          {q}
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0 text-content/40 transition-transform duration-300',
            open && 'rotate-180 text-accent'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-96 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-sm leading-relaxed text-content/60">{a}</p>
      </div>
    </div>
  );
}

function FaqSection({
  title,
  items,
  index,
}: {
  title: string;
  items: readonly { q: string; a: string }[];
  index: number;
}) {
  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <h2 className="mb-1 font-display text-3xl tracking-wide text-content sm:text-4xl">{title}</h2>
      <div className="mt-5 border border-content/10 bg-surface-2 px-6">
        {items.map((item) => (
          <AccordionItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}

export default function FaqPage() {
  const t = useT();

  return (
    <div className="min-h-screen bg-surface text-content">
      {/* Header */}
      <div className="border-b border-content/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="eyebrow text-accent">
            <span className="h-px w-8 bg-accent" />
            {t.faq.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-6xl leading-none tracking-wide sm:text-7xl lg:text-8xl">
            {t.faq.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-content/55">{t.faq.desc}</p>
        </div>
      </div>

      {/* FAQ sections */}
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-10">
          <FaqSection title={t.faq.clientsTitle} items={t.faq.clients} index={0} />
          <FaqSection title={t.faq.trainersTitle} items={t.faq.trainers} index={1} />
        </div>

        {/* CTA strip */}
        <div className="mt-20 grid gap-4 border border-volt/20 bg-volt/5 p-8 sm:grid-cols-2 sm:items-center sm:gap-8 lg:p-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {t.faq.eyebrow}
            </p>
            <h3 className="mt-2 font-display text-3xl tracking-wide text-content sm:text-4xl">
              {t.nav.findTrainer}
            </h3>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            {/* Inner wrapper sizes to the wider button; both buttons fill it so
                they end up the same width. */}
            <div className="flex w-full flex-col gap-3 sm:w-fit">
              <Link href="/trainers" className="btn btn-volt w-full">
                {t.nav.findTrainer}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="btn btn-outline-light w-full">
                {t.nav.becomeTrainer}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
