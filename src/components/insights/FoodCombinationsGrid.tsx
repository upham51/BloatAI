import { AlertCircle, ArrowRight } from 'lucide-react';
import { CombinationInsight } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';

interface FoodCombinationsGridProps {
  combinations: CombinationInsight[];
}

export function FoodCombinationsGrid({ combinations }: FoodCombinationsGridProps) {
  if (combinations.length === 0) {
    return null;
  }

  // Show max 4 combinations in a 2x2 grid
  const displayedCombinations = combinations.slice(0, 4);

  return (
    <div className="premium-card p-6 shadow-sm rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral/30 to-coral/10">
          <AlertCircle className="w-5 h-5 text-coral" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-foreground text-xl">Worse Together</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Food combinations that amplify bloating
          </p>
        </div>
      </div>

      {/* Grid of combinations */}
      <div className="grid grid-cols-2 gap-3">
        {displayedCombinations.map((combo, index) => {
          const trigger1Info = getTriggerCategory(combo.triggers[0]);
          const trigger2Info = getTriggerCategory(combo.triggers[1]);
          const impact = combo.avgBloatingTogether - combo.avgBloatingSeparate;

          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-br from-coral/5 to-transparent border border-coral/20 hover:border-coral/40 transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeIn 0.5s ease-out',
              }}
            >
              {/* Combination display */}
              <div className="space-y-2 mb-3">
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground truncate">
                    {trigger1Info?.displayName || combo.triggers[0]}
                  </div>
                  <div className="text-xs text-muted-foreground my-1">+</div>
                  <div className="text-sm font-bold text-foreground truncate">
                    {trigger2Info?.displayName || combo.triggers[1]}
                  </div>
                </div>
              </div>

              {/* Impact badge */}
              <div className="flex justify-center mb-3">
                <div className="px-3 py-1.5 rounded-full bg-coral text-white text-xs font-bold shadow-sm">
                  +{impact.toFixed(1)} Impact
                </div>
              </div>

              {/* Sparkline comparison */}
              <div className="space-y-1.5">
                {/* Separately */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Separately</span>
                    <span className="font-semibold text-primary">{combo.avgBloatingSeparate}</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(combo.avgBloatingSeparate / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Together */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Together</span>
                    <span className="font-semibold text-coral">{combo.avgBloatingTogether}</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-coral rounded-full transition-all duration-500"
                      style={{ width: `${(combo.avgBloatingTogether / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Occurrences */}
              <div className="text-center mt-3 pt-3 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                  {combo.occurrences}x observed
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more indicator if there are more than 4 combinations */}
      {combinations.length > 4 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            +{combinations.length - 4} more combination{combinations.length - 4 !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
