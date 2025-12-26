import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, TrendingUp, TrendingDown, Flame, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useAdmin } from '@/hooks/useAdmin';
import { RATING_LABELS, getTriggerCategory } from '@/types';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getQuoteForContext, getTimeBasedGreeting, getMealPrompt } from '@/lib/quotes';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { entries, getPendingEntry, updateRating, skipRating } = useMeals();
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

  // Weekly data for mini chart
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEntries = entries.filter(e => {
        const entryDate = startOfDay(new Date(e.created_at));
        return entryDate.getTime() === dayStart.getTime();
      });
      
      const ratedEntries = dayEntries.filter(e => e.bloating_rating);
      const avgBloating = ratedEntries.length > 0 
        ? ratedEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / ratedEntries.length 
        : null;
      
      days.push({
        day: format(date, 'EEE')[0],
        fullDay: format(date, 'EEEE'),
        bloating: avgBloating,
        hasData: dayEntries.length > 0,
      });
    }
    return days;
  }, [entries]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const thisWeek = entries.filter(e => isAfter(new Date(e.created_at), weekAgo));
    const rated = thisWeek.filter(e => e.bloating_rating);
    
    const goodDays = weekData.filter(d => d.bloating !== null && d.bloating <= 2).length;
    const roughDays = weekData.filter(d => d.bloating !== null && d.bloating >= 4).length;
    
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
    
    return { goodDays, roughDays, trend, thisWeekAvg, mealsThisWeek: thisWeek.length, recentTrend };
  }, [entries, weekData]);

  // Context-aware quote
  const dailyQuote = useMemo(() => {
    return getQuoteForContext({
      recentTrend: weeklyStats.recentTrend as 'improving' | 'worsening' | 'stable',
      goodDaysCount: weeklyStats.goodDays,
      roughDaysCount: weeklyStats.roughDays,
      totalEntries: entries.length,
      streak,
    });
  }, [weeklyStats, entries.length, streak]);

  // Latest insight/win
  const latestInsight = useMemo(() => {
    if (entries.length < 3) return null;
    
    const recentGoodMeals = entries.filter(e => e.bloating_rating && e.bloating_rating <= 2).slice(0, 3);
    if (recentGoodMeals.length >= 2) {
      return {
        type: 'win',
        message: `You've had ${recentGoodMeals.length} comfortable meals recently. You're finding what works!`,
      };
    }
    
    const triggerCounts: Record<string, number> = {};
    entries.slice(0, 10).forEach(entry => {
      if (entry.bloating_rating && entry.bloating_rating >= 4) {
        entry.detected_triggers?.forEach(t => {
          triggerCounts[t.category] = (triggerCounts[t.category] || 0) + 1;
        });
      }
    });
    
    const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
    if (topTrigger && topTrigger[1] >= 2) {
      const categoryName = getTriggerCategory(topTrigger[0])?.displayName;
      return {
        type: 'insight',
        message: `${categoryName} appeared in ${topTrigger[1]} of your recent high-bloating meals. Worth investigating.`,
      };
    }
    
    return null;
  }, [entries]);

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

          {/* Daily Quote Card - Luxurious */}
          <div 
            className="premium-card p-6 relative overflow-hidden animate-slide-up opacity-0"
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-sage-dark" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center shadow-lg shrink-0">
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

          {/* Weekly Snapshot - Luxurious */}
          {entries.length >= 3 && (
            <div 
              className="premium-card p-6 animate-slide-up opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <h2 className="font-bold text-foreground mb-5 text-lg">Your Week at a Glance</h2>
              
              {/* Good/Rough Days - 3D Cards */}
              <div className="flex gap-4 mb-5">
                <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.25),inset_0_1px_0_hsl(0_0%_100%/0.6)]">
                  <span className="text-3xl block mb-1">😊</span>
                  <div className="text-3xl font-bold text-primary">{weeklyStats.goodDays}</div>
                  <div className="text-sm text-muted-foreground font-medium">Good Days</div>
                  <div className="text-xs text-primary/70 mt-1">Bloating ≤2</div>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 border border-coral/20 shadow-[0_8px_24px_-8px_hsl(var(--coral)/0.25),inset_0_1px_0_hsl(0_0%_100%/0.6)]">
                  <span className="text-3xl block mb-1">😕</span>
                  <div className="text-3xl font-bold text-coral">{weeklyStats.roughDays}</div>
                  <div className="text-sm text-muted-foreground font-medium">Rough Days</div>
                  <div className="text-xs text-coral/70 mt-1">Bloating ≥4</div>
                </div>
              </div>
              
              {/* Mini Weekly Chart */}
              <div className="flex justify-between items-end gap-1.5 h-16 px-2 mb-4">
                {weekData.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className={`w-full rounded-t-lg transition-all shadow-sm ${
                        day.bloating === null 
                          ? 'bg-muted/40 h-2' 
                          : day.bloating <= 2 
                            ? 'bg-gradient-to-t from-primary to-primary/70' 
                            : day.bloating >= 4 
                              ? 'bg-gradient-to-t from-coral to-coral/70' 
                              : 'bg-muted-foreground/50'
                      }`}
                      style={{ 
                        height: day.bloating !== null ? `${Math.max(20, (day.bloating / 5) * 100)}%` : '8px',
                      }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
                  </div>
                ))}
              </div>
              
              {/* Trend */}
              {weeklyStats.trend !== 0 && (
                <div className={`flex items-center gap-1.5 text-sm font-medium ${
                  weeklyStats.trend > 0 ? 'text-primary' : 'text-coral'
                }`}>
                  {weeklyStats.trend > 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      <span>{weeklyStats.trend}% better than last week</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>{Math.abs(weeklyStats.trend)}% worse than last week</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Latest Insight/Win - Luxurious */}
          {latestInsight && (
            <button 
              onClick={() => navigate('/insights')}
              className="premium-card p-5 w-full text-left animate-slide-up opacity-0"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  latestInsight.type === 'win' 
                    ? 'bg-gradient-to-br from-primary/30 to-primary/10' 
                    : 'bg-gradient-to-br from-coral/30 to-coral/10'
                }`}>
                  <span className="text-xl">{latestInsight.type === 'win' ? '🎉' : '🎯'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium leading-relaxed">{latestInsight.message}</p>
                  <p className="text-sm text-primary mt-2 flex items-center gap-1 font-semibold">
                    See Full Analysis <ChevronRight className="w-4 h-4" />
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Pending Rating - Luxurious */}
          {pendingEntry && (
            <div 
              className="premium-card p-5 border-l-4 border-coral animate-scale-in"
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

          {/* Primary CTA - Luxurious with shimmer */}
          <Button
            onClick={() => navigate('/add-entry')}
            className="w-full h-18 rounded-3xl text-lg font-bold bg-gradient-to-r from-primary to-sage-dark text-primary-foreground relative overflow-hidden group animate-slide-up opacity-0"
            style={{ 
              animationDelay: '250ms', 
              animationFillMode: 'forwards',
              boxShadow: '0 16px 40px -8px hsl(var(--primary) / 0.4), 0 8px 20px -4px hsl(var(--foreground) / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.3)'
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex items-center justify-center gap-3 relative z-10">
              <span className="text-2xl filter drop-shadow">📸</span>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">Log New Meal</span>
                <span className="text-xs font-medium opacity-90">{mealPrompt}</span>
              </div>
            </div>
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
