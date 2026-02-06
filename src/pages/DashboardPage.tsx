import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Settings, Shield, User, Sparkles, Leaf } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { WeeklyProgressChart } from '@/components/insights/WeeklyProgressChart';
import { CorrelationTeaser } from '@/components/insights/CorrelationTeaser';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/contexts/MealContext';
import { useProfile } from '@/hooks/useProfile';
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getTimeBasedGreeting } from '@/lib/quotes';
import { fetchTimeBasedHeroBackground, getTimePeriod, getInsightsNatureBackground, type PexelsPhoto } from '@/lib/pexels';

const RATING_LABELS: Record<number, string> = {
  1: 'None',
  2: 'Mild',
  3: 'Moderate',
  4: 'Strong',
  5: 'Severe',
};

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
        className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 hover:bg-white/90 shadow-glass transition-all duration-300"
      >
        <Shield className="w-5 h-5 text-forest" />
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

  // Get time-based hero background (skeleton until API resolves)
  const [heroBackground, setHeroBackground] = useState<PexelsPhoto | null>(null);
  const [natureBackground] = useState(() => getInsightsNatureBackground());
  const timePeriod = getTimePeriod();

  // Fetch hero background from Pexels API
  useEffect(() => {
    let cancelled = false;
    fetchTimeBasedHeroBackground().then((photo) => {
      if (!cancelled) {
        setHeroBackground(photo);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Preload backgrounds once available
  useEffect(() => {
    if (heroBackground) {
      const img = new Image();
      img.src = heroBackground.src;
    }
    const img2 = new Image();
    img2.src = natureBackground.src;
  }, [heroBackground, natureBackground]);

  // Show onboarding for new users
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

    const today = new Date();
    const mostRecentEntryDate = parseISO(sortedDates[0]);
    const daysSinceLastEntry = differenceInCalendarDays(today, mostRecentEntryDate);

    if (daysSinceLastEntry > 1) return 0;

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

  const completedCount = getCompletedCount();

  const neededForInsights = 3;
  const hasEnoughDataForInsights = completedCount >= neededForInsights;

  // Calculate today's meals
  const todaysMeals = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return entries.filter(e => format(new Date(e.created_at), 'yyyy-MM-dd') === today).length;
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
        <div className="min-h-screen relative bg-mesh-gradient">
          <StaggerContainer className="relative z-10 px-5 pt-4 pb-36 max-w-lg mx-auto space-y-6 w-full">

            {/* ORGANIC MODERNISM Hero Section */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[32px] h-52 shadow-glass-xl"
              >
                {/* Skeleton / Background Image */}
                {heroBackground ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroBackground.src})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-sage/30 animate-pulse" />
                )}

                {/* Organic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-forest/40 via-forest/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

                {/* Glass content overlay */}
                <div className="relative h-full">
                  <div className="relative h-full p-7 flex flex-col justify-between">
                    {/* Action buttons - top right */}
                    <div className="absolute top-5 right-5 flex items-center gap-2.5">
                      <AdminQuickAccess />
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/profile')}
                          className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 hover:bg-white shadow-glass transition-all duration-300"
                        >
                          <Leaf className="w-5 h-5 text-forest" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Greeting with Premium Serif Typography */}
                    <div className="flex flex-col items-start gap-2 pr-16 mt-auto">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-[11px] font-semibold text-white/80 tracking-[0.2em] uppercase font-body"
                      >
                        Good {timePeriod}
                      </motion.span>
                      <motion.h1
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-display-xl font-display font-bold text-white leading-[0.95] drop-shadow-lg"
                        style={{
                          textShadow: '0 4px 24px rgba(0,0,0,0.3)'
                        }}
                      >
                        {firstName}
                      </motion.h1>
                    </div>

                    {/* Stats badges - bottom right */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="absolute bottom-5 right-5 flex items-center gap-2"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-glass border border-white/50"
                      >
                        <Flame className="w-4 h-4 text-burnt" />
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-charcoal">{streak}</span>
                          <span className="text-[10px] font-medium text-charcoal/60">days</span>
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-glass border border-white/50"
                      >
                        <span className="text-sm">🍽️</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-charcoal">{todaysMeals}</span>
                          <span className="text-[10px] font-medium text-charcoal/60">today</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* RATE YOUR BLOATING - Organic Modernism Style */}
            {pendingEntry && (
              <StaggerItem>
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card overflow-hidden"
                >
                  {/* Meal photo as subtle background */}
                  {pendingEntry.photo_url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20"
                      style={{ backgroundImage: `url(${pendingEntry.photo_url})` }}
                    />
                  )}

                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 pr-4">
                        <h3 className="font-display text-2xl font-bold text-charcoal mb-1.5">
                          Rate your meal
                        </h3>
                        <p className="text-sm font-medium text-charcoal/60 line-clamp-1">
                          {pendingEntry.custom_title || pendingEntry.meal_title || 'Your recent meal'}
                        </p>
                      </div>
                      {pendingEntry.photo_url && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-glass"
                        >
                          <img
                            src={pendingEntry.photo_url}
                            alt="Meal"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Premium rating buttons - Forest Green to Burnt Orange scale */}
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      {[1, 2, 3, 4, 5].map((rating, index) => {
                        const getColor = (r: number) => {
                          if (r <= 2) return { bg: 'from-forest to-forest-light', shadow: 'shadow-forest/20' };
                          if (r === 3) return { bg: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' };
                          return { bg: 'from-burnt to-burnt-dark', shadow: 'shadow-burnt/20' };
                        };

                        const colors = getColor(rating);

                        return (
                          <motion.button
                            key={rating}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            whileHover={{ scale: 1.08, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRate(rating)}
                            className={`relative flex flex-col items-center justify-center gap-1.5 py-5 px-2 rounded-[20px] bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 group tactile-press`}
                          >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <span className="relative text-2xl font-bold text-charcoal group-hover:text-white transition-colors duration-300">
                              {rating}
                            </span>
                            <span className="relative text-[8px] font-bold uppercase tracking-wider text-charcoal/50 group-hover:text-white/90 transition-colors duration-300">
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
                      className="text-sm font-semibold text-charcoal/50 hover:text-charcoal transition-colors w-full py-2.5 rounded-xl hover:bg-sage/50"
                    >
                      Skip for now
                    </motion.button>
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

            {/* Welcome section for new users */}
            {completedCount === 0 && (
              <>
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="premium-card p-8 text-center"
                  >
                    {/* Ambient orb background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-[32px]">
                      <div className="w-64 h-64 ambient-orb ambient-orb-healthy" />
                    </div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Leaf className="w-16 h-16 text-forest mx-auto mb-5" strokeWidth={1.5} />
                    </motion.div>

                    <h3 className="font-display text-3xl font-bold text-charcoal mb-3">
                      Welcome to BloatAI
                    </h3>
                    <p className="text-base text-charcoal/60 font-medium mb-6 max-w-xs mx-auto leading-relaxed">
                      Track your meals, discover patterns, and improve your digestive wellness.
                    </p>

                    <motion.div
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => navigate('/add-entry')}
                        className="btn-primary text-base px-8 py-6 rounded-[24px]"
                      >
                        <span className="mr-2 text-lg">🍽️</span>
                        Log Your First Meal
                      </Button>
                    </motion.div>
                  </motion.div>
                </StaggerItem>

                {/* How It Works - Bento Grid */}
                <StaggerItem>
                  <div>
                    <h4 className="font-display text-xl font-bold text-charcoal mb-4 px-1">
                      How it works
                    </h4>
                    <div className="bento-grid grid-cols-3">
                      {[
                        { icon: '🍽️', title: 'Log', desc: 'Track meals', color: 'forest' },
                        { icon: '⏰', title: 'Rate', desc: 'Score bloating', color: 'burnt' },
                        { icon: '📊', title: 'Insights', desc: 'See patterns', color: 'forest' },
                      ].map((step, index) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          className="glass-card p-5 text-center cursor-default"
                        >
                          <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl mb-3"
                          >
                            {step.icon}
                          </motion.div>
                          <p className="font-bold text-charcoal text-sm mb-0.5">{step.title}</p>
                          <p className="text-[11px] text-charcoal/50 font-medium">{step.desc}</p>
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
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-charcoal text-base mb-1">Pro Tip</h4>
                        <p className="text-sm text-charcoal/60 font-medium leading-relaxed">
                          Log and rate at least <span className="font-bold text-forest">3 meals</span> to identify patterns and get meaningful insights.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              </>
            )}

            {/* Building insights state */}
            {!hasEnoughDataForInsights && completedCount > 0 && (
              <>
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-[32px] shadow-glass-xl"
                  >
                    {/* Nature Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${natureBackground.src})` }}
                    />

                    {/* Gradient overlays for readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/70" />
                    <div className="absolute inset-0 bg-gradient-to-br from-forest/20 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="relative p-7 pb-6">
                      {/* Top section */}
                      <div className="text-center mb-5">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span className="text-[11px] font-bold text-white uppercase tracking-widest">Building Insights</span>
                        </motion.div>

                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="font-display text-2xl font-bold text-white mb-2"
                          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
                        >
                          {neededForInsights - completedCount} more meal{neededForInsights - completedCount !== 1 ? 's' : ''} to go
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                          className="text-sm text-white/80 font-medium max-w-xs mx-auto"
                          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.2)' }}
                        >
                          Rate your meals to unlock personalized wellness insights
                        </motion.p>
                      </div>

                      {/* Progress section with glass background */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-4"
                      >
                        <div className="flex justify-between items-center mb-3 text-xs">
                          <span className="font-bold text-white/70 uppercase tracking-wider">Progress</span>
                          <span className="font-bold text-white">{completedCount}/{neededForInsights}</span>
                        </div>

                        <div className="relative">
                          {/* Progress track */}
                          <div className="relative w-full h-2.5 rounded-full overflow-hidden bg-white/20">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(completedCount / neededForInsights) * 100}%` }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full rounded-full bg-white/90"
                            />
                          </div>

                          {/* Milestone markers */}
                          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between pointer-events-none px-0">
                            {[1, 2, 3].map((meal) => (
                              <motion.div
                                key={meal}
                                className={`w-4 h-4 rounded-full border-2 ${
                                  completedCount >= meal
                                    ? 'bg-white border-white/50 shadow-lg shadow-white/30'
                                    : 'bg-white/20 border-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Meal labels */}
                        <div className="flex justify-between mt-3">
                          {[1, 2, 3].map((meal) => (
                            <span
                              key={meal}
                              className={`text-xs font-bold ${
                                completedCount >= meal ? 'text-white' : 'text-white/40'
                              }`}
                            >
                              Meal {meal}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </StaggerItem>

                {/* Correlation Teaser */}
                <StaggerItem>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="glass-card p-6"
                  >
                    <CorrelationTeaser entries={entries} />
                  </motion.div>
                </StaggerItem>
              </>
            )}

          </StaggerContainer>
        </div>
      </PageTransition>

      {/* Onboarding Flow */}
      {showOnboarding && user && (
        <OnboardingFlow
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
