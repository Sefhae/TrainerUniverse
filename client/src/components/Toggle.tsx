import { cn } from '../lib/format';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left disabled:opacity-50"
      aria-pressed={checked}
    >
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 transition-colors duration-200',
          checked ? 'bg-ink' : 'bg-ink/20'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 transition-all duration-200',
            checked ? 'left-6 bg-volt' : 'left-1 bg-white'
          )}
        />
      </span>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-semibold text-ink">{label}</span>}
          {description && <span className="block text-xs text-ink/50">{description}</span>}
        </span>
      )}
    </button>
  );
}
