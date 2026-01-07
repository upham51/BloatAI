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
    <div className="premium-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-sage/20">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">
              Safe Alternatives
            </h3>
            <p className="text-xs text-muted-foreground">
              Try these instead
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{currentIndex + 1}</span>
          <span>/</span>
          <span>{recommendations.length}</span>
        </div>
      </div>

      {/* Swipeable Card */}
      <div className="relative">
        <div
          className="overflow-hidden rounded-2xl transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${currentRec.color}15, ${currentRec.color}08)`,
            border: `1.5px solid ${currentRec.color}30`,
          }}
        >
          <div className="p-6 space-y-4">
            {/* Header with sparkle */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: currentRec.color }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: currentRec.color }}
                  >
                    Instead of
                  </span>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-1">
                  {currentRec.triggerName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {currentRec.examples}
                </p>
              </div>
            </div>

            {/* Alternative foods grid */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="text-base">✨</span>
                Try these:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {currentRec.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all hover:scale-105 hover:shadow-md group cursor-pointer"
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {alt}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    💚 Pro tip:
                  </span>{' '}
                  Swap gradually, one food at a time, to identify what works best
                  for you.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative gradient edge */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${currentRec.color}, transparent)`,
            }}
          />
        </div>

        {/* Navigation dots */}
        {recommendations.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {recommendations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to recommendation ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe arrows */}
        {recommendations.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={() => handleSwipe('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-2 rounded-full bg-card border border-border shadow-lg hover:scale-110 transition-transform"
                aria-label="Previous recommendation"
              >
                <ChevronRight className="w-5 h-5 text-foreground rotate-180" />
              </button>
            )}
            {currentIndex < recommendations.length - 1 && (
              <button
                onClick={() => handleSwipe('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 p-2 rounded-full bg-card border border-border shadow-lg hover:scale-110 transition-transform"
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
