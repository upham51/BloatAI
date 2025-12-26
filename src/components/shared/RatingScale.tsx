import { cn } from '@/lib/utils';
import { RATING_LABELS, RATING_EMOJIS } from '@/types';

interface RatingScaleProps {
  value: number | null;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function RatingScale({ value, onChange, size = 'md', showLabels = true }: RatingScaleProps) {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={cn(
            'rounded-full border-2 flex flex-col items-center justify-center transition-all duration-200 active:scale-90 touch-manipulation',
            sizes[size],
            value === rating
              ? 'border-primary bg-primary text-primary-foreground shadow-medium'
              : 'border-border bg-card text-foreground hover:border-primary/50'
          )}
        >
          <span className="text-lg leading-none">{RATING_EMOJIS[rating]}</span>
          {showLabels && size !== 'sm' && (
            <span className="text-2xs mt-0.5 font-medium opacity-80">
              {rating}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
