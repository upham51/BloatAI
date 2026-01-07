import { useMemo } from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { MealEntry } from '@/types';
import { getIconForTrigger } from '@/lib/triggerUtils';

interface FoodSafetyListProps {
  entries: MealEntry[];
}

interface FoodSafety {
  food: string;
  safetyLevel: 'safe' | 'caution' | 'danger';
  count: number;
  avgBloating: number;
  icon: string;
}

export function FoodSafetyList({ entries }: FoodSafetyListProps) {
  const foodSafety = useMemo(() => {
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

    // Calculate safety levels
    const safetyList: FoodSafety[] = [];

    Object.entries(foodStats).forEach(([food, stats]) => {
      // Need at least 3 data points for reliable classification
      if (stats.count < 3) return;

      const avgBloating =
        stats.bloatScores.reduce((sum, score) => sum + score, 0) /
        stats.bloatScores.length;

      let safetyLevel: 'safe' | 'caution' | 'danger';

      // Classify based on average bloating and consistency
      const highBloatCount = stats.bloatScores.filter((s) => s >= 4).length;
      const lowBloatCount = stats.bloatScores.filter((s) => s <= 2).length;

      if (avgBloating <= 2 && lowBloatCount >= stats.count * 0.7) {
        safetyLevel = 'safe';
      } else if (avgBloating >= 4 || highBloatCount >= stats.count * 0.6) {
        safetyLevel = 'danger';
      } else {
        safetyLevel = 'caution';
      }

      safetyList.push({
        food,
        safetyLevel,
        count: stats.count,
        avgBloating: Math.round(avgBloating * 10) / 10,
        icon: getIconForTrigger(food),
      });
    });

    // Sort: danger first, then caution, then safe
    const sortOrder = { danger: 0, caution: 1, safe: 2 };
    return safetyList.sort((a, b) => {
      if (sortOrder[a.safetyLevel] !== sortOrder[b.safetyLevel]) {
        return sortOrder[a.safetyLevel] - sortOrder[b.safetyLevel];
      }
      return b.count - a.count;
    });
  }, [entries]);

  if (foodSafety.length === 0) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">🍽️</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Log at least 3 meals with the same foods to see your safety list
        </p>
      </div>
    );
  }

  const safefoods = foodSafety.filter((f) => f.safetyLevel === 'safe');
  const cautionFoods = foodSafety.filter((f) => f.safetyLevel === 'caution');
  const dangerFoods = foodSafety.filter((f) => f.safetyLevel === 'danger');

  return (
    <div className="premium-card p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-sage/20">
          <span className="text-xl">🚦</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Food Safety List</h3>
          <p className="text-xs text-muted-foreground">
            Based on your bloating patterns
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-muted-foreground">Caution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-coral" />
          <span className="text-muted-foreground">Danger</span>
        </div>
      </div>

      {/* Danger Foods */}
      {dangerFoods.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-coral flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Avoid These ({dangerFoods.length})
          </h4>
          <div className="space-y-2">
            {dangerFoods.map((item) => (
              <div
                key={item.food}
                className="flex items-center justify-between p-3 rounded-xl bg-coral/10 border border-coral/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.food}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} meals tracked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">😣</span>
                    <span className="text-sm font-bold text-coral">
                      {item.avgBloating}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caution Foods */}
      {cautionFoods.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-yellow-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Eat Sparingly ({cautionFoods.length})
          </h4>
          <div className="space-y-2">
            {cautionFoods.map((item) => (
              <div
                key={item.food}
                className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.food}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} meals tracked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">😐</span>
                    <span className="text-sm font-bold text-yellow-600">
                      {item.avgBloating}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Foods */}
      {safefoods.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Safe for You ({safefoods.length})
          </h4>
          <div className="space-y-2">
            {safefoods.map((item) => (
              <div
                key={item.food}
                className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.food}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} meals tracked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">😊</span>
                    <span className="text-sm font-bold text-primary">
                      {item.avgBloating}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="p-3 rounded-xl bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">💡 Tip:</span> This
          list updates as you log more meals. The more data, the more accurate!
        </p>
      </div>
    </div>
  );
}
