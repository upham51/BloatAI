import { useMemo, useState, useRef, useEffect } from 'react';
import { MealEntry } from '@/types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Activity, Star, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklyProgressChartProps {
  entries: MealEntry[];
}

export function WeeklyProgressChart({ entries }: WeeklyProgressChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 300, height: 160 });

  // Responsive chart dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        setChartDimensions({ width: rect.width || 300, height: 160 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { chartData, trend, avgBloating, goodDays, bloatedDays } = useMemo(() => {
    const today = startOfDay(new Date());

    // Filter entries that have bloating ratings
    const completedEntries = entries.filter(e =>
      e.bloating_rating !== null &&
      e.bloating_rating !== undefined &&
      e.bloating_rating >= 1 &&
      e.bloating_rating <= 5
    );

    const datesWithData = completedEntries.map(e => startOfDay(new Date(e.created_at)));

    if (datesWithData.length === 0) {
      return { chartData: [], trend: 'neutral' as const, avgBloating: 0, goodDays: 0, bloatedDays: 0 };
    }

    // Always show full 7-day week
    const daysToShow = 7;

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

    // Collect actual data for each day
    const rawData = displayDays.map((day, index) => {
      const dayEntries = completedEntries.filter(e =>
        isSameDay(new Date(e.created_at), day.date)
      );

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

    // Calculate trend
    const validData = rawData.filter(d => d.bloating !== null);
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

    const good = rawData.filter(d => d.hasData && (d.bloating || 0) <= 2).length;
    const bloated = rawData.filter(d => d.hasData && (d.bloating || 0) >= 4).length;

    return {
      chartData: rawData,
      trend: trendDirection,
      avgBloating: Math.round(overallAvg * 10) / 10,
      goodDays: good,
      bloatedDays: bloated,
    };
  }, [entries]);

  const hasData = chartData.some(d => d.bloating !== null);

  // Get trend info
  const getTrendInfo = () => {
    if (trend === 'down') return {
      icon: TrendingDown,
      label: 'Improving',
      color: 'text-emerald-600',
      bg: 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15',
      border: 'border-emerald-400/30',
    };
    if (trend === 'up') return {
      icon: TrendingUp,
      label: 'Increasing',
      color: 'text-rose-600',
      bg: 'bg-gradient-to-r from-rose-500/15 via-red-500/10 to-rose-500/15',
      border: 'border-rose-400/30',
    };
    return {
      icon: Minus,
      label: 'Steady',
      color: 'text-blue-600',
      bg: 'bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15',
      border: 'border-blue-400/30',
    };
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  // Calculate SVG path for smooth line chart
  const getLinePath = () => {
    const padding = { left: 10, right: 10, top: 20, bottom: 30 };
    const chartWidth = chartDimensions.width - padding.left - padding.right;
    const chartHeight = chartDimensions.height - padding.top - padding.bottom;

    // Get points for days with data
    const points: { x: number; y: number; index: number; hasData: boolean; bloating: number | null }[] = [];

    chartData.forEach((day, index) => {
      const x = padding.left + (index / (chartData.length - 1)) * chartWidth;
      // Invert Y: lower bloating = higher on chart (better)
      const bloating = day.bloating ?? 3; // Default to middle if no data
      const y = padding.top + ((bloating - 1) / 4) * chartHeight;
      points.push({ x, y, index, hasData: day.hasData, bloating: day.bloating });
    });

    if (points.length < 2) return { linePath: '', areaPath: '', points };

    // Create smooth bezier curve path
    let linePath = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Calculate control points for smooth curve
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Create area path for gradient fill
    const areaPath = linePath +
      ` L ${points[points.length - 1].x} ${chartDimensions.height - padding.bottom}` +
      ` L ${points[0].x} ${chartDimensions.height - padding.bottom} Z`;

    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points } = getLinePath();
  const activeDay = selectedDay ?? hoveredDay;

  // Get color for a point based on bloating level
  const getPointColor = (bloating: number | null) => {
    if (bloating === null) return '#94a3b8';
    if (bloating <= 2) return '#10b981';
    if (bloating <= 3) return '#f59e0b';
    return '#f43f5e';
  };

  if (!hasData) {
    // Empty state with ghost visualization
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/90 via-blue-50/80 to-indigo-100/90" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-blue-400/20 to-indigo-400/15 rounded-full blur-3xl"
        />
        <div className="relative backdrop-blur-2xl bg-white/70 border-2 border-white/90 p-6">
          <div className="text-center py-8">
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl block mb-4"
            >
              📊
            </motion.span>
            <h3 className="font-black text-xl text-foreground mb-2">Your Wellness Journey</h3>
            <p className="text-sm text-muted-foreground">Track meals to see your progress</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-indigo-500/10"
    >
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/50" />

      {/* Animated accent orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-300/20 to-purple-300/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-emerald-300/15 to-teal-300/10 rounded-full blur-3xl"
      />

      {/* Glass container */}
      <div className="relative backdrop-blur-sm bg-white/80 border border-white/60">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  Weekly Progress
                </h2>
                <p className="text-[11px] font-semibold text-muted-foreground/60">Your 7-day wellness journey</p>
              </div>
            </div>

            {/* Trend Badge */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${trendInfo.bg} ${trendInfo.border} border backdrop-blur-sm`}
            >
              <TrendIcon className={`w-3.5 h-3.5 ${trendInfo.color}`} strokeWidth={2.5} />
              <span className={`text-[11px] font-bold ${trendInfo.color}`}>{trendInfo.label}</span>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {/* Average */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50/80 border border-slate-100 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-indigo-500/60" strokeWidth={2.5} />
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide">Avg</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {avgBloating}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground/40">/5</span>
              </div>
            </div>

            {/* Good Days */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-100/60 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 text-emerald-500/60" strokeWidth={2.5} />
                <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-wide">Good</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-600">{goodDays}</span>
                <span className="text-[10px] font-semibold text-emerald-500/40">days</span>
              </div>
            </div>

            {/* Bloated Days */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50/80 to-orange-50/60 border border-rose-100/60 p-3">
              <div className="flex items-center gap-1 mb-1">
                <Zap className="w-3 h-3 text-rose-500/60" strokeWidth={2.5} />
                <span className="text-[9px] font-bold text-rose-600/60 uppercase tracking-wide">High</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl sm:text-2xl font-black text-rose-600">{bloatedDays}</span>
                <span className="text-[10px] font-semibold text-rose-500/40">days</span>
              </div>
            </div>
          </div>

          {/* Premium Line Chart */}
          <div className="relative bg-gradient-to-b from-slate-50/60 to-white rounded-2xl p-3 sm:p-4 border border-slate-100/80">
            {/* Y-axis labels */}
            <div className="absolute left-1 top-3 bottom-8 flex flex-col justify-between text-[9px] font-medium text-slate-300">
              <span>5</span>
              <span>3</span>
              <span>1</span>
            </div>

            {/* SVG Chart */}
            <svg
              ref={chartRef}
              className="w-full h-40"
              viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
              preserveAspectRatio="none"
            >
              {/* Gradient definitions */}
              <defs>
                {/* Main area gradient */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
                </linearGradient>

                {/* Line gradient */}
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Point glow */}
                <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizontal grid lines */}
              {[1, 2, 3, 4, 5].map((level) => {
                const y = 20 + ((level - 1) / 4) * 110;
                return (
                  <line
                    key={level}
                    x1="10"
                    y1={y}
                    x2={chartDimensions.width - 10}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={level === 3 ? "0" : "4 4"}
                    opacity={level === 3 ? 0.6 : 0.3}
                  />
                );
              })}

              {/* Area fill with gradient */}
              <motion.path
                d={areaPath}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Main line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Data points */}
              {points.map((point, index) => {
                const isActive = activeDay === index;
                const color = getPointColor(chartData[index]?.bloating);
                const hasData = chartData[index]?.hasData;

                return (
                  <g key={index}>
                    {/* Outer glow ring for active point */}
                    {isActive && hasData && (
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="16"
                        fill={color}
                        opacity="0.15"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* Point */}
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 8 : hasData ? 6 : 4}
                      fill={hasData ? color : '#cbd5e1'}
                      stroke="white"
                      strokeWidth={isActive ? 3 : 2}
                      filter={hasData ? "url(#pointGlow)" : undefined}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.08, duration: 0.4, type: "spring" }}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredDay(index)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                    />

                    {/* Value label on hover */}
                    {isActive && hasData && (
                      <motion.g
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <rect
                          x={point.x - 18}
                          y={point.y - 32}
                          width="36"
                          height="22"
                          rx="6"
                          fill="white"
                          stroke={color}
                          strokeWidth="1.5"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        />
                        <text
                          x={point.x}
                          y={point.y - 17}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="800"
                          fill={color}
                        >
                          {chartData[index]?.bloating}
                        </text>
                      </motion.g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Day labels */}
            <div className="flex justify-between px-1 mt-2">
              {chartData.map((day, index) => {
                const isActive = activeDay === index;

                return (
                  <motion.div
                    key={day.day}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  >
                    <span className={`text-[10px] sm:text-xs font-bold transition-colors ${
                      isActive ? 'text-indigo-600' : day.isToday ? 'text-indigo-500' : 'text-slate-400'
                    }`}>
                      {day.dayShort}
                    </span>
                    {day.isToday && (
                      <motion.div
                        layoutId="todayIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                      />
                    )}
                    {!day.isToday && day.hasData && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: getPointColor(day.bloating) }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Detail */}
          <AnimatePresence>
            {selectedDay !== null && chartData[selectedDay] && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 5, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-gradient-to-r from-white to-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{chartData[selectedDay].fullDate}</h4>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {chartData[selectedDay].count} meal{chartData[selectedDay].count !== 1 ? 's' : ''} logged
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wide mb-0.5">Bloating</p>
                      <div className="flex items-baseline gap-0.5">
                        <span
                          className="text-2xl font-black"
                          style={{ color: getPointColor(chartData[selectedDay].bloating) }}
                        >
                          {chartData[selectedDay].hasData ? chartData[selectedDay].bloating : '—'}
                        </span>
                        <span className="text-sm text-muted-foreground/50">/5</span>
                      </div>
                    </div>
                  </div>
                  {!chartData[selectedDay].hasData && (
                    <p className="mt-2 text-[11px] text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                      No bloating data recorded
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
