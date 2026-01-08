import { useMemo } from 'react';
import { MealEntry } from '@/types';
import { getIconForTrigger } from '@/lib/triggerUtils';
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
        const foodName = trigger.food || trigger.category;
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

  return (
    <div className="premium-card p-6">
      <div className="mb-6">
        <h3 className="font-bold text-foreground text-lg">Your Food Insights</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Foods ranked by how they affect you
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral/10 border border-coral/30">
          <div className="w-2 h-2 rounded-full bg-coral" />
          <span className="text-foreground font-medium">Avoid</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-foreground font-medium">Caution</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint/10 border border-mint/30">
          <div className="w-2 h-2 rounded-full bg-mint" />
          <span className="text-foreground font-medium">Safe</span>
        </div>
      </div>

      {/* Food Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-3">
        {foodInsights.map((item) => (
          <div
            key={item.food}
            className={`relative p-4 rounded-2xl bg-gradient-to-br ${getBgGradient(item.safetyLevel)}
              border-2 ${getBorderColor(item.safetyLevel)} backdrop-blur-sm
              transition-all duration-300 hover:scale-105 hover:shadow-lg
              flex flex-col items-center text-center gap-2`}
          >
            {/* Potential Trigger Badge */}
            {item.isPotentialTrigger && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
              </div>
            )}

            {/* Food Icon */}
            <div className="text-4xl mb-1">
              {item.icon}
            </div>

            {/* Food Name */}
            <div className="font-semibold text-foreground text-sm leading-tight min-h-[2.5rem] flex items-center">
              {item.food}
            </div>

            {/* Meal Count Badge */}
            <div className="mt-auto">
              <div className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm border border-border/50">
                <span className="text-xs font-bold text-foreground">{item.count}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  {item.count === 1 ? 'meal' : 'meals'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Tip */}
      <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-semibold text-foreground">💡</span> Red dot indicates potential trigger.
          Keep logging to refine your insights!
        </p>
      </div>
    </div>
  );
}
