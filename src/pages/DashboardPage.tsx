import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { AbstractBackground } from '@/components/ui/abstract-background';
import { GrainTexture } from '@/components/ui/grain-texture';
import { WeeklyProgressChart } from '@/components/insights/WeeklyProgressChart';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useProfile } from '@/hooks/useProfile';
import { format, subDays, isAfter, differenceInCalendarDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getTimeBasedGreeting } from '@/lib/quotes';

const RATING_LABELS: Record<number, string> = {
  1: 'None',
  2: 'Mild',
  3: 'Moderate',
  4: 'Strong',
  5: 'Severe',
};

// Food background images for the weekly average card
const FOOD_BACKGROUNDS = [
  '/assets/images/food-backgrounds/food-bg-1.webp',
  '/assets/images/food-backgrounds/food-bg-2.webp',
  '/assets/images/food-backgrounds/food-bg-3.webp',
  '/assets/images/food-backgrounds/food-bg-4.webp',
  '/assets/images/food-backgrounds/food-bg-5.webp',
  '/assets/images/food-backgrounds/food-bg-6.webp',
  '/assets/images/food-backgrounds/food-bg-7.webp',
  '/assets/images/food-backgrounds/food-bg-8.webp',
];

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
    console.log('🍽️ Food background selected:', foodBackground);
    const img = new Image();
    img.src = foodBackground;
    img.onload = () => console.log('✅ Food background loaded successfully');
    img.onerror = () => console.error('❌ Food background failed to load:', foodBackground);
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

  // Calculate streak - Fixed timezone issues
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;

    const sortedDates = [...new Set(entries.map(e =>
      format(new Date(e.created_at), 'yyyy-MM-dd')
    ))].sort().reverse();

    const today = new Date();
    const mostRecentEntryDate = parseISO(sortedDates[0]);

    // Calculate days since last entry using calendar days (timezone-safe)
    const daysSinceLastEntry = differenceInCalendarDays(today, mostRecentEntryDate);

    // Streak is broken if more than 1 day has passed
    // 0 = logged today, 1 = logged yesterday (streak continues), 2+ = streak broken
    if (daysSinceLastEntry > 1) return 0;

    // Count consecutive days backwards from most recent entry
    let count = 0;
    let currentDate = mostRecentEntryDate;

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

  // Calculate number of unique days with rated meals for meaningful insights
  const daysWithData = useMemo(() => {
    const ratedMeals = entries.filter(e =>
      e.bloating_rating !== null &&
      e.bloating_rating !== undefined &&
      e.bloating_rating >= 1 &&
      e.bloating_rating <= 5
    );

    const uniqueDays = new Set(
      ratedMeals.map(e => format(new Date(e.created_at), 'yyyy-MM-dd'))
    );

    return uniqueDays.size;
  }, [entries]);

  // Show insights when user has enough data: at least 5 rated meals across at least 3 different days
  const hasEnoughDataForInsights = completedCount >= 5 && daysWithData >= 3;

  // Calculate today's meals
  const todaysMeals = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return entries.filter(e => format(new Date(e.created_at), 'yyyy-MM-dd') === today).length;
  }, [entries]);

  // Calculate average bloating for the week
  const weeklyBloating = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    // Use same filter as chart: valid bloating rating (1-5)
    const weekMeals = entries.filter(e =>
      isAfter(new Date(e.created_at), weekAgo) &&
      e.bloating_rating !== null &&
      e.bloating_rating !== undefined &&
      e.bloating_rating >= 1 &&
      e.bloating_rating <= 5
    );

    if (weekMeals.length === 0) return 0;

    const total = weekMeals.reduce((sum, meal) => sum + (meal.bloating_rating || 0), 0);
    return total / weekMeals.length;
  }, [entries]);

  const handleRate = async (rating: number) => {
    if (!pendingEntry) return;
    try {
      await updateRating(pendingEntry.id, rating);
      toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
    } catch (error) {
      console.error('Failed to save rating:', error);
      toast({
        title: 'Failed to save rating',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = async () => {
    if (!pendingEntry) return;
    try {
      await skipRating(pendingEntry.id);
      toast({ title: 'Rating skipped' });
    } catch (error) {
      console.error('Failed to skip rating:', error);
      toast({
        title: 'Failed to skip rating',
        description: 'Please try again or check your connection.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="min-h-screen relative">
          <AbstractBackground />
          <GrainTexture />
          <StaggerContainer className="relative z-10 px-5 pt-2 pb-32 max-w-lg mx-auto space-y-5 w-full">
            {/* Header with time-based greeting */}
            <StaggerItem>
              <header className="relative">
                {/* Settings button - absolute positioned in top right */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-0 right-0"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/profile')}
                    className="w-10 h-10 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card shadow-sm transition-all duration-300"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </motion.div>

                {/* Main header content - side by side layout */}
                <div className="flex items-center justify-between gap-3 pr-12">
                  {/* Left side: Greeting + Name */}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-base font-medium text-muted-foreground tracking-tight">
                      {greeting},
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent truncate">
                      {firstName}
                    </h1>
                  </div>

                  {/* Right side: Streak badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.3,
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-coral/20 to-peach/20 border border-coral/30 shadow-md flex-shrink-0"
                  >
                    <motion.div
                      animate={{
                        scale: streak > 0 ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: streak > 0 ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      <Flame className="w-5 h-5 text-coral drop-shadow-sm" />
                    </motion.div>
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-lg font-bold text-coral">{streak}</span>
                      <span className="text-[10px] font-semibold text-coral/90 uppercase tracking-wide">day streak</span>
                    </div>
                  </motion.div>
                </div>
              </header>
            </StaggerItem>

            {/* Main Bloating & Meals Card */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="premium-card !bg-transparent p-6 relative overflow-hidden cursor-pointer"
                >
              {/* Background Image */}
              <img
                src={foodBackground}
                alt="Food background"
                className="absolute inset-0 w-full h-full object-cover opacity-55 pointer-events-none"
              />

              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-br from-card/85 via-card/70 to-card/85 pointer-events-none" />

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
              </motion.div>
              </StaggerItem>
            )}

            {/* Weekly Progress Chart */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <WeeklyProgressChart entries={entries} />
              </StaggerItem>
            )}

            {/* Building insights state - show when some meals logged but not enough */}
            {!hasEnoughDataForInsights && completedCount > 0 && (
              <StaggerItem>
                <div className="premium-card p-6 text-center">
              <span className="text-4xl block mb-3">📊</span>
              <h3 className="font-bold text-foreground mb-2">Building Your Insights</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {completedCount < 5
                  ? `Log ${5 - completedCount} more meal${5 - completedCount !== 1 ? 's' : ''} with bloating ratings to unlock insights`
                  : `Log meals across ${3 - daysWithData} more day${3 - daysWithData !== 1 ? 's' : ''} to see meaningful trends`
                }
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((completedCount / 5) * 50 + (daysWithData / 3) * 50, 100)}%` }}
                  />
                </div>
                <Button
                  onClick={() => navigate('/add-entry')}
                  className="bg-primary text-primary-foreground rounded-full px-6"
                >
                  Log a Meal
                </Button>
              </div>
              </StaggerItem>
            )}

            {/* Pending Rating */}
            {pendingEntry && (
              <StaggerItem>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="premium-card p-5"
                >
              <p className="font-bold text-foreground mb-1">Rate your last meal</p>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                {pendingEntry.custom_title || pendingEntry.meal_title || 'Your meal'}
              </p>

              {/* Number-based rating system */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(rating => {
                  // Dynamic color scoring: 1-2 Green, 3 Amber, 4-5 Coral
                  const getRatingColor = (r: number) => {
                    if (r <= 2) return 'border-primary bg-primary text-primary-foreground';
                    if (r === 3) return 'border-yellow-500 bg-yellow-500 text-white';
                    return 'border-coral bg-coral text-white';
                  };

                  return (
                    <button
                      key={rating}
                      onClick={() => handleRate(rating)}
                      className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl border-2 border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30 transition-all duration-200"
                    >
                      <span className="text-2xl font-bold text-foreground">
                        {rating}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {RATING_LABELS[rating]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button onClick={handleSkip} className="text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors">
                Skip for now
              </button>
              </motion.div>
              </StaggerItem>
            )}

            {/* Primary CTA */}
            <StaggerItem>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={() => navigate('/add-entry')}
                  className="w-full h-16 rounded-3xl text-lg font-bold bg-primary text-primary-foreground relative overflow-hidden group"
                  style={{
                    boxShadow: '0 8px 24px -4px hsl(var(--primary) / 0.4)'
                  }}
                >
                  <span className="text-lg font-bold relative z-10">Log New Meal</span>
                </Button>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageTransition>

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
