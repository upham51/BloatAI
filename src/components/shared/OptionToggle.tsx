import { cn } from '@/lib/utils';

interface Option<T> {
  value: T;
  label: string;
  emoji: string;
}

interface OptionToggleProps<T extends string> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label: string;
}

export function OptionToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: OptionToggleProps<T>) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className={`grid gap-2 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 active:scale-95 touch-manipulation',
              value === option.value
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/50'
            )}
          >
            <span className="text-xl">{option.emoji}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
