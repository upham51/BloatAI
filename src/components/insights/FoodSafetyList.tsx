import { useMemo } from 'react';
import { MealEntry } from '@/types';
import { getIconForTrigger, abbreviateIngredient } from '@/lib/triggerUtils';
import { isHighBloating, isLowBloating, HIGH_BLOATING_THRESHOLD } from '@/lib/bloatingUtils';
import { TriggerFrequency } from '@/lib/insightsAnalysis';

interface FoodSafetyListProps {
  entries: MealEntry[];
  potentialTriggers?: TriggerFrequency[];
}

interface FoodInsight {
  food: string;
  icon: string;
  count: number;
  safetyLevel: 'safe' | 'caution' | 'danger';
  isPotentialTrigger: boolean;
}

export function FoodSafetyList({ entries, potentialTriggers = [] }: FoodSafetyListProps) {
  const foodInsights = useMemo(() => {
    const foodStats: Record<
      string,
      { bloatScores: number[]; count: number }
    > = {};

    // Analyze only completed entries
    const completedEntries = entries.filter(
      (e) => e.rating_status === 'completed' && e.bloating_rating
    );

    completedEntries.forEach((entry) => {
      entry.detected_triggers?.forEach((trigger) => {
        const rawFoodName = trigger.food || trigger.category;
        const foodName = abbreviateIngredient(rawFoodName);
        if (!foodStats[foodName]) {
          foodStats[foodName] = { bloatScores: [], count: 0 };
        }
        if (entry.bloating_rating) {
          foodStats[foodName].bloatScores.push(entry.bloating_rating);
          foodStats[foodName].count += 1;
        }
      });
    });

    // Create food insights list
    const insights: FoodInsight[] = [];

    Object.entries(foodStats).forEach(([food, stats]) => {
      // Need at least 2 data points
      if (stats.count < 2) return;

      const avgBloating =
        stats.bloatScores.reduce((sum, score) => sum + score, 0) /
        stats.bloatScores.length;

      let safetyLevel: 'safe' | 'caution' | 'danger';

      const highBloatCount = stats.bloatScores.filter((s) => isHighBloating(s)).length;
      const lowBloatCount = stats.bloatScores.filter((s) => isLowBloating(s)).length;

      if (isLowBloating(avgBloating) && lowBloatCount >= stats.count * 0.7) {
        safetyLevel = 'safe';
      } else if (avgBloating >= HIGH_BLOATING_THRESHOLD || highBloatCount >= stats.count * 0.6) {
        safetyLevel = 'danger';
      } else {
        safetyLevel = 'caution';
      }

      // Check if this food is in potential triggers
      const isPotentialTrigger = potentialTriggers.some(
        trigger => trigger.topFoods.some(f => f.food === food) || trigger.category === food
      );

      insights.push({
        food,
        icon: getIconForTrigger(food),
        count: stats.count,
        safetyLevel,
        isPotentialTrigger,
      });
    });

    // Sort: danger first, then caution, then safe
    const sortOrder = { danger: 0, caution: 1, safe: 2 };
    return insights.sort((a, b) => {
      // Potential triggers always first
      if (a.isPotentialTrigger !== b.isPotentialTrigger) {
        return a.isPotentialTrigger ? -1 : 1;
      }
      if (sortOrder[a.safetyLevel] !== sortOrder[b.safetyLevel]) {
        return sortOrder[a.safetyLevel] - sortOrder[b.safetyLevel];
      }
      return b.count - a.count;
    });
  }, [entries, potentialTriggers]);

  if (foodInsights.length === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">🍽️</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Log more meals to see your food insights
        </p>
      </div>
    );
  }

  const getBorderColor = (level: 'safe' | 'caution' | 'danger') => {
    switch (level) {
      case 'danger':
        return 'border-coral/40';
      case 'caution':
        return 'border-yellow-500/40';
      case 'safe':
        return 'border-mint/40';
    }
  };

  const getBgGradient = (level: 'safe' | 'caution' | 'danger') => {
    switch (level) {
      case 'danger':
        return 'from-coral/5 to-coral/10';
      case 'caution':
        return 'from-yellow-500/5 to-yellow-500/10';
      case 'safe':
        return 'from-mint/5 to-mint/10';
    }
  };

  // Separate foods by safety level for better organization
  const foodsToAvoid = foodInsights.filter(f => f.safetyLevel === 'danger');
  const safeFoods = foodInsights.filter(f => f.safetyLevel === 'safe');
  const cautionFoods = foodInsights.filter(f => f.safetyLevel === 'caution');

  return (
    <div className="premium-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral/20 to-mint/20">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Your Food Insights</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalized based on your bloating patterns
          </p>
        </div>
      </div>

      {/* Foods to AVOID Section - Most Important */}
      {foodsToAvoid.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-coral animate-pulse" />
            <h4 className="text-sm font-bold text-coral uppercase tracking-wide">
              Foods to Avoid
            </h4>
          </div>
          <div className="space-y-2.5">
            {foodsToAvoid.slice(0, 4).map((item) => {
              // Calculate bloating rate
              const bloatRate = Math.round((item.count / foodInsights.reduce((sum, f) => sum + f.count, 0)) * 100);

              return (
                <div
                  key={item.food}
                  className="p-4 rounded-xl bg-coral/5 border border-coral/20 hover:border-coral/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-0.5">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{item.food}</span>
                        {item.isPotentialTrigger && (
                          <span className="px-2 py-0.5 rounded-full bg-coral/20 text-[10px] font-bold text-coral uppercase">
                            Trigger
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Logged in <span className="font-semibold text-foreground">{item.count}</span> meal{item.count !== 1 ? 's' : ''} •
                        Consistently causes high bloating
                      </p>
                      <p className="text-xs font-medium text-coral mt-1.5">
                        ⚠️ Consider eliminating for 1-2 weeks to test
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safe Foods Section - What Works */}
      {safeFoods.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-mint" />
            <h4 className="text-sm font-bold text-mint uppercase tracking-wide">
              Safe for You
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {safeFoods.slice(0, 6).map((item) => (
              <div
                key={item.food}
                className="p-3 rounded-xl bg-mint/5 border border-mint/20 hover:border-mint/40 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">
                      {item.food}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {item.count}x • Low bloating
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-mint font-medium">
            ✓ These foods consistently work well for you
          </p>
        </div>
      )}

      {/* Caution Foods - Monitor */}
      {cautionFoods.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-yellow-500" />
            <h4 className="text-sm font-bold text-yellow-600 uppercase tracking-wide">
              Monitor Closely
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {cautionFoods.slice(0, 4).map((item) => (
              <div
                key={item.food}
                className="px-3 py-2 rounded-full bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.icon} {item.food}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  ({item.count})
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Mixed results • Try in smaller portions or different preparations
          </p>
        </div>
      )}

      {/* Action Tip */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-xs text-foreground">
          <span className="font-bold">💡 Action Plan:</span> Start by eliminating red-flagged foods,
          stick to your safe foods, and keep logging to refine these insights.
        </p>
      </div>
    </div>
  );
}
