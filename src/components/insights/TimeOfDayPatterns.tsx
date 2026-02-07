import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const CHART_HEIGHT = 160;
const BAR_AREA_TOP = 20;
const BAR_AREA_BOTTOM = CHART_HEIGHT - 4;
const BAR_MAX_HEIGHT = BAR_AREA_BOTTOM - BAR_AREA_TOP;
const LABEL_AREA = 28;
const SVG_HEIGHT = CHART_HEIGHT + LABEL_AREA;

const ANIM_DURATION = 5;
const easing: [number, number, number, number] = [0.4, 0, 0.2, 1];

export function TimeOfDayPatterns({ entries }: TimeOfDayPatternsProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const [chartWidth, setChartWidth] = useState(300);

  useEffect(() => {
    const update = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.getBoundingClientRect().width || 300);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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

  // Bar layout computed from actual pixel width
  const sidePadding = 30;
  const barAreaWidth = chartWidth - sidePadding * 2;
  const barGap = barAreaWidth * 0.1;
  const barWidth = (barAreaWidth - barGap * 3) / 4;
  const barRadius = Math.min(barWidth / 2, 8);

  const bars = useMemo(() => {
    return periodData.map((period, i) => {
      const x = sidePadding + i * (barWidth + barGap);
      const heightRatio = maxPercentage > 0 ? period.percentage / maxPercentage : 0;
      const barHeight = Math.max(heightRatio * BAR_MAX_HEIGHT, period.percentage > 0 ? 6 : 2);
      const y = BAR_AREA_BOTTOM - barHeight;

      // Stagger across 5s: each bar starts progressively later
      const delay = 0.3 + (i / 3) * 2.2;
      const duration = 1.8;

      return { ...period, x, y, barHeight, delay, duration, index: i };
    });
  }, [periodData, maxPercentage, barWidth, barGap]);

  // Guide lines at 50% and 100% of max
  const guides = [
    { pct: 0.5, label: `${Math.round(0.5 * maxPercentage)}%` },
    { pct: 1.0, label: `${maxPercentage}%` },
  ];

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
            When Your Gut Speaks Up
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
        {/* Header — centered, minimal */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: easing }}
        >
          <h2 className="font-display text-lg sm:text-xl font-bold text-charcoal tracking-tight">
            When Your Gut Speaks Up
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs text-charcoal/40">
              Peak{' '}
              <span className="font-semibold text-charcoal/60">
                {periodData[dominantIndex].label}
              </span>
            </p>
            <span className="text-charcoal/20 text-xs">&middot;</span>
            <p className="text-xs text-charcoal/40">
              <span className="font-semibold text-charcoal/60">
                {periodData[dominantIndex].percentage}%
              </span>{' '}
              of bloating
            </p>
          </div>
        </motion.div>

        {/* Chart */}
        <div className="relative">
          <svg
            ref={chartRef}
            className="w-full"
            style={{ height: SVG_HEIGHT }}
            viewBox={`0 0 ${chartWidth} ${SVG_HEIGHT}`}
            preserveAspectRatio="none"
          >
            {/* Horizontal guide lines */}
            {guides.map(({ pct, label }) => {
              const guideY = BAR_AREA_BOTTOM - pct * BAR_MAX_HEIGHT;
              return (
                <g key={pct}>
                  <motion.line
                    x1={sidePadding}
                    y1={guideY}
                    x2={chartWidth - sidePadding}
                    y2={guideY}
                    stroke="#D4DED4"
                    strokeWidth="0.75"
                    strokeDasharray="3 5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.35 }}
                    transition={{ duration: 2, ease: easing }}
                  />
                  <motion.text
                    x={chartWidth - sidePadding + 6}
                    y={guideY + 3}
                    fontSize="8"
                    fill="#95A095"
                    fontWeight="500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 2, delay: 0.5, ease: easing }}
                  >
                    {label}
                  </motion.text>
                </g>
              );
            })}

            {/* Baseline */}
            <motion.line
              x1={sidePadding}
              y1={BAR_AREA_BOTTOM}
              x2={chartWidth - sidePadding}
              y2={BAR_AREA_BOTTOM}
              stroke="#D4DED4"
              strokeWidth="0.75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1, ease: easing }}
            />

            {/* Bars */}
            {bars.map((bar, i) => {
              const isHovered = hoveredBar === i;
              const isDominant = i === dominantIndex;
              const baseOpacity =
                bar.percentage > 0
                  ? 0.2 + (bar.percentage / maxPercentage) * 0.6
                  : 0.06;

              return (
                <g key={bar.label}>
                  {/* Bar */}
                  <motion.rect
                    x={bar.x}
                    y={BAR_AREA_BOTTOM}
                    width={barWidth}
                    rx={barRadius}
                    ry={barRadius}
                    fill="#1A4D2E"
                    initial={{ height: 0, y: BAR_AREA_BOTTOM, opacity: 0 }}
                    animate={{
                      height: bar.barHeight,
                      y: bar.y,
                      opacity: isHovered ? Math.min(baseOpacity + 0.15, 1) : baseOpacity,
                    }}
                    transition={{
                      height: { duration: bar.duration, delay: bar.delay, ease: easing },
                      y: { duration: bar.duration, delay: bar.delay, ease: easing },
                      opacity: {
                        duration: bar.duration,
                        delay: bar.delay,
                        ease: easing,
                      },
                    }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* Percentage label above bar */}
                  <motion.text
                    x={bar.x + barWidth / 2}
                    y={bar.y - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#1A4D2E"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: bar.percentage > 0 ? 0.7 : 0 }}
                    transition={{
                      duration: 0.8,
                      delay: bar.delay + bar.duration * 0.8,
                      ease: easing,
                    }}
                  >
                    {bar.percentage}%
                  </motion.text>

                  {/* Period label below baseline */}
                  <motion.text
                    x={bar.x + barWidth / 2}
                    y={BAR_AREA_BOTTOM + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isDominant ? '600' : '500'}
                    fill={isDominant ? '#1A4D2E' : '#8A948A'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isDominant ? 0.9 : 0.6 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: easing }}
                  >
                    {bar.label}
                  </motion.text>

                  {/* Hover tooltip showing avg bloating */}
                  <AnimatePresence>
                    {isHovered && bar.avgBloating > 0 && (
                      <motion.g
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <rect
                          x={bar.x + barWidth / 2 - 22}
                          y={bar.y - 36}
                          width="44"
                          height="22"
                          rx="11"
                          fill="#1A4D2E"
                        />
                        <text
                          x={bar.x + barWidth / 2}
                          y={bar.y - 21}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="white"
                        >
                          {bar.avgBloating}/5
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
