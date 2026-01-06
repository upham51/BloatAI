import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { RatingScale } from '@/components/shared/RatingScale';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Particles } from '@/components/ui/particles';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useProfile } from '@/hooks/useProfile';
import { RATING_LABELS, getTriggerCategory } from '@/types';
import { format, subDays, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getTimeBasedGreeting } from '@/lib/quotes';

// Food background images for the weekly average card
const FOOD_BACKGROUNDS = [
  '/images/food-backgrounds/food-bg-1.webp',
  '/images/food-backgrounds/food-bg-2.webp',
  '/images/food-backgrounds/food-bg-3.webp',
  '/images/food-backgrounds/food-bg-4.webp',
  '/images/food-backgrounds/food-bg-5.webp',
  '/images/food-backgrounds/food-bg-6.webp',
  '/images/food-backgrounds/food-bg-7.webp',
  '/images/food-backgrounds/food-bg-8.webp',
];

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
  const { entries, getPendingEntry, updateRating, skipRating, getCompletedCount } = useMeals();
  const { toast } = useToast();
  const { data: userProfile, refetch: refetchProfile } = useProfile(user?.id);

  const pendingEntry = getPendingEntry();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Randomly select a food background image that persists during the session
  const [foodBackground] = useState(() =>
    FOOD_BACKGROUNDS[Math.floor(Math.random() * FOOD_BACKGROUNDS.length)]
  );

  // Preload the selected background image for instant display
  useEffect(() => {
    const img = new Image();
    img.src = foodBackground;
  }, [foodBackground]);

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
      .slice(0, 2);
  }, [entries]);

  // Calculate today's meals
  const todaysMeals = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return entries.filter(e => format(new Date(e.created_at), 'yyyy-MM-dd') === today).length;
  }, [entries]);

  // Calculate average bloating for the week
  const weeklyBloating = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const weekMeals = entries.filter(e =>
      isAfter(new Date(e.created_at), weekAgo) &&
      e.bloating_rating !== null && e.bloating_rating !== undefined
    );

    if (weekMeals.length === 0) return 0;

    const total = weekMeals.reduce((sum, meal) => sum + (meal.bloating_rating || 0), 0);
    return total / weekMeals.length;
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
        {/* Particles Background */}
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={50}
          color="#8B7355"
          refresh={false}
        />

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

          {/* Main Bloating & Meals Card */}
          {completedCount >= 5 && (
            <div
              className="premium-card !bg-transparent p-6 animate-slide-up opacity-0 relative overflow-hidden"
              style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${foodBackground})`,
                  opacity: 0.35,
                }}
              />

              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-br from-card/85 via-card/70 to-card/85" />

              {/* Content (relative to stack on top of background) */}
              <div className="relative z-10">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4">Weekly Average</h2>

                {/* Main metric display */}
                <div className="flex items-center justify-between mb-6">
                  {/* Bloating Score */}
                  <div className="flex-1">
                    <div className="text-5xl font-bold text-foreground mb-1 drop-shadow-sm">
                      {weeklyBloating.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Bloating Score</div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-16 bg-border mx-4" />

                  {/* Today's Meals */}
                  <div className="flex-1 text-right">
                    <div className="text-5xl font-bold text-foreground mb-1 drop-shadow-sm">
                      {todaysMeals}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Meals Today</div>
                  </div>
                </div>

                {/* Subtext */}
                <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border/50">
                  Based on last 7 days
                </div>
              </div>
            </div>
          )}

          {/* Smaller Metric Cards Row */}
          {completedCount >= 5 && (
            <div
              className="grid grid-cols-2 gap-3 animate-slide-up opacity-0"
              style={{ animationDelay: '75ms', animationFillMode: 'forwards' }}
            >
              {/* Weekly Triggers Card */}
              <div className="premium-card p-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">Top Triggers</h3>
                {topTriggers.length > 0 ? (
                  <div className="space-y-2">
                    {topTriggers.map((trigger) => (
                      <div key={trigger.category} className="flex items-center gap-2">
                        <span className="text-base">
                          {trigger.severity === 'high' && '🔴'}
                          {trigger.severity === 'medium' && '🟡'}
                          {trigger.severity === 'low' && '🟢'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {trigger.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trigger.avg_bloating.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No triggers yet</p>
                )}
              </div>

              {/* Total Meals Card */}
              <div className="premium-card p-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">Total Logged</h3>
                <div className="text-4xl font-bold text-foreground mb-1">{completedCount}</div>
                <p className="text-xs text-muted-foreground">Meals tracked</p>
              </div>
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
        </div>
      </div>

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
