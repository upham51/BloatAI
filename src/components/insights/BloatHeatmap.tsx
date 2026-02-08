import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MealEntry } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isAfter, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BloatHeatmapProps {
  entries: MealEntry[];
}

export function BloatHeatmap({ entries }: BloatHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

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
    if (canGoBack) setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    if (canGoForward) setCurrentMonth(prev => addMonths(prev, 1));
  };

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

    return days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayData = dayAverages[dateKey];
      const avgBloating = dayData ? dayData.total / dayData.count : null;

      let status: 'none' | 'good' | 'moderate' | 'bad' = 'none';
      let bloatLevel: number | null = null;
      let label = 'No data';

      if (avgBloating !== null) {
        bloatLevel = Math.round(avgBloating * 10) / 10;
        if (avgBloating <= 2) {
          status = 'good';
          label = 'Good day';
        } else if (avgBloating < 4) {
          status = 'moderate';
          label = 'Moderate';
        } else {
          status = 'bad';
          label = 'Bad day';
        }
      }

      return { date: day, status, bloatLevel, label, count: dayData?.count || 0 };
    });
  }, [entries, currentMonth]);

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstDayOfMonth = calendarDays[0]?.date;
  const gridStartDay = firstDayOfMonth ? firstDayOfMonth.getDay() : 0;

  const statusStyles: Record<string, string> = {
    good: 'bg-emerald-400',
    moderate: 'bg-amber-400',
    bad: 'bg-rose-400',
    none: 'bg-slate-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-slate-200/60 p-5"
    >
      {/* Header — month nav inline */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goToPreviousMonth}
          disabled={!canGoBack}
          className={`p-1.5 rounded-lg transition-colors ${
            canGoBack ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-200 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.h3
            key={format(currentMonth, 'yyyy-MM')}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-semibold text-slate-800 tracking-wide"
          >
            {format(currentMonth, 'MMMM yyyy')}
          </motion.h3>
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goToNextMonth}
          disabled={!canGoForward}
          className={`p-1.5 rounded-lg transition-colors ${
            canGoForward ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-200 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: gridStartDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {calendarDays.map((day, i) => {
          const isToday = isSameDay(day.date, today);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.008, duration: 0.25 }}
              className="aspect-square flex items-center justify-center relative group"
              title={`${format(day.date, 'MMM d')}: ${day.label}${
                day.bloatLevel !== null ? ` (${day.bloatLevel}/5)` : ''
              }`}
            >
              {/* Day dot */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  statusStyles[day.status]
                } ${
                  day.status !== 'none' ? 'shadow-sm' : ''
                } ${
                  isToday ? 'ring-[1.5px] ring-slate-900 ring-offset-1' : ''
                }`}
              >
                <span
                  className={`text-[11px] font-medium leading-none ${
                    day.status !== 'none' ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {format(day.date, 'd')}
                </span>
              </div>

              {/* Hover tooltip */}
              {day.bloatLevel !== null && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 text-[10px]">
                  <span className="font-medium">{format(day.date, 'MMM d')}</span>
                  <span className="mx-1 text-slate-400">·</span>
                  <span>{day.bloatLevel}/5</span>
                  <span className="mx-1 text-slate-400">·</span>
                  <span>{day.count} meal{day.count !== 1 ? 's' : ''}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-slate-400 font-medium">Good</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-[10px] text-slate-400 font-medium">So-so</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="text-[10px] text-slate-400 font-medium">Rough</span>
        </div>
      </div>
    </motion.div>
  );
}
