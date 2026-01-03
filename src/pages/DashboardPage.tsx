import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Flame, Settings, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { BloatingGuideModal } from '@/components/guide/BloatingGuideModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useProfile } from '@/hooks/useProfile';
import { RATING_LABELS, getTriggerCategory } from '@/types';
import { format, subDays, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getTimeBasedGreeting } from '@/lib/quotes';

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
  const { data: userProfile, refetch: refetchProfile } = useProfile(user?.id);

  const pendingEntry = getPendingEntry();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBloatingGuide, setShowBloatingGuide] = useState(false);

  // Show onboarding if user hasn't completed it
  useEffect(() => {
    if (userProfile && !userProfile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
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

          {/* Weekly Insights Card - shows triggers to avoid */}
          {completedCount >= 5 && topTriggers.length > 0 && (
            <div 
              className="premium-card p-5 animate-slide-up opacity-0 space-y-4"
              style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-coral" />
                  <span className="font-bold text-foreground text-sm">Watch Out This Week</span>
                </div>
                <div className="space-y-2">
                  {topTriggers.map((trigger) => (
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
              
              <button 
                onClick={() => navigate('/insights')}
                className="w-full text-center text-sm text-primary font-semibold flex items-center justify-center gap-1 pt-2"
              >
                See Detailed Analysis <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Building insights state - show when some meals logged but not enough */}
          {completedCount > 0 && completedCount < 5 && (
            <div 
              className="premium-card p-6 animate-slide-up opacity-0 text-center"
              style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
            >
              <span className="text-4xl block mb-3">📊</span>
              <h3 className="font-bold text-foreground mb-2">Building Your Insights</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Log {5 - completedCount} more meal{5 - completedCount !== 1 ? 's' : ''} with bloating ratings to see your triggers
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
          )}

          {/* Pending Rating */}
          {pendingEntry && (
            <div 
              className="premium-card p-5 animate-scale-in"
              style={{ animationDelay: '100ms' }}
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
            className="w-full h-16 rounded-3xl text-lg font-bold bg-primary text-primary-foreground relative overflow-hidden group animate-slide-up opacity-0"
            style={{ 
              animationDelay: '150ms', 
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

          {/* Streak Card (for users with streaks >= 3) */}
          {streak >= 3 && (
            <div 
              className="premium-card p-6 bg-gradient-to-br from-coral/10 to-peach/10 text-center animate-slide-up opacity-0"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
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

          {/* Bloating Guide Card */}
          <button
            onClick={() => setShowBloatingGuide(true)}
            className="premium-card p-6 text-left hover:scale-[1.01] transition-all duration-200 animate-slide-up opacity-0 group"
            style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-lavender/20 shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-3xl">🎈</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                  The Complete Guide to Bloating
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn about causes, relief, and prevention
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bloating Guide Modal */}
      <BloatingGuideModal
        isOpen={showBloatingGuide}
        onClose={() => setShowBloatingGuide(false)}
      />

      {/* Onboarding Modal - shows for new users */}
      {user && (
        <OnboardingModal
          isOpen={showOnboarding}
          userId={user.id}
          onComplete={() => {
            setShowOnboarding(false);
            refetchProfile();
          }}
        />
      )}
    </AppLayout>
  );
}
