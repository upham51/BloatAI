import { cn } from '@/lib/utils';
import { getTriggerCategory } from '@/types';

interface TriggerChipProps {
  category: string;
  food: string;
  confidence?: number;
  size?: 'sm' | 'md';
}

export function TriggerChip({ category, food, confidence, size = 'md' }: TriggerChipProps) {
  const categoryInfo = getTriggerCategory(category);
  const bgColor = categoryInfo?.color ? `${categoryInfo.color}20` : 'hsl(var(--muted))';
  const textColor = categoryInfo?.color || 'hsl(var(--foreground))';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      style={{ 
        backgroundColor: bgColor,
        color: textColor 
      }}
    >
      <span className="capitalize">{food}</span>
      {confidence !== undefined && (
        <span className="opacity-70 text-2xs">({confidence}%)</span>
      )}
    </span>
  );
}
