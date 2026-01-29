import { useMemo, useState } from 'react';
import { MealEntry } from '@/types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Sparkles, Calendar, Activity, Zap, Star, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklyProgressChartProps {
  entries: MealEntry[];
}

export function WeeklyProgressChart({ entries }: WeeklyProgressChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { chartData, trend, avgBloating, goodDays, bloatedDays, bestDay, worstDay } = useMemo(() => {
    const today = startOfDay(new Date());

    // Filter entries that have bloating ratings
    const completedEntries = entries.filter(e =>
      e.bloating_rating !== null &&
      e.bloating_rating !== undefined &&
      e.bloating_rating >= 1 &&
      e.bloating_rating <= 5
    );

    // Find the earliest date with data
    const datesWithData = completedEntries.map(e => startOfDay(new Date(e.created_at)));

    if (datesWithData.length === 0) {
      return { chartData: [], trend: 'neutral' as const, avgBloating: 0, goodDays: 0, bloatedDays: 0, bestDay: null, worstDay: null };
    }

    // Always show full 7-day week (last 7 days) to ensure Sunday is included
    const daysToShow = 7;

    // Create array of days to display - always show last 7 days
    const displayDays = Array.from({ length: daysToShow }, (_, i) => {
      const date = subDays(today, daysToShow - 1 - i);
      return {
        date,
        dateStr: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        dayNum: format(date, 'd'),
        isToday: isSameDay(date, today),
      };
    });

    // First pass: collect actual data for each day
    const rawData = displayDays.map((day, index) => {
      const dayEntries = completedEntries.filter(e =>
        isSameDay(new Date(e.created_at), day.date)
      );

      // Count ALL meals for the day, not just completed ones
      const allDayEntries = entries.filter(e =>
        isSameDay(new Date(e.created_at), day.date)
      );

      const avgBloating = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / dayEntries.length
        : null;

      return {
        index,
        day: day.dateStr,
        dayShort: day.dateStr.substring(0, 3),
        fullDate: day.fullDate,
        dayNum: day.dayNum,
        isToday: day.isToday,
        bloating: avgBloating !== null ? Math.round(avgBloating * 10) / 10 : null,
        hasData: avgBloating !== null,
        count: allDayEntries.length,
      };
    });

    // Second pass: fill in gaps by carrying forward/backward
    const firstDataIndex = rawData.findIndex(d => d.hasData);
    const firstValue = firstDataIndex >= 0 ? rawData[firstDataIndex].bloating : null;

    let lastKnownBloating: number | null = firstValue;
    const data = rawData.map((day, index) => {
      if (day.hasData) {
        lastKnownBloating = day.bloating;
        return day;
      } else {
        const bloatingValue = index < firstDataIndex ? firstValue : lastKnownBloating;
        return {
          ...day,
          bloating: bloatingValue,
        };
      }
    });

    // Calculate trend (comparing first half vs second half of week)
    const validData = data.filter(d => d.bloating !== null);
    const firstHalf = validData.slice(0, Math.ceil(validData.length / 2));
    const secondHalf = validData.slice(Math.ceil(validData.length / 2));

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + (d.bloating || 0), 0) / firstHalf.length
      : 0;

    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + (d.bloating || 0), 0) / secondHalf.length
      : 0;

    const trendValue = secondHalfAvg - firstHalfAvg;
    const trendDirection: 'up' | 'down' | 'neutral' =
      trendValue > 0.3 ? 'up' :
      trendValue < -0.3 ? 'down' :
      'neutral';

    const overallAvg = validData.length > 0
      ? validData.reduce((sum, d) => sum + (d.bloating || 0), 0) / validData.length
      : 0;

    const good = data.filter(d => d.hasData && (d.bloating || 0) <= 2).length;
    const bloated = data.filter(d => d.hasData && (d.bloating || 0) >= 4).length;

    // Find best and worst days
    const daysWithActualData = data.filter(d => d.hasData);
    const best = daysWithActualData.length > 0
      ? daysWithActualData.reduce((a, b) => (a.bloating || 5) < (b.bloating || 5) ? a : b)
      : null;
    const worst = daysWithActualData.length > 0
      ? daysWithActualData.reduce((a, b) => (a.bloating || 0) > (b.bloating || 0) ? a : b)
      : null;

    return {
      chartData: data,
      trend: trendDirection,
      avgBloating: Math.round(overallAvg * 10) / 10,
      goodDays: good,
      bloatedDays: bloated,
      bestDay: best,
      worstDay: worst,
    };
  }, [entries]);

  const hasData = chartData.some(d => d.bloating !== null);

  // Get color based on bloating level - enhanced premium gradients
  const getBloatingColor = (bloating: number | null, hasData: boolean) => {
    if (!hasData || bloating === null) return {
      bg: 'bg-gradient-to-t from-slate-200/60 to-slate-100/40',
      ring: 'ring-slate-300/50',
      text: 'text-slate-400',
      glow: 'rgba(148, 163, 184, 0.3)',
      accent: '#94a3b8'
    };
    if (bloating <= 1.5) return {
      bg: 'bg-gradient-to-t from-emerald-500 via-emerald-400 to-teal-300',
      ring: 'ring-emerald-400/60',
      text: 'text-emerald-600',
      glow: 'rgba(16, 185, 129, 0.5)',
      accent: '#10b981'
    };
    if (bloating <= 2.5) return {
      bg: 'bg-gradient-to-t from-teal-500 via-cyan-400 to-sky-300',
      ring: 'ring-teal-400/60',
      text: 'text-teal-600',
      glow: 'rgba(20, 184, 166, 0.5)',
      accent: '#14b8a6'
    };
    if (bloating <= 3.5) return {
      bg: 'bg-gradient-to-t from-amber-500 via-yellow-400 to-orange-300',
      ring: 'ring-amber-400/60',
      text: 'text-amber-600',
      glow: 'rgba(245, 158, 11, 0.5)',
      accent: '#f59e0b'
    };
    if (bloating <= 4.5) return {
      bg: 'bg-gradient-to-t from-orange-500 via-orange-400 to-rose-400',
      ring: 'ring-orange-400/60',
      text: 'text-orange-600',
      glow: 'rgba(249, 115, 22, 0.5)',
      accent: '#f97316'
    };
    return {
      bg: 'bg-gradient-to-t from-rose-600 via-rose-500 to-red-400',
      ring: 'ring-rose-400/60',
      text: 'text-rose-600',
      glow: 'rgba(244, 63, 94, 0.5)',
      accent: '#f43f5e'
    };
  };

  // Get trend info with enhanced styling
  const getTrendInfo = () => {
    if (trend === 'down') return {
      icon: TrendingDown,
      label: 'Improving',
      color: 'text-emerald-600',
      bg: 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15',
      border: 'border-emerald-400/30',
      glow: '0 0 20px rgba(16, 185, 129, 0.3)'
    };
    if (trend === 'up') return {
      icon: TrendingUp,
      label: 'Increasing',
      color: 'text-rose-600',
      bg: 'bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15',
      border: 'border-rose-400/30',
      glow: '0 0 20px rgba(244, 63, 94, 0.3)'
    };
    return {
      icon: Minus,
      label: 'Steady',
      color: 'text-blue-600',
      bg: 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15',
      border: 'border-blue-400/30',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)'
    };
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  // Calculate bar heights (inverted - lower bloating = taller bar for positive visualization)
  const getBarHeight = (bloating: number | null) => {
    if (bloating === null) return 15;
    // Invert: 5 bloating = 20%, 1 bloating = 100%
    const inverted = 6 - bloating;
    return Math.max(20, (inverted / 5) * 100);
  };

  if (!hasData) {
    // Premium ghost data for empty state visualization
    const ghostData = [
      { day: 'Mon', dayShort: 'Mon', value: 2.5, index: 0 },
      { day: 'Tue', dayShort: 'Tue', value: 2.8, index: 1 },
      { day: 'Wed', dayShort: 'Wed', value: 2.2, index: 2 },
      { day: 'Thu', dayShort: 'Thu', value: 3.1, index: 3 },
      { day: 'Fri', dayShort: 'Fri', value: 2.7, index: 4 },
      { day: 'Sat', dayShort: 'Sat', value: 2.0, index: 5 },
      { day: 'Sun', dayShort: 'Sun', value: 1.8, index: 6 },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] shadow-2xl"
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/90 via-blue-50/80 to-indigo-100/90" />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-blue-400/20 to-indigo-400/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-purple-400/15 to-pink-400/10 rounded-full blur-3xl"
        />

        {/* Glass overlay */}
        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/90">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-white/50"
                >
                  <span className="text-2xl">🌊</span>
                </motion.div>
                <div>
                  <h3 className="font-black text-xl text-foreground tracking-tight">Your Wellness Canvas</h3>
                  <p className="text-xs font-bold text-muted-foreground/70">Waiting for your first week of data</p>
                </div>
              </div>
            </div>

            {/* Ghost chart bars */}
            <div className="relative h-48 mb-6">
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
                {ghostData.map((item, index) => (
                  <motion.div
                    key={item.day}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(6 - item.value) / 5 * 80}%`, opacity: 0.3 }}
                    transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 bg-gradient-to-t from-slate-300/50 to-slate-200/30 rounded-t-2xl relative overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.15 }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Day labels - Ghost state */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
                {ghostData.map((item) => (
                  <div key={item.day} className="flex-1 text-center">
                    <span className="text-xs font-bold text-slate-400/60">{item.dayShort}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20"
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
                <p className="text-sm font-bold text-blue-600">Track meals to unlock your wellness wave</p>
              </motion.div>
              <p className="text-xs text-muted-foreground mt-3 max-w-xs mx-auto">
                Your personalized bloating insights will appear here after logging meals for 3 days
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  const activeDay = selectedDay !== null ? selectedDay : hoveredDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl shadow-lg shadow-slate-200/50"
    >
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/30" />

      {/* Subtle accent orbs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-200/20 to-purple-200/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-emerald-200/15 to-teal-200/10 rounded-full blur-3xl" />

      {/* Glass container */}
      <div className="relative backdrop-blur-sm bg-white/70 border border-white/80">
        <div className="p-5 sm:p-6">
          {/* Clean Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Compact animated icon */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Weekly Progress
                </h2>
                <p className="text-xs font-semibold text-muted-foreground/60">Your 7-day wellness journey</p>
              </div>
            </div>

            {/* Compact Trend Badge */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl ${trendInfo.bg} ${trendInfo.border} border backdrop-blur-sm`}
            >
              <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} strokeWidth={2.5} />
              <span className={`text-xs font-bold ${trendInfo.color}`}>{trendInfo.label}</span>
            </motion.div>
          </div>

          {/* Clean Stats Cards Row */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
            {/* Weekly Average */}
            <div className="relative overflow-hidden rounded-xl bg-white/60 border border-slate-200/60 p-3 sm:p-4">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500/60" strokeWidth={2.5} />
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wide">Average</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {avgBloating}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground/40">/5</span>
                </div>
              </div>
            </div>

            {/* Good Days */}
            <div className="relative overflow-hidden rounded-xl bg-emerald-50/60 border border-emerald-200/40 p-3 sm:p-4">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-400/15 to-teal-400/10 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Star className="w-3.5 h-3.5 text-emerald-500/60" strokeWidth={2.5} />
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600/60 uppercase tracking-wide">Good</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {goodDays}
                  </span>
                  <span className="text-xs font-semibold text-emerald-500/40">days</span>
                </div>
              </div>
            </div>

            {/* Bloated Days */}
            <div className="relative overflow-hidden rounded-xl bg-rose-50/60 border border-rose-200/40 p-3 sm:p-4">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-rose-400/15 to-orange-400/10 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-500/60" strokeWidth={2.5} />
                  <span className="text-[9px] sm:text-[10px] font-bold text-rose-600/60 uppercase tracking-wide">Bloated</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600">
                    {bloatedDays}
                  </span>
                  <span className="text-xs font-semibold text-rose-500/40">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Chart Section */}
          <div className="relative bg-gradient-to-b from-slate-50/50 to-white/30 rounded-2xl p-4 sm:p-5 border border-slate-100">
            {/* Minimal grid lines */}
            <div className="absolute inset-x-4 top-4 h-40 flex flex-col justify-between pointer-events-none">
              {[5, 3, 1].map((level) => (
                <div key={level} className="flex items-center gap-2">
                  <span className="w-3 text-[9px] font-medium text-slate-300 text-right">{level}</span>
                  <div className="flex-1 border-t border-slate-200/30" />
                </div>
              ))}
            </div>

            {/* THE CHART */}
            <div className="relative h-40 flex items-end justify-between gap-1.5 sm:gap-2 pl-6 pr-0.5">
              {chartData.map((item, index) => {
                const colors = getBloatingColor(item.bloating, item.hasData);
                const height = getBarHeight(item.bloating);
                const isActive = activeDay === index;

                return (
                  <motion.div
                    key={item.day}
                    className="flex-1 h-full flex flex-col items-center justify-end"
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  >
                    {/* Bar Container */}
                    <div className="relative w-full h-full flex items-end justify-center">
                      {/* The bar */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${height}%`,
                          opacity: 1,
                          scale: isActive ? 1.05 : 1,
                        }}
                        transition={{
                          height: { delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                          scale: { duration: 0.15 },
                          opacity: { delay: index * 0.06, duration: 0.4 }
                        }}
                        className={`w-full max-w-[40px] cursor-pointer relative overflow-hidden rounded-xl ${item.hasData ? colors.bg : 'bg-gradient-to-t from-slate-200/50 to-slate-100/30'} ${isActive ? 'shadow-lg' : 'shadow-sm'}`}
                        style={{
                          minHeight: '12%',
                        }}
                      >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/15" />

                        {/* Value tooltip on hover */}
                        <AnimatePresence>
                          {isActive && item.hasData && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 3 }}
                              className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md"
                            >
                              <span className="text-sm font-bold text-foreground">{item.bloating}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Clean Day Labels */}
            <div className="flex justify-between gap-1 sm:gap-1.5 pl-6 pr-0.5 mt-3">
              {chartData.map((item, index) => {
                const isActive = activeDay === index;

                return (
                  <div
                    key={`label-${item.day}`}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    {/* Day label */}
                    <div
                      className={`w-full py-1.5 px-0.5 rounded-lg text-center cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-500 shadow-sm'
                          : item.isToday
                            ? 'bg-indigo-100 border border-indigo-200'
                            : 'bg-white/60 border border-slate-100'
                      }`}
                    >
                      <span className={`text-[10px] sm:text-xs font-bold ${
                        isActive ? 'text-white' : item.isToday ? 'text-indigo-600' : 'text-slate-500'
                      }`}>
                        {item.dayShort}
                      </span>
                    </div>

                    {/* Today badge */}
                    {item.isToday && (
                      <span className="text-[8px] font-bold text-indigo-500 uppercase">Today</span>
                    )}

                    {/* Data dot */}
                    {item.hasData && !item.isToday && (
                      <div className={`w-1.5 h-1.5 rounded-full ${getBloatingColor(item.bloating, item.hasData).bg}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Card */}
          <AnimatePresence>
            {selectedDay !== null && chartData[selectedDay] && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 5, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-white/60 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{chartData[selectedDay].fullDate}</h4>
                        <p className="text-xs font-medium text-muted-foreground">
                          {chartData[selectedDay].count} meal{chartData[selectedDay].count !== 1 ? 's' : ''} logged
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide mb-0.5">Bloating</p>
                      <div className="flex items-baseline gap-0.5">
                        <span className={`text-2xl font-black ${getBloatingColor(chartData[selectedDay].bloating, chartData[selectedDay].hasData).text}`}>
                          {chartData[selectedDay].hasData ? chartData[selectedDay].bloating : '—'}
                        </span>
                        <span className="text-sm text-muted-foreground/50">/5</span>
                      </div>
                    </div>
                  </div>
                  {!chartData[selectedDay].hasData && (
                    <p className="mt-3 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-lg">
                      * Estimated from previous day data
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
