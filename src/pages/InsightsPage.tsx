import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BarChart3, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/layout/PageTransition';
import { BloatingGuide } from '@/components/guide/BloatingGuide';
import { BloatHeatmap } from '@/components/insights/BloatHeatmap';
import { BloatInsightsCard } from '@/components/insights/BloatInsightsCard';
import { SpotifyWrappedTriggers } from '@/components/insights/SpotifyWrappedTriggers';
import { TimeOfDayPatterns } from '@/components/insights/TimeOfDayPatterns';
import { SafeFoodsCard } from '@/components/insights/SafeFoodsCard';
import { useMeals } from '@/contexts/MealContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { generateAdvancedInsights } from '@/lib/insightsAnalysis';
import { GrainTexture } from '@/components/ui/grain-texture';
import { getInsightsNatureBackground, getInsightsHeroBackground, fetchInsightsNatureBackground, fetchInsightsHeroBackground } from '@/lib/pexels';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useProfile(user?.id);
  const { entries, getCompletedCount } = useMeals();
  const completedCount = getCompletedCount();
  const neededForInsights = 3;
  // Check completed entries for insights, not just total entries
  const hasEnoughData = completedCount >= neededForInsights;

  // Nature background for progress card (static fallback, then async collection upgrade)
  const [natureBackground, setNatureBackground] = useState(() => getInsightsNatureBackground());

  // Hero background for insights page header (static fallback, then async collection upgrade)
  const [heroBackground, setHeroBackground] = useState(() => getInsightsHeroBackground());

  // Fetch backgrounds from Pexels collections
  useEffect(() => {
    let cancelled = false;
    fetchInsightsNatureBackground().then((photo) => {
      if (!cancelled) setNatureBackground(photo);
    });
    fetchInsightsHeroBackground().then((photo) => {
      if (!cancelled) setHeroBackground(photo);
    });
    return () => { cancelled = true; };
  }, []);

  // Preload backgrounds
  useEffect(() => {
    const img = new Image();
    img.src = natureBackground.src;
    const img2 = new Image();
    img2.src = heroBackground.src;
  }, [natureBackground, heroBackground]);


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
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                        transition={{ delay: 0, duration: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-widest">Building Insights</span>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0, duration: 0.2 }}
                        className="font-display text-2xl font-bold text-white mb-2"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
                      >
                        {neededForInsights - completedCount} more meal{neededForInsights - completedCount !== 1 ? 's' : ''} to go
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0, duration: 0.2 }}
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
                      transition={{ delay: 0, duration: 0.2 }}
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
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
                      transition={{ delay: 0, duration: 0.2 }}
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
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                  <div className="relative h-full p-7 flex flex-col justify-end">
                    {/* Bottom row: Title left, badges right */}
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex flex-col items-start gap-1 min-w-0">
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0, duration: 0.2 }}
                          className="text-[11px] font-semibold text-white/80 tracking-[0.2em] uppercase font-body"
                        >
                          Your Story So Far
                        </motion.span>
                        <motion.h1
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0, duration: 0.2 }}
                          className="text-display-xl font-display font-bold text-white leading-[0.95] drop-shadow-lg"
                          style={{
                            textShadow: '0 4px 24px rgba(0,0,0,0.3)'
                          }}
                        >
                          Insights
                        </motion.h1>
                      </div>

                      {/* Stat badges */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0, duration: 0.2 }}
                        className="flex flex-col gap-1.5 flex-shrink-0"
                      >
                        {patternCount > 0 && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-glass border border-white/40"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-forest" />
                            <span className="text-sm font-bold text-charcoal">{patternCount}</span>
                            <span className="text-[10px] font-medium text-charcoal/50">patterns</span>
                          </motion.div>
                        )}
                        {triggerCount > 0 && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-glass border border-white/40"
                          >
                            <Flame className="w-3.5 h-3.5 text-burnt" />
                            <span className="text-sm font-bold text-charcoal">{triggerCount}</span>
                            <span className="text-[10px] font-medium text-charcoal/50">triggers</span>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
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

            {/* 0. YOUR DAILY GUT CHECK - AI-powered personalized insights */}
            <StaggerItem>
              <BloatInsightsCard entries={entries} />
            </StaggerItem>

            {/* 1. TOP SUSPECT FOODS - Likely triggers */}
            {advancedInsights && advancedInsights.triggerConfidence.length > 0 && (
              <StaggerItem>
                <SpotifyWrappedTriggers triggerConfidence={advancedInsights.triggerConfidence} />
              </StaggerItem>
            )}

            {/* 2. PEAK SYMPTOM TIMES - Timing insights */}
            <StaggerItem>
              <TimeOfDayPatterns entries={entries} />
            </StaggerItem>

            {/* 2.5. SAFE FOR YOU - Foods that don't cause issues */}
            <StaggerItem>
              <SafeFoodsCard entries={entries} />
            </StaggerItem>

            {/* 3. YOUR BLOAT RHYTHM - Pattern awareness */}
            <StaggerItem>
              <BloatHeatmap entries={entries} />
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
