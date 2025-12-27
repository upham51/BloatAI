import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, TrendingUp, TrendingDown, Flame, Settings, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useAdmin } from '@/hooks/useAdmin';
import { RATING_LABELS, getTriggerCategory, MealEntry } from '@/types';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getQuoteForContext, getTimeBasedGreeting, getMealPrompt } from '@/lib/quotes';

// Trigger display names for the insights
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'fodmaps-fructans': 'Wheat/Fructans',
  'fodmaps-gos': 'Beans/GOS',
  'fodmaps-lactose': 'Lactose',
  'fodmaps-fructose': 'Fructose',
  'fodmaps-polyols': 'Polyols',
  'gluten': 'Gluten',
  'dairy': 'Dairy',
  'cruciferous': 'Cruciferous',
  'high-fat': 'Fried/Fatty',
  'carbonated': 'Carbonated',
  'refined-sugar': 'Sugar',
  'alcohol': 'Alcohol'
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { entries, getPendingEntry, updateRating, skipRating, getCompletedCount } = useMeals();
  const { toast } = useToast();

  const pendingEntry = getPendingEntry();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [mealPrompt, setMealPrompt] = useState(getMealPrompt());

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setMealPrompt(getMealPrompt());
  }, []);

  // Get display name
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  const firstName = displayName.split(' ')[0];

  // Calculate streak
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => 
      format(new Date(e.created_at), 'yyyy-MM-dd')
    ))].sort().reverse();
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
    
    let count = 0;
    let currentDate = sortedDates[0] === today ? new Date() : subDays(new Date(), 1);
    
    for (const dateStr of sortedDates) {
      const expectedDate = format(currentDate, 'yyyy-MM-dd');
      if (dateStr === expectedDate) {
        count++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return count;
  }, [entries]);

  // Calculate completed meal count
  const completedCount = getCompletedCount();

  // Weekly insights data - Top Triggers
  const topTriggers = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const roughMeals = entries.filter(e => 
      isAfter(new Date(e.created_at), weekAgo) && 
      e.bloating_rating && e.bloating_rating >= 3
    );

    const triggerStats: Record<string, { 
      category: string; 
      meal_count: number; 
      total_bloating: number;
    }> = {};

    roughMeals.forEach(meal => {
      meal.detected_triggers?.forEach(trigger => {
        if (!triggerStats[trigger.category]) {
          triggerStats[trigger.category] = {
            category: trigger.category,
            meal_count: 0,
            total_bloating: 0,
          };
        }
        triggerStats[trigger.category].meal_count++;
        triggerStats[trigger.category].total_bloating += meal.bloating_rating || 0;
      });
    });

    return Object.values(triggerStats)
      .map(t => ({
        ...t,
        avg_bloating: t.total_bloating / t.meal_count,
        severity: (t.total_bloating / t.meal_count) >= 4 ? 'high' : (t.total_bloating / t.meal_count) >= 3 ? 'medium' : 'low',
        display_name: CATEGORY_DISPLAY_NAMES[t.category] || getTriggerCategory(t.category)?.displayName?.split(' - ')[1] || t.category,
      }))
      .sort((a, b) => b.avg_bloating - a.avg_bloating || b.meal_count - a.meal_count)
      .slice(0, 3);
  }, [entries]);

  // Safe meals from past 7 days
  const safeMeals = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    return entries
      .filter(e => 
        isAfter(new Date(e.created_at), weekAgo) && 
        e.bloating_rating !== null &&
        e.bloating_rating !== undefined &&
        e.bloating_rating <= 2
      )
      .sort((a, b) => (a.bloating_rating || 0) - (b.bloating_rating || 0))
      .slice(0, 3);
  }, [entries]);

  // Weekly stats for trend
  const weeklyStats = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const thisWeek = entries.filter(e => isAfter(new Date(e.created_at), weekAgo));
    const rated = thisWeek.filter(e => e.bloating_rating);
    
    const comfortableMeals = rated.filter(e => e.bloating_rating && e.bloating_rating <= 2).length;
    const roughMeals = rated.filter(e => e.bloating_rating && e.bloating_rating >= 4).length;
    
    const twoWeeksAgo = subDays(new Date(), 14);
    const lastWeek = entries.filter(e => {
      const date = new Date(e.created_at);
      return isAfter(date, twoWeeksAgo) && !isAfter(date, weekAgo);
    });
    const lastWeekRated = lastWeek.filter(e => e.bloating_rating);
    
    const thisWeekAvg = rated.length > 0 
      ? rated.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / rated.length 
      : 0;
    const lastWeekAvg = lastWeekRated.length > 0 
      ? lastWeekRated.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / lastWeekRated.length 
      : 0;
    
    const trend = lastWeekAvg > 0 ? Math.round(((lastWeekAvg - thisWeekAvg) / lastWeekAvg) * 100) : 0;
    const recentTrend = trend > 0 ? 'improving' : trend < 0 ? 'worsening' : 'stable';
    
    return { comfortableMeals, roughMeals, trend, thisWeekAvg, mealsThisWeek: thisWeek.length, recentTrend };
  }, [entries]);

  // Context-aware quote
  const dailyQuote = useMemo(() => {
    return getQuoteForContext({
      recentTrend: weeklyStats.recentTrend as 'improving' | 'worsening' | 'stable',
      goodDaysCount: weeklyStats.comfortableMeals,
      roughDaysCount: weeklyStats.roughMeals,
      totalEntries: entries.length,
      streak,
    });
  }, [weeklyStats, entries.length, streak]);

  // Quick log meal function
  const handleQuickLog = (meal: MealEntry) => {
    navigate('/add-entry', { 
      state: { 
        prefilled: {
          meal_title: meal.meal_title,
          meal_emoji: meal.meal_emoji,
          triggers: meal.detected_triggers,
          isDuplicate: true,
          original_meal_id: meal.id
        }
      }
    });
  };

  const handleRate = async (rating: number) => {
    if (!pendingEntry) return;
    await updateRating(pendingEntry.id, rating);
    toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
  };

  const handleSkip = async () => {
    if (!pendingEntry) return;
    await skipRating(pendingEntry.id);
    toast({ title: 'Rating skipped' });
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        {/* Watercolor Background */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id="watercolor-bleed">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
          </filter>
        </svg>
        
        <div className="watercolor-canvas">
          <div className="splotch splotch-1"></div>
          <div className="splotch splotch-2"></div>
          <div className="splotch splotch-3"></div>
        </div>

        <div className="relative z-10 p-5 pb-32 max-w-lg mx-auto space-y-5">
          {/* Header with time-based greeting */}
          <header className="pt-4 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-muted-foreground tracking-tight">
                  {greeting},
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {firstName}
                </h1>
              </div>
              
              <div className="flex items-center justify-between">
                {streak > 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-coral/15 to-peach/15 border border-coral/20 shadow-sm">
                    <Flame className="w-5 h-5 text-coral drop-shadow-sm" />
                    <span className="text-lg font-bold text-coral">{streak}</span>
                    <span className="text-sm font-semibold text-coral/80">day streak</span>
                  </div>
                ) : (
                  <div />
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/profile')} 
                  className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card shadow-sm"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Admin Link */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full premium-card p-4 flex items-center justify-between text-sm font-medium text-primary animate-slide-up opacity-0"
              style={{ animationDelay: '25ms', animationFillMode: 'forwards' }}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                Admin Dashboard
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Daily Quote Card */}
          <div 
            className="premium-card p-6 animate-slide-up opacity-0"
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shrink-0">
                <span className="text-xl filter drop-shadow">💭</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base text-foreground italic leading-relaxed font-medium">
                  "{dailyQuote.text}"
                </p>
                <p className="text-sm text-primary mt-3 font-semibold">
                  — {dailyQuote.author}
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Insights Card - NEW */}
          {completedCount >= 5 ? (
            <div 
              className="premium-card p-5 animate-slide-up opacity-0 space-y-4"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              {/* Top Triggers Section */}
              {topTriggers.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-coral" />
                    <span className="font-bold text-foreground text-sm">Avoid This Week</span>
                  </div>
                  <div className="space-y-2">
                    {topTriggers.map((trigger, idx) => (
                      <div 
                        key={trigger.category}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          trigger.severity === 'high' 
                            ? 'bg-coral/10' 
                            : trigger.severity === 'medium' 
                              ? 'bg-peach/20' 
                              : 'bg-primary/10'
                        }`}
                      >
                        <span className="text-lg">
                          {trigger.severity === 'high' && '🔴'}
                          {trigger.severity === 'medium' && '🟡'}
                          {trigger.severity === 'low' && '🟢'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">
                            {trigger.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trigger.meal_count} meal{trigger.meal_count !== 1 ? 's' : ''} • Avg {trigger.avg_bloating.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm text-muted-foreground mt-1">No major triggers this week! Keep it up!</p>
                </div>
              )}
              
              {/* Divider */}
              <div className="h-px bg-border" />
              
              {/* Safe Meals Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground text-sm">Your Safe Go-Tos</span>
                </div>
                {safeMeals.length > 0 ? (
                  <div className="flex gap-2">
                    {safeMeals.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => handleQuickLog(meal)}
                        className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-center"
                      >
                        <span className="text-xl">{meal.meal_emoji || '🍽️'}</span>
                        <span className="text-xs font-medium text-foreground line-clamp-2">
                          {meal.meal_title || meal.custom_title || 'Meal'}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-lg">🔍</span>
                    <p className="text-xs text-muted-foreground mt-1">Looking for safe meals...</p>
                  </div>
                )}
              </div>
              
              {/* View Full Insights Link */}
              <button 
                onClick={() => navigate('/insights')}
                className="w-full text-center text-sm text-primary font-semibold flex items-center justify-center gap-1 pt-2"
              >
                See Detailed Analysis <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : completedCount > 0 ? (
            /* Building insights state */
            <div 
              className="premium-card p-6 animate-slide-up opacity-0 text-center"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <span className="text-4xl block mb-3">📊</span>
              <h3 className="font-bold text-foreground mb-2">Building Your Insights</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Log {5 - completedCount} more meal{5 - completedCount !== 1 ? 's' : ''} with bloating ratings to see your triggers and safe foods
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(completedCount / 5) * 100}%` }}
                />
              </div>
              <Button
                onClick={() => navigate('/add-entry')}
                className="bg-primary text-primary-foreground rounded-full px-6"
              >
                Log a Meal
              </Button>
            </div>
          ) : null}

          {/* Pending Rating */}
          {pendingEntry && (
            <div 
              className="premium-card p-5 animate-scale-in"
              style={{ animationDelay: '200ms' }}
            >
              <p className="font-bold text-foreground mb-1">Rate your last meal</p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{pendingEntry.meal_description}</p>
              <RatingScale value={null} onChange={handleRate} size="sm" />
              <button onClick={handleSkip} className="text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors">
                Skip for now
              </button>
            </div>
          )}

          {/* Primary CTA - Solid color, no gradient */}
          <Button
            onClick={() => navigate('/add-entry')}
            className="w-full h-16 rounded-3xl text-lg font-bold bg-primary text-primary-foreground relative overflow-hidden group animate-slide-up opacity-0"
            style={{ 
              animationDelay: '250ms', 
              animationFillMode: 'forwards',
              boxShadow: '0 8px 24px -4px hsl(var(--primary) / 0.4)'
            }}
          >
            <span className="text-lg font-bold relative z-10">Log New Meal</span>
          </Button>

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-5xl mb-3">🥗</p>
              <p className="text-muted-foreground">Start tracking to discover your triggers</p>
            </div>
          )}

          {/* Streak Card (for users with streaks) - Luxurious */}
          {streak >= 3 && (
            <div 
              className="premium-card p-6 bg-gradient-to-br from-coral/10 to-peach/10 text-center animate-slide-up opacity-0"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <div className="text-5xl mb-3 filter drop-shadow">🔥</div>
              <div className="text-3xl font-bold text-foreground">{streak}-day streak!</div>
              <p className="text-sm text-muted-foreground mt-2">
                {streak < 7 && `${7 - streak} more days to unlock your first insight!`}
                {streak >= 7 && streak < 14 && "Keep it up! You're building valuable data."}
                {streak >= 14 && 'Incredible consistency! Your insights are highly accurate.'}
              </p>
              {streak >= 7 && (
                <div className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-coral/20 border border-coral/30 shadow-sm">
                  <span className="text-xl">🏆</span>
                  <span className="text-sm font-bold text-coral">Week Warrior</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
