import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isSelected = value !== null && rating <= value;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={cn(
              'rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 touch-manipulation group',
              sizes[size],
              isSelected
                ? 'bg-primary/10 hover:bg-primary/15'
                : 'hover:bg-muted'
            )}
          >
            <Star
              className={cn(
                'transition-all duration-200',
                starSizes[size],
                isSelected
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
