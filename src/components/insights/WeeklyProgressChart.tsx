import { useMemo, useState } from 'react';
import { MealEntry } from '@/types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Sparkles, Calendar, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklyProgressChartProps {
  entries: MealEntry[];
}

export function WeeklyProgressChart({ entries }: WeeklyProgressChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { chartData, trend, avgBloating, goodDays, bloatedDays } = useMemo(() => {
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
      return { chartData: [], trend: 'neutral' as const, avgBloating: 0, goodDays: 0, bloatedDays: 0 };
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

    return {
      chartData: data,
      trend: trendDirection,
      avgBloating: Math.round(overallAvg * 10) / 10,
      goodDays: good,
      bloatedDays: bloated,
    };
  }, [entries]);

  const hasData = chartData.some(d => d.bloating !== null);

  // Get color based on bloating level
  const getBloatingColor = (bloating: number | null, hasData: boolean) => {
    if (!hasData || bloating === null) return { bg: 'bg-slate-200/50', ring: 'ring-slate-300/50', text: 'text-slate-400' };
    if (bloating <= 1.5) return { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', ring: 'ring-emerald-400/50', text: 'text-emerald-600' };
    if (bloating <= 2.5) return { bg: 'bg-gradient-to-br from-teal-400 to-cyan-500', ring: 'ring-teal-400/50', text: 'text-teal-600' };
    if (bloating <= 3.5) return { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', ring: 'ring-amber-400/50', text: 'text-amber-600' };
    if (bloating <= 4.5) return { bg: 'bg-gradient-to-br from-orange-400 to-rose-500', ring: 'ring-orange-400/50', text: 'text-orange-600' };
    return { bg: 'bg-gradient-to-br from-rose-400 to-red-500', ring: 'ring-rose-400/50', text: 'text-rose-600' };
  };

  // Get trend info
  const getTrendInfo = () => {
    if (trend === 'down') return {
      icon: TrendingDown,
      label: 'Improving',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    };
    if (trend === 'up') return {
      icon: TrendingUp,
      label: 'Increasing',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    };
    return {
      icon: Minus,
      label: 'Steady',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
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
    // Ghost data for empty state visualization
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl"
    >
      {/* Ultra-premium animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-purple-50/95" />

      {/* Multiple animated gradient orbs for depth */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-400/25 to-indigo-400/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], x: [0, -25, 0], y: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-tr from-purple-400/20 to-pink-400/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-full blur-3xl"
      />

      {/* Premium glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/75 border-2 border-white/95">
        <div className="p-6">
          {/* Ultra-Premium Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                  <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500"
                />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  Weekly Progress
                  {trend === 'down' && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </motion.span>
                  )}
                </h2>
                <p className="text-xs font-bold text-muted-foreground/70 mt-0.5">Your 7-day wellness journey</p>
              </div>
            </div>

            {/* Trend Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${trendInfo.bg} ${trendInfo.border} border backdrop-blur-md`}
            >
              <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} strokeWidth={2.5} />
              <span className={`text-sm font-black ${trendInfo.color}`}>{trendInfo.label}</span>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Weekly Average */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border-2 border-white/95 p-4 shadow-lg"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-xl" />
              <span className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-wider">Average</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {avgBloating}
                </span>
                <span className="text-sm font-bold text-muted-foreground/60">/5</span>
              </div>
            </motion.div>

            {/* Good Days */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border-2 border-emerald-100/80 p-4 shadow-lg"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-full blur-xl" />
              <span className="text-[10px] font-extrabold text-emerald-600/70 uppercase tracking-wider">Good Days</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-emerald-600">{goodDays}</span>
                <span className="text-sm font-bold text-emerald-500/60">days</span>
              </div>
            </motion.div>

            {/* Bloated Days */}
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50/90 to-orange-50/70 border-2 border-rose-100/80 p-4 shadow-lg"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-orange-400/10 rounded-full blur-xl" />
              <span className="text-[10px] font-extrabold text-rose-600/70 uppercase tracking-wider">Bloated</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-rose-600">{bloatedDays}</span>
                <span className="text-sm font-bold text-rose-500/60">days</span>
              </div>
            </motion.div>
          </div>

          {/* Ultra-Premium Chart */}
          <div className="relative">
            {/* Chart background with grid lines */}
            <div className="absolute inset-x-0 top-0 h-52 flex flex-col justify-between pointer-events-none px-2">
              {[5, 4, 3, 2, 1].map((level) => (
                <div key={level} className="flex items-center">
                  <div className="w-full border-t border-slate-200/50 border-dashed" />
                </div>
              ))}
            </div>

            {/* Y-axis labels */}
            <div className="absolute -left-1 top-0 h-52 flex flex-col justify-between text-right pr-2 pointer-events-none">
              {[5, 4, 3, 2, 1].map((level) => (
                <span key={level} className="text-[10px] font-bold text-slate-400 -translate-y-1/2">{level}</span>
              ))}
            </div>

            {/* The Chart Bars */}
            <div className="relative h-52 flex items-end justify-between gap-2 pl-5 pr-1">
              {chartData.map((item, index) => {
                const colors = getBloatingColor(item.bloating, item.hasData);
                const height = getBarHeight(item.bloating);
                const isActive = activeDay === index;

                return (
                  <motion.div
                    key={item.day}
                    className="flex-1 flex flex-col items-center"
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  >
                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${height}%`,
                        opacity: 1,
                        scale: isActive ? 1.05 : 1,
                      }}
                      transition={{
                        height: { delay: index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.2 }
                      }}
                      className={`w-full cursor-pointer relative overflow-hidden rounded-t-2xl ${item.hasData ? colors.bg : 'bg-slate-200/60'} ${isActive ? 'shadow-2xl ring-4 ' + colors.ring : 'shadow-lg'}`}
                      style={{
                        minHeight: '20%',
                        boxShadow: item.hasData && isActive
                          ? `0 10px 40px -10px ${item.bloating && item.bloating <= 2 ? 'rgba(16, 185, 129, 0.4)' : item.bloating && item.bloating >= 4 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`
                          : undefined
                      }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />

                      {/* Value label on hover */}
                      <AnimatePresence>
                        {isActive && item.hasData && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border border-white/80"
                          >
                            <span className="text-sm font-black text-foreground">{item.bloating}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Inner glow for data points */}
                      {item.hasData && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* ULTRA-VISIBLE Day Labels */}
            <div className="flex justify-between gap-2 pl-5 pr-1 mt-4">
              {chartData.map((item, index) => {
                const isActive = activeDay === index;
                const colors = getBloatingColor(item.bloating, item.hasData);

                return (
                  <motion.div
                    key={`label-${item.day}`}
                    className="flex-1 flex flex-col items-center"
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Day name - MUCH MORE VISIBLE */}
                    <motion.div
                      className={`w-full py-2 px-1 rounded-xl text-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
                          : item.isToday
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200'
                            : 'bg-white/80 border border-slate-200/80'
                      }`}
                    >
                      <span className={`text-sm font-black tracking-wide ${
                        isActive ? 'text-white' : item.isToday ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {item.dayShort}
                      </span>
                    </motion.div>

                    {/* Today indicator */}
                    {item.isToday && !isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-1.5 px-2 py-0.5 bg-blue-500 rounded-full"
                      >
                        <span className="text-[9px] font-black text-white uppercase tracking-wider">Today</span>
                      </motion.div>
                    )}

                    {/* Data indicator dot */}
                    {item.hasData && !item.isToday && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className={`w-2 h-2 rounded-full mt-2 ${colors.bg}`}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Day Detail Card (shows on selection) */}
          <AnimatePresence>
            {selectedDay !== null && chartData[selectedDay] && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mt-5 overflow-hidden"
              >
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white/95 to-white/80 border-2 border-white/90 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-foreground">{chartData[selectedDay].fullDate}</h4>
                        <p className="text-xs font-bold text-muted-foreground">
                          {chartData[selectedDay].count} meal{chartData[selectedDay].count !== 1 ? 's' : ''} logged
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bloating Level</p>
                      <p className="text-3xl font-black text-foreground">
                        {chartData[selectedDay].hasData ? chartData[selectedDay].bloating : '—'}
                        <span className="text-lg text-muted-foreground">/5</span>
                      </p>
                    </div>
                  </div>
                  {!chartData[selectedDay].hasData && (
                    <p className="mt-3 text-xs text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-lg">
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
