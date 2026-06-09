import { DAY_PARTS, WEEK_DAYS } from '@/lib/constants';
import { cn } from '@/lib/format';

export default function AvailabilityCalendar({ availability }: { availability: string[] }) {
  if (!availability || availability.length === 0) {
    return (
      <div className="border border-ink/10 bg-white p-8 text-center text-sm text-ink/50">
        This trainer has not shared their general availability yet.
      </div>
    );
  }

  const hasWeekdays = availability.includes('weekdays');
  const hasWeekends = availability.includes('weekends');
  const activeParts = DAY_PARTS.filter((p) => availability.includes(p.value));
  const parts = activeParts.length > 0 ? activeParts.map((p) => p.value) : DAY_PARTS.map((p) => p.value);

  const dayActive = (dayIndex: number) => {
    const isWeekend = dayIndex >= 5;
    if (isWeekend) return hasWeekends;
    return hasWeekdays || (!hasWeekdays && !hasWeekends);
  };

  return (
    <div className="border border-ink/10 bg-white p-5 sm:p-6">
      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1.5">
        <div />
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-ink/45"
          >
            {d}
          </div>
        ))}

        {DAY_PARTS.map((part) => (
          <div key={part.value} className="contents">
            <div className="flex items-center pr-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/45">
              {part.label}
            </div>
            {WEEK_DAYS.map((d, dayIndex) => {
              const lit = dayActive(dayIndex) && parts.includes(part.value);
              return (
                <div
                  key={d + part.value}
                  className={cn('h-9 transition-colors duration-200', lit ? 'bg-volt' : 'bg-ink/[0.06]')}
                  title={`${d} ${part.label}${lit ? ' — available' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-ink/10 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-volt" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55">
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 bg-ink/[0.06]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/40">
            Unavailable
          </span>
        </div>
      </div>
    </div>
  );
}
