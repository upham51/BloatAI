import { useMemo, useState, useEffect } from 'react';
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
  const [animationPhase, setAnimationPhase] = useState<'waiting' | 'drawing' | 'done'>('waiting');

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

  // Chart dimensions
  const CHART_SIZE = 240;
  const CENTER = CHART_SIZE / 2;
  const RADIUS = 82;
  const STROKE_WIDTH = 32;
  const GAP_DEGREES = 4;

  // Build segment data
  const segments = useMemo(() => {
    const totalPercentage = periodData.reduce((s, p) => s + p.percentage, 0);
    if (totalPercentage === 0) {
      return periodData.map((period, i) => ({
        ...period,
        startAngle: i * 90,
        endAngle: (i + 1) * 90 - GAP_DEGREES,
        sweepAngle: 90 - GAP_DEGREES,
        isEmpty: true,
        midAngle: i * 90 + 45,
      }));
    }

    let currentAngle = 0;
    return periodData.map((period) => {
      const sweepAngle = (period.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + Math.max(sweepAngle - GAP_DEGREES, 0);
      const midAngle = currentAngle + sweepAngle / 2;
      currentAngle += sweepAngle;
      return {
        ...period,
        startAngle,
        endAngle,
        sweepAngle: Math.max(sweepAngle - GAP_DEGREES, 0),
        isEmpty: period.percentage === 0,
        midAngle,
      };
    });
  }, [periodData]);

  // Start animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimationPhase('drawing'), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationPhase === 'drawing') {
      const timer = setTimeout(() => setAnimationPhase('done'), 5200);
      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  const selectedData = selectedSegment !== null ? periodData[selectedSegment] : null;

  // Calculate emoji positions on/near arcs
  const emojiPositions = useMemo(() => {
    return segments.map((seg) => {
      const pos = polarToCartesian(CENTER, CENTER, RADIUS + STROKE_WIDTH / 2 + 20, seg.midAngle);
      return pos;
    });
  }, [segments]);

  // Cumulative animation delays - each segment starts after previous one finishes
  // Total 5s animation: distribute proportionally by segment size
  const segmentAnimations = useMemo(() => {
    const TOTAL_DRAW_TIME = 4.5; // seconds for drawing
    const BASE_DELAY = 0.5; // initial delay
    const totalSweep = segments.reduce((s, seg) => s + (seg.isEmpty ? 0 : seg.sweepAngle), 0);

    let cumulativeDelay = BASE_DELAY;
    return segments.map((seg) => {
      const delay = cumulativeDelay;
      const duration = totalSweep > 0 && !seg.isEmpty
        ? Math.max((seg.sweepAngle / totalSweep) * TOTAL_DRAW_TIME, 0.4)
        : 0.4;
      cumulativeDelay += duration;
      return { delay, duration };
    });
  }, [segments]);

  const circumference = 2 * Math.PI * RADIUS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-violet-500/10"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-indigo-50/90" />

      {/* Glass overlay */}
      <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Clock className="w-6 h-6 text-violet-600" strokeWidth={2.5} />
            </div>
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
          </div>

          {/* Donut Chart */}
          <div className="flex flex-col items-center mt-4 mb-2">
            <div
              className="relative"
              style={{ width: CHART_SIZE + 48, height: CHART_SIZE + 48 }}
            >
              <svg
                viewBox={`-24 -24 ${CHART_SIZE + 48} ${CHART_SIZE + 48}`}
                width={CHART_SIZE + 48}
                height={CHART_SIZE + 48}
                className="overflow-visible"
              >
                {/* Subtle background ring */}
                <circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.06)"
                  strokeWidth={STROKE_WIDTH}
                />

                {/* Donut segments - sequential draw animation */}
                {segments.map((seg, i) => {
                  if (seg.isEmpty && totalMeals > 0) return null;
                  if (seg.sweepAngle <= 0 && totalMeals > 0) return null;

                  const segmentLength = (seg.sweepAngle / 360) * circumference;
                  const offset = (seg.startAngle / 360) * circumference;
                  const isSelected = selectedSegment === i;
                  const isDominant = i === dominantIndex && totalMeals > 0;
                  const anim = segmentAnimations[i];

                  return (
                    <motion.circle
                      key={seg.label}
                      cx={CENTER}
                      cy={CENTER}
                      r={RADIUS}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isSelected ? STROKE_WIDTH + 8 : isDominant ? STROKE_WIDTH + 4 : STROKE_WIDTH}
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        cursor: 'pointer',
                        filter: isSelected
                          ? `drop-shadow(0 0 12px ${seg.color}80)`
                          : isDominant && animationPhase === 'done'
                          ? `drop-shadow(0 0 6px ${seg.color}50)`
                          : 'none',
                      }}
                      initial={{ strokeDasharray: `0 ${circumference}`, opacity: 0.4 }}
                      animate={animationPhase !== 'waiting' ? {
                        strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
                        opacity: seg.isEmpty ? 0.3 : 1,
                      } : {
                        strokeDasharray: `0 ${circumference}`,
                        opacity: 0.4,
                      }}
                      transition={{
                        duration: anim.duration,
                        delay: anim.delay,
                        ease: [0.33, 1, 0.68, 1],
                      }}
                      onClick={() =>
                        setSelectedSegment(selectedSegment === i ? null : i)
                      }
                    />
                  );
                })}

                {/* Emoji labels positioned on the outside of each arc */}
                {segments.map((seg, i) => {
                  if (seg.isEmpty && totalMeals > 0) return null;
                  if (seg.sweepAngle <= 0 && totalMeals > 0) return null;
                  const pos = emojiPositions[i];
                  const anim = segmentAnimations[i];
                  const isSelected = selectedSegment === i;

                  return (
                    <motion.g
                      key={`emoji-${seg.label}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={animationPhase !== 'waiting' ? { opacity: 1, scale: isSelected ? 1.3 : 1 } : { opacity: 0, scale: 0 }}
                      transition={{
                        opacity: { duration: 0.4, delay: anim.delay + anim.duration * 0.5 },
                        scale: { duration: 0.5, delay: anim.delay + anim.duration * 0.5, type: 'spring', stiffness: 200, damping: 12 },
                      }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedSegment(selectedSegment === i ? null : i)}
                    >
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontSize: '20px' }}
                      >
                        {seg.emoji}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Percentage labels on the arc for segments large enough */}
                {segments.map((seg, i) => {
                  if (seg.isEmpty && totalMeals > 0) return null;
                  if (seg.percentage < 15) return null; // Only show on segments with enough space
                  const labelPos = polarToCartesian(CENTER, CENTER, RADIUS, seg.midAngle);
                  const anim = segmentAnimations[i];

                  return (
                    <motion.text
                      key={`pct-${seg.label}`}
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontWeight="800"
                      fontSize="12"
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        pointerEvents: 'none',
                      }}
                      initial={{ opacity: 0 }}
                      animate={animationPhase !== 'waiting' ? { opacity: 1 } : { opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: anim.delay + anim.duration * 0.7,
                      }}
                    >
                      {seg.percentage}%
                    </motion.text>
                  );
                })}
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ padding: 24 }}>
                <AnimatePresence mode="wait">
                  {selectedData ? (
                    <motion.div
                      key={`selected-${selectedSegment}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="text-center"
                    >
                      <span className="text-3xl">{selectedData.emoji}</span>
                      <div className="text-3xl font-black text-foreground leading-tight mt-1">
                        {selectedData.percentage}%
                      </div>
                      <div className="text-xs font-bold text-muted-foreground mt-1">
                        {selectedData.label}
                      </div>
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        {selectedData.count} {selectedData.count === 1 ? 'meal' : 'meals'}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="total"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25 }}
                      className="text-center"
                    >
                      <motion.div
                        className="text-3xl font-black text-foreground leading-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3, duration: 0.8 }}
                      >
                        {totalMeals}
                      </motion.div>
                      <motion.div
                        className="text-xs font-semibold text-muted-foreground mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.2, duration: 0.8 }}
                      >
                        meals tracked
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Legend - compact pill style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 0.6 }}
            className="grid grid-cols-2 gap-2 mt-1"
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
                  <div
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
            transition={{ delay: 5 }}
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
