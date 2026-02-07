import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, BarChart3, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import InsightsLoader from '@/components/shared/InsightsLoader';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { SpotifyWrappedTriggers } from '@/components/insights/SpotifyWrappedTriggers';
import { TimeOfDayPatterns } from '@/components/insights/TimeOfDayPatterns';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getIconForTrigger } from '@/lib/triggerUtils';
import { generateComprehensiveInsight, generateAdvancedInsights } from '@/lib/insightsAnalysis';
import { GrainTexture } from '@/components/ui/grain-texture';
import { getInsightsNatureBackground, getInsightsHeroBackground } from '@/lib/pexels';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useProfile(user?.id);
  const { entries, getCompletedCount } = useMeals();
  const completedCount = getCompletedCount();
  const neededForInsights = 3;
  // Check completed entries for insights, not just total entries
  const hasEnoughData = completedCount >= neededForInsights;

  // Nature background for progress card
  const [natureBackground] = useState(() => getInsightsNatureBackground());

  // Hero background for insights page header
  const [heroBackground] = useState(() => getInsightsHeroBackground());

  // Preload backgrounds
  useEffect(() => {
    const img = new Image();
    img.src = natureBackground.src;
    const img2 = new Image();
    img2.src = heroBackground.src;
  }, [natureBackground, heroBackground]);

  // Loading state for AI magic animation
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisKey, setAnalysisKey] = useState(0);

  // Trigger re-analysis on page visit - optimized for faster loading
  useEffect(() => {
    setIsAnalyzing(true);
    setAnalysisKey(prev => prev + 1);

    // Minimal loading delay for smooth UX (reduced from 800ms)
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [completedCount]); // Re-run when completed entries change (includes new ratings)

  // Generate comprehensive insights using new analysis engine
  const insights = useMemo(() => {
    return generateComprehensiveInsight(entries);
  }, [entries]); // Recompute whenever entries array changes

  // Generate advanced insights for comprehensive card
  const advancedInsights = useMemo(() => {
    return generateAdvancedInsights(entries);
  }, [entries]);

  // Calculate pattern count for hero stat pill
  const patternCount = useMemo(() => {
    let count = 0;
    if (advancedInsights?.triggerConfidence) {
      count += advancedInsights.triggerConfidence.filter(t => t.occurrences >= 2).length;
    }
    return count;
  }, [advancedInsights]);

  // Calculate trigger count for hero stat pill
  const triggerCount = useMemo(() => {
    if (!advancedInsights?.triggerConfidence) return 0;
    return advancedInsights.triggerConfidence.filter(
      t => t.confidence === 'high' || t.confidence === 'investigating'
    ).length;
  }, [advancedInsights]);

  // Full-screen loading state
  if (isAnalyzing && hasEnoughData) {
    return (
      <AppLayout>
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
          <GrainTexture />
          <InsightsLoader />
          <p className="mt-6 text-lg font-semibold text-primary animate-pulse">
            Analyzing your insights
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crunching the numbers...
          </p>
        </div>
      </AppLayout>
    );
  }

  if (!hasEnoughData) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="min-h-screen relative bg-mesh-gradient">
            <GrainTexture />

            <StaggerContainer className="relative z-10 px-5 pt-8 pb-36 max-w-lg mx-auto space-y-6">
              <StaggerItem>
                <header className="mb-2">
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-4xl font-black text-foreground tracking-tight"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  >
                    Insights
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-muted-foreground font-semibold mt-1"
                  >
                    Your personalized analysis
                  </motion.p>
                </header>
              </StaggerItem>

              {/* Nature image progress card - matches dashboard style */}
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

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="mt-5 flex justify-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/add-entry')}
                        className="px-8 py-3 rounded-2xl bg-white/95 backdrop-blur-sm text-charcoal font-bold text-sm shadow-glass border border-white/50 hover:bg-white transition-all duration-300"
                      >
                        Log a Meal
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="min-h-screen relative">
          {/* Subtle botanical line art background - matching History page */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <svg
              viewBox="0 0 200 700"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -right-10 top-48 w-64 h-auto opacity-[0.035] text-forest"
            >
              <path
                d="M100 700 Q95 580 100 480 Q105 380 95 280 Q88 180 100 60"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path d="M100 580 Q125 560 145 568 Q125 578 100 580" fill="currentColor" opacity="0.4" />
              <path d="M102 440 Q130 418 152 428 Q128 440 102 440" fill="currentColor" opacity="0.35" />
              <path d="M100 300 Q126 280 146 292 Q124 302 100 300" fill="currentColor" opacity="0.3" />
              <path d="M100 180 Q124 162 142 174 Q122 184 100 180" fill="currentColor" opacity="0.25" />
              <path d="M98 520 Q72 502 55 514 Q74 524 98 520" fill="currentColor" opacity="0.35" />
              <path d="M96 380 Q68 362 50 375 Q70 385 96 380" fill="currentColor" opacity="0.3" />
              <path d="M98 240 Q72 222 56 236 Q74 246 98 240" fill="currentColor" opacity="0.25" />
              <path d="M96 120 Q70 105 55 118 Q72 128 96 120" fill="currentColor" opacity="0.2" />
            </svg>
            <svg
              viewBox="0 0 120 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute -left-8 bottom-32 w-32 h-auto opacity-[0.025] text-forest"
            >
              <path
                d="M60 400 Q58 320 62 240 Q64 160 58 80"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path d="M62 340 Q80 325 92 332 Q78 342 62 340" fill="currentColor" opacity="0.35" />
              <path d="M60 260 Q42 248 30 258 Q44 265 60 260" fill="currentColor" opacity="0.3" />
              <path d="M62 180 Q78 168 90 178 Q76 186 62 180" fill="currentColor" opacity="0.25" />
              <path d="M60 110 Q44 98 34 108 Q46 115 60 110" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <StaggerContainer className="relative z-10 px-5 pt-4 pb-32 max-w-lg mx-auto space-y-6 w-full">

            {/* ORGANIC MODERNISM Hero Section - matching Dashboard/History */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[32px] h-52 shadow-glass-xl"
              >
                {/* Pexels Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroBackground.src})` }}
                />

                {/* Organic gradient overlays for depth and readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-forest/40 via-forest/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

                {/* Glass content */}
                <div className="relative h-full">
                  <div className="relative h-full p-7 flex flex-col justify-between">
                    {/* Title - bottom left with display serif font */}
                    <div className="flex flex-col items-start gap-2 pr-16 mt-auto">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-[11px] font-semibold text-white/80 tracking-[0.2em] uppercase font-body"
                      >
                        Your Story So Far
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
                        Insights
                      </motion.h1>
                    </div>

                    {/* Stat badges - bottom right */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="absolute bottom-5 right-5 flex items-center gap-2"
                    >
                      {patternCount > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-glass border border-white/50"
                        >
                          <BarChart3 className="w-4 h-4 text-forest" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-charcoal">{patternCount}</span>
                            <span className="text-[10px] font-medium text-charcoal/60">patterns</span>
                          </div>
                        </motion.div>
                      )}
                      {triggerCount > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-glass border border-white/50"
                        >
                          <Flame className="w-4 h-4 text-burnt" />
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-bold text-charcoal">{triggerCount}</span>
                            <span className="text-[10px] font-medium text-charcoal/60">triggers</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>

            {/* ============================================================
             * BLOAT HEALTH SCORE - Commented out for potential later use
             * ============================================================
             * The VisualHealthScoreHero component displays a 0-100 health score
             * with an animated stomach character. Preserved here for future use.
             *
             * {insights && (
             *   <StaggerItem>
             *     <VisualHealthScoreHero
             *       avgBloating={insights.avgBloating}
             *       totalMeals={insights.totalMeals}
             *       lowBloatingCount={insights.lowBloatingCount}
             *       highBloatingCount={insights.highBloatingCount}
             *     />
             *   </StaggerItem>
             * )}
             * ============================================================ */}

            {/* 1. YOUR BLOAT RHYTHM - Pattern awareness */}
            <StaggerItem>
              <BloatHeatmap entries={entries} />
            </StaggerItem>

            {/* 2. TOP SUSPECT FOODS - Likely triggers */}
            {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
              <StaggerItem>
                <SpotifyWrappedTriggers triggerConfidence={advancedInsights.triggerConfidence} />
              </StaggerItem>
            )}

            {/* 3. FOODS YOU EAT MOST - Eating patterns */}
            {insights?.topFoods && insights.topFoods.length > 0 && (
              <StaggerItem>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-amber-500/10"
                >
                  {/* Premium gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90" />

                  {/* Animated orbs */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-400/25 to-orange-400/20 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], x: [0, -10, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-yellow-400/20 to-amber-300/15 rounded-full blur-3xl"
                  />

                  {/* Glass overlay */}
                  <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem] p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-amber-500/20"
                      >
                        <UtensilsCrossed className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
                      </motion.div>
                      <div>
                        <h2 className="font-black text-foreground text-xl tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                          Top Suspect Foods
                        </h2>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">Foods that show up most often</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {insights.topFoods.map((item, index) => {
                        const icon = getIconForTrigger(item.food);
                        return (
                          <motion.div
                            key={item.food}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-100/80 hover:bg-white/90 hover:shadow-md hover:border-amber-200/80 transition-all cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 flex items-center justify-center text-lg shadow-sm">
                              {icon}
                            </div>
                            <span className="flex-1 font-bold text-foreground">{item.food}</span>
                            <span className="text-sm font-black text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-full border border-amber-200/50">
                              {item.count}x
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            )}

            {/* 4. WHEN YOUR GUT SPEAKS UP - Timing insights */}
            <StaggerItem>
              <TimeOfDayPatterns entries={entries} />
            </StaggerItem>

            {/* 5. WHY THIS KEEPS HAPPENING - Support & education */}
            <StaggerItem>
              <BloatingGuide />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
