import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Settings, Shield, User } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AnimatedOnboarding } from '@/components/onboarding/AnimatedOnboarding';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
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

// Admin quick access component
function AdminQuickAccess() {
  const { isAdmin, isLoading } = useAdmin();
  const navigate = useNavigate();

  if (isLoading || !isAdmin) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/admin')}
        className="w-10 h-10 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 hover:bg-primary/20 shadow-sm transition-all duration-300"
      >
        <Shield className="w-5 h-5 text-primary" />
      </Button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries, getPendingEntry, updateRating, skipRating, getCompletedCount } = useMeals();
  const { toast } = useToast();
  const { data: userProfile, refetch: refetchProfile } = useProfile(user?.id);

  const pendingEntry = getPendingEntry();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [showAnimatedOnboarding, setShowAnimatedOnboarding] = useState(false);
  const [showDataCollection, setShowDataCollection] = useState(false);

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

  // Show animated onboarding first, then data collection for new users
  useEffect(() => {
    if (userProfile && !userProfile.onboarding_completed) {
      setShowAnimatedOnboarding(true);
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

  // Show insights when user has data across at least 3 different days
  const hasEnoughDataForInsights = daysWithData >= 3;

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
          <StaggerContainer className="relative z-10 px-5 pt-2 pb-28 max-w-lg mx-auto space-y-5 w-full">
            {/* Enhanced Hero Section with Gradient Card */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden"
              >
                {/* Clean gradient background card */}
                <div className="relative premium-card p-6">
                  {/* Subtle gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-mint/5 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Action buttons - absolute positioned in top right */}
                    <div className="absolute -top-2 -right-2 flex items-center gap-2">
                      <AdminQuickAccess />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/profile')}
                          className="w-10 h-10 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card shadow-sm transition-all duration-300"
                        >
                          <User className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Left-aligned greeting with improved typography hierarchy */}
                    <div className="flex flex-col items-start gap-1 pt-2">
                      <span className="text-sm font-medium text-muted-foreground/70 tracking-tight">
                        {greeting},
                      </span>
                      <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                        {firstName}
                      </h1>
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Enhanced Stats Cards Row */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <div className="grid grid-cols-2 gap-3">
                  {/* Day Streak Card */}
                  <div className="premium-card p-5 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2">
                        <Flame className="w-10 h-10 text-coral drop-shadow-md" />
                      </div>
                      <div className="text-4xl font-black text-coral mb-1">
                        {streak}
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        Day Streak
                      </div>
                      {streak > 0 && (
                        <div className="mt-2 text-2xs text-coral/70 font-medium">
                          🔥 Keep it up!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meals Today Card */}
                  <div
                    onClick={() => navigate('/add-entry')}
                    className="premium-card p-5 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2">
                        <span className="text-3xl">🍽️</span>
                      </div>
                      <div className="text-4xl font-black text-foreground mb-1">
                        {todaysMeals}
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        Meals Today
                      </div>
                      <div className="mt-2 text-2xs text-primary/70 font-medium">
                        Tap to log
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            )}

            {/* Weekly Progress Chart */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <WeeklyProgressChart entries={entries} />
              </StaggerItem>
            )}

            {/* Enhanced Welcome section - show for brand new users with no meals */}
            {completedCount === 0 && (
              <>
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="premium-card p-8 text-center relative overflow-hidden"
                  >
                    {/* Clean gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-mint/5" />

                    <div className="relative z-10">
                      <span className="text-5xl block mb-4">🌟</span>
                      <h3 className="font-bold text-foreground text-2xl mb-3">
                        Welcome to BloatAI
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
                        Track your meals, discover patterns, and improve your digestive wellness.
                      </p>
                      <Button
                        onClick={() => navigate('/add-entry')}
                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <span className="mr-2">🍽️</span>
                        Log Your First Meal
                      </Button>
                    </div>
                  </motion.div>
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <h4 className="font-bold text-foreground mb-4 text-lg px-1">How it works</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: '🍽️', title: 'Log', desc: 'Track meals', bg: 'bg-gradient-to-br from-mint/40 to-mint/20' },
                        { icon: '⏰', title: 'Rate', desc: 'Score bloating', bg: 'bg-gradient-to-br from-peach/40 to-peach/20' },
                        { icon: '📊', title: 'Patterns', desc: 'See insights', bg: 'bg-gradient-to-br from-lavender/40 to-lavender/20' },
                      ].map((step, index) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          className="glass-card p-5 hover:scale-105 transition-transform duration-300 cursor-default"
                        >
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center`}>
                              <span className="text-2xl">{step.icon}</span>
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm mb-0.5">{step.title}</p>
                              <p className="text-xs text-muted-foreground leading-snug">{step.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="glass-card p-5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💡</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="font-bold text-foreground text-sm mb-1.5">Pro Tip</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Log meals consistently for at least <span className="font-bold text-primary">3 days</span> to identify patterns and get meaningful insights.
                        </p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              </>
            )}

            {/* Enhanced Building insights state - show when some meals logged but not enough */}
            {!hasEnoughDataForInsights && completedCount > 0 && (
              <StaggerItem>
                <div className="premium-card p-8 text-center relative overflow-hidden">
                  {/* Clean gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-mint/5" />

                  <div className="relative z-10">
                    <span className="text-5xl block mb-4">📊</span>

                    <h3 className="font-bold text-foreground text-xl mb-2">
                      Building Your Insights
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Log meals with bloating ratings across <span className="font-semibold text-primary">{3 - daysWithData} more day{3 - daysWithData !== 1 ? 's' : ''}</span> to unlock your wellness insights
                    </p>

                    {/* Enhanced progress bar */}
                    <div className="w-full mb-6">
                      <div className="flex justify-between items-center mb-2 text-xs">
                        <span className="font-semibold text-muted-foreground">Progress</span>
                        <span className="font-bold text-primary">{daysWithData}/3 days</span>
                      </div>
                      <div className="relative w-full h-3 bg-gradient-to-r from-muted/50 to-muted rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(daysWithData / 3) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-primary via-mint to-primary rounded-full relative overflow-hidden"
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          />
                        </motion.div>
                      </div>
                      {/* Milestone markers */}
                      <div className="flex justify-between mt-2">
                        {[1, 2, 3].map((day) => (
                          <div
                            key={day}
                            className={`flex flex-col items-center ${
                              daysWithData >= day ? 'opacity-100' : 'opacity-30'
                            } transition-opacity`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              daysWithData >= day ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                            }`} />
                            <span className="text-2xs text-muted-foreground mt-1">Day {day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate('/add-entry')}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-5 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <span className="mr-2">✨</span>
                      Continue Logging
                    </Button>

                    <p className="text-xs text-muted-foreground mt-4">
                      Keep up the great work!
                    </p>
                  </div>
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

          </StaggerContainer>
        </div>
      </PageTransition>

      {/* Animated Onboarding - beautiful intro for new users */}
      {showAnimatedOnboarding && (
        <AnimatedOnboarding
          onComplete={() => {
            setShowAnimatedOnboarding(false);
            setShowDataCollection(true);
          }}
        />
      )}

      {/* Data Collection Modal - shows after animated onboarding */}
      {user && (
        <OnboardingModal
          isOpen={showDataCollection}
          userId={user.id}
          onComplete={() => {
            setShowDataCollection(false);
            refetchProfile();
          }}
        />
      )}
    </AppLayout>
  );
}
