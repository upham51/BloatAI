import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealEntry } from '@/types';
import { getPeakTimesBackground, fetchPeakTimesBackground, PexelsPhoto } from '@/lib/pexels';

interface TimeOfDayPatternsProps {
  entries: MealEntry[];
}

interface TimePeriod {
  label: string;
  range: string;
  startHour: number;
  endHour: number;
}

const TIME_PERIODS: TimePeriod[] = [
  { label: 'Morning', range: '6–11am', startHour: 6, endHour: 11 },
  { label: 'Afternoon', range: '12–5pm', startHour: 12, endHour: 17 },
  { label: 'Evening', range: '6–9pm', startHour: 18, endHour: 21 },
  { label: 'Night', range: '10pm+', startHour: 22, endHour: 5 },
];


function getTimePeriodIndex(hour: number): number {
  if (hour >= 6 && hour <= 11) return 0;
  if (hour >= 12 && hour <= 17) return 1;
  if (hour >= 18 && hour <= 21) return 2;
  return 3;
}

const CHART_HEIGHT = 150;
const MAX_BAR_PCT = 78;
const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PERIOD_KEYS: ('morning' | 'afternoon' | 'evening' | 'night')[] = [
  'morning', 'afternoon', 'evening', 'night',
];

export function TimeOfDayPatterns({ entries }: TimeOfDayPatternsProps) {
  const periodData = useMemo(() => {
    const completedEntries = entries.filter(
      (e) => e.rating_status === 'completed' && e.bloating_rating
    );

    const counts = [0, 0, 0, 0];
    const bloatingTotals = [0, 0, 0, 0];

    completedEntries.forEach((entry) => {
      const hour = new Date(entry.created_at).getHours();
      const idx = getTimePeriodIndex(hour);
      counts[idx]++;
      bloatingTotals[idx] += entry.bloating_rating!;
    });

    const total = counts.reduce((a, b) => a + b, 0);

    return TIME_PERIODS.map((period, i) => ({
      ...period,
      count: counts[i],
      percentage: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
      avgBloating:
        counts[i] > 0
          ? Math.round((bloatingTotals[i] / counts[i]) * 10) / 10
          : 0,
    }));
  }, [entries]);

  const totalMeals = periodData.reduce((sum, p) => sum + p.count, 0);
  const maxPercentage = Math.max(...periodData.map((p) => p.percentage), 1);
  const dominantIndex = periodData.reduce(
    (maxIdx, p, i, arr) => (p.percentage > arr[maxIdx].percentage ? i : maxIdx),
    0
  );

  const dominantPeriodKey = PERIOD_KEYS[dominantIndex];
  const [bgPhoto, setBgPhoto] = useState<PexelsPhoto>(() =>
    getPeakTimesBackground(dominantPeriodKey)
  );

  useEffect(() => {
    if (!totalMeals) return;
    // Set sync fallback immediately for the new dominant period
    setBgPhoto(getPeakTimesBackground(dominantPeriodKey));
    // Then upgrade with a random photo from the Pexels collection
    let cancelled = false;
    fetchPeakTimesBackground(dominantPeriodKey).then((photo) => {
      if (!cancelled) setBgPhoto(photo);
    });
    return () => { cancelled = true; };
  }, [dominantPeriodKey, totalMeals]);

  if (!totalMeals) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 text-center py-8">
          <h3 className="font-display text-xl font-bold text-charcoal mb-2">
            Peak Symptom Times
          </h3>
          <p className="text-sm text-charcoal/60 font-medium">
            Log meals to see timing patterns
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: easing }}
      className="glass-card overflow-hidden relative"
    >
      {/* Pexels collection background – keyed to dominant time period */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgPhoto.src}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgPhoto.src})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: easing }}
        />
      </AnimatePresence>

      {/* Dark overlay so chart elements remain legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/60 to-charcoal/75" />

      {/* Content sits above background */}
      <div className="relative z-10 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
        {/* Header */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: easing }}
        >
          <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            Peak Symptom Times
          </h2>
          <p className="text-xs text-white/60 font-medium italic mt-1">
            When you report the most issues
          </p>
        </motion.div>

        {/* Chart area */}
        <div className="relative" style={{ height: CHART_HEIGHT }}>
          {/* Guide lines */}
          {[0.5, 1.0].map((pct) => (
            <motion.div
              key={pct}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ bottom: `${pct * MAX_BAR_PCT}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, ease: easing }}
            >
              <div
                className="border-t border-dashed"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              />
            </motion.div>
          ))}

          {/* Baseline */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 border-t pointer-events-none"
            style={{ borderColor: 'rgba(255, 255, 255, 0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: easing }}
          />

          {/* Bars */}
          <div className="flex items-end h-full gap-3 sm:gap-5">
            {periodData.map((period, i) => {
              const heightPct =
                maxPercentage > 0
                  ? (period.percentage / maxPercentage) * MAX_BAR_PCT
                  : 0;
              const isDominant = i === dominantIndex;

              // Stagger across 5 seconds total
              const delay = 0.3 + (i / 3) * 1.6;
              const duration = 2.0;

              const barOpacity =
                period.percentage > 0
                  ? 0.5 + (period.percentage / maxPercentage) * 0.5
                  : 0.1;

              return (
                <div
                  key={period.label}
                  className="flex-1 h-full relative"
                >
                  {/* The bar with percentage inside */}
                  <motion.div
                    className="absolute bottom-0 left-1 right-1 sm:left-1.5 sm:right-1.5 rounded-t-lg overflow-hidden"
                    style={{
                      background: isDominant
                        ? 'linear-gradient(to top, rgba(255,255,255,0.85), rgba(255,255,255,0.55))'
                        : 'linear-gradient(to top, rgba(255,255,255,0.55), rgba(255,255,255,0.3))',
                    }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: `${Math.max(heightPct, period.percentage > 0 ? 5 : 1.5)}%`,
                      opacity: barOpacity,
                    }}
                    transition={{
                      height: {
                        duration,
                        delay,
                        ease: easing,
                      },
                      opacity: {
                        duration,
                        delay,
                        ease: easing,
                      },
                    }}
                  >
                    {/* Percentage inside the bar */}
                    {period.percentage > 0 && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          delay: delay + duration * 0.8,
                          ease: easing,
                        }}
                      >
                        <span
                          className="text-sm sm:text-base font-bold text-charcoal drop-shadow-[0_0px_4px_rgba(255,255,255,0.6)]"
                          style={{ textShadow: '0 0 6px rgba(255,255,255,0.5)' }}
                        >
                          {period.percentage}%
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Period labels */}
        <div className="flex gap-3 sm:gap-5 mt-2">
          {periodData.map((period, i) => {
            const isDominant = i === dominantIndex;
            return (
              <motion.div
                key={period.label}
                className="flex-1 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: isDominant ? 1 : 0.6 }}
                transition={{ duration: 1.5, delay: 0.5, ease: easing }}
              >
                <span
                  className={`text-[11px] ${isDominant ? 'font-semibold' : 'font-medium'}`}
                  style={{ color: isDominant ? '#FFFFFF' : 'rgba(255,255,255,0.65)' }}
                >
                  {period.label}
                </span>
                {isDominant && (
                  <motion.div
                    className="mx-auto mt-1 rounded-full"
                    style={{
                      background: '#FFFFFF',
                      height: 3,
                      width: '60%',
                      maxWidth: 48,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 3.5, ease: easing }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Photographer attribution */}
      {bgPhoto.photographer && (
        <div className="absolute bottom-1 right-2 z-10">
          <span className="text-[8px] text-white/30">
            Photo: {bgPhoto.photographer} / Pexels
          </span>
        </div>
      )}
    </motion.div>
  );
}
