import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MealEntry } from '@/types';
import { Clock } from 'lucide-react';

interface TimeOfDayPatternsProps {
  entries: MealEntry[];
}

interface TimePeriod {
  label: string;
  emoji: string;
  range: string;
  startHour: number;
  endHour: number;
  gradient: string;
  bgGradient: string;
  textColor: string;
}

const TIME_PERIODS: TimePeriod[] = [
  {
    label: 'Morning',
    emoji: '\u{1F305}',
    range: '6-11am',
    startHour: 6,
    endHour: 11,
    gradient: 'from-amber-300/80 to-orange-400/80',
    bgGradient: 'from-amber-50 to-orange-50',
    textColor: 'text-amber-700',
  },
  {
    label: 'Afternoon',
    emoji: '\u{2600}\u{FE0F}',
    range: '12-5pm',
    startHour: 12,
    endHour: 17,
    gradient: 'from-rose-300/80 to-pink-400/80',
    bgGradient: 'from-rose-50 to-pink-50',
    textColor: 'text-rose-700',
  },
  {
    label: 'Evening',
    emoji: '\u{1F306}',
    range: '6-9pm',
    startHour: 18,
    endHour: 21,
    gradient: 'from-violet-300/80 to-purple-400/80',
    bgGradient: 'from-violet-50 to-purple-50',
    textColor: 'text-violet-700',
  },
  {
    label: 'Night',
    emoji: '\u{1F319}',
    range: '10pm+',
    startHour: 22,
    endHour: 5,
    gradient: 'from-indigo-300/80 to-blue-400/80',
    bgGradient: 'from-indigo-50 to-blue-50',
    textColor: 'text-indigo-700',
  },
];

function getTimePeriodIndex(hour: number): number {
  if (hour >= 6 && hour <= 11) return 0;
  if (hour >= 12 && hour <= 17) return 1;
  if (hour >= 18 && hour <= 21) return 2;
  return 3; // 22-5
}

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
    const maxCount = Math.max(...counts, 1);

    return TIME_PERIODS.map((period, i) => ({
      ...period,
      count: counts[i],
      percentage: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
      avgBloating:
        counts[i] > 0
          ? Math.round((bloatingTotals[i] / counts[i]) * 10) / 10
          : 0,
      fillWidth: Math.round((counts[i] / maxCount) * 100),
    }));
  }, [entries]);

  const totalMeals = periodData.reduce((sum, p) => sum + p.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-violet-500/10"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-indigo-50/90" />

      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-violet-400/20 to-purple-400/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-indigo-400/15 to-violet-300/10 rounded-full blur-3xl"
      />

      {/* Glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem]">
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
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-violet-500/20"
            >
              <Clock
                className="w-6 h-6 text-violet-600"
                strokeWidth={2.5}
              />
            </motion.div>
            <div>
              <h3
                className="font-black text-foreground text-xl tracking-tight"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
              >
                Time of Day Patterns
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                When bloating typically occurs
              </p>
            </div>
          </motion.div>

          {/* Time period bars */}
          <div className="space-y-3">
            {periodData.map((period, index) => (
              <motion.div
                key={period.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.3 + index * 0.3,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${period.bgGradient} border border-white/80 p-4 cursor-default`}
                >
                  <div className="flex items-center gap-3">
                    {/* Emoji + label */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.5 + index * 0.3,
                        duration: 0.4,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-lg shadow-sm flex-shrink-0"
                    >
                      {period.emoji}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-sm font-bold ${period.textColor}`}>
                            {period.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {period.range}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.3 }}
                            className={`text-base font-black ${period.textColor}`}
                          >
                            {period.count}
                          </motion.span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {period.count === 1 ? 'meal' : 'meals'}
                          </span>
                          {period.avgBloating > 0 && (
                            <span className="text-[10px] text-muted-foreground font-medium ml-1">
                              ({period.avgBloating}/5)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="relative w-full h-2 rounded-full bg-white/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${period.fillWidth}%`,
                          }}
                          transition={{
                            delay: 0.5 + index * 0.3,
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className={`h-full rounded-full bg-gradient-to-r ${period.gradient}`}
                        />
                      </div>
                    </div>

                    {/* Percentage badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.8 + index * 0.3,
                        duration: 0.3,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      className={`px-2.5 py-1 rounded-full bg-white/80 border border-white shadow-sm flex-shrink-0`}
                    >
                      <span className={`text-xs font-bold ${period.textColor}`}>
                        {period.percentage}%
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Footer summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="flex items-center justify-center gap-2 text-xs pt-4 mt-4 border-t border-white/50"
          >
            <span className="text-muted-foreground font-semibold">
              {totalMeals} {totalMeals === 1 ? 'meal' : 'meals'} analyzed
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
