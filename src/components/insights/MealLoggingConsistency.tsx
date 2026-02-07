import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MealEntry } from '@/types';
import { format, subDays, startOfDay, differenceInCalendarDays, parseISO } from 'date-fns';
import { Activity, Flame } from 'lucide-react';

interface MealLoggingConsistencyProps {
  entries: MealEntry[];
}

// Color intensity levels using primary green (#2c5f5d / forest)
const INTENSITY_COLORS = [
  { bg: 'bg-[#f0f0eb]', label: 'No logs' },
  { bg: 'bg-[#c8d9d8]', label: '1 log' },
  { bg: 'bg-[#81a6a4]', label: '2 logs' },
  { bg: 'bg-[#2c5f5d]', label: '3+ logs' },
];

function getIntensityIndex(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

export function MealLoggingConsistency({ entries }: MealLoggingConsistencyProps) {
  const { grid, stats, weekLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const daysToShow = 30;

    // Build a map of date -> count
    const dateCountMap: Record<string, number> = {};
    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
      dateCountMap[dateKey] = (dateCountMap[dateKey] || 0) + 1;
    });

    // Generate grid data for last 30 days
    const gridData: Array<{
      date: Date;
      dateKey: string;
      count: number;
      intensity: number;
      dayLabel: string;
    }> = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const count = dateCountMap[dateKey] || 0;

      gridData.push({
        date,
        dateKey,
        count,
        intensity: getIntensityIndex(count),
        dayLabel: format(date, 'MMM d'),
      });
    }

    // Calculate stats
    const trackedDays = gridData.filter((d) => d.count > 0).length;

    // Calculate streak (consecutive days from today backwards)
    let streak = 0;
    for (let i = gridData.length - 1; i >= 0; i--) {
      if (gridData[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }

    // Build week labels (show month names at week boundaries)
    const labels: Array<{ text: string; col: number }> = [];
    let lastMonth = '';
    gridData.forEach((day, index) => {
      const month = format(day.date, 'MMM');
      if (month !== lastMonth) {
        labels.push({ text: month, col: index });
        lastMonth = month;
      }
    });

    return {
      grid: gridData,
      stats: { trackedDays, streak, totalDays: daysToShow },
      weekLabels: labels,
    };
  }, [entries]);

  // Organize grid into rows of 7 (weeks)
  const rows: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    rows.push(grid.slice(i, i + 7));
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-forest/10"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/90" />

      {/* Animated orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 20, 0],
          y: [0, -12, 0],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-400/20 to-teal-400/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -18, 0],
          y: [0, 12, 0],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-tr from-green-400/15 to-emerald-300/10 rounded-full blur-3xl"
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
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <Activity
                className="w-6 h-6 text-emerald-600"
                strokeWidth={2.5}
              />
            </motion.div>
            <div>
              <h3
                className="font-black text-foreground text-xl tracking-tight"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
              >
                Logging Consistency
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Last 30 days of activity
              </p>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-3 rounded-2xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-sm"
            >
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                  className="text-2xl font-black text-foreground"
                >
                  {stats.trackedDays}
                </motion.span>
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold">
                Days tracked
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-3 rounded-2xl bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 shadow-sm"
            >
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.9 }}
                  className="text-2xl font-black text-foreground"
                >
                  {stats.streak}
                </motion.span>
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold">
                Day streak
              </div>
            </motion.div>
          </motion.div>

          {/* Month labels */}
          <div className="mb-2 pl-1">
            <div className="flex">
              {weekLabels.map((label, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.6 + i * 0.1 }}
                  className="text-[10px] font-bold text-muted-foreground/70"
                  style={{
                    position: 'relative',
                    left: `${(label.col / grid.length) * 100}%`,
                    marginRight: '8px',
                  }}
                >
                  {label.text}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1.5">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5">
                {row.map((day, colIndex) => {
                  const globalIndex = rowIndex * 7 + colIndex;
                  const color = INTENSITY_COLORS[day.intensity];
                  return (
                    <motion.div
                      key={day.dateKey}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 2.5 + rowIndex * 0.12 + colIndex * 0.05,
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ scale: 1.3, y: -2 }}
                      className={`flex-1 aspect-square rounded-[5px] ${color.bg} cursor-pointer relative group shadow-sm transition-shadow hover:shadow-md ${
                        day.intensity === 3
                          ? 'text-white'
                          : day.intensity === 2
                          ? 'text-white'
                          : ''
                      }`}
                      title={`${day.dayLabel}: ${day.count} ${
                        day.count === 1 ? 'meal' : 'meals'
                      }`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-white/80 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <p className="text-[10px] font-bold text-foreground">
                          {day.dayLabel}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {day.count} {day.count === 1 ? 'meal' : 'meals'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {/* Fill remaining cells in last row with invisible spacers */}
                {row.length < 7 &&
                  Array.from({ length: 7 - row.length }).map((_, i) => (
                    <div key={`spacer-${i}`} className="flex-1 aspect-square" />
                  ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="flex items-center justify-center gap-4 text-[10px] pt-4 mt-4 border-t border-white/50"
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded ${INTENSITY_COLORS[0].bg}`} />
              <span className="text-muted-foreground font-semibold">None</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded ${INTENSITY_COLORS[1].bg}`} />
              <span className="text-muted-foreground font-semibold">1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded ${INTENSITY_COLORS[2].bg}`} />
              <span className="text-muted-foreground font-semibold">2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded ${INTENSITY_COLORS[3].bg}`} />
              <span className="text-muted-foreground font-semibold">3+</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
