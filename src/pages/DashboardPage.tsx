import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Settings, Shield, User, Sparkles, BarChart3, Compass } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { AnimatedOnboarding } from '@/components/onboarding/AnimatedOnboarding';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { WeeklyProgressChart } from '@/components/insights/WeeklyProgressChart';
import { MilestonesCard } from '@/components/milestones/MilestonesCard';
import { MealPhoto } from '@/components/meals/MealPhoto';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useMilestones } from '@/contexts/MilestonesContext';
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
  const { getPendingExperimentMealId, completeExperiment } = useMilestones();
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

      // Check if this is a pending experiment meal
      const pendingExperimentMealId = getPendingExperimentMealId();
      if (pendingExperimentMealId && pendingExperimentMealId === pendingEntry.id) {
        // Complete the experiment with this rating
        await completeExperiment(pendingEntry.id, rating);
        toast({
          title: 'Experiment Complete!',
          description: 'Check your Experiments tab to see the results.'
        });
      } else {
        toast({ title: 'Rating saved!', description: `Rated as ${RATING_LABELS[rating].toLowerCase()}.` });
      }
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
          <StaggerContainer className="relative z-10 px-5 pt-4 pb-32 max-w-lg mx-auto space-y-5 w-full">
            {/* PREMIUM Hero Section - Ultra-polished Gradient Card */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[2.5rem] h-48 shadow-2xl shadow-purple-500/10"
              >
                {/* Enhanced gradient background with more depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100/80 via-purple-100/70 to-blue-100/80" />

                {/* Multiple animated gradient orbs for depth */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 25, 0],
                    y: [0, -15, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/25 rounded-full blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, -20, 0],
                    y: [0, 15, 0],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-blue-400/25 to-teal-300/20 rounded-full blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-lavender/20 to-mint/15 rounded-full blur-2xl"
                />

                {/* Premium glassmorphic overlay */}
                <div className="relative h-full backdrop-blur-2xl bg-white/40">
                  <div className="relative h-full p-7 flex flex-col">
                    {/* Action buttons - top right with enhanced styling */}
                    <div className="absolute top-5 right-5 flex items-center gap-2.5">
                      <AdminQuickAccess />
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 5 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/profile')}
                          className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-md border-2 border-white/90 hover:from-white/90 hover:via-white/70 hover:to-white/90 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                          <Sparkles className="w-5 h-5 text-primary drop-shadow-sm" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Greeting with enhanced typography */}
                    <div className="flex flex-col items-start gap-1.5 pr-16">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-[0.7rem] font-extrabold text-foreground/50 tracking-[0.15em] uppercase"
                      >
                        {greeting}
                      </motion.span>
                      <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-7xl font-black tracking-tight text-foreground leading-[0.9] drop-shadow-lg"
                        style={{
                          textShadow: '0 2px 20px rgba(0,0,0,0.08)'
                        }}
                      >
                        {firstName}
                      </motion.h1>
                    </div>
                  </div>
                </div>

                {/* Stats badges - positioned at bottom right inside the card */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute bottom-5 right-5 flex items-center gap-2 z-10"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-md"
                  >
                    <span className="text-lg">🔥</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-foreground">{streak}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">days</span>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-md"
                  >
                    <span className="text-lg">🍽️</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-foreground">{todaysMeals}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">today</span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </StaggerItem>

            {/* RATE YOUR BLOATING - Always show first when pending */}
            {pendingEntry && (
              <StaggerItem>
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-orange-500/15"
                >
                  {/* Meal photo background - full coverage, no overlay */}
                  {pendingEntry.photo_url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${pendingEntry.photo_url})` }}
                    />
                  )}

                  {/* Gradient background only when no photo */}
                  {!pendingEntry.photo_url && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-orange-100/70 to-rose-100/80" />

                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          x: [0, 25, 0],
                          rotate: [0, 60, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-orange-400/20 to-amber-400/15 rounded-full blur-2xl"
                      />

                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          x: [0, -15, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-rose-400/15 to-pink-400/10 rounded-full blur-2xl"
                      />
                    </>
                  )}

                  {/* Content overlay - transparent when photo, glass when no photo */}
                  <div className={`relative ${pendingEntry.photo_url ? '' : 'backdrop-blur-2xl bg-white/70 border-2 border-white/90'}`}>
                    <div className="p-7">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 pr-4">
                          <h3 className={`font-black text-2xl mb-2 tracking-tight ${pendingEntry.photo_url ? 'text-white' : 'text-foreground'}`} style={{ textShadow: pendingEntry.photo_url ? '0 2px 16px rgba(0,0,0,0.7), 0 4px 24px rgba(0,0,0,0.5)' : '0 1px 8px rgba(0,0,0,0.04)' }}>Rate your last meal</h3>
                          <p className={`text-sm font-bold line-clamp-1 ${pendingEntry.photo_url ? 'text-white' : 'text-muted-foreground'}`} style={pendingEntry.photo_url ? { textShadow: '0 2px 12px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)' } : {}}>
                            {pendingEntry.custom_title || pendingEntry.meal_title || 'Your meal'}
                          </p>
                        </div>
                        {/* Animated emoji only when no photo - photo is the full background */}
                        {!pendingEntry.photo_url && (
                          <motion.div
                            animate={{ rotate: [0, 12, -12, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 rounded-[1.25rem] overflow-hidden border-2 border-white/95 shadow-lg shadow-orange-500/10"
                          >
                            <div className="w-full h-full bg-gradient-to-br from-orange-200 via-amber-100 to-rose-200 flex items-center justify-center">
                              <span className="text-3xl drop-shadow-sm">🍽️</span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Premium number-based rating system */}
                      <div className="grid grid-cols-5 gap-3 mb-5">
                        {[1, 2, 3, 4, 5].map((rating, index) => {
                          // Enhanced dynamic color scoring
                          const getGradient = (r: number) => {
                            if (r <= 2) return 'from-emerald-400 to-teal-500';
                            if (r === 3) return 'from-amber-400 to-orange-500';
                            return 'from-rose-400 to-red-500';
                          };

                          const getShadow = (r: number) => {
                            if (r <= 2) return 'shadow-emerald-500/30';
                            if (r === 3) return 'shadow-amber-500/30';
                            return 'shadow-rose-500/30';
                          };

                          return (
                            <motion.button
                              key={rating}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.06, duration: 0.4 }}
                              whileHover={{ scale: 1.12, y: -6 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleRate(rating)}
                              className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 py-6 px-2 rounded-[1.25rem] backdrop-blur-md bg-white/70 border-2 border-white/85 hover:border-white shadow-lg hover:shadow-2xl ${getShadow(rating)} transition-all duration-500 group`}
                            >
                              {/* Premium gradient overlay on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(rating)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                              <span className="relative text-3xl font-black text-foreground group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-sm">
                                {rating}
                              </span>
                              <span className="relative text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground group-hover:text-white/95 transition-colors duration-300">
                                {RATING_LABELS[rating]}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSkip}
                        className={`text-sm font-bold transition-colors w-full py-3 rounded-xl ${pendingEntry.photo_url ? 'text-white hover:bg-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/50'}`}
                        style={pendingEntry.photo_url ? { textShadow: '0 2px 10px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)' } : {}}
                      >
                        Skip for now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* Milestones Card - Your Gut Health Journey */}
            <StaggerItem>
              <MilestonesCard />
            </StaggerItem>

            {/* Weekly Progress Chart - Ultra-Premium Card - Now shows after rating */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <WeeklyProgressChart entries={entries} />
              </StaggerItem>
            )}

            {/* PREMIUM BENTO GRID - Next-level Layout */}
            {hasEnoughDataForInsights && (
              <>
                {/* Quick Actions Grid - Enhanced spacing */}
                <StaggerItem>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Log Meal - Ultra-Premium CTA Card */}
                    <motion.div
                      whileHover={{ scale: 1.04, y: -6 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/add-entry')}
                      className="relative overflow-hidden rounded-[2rem] cursor-pointer group col-span-2 h-36 shadow-2xl shadow-teal-500/20"
                    >
                      {/* Multi-layer gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-100/80 via-cyan-100/70 to-blue-100/80" />

                      {/* Multiple animated orbs for depth */}
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          x: [0, 20, 0],
                          rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-primary/25 to-teal-400/20 rounded-full blur-2xl"
                      />

                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          x: [0, -10, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -left-8 -bottom-8 w-40 h-40 bg-gradient-to-tr from-mint/20 to-sky/15 rounded-full blur-2xl"
                      />

                      {/* Premium glass overlay */}
                      <div className="relative h-full backdrop-blur-2xl bg-white/60 border-2 border-white/80 group-hover:bg-white/70 transition-all duration-500">
                        <div className="h-full px-6 py-5 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <motion.div
                              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                              className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-white/90 to-white/70 flex items-center justify-center shadow-xl shadow-teal-500/20 border-2 border-white/95"
                            >
                              <span className="text-5xl drop-shadow-lg">✨</span>
                            </motion.div>
                            <div className="text-left">
                              <h3 className="text-3xl font-black text-foreground mb-1 tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>Log a Meal</h3>
                              <p className="text-sm font-bold text-foreground/60">Track your wellness</p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ x: [0, 6, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="mr-2"
                          >
                            <svg className="w-7 h-7 text-primary drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Insights Card - Enhanced */}
                    <motion.div
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/insights')}
                      className="relative overflow-hidden rounded-[1.75rem] cursor-pointer group h-36 shadow-xl shadow-purple-500/15"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 via-pink-100/70 to-lavender/80" />

                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -right-8 -top-8 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"
                      />

                      <div className="relative h-full backdrop-blur-2xl bg-white/60 border-2 border-white/80 group-hover:bg-white/70 transition-all duration-500">
                        <div className="h-full p-5 flex flex-col justify-between">
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="w-14 h-14 rounded-[1.25rem] bg-white/80 flex items-center justify-center shadow-lg shadow-purple-500/20 border-2 border-white/90"
                          >
                            <BarChart3 className="w-7 h-7 text-purple-600 drop-shadow-sm" strokeWidth={2.5} />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Insights</h3>
                            <p className="text-xs font-bold text-foreground/60 mt-0.5">View patterns</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* History Card - Enhanced */}
                    <motion.div
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/history')}
                      className="relative overflow-hidden rounded-[1.75rem] cursor-pointer group h-36 shadow-xl shadow-orange-500/15"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-peach/70 to-amber-100/80" />

                      <motion.div
                        animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-8 -bottom-8 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl"
                      />

                      <div className="relative h-full backdrop-blur-2xl bg-white/60 border-2 border-white/80 group-hover:bg-white/70 transition-all duration-500">
                        <div className="h-full p-5 flex flex-col justify-between">
                          <motion.div
                            whileHover={{ rotate: -5, scale: 1.1 }}
                            className="w-14 h-14 rounded-[1.25rem] bg-white/80 flex items-center justify-center shadow-lg shadow-orange-500/20 border-2 border-white/90"
                          >
                            <Compass className="w-7 h-7 text-orange-600 drop-shadow-sm" strokeWidth={2.5} />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">History</h3>
                            <p className="text-xs font-bold text-foreground/60 mt-0.5">Past meals</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </StaggerItem>
              </>
            )}

            {/* Ultra-Premium Welcome section - show for brand new users with no meals */}
            {completedCount === 0 && (
              <>
                {/* Hero Welcome Card - Stunning Design */}
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-purple-500/15"
                  >
                    {/* Multi-layer gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 via-pink-100/70 to-blue-100/80" />

                    {/* Multiple animated gradient orbs */}
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], rotate: [0, 120, 0] }}
                      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/15 rounded-full blur-3xl"
                    />

                    <motion.div
                      animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-blue-400/15 to-teal-400/10 rounded-full blur-3xl"
                    />

                    {/* Premium glass overlay */}
                    <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80">
                      <div className="p-10 text-center">
                        <motion.div
                          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-7xl block mb-5 drop-shadow-lg">🌟</span>
                        </motion.div>
                        <h3 className="font-black text-foreground text-4xl mb-4 tracking-tight" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
                          Welcome to BloatAI
                        </h3>
                        <p className="text-base text-muted-foreground font-bold mb-8 max-w-md mx-auto leading-relaxed">
                          Track your meals, discover patterns, and improve your digestive wellness.
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.06, y: -3 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            onClick={() => navigate('/add-entry')}
                            className="bg-gradient-to-r from-primary via-teal-500 to-primary text-white rounded-[1.5rem] px-10 py-7 text-lg font-black shadow-2xl hover:shadow-3xl transition-all border-2 border-white/50"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'gradientShift 3s ease infinite',
                            }}
                          >
                            <span className="mr-3 text-2xl">🍽️</span>
                            Log Your First Meal
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>

                {/* How It Works - Premium Bento Grid */}
                <StaggerItem>
                  <div>
                    <h4 className="font-black text-foreground mb-5 text-2xl px-1 tracking-tight">How it works</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: '🍽️', title: 'Log', desc: 'Track meals', gradient: 'from-teal-100/90 to-mint/80', iconBg: 'from-teal-50 to-mint/60' },
                        { icon: '⏰', title: 'Rate', desc: 'Score bloating', gradient: 'from-orange-100/90 to-peach/80', iconBg: 'from-orange-50 to-peach/60' },
                        { icon: '📊', title: 'Insights', desc: 'See patterns', gradient: 'from-purple-100/90 to-lavender/80', iconBg: 'from-purple-50 to-lavender/60' },
                      ].map((step, index) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                          whileHover={{ scale: 1.08, y: -6 }}
                          className="relative overflow-hidden rounded-[1.75rem] cursor-default group shadow-lg shadow-black/5"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient}`} />

                          <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
                            transition={{ duration: 12 + index * 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-8 -right-8 w-24 h-24 bg-white/20 rounded-full blur-2xl"
                          />

                          <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 group-hover:bg-white/70 transition-all duration-500">
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                              <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                                transition={{ duration: 0.5 }}
                                className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${step.iconBg} border-2 border-white/90 flex items-center justify-center shadow-lg`}
                              >
                                <span className="text-3xl drop-shadow-sm">{step.icon}</span>
                              </motion.div>
                              <div>
                                <p className="font-black text-foreground text-base mb-1">{step.title}</p>
                                <p className="text-xs text-muted-foreground font-bold leading-snug">{step.desc}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </StaggerItem>

                {/* Pro Tip Card - Enhanced */}
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-blue-500/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-cyan-100/70 to-teal-100/80" />

                    <motion.div
                      animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -right-12 -top-12 w-40 h-40 bg-blue-400/15 rounded-full blur-2xl"
                    />

                    <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/90">
                      <div className="p-6 flex items-start gap-4">
                        <motion.div
                          whileHover={{ rotate: [0, -15, 15, 0], scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className="w-14 h-14 rounded-[1.25rem] bg-white/90 border-2 border-white/95 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/10"
                        >
                          <span className="text-3xl drop-shadow-sm">💡</span>
                        </motion.div>
                        <div className="flex-1 pt-1.5">
                          <h4 className="font-black text-foreground text-lg mb-2 tracking-tight">Pro Tip</h4>
                          <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                            Log meals consistently for at least <span className="font-black text-primary text-base">3 days</span> to identify patterns and get meaningful insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              </>
            )}

            {/* Ultra-Premium Building insights state - show when some meals logged but not enough */}
            {!hasEnoughDataForInsights && completedCount > 0 && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-indigo-500/15"
                >
                  {/* Enhanced gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/80 via-purple-100/70 to-pink-100/80" />

                  {/* Multiple animated gradient orbs */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/15 rounded-full blur-3xl"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      rotate: [0, -120, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-pink-400/15 to-rose-400/10 rounded-full blur-3xl"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 180],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-lavender/15 to-purple-300/10 rounded-full blur-3xl"
                  />

                  {/* Premium glass overlay */}
                  <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80">
                    <div className="p-10 text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          rotate: [0, 8, -8, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-7xl block mb-5 drop-shadow-lg">📊</span>
                      </motion.div>

                      <h3 className="font-black text-foreground text-3xl mb-3 tracking-tight" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>
                        Building Your Insights
                      </h3>
                      <p className="text-base text-muted-foreground font-bold mb-8 max-w-md mx-auto leading-relaxed">
                        Log meals with bloating ratings across <span className="font-black text-primary text-lg">{3 - daysWithData} more day{3 - daysWithData !== 1 ? 's' : ''}</span> to unlock your wellness insights
                      </p>

                      {/* Premium progress bar */}
                      <div className="w-full mb-8">
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <span className="font-extrabold text-muted-foreground/70 uppercase tracking-[0.12em]">Progress</span>
                          <span className="font-black text-primary text-lg">{daysWithData}/3 <span className="text-sm font-bold text-muted-foreground">days</span></span>
                        </div>
                        <div className="relative w-full h-5 rounded-full overflow-hidden backdrop-blur-md bg-white/70 border-2 border-white/90 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(daysWithData / 3) * 100}%` }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden shadow-lg"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'gradientShift 3s ease infinite',
                            }}
                          >
                            {/* Enhanced shimmer effect */}
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            />
                          </motion.div>
                        </div>
                        {/* Premium milestone markers */}
                        <div className="relative mt-5 h-12">
                          {[1, 2, 3].map((day) => (
                            <motion.div
                              key={day}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + day * 0.1, duration: 0.5 }}
                              whileHover={{ scale: 1.1, y: -2 }}
                              className={`absolute flex flex-col items-center ${
                                daysWithData >= day ? 'opacity-100' : 'opacity-40'
                              } transition-all`}
                              style={{ left: `${(day / 3) * 100}%`, transform: 'translateX(-50%)' }}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                daysWithData >= day
                                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-white shadow-xl shadow-indigo-500/50'
                                  : 'bg-muted border-muted-foreground/30'
                              }`} />
                              <span className={`text-xs font-black mt-2 ${
                                daysWithData >= day ? 'text-foreground' : 'text-muted-foreground/60'
                              }`}>Day {day}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.06, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          onClick={() => navigate('/add-entry')}
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-[1.5rem] px-10 py-7 text-lg font-black shadow-2xl hover:shadow-3xl transition-all border-2 border-white/50"
                          style={{
                            backgroundSize: '200% 100%',
                            animation: 'gradientShift 3s ease infinite',
                          }}
                        >
                          <span className="mr-3 text-2xl">✨</span>
                          Continue Logging
                        </Button>
                      </motion.div>

                    </div>
                  </div>
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
