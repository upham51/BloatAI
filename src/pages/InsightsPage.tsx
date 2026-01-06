import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Sparkles, Utensils, Flame, ChevronRight, Lightbulb, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { RootCauseProfileCard } from '@/components/quiz/RootCauseProfileCard';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getTriggerCategory } from '@/types';
import { subDays, isAfter } from 'date-fns';
import { validatePercentage, deduplicateFoods, getIconForTrigger, abbreviateIngredient, getSafeAlternatives } from '@/lib/triggerUtils';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useProfile(user?.id);
  const { entries, getCompletedCount } = useMeals();
  const completedCount = getCompletedCount();
  const neededForInsights = 3;
  // Check completed entries for insights, not just total entries
  const hasEnoughData = completedCount >= neededForInsights;

  // Loading state for AI magic animation
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisKey, setAnalysisKey] = useState(0);

  // Trigger re-analysis on page visit - optimized for faster loading
  useEffect(() => {
    setIsAnalyzing(true);
    setAnalysisKey(prev => prev + 1);

    // Minimal loading delay for smooth UX (reduced from 800ms)
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [entries.length]); // Re-run when entries change

  const insights = useMemo(() => {
    // Only analyze completed meals (those with bloating ratings)
    const completedEntries = entries.filter(e => e.rating_status === 'completed');

    if (completedEntries.length < neededForInsights) return null;

    const totalMeals = completedEntries.length;
    const last7Days = completedEntries.filter(e => isAfter(new Date(e.created_at), subDays(new Date(), 7)));

    // Trigger frequency analysis - count meals that contain each trigger
    const triggerMealCounts: Record<string, {
      mealsWithTrigger: Set<string>;
      foods: Map<string, number>;
      highBloatingMealsWithTrigger: Set<string>;
    }> = {};

    // High-bloating meals for the "potential triggers" section - only from completed entries
    const highBloatingMeals = completedEntries.filter(e => e.bloating_rating && e.bloating_rating >= 4);
    const totalHighBloating = highBloatingMeals.length;

    completedEntries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        if (!triggerMealCounts[trigger.category]) {
          triggerMealCounts[trigger.category] = { 
            mealsWithTrigger: new Set(), 
            foods: new Map(), 
            highBloatingMealsWithTrigger: new Set() 
          };
        }
        // Use entry.id to count unique meals with this trigger
        triggerMealCounts[trigger.category].mealsWithTrigger.add(entry.id);
        
        if (trigger.food) {
          const currentCount = triggerMealCounts[trigger.category].foods.get(trigger.food) || 0;
          triggerMealCounts[trigger.category].foods.set(trigger.food, currentCount + 1);
        }
        
        // Track if this trigger appeared in a high-bloating meal
        if (entry.bloating_rating && entry.bloating_rating >= 4) {
          triggerMealCounts[trigger.category].highBloatingMealsWithTrigger.add(entry.id);
        }
      });
    });

    // Calculate frequency percentages - VALIDATED to never exceed 100%
    const triggerFrequencies = Object.entries(triggerMealCounts)
      .map(([category, stats]) => {
        const mealCount = stats.mealsWithTrigger.size;
        const highBloatingCount = stats.highBloatingMealsWithTrigger.size;
        // Ensure count never exceeds total
        const validMealCount = Math.min(mealCount, totalMeals);
        const validHighBloatingCount = Math.min(highBloatingCount, totalHighBloating);
        
        return {
          category,
          count: validMealCount,
          percentage: validatePercentage((validMealCount / totalMeals) * 100),
          topFoods: Array.from(stats.foods.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([food, count]) => ({ food, count })),
          suspicionScore: validMealCount >= 3 && validHighBloatingCount >= 2 
            ? 'high' 
            : validHighBloatingCount >= 1 
              ? 'medium' 
              : 'low',
          withHighBloating: validHighBloatingCount,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Potential triggers (appear frequently in high-bloating meals)
    const potentialTriggers = triggerFrequencies
      .filter(t => t.suspicionScore !== 'low' && t.count >= 2)
      .slice(0, 3);

    // Most common foods you eat - DEDUPLICATED - only from completed entries
    const allFoods: Map<string, number> = new Map();
    completedEntries.forEach(entry => {
      entry.detected_triggers?.forEach(trigger => {
        if (trigger.food) {
          const current = allFoods.get(trigger.food) || 0;
          allFoods.set(trigger.food, current + 1);
        }
      });
    });

    // Deduplicate similar foods (broccoli florets + broccoli = broccoli)
    const foodsArray = Array.from(allFoods.entries()).map(([food, count]) => ({ food, count }));
    const deduplicatedFoods = deduplicateFoods(foodsArray);
    const topFoods = deduplicatedFoods.slice(0, 5);

    const lowBloatingMeals = completedEntries.filter(e => e.bloating_rating && e.bloating_rating <= 2);

    return {
      totalMeals,
      mealsThisWeek: last7Days.length,
      triggerFrequencies,
      potentialTriggers,
      topFoods,
      highBloatingCount: totalHighBloating,
      lowBloatingCount: lowBloatingMeals.length,
    };
  }, [entries, completedCount]);

  // Generate AI summary based on data
  const aiSummary = useMemo(() => {
    if (!insights || !insights.potentialTriggers.length) return null;

    const topTrigger = insights.potentialTriggers[0];
    const topTriggerInfo = getTriggerCategory(topTrigger.category);
    const alternatives = getSafeAlternatives(topTrigger.category);

    return {
      overview: [
        `${topTriggerInfo?.displayName || topTrigger.category} appears in ${topTrigger.percentage}% of your meals`,
        insights.highBloatingCount > 0 
          ? `${insights.highBloatingCount} of your meals caused significant bloating`
          : 'Most of your meals have been comfortable',
        insights.lowBloatingCount > 0
          ? `${insights.lowBloatingCount} meals were comfortable with low bloating`
          : null,
      ].filter(Boolean) as string[],
      topTrigger: topTriggerInfo?.displayName || topTrigger.category,
      alternatives: alternatives.slice(0, 4),
      tip: `Try reducing ${topTriggerInfo?.displayName || topTrigger.category} for 1-2 weeks to see if symptoms improve.`,
    };
  }, [insights]);

  // Full-screen loading state
  if (isAnalyzing && hasEnoughData) {
    return (
      <AppLayout>
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
          <InsightsLoader />
          <p className="mt-6 text-lg font-semibold text-primary animate-pulse">
            Analyzing your insights
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crunching the numbers...
          </p>
        </div>
      </AppLayout>
    );
  }

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

            <div className="premium-card text-center py-16 space-y-4 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Insights Coming Soon!</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Rate {neededForInsights - completedCount} more meal{neededForInsights - completedCount !== 1 ? 's' : ''} to unlock your personalized analysis.
              </p>
              <div className="max-w-xs mx-auto mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">{completedCount}/{neededForInsights}</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${(completedCount / neededForInsights) * 100}%` }}
                  />
                </div>
              </div>
              <Button 
                onClick={() => navigate('/add-entry')}
                className="mt-6 bg-primary text-primary-foreground rounded-full px-8 py-6 font-semibold shadow-lg hover:bg-primary/90"
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

          {/* Root Cause Profile Card */}
          {user && (
            <div className="animate-slide-up opacity-0" style={{ animationDelay: '25ms', animationFillMode: 'forwards' }}>
              <RootCauseProfileCard userId={user.id} userProfile={userProfile} />
            </div>
          )}

          {/* Quick Stats - Only 2 columns now */}
          <div 
            className="grid grid-cols-2 gap-4 animate-slide-up opacity-0" 
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <div className="premium-card p-5 text-center">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 w-fit mx-auto mb-3">
                <Utensils className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{insights?.totalMeals}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Meals</div>
            </div>
            <div className="premium-card p-5 text-center">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral/20 to-peach/20 w-fit mx-auto mb-3">
                <Flame className="w-6 h-6 text-coral" />
              </div>
              <div className="text-3xl font-bold text-foreground">{insights?.highBloatingCount}</div>
              <div className="text-sm text-muted-foreground mt-1">High Bloating</div>
            </div>
          </div>

          {/* AI Summary Card - NEW */}
          {aiSummary && (
            <div 
              className="premium-card p-5 animate-slide-up opacity-0 border-2 border-primary/20"
              style={{ animationDelay: '75ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10"
                  style={{
                    boxShadow: '0 4px 12px hsl(var(--primary) / 0.2), inset 0 1px 1px hsl(0 0% 100% / 0.2)'
                  }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-lg">Your Analysis</h2>
                  <p className="text-xs text-muted-foreground">Personalized insights from your data</p>
                </div>
              </div>

              {/* Overview */}
              <div className="space-y-2 mb-5">
                {aiSummary.overview.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* Safe Alternatives */}
              {aiSummary.alternatives.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-mint/20 to-primary/5 border border-primary/10 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">
                      Try Instead of {aiSummary.topTrigger}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSummary.alternatives.map((alt, index) => (
                      <span 
                        key={index}
                        className="text-xs px-3 py-1.5 rounded-full bg-background/80 text-foreground border border-primary/20 font-medium"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Tip */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{aiSummary.tip}</span>
              </div>
            </div>
          )}

          {/* Potential Triggers - The Star Section */}
          {insights?.potentialTriggers && insights.potentialTriggers.length > 0 && (
            <div 
              className="premium-card p-5 animate-slide-up opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
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
                  const icon = getIconForTrigger(trigger.category);
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
                          <span className="text-xl">{icon}</span>
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
                          {trigger.topFoods.map(({ food }) => {
                            const foodIcon = getIconForTrigger(food);
                            const abbrevFood = abbreviateIngredient(food);
                            return (
                              <span 
                                key={food}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/30"
                                style={{
                                  boxShadow: 'inset 0 1px 2px hsl(var(--foreground) / 0.03)'
                                }}
                              >
                                <span>{foodIcon}</span>
                                <span>{abbrevFood}</span>
                              </span>
                            );
                          })}
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
            className="premium-card p-5 animate-slide-up opacity-0"
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
                const icon = getIconForTrigger(trigger.category);
                return (
                  <div key={trigger.category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
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

          {/* Top Foods - with emoji icons */}
          {insights?.topFoods && insights.topFoods.length > 0 && (
            <div 
              className="premium-card p-5 animate-slide-up opacity-0"
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
                {insights.topFoods.map((item, index) => {
                  const icon = getIconForTrigger(item.food);
                  return (
                    <div 
                      key={item.food}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lavender/50 to-secondary/30 flex items-center justify-center text-lg">
                        {icon}
                      </div>
                      <span className="flex-1 font-medium text-foreground">{item.food}</span>
                      <span className="text-sm text-muted-foreground">{item.count}x</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips Card */}
          <div 
            className="premium-card p-5 animate-slide-up opacity-0 bg-gradient-to-br from-primary/5 to-transparent"
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
              {completedCount < entries.length && (
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Rate your pending meals to track bloating patterns</span>
                </li>
              )}
            </ul>
          </div>

          {/* Bloating Guide */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '275ms', animationFillMode: 'forwards' }}
          >
            <BloatingGuide />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
