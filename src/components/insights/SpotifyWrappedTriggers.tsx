import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TriggerConfidenceLevel } from '@/lib/insightsAnalysis';
import { getTriggerCategory } from '@/types';
import { getFoodImage } from '@/lib/pexelsApi';
import { ChevronDown, ChevronUp, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

interface SpotifyWrappedTriggersProps {
  triggerConfidence: TriggerConfidenceLevel[];
}

interface TriggerCardData {
  category: string;
  displayName: string;
  impactScore: number;
  enhancedImpactScore: number;
  occurrences: number;
  avgBloatingWith: number;
  percentage: number;
  topFoods: string[];
  imageUrl: string | null;
  consistencyFactor: number;
  frequencyWeight: number;
  recencyBoost: number;
  personalBaselineAdjustment: number;
  recentOccurrences: number;
}

function getSeverityLabel(impactScore: number): string {
  if (impactScore >= 2.0) return 'Severe Trigger';
  if (impactScore >= 1.0) return 'Strong Trigger';
  if (impactScore >= 0.5) return 'Moderate Trigger';
  return 'Mild Trigger';
}

function getGradientColors(impactScore: number): { from: string; to: string; glow: string } {
  if (impactScore >= 2.0) return { from: 'from-rose-500', to: 'to-red-600', glow: 'shadow-rose-500/30' };
  if (impactScore >= 1.0) return { from: 'from-orange-500', to: 'to-amber-600', glow: 'shadow-orange-500/30' };
  if (impactScore >= 0.5) return { from: 'from-amber-400', to: 'to-yellow-500', glow: 'shadow-amber-500/30' };
  return { from: 'from-emerald-400', to: 'to-teal-500', glow: 'shadow-emerald-500/30' };
}

function getSeverityColor(impactScore: number): string {
  if (impactScore >= 2.0) return 'bg-gradient-to-r from-rose-500 to-red-600';
  if (impactScore >= 1.0) return 'bg-gradient-to-r from-orange-500 to-amber-600';
  if (impactScore >= 0.5) return 'bg-gradient-to-r from-amber-400 to-yellow-500';
  return 'bg-gradient-to-r from-emerald-400 to-teal-500';
}

function getSeverityBadgeColor(impactScore: number): string {
  if (impactScore >= 2.0) return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30';
  if (impactScore >= 1.0) return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
  if (impactScore >= 0.5) return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
  return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
}

export function SpotifyWrappedTriggers({ triggerConfidence }: SpotifyWrappedTriggersProps) {
  const [topTriggers, setTopTriggers] = useState<TriggerCardData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    async function loadTriggerData() {
      // Get top 5 triggers sorted by enhanced impact score
      const sorted = [...triggerConfidence]
        .sort((a, b) => (b.enhancedImpactScore || b.impactScore) - (a.enhancedImpactScore || a.impactScore))
        .slice(0, 5);

      // Load images for each trigger
      const triggersWithImages = await Promise.all(
        sorted.map(async (trigger) => {
          const categoryInfo = getTriggerCategory(trigger.category);
          const topFood = trigger.topFoods[0] || categoryInfo?.displayName || trigger.category;

          // Fetch image from Pexels
          const imageData = await getFoodImage(topFood, trigger.category).catch(() => null);

          return {
            category: trigger.category,
            displayName: categoryInfo?.displayName || trigger.category,
            impactScore: trigger.impactScore,
            enhancedImpactScore: trigger.enhancedImpactScore || trigger.impactScore,
            occurrences: trigger.occurrences,
            avgBloatingWith: trigger.avgBloatingWith,
            percentage: trigger.percentage,
            topFoods: trigger.topFoods,
            imageUrl: imageData?.url || null,
            consistencyFactor: trigger.consistencyFactor || 0,
            frequencyWeight: trigger.frequencyWeight || 0,
            recencyBoost: trigger.recencyBoost || 0,
            personalBaselineAdjustment: trigger.personalBaselineAdjustment || 0,
            recentOccurrences: trigger.recentOccurrences || 0,
          } as TriggerCardData;
        })
      );

      setTopTriggers(triggersWithImages);
      setImagesLoading(false);
    }

    loadTriggerData();
  }, [triggerConfidence]);

  if (imagesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] shadow-2xl"
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-orange-100/70 to-amber-100/80" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-rose-400/20 to-orange-400/15 rounded-full blur-3xl"
        />

        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/80 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Your Top Bloat Triggers
            </h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="h-24 bg-gradient-to-r from-gray-200/50 to-gray-100/50 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (topTriggers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-orange-100/70 to-amber-100/80" />

        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/80 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Your Top Bloat Triggers
            </h2>
          </div>
          <p className="text-muted-foreground font-medium">
            Keep logging meals to identify your triggers!
          </p>
        </div>
      </motion.div>
    );
  }

  const topTrigger = topTriggers[0];
  const gradientColors = getGradientColors(topTrigger.impactScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-rose-500/10"
    >
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-orange-100/70 to-amber-100/80" />

      {/* Animated gradient orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-rose-400/25 to-orange-400/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-amber-400/20 to-yellow-300/15 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-gradient-to-br from-orange-300/15 to-rose-300/10 rounded-full blur-2xl"
      />

      {/* Premium glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-rose-500/20"
            >
              <AlertTriangle className="w-6 h-6 text-rose-600" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                Your Top Bloat Triggers
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Based on your meal history
              </p>
            </div>
          </motion.div>

          {/* Hero Card - #1 Trigger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-[1.5rem] h-56 cursor-pointer group shadow-xl ${gradientColors.glow}`}
            >
              {/* Background Image with Overlay */}
              {topTrigger.imageUrl && (
                <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${topTrigger.imageUrl})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.to} opacity-50`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
              )}

              {/* Fallback gradient if no image */}
              {!topTrigger.imageUrl && (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors.from} ${gradientColors.to}`} />
              )}

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6 text-white">
                {/* Top Section - Severity Badge */}
                <div className="flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className={`px-4 py-2 rounded-full backdrop-blur-md bg-white/20 border border-white/30 shadow-lg`}
                  >
                    <span className="text-sm font-bold text-white drop-shadow-md">
                      #1 Trigger
                    </span>
                  </motion.div>

                  {/* Severity indicator bar */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <motion.div
                        key={level}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + level * 0.1, duration: 0.3 }}
                        className={`w-2 rounded-full ${
                          topTrigger.impactScore >= level * 0.5
                            ? 'bg-white shadow-lg'
                            : 'bg-white/30'
                        }`}
                        style={{ height: `${8 + level * 4}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Section */}
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-3xl font-black mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [text-shadow:_0_2px_12px_rgb(0_0_0_/_80%)]"
                  >
                    {topTrigger.displayName}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center gap-3 text-sm flex-wrap"
                  >
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                      <span className="font-bold drop-shadow-md">
                        {getSeverityLabel(topTrigger.impactScore)} • {topTrigger.occurrences} times
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Expand Button for #1 */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExpandedIndex(expandedIndex === 0 ? null : 0)}
              className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground font-semibold hover:text-foreground transition-all py-3 rounded-xl hover:bg-white/50"
            >
              {expandedIndex === 0 ? (
                <>
                  <ChevronUp size={18} />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown size={18} />
                  Why is this #1?
                </>
              )}
            </motion.button>

            {/* Expanded Details for #1 */}
            <AnimatePresence>
              {expandedIndex === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 bg-white/60 backdrop-blur-xl rounded-2xl p-5 space-y-4 border-2 border-white/80 shadow-lg">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                        <Zap size={16} className="text-orange-600" />
                      </div>
                      Why is {topTrigger.displayName} ranked #1?
                    </h4>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(topTrigger.impactScore)}`} />
                        <div>
                          <span className="font-semibold text-foreground">Eaten in {topTrigger.occurrences} meals</span>
                          {topTrigger.percentage > 0 && ` (${topTrigger.percentage}% of your meals)`}
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(topTrigger.impactScore)}`} />
                        <div>
                          <span className="font-semibold text-foreground">Average bloating: {topTrigger.avgBloatingWith}/5</span>
                          <span className="text-xs ml-1">
                            ({topTrigger.personalBaselineAdjustment >= 0 ? '+' : ''}
                            {topTrigger.personalBaselineAdjustment.toFixed(1)} above your baseline)
                          </span>
                        </div>
                      </div>

                      {topTrigger.consistencyFactor > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(topTrigger.impactScore)}`} />
                          <div>
                            <span className="font-semibold text-foreground">
                              Consistency: {Math.round(topTrigger.consistencyFactor * 100)}%
                            </span>
                            <span className="text-xs ml-1">
                              ({topTrigger.consistencyFactor >= 0.8 ? 'Very reliable trigger' : 'Sometimes causes bloating'})
                            </span>
                          </div>
                        </div>
                      )}

                      {topTrigger.recentOccurrences > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(topTrigger.impactScore)}`} />
                          <div>
                            <span className="font-semibold text-foreground">Recent trend:</span>{' '}
                            {topTrigger.recentOccurrences} times in the last 7 days
                            {topTrigger.recencyBoost > 1.0 && (
                              <span className="text-xs ml-1 text-rose-600 font-semibold">(Getting worse)</span>
                            )}
                          </div>
                        </div>
                      )}

                      {topTrigger.topFoods.length > 0 && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getSeverityColor(topTrigger.impactScore)}`} />
                          <div>
                            <span className="font-semibold text-foreground">Common foods:</span>{' '}
                            {topTrigger.topFoods.slice(0, 3).join(', ')}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-white/50">
                        <div className="text-xs text-muted-foreground font-medium">
                          Impact Score: <span className="font-bold text-foreground">{topTrigger.enhancedImpactScore.toFixed(2)}</span>
                          <span className="ml-2">
                            (Weighted by consistency, frequency, and recency)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Other Top Triggers - Compact Cards */}
          {topTriggers.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="overflow-visible"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <TrendingUp size={16} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Also watch out for:
                </h3>
              </div>
              <div className="space-y-3 pb-2">
                {topTriggers.slice(1).map((trigger, idx) => {
                  const actualIndex = idx + 1;
                  const isExpanded = expandedIndex === actualIndex;
                  const colors = getGradientColors(trigger.impactScore);

                  return (
                    <motion.div
                      key={trigger.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setExpandedIndex(isExpanded ? null : actualIndex)}
                        className={`relative overflow-hidden rounded-2xl h-20 cursor-pointer group transition-all duration-300 shadow-lg ${colors.glow}`}
                      >
                        {/* Background Image */}
                        {trigger.imageUrl && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-25"
                            style={{ backgroundImage: `url(${trigger.imageUrl})` }}
                          />
                        )}

                        {/* Gradient base */}
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} opacity-10 group-hover:opacity-20 transition-opacity`} />

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-between px-5">
                          <div className="flex items-center gap-4">
                            {/* Severity indicator */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3].map((level) => (
                                <div
                                  key={level}
                                  className={`w-1.5 rounded-full transition-all ${
                                    trigger.impactScore >= level * 0.7
                                      ? `${getSeverityColor(trigger.impactScore)}`
                                      : 'bg-gray-200 dark:bg-gray-700'
                                  }`}
                                  style={{ height: `${10 + level * 4}px` }}
                                />
                              ))}
                            </div>
                            <div>
                              <div className="font-bold text-foreground">
                                {trigger.displayName}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium">
                                {getSeverityLabel(trigger.impactScore)} • {trigger.occurrences} meals
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getSeverityBadgeColor(trigger.impactScore)}`}>
                              {trigger.avgBloatingWith.toFixed(1)}/5
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={18} className="text-muted-foreground" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 bg-white/60 backdrop-blur-xl rounded-xl p-4 space-y-2 text-xs border border-white/80">
                              <div className="text-muted-foreground space-y-2">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
                                  <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(trigger.impactScore)}`} />
                                  <span>Average bloating: <span className="font-semibold text-foreground">{trigger.avgBloatingWith}/5</span></span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
                                  <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(trigger.impactScore)}`} />
                                  <span>Appears in <span className="font-semibold text-foreground">{trigger.percentage}%</span> of meals</span>
                                </div>
                                {trigger.topFoods.length > 0 && (
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50">
                                    <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(trigger.impactScore)}`} />
                                    <span>Common: <span className="font-semibold text-foreground">{trigger.topFoods.slice(0, 2).join(', ')}</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
