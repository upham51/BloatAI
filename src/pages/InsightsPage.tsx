import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Utensils } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { FoodSafetyList } from '@/components/insights/FoodSafetyList';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { RecommendationCards } from '@/components/insights/RecommendationCards';
import { VisualHealthScoreHero } from '@/components/insights/VisualHealthScoreHero';
import { InteractiveTriggerAnalysis } from '@/components/insights/InteractiveTriggerAnalysis';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getIconForTrigger } from '@/lib/triggerUtils';
import { generateComprehensiveInsight, generateAdvancedInsights } from '@/lib/insightsAnalysis';
import { GrainTexture } from '@/components/ui/grain-texture';

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
  }, [completedCount]); // Re-run when completed entries change (includes new ratings)

  // Generate comprehensive insights using new analysis engine
  const insights = useMemo(() => {
    return generateComprehensiveInsight(entries);
  }, [entries]); // Recompute whenever entries array changes

  // Generate advanced insights for comprehensive card
  const advancedInsights = useMemo(() => {
    return generateAdvancedInsights(entries);
  }, [entries]);

  // Full-screen loading state
  if (isAnalyzing && hasEnoughData) {
    return (
      <AppLayout>
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
          <GrainTexture />
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
          <GrainTexture />
          <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-60 right-5 w-32 h-32 bg-lavender/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-5 pt-8 max-w-lg mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Insights</h1>
              <p className="text-muted-foreground mt-1">Your personalized analysis</p>
            </header>

            <EmptyState
              IconComponent={Sparkles}
              title="Insights Coming Soon!"
              description={`Rate ${neededForInsights - completedCount} more meal${neededForInsights - completedCount !== 1 ? 's' : ''} to unlock your personalized analysis.`}
              actionLabel="Log a Meal"
              onAction={() => navigate('/add-entry')}
            />

            <div className="mt-6 premium-card p-4">
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
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-lavender/10 to-mint/10">
        <GrainTexture />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-5 w-32 h-32 bg-coral/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 pb-32 max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <header className="mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Insights</h1>
            <p className="text-muted-foreground mt-1">Your personalized analysis</p>
          </header>

          {/* 1. HERO SECTION - Bloat Health Score */}
          {insights && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <VisualHealthScoreHero
                avgBloating={insights.avgBloating}
                totalMeals={insights.totalMeals}
                lowBloatingCount={insights.lowBloatingCount}
                highBloatingCount={insights.highBloatingCount}
              />
            </div>
          )}

          {/* 2. TRIGGERS SECTION - Interactive Horizontal Bar Chart */}
          {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <InteractiveTriggerAnalysis triggerConfidence={advancedInsights.triggerConfidence} />
            </div>
          )}

          {/* 3. BLOAT HEATMAP CALENDAR */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <BloatHeatmap entries={entries} />
          </div>

          {/* 4. FOOD INSIGHTS (Safe vs. Triggers) */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            <FoodSafetyList entries={entries} potentialTriggers={insights?.potentialTriggers} />
          </div>

          {/* 5. TOP FOODS - What You're Eating Most */}
          {insights?.topFoods && insights.topFoods.length > 0 && (
            <div
              className="premium-card p-6 shadow-sm rounded-xl animate-slide-up opacity-0"
              style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-lavender/30 to-secondary/30">
                  <span className="text-xl">🍽️</span>
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-xl">What You're Eating Most</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your eating patterns</p>
                </div>
              </div>

              <div className="space-y-2">
                {insights.topFoods.map((item) => {
                  const icon = getIconForTrigger(item.food);

                  // Calculate average bloating for this food
                  const foodEntries = entries.filter(e =>
                    e.rating_status === 'completed' &&
                    e.bloating_rating &&
                    e.detected_triggers?.some(t => (t.food || t.category) === item.food)
                  );
                  const avgBloating = foodEntries.length > 0
                    ? foodEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / foodEntries.length
                    : 0;

                  // Determine impact badge color and label
                  const getImpactBadge = (avg: number) => {
                    if (avg <= 2) return { color: 'bg-mint text-mint', bg: 'bg-mint/10', label: 'Safe', textColor: 'text-mint' };
                    if (avg <= 3) return { color: 'bg-yellow-500 text-yellow-600', bg: 'bg-yellow-500/10', label: 'Monitor', textColor: 'text-yellow-600' };
                    return { color: 'bg-coral text-coral', bg: 'bg-coral/10', label: 'Trigger', textColor: 'text-coral' };
                  };

                  const impactBadge = getImpactBadge(avgBloating);

                  return (
                    <div
                      key={item.food}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lavender/50 to-secondary/30 flex items-center justify-center text-lg">
                        {icon}
                      </div>
                      <span className="flex-1 font-medium text-foreground">{item.food}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${impactBadge.bg} ${impactBadge.textColor} border border-current/20`}>
                          {impactBadge.label}
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">{item.count}x</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. SAFE ALTERNATIVES - Recommendations */}
          {insights?.potentialTriggers && insights.potentialTriggers.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
            >
              <RecommendationCards
                topTriggers={insights.potentialTriggers.map((t) => t.category)}
              />
            </div>
          )}

          {/* 7. BLOATING GUIDE */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
          >
            <BloatingGuide />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
