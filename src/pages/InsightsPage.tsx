import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Sparkles, Utensils, Flame, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMeals } from '@/contexts/MealContext';
import { getTriggerCategory } from '@/types';
import { format, subDays, isAfter } from 'date-fns';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { entries, getCompletedCount } = useMeals();
  const completedCount = getCompletedCount();
  const neededForInsights = 3;
  const hasEnoughData = entries.length >= neededForInsights;

  const insights = useMemo(() => {
    if (entries.length < neededForInsights) return null;

    const totalMeals = entries.length;
    const last7Days = entries.filter(e => isAfter(new Date(e.created_at), subDays(new Date(), 7)));
    
    // Trigger frequency analysis
    const triggerCounts: Record<string, { 
      count: number; 
      foods: Map<string, number>;
      withHighBloating: number;
    }> = {};
    
    entries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        if (!triggerCounts[trigger.category]) {
          triggerCounts[trigger.category] = { count: 0, foods: new Map(), withHighBloating: 0 };
        }
        triggerCounts[trigger.category].count++;
        
        if (trigger.food) {
          const currentCount = triggerCounts[trigger.category].foods.get(trigger.food) || 0;
          triggerCounts[trigger.category].foods.set(trigger.food, currentCount + 1);
        }
        
        // Track if this trigger appeared in a high-bloating meal
        if (entry.bloating_rating && entry.bloating_rating >= 4) {
          triggerCounts[trigger.category].withHighBloating++;
        }
      });
    });

    // Calculate frequency percentages and sort by frequency
    const triggerFrequencies = Object.entries(triggerCounts)
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        percentage: Math.round((stats.count / totalMeals) * 100),
        topFoods: Array.from(stats.foods.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([food, count]) => ({ food, count })),
        suspicionScore: stats.count >= 3 && stats.withHighBloating >= 2 
          ? 'high' 
          : stats.withHighBloating >= 1 
            ? 'medium' 
            : 'low',
        withHighBloating: stats.withHighBloating,
      }))
      .sort((a, b) => b.count - a.count);

    // Potential triggers (appear frequently in high-bloating meals)
    const potentialTriggers = triggerFrequencies
      .filter(t => t.suspicionScore !== 'low' && t.count >= 2)
      .slice(0, 3);

    // Most common foods you eat
    const allFoods: Map<string, number> = new Map();
    entries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        if (trigger.food) {
          const current = allFoods.get(trigger.food) || 0;
          allFoods.set(trigger.food, current + 1);
        }
      });
    });
    const topFoods = Array.from(allFoods.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Meals with high bloating
    const highBloatingMeals = entries.filter(e => e.bloating_rating && e.bloating_rating >= 4);
    const lowBloatingMeals = entries.filter(e => e.bloating_rating && e.bloating_rating <= 2);

    return {
      totalMeals,
      mealsThisWeek: last7Days.length,
      triggerFrequencies,
      potentialTriggers,
      topFoods,
      highBloatingCount: highBloatingMeals.length,
      lowBloatingCount: lowBloatingMeals.length,
      ratedCount: completedCount,
    };
  }, [entries, completedCount]);

  if (!hasEnoughData) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10">
          <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-60 right-5 w-32 h-32 bg-lavender/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative p-5 pt-8 max-w-lg mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Insights</h1>
              <p className="text-muted-foreground mt-1">Your personalized analysis</p>
            </header>

            <div className="glass-card text-center py-16 space-y-4 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Insights Coming Soon!</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Log {neededForInsights - entries.length} more meal{neededForInsights - entries.length !== 1 ? 's' : ''} to unlock your personalized analysis.
              </p>
              <div className="max-w-xs mx-auto mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">{entries.length}/{neededForInsights}</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-sage-dark transition-all duration-500 rounded-full" 
                    style={{ width: `${(entries.length / neededForInsights) * 100}%` }} 
                  />
                </div>
              </div>
              <Button 
                onClick={() => navigate('/add-entry')}
                className="mt-6 bg-gradient-to-r from-primary to-sage-dark text-primary-foreground rounded-full px-8 py-6 font-semibold shadow-lg"
                style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.35)' }}
              >
                Log a Meal
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-5 w-32 h-32 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-5 pb-32 max-w-lg mx-auto space-y-5">
          {/* Header */}
          <header className="pt-2 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Insights</h1>
            <p className="text-muted-foreground mt-1">Based on {insights?.totalMeals} meals logged</p>
          </header>

          {/* Quick Stats */}
          <div 
            className="grid grid-cols-3 gap-3 animate-slide-up opacity-0" 
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <div className="glass-card p-4 text-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 w-fit mx-auto mb-2">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{insights?.totalMeals}</div>
              <div className="text-xs text-muted-foreground">Total Meals</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-coral/20 to-peach/20 w-fit mx-auto mb-2">
                <Flame className="w-5 h-5 text-coral" />
              </div>
              <div className="text-2xl font-bold text-foreground">{insights?.highBloatingCount}</div>
              <div className="text-xs text-muted-foreground">High Bloating</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sky/20 to-sky-light/20 w-fit mx-auto mb-2">
                <Calendar className="w-5 h-5 text-sky" />
              </div>
              <div className="text-2xl font-bold text-foreground">{insights?.mealsThisWeek}</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
          </div>

          {/* Potential Triggers - The Star Section */}
          {insights?.potentialTriggers && insights.potentialTriggers.length > 0 && (
            <div 
              className="rounded-3xl p-5 animate-slide-up opacity-0 bg-card/80 backdrop-blur-xl"
              style={{ 
                animationDelay: '100ms', 
                animationFillMode: 'forwards',
                boxShadow: '0 4px 20px -4px hsl(var(--foreground) / 0.08), 0 12px 40px -8px hsl(var(--foreground) / 0.12), inset 0 1px 1px hsl(0 0% 100% / 0.1)'
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div 
                  className="p-2.5 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--coral) / 0.2), hsl(var(--peach) / 0.3))',
                    boxShadow: '0 4px 12px hsl(var(--coral) / 0.2), inset 0 1px 1px hsl(0 0% 100% / 0.2)'
                  }}
                >
                  <AlertTriangle className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Potential Triggers</h2>
                  <p className="text-xs text-muted-foreground">Foods that may cause bloating</p>
                </div>
              </div>

              <div className="space-y-3">
                {insights.potentialTriggers.map((trigger) => {
                  const categoryInfo = getTriggerCategory(trigger.category);
                  return (
                    <div 
                      key={trigger.category}
                      className="p-4 rounded-2xl bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-sm border border-border/50 transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        boxShadow: '0 2px 8px -2px hsl(var(--foreground) / 0.06), 0 6px 20px -4px hsl(var(--foreground) / 0.08), inset 0 1px 1px hsl(0 0% 100% / 0.08)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: categoryInfo?.color,
                              boxShadow: `0 2px 8px ${categoryInfo?.color}40`
                            }}
                          />
                          <span className="font-bold text-foreground">
                            {categoryInfo?.displayName || trigger.category}
                          </span>
                        </div>
                        <span 
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            trigger.suspicionScore === 'high' 
                              ? 'bg-coral/15 text-coral' 
                              : 'bg-peach/20 text-coral/80'
                          }`}
                          style={{
                            boxShadow: trigger.suspicionScore === 'high' 
                              ? '0 2px 8px hsl(var(--coral) / 0.15)' 
                              : '0 2px 8px hsl(var(--peach) / 0.15)'
                          }}
                        >
                          {trigger.suspicionScore === 'high' ? '⚠️ Likely' : '🤔 Possible'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Found in <span className="font-semibold text-foreground">{trigger.withHighBloating}</span> of your {insights.highBloatingCount} high-bloating meals
                      </p>
                      {trigger.topFoods.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {trigger.topFoods.map(({ food }) => (
                            <span 
                              key={food}
                              className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/30"
                              style={{
                                boxShadow: 'inset 0 1px 2px hsl(var(--foreground) / 0.03)'
                              }}
                            >
                              {food}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* What You Eat Most */}
          <div 
            className="glass-card p-5 animate-slide-up opacity-0"
            style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">Trigger Frequency</h2>
                <p className="text-xs text-muted-foreground">How often each category appears</p>
              </div>
            </div>

            <div className="space-y-3">
              {insights?.triggerFrequencies.slice(0, 5).map((trigger) => {
                const categoryInfo = getTriggerCategory(trigger.category);
                return (
                  <div key={trigger.category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: categoryInfo?.color }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {categoryInfo?.displayName || trigger.category}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {trigger.count} meal{trigger.count !== 1 ? 's' : ''} ({trigger.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${trigger.percentage}%`,
                          backgroundColor: categoryInfo?.color || 'hsl(var(--primary))'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {insights?.triggerFrequencies.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No triggers detected yet. Keep logging meals!
              </p>
            )}
          </div>

          {/* Top Foods */}
          {insights?.topFoods && insights.topFoods.length > 0 && (
            <div 
              className="glass-card p-5 animate-slide-up opacity-0"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-lavender/30 to-secondary/30">
                  <span className="text-lg">🍽️</span>
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Most Logged Foods</h2>
                  <p className="text-xs text-muted-foreground">Your eating patterns</p>
                </div>
              </div>

              <div className="space-y-2">
                {insights.topFoods.map(([food, count], index) => (
                  <div 
                    key={food}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lavender/50 to-secondary/30 flex items-center justify-center text-xs font-bold text-foreground">
                      {index + 1}
                    </div>
                    <span className="flex-1 font-medium text-foreground">{food}</span>
                    <span className="text-sm text-muted-foreground">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Card */}
          <div 
            className="glass-card p-5 animate-slide-up opacity-0 bg-gradient-to-br from-primary/5 to-transparent"
            style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
          >
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Tips for You
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {insights?.potentialTriggers && insights.potentialTriggers.length > 0 && (
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Try reducing <span className="font-semibold text-foreground">{getTriggerCategory(insights.potentialTriggers[0].category)?.displayName}</span> for a week</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Log more meals to improve insight accuracy</span>
              </li>
              {insights?.ratedCount < insights?.totalMeals && (
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Rate your pending meals to track bloating patterns</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
