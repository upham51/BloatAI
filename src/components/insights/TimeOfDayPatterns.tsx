import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MealEntry } from '@/types';

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
      className="glass-card overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
        {/* Header */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: easing }}
        >
          <h2 className="font-display text-lg sm:text-xl font-bold text-charcoal tracking-tight">
            Peak Symptom Times
          </h2>
          <p className="text-xs text-charcoal/45 font-medium italic mt-1">
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
                style={{ borderColor: 'rgba(212, 222, 212, 0.45)' }}
              />
            </motion.div>
          ))}

          {/* Baseline */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 border-t pointer-events-none"
            style={{ borderColor: 'rgba(212, 222, 212, 0.5)' }}
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
                  ? 0.4 + (period.percentage / maxPercentage) * 0.6
                  : 0.08;

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
                        ? 'linear-gradient(to top, #1A4D2E, #2A5E3E)'
                        : 'linear-gradient(to top, #1A4D2E, #3A7D5A)',
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
                          className="text-sm sm:text-base font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
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
                animate={{ opacity: isDominant ? 0.9 : 0.55 }}
                transition={{ duration: 1.5, delay: 0.5, ease: easing }}
              >
                <span
                  className={`text-[11px] ${isDominant ? 'font-semibold' : 'font-medium'}`}
                  style={{ color: isDominant ? '#1A4D2E' : '#8A948A' }}
                >
                  {period.label}
                </span>
                {isDominant && (
                  <motion.div
                    className="mx-auto mt-1 rounded-full"
                    style={{
                      background: '#1A4D2E',
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
    </motion.div>
  );
}
