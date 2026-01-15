import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Utensils } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { RecommendationCards } from '@/components/insights/RecommendationCards';
import { VisualHealthScoreHero } from '@/components/insights/VisualHealthScoreHero';
import { SpotifyWrappedTriggers } from '@/components/insights/SpotifyWrappedTriggers';
import { InteractiveTriggerAnalysis } from '@/components/insights/InteractiveTriggerAnalysis';
import { RecipeSuggester } from '@/components/insights/RecipeSuggester';
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

          {/* 2. SPOTIFY WRAPPED TRIGGERS - Premium Cards */}
          {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <SpotifyWrappedTriggers triggerConfidence={advancedInsights.triggerConfidence} />
            </div>
          )}

          {/* 3. DETAILED TRIGGERS - Interactive Horizontal Bar Chart */}
          {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <InteractiveTriggerAnalysis triggerConfidence={advancedInsights.triggerConfidence} />
            </div>
          )}

          {/* 4. SAFE ALTERNATIVES - Recommendations */}
          {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <RecommendationCards
                topTriggers={advancedInsights.triggerConfidence.slice(0, 3).map((t) => t.category)}
              />
            </div>
          )}

          {/* 3.5 RECIPE SUGGESTIONS - Based on safe foods */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
          >
            <RecipeSuggester />
          </div>

          {/* 4. BLOAT HEATMAP CALENDAR */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            <BloatHeatmap entries={entries} />
          </div>

          {/* 5. TOP FOODS - Most logged */}
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
                  <h2 className="font-bold text-foreground text-xl">Most Logged Foods</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your eating patterns</p>
                </div>
              </div>

              <div className="space-y-2">
                {insights.topFoods.map((item) => {
                  const icon = getIconForTrigger(item.food);
                  return (
                    <div
                      key={item.food}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lavender/50 to-secondary/30 flex items-center justify-center text-lg">
                        {icon}
                      </div>
                      <span className="flex-1 font-medium text-foreground">{item.food}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{item.count}x</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. BLOATING GUIDE */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            <BloatingGuide />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
