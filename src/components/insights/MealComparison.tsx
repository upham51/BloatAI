import { useMemo } from 'react';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { MealEntry, DetectedTrigger } from '@/types';
import { getIconForTrigger } from '@/lib/triggerUtils';
import { format } from 'date-fns';

interface MealComparisonProps {
  entries: MealEntry[];
}

interface Comparison {
  lowBloatMeal: MealEntry;
  highBloatMeal: MealEntry;
  uniqueTriggers: DetectedTrigger[];
  commonTriggers: DetectedTrigger[];
}

export function MealComparison({ entries }: MealComparisonProps) {
  const comparison = useMemo<Comparison | null>(() => {
    // Get completed entries
    const completed = entries.filter(
      (e) => e.rating_status === 'completed' && e.bloating_rating
    );

    if (completed.length < 2) return null;

    // Find a low-bloating meal (<=2) and high-bloating meal (>=4)
    const lowBloatMeals = completed.filter((e) => e.bloating_rating! <= 2);
    const highBloatMeals = completed.filter((e) => e.bloating_rating! >= 4);

    if (lowBloatMeals.length === 0 || highBloatMeals.length === 0) return null;

    // Get most recent of each
    const lowBloatMeal = lowBloatMeals[lowBloatMeals.length - 1];
    const highBloatMeal = highBloatMeals[highBloatMeals.length - 1];

    // Find trigger differences
    const lowTriggers = lowBloatMeal.detected_triggers || [];
    const highTriggers = highBloatMeal.detected_triggers || [];

    // Get triggers unique to high-bloat meal (potential culprits)
    const uniqueTriggers = highTriggers.filter(
      (ht) =>
        !lowTriggers.some(
          (lt) => lt.category === ht.category && lt.food === ht.food
        )
    );

    // Get common triggers (both meals have these)
    const commonTriggers = highTriggers.filter((ht) =>
      lowTriggers.some(
        (lt) => lt.category === ht.category && lt.food === ht.food
      )
    );

    return {
      lowBloatMeal,
      highBloatMeal,
      uniqueTriggers,
      commonTriggers,
    };
  }, [entries]);

  if (!comparison) {
    return (
      <div className="premium-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Log meals with different bloating levels to see comparisons
        </p>
      </div>
    );
  }

  const { lowBloatMeal, highBloatMeal, uniqueTriggers, commonTriggers } =
    comparison;

  return (
    <div className="premium-card p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky/40 to-lavender/40">
          <span className="text-xl">🔬</span>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Meal Comparison</h3>
          <p className="text-xs text-muted-foreground">
            What made the difference?
          </p>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Low Bloat Meal */}
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase">
              Good Meal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{lowBloatMeal.meal_emoji || '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {lowBloatMeal.custom_title ||
                  lowBloatMeal.meal_title ||
                  'Meal'}
              </p>
              <p className="text-2xs text-muted-foreground">
                {format(new Date(lowBloatMeal.created_at), 'MMM d')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">😊</span>
            <span className="text-sm font-bold text-primary">
              {lowBloatMeal.bloating_rating}/5
            </span>
          </div>
        </div>

        {/* High Bloat Meal */}
        <div className="p-4 rounded-2xl bg-coral/10 border border-coral/20 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-coral" />
            <span className="text-xs font-semibold text-coral uppercase">
              Bad Meal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{highBloatMeal.meal_emoji || '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {highBloatMeal.custom_title ||
                  highBloatMeal.meal_title ||
                  'Meal'}
              </p>
              <p className="text-2xs text-muted-foreground">
                {format(new Date(highBloatMeal.created_at), 'MMM d')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">😣</span>
            <span className="text-sm font-bold text-coral">
              {highBloatMeal.bloating_rating}/5
            </span>
          </div>
        </div>
      </div>

      {/* Key Differences */}
      {uniqueTriggers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-coral" />
            <h4 className="text-sm font-semibold text-foreground">
              The Difference
            </h4>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-coral/15 to-peach/15 border border-coral/20 space-y-3">
            <p className="text-sm text-muted-foreground">
              The bad meal had these extra triggers:
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueTriggers.map((trigger, i) => {
                const icon = getIconForTrigger(trigger.food || trigger.category);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-coral/30"
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-medium text-foreground">
                      {trigger.food || trigger.category}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="p-3 rounded-xl bg-background/80">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  💡 Insight:
                </span>{' '}
                Try avoiding{' '}
                {uniqueTriggers.length === 1
                  ? uniqueTriggers[0].food || uniqueTriggers[0].category
                  : 'these triggers'}{' '}
                to see if your symptoms improve.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Common Triggers (might be okay) */}
      {commonTriggers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Both meals had:
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonTriggers.slice(0, 5).map((trigger, i) => {
              const icon = getIconForTrigger(trigger.food || trigger.category);
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 text-xs text-muted-foreground"
                >
                  <span className="text-base">{icon}</span>
                  {trigger.food || trigger.category}
                </span>
              );
            })}
          </div>
          <p className="text-2xs text-muted-foreground italic">
            These are likely okay for you in moderation
          </p>
        </div>
      )}
    </div>
  );
}
