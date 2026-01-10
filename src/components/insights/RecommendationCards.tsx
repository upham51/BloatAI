import { useState } from 'react';
import { ChevronRight, Heart, Sparkles } from 'lucide-react';
import { getSafeAlternatives } from '@/lib/triggerUtils';
import { getTriggerCategory } from '@/types';

interface RecommendationCardsProps {
  topTriggers: string[]; // Array of trigger category IDs
}

export function RecommendationCards({ topTriggers }: RecommendationCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (topTriggers.length === 0) {
    return null;
  }

  const recommendations = topTriggers.slice(0, 3).map((triggerId) => {
    const category = getTriggerCategory(triggerId);
    const alternatives = getSafeAlternatives(triggerId);

    return {
      triggerId,
      triggerName: category?.displayName || triggerId,
      alternatives: alternatives.slice(0, 6),
      color: category?.color || '#7FB069',
      examples: category?.examples || '',
    };
  });

  const currentRec = recommendations[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'left' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="premium-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-mint/30 to-sage/20">
            <Heart className="w-5 h-5 text-mint" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">
              Safe Alternatives
            </h3>
            <p className="text-xs text-muted-foreground">
              Better choices for your gut
            </p>
          </div>
        </div>
        {recommendations.length > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30">
            <span className="font-bold text-foreground text-sm">{currentIndex + 1}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{recommendations.length}</span>
          </div>
        )}
      </div>

      {/* Swipeable Card */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-lavender/10 via-mint/5 to-sage/10 border border-border/50 transition-all duration-300">
          <div className="p-6 space-y-5">
            {/* Header section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  Instead of
                </span>
              </div>
              <div className="flex items-start gap-3">
                <h4 className="text-2xl font-bold text-foreground">
                  {currentRec.triggerName}
                </h4>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {currentRec.examples}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/30" />

            {/* Alternative foods grid */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <p className="text-sm font-bold text-foreground">
                  Try these instead:
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {currentRec.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="group p-4 rounded-xl bg-card border border-border/50 hover:border-mint/50 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-foreground group-hover:text-mint transition-colors">
                      {alt}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro tip section */}
            <div className="p-4 rounded-xl bg-mint/5 border border-mint/20">
              <p className="text-xs leading-relaxed">
                <span className="font-bold text-foreground">💚 Pro tip:</span>{' '}
                <span className="text-muted-foreground">
                  Swap gradually, one food at a time, to identify what works best for you.
                </span>
              </p>
            </div>
          </div>

          {/* Premium bottom accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-mint via-sage to-lavender" />
        </div>

        {/* Navigation dots */}
        {recommendations.length > 1 && (
          <div className="flex items-center justify-center gap-2.5 mt-5">
            {recommendations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-8 h-2.5 bg-primary shadow-sm'
                    : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to recommendation ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe arrows - improved design */}
        {recommendations.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={() => handleSwipe('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-3 rounded-full bg-card border-2 border-border/50 shadow-xl hover:scale-110 hover:border-primary/50 transition-all"
                aria-label="Previous recommendation"
              >
                <ChevronRight className="w-5 h-5 text-foreground rotate-180" />
              </button>
            )}
            {currentIndex < recommendations.length - 1 && (
              <button
                onClick={() => handleSwipe('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-3 rounded-full bg-card border-2 border-border/50 shadow-xl hover:scale-110 hover:border-primary/50 transition-all"
                aria-label="Next recommendation"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
