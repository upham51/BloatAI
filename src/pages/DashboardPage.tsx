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
          <StaggerContainer className="relative z-10 px-5 pt-2 pb-28 max-w-lg mx-auto space-y-4 w-full">
            {/* STUNNING Hero Section - Large Gradient Card */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[2rem] h-48"
              >
                {/* Dramatic gradient background - Pink to Purple to Peach */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 via-purple-200/50 to-peach-200/60" />

                {/* Animated gradient blobs */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 20, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-lavender/40 to-purple-300/30 rounded-full blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -15, 0],
                    y: [0, 10, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-mint/30 to-sky/25 rounded-full blur-3xl"
                />

                {/* Glassmorphic card overlay */}
                <div className="relative h-full backdrop-blur-xl bg-white/40 border border-white/60">
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    {/* Action buttons - top right */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <AdminQuickAccess />
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/profile')}
                          className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/80 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <User className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Greeting */}
                    <div className="flex flex-col items-start gap-1">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-sm font-bold text-foreground/60 tracking-wide uppercase"
                      >
                        {greeting} 👋
                      </motion.span>
                      <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-5xl font-black tracking-tight text-foreground leading-tight"
                      >
                        {firstName}
                      </motion.h1>
                    </div>

                    {/* Quick stat */}
                    {hasEnoughDataForInsights && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/80 shadow-lg">
                          <span className="text-2xl">🔥</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Streak</span>
                            <span className="text-lg font-black text-foreground">{streak} days</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/80 shadow-lg">
                          <span className="text-2xl">🍽️</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</span>
                            <span className="text-lg font-black text-foreground">{todaysMeals}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* BENTO GRID - Modern Layout with Varying Card Sizes */}
            {hasEnoughDataForInsights && (
              <>
                {/* Quick Actions Grid - 2 columns */}
                <StaggerItem>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Log Meal - Large CTA Card */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/add-entry')}
                      className="relative overflow-hidden rounded-3xl cursor-pointer group col-span-2 h-32"
                    >
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-mint/60 via-sky/50 to-primary/60" />

                      {/* Animated blob */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          x: [0, 15, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"
                      />

                      {/* Glass overlay */}
                      <div className="relative h-full backdrop-blur-xl bg-white/50 border border-white/70 group-hover:bg-white/60 transition-all duration-300">
                        <div className="h-full p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <span className="text-4xl">✨</span>
                            </div>
                            <div className="text-left">
                              <h3 className="text-2xl font-black text-foreground mb-0.5">Log a Meal</h3>
                              <p className="text-sm font-semibold text-foreground/60">Track your wellness</p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Insights Card */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/insights')}
                      className="relative overflow-hidden rounded-3xl cursor-pointer group h-28"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/50 to-purple-200/50" />
                      <div className="relative h-full backdrop-blur-xl bg-white/50 border border-white/70 group-hover:bg-white/60 transition-all duration-300">
                        <div className="h-full p-4 flex flex-col justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-lavender/30 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-foreground">Insights</h3>
                            <p className="text-xs font-semibold text-foreground/50">View patterns</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* History Card */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/history')}
                      className="relative overflow-hidden rounded-3xl cursor-pointer group h-28"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-peach/50 to-orange-200/50" />
                      <div className="relative h-full backdrop-blur-xl bg-white/50 border border-white/70 group-hover:bg-white/60 transition-all duration-300">
                        <div className="h-full p-4 flex flex-col justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-peach/30 flex items-center justify-center">
                            <Compass className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-foreground">History</h3>
                            <p className="text-xs font-semibold text-foreground/50">Past meals</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </StaggerItem>
              </>
            )}

            {/* Weekly Progress Chart - Enhanced Bento Card */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative overflow-hidden rounded-3xl"
                >
                  {/* Subtle gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky/20 via-mint/15 to-primary/20" />

                  {/* Glass overlay */}
                  <div className="relative backdrop-blur-xl bg-white/60 border border-white/80">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-black text-foreground">Weekly Progress</h2>
                          <p className="text-xs font-semibold text-muted-foreground">Your wellness journey</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                      </div>
                      <WeeklyProgressChart entries={entries} />
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* Enhanced Welcome section - show for brand new users with no meals */}
            {completedCount === 0 && (
              <>
                {/* Hero Welcome Card */}
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-[2rem] min-h-[200px]"
                  >
                    {/* Dramatic gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-mint/20 to-sky/30" />

                    {/* Animated blobs */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-20 -right-20 w-60 h-60 bg-mint/20 rounded-full blur-3xl"
                    />

                    {/* Glass overlay */}
                    <div className="relative backdrop-blur-xl bg-white/50 border border-white/70">
                      <div className="p-8 text-center">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-6xl block mb-4">🌟</span>
                        </motion.div>
                        <h3 className="font-black text-foreground text-3xl mb-3 tracking-tight">
                          Welcome to BloatAI
                        </h3>
                        <p className="text-sm text-muted-foreground font-semibold mb-6 max-w-sm mx-auto leading-relaxed">
                          Track your meals, discover patterns, and improve your digestive wellness.
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => navigate('/add-entry')}
                            className="bg-gradient-to-r from-primary via-mint to-primary text-white rounded-full px-8 py-6 text-base font-bold shadow-2xl hover:shadow-3xl transition-all"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'gradientShift 3s ease infinite',
                            }}
                          >
                            <span className="mr-2">🍽️</span>
                            Log Your First Meal
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>

                {/* How It Works - Bento Grid */}
                <StaggerItem>
                  <div>
                    <h4 className="font-black text-foreground mb-4 text-xl px-1">How it works</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: '🍽️', title: 'Log', desc: 'Track meals', gradient: 'from-mint/60 to-mint/30' },
                        { icon: '⏰', title: 'Rate', desc: 'Score bloating', gradient: 'from-peach/60 to-peach/30' },
                        { icon: '📊', title: 'Patterns', desc: 'See insights', gradient: 'from-lavender/60 to-lavender/30' },
                      ].map((step, index) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.08, y: -4 }}
                          className="relative overflow-hidden rounded-3xl cursor-default group"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient}`} />
                          <div className="relative backdrop-blur-xl bg-white/50 border border-white/70 group-hover:bg-white/60 transition-all duration-300">
                            <div className="p-5 flex flex-col items-center text-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">{step.icon}</span>
                              </div>
                              <div>
                                <p className="font-black text-foreground text-sm mb-0.5">{step.title}</p>
                                <p className="text-xs text-muted-foreground font-semibold leading-snug">{step.desc}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </StaggerItem>

                {/* Pro Tip Card */}
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-mint/20" />
                    <div className="relative backdrop-blur-xl bg-white/60 border border-white/80">
                      <div className="p-5 flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">💡</span>
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-black text-foreground text-sm mb-1.5">Pro Tip</h4>
                          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                            Log meals consistently for at least <span className="font-bold text-primary">3 days</span> to identify patterns and get meaningful insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              </>
            )}

            {/* Enhanced Building insights state - show when some meals logged but not enough */}
            {!hasEnoughDataForInsights && completedCount > 0 && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[2rem]"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-mint/20 to-lavender/30" />

                  {/* Animated gradient blobs */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -right-20 w-60 h-60 bg-primary/15 rounded-full blur-3xl"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, -90, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-20 -left-20 w-60 h-60 bg-lavender/15 rounded-full blur-3xl"
                  />

                  {/* Glass overlay */}
                  <div className="relative backdrop-blur-xl bg-white/50 border border-white/70">
                    <div className="p-8 text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-6xl block mb-4">📊</span>
                      </motion.div>

                      <h3 className="font-black text-foreground text-2xl mb-2 tracking-tight">
                        Building Your Insights
                      </h3>
                      <p className="text-sm text-muted-foreground font-semibold mb-6 max-w-sm mx-auto leading-relaxed">
                        Log meals with bloating ratings across <span className="font-black text-primary">{3 - daysWithData} more day{3 - daysWithData !== 1 ? 's' : ''}</span> to unlock your wellness insights
                      </p>

                      {/* Enhanced progress bar */}
                      <div className="w-full mb-6">
                        <div className="flex justify-between items-center mb-3 text-xs">
                          <span className="font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                          <span className="font-black text-primary text-sm">{daysWithData}/3 days</span>
                        </div>
                        <div className="relative w-full h-4 rounded-full overflow-hidden backdrop-blur-sm bg-white/60 border border-white/80">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(daysWithData / 3) * 100}%` }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full bg-gradient-to-r from-primary via-mint to-primary rounded-full relative overflow-hidden"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'gradientShift 3s ease infinite',
                            }}
                          >
                            {/* Shimmer effect */}
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          </motion.div>
                        </div>
                        {/* Milestone markers */}
                        <div className="flex justify-between mt-3">
                          {[1, 2, 3].map((day) => (
                            <motion.div
                              key={day}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + day * 0.1 }}
                              className={`flex flex-col items-center ${
                                daysWithData >= day ? 'opacity-100' : 'opacity-30'
                              } transition-opacity`}
                            >
                              <div className={`w-3 h-3 rounded-full ${
                                daysWithData >= day ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-muted-foreground'
                              }`} />
                              <span className="text-xs font-bold text-muted-foreground mt-1.5">Day {day}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => navigate('/add-entry')}
                          className="bg-gradient-to-r from-primary via-mint to-primary text-white rounded-full px-8 py-6 text-base font-bold shadow-2xl hover:shadow-3xl transition-all"
                          style={{
                            backgroundSize: '200% 100%',
                            animation: 'gradientShift 3s ease infinite',
                          }}
                        >
                          <span className="mr-2">✨</span>
                          Continue Logging
                        </Button>
                      </motion.div>

                      <p className="text-xs text-muted-foreground font-semibold mt-4">
                        Keep up the great work! 🎉
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* Pending Rating - Beautiful Card */}
            {pendingEntry && (
              <StaggerItem>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[2rem]"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-peach/40 via-lavender/30 to-mint/40" />

                  {/* Animated blob */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      x: [0, 20, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -right-10 w-40 h-40 bg-peach/20 rounded-full blur-2xl"
                  />

                  {/* Glass overlay */}
                  <div className="relative backdrop-blur-xl bg-white/60 border border-white/80">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-black text-foreground text-xl mb-1">Rate your last meal</h3>
                          <p className="text-sm text-muted-foreground font-semibold line-clamp-1">
                            {pendingEntry.custom_title || pendingEntry.meal_title || 'Your meal'}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-3xl">🍽️</span>
                        </motion.div>
                      </div>

                      {/* Number-based rating system with beautiful styling */}
                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((rating, index) => {
                          // Dynamic color scoring
                          const getGradient = (r: number) => {
                            if (r <= 2) return 'from-primary/80 to-mint/80';
                            if (r === 3) return 'from-yellow-400/80 to-orange-400/80';
                            return 'from-coral/80 to-red-400/80';
                          };

                          return (
                            <motion.button
                              key={rating}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                              whileHover={{ scale: 1.1, y: -4 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRate(rating)}
                              className="relative overflow-hidden flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-2xl backdrop-blur-xl bg-white/50 border-2 border-white/70 hover:border-white/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
                            >
                              {/* Gradient overlay on hover */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(rating)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                              <span className="relative text-2xl font-black text-foreground group-hover:text-white transition-colors duration-300">
                                {rating}
                              </span>
                              <span className="relative text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-white/90 transition-colors duration-300">
                                {RATING_LABELS[rating]}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSkip}
                        className="text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors w-full py-2"
                      >
                        Skip for now
                      </motion.button>
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
