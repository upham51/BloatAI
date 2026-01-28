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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"
    >
      {/* Ultra-premium multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100/30 via-transparent to-transparent" />

      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-50">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </div>

      {/* Floating gradient orbs with enhanced animations */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -30, 0],
          y: [0, 25, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-purple-400/15 via-pink-400/10 to-rose-400/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-400/10 via-cyan-400/5 to-sky-400/10 rounded-full blur-3xl"
      />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      />

      {/* Premium glass container */}
      <div className="relative backdrop-blur-xl bg-white/80 border border-white/60">
        <div className="p-6 sm:p-8">
          {/* Ultra-Premium Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Animated icon with glow */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* Glow effect */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-40"
                />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                  <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl border-2 border-indigo-400"
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Weekly Progress
                  </h2>
                  {trend === 'down' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <Sparkles className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm font-semibold text-muted-foreground/70 mt-1">Your 7-day wellness journey</p>
              </div>
            </div>

            {/* Enhanced Trend Badge */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl ${trendInfo.bg} ${trendInfo.border} border-2 backdrop-blur-md cursor-pointer`}
              style={{ boxShadow: trendInfo.glow }}
            >
              <motion.div
                animate={{ y: trend === 'down' ? [0, -2, 0] : trend === 'up' ? [0, 2, 0] : [0, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <TrendIcon className={`w-5 h-5 ${trendInfo.color}`} strokeWidth={2.5} />
              </motion.div>
              <span className={`text-sm font-black ${trendInfo.color}`}>{trendInfo.label}</span>
            </motion.div>
          </div>

          {/* Premium Stats Cards Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {/* Weekly Average - Hero stat */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/50 border border-white/80 p-4 sm:p-5 shadow-lg shadow-indigo-500/5 cursor-pointer group"
            >
              {/* Subtle glow on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500"
              />
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-indigo-400/15 to-purple-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-indigo-500/70" strokeWidth={2.5} />
                  <span className="text-[10px] sm:text-xs font-extrabold text-muted-foreground/70 uppercase tracking-wider">Average</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <motion.span
                    key={avgBloating}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    {avgBloating}
                  </motion.span>
                  <span className="text-sm sm:text-base font-bold text-muted-foreground/50">/5</span>
                </div>
              </div>
            </motion.div>

            {/* Good Days */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-cyan-50/50 border border-emerald-200/50 p-4 sm:p-5 shadow-lg shadow-emerald-500/5 cursor-pointer group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-500"
              />
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-emerald-500/70" strokeWidth={2.5} />
                  <span className="text-[10px] sm:text-xs font-extrabold text-emerald-600/70 uppercase tracking-wider">Good Days</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <motion.span
                    key={goodDays}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl sm:text-4xl font-black text-emerald-600"
                  >
                    {goodDays}
                  </motion.span>
                  <span className="text-sm sm:text-base font-bold text-emerald-500/50">days</span>
                </div>
              </div>
            </motion.div>

            {/* Bloated Days */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50/90 via-orange-50/70 to-amber-50/50 border border-rose-200/50 p-4 sm:p-5 shadow-lg shadow-rose-500/5 cursor-pointer group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-orange-500/0 group-hover:from-rose-500/5 group-hover:to-orange-500/5 transition-all duration-500"
              />
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-orange-400/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-rose-500/70" strokeWidth={2.5} />
                  <span className="text-[10px] sm:text-xs font-extrabold text-rose-600/70 uppercase tracking-wider">Bloated</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <motion.span
                    key={bloatedDays}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl sm:text-4xl font-black text-rose-600"
                  >
                    {bloatedDays}
                  </motion.span>
                  <span className="text-sm sm:text-base font-bold text-rose-500/50">days</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Ultra-Premium Chart Section */}
          <div className="relative bg-gradient-to-br from-white/60 to-slate-50/40 rounded-3xl p-5 sm:p-6 border border-white/80 shadow-inner">
            {/* Chart background with enhanced grid lines */}
            <div className="absolute inset-x-6 top-6 h-52 flex flex-col justify-between pointer-events-none">
              {[5, 4, 3, 2, 1].map((level, idx) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-4 text-[10px] font-bold text-slate-300 text-right">{level}</span>
                  <div className={`flex-1 border-t ${idx === 2 ? 'border-slate-300/60' : 'border-slate-200/40'} border-dashed`} />
                </div>
              ))}
            </div>

            {/* THE CHART - Fixed height container */}
            <div className="relative h-52 flex items-end justify-between gap-2 sm:gap-3 pl-8 pr-1">
              {chartData.map((item, index) => {
                const colors = getBloatingColor(item.bloating, item.hasData);
                const height = getBarHeight(item.bloating);
                const isActive = activeDay === index;
                const isBest = bestDay?.index === index;
                const isWorst = worstDay?.index === index;

                return (
                  <motion.div
                    key={item.day}
                    className="flex-1 h-full flex flex-col items-center justify-end"
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  >
                    {/* Bar Container - THIS IS THE FIX: Added h-full */}
                    <div className="relative w-full h-full flex items-end justify-center">
                      {/* Glow effect behind bar */}
                      {item.hasData && (
                        <motion.div
                          animate={{
                            opacity: isActive ? 0.8 : 0.4,
                            scale: isActive ? 1.2 : 1
                          }}
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full rounded-t-2xl blur-xl"
                          style={{
                            height: `${height * 0.8}%`,
                            backgroundColor: colors.glow,
                          }}
                        />
                      )}

                      {/* The actual bar */}
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${height}%`,
                          opacity: 1,
                          scale: isActive ? 1.08 : 1,
                        }}
                        transition={{
                          height: { delay: index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                          scale: { duration: 0.2 },
                          opacity: { delay: index * 0.08, duration: 0.5 }
                        }}
                        className={`w-full max-w-[52px] cursor-pointer relative overflow-hidden rounded-t-2xl ${item.hasData ? colors.bg : 'bg-gradient-to-t from-slate-200/60 to-slate-100/40'} ${isActive ? `shadow-2xl ring-4 ${colors.ring}` : 'shadow-lg'}`}
                        style={{
                          minHeight: '15%',
                          boxShadow: item.hasData && isActive
                            ? `0 15px 50px -15px ${colors.glow}`
                            : item.hasData
                              ? `0 8px 25px -8px ${colors.glow}`
                              : undefined
                        }}
                      >
                        {/* Inner gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20" />

                        {/* Animated shimmer */}
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
                          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        />

                        {/* Best/Worst day indicator */}
                        {item.hasData && (isBest || isWorst) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.05, type: "spring" }}
                            className={`absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ${isBest ? 'bg-emerald-500' : 'bg-rose-500'} shadow-lg`}
                          >
                            <span className="text-xs">{isBest ? '✓' : '!'}</span>
                          </motion.div>
                        )}

                        {/* Value label on hover */}
                        <AnimatePresence>
                          {isActive && item.hasData && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-white/80"
                            >
                              <span className="text-base font-black text-foreground">{item.bloating}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Premium Day Labels */}
            <div className="flex justify-between gap-2 sm:gap-3 pl-8 pr-1 mt-5">
              {chartData.map((item, index) => {
                const isActive = activeDay === index;

                return (
                  <motion.div
                    key={`label-${item.day}`}
                    className="flex-1 flex flex-col items-center gap-2"
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Day pill */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`w-full py-2.5 px-1 rounded-xl text-center transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30'
                          : item.isToday
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-indigo-300/60 shadow-md'
                            : 'bg-white/80 border border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-xs sm:text-sm font-black tracking-wide ${
                        isActive ? 'text-white' : item.isToday ? 'text-indigo-600' : 'text-slate-600'
                      }`}>
                        {item.dayShort}
                      </span>
                    </motion.div>

                    {/* Today badge */}
                    {item.isToday && !isActive && (
                      <motion.div
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg"
                      >
                        <span className="text-[9px] font-black text-white uppercase tracking-wider">Today</span>
                      </motion.div>
                    )}

                    {/* Data indicator dot */}
                    {item.hasData && !item.isToday && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05, type: "spring" }}
                        className={`w-2.5 h-2.5 rounded-full ${getBloatingColor(item.bloating, item.hasData).bg} shadow-md`}
                        style={{ boxShadow: `0 2px 8px ${getBloatingColor(item.bloating, item.hasData).glow}` }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Premium Day Detail Card */}
          <AnimatePresence>
            {selectedDay !== null && chartData[selectedDay] && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/50 border border-white/80 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 flex items-center justify-center border border-indigo-200/50"
                      >
                        <Calendar className="w-7 h-7 text-indigo-600" />
                      </motion.div>
                      <div>
                        <h4 className="font-black text-xl text-foreground">{chartData[selectedDay].fullDate}</h4>
                        <p className="text-sm font-semibold text-muted-foreground">
                          {chartData[selectedDay].count} meal{chartData[selectedDay].count !== 1 ? 's' : ''} logged
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-1">Bloating</p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${getBloatingColor(chartData[selectedDay].bloating, chartData[selectedDay].hasData).text}`}>
                          {chartData[selectedDay].hasData ? chartData[selectedDay].bloating : '—'}
                        </span>
                        <span className="text-lg text-muted-foreground/60">/5</span>
                      </div>
                    </div>
                  </div>
                  {!chartData[selectedDay].hasData && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-sm text-amber-700 font-semibold bg-amber-100/80 px-4 py-3 rounded-xl border border-amber-200/50"
                    >
                      * Estimated from previous day data
                    </motion.p>
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
