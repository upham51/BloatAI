import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Shield, User, TrendingUp, Clock, Activity, Utensils } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { WeeklyProgressChart } from '@/components/insights/WeeklyProgressChart';
import { DynamicBackground } from '@/components/ui/DynamicBackground';
import { MetricCardEnhanced } from '@/components/ui/MetricCardEnhanced';
import { PercentageChange, calculatePercentageChange } from '@/components/ui/PercentageChange';
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

// Admin quick access component - Dark Theme
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
        className="w-10 h-10 rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 hover:bg-indigo-500/30 shadow-lg transition-all duration-300"
      >
        <Shield className="w-5 h-5 text-indigo-300" />
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
          {/* Sonar-Inspired Dark Immersive Background */}
          <DynamicBackground overlayOpacity={0.75} />

          <StaggerContainer className="relative z-10 px-5 pt-2 pb-28 max-w-lg mx-auto space-y-5 w-full">
            {/* Header with time-based greeting - Dark Immersive Theme */}
            <StaggerItem>
              <header className="relative mb-2">
                {/* Action buttons - absolute positioned in top right */}
                <div className="absolute top-0 right-0 flex items-center gap-2">
                  <AdminQuickAccess />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/profile')}
                      className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-lg transition-all duration-300"
                    >
                      <User className="w-5 h-5 text-white" />
                    </Button>
                  </motion.div>
                </div>

                {/* Centered greeting with dark theme */}
                <div className="flex flex-col items-center text-center gap-2 px-12 pt-4">
                  <span className="text-base font-medium text-white/70 tracking-tight dark-text-shadow">
                    {greeting},
                  </span>
                  <h1 className="text-6xl font-black tracking-tight text-white dark-text-shadow leading-tight">
                    {firstName}
                  </h1>
                </div>
              </header>
            </StaggerItem>

            {/* Sonar-Inspired Metric Cards */}
            {hasEnoughDataForInsights && (
              <>
                <StaggerItem>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Day Streak Card */}
                    <MetricCardEnhanced
                      title="Streak"
                      value={streak}
                      unit="days"
                      icon={Flame}
                      glow={streak > 0}
                      className="col-span-1"
                    />

                    {/* Today's Meals Card */}
                    <MetricCardEnhanced
                      title="Today"
                      value={todaysMeals}
                      unit="meals"
                      icon={Utensils}
                      className="col-span-1"
                    />
                  </div>
                </StaggerItem>

                {/* Weekly Bloating Average Card */}
                <StaggerItem>
                  <MetricCardEnhanced
                    title="Weekly Average Bloating"
                    value={weeklyBloating.toFixed(1)}
                    unit="/5"
                    icon={Activity}
                    progressValue={((5 - weeklyBloating) / 5) * 100}
                    details={[
                      {
                        label: 'Total Meals',
                        value: completedCount,
                      },
                      {
                        label: 'Days Tracked',
                        value: daysWithData,
                      },
                    ]}
                    onClick={() => navigate('/insights')}
                  />
                </StaggerItem>
              </>
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
                <div className="dark-immersive-card p-6 text-center">
                  <span className="text-4xl block mb-3">📊</span>
                  <h3 className="font-bold text-white mb-2 dark-text-shadow">Building Your Insights</h3>
                  <p className="text-sm text-white/70 mb-4 dark-text-shadow">
                    Log meals with bloating ratings across {3 - daysWithData} more day{3 - daysWithData !== 1 ? 's' : ''} to see your weekly trends
                  </p>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 progress-bar-glow rounded-full transition-all"
                      style={{ width: `${(daysWithData / 3) * 100}%` }}
                    />
                  </div>
                  <Button
                    onClick={() => navigate('/add-entry')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    Log a Meal
                  </Button>
                </div>
              </StaggerItem>
            )}

            {/* Pending Rating - Dark Theme */}
            {pendingEntry && (
              <StaggerItem>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="dark-immersive-card p-5"
                >
                  <p className="font-bold text-white mb-1 dark-text-shadow">Rate your last meal</p>
                  <p className="text-sm text-white/70 mb-4 line-clamp-1 dark-text-shadow">
                    {pendingEntry.custom_title || pendingEntry.meal_title || 'Your meal'}
                  </p>

                  {/* Number-based rating system */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(rating => {
                      return (
                        <button
                          key={rating}
                          onClick={() => handleRate(rating)}
                          className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl border-2 border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 transition-all duration-200"
                        >
                          <span className="text-2xl font-bold text-white">
                            {rating}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                            {RATING_LABELS[rating]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={handleSkip} className="text-xs text-white/50 mt-3 hover:text-white transition-colors">
                    Skip for now
                  </button>
                </motion.div>
              </StaggerItem>
            )}

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
