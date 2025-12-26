import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, TrendingUp, TrendingDown, Flame, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useAdmin } from '@/hooks/useAdmin';
import { RATING_LABELS, getTriggerCategory } from '@/types';
import { format, subDays, isAfter, startOfDay, differenceInCalendarDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Gut-brain quotes that rotate daily
const GUT_BRAIN_QUOTES = [
  { text: "95% of your body's serotonin lives in your gut. You're literally building happiness from the inside out.", author: "Dr. Sarah Chen" },
  { text: "Your gut is often called your 'second brain' — it contains 100 million neurons, more than your spinal cord.", author: "Dr. Michael Gershon" },
  { text: "Listen to your gut — it's trying to tell you something. Every bloat is a signal, not just a symptom.", author: "Dr. Sarah Chen" },
  { text: "Healing your gut is not about restriction. It's about understanding what works for YOUR unique body.", author: "Dr. Will Cole" },
  { text: "The microbiome in your gut influences everything from mood to immunity. Feed it well.", author: "Dr. Emeran Mayer" },
  { text: "Small changes in what you eat can lead to big changes in how you feel. Trust the process.", author: "Dr. Sarah Chen" },
  { text: "Your digestive system is not just processing food — it's processing emotions too.", author: "Dr. Giulia Enders" },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return GUT_BRAIN_QUOTES[dayOfYear % GUT_BRAIN_QUOTES.length];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { entries, getPendingEntry, updateRating, skipRating } = useMeals();
  const { toast } = useToast();

  const pendingEntry = getPendingEntry();
  const dailyQuote = getDailyQuote();

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
    
    // Check if they logged today or yesterday
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
    
    // Calculate trend vs last week
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
    
    return { goodDays, roughDays, trend, thisWeekAvg, mealsThisWeek: thisWeek.length };
  }, [entries, weekData]);

  // Latest insight/win
  const latestInsight = useMemo(() => {
    if (entries.length < 3) return null;
    
    // Find recent wins
    const recentGoodMeals = entries.filter(e => e.bloating_rating && e.bloating_rating <= 2).slice(0, 3);
    if (recentGoodMeals.length >= 2) {
      return {
        type: 'win',
        message: `You've had ${recentGoodMeals.length} comfortable meals recently. You're finding what works!`,
      };
    }
    
    // Find potential trigger pattern
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
        {/* Hero gradient background */}
        <div className="absolute inset-0 bg-gradient-hero overflow-hidden">
          <div className="blob absolute w-64 h-64 bg-mint/40 -top-20 -right-20" />
          <div className="blob-2 absolute w-80 h-80 bg-lavender/30 top-40 -left-32" />
          <div className="blob-3 absolute w-48 h-48 bg-peach/30 top-80 right-10" />
        </div>

        <div className="relative z-10 p-5 pb-32 max-w-lg mx-auto space-y-5">
          {/* Header */}
          <header className="flex items-center justify-between pt-4 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {firstName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Welcome back</p>
                <h1 className="text-xl font-bold text-foreground">{firstName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-coral/20 to-peach/20 text-coral text-sm font-bold">
                  <Flame className="w-4 h-4" />
                  {streak}
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/profile')} 
                className="rounded-full bg-card/60 backdrop-blur"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Admin Link */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full glass-card p-3 flex items-center justify-between text-sm font-medium text-primary animate-slide-up opacity-0"
              style={{ animationDelay: '25ms', animationFillMode: 'forwards' }}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                Admin Dashboard
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Daily Quote Card */}
          <div 
            className="glass-card p-5 bg-gradient-to-br from-lavender/20 to-transparent animate-slide-up opacity-0"
            style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💭</span>
              <div className="flex-1">
                <p className="text-sm text-foreground italic leading-relaxed">"{dailyQuote.text}"</p>
                <p className="text-xs text-muted-foreground mt-2">— {dailyQuote.author}</p>
              </div>
            </div>
          </div>

          {/* Weekly Snapshot */}
          {entries.length >= 3 && (
            <div 
              className="glass-card p-5 animate-slide-up opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <h2 className="font-bold text-foreground mb-4">Your Week at a Glance</h2>
              
              {/* Good/Rough Days */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 p-3 rounded-xl bg-primary/10 text-center">
                  <span className="text-2xl">😊</span>
                  <div className="text-2xl font-bold text-primary">{weeklyStats.goodDays}</div>
                  <div className="text-xs text-muted-foreground">Good Days</div>
                  <div className="text-2xs text-primary/70">Bloating ≤2</div>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-coral/10 text-center">
                  <span className="text-2xl">😕</span>
                  <div className="text-2xl font-bold text-coral">{weeklyStats.roughDays}</div>
                  <div className="text-xs text-muted-foreground">Rough Days</div>
                  <div className="text-2xs text-coral/70">Bloating ≥4</div>
                </div>
              </div>
              
              {/* Mini Weekly Chart */}
              <div className="flex justify-between items-end gap-1 h-16 px-2">
                {weekData.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full rounded-t-md transition-all ${
                        day.bloating === null 
                          ? 'bg-muted/30 h-2' 
                          : day.bloating <= 2 
                            ? 'bg-primary' 
                            : day.bloating >= 4 
                              ? 'bg-coral' 
                              : 'bg-muted-foreground/50'
                      }`}
                      style={{ 
                        height: day.bloating !== null ? `${Math.max(20, (day.bloating / 5) * 100)}%` : '8px',
                      }}
                    />
                    <span className="text-2xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
              
              {/* Trend */}
              {weeklyStats.trend !== 0 && (
                <div className={`flex items-center gap-1 mt-3 text-sm ${
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

          {/* Latest Insight/Win */}
          {latestInsight && (
            <button 
              onClick={() => navigate('/insights')}
              className="glass-card p-4 w-full text-left animate-slide-up opacity-0"
              style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${
                  latestInsight.type === 'win' 
                    ? 'bg-primary/20' 
                    : 'bg-coral/20'
                }`}>
                  <span className="text-lg">{latestInsight.type === 'win' ? '🎉' : '🎯'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{latestInsight.message}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    See Full Analysis <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Pending Rating */}
          {pendingEntry && (
            <div 
              className="glass-card p-5 border-l-4 border-coral animate-scale-in"
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

          {/* Primary CTA */}
          <Button
            onClick={() => navigate('/add-entry')}
            className="w-full h-16 rounded-2xl text-lg font-bold bg-gradient-to-r from-primary to-sage-dark text-primary-foreground floating-button animate-slide-up opacity-0"
            style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
          >
            <Plus className="w-6 h-6 mr-2" />
            Log New Meal
            <span className="text-sm font-normal ml-2 opacity-80">Takes 30 seconds</span>
          </Button>

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-5xl mb-3">🥗</p>
              <p className="text-muted-foreground">Start tracking to discover your triggers</p>
            </div>
          )}

          {/* Streak Card (for users with streaks) */}
          {streak >= 3 && (
            <div 
              className="glass-card p-5 bg-gradient-to-br from-coral/10 to-peach/10 text-center animate-slide-up opacity-0"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-foreground">{streak}-day streak!</div>
              <p className="text-sm text-muted-foreground mt-1">
                {streak < 7 && `${7 - streak} more days to unlock your first insight!`}
                {streak >= 7 && streak < 14 && "Keep it up! You're building valuable data."}
                {streak >= 14 && 'Incredible consistency! Your insights are highly accurate.'}
              </p>
              {streak >= 7 && (
                <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-coral/20">
                  <span className="text-lg">🏆</span>
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
