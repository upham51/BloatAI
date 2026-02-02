import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealEntry } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isAfter, isBefore } from 'date-fns';
import { Calendar, Smile, Frown, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

interface BloatHeatmapProps {
  entries: MealEntry[];
}

export function BloatHeatmap({ entries }: BloatHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  // Find the earliest entry date to limit navigation
  const earliestEntry = useMemo(() => {
    const completedEntries = entries.filter(e => e.rating_status === 'completed' && e.bloating_rating);
    if (completedEntries.length === 0) return today;
    return completedEntries.reduce((earliest, entry) => {
      const entryDate = new Date(entry.created_at);
      return entryDate < earliest ? entryDate : earliest;
    }, new Date());
  }, [entries]);

  const canGoBack = isAfter(startOfMonth(currentMonth), startOfMonth(earliestEntry)) ||
                    format(currentMonth, 'yyyy-MM') !== format(earliestEntry, 'yyyy-MM');
  const canGoForward = isBefore(endOfMonth(currentMonth), today);

  const goToPreviousMonth = () => {
    if (canGoBack) {
      setCurrentMonth(prev => subMonths(prev, 1));
    }
  };

  const goToNextMonth = () => {
    if (canGoForward) {
      setCurrentMonth(prev => addMonths(prev, 1));
    }
  };

  const { calendarDays, stats } = useMemo(() => {
    // Get selected month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate daily averages
    const dayAverages: Record<string, { total: number; count: number }> = {};

    entries
      .filter((e) => e.rating_status === 'completed' && e.bloating_rating)
      .forEach((entry) => {
        const dateKey = format(new Date(entry.created_at), 'yyyy-MM-dd');
        if (!dayAverages[dateKey]) {
          dayAverages[dateKey] = { total: 0, count: 0 };
        }
        dayAverages[dateKey].total += entry.bloating_rating!;
        dayAverages[dateKey].count += 1;
      });

    // Map days to bloat levels
    const calendarDays = days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayData = dayAverages[dateKey];
      const avgBloating = dayData
        ? dayData.total / dayData.count
        : null;

      let color = 'bg-muted/30'; // No data
      let label = 'No data';
      let bloatLevel: number | null = null;
      let gradient = '';

      if (avgBloating !== null) {
        bloatLevel = Math.round(avgBloating * 10) / 10;
        // Use consistent thresholds: <=2 = good, <4 = moderate, >=4 = bad
        // This matches the stats calculation and bloatingUtils.ts constants
        if (avgBloating <= 2) {
          color = 'bg-gradient-to-br from-emerald-400 to-teal-500';
          gradient = 'from-emerald-400 to-teal-500';
          label = 'Good day';
        } else if (avgBloating < 4) {
          color = 'bg-gradient-to-br from-amber-400 to-orange-500';
          gradient = 'from-amber-400 to-orange-500';
          label = 'Moderate';
        } else {
          color = 'bg-gradient-to-br from-rose-400 to-red-500';
          gradient = 'from-rose-400 to-red-500';
          label = 'Bad day';
        }
      }

      return {
        date: day,
        color,
        gradient,
        label,
        bloatLevel,
        count: dayData?.count || 0,
      };
    });

    // Calculate stats
    const goodDays = calendarDays.filter(
      (d) => d.bloatLevel !== null && d.bloatLevel <= 2
    ).length;
    const badDays = calendarDays.filter(
      (d) => d.bloatLevel !== null && d.bloatLevel >= 4
    ).length;
    const trackedDays = calendarDays.filter((d) => d.bloatLevel !== null).length;

    return {
      calendarDays,
      stats: { goodDays, badDays, trackedDays },
    };
  }, [entries, currentMonth]);

  // Get weekday headers
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate grid start position (offset for first day of month)
  const firstDayOfMonth = calendarDays[0]?.date;
  const gridStartDay = firstDayOfMonth ? firstDayOfMonth.getDay() : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-teal-500/10"
    >
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/90 via-emerald-50/80 to-cyan-50/90" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 25, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-teal-400/25 to-emerald-400/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-cyan-400/20 to-teal-300/15 rounded-full blur-3xl"
      />

      {/* Premium glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-teal-500/20"
            >
              <Calendar className="w-6 h-6 text-teal-600" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="font-black text-foreground text-xl tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                Bloat Calendar
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Daily bloating patterns
              </p>
            </div>
          </motion.div>

          {/* Month Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex items-center justify-between mb-6 px-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPreviousMonth}
              disabled={!canGoBack}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                canGoBack
                  ? 'bg-white/70 border-2 border-white/80 shadow-md hover:bg-white/90 hover:shadow-lg text-teal-600'
                  : 'bg-white/30 border border-white/40 text-muted-foreground/40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.div
                key={format(currentMonth, 'yyyy-MM')}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-2xl font-black text-foreground tracking-tight">
                  {format(currentMonth, 'MMMM')}
                </p>
                <p className="text-sm font-bold text-teal-600">
                  {format(currentMonth, 'yyyy')}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNextMonth}
              disabled={!canGoForward}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                canGoForward
                  ? 'bg-white/70 border-2 border-white/80 shadow-md hover:bg-white/90 hover:shadow-lg text-teal-600'
                  : 'bg-white/30 border border-white/40 text-muted-foreground/40 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-4 rounded-2xl bg-teal-50/80 backdrop-blur-sm border border-teal-200/50 shadow-sm"
            >
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-4 h-4 text-teal-600 mr-1.5" />
                <span className="text-2xl font-black text-foreground">
                  {stats.trackedDays}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-semibold">Days tracked</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-4 rounded-2xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-sm"
            >
              <div className="flex items-center justify-center mb-2">
                <Smile className="w-4 h-4 text-emerald-600 mr-1.5" />
                <span className="text-2xl font-black text-emerald-600">{stats.goodDays}</span>
              </div>
              <div className="text-xs text-emerald-700 font-semibold">Good days</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-4 rounded-2xl bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 shadow-sm"
            >
              <div className="flex items-center justify-center mb-2">
                <Frown className="w-4 h-4 text-rose-600 mr-1.5" />
                <span className="text-2xl font-black text-rose-600">{stats.badDays}</span>
              </div>
              <div className="text-xs text-rose-700 font-semibold">Bad days</div>
            </motion.div>
          </motion.div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-bold text-muted-foreground/70 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2 mb-5">
            {/* Empty cells for offset */}
            {Array.from({ length: gridStartDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, i) => {
              const isToday = isSameDay(day.date, new Date());
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.01, duration: 0.3 }}
                  whileHover={{ scale: 1.15, y: -2 }}
                  className={`aspect-square rounded-xl ${day.color} flex items-center justify-center text-xs font-bold transition-all cursor-pointer group relative shadow-sm ${
                    isToday ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''
                  } ${day.bloatLevel !== null ? 'shadow-md' : ''}`}
                  title={`${format(day.date, 'MMM d')}: ${day.label}${
                    day.bloatLevel !== null ? ` (${day.bloatLevel}/5)` : ''
                  }`}
                >
                  <span
                    className={`${
                      day.bloatLevel !== null
                        ? 'text-white font-bold drop-shadow-sm'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    {format(day.date, 'd')}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border-2 border-white/80 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p className="text-xs font-bold text-foreground mb-1">
                      {format(day.date, 'MMM d')}
                    </p>
                    {day.bloatLevel !== null ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Avg: <span className="font-semibold text-foreground">{day.bloatLevel}/5</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {day.count} meal{day.count !== 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No data</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 text-xs pt-4 border-t border-white/50"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm" />
              <span className="text-muted-foreground font-semibold">Minimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm" />
              <span className="text-muted-foreground font-semibold">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-rose-400 to-red-500 shadow-sm" />
              <span className="text-muted-foreground font-semibold">Significant</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
