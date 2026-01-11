import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { MealEntry } from '@/types';
import { getIconForTrigger, abbreviateIngredient } from '@/lib/triggerUtils';
import { isHighBloating, isLowBloating, HIGH_BLOATING_THRESHOLD } from '@/lib/bloatingUtils';
import { TriggerFrequency } from '@/lib/insightsAnalysis';
import { openRecipeSearch } from '@/lib/recipeUtils';

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

  // Trending safe foods - recently logged safe foods (last 7 days)
  const trendingSafeFoods = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentEntries = entries.filter(e =>
      e.rating_status === 'completed' &&
      new Date(e.created_at) >= weekAgo &&
      isLowBloating(e.bloating_rating)
    );

    const recentFoodCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        const foodName = abbreviateIngredient(trigger.food || trigger.category);
        recentFoodCounts[foodName] = (recentFoodCounts[foodName] || 0) + 1;
      });
    });

    return Object.entries(recentFoodCounts)
      .filter(([food]) => safeFoods.some(sf => sf.food === food))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([food, count]) => ({
        food,
        count,
        icon: getIconForTrigger(food)
      }));
  }, [entries, safeFoods]);

  return (
    <div className="premium-card p-6 shadow-sm rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral/20 to-mint/20">
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-xl">Your Food Insights</h3>
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
          <div className="grid grid-cols-1 gap-2.5">
            {foodsToAvoid.slice(0, 4).map((item) => {
              // Calculate average bloating and high bloat frequency
              const foodEntries = entries.filter(e =>
                e.rating_status === 'completed' &&
                e.bloating_rating &&
                e.detected_triggers?.some(t =>
                  abbreviateIngredient(t.food || t.category) === item.food
                )
              );
              const avgBloating = foodEntries.length > 0
                ? foodEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / foodEntries.length
                : 0;
              const highBloatCount = foodEntries.filter(e => isHighBloating(e.bloating_rating)).length;
              const highBloatPercent = foodEntries.length > 0
                ? Math.round((highBloatCount / foodEntries.length) * 100)
                : 0;

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
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Logged {item.count}x</span> • Avg bloating: <span className="font-bold text-coral">{avgBloating.toFixed(1)}/5</span>
                        </p>
                        <p className="text-xs text-coral font-medium">
                          ⚠️ Caused high bloating {highBloatPercent}% of the time
                        </p>
                      </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-mint" />
              <h4 className="text-sm font-bold text-mint uppercase tracking-wide">
                Safe for You
              </h4>
            </div>
            <div className="text-xs text-muted-foreground">
              {safeFoods.length} safe {safeFoods.length === 1 ? 'food' : 'foods'}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {safeFoods.slice(0, 8).map((item) => {
              // Calculate average bloating for context
              const foodEntries = entries.filter(e =>
                e.rating_status === 'completed' &&
                e.bloating_rating &&
                e.detected_triggers?.some(t =>
                  abbreviateIngredient(t.food || t.category) === item.food
                )
              );
              const avgBloating = foodEntries.length > 0
                ? foodEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / foodEntries.length
                : 0;

              return (
                <div
                  key={item.food}
                  className="p-3 rounded-xl bg-mint/5 border border-mint/20 hover:border-mint/40 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-foreground text-sm">
                          {item.food}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-mint/20 text-[10px] font-bold text-mint">
                          Logged {item.count}x
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Avg bloating: <span className="font-semibold text-mint">{avgBloating.toFixed(1)}/5</span> • Low impact
                      </div>
                      {/* Find Recipes Button */}
                      <button
                        onClick={() => openRecipeSearch(item.food)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint/10 hover:bg-mint/20 border border-mint/30 hover:border-mint/50 transition-all text-mint text-xs font-semibold group-hover:shadow-sm"
                      >
                        <Search className="w-3 h-3" />
                        Find Recipes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-mint font-medium flex items-center gap-1.5">
            <span>✓</span>
            <span>These foods consistently work well for you. Click "Find Recipes" to discover new ways to enjoy them!</span>
          </p>
        </div>
      )}

      {/* Trending Safe Foods - What's Working This Week */}
      {trendingSafeFoods.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            <h4 className="text-sm font-bold text-primary uppercase tracking-wide">
              Trending Safe Foods
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSafeFoods.map((item) => (
              <div
                key={item.food}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                onClick={() => openRecipeSearch(item.food)}
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {item.food}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.count}x this week
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-primary font-medium">
            🔥 You've been enjoying these safe foods this week — keep it up!
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
          <div className="grid grid-cols-2 gap-2.5">
            {cautionFoods.slice(0, 4).map((item) => (
              <div
                key={item.food}
                className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{item.food}</span>
                      {item.isPotentialTrigger && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-[10px] font-bold text-yellow-600 uppercase">
                          Trigger
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Logged in <span className="font-semibold text-foreground">{item.count}</span> meal{item.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
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
