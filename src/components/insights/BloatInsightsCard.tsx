import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { MealEntry } from '@/types';
import { analyzeTriggerConfidence } from '@/lib/insightsAnalysis';
import { isHighBloating, isLowBloating } from '@/lib/bloatingUtils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BloatInsightsCardProps {
  entries: MealEntry[];
}

interface InsightResult {
  insight_text: string;
  action_items: string[];
  confidence_level: string;
  triggers_mentioned: string[];
  generated_at: string;
}

const CACHE_KEY = 'bloatai_daily_insight';

function getCachedInsight(): InsightResult | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as InsightResult;
    // Check if generated today
    const today = format(new Date(), 'yyyy-MM-dd');
    const generatedDate = parsed.generated_at?.split('T')[0];
    if (generatedDate === today) return parsed;
    return null;
  } catch {
    return null;
  }
}

function cacheInsight(insight: InsightResult) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(insight));
  } catch {
    // localStorage full or unavailable
  }
}

function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function prepareInsightsPayload(entries: MealEntry[]) {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');

  // Calculate days tracked
  const dates = completedEntries.map(e => new Date(e.created_at).getTime());
  const firstEntry = dates.length > 0 ? Math.min(...dates) : Date.now();
  const daysTracked = Math.max(1, Math.ceil((Date.now() - firstEntry) / (1000 * 60 * 60 * 24)));

  // Recent entries (last 14 days)
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recentEntries = completedEntries.filter(e => new Date(e.created_at).getTime() > twoWeeksAgo);

  // Compact food entries
  const foodEntries = recentEntries.slice(0, 20).map(entry => ({
    food: entry.custom_title || entry.meal_title || (entry.meal_description?.substring(0, 80) ?? ''),
    trigger_categories: (entry.detected_triggers || []).map(t => t.category),
    timestamp: entry.created_at,
    bloat_rating: entry.bloating_rating,
    notes: entry.notes || undefined,
    eating_speed: entry.eating_speed || undefined,
  }));

  // Trigger confidence analysis
  const triggerConfidence = analyzeTriggerConfidence(entries);
  const identifiedTriggers = triggerConfidence
    .filter(t => t.confidence !== 'needsData' && t.occurrences >= 2)
    .slice(0, 6)
    .map(t => ({
      category: t.category,
      confidence: t.confidencePercentage / 100,
      average_bloat_rating: t.avgBloatingWith,
      occurrences: t.occurrences,
      common_foods: t.topFoods,
    }));

  // Time pattern analysis
  const highBloatEntries = recentEntries.filter(e => isHighBloating(e.bloating_rating));
  const distribution: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  highBloatEntries.forEach(e => {
    const time = getTimeOfDay(new Date(e.created_at));
    distribution[time]++;
  });
  const worstTime = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

  // Overall stats
  const bloatScores = completedEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null && r !== undefined);
  const avgBloating = bloatScores.length > 0
    ? Math.round((bloatScores.reduce((a, b) => a + b, 0) / bloatScores.length) * 10) / 10
    : 0;

  return {
    days_tracked: daysTracked,
    total_logs: completedEntries.length,
    food_entries: foodEntries,
    identified_triggers: identifiedTriggers,
    time_patterns: {
      worst_time: worstTime,
      distribution,
    },
    avg_bloating: avgBloating,
    high_bloating_count: completedEntries.filter(e => isHighBloating(e.bloating_rating)).length,
    low_bloating_count: completedEntries.filter(e => isLowBloating(e.bloating_rating)).length,
  };
}

export function BloatInsightsCard({ entries }: BloatInsightsCardProps) {
  const [insight, setInsight] = useState<InsightResult | null>(() => getCachedInsight());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = useMemo(
    () => entries.filter(e => e.rating_status === 'completed').length,
    [entries]
  );

  const hasGeneratedToday = insight !== null;

  const generateInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mealData = prepareInsightsPayload(entries);

      const { data, error: fnError } = await supabase.functions.invoke('generate-insights', {
        body: { mealData },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const result: InsightResult = {
        insight_text: data.insight_text || '',
        action_items: data.action_items || [],
        confidence_level: data.confidence_level || 'low',
        triggers_mentioned: data.triggers_mentioned || [],
        generated_at: new Date().toISOString(),
      };

      setInsight(result);
      cacheInsight(result);
    } catch (err) {
      console.error('Failed to generate insights:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [entries]);

  // Format insight text into paragraphs
  const insightParagraphs = useMemo(() => {
    if (!insight?.insight_text) return [];
    return insight.insight_text
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, [insight]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-xl"
    >
      <div className="relative bg-white border border-border/40 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-5"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest/15 to-forest-light/15 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-forest/10"
            >
              <Sparkles className="w-6 h-6 text-forest" strokeWidth={2.5} />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-foreground tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                Your Daily Gut Check
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                AI-powered insights from your data
              </p>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="py-10 flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-8 h-8 text-forest" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-bold text-charcoal">Analyzing your patterns...</p>
                  <p className="text-xs text-muted-foreground mt-1">Crunching {completedCount} meals</p>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="rounded-2xl bg-rose-50/80 border border-rose-200/50 p-4">
                  <p className="text-sm text-rose-800 font-medium">{error}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateInsights}
                  className="w-full py-3.5 rounded-2xl bg-white border border-border/60 text-charcoal font-bold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}

            {/* Generated Insight */}
            {!isLoading && !error && insight && (
              <motion.div
                key="insight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Insight Text */}
                <div className="space-y-3">
                  {insightParagraphs.map((paragraph, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.08, duration: 0.4 }}
                      className="text-sm text-charcoal/80 leading-relaxed font-medium"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Action Items */}
                {insight.action_items.length > 0 && (
                  <>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2 text-xs font-bold text-forest hover:text-forest-light transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Your action plan
                    </motion.button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-2xl bg-forest/5 border border-forest/10 p-4 space-y-3">
                            {insight.action_items.map((item, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + idx * 0.08 }}
                                className="flex items-start gap-3"
                              >
                                <div className="w-5 h-5 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check size={10} className="text-forest" />
                                </div>
                                <p className="text-xs text-charcoal/70 font-semibold leading-relaxed">{item}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* Generated timestamp */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] text-muted-foreground/60 font-semibold text-center pt-1"
                >
                  Generated {format(new Date(insight.generated_at), 'MMM d, yyyy')}
                </motion.p>
              </motion.div>
            )}

            {/* Idle State - Ready to Generate */}
            {!isLoading && !error && !insight && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-sm text-charcoal/60 font-medium leading-relaxed">
                  Get personalized insights about your bloating patterns, trigger analysis, and actionable tips based on your {completedCount} logged meals.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateInsights}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-forest to-forest-light text-white font-bold text-sm shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 transition-all duration-300"
                >
                  Generate Today's Insights
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disabled state - already generated today */}
          {hasGeneratedToday && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-3"
            >
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sage/30">
                <Sparkles size={12} className="text-forest/40" />
                <span className="text-[11px] font-semibold text-charcoal/40">
                  Come back tomorrow for fresh insights
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
