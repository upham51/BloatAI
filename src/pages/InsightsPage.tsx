import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Sparkles, Utensils, Flame, ChevronRight, Lightbulb, Heart, Brain, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { FoodSafetyList } from '@/components/insights/FoodSafetyList';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { RecommendationCards } from '@/components/insights/RecommendationCards';
import { TriggerFrequencyChart } from '@/components/insights/TriggerFrequencyChart';
import { BehavioralPatternsChart } from '@/components/insights/BehavioralPatternsChart';
import { WeeklyProgressChart } from '@/components/insights/WeeklyProgressChart';
import { HealthScoreGauge } from '@/components/insights/HealthScoreGauge';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getTriggerCategory } from '@/types';
import { getIconForTrigger, abbreviateIngredient } from '@/lib/triggerUtils';
import { generateComprehensiveInsight } from '@/lib/insightsAnalysis';

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

  // Generate comprehensive insights using new analysis engine
  const insights = useMemo(() => {
    return generateComprehensiveInsight(entries);
  }, [entries, completedCount]);

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
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-5 w-32 h-32 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative p-5 pb-32 max-w-lg mx-auto space-y-5">
          {/* Header */}
          <header className="pt-2 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Insights</h1>
            <p className="text-muted-foreground mt-1">Based on {completedCount} rated meals</p>
          </header>

          {/* Quick Stats - Only 2 columns now */}
          <div 
            className="grid grid-cols-2 gap-4 animate-slide-up opacity-0" 
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <div className="premium-card p-5 text-center">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 w-fit mx-auto mb-3">
                <Utensils className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{completedCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Rated Meals</div>
            </div>
            <div className="premium-card p-5 text-center">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-coral/20 to-peach/20 w-fit mx-auto mb-3">
                <Flame className="w-6 h-6 text-coral" />
              </div>
              <div className="text-3xl font-bold text-foreground">{insights?.highBloatingCount}</div>
              <div className="text-sm text-muted-foreground mt-1">High Bloating</div>
            </div>
          </div>


          {/* Health Score Gauge */}
          {insights && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '85ms', animationFillMode: 'forwards' }}
            >
              <HealthScoreGauge
                avgBloating={insights.avgBloating}
                totalMeals={insights.totalMeals}
                lowBloatingCount={insights.lowBloatingCount}
                highBloatingCount={insights.highBloatingCount}
              />
            </div>
          )}

          {/* Weekly Progress Chart */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '90ms', animationFillMode: 'forwards' }}
          >
            <WeeklyProgressChart entries={entries} />
          </div>


          {/* Trigger Frequency Chart */}
          {insights && insights.triggerFrequencies.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <TriggerFrequencyChart triggers={insights.triggerFrequencies} />
            </div>
          )}

          {/* Recommendation Cards - Swipeable */}
          {insights?.potentialTriggers && insights.potentialTriggers.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '105ms', animationFillMode: 'forwards' }}
            >
              <RecommendationCards
                topTriggers={insights.potentialTriggers.map((t) => t.category)}
              />
            </div>
          )}

          {/* Bloat Heatmap Calendar */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '110ms', animationFillMode: 'forwards' }}
          >
            <BloatHeatmap entries={entries} />
          </div>

          {/* Food Insights (Combined Safety List + Potential Triggers) */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
          >
            <FoodSafetyList entries={entries} potentialTriggers={insights?.potentialTriggers} />
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
