import { useMemo, useState, useRef, useEffect } from 'react';
import { MealEntry } from '@/types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklyProgressChartProps {
  entries: MealEntry[];
}

export function WeeklyProgressChart({ entries }: WeeklyProgressChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 300, height: 180 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        setChartDimensions({ width: rect.width || 300, height: 180 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { chartData, trend, avgBloating } = useMemo(() => {
    const today = startOfDay(new Date());

    const completedEntries = entries.filter(e =>
      e.bloating_rating !== null &&
      e.bloating_rating !== undefined &&
      e.bloating_rating >= 1 &&
      e.bloating_rating <= 5
    );

    const datesWithData = completedEntries.map(e => startOfDay(new Date(e.created_at)));

    if (datesWithData.length === 0) {
      return { chartData: [], trend: 'neutral' as const, avgBloating: 0 };
    }

    const daysToShow = 7;

    const displayDays = Array.from({ length: daysToShow }, (_, i) => {
      const date = subDays(today, daysToShow - 1 - i);
      return {
        date,
        dateStr: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        isToday: isSameDay(date, today),
      };
    });

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
        isToday: day.isToday,
        bloating: avgBloating !== null ? Math.round(avgBloating * 10) / 10 : null,
        hasData: avgBloating !== null,
        count: allDayEntries.length,
      };
    });

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

    return {
      chartData: rawData,
      trend: trendDirection,
      avgBloating: Math.round(overallAvg * 10) / 10,
    };
  }, [entries]);

  const hasData = chartData.some(d => d.bloating !== null);

  const getTrendInfo = () => {
    if (trend === 'down') return {
      icon: TrendingDown,
      label: 'Improving',
      color: 'text-forest',
      bg: 'bg-forest/8',
    };
    if (trend === 'up') return {
      icon: TrendingUp,
      label: 'Increasing',
      color: 'text-burnt',
      bg: 'bg-burnt/8',
    };
    return {
      icon: Minus,
      label: 'Steady',
      color: 'text-charcoal/50',
      bg: 'bg-charcoal/5',
    };
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  const getPointColor = (bloating: number | null) => {
    if (bloating === null) return '#D4DED4';
    if (bloating <= 2) return '#1A4D2E';
    if (bloating <= 3) return '#E07A5F';
    return '#C45A3F';
  };

  // Build SVG path
  const padding = { left: 20, right: 66, top: 20, bottom: 12 };
  const chartWidth = chartDimensions.width - padding.left - padding.right;
  const chartHeight = chartDimensions.height - padding.top - padding.bottom;

  const points = useMemo(() => {
    return chartData.map((day, index) => {
      const x = padding.left + (index / Math.max(chartData.length - 1, 1)) * chartWidth;
      const bloating = day.bloating ?? 3;
      const y = padding.top + ((5 - bloating) / 4) * chartHeight;
      return { x, y, index, hasData: day.hasData, bloating: day.bloating };
    });
  }, [chartData, chartWidth, chartHeight]);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    if (!linePath || points.length < 2) return '';
    const bottomY = padding.top + chartHeight;
    return linePath +
      ` L ${points[points.length - 1].x} ${bottomY}` +
      ` L ${points[0].x} ${bottomY} Z`;
  }, [linePath, points, chartHeight]);

  const activeDay = selectedDay ?? hoveredDay;

  // 5-second cinematic animation config
  const ANIM_DURATION = 5;
  const easing = [0.4, 0, 0.2, 1]; // smooth ease-in-out

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card overflow-hidden"
      >
        <div className="relative p-6">
          <div className="text-center py-8">
            <motion.span
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl block mb-4"
            >
              📊
            </motion.span>
            <h3 className="font-display text-xl font-bold text-charcoal mb-2">Your Wellness Journey</h3>
            <p className="text-sm text-charcoal/60 font-medium">Track meals to see your progress</p>
          </div>
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
        {/* Header - centered and clean */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: easing }}
        >
          <h2 className="font-display text-lg sm:text-xl font-bold text-charcoal tracking-tight">
            Weekly Bloat
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs text-charcoal/40">
              Avg <span className="font-semibold text-charcoal/60">{avgBloating}</span>/5 this week
            </p>
            <span className="text-charcoal/20 text-xs">·</span>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: easing }}
              className={`flex items-center gap-1 ${trendInfo.color}`}
            >
              <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
              <span className="text-xs font-semibold">{trendInfo.label}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Chart area */}
        <div className="relative">
          <svg
            ref={chartRef}
            className="w-full"
            style={{ height: 180 }}
            viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1A4D2E" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#1A4D2E" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal guide lines with y-axis labels */}
            {[
              { bloating: 5, label: 'severe' },
              { bloating: 3, label: 'moderate' },
              { bloating: 1, label: 'none' },
            ].map(({ bloating, label }) => {
              const guideY = padding.top + ((5 - bloating) / 4) * chartHeight;
              return (
                <g key={bloating}>
                  <motion.line
                    x1={padding.left}
                    y1={guideY}
                    x2={chartDimensions.width - padding.right}
                    y2={guideY}
                    stroke="#D4DED4"
                    strokeWidth="0.75"
                    strokeDasharray="3 5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    transition={{ duration: 2, ease: easing }}
                  />
                  <motion.text
                    x={chartDimensions.width - padding.right + 8}
                    y={guideY + 3}
                    fontSize="8.5"
                    fill="#8A948A"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ duration: 2, delay: 0.5, ease: easing }}
                  >
                    <tspan fontWeight="600">{bloating}</tspan>
                    <tspan dx="4" fontSize="7.5" fill="#95A095">{label}</tspan>
                  </motion.text>
                </g>
              );
            })}

            {/* Area fill - fades in after line draws */}
            <motion.path
              d={areaPath}
              fill="url(#areaFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: ANIM_DURATION * 0.5, ease: easing }}
            />

            {/* The line - draws over 5 seconds */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="#1A4D2E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: ANIM_DURATION, ease: easing },
                opacity: { duration: 0.8, ease: easing },
              }}
            />

            {/* Data points - appear sequentially as line reaches them */}
            {points.map((point, index) => {
              const isActive = activeDay === index;
              const color = getPointColor(chartData[index]?.bloating);
              const hasDataPoint = chartData[index]?.hasData;
              const isToday = chartData[index]?.isToday;
              const pointDelay = (index / (points.length - 1)) * ANIM_DURATION;

              return (
                <g key={index}>
                  {/* Current day soft glow ring — appears smoothly after line animation */}
                  {isToday && hasDataPoint && (
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="10"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.1, 0.35] }}
                      transition={{
                        delay: ANIM_DURATION + 1.2,
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Hover ring */}
                  {isActive && hasDataPoint && (
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="14"
                      fill={color}
                      opacity="0.08"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease: easing }}
                    />
                  )}

                  {/* Point */}
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 6 : isToday && hasDataPoint ? 5 : hasDataPoint ? 4 : 3}
                    fill={hasDataPoint ? color : '#E2E8E2'}
                    stroke="white"
                    strokeWidth={isToday ? 2.5 : 2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: pointDelay,
                      duration: 0.6,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  />

                  {/* Tooltip on hover */}
                  <AnimatePresence>
                    {isActive && hasDataPoint && (
                      <motion.g
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <rect
                          x={point.x - 20}
                          y={point.y - 34}
                          width="40"
                          height="24"
                          rx="12"
                          fill={color}
                        />
                        <text
                          x={point.x}
                          y={point.y - 18}
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="700"
                          fill="white"
                        >
                          {chartData[index]?.bloating}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}
          </svg>

          {/* Day labels */}
          <motion.div
            className="flex justify-between mt-2"
            style={{ paddingLeft: 20, paddingRight: 66 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: easing }}
          >
            {chartData.map((day) => (
              <span
                key={day.day}
                className={`text-[11px] ${
                  day.isToday
                    ? 'text-forest font-bold'
                    : 'text-charcoal/40 font-medium'
                }`}
              >
                {day.dayShort}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
