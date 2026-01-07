import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Sparkles, Utensils, Flame, ChevronRight, Lightbulb, Heart, Brain, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { RootCauseProfileCard } from '@/components/quiz/RootCauseProfileCard';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { FoodSafetyList } from '@/components/insights/FoodSafetyList';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { RecommendationCards } from '@/components/insights/RecommendationCards';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRootCauseAssessment } from '@/hooks/useRootCauseAssessment';
import { getTriggerCategory } from '@/types';
import { getIconForTrigger, abbreviateIngredient } from '@/lib/triggerUtils';
import { generateComprehensiveInsight } from '@/lib/insightsAnalysis';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useProfile(user?.id);
  const { data: quizAssessment } = useRootCauseAssessment(user?.id);
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
    return generateComprehensiveInsight(entries, quizAssessment);
  }, [entries, completedCount, quizAssessment]);

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

          {/* Comprehensive Analysis Card - REDESIGNED */}
          {insights && (
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
                  <h2 className="font-bold text-foreground text-lg">Your Complete Analysis</h2>
                  <p className="text-xs text-muted-foreground">Comprehensive insights from ALL your data</p>
                </div>
              </div>

              {/* Overview Section */}
              {insights.summary.overview.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Overview
                  </h3>
                  <div className="space-y-2">
                    {insights.summary.overview.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Behavioral Insights Section */}
              {insights.summary.behavioralInsights.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-lavender/10 to-transparent border border-lavender/20">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-lavender" />
                    Behavioral Patterns
                  </h3>
                  <div className="space-y-1.5">
                    {insights.summary.behavioralInsights.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-lavender mt-0.5 text-xs">▸</span>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Root Cause Connections Section */}
              {insights.summary.rootCauseConnections.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-mint/10 to-transparent border border-mint/20">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-mint" />
                    Root Cause Insights
                  </h3>
                  <div className="space-y-1.5">
                    {insights.summary.rootCauseConnections.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-mint mt-0.5 text-xs">▸</span>
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Recommendations Section */}
              {insights.summary.topRecommendations.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-mint/5 border border-primary/20">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Action Steps
                  </h3>
                  <div className="space-y-2.5">
                    {insights.summary.topRecommendations.map((item, index) => (
                      <div key={index} className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-sm text-foreground font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendation Cards - Swipeable */}
          {insights?.potentialTriggers && insights.potentialTriggers.length > 0 && (
            <div
              className="animate-slide-up opacity-0"
              style={{ animationDelay: '90ms', animationFillMode: 'forwards' }}
            >
              <RecommendationCards
                topTriggers={insights.potentialTriggers.map((t) => t.category)}
              />
            </div>
          )}

          {/* Bloat Heatmap Calendar */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <BloatHeatmap entries={entries} />
          </div>

          {/* Food Safety List (Traffic Light System) */}
          <div
            className="animate-slide-up opacity-0"
            style={{ animationDelay: '115ms', animationFillMode: 'forwards' }}
          >
            <FoodSafetyList entries={entries} />
          </div>

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
