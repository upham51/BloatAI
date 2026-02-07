import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  color: string;
  lightColor: string;
  textColor: string;
}

const TIME_PERIODS: TimePeriod[] = [
  {
    label: 'Morning',
    emoji: '\u{1F305}',
    range: '6 - 11am',
    startHour: 6,
    endHour: 11,
    color: '#f59e0b',
    lightColor: 'rgba(245, 158, 11, 0.12)',
    textColor: 'text-amber-700',
  },
  {
    label: 'Afternoon',
    emoji: '\u{2600}\u{FE0F}',
    range: '12 - 5pm',
    startHour: 12,
    endHour: 17,
    color: '#f43f5e',
    lightColor: 'rgba(244, 63, 94, 0.12)',
    textColor: 'text-rose-700',
  },
  {
    label: 'Evening',
    emoji: '\u{1F306}',
    range: '6 - 9pm',
    startHour: 18,
    endHour: 21,
    color: '#8b5cf6',
    lightColor: 'rgba(139, 92, 246, 0.12)',
    textColor: 'text-violet-700',
  },
  {
    label: 'Night',
    emoji: '\u{1F319}',
    range: '10pm+',
    startHour: 22,
    endHour: 5,
    color: '#6366f1',
    lightColor: 'rgba(99, 102, 241, 0.12)',
    textColor: 'text-indigo-700',
  },
];

function getTimePeriodIndex(hour: number): number {
  if (hour >= 6 && hour <= 11) return 0;
  if (hour >= 12 && hour <= 17) return 1;
  if (hour >= 18 && hour <= 21) return 2;
  return 3;
}

function getDominantInsight(label: string, percentage: number): string {
  if (percentage === 0) return `No bloating recorded in the ${label.toLowerCase()}`;
  if (percentage >= 40) return `Most of your bloating happens in the ${label.toLowerCase()}`;
  if (percentage >= 25) return `A good portion of bloating occurs in the ${label.toLowerCase()}`;
  return `Some bloating happens in the ${label.toLowerCase()}`;
}

// SVG donut chart segment as an arc path
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function TimeOfDayPatterns({ entries }: TimeOfDayPatternsProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

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
  const dominantIndex = periodData.reduce(
    (maxIdx, p, i, arr) => (p.percentage > arr[maxIdx].percentage ? i : maxIdx),
    0
  );

  // Build donut segments
  const CHART_SIZE = 200;
  const CENTER = CHART_SIZE / 2;
  const RADIUS = 72;
  const STROKE_WIDTH = 28;
  const GAP_DEGREES = 3;

  const segments = useMemo(() => {
    const totalPercentage = periodData.reduce((s, p) => s + p.percentage, 0);
    if (totalPercentage === 0) {
      // Show equal empty segments
      return periodData.map((period, i) => ({
        ...period,
        startAngle: i * 90,
        endAngle: (i + 1) * 90 - GAP_DEGREES,
        isEmpty: true,
      }));
    }

    let currentAngle = 0;
    return periodData.map((period, i) => {
      const sweepAngle = (period.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + Math.max(sweepAngle - GAP_DEGREES, 0);
      currentAngle += sweepAngle;
      return {
        ...period,
        startAngle,
        endAngle,
        isEmpty: period.percentage === 0,
      };
    });
  }, [periodData]);

  const selectedData = selectedSegment !== null ? periodData[selectedSegment] : null;

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
            className="flex items-center gap-3 mb-2"
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
                When Your Gut Speaks Up
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Bloating patterns by time of day
              </p>
            </div>
          </motion.div>

          {/* Donut Chart */}
          <div className="flex flex-col items-center mt-4 mb-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
              style={{ width: CHART_SIZE, height: CHART_SIZE }}
            >
              <svg
                viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
                width={CHART_SIZE}
                height={CHART_SIZE}
                className="overflow-visible"
              >
                {/* Subtle background ring */}
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.08)"
                  strokeWidth={STROKE_WIDTH}
                />

                {/* Donut segments */}
                {segments.map((seg, i) => {
                  if (seg.isEmpty && totalMeals > 0) return null;
                  const isSelected = selectedSegment === i;
                  const isDominant = i === dominantIndex && totalMeals > 0;
                  const sweepAngle = seg.endAngle - seg.startAngle;
                  if (sweepAngle <= 0 && totalMeals > 0) return null;

                  const circumference = 2 * Math.PI * RADIUS;
                  const segmentLength = (sweepAngle / 360) * circumference;
                  const offset = ((seg.startAngle) / 360) * circumference;

                  return (
                    <motion.circle
                      key={seg.label}
                      cx={CENTER}
                      cy={CENTER}
                      r={RADIUS}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isSelected ? STROKE_WIDTH + 6 : isDominant ? STROKE_WIDTH + 3 : STROKE_WIDTH}
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        cursor: 'pointer',
                        filter: isSelected
                          ? `drop-shadow(0 0 8px ${seg.color})`
                          : isDominant
                          ? `drop-shadow(0 0 4px ${seg.color})`
                          : 'none',
                        transition: 'stroke-width 0.3s ease, filter 0.3s ease',
                      }}
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{
                        strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
                        opacity: seg.isEmpty ? 0.3 : 1,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.4 + i * 0.15,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() =>
                        setSelectedSegment(selectedSegment === i ? null : i)
                      }
                    />
                  );
                })}
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {selectedData ? (
                    <motion.div
                      key={`selected-${selectedSegment}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="text-center"
                    >
                      <span className="text-2xl">{selectedData.emoji}</span>
                      <div className="text-2xl font-black text-foreground leading-tight">
                        {selectedData.percentage}%
                      </div>
                      <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                        {selectedData.count} {selectedData.count === 1 ? 'meal' : 'meals'}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="total"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-black text-foreground leading-tight">
                        {totalMeals}
                      </div>
                      <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                        meals tracked
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dominant segment pulse glow */}
              {totalMeals > 0 && selectedSegment === null && (
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${periodData[dominantIndex].color}10 0%, transparent 70%)`,
                  }}
                />
              )}
            </motion.div>
          </div>

          {/* Legend / segment labels */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="grid grid-cols-2 gap-2 mt-3"
          >
            {periodData.map((period, i) => {
              const isSelected = selectedSegment === i;
              const isDominant = i === dominantIndex && totalMeals > 0;
              return (
                <motion.button
                  key={period.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setSelectedSegment(selectedSegment === i ? null : i)
                  }
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-white/90 border-violet-200/80 shadow-md'
                      : 'bg-white/50 border-white/60 hover:bg-white/70'
                  }`}
                >
                  <motion.div
                    animate={
                      isDominant && !isSelected
                        ? { scale: [1, 1.15, 1] }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: period.color,
                      boxShadow: isSelected || isDominant
                        ? `0 0 8px ${period.color}60`
                        : 'none',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{period.emoji}</span>
                      <span className={`text-xs font-bold ${period.textColor}`}>
                        {period.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {period.percentage}%
                      {period.avgBloating > 0 && ` \u00B7 avg ${period.avgBloating}/5`}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Selected segment insight */}
          <AnimatePresence>
            {selectedData && selectedSegment !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-violet-100/60">
                  <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                    {getDominantInsight(selectedData.label, selectedData.percentage)}
                    {selectedData.avgBloating > 0 && (
                      <span className="text-muted-foreground">
                        {' '}with an average bloating of{' '}
                        <span className="font-bold text-foreground">
                          {selectedData.avgBloating}/5
                        </span>
                        .
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
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
