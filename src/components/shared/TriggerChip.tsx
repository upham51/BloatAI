import { cn } from '@/lib/utils';
import { TRIGGER_DISPLAY } from '@/types';

interface TriggerChipProps {
  category: string;
  food: string;
  confidence?: number;
  size?: 'sm' | 'md';
}

export function TriggerChip({ category, food, confidence, size = 'md' }: TriggerChipProps) {
  const display = TRIGGER_DISPLAY[category] || { name: category, color: 'bg-muted text-foreground' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        display.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <span className="capitalize">{food}</span>
      {confidence !== undefined && (
        <span className="opacity-70 text-2xs">({confidence}%)</span>
      )}
    </span>
  );
}
