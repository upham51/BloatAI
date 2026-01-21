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
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/admin')}
        className="w-11 h-11 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/30 hover:bg-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
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
                {/* Premium gradient background card with refined styling */}
                <div className="relative premium-card p-7 shadow-xl border border-border/50">
                  {/* Sophisticated animated blobs in background */}
                  <div className="absolute inset-0 overflow-hidden opacity-20">
                    <motion.div
                      className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-mint via-primary to-lavender blur-[80px]"
                      animate={{
                        x: [0, 40, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ top: '-30px', right: '-30px' }}
                    />
                    <motion.div
                      className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-lavender via-mint to-primary blur-[80px]"
                      animate={{
                        x: [0, -30, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                      }}
                      style={{ bottom: '-40px', left: '-40px' }}
                    />
                  </div>

                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Action buttons - refined positioning */}
                    <div className="absolute -top-3 -right-3 flex items-center gap-2.5">
                      <AdminQuickAccess />
                      <motion.div
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/profile')}
                          className="w-11 h-11 rounded-2xl bg-card/90 backdrop-blur-md border border-border/60 hover:bg-card/95 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30"
                        >
                          <User className="w-5 h-5 text-foreground/80" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Centered greeting */}
                    <div className="flex flex-col items-center text-center gap-1 pt-2">
                      <span className="text-sm font-medium text-muted-foreground/70 tracking-wide">
                        {greeting},
                      </span>
                      <h1 className="text-[56px] font-black tracking-tight text-foreground leading-none mt-1" style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--mint)) 50%, hsl(var(--primary)) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundSize: '200% auto',
                      }}>
                        {firstName}
                      </h1>

                      {/* Quick Belly Check-in - only show if user has some data */}
                      {hasEnoughDataForInsights && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                          className="mt-3 w-full"
                        >
                          <p className="text-xs text-muted-foreground mb-2 font-medium">
                            How's your belly feeling today?
                          </p>
                          <div className="flex justify-center gap-3">
                            {[
                              { emoji: '😊', label: 'Great', color: 'primary' },
                              { emoji: '😐', label: 'Okay', color: 'yellow-500' },
                              { emoji: '😣', label: 'Bloated', color: 'coral' },
                            ].map((mood, index) => (
                              <motion.button
                                key={mood.label}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-card/60 backdrop-blur-sm border-2 border-transparent hover:border-primary/30 hover:bg-card/80 transition-all duration-300 min-w-[70px]"
                                onClick={() => {
                                  toast({
                                    title: `Feeling ${mood.label}!`,
                                    description: "Thanks for sharing. Let's log a meal!",
                                  });
                                }}
                              >
                                <span className="text-2xl">{mood.emoji}</span>
                                <span className="text-2xs font-semibold text-muted-foreground">
                                  {mood.label}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* Premium Stats Cards Row */}
            {hasEnoughDataForInsights && (
              <StaggerItem>
                <div className="grid grid-cols-2 gap-4">
                  {/* Day Streak Card */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="premium-card p-6 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/50"
                  >
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-coral/15 via-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-coral/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <motion.div
                        animate={{
                          scale: streak > 0 ? [1, 1.2, 1] : 1,
                          rotate: streak > 0 ? [0, -5, 5, 0] : 0,
                        }}
                        transition={{
                          duration: 2,
                          repeat: streak > 0 ? Infinity : 0,
                          ease: 'easeInOut',
                        }}
                        className="mb-2"
                      >
                        <div className="relative">
                          <Flame className="w-10 h-10 text-coral drop-shadow-lg" />
                          {streak > 0 && (
                            <motion.div
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 rounded-full bg-coral blur-xl"
                            />
                          )}
                        </div>
                      </motion.div>
                      <div className="text-4xl font-black text-coral mb-1">
                        {streak}
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        Day Streak
                      </div>
                      {streak > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-2xs text-coral/70 font-medium"
                        >
                          🔥 On fire!
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Meals Today Card */}
                  <motion.div
                    whileHover={{ y: -6, scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/add-entry')}
                    className="premium-card p-6 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-border/50"
                  >
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-mint/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="mb-2">
                        <span className="text-3xl">🍽️</span>
                      </div>
                      <div className="text-4xl font-black text-foreground mb-1">
                        {todaysMeals}
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        Meals Today
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-2xs text-primary/70 font-medium"
                      >
                        Tap to log meal
                      </motion.div>
                    </div>
                  </motion.div>
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
                    className="premium-card p-9 text-center relative overflow-hidden shadow-xl border border-border/50"
                  >
                    {/* Sophisticated animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-mint/8 to-lavender/8" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-mint/10" />

                    <div className="relative z-10">
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="mb-5"
                      >
                        <div className="inline-flex items-center justify-center">
                          <div className="relative">
                            {/* Glow behind star */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-mint/30 blur-2xl rounded-full scale-150" />
                            <span className="text-7xl block relative">🌟</span>
                          </div>
                        </div>
                      </motion.div>
                      <h3 className="font-black text-foreground text-3xl mb-4 tracking-tight" style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--mint)) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        Welcome to BloatAI!
                      </h3>
                      <p className="text-sm text-muted-foreground/80 mb-7 max-w-sm mx-auto leading-relaxed font-medium">
                        Your personalized journey to better digestive wellness starts here. Track meals, discover patterns, and feel your best.
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          onClick={() => navigate('/add-entry')}
                          className="relative bg-gradient-to-r from-primary via-mint to-primary text-white rounded-full px-12 py-7 text-base font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group"
                          style={{ backgroundSize: '200% auto' }}
                        >
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                          />
                          <span className="relative flex items-center gap-2">
                            <span className="text-xl">🍽️</span>
                            Log Your First Meal
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </StaggerItem>

                <StaggerItem>
                  <div className="premium-card p-7 relative overflow-hidden shadow-lg border border-border/50">
                    {/* Refined gradient background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-mint/15 to-primary/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-lavender/10 to-transparent rounded-full blur-[60px]" />

                    <div className="relative z-10">
                      <h4 className="font-black text-foreground mb-6 text-center text-xl tracking-tight">How it works</h4>
                      <div className="space-y-5">
                        {[
                          { icon: '🍽️', title: 'Log your meals', desc: 'Track what you eat throughout the day', color: 'from-primary/20 to-mint/20' },
                          { icon: '⏰', title: 'Rate your bloating', desc: 'After meals, rate your bloating from 1-5', color: 'from-lavender/20 to-primary/20' },
                          { icon: '📊', title: 'Discover patterns', desc: 'See insights and trends in your bloating', color: 'from-mint/20 to-primary/20' },
                        ].map((step, index) => (
                          <motion.div
                            key={step.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-start gap-4 group"
                          >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-md`}>
                              <span className="text-2xl">{step.icon}</span>
                            </div>
                            <div className="flex-1 pt-2">
                              <p className="font-bold text-foreground text-base mb-1.5">{step.title}</p>
                              <p className="text-xs text-muted-foreground/80 leading-relaxed">{step.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="premium-card p-7 relative overflow-hidden border-2 border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-mint/10 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/25 to-mint/25 border border-primary/20 flex items-center justify-center shadow-lg">
                          <span className="text-2xl">💡</span>
                        </div>
                        <h4 className="font-black text-foreground text-lg">Pro Tip</h4>
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                        For best results, log meals consistently for at least <span className="font-bold text-primary">3 days</span>. This helps us identify patterns and provide meaningful insights about your triggers.
                      </p>
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
                  className="premium-card p-7 text-center relative overflow-hidden"
                >
                  {/* Sophisticated gradient background with multiple layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-mint/8 to-lavender/5 opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-mint/10" />

                  <div className="relative z-10">
                    {/* Modern icon treatment with glassmorphism */}
                    <motion.div
                      animate={{
                        y: [0, -6, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex items-center justify-center mb-5"
                    >
                      <div className="relative">
                        {/* Glow effect behind icon */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-mint/30 blur-2xl rounded-full scale-150" />
                        {/* Glass card for icon */}
                        <div className="relative bg-gradient-to-br from-primary/10 to-mint/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-xl">
                          <svg
                            className="w-10 h-10 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    <h3 className="font-black text-foreground text-2xl mb-3 tracking-tight" style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--mint)) 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      Building Your Insights
                    </h3>
                    <p className="text-sm text-muted-foreground/80 mb-7 max-w-xs mx-auto leading-relaxed font-medium">
                      Log meals with bloating ratings across <span className="font-bold text-primary">{3 - daysWithData} more day{3 - daysWithData !== 1 ? 's' : ''}</span> to unlock your wellness wave
                    </p>

                    {/* Modern progress visualization */}
                    <div className="w-full mb-7">
                      <div className="flex justify-between items-center mb-3 text-xs">
                        <span className="font-bold text-muted-foreground/70 uppercase tracking-wider text-[10px]">Progress</span>
                        <span className="font-black text-primary text-sm">{daysWithData}<span className="text-muted-foreground/50">/3</span> days</span>
                      </div>

                      {/* Premium progress bar with depth */}
                      <div className="relative w-full h-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner border border-border/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(daysWithData / 3) * 100}%` }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-gradient-to-r from-primary via-mint to-primary rounded-full relative overflow-hidden shadow-lg"
                          style={{
                            boxShadow: '0 2px 8px rgba(var(--primary-rgb), 0.3), inset 0 1px 1px rgba(255,255,255,0.3)'
                          }}
                        >
                          {/* Animated shimmer effect */}
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                          />
                          {/* Top highlight */}
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                        </motion.div>
                      </div>

                      {/* Refined milestone markers */}
                      <div className="flex justify-between mt-4 px-1">
                        {[1, 2, 3].map((day) => (
                          <motion.div
                            key={day}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + day * 0.1, type: "spring", stiffness: 200 }}
                            className={`flex flex-col items-center transition-all duration-500 ${
                              daysWithData >= day ? 'opacity-100' : 'opacity-40'
                            }`}
                          >
                            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                              daysWithData >= day
                                ? 'bg-gradient-to-br from-primary to-mint shadow-lg'
                                : 'bg-muted/50 border-2 border-muted-foreground/20'
                            } transition-all duration-500`}>
                              {daysWithData >= day ? (
                                <motion.svg
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground/50">{day}</span>
                              )}
                              {/* Pulse animation for completed */}
                              {daysWithData >= day && (
                                <motion.div
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 rounded-full bg-primary"
                                />
                              )}
                            </div>
                            <span className={`text-[10px] font-semibold mt-2 uppercase tracking-wider ${
                              daysWithData >= day ? 'text-primary' : 'text-muted-foreground/50'
                            }`}>
                              Day {day}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative"
                    >
                      <Button
                        onClick={() => navigate('/add-entry')}
                        className="relative bg-gradient-to-r from-primary via-mint to-primary text-white rounded-full px-10 py-6 text-base font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group"
                        style={{
                          backgroundSize: '200% auto',
                        }}
                      >
                        {/* Shine effect on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: [0, 20, -20, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            ✨
                          </motion.span>
                          Continue Logging
                        </span>
                      </Button>
                    </motion.div>

                    {/* Encouraging message with better styling */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-5 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/5 to-mint/5 border border-primary/10"
                    >
                      <p className="text-xs text-muted-foreground/80 font-medium flex items-center justify-center gap-2">
                        <span className="text-base">🎉</span>
                        You're doing great! Keep it up!
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* Pending Rating */}
            {pendingEntry && (
              <StaggerItem>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="premium-card p-6 shadow-xl border border-border/50 relative overflow-hidden"
                >
                  {/* Subtle gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <p className="font-black text-foreground mb-2 text-lg">Rate your last meal</p>
              <p className="text-sm text-muted-foreground/80 mb-5 line-clamp-1 font-medium">
                {pendingEntry.custom_title || pendingEntry.meal_title || 'Your meal'}
              </p>

              {/* Number-based rating system */}
              <div className="grid grid-cols-5 gap-2.5">
                {[1, 2, 3, 4, 5].map(rating => {
                  // Dynamic color scoring: 1-2 Green, 3 Amber, 4-5 Coral
                  const getRatingColor = (r: number) => {
                    if (r <= 2) return 'border-primary bg-primary text-primary-foreground';
                    if (r === 3) return 'border-yellow-500 bg-yellow-500 text-white';
                    return 'border-coral bg-coral text-white';
                  };

                  return (
                    <motion.button
                      key={rating}
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRate(rating)}
                      className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border-2 border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <span className="text-2xl font-black text-foreground">
                        {rating}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        {RATING_LABELS[rating]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <button onClick={handleSkip} className="text-xs text-muted-foreground/70 mt-4 hover:text-foreground transition-colors font-medium">
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
