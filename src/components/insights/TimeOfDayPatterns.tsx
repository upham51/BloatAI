import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
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
  colorEnd: string;
  lightColor: string;
  textColor: string;
  glowColor: string;
}

const TIME_PERIODS: TimePeriod[] = [
  {
    label: 'Morning',
    emoji: '\u{1F305}',
    range: '6 - 11am',
    startHour: 6,
    endHour: 11,
    color: '#f59e0b',
    colorEnd: '#f97316',
    lightColor: 'rgba(245, 158, 11, 0.12)',
    textColor: 'text-amber-700',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    label: 'Afternoon',
    emoji: '\u{2600}\u{FE0F}',
    range: '12 - 5pm',
    startHour: 12,
    endHour: 17,
    color: '#f43f5e',
    colorEnd: '#e11d48',
    lightColor: 'rgba(244, 63, 94, 0.12)',
    textColor: 'text-rose-700',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  {
    label: 'Evening',
    emoji: '\u{1F306}',
    range: '6 - 9pm',
    startHour: 18,
    endHour: 21,
    color: '#8b5cf6',
    colorEnd: '#7c3aed',
    lightColor: 'rgba(139, 92, 246, 0.12)',
    textColor: 'text-violet-700',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    label: 'Night',
    emoji: '\u{1F319}',
    range: '10pm+',
    startHour: 22,
    endHour: 5,
    color: '#6366f1',
    colorEnd: '#4f46e5',
    lightColor: 'rgba(99, 102, 241, 0.12)',
    textColor: 'text-indigo-700',
    glowColor: 'rgba(99, 102, 241, 0.4)',
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

/** Animated counter that counts from 0 to target */
function AnimatedCounter({ target, delay, duration, suffix = '' }: { target: number; delay: number; duration: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionVal, target, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsub = rounded.on('change', (v) => {
      if (nodeRef.current) nodeRef.current.textContent = `${v}${suffix}`;
    });
    return () => { controls.stop(); unsub(); };
  }, [target, delay, duration, suffix, motionVal, rounded]);

  return <span ref={nodeRef}>0{suffix}</span>;
}

// Chart layout constants
const CHART_WIDTH = 320;
const CHART_HEIGHT = 200;
const BAR_AREA_TOP = 10;
const BAR_AREA_BOTTOM = CHART_HEIGHT - 4;
const BAR_MAX_HEIGHT = BAR_AREA_BOTTOM - BAR_AREA_TOP;
const BAR_COUNT = 4;
const BAR_GAP = 16;
const SIDE_PADDING = 28;
const BAR_WIDTH = (CHART_WIDTH - SIDE_PADDING * 2 - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

export function TimeOfDayPatterns({ entries }: TimeOfDayPatternsProps) {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
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
  const maxPercentage = Math.max(...periodData.map((p) => p.percentage), 1);
  const dominantIndex = periodData.reduce(
    (maxIdx, p, i, arr) => (p.percentage > arr[maxIdx].percentage ? i : maxIdx),
    0
  );

  // Start animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimationPhase('drawing'), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationPhase === 'drawing') {
      const timer = setTimeout(() => setAnimationPhase('done'), 5500);
      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  const selectedData = selectedBar !== null ? periodData[selectedBar] : null;

  // Calculate bar positions & animation timing
  const bars = useMemo(() => {
    return periodData.map((period, i) => {
      const x = SIDE_PADDING + i * (BAR_WIDTH + BAR_GAP);
      const barHeightRatio = maxPercentage > 0 ? period.percentage / maxPercentage : 0;
      const barHeight = Math.max(barHeightRatio * BAR_MAX_HEIGHT, period.percentage > 0 ? 8 : 3);
      const y = BAR_AREA_BOTTOM - barHeight;

      // Stagger: each bar gets ~1s of animation, distributed across the 5s window
      const delay = 0.4 + i * 1.0;
      const duration = 1.4;

      return { ...period, x, y, barHeight, delay, duration, index: i };
    });
  }, [periodData, maxPercentage]);

  // Grid line y positions (25%, 50%, 75%, 100%)
  const gridLines = [0.25, 0.5, 0.75, 1.0].map((pct) => ({
    y: BAR_AREA_BOTTOM - pct * BAR_MAX_HEIGHT,
    label: `${Math.round(pct * maxPercentage)}%`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] shadow-xl"
    >
      {/* Clean white card */}
      <div className="relative bg-white border border-border/40 rounded-[2rem]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-border/30 flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6 text-violet-600" strokeWidth={2.5} />
            </div>
            <div>
              <h3
                className="font-black text-foreground text-xl tracking-tight"
              >
                When Your Gut Speaks Up
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Bloating patterns by time of day
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex flex-col items-center mt-6 mb-2">
            <div className="w-full" style={{ maxWidth: CHART_WIDTH + 20 }}>
              <svg
                viewBox={`-10 -30 ${CHART_WIDTH + 20} ${CHART_HEIGHT + 90}`}
                width="100%"
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
              >
                <defs>
                  {/* Gradient definitions for each bar */}
                  {TIME_PERIODS.map((period, i) => (
                    <linearGradient key={`grad-${i}`} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={period.color} stopOpacity="1" />
                      <stop offset="100%" stopColor={period.colorEnd} stopOpacity="0.85" />
                    </linearGradient>
                  ))}
                  {/* Shimmer gradient for sweep effect */}
                  {TIME_PERIODS.map((_, i) => (
                    <linearGradient key={`shimmer-${i}`} id={`shimmer-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                      <stop offset="40%" stopColor="white" stopOpacity="0.15" />
                      <stop offset="60%" stopColor="white" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  ))}
                  {/* Glow filters */}
                  {TIME_PERIODS.map((period, i) => (
                    <filter key={`glow-${i}`} id={`barGlow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                      <feFlood floodColor={period.color} floodOpacity="0.35" result="color" />
                      <feComposite in="color" in2="blur" operator="in" result="shadow" />
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  ))}
                  {/* Rounded bar clip paths */}
                  {bars.map((bar, i) => (
                    <clipPath key={`clip-${i}`} id={`barClip-${i}`}>
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={BAR_WIDTH}
                        height={bar.barHeight}
                        rx={BAR_WIDTH / 2}
                        ry={BAR_WIDTH / 2}
                      />
                    </clipPath>
                  ))}
                </defs>

                {/* Subtle horizontal grid lines - animate in */}
                {gridLines.map((line, i) => (
                  <motion.line
                    key={`grid-${i}`}
                    x1={SIDE_PADDING - 8}
                    y1={line.y}
                    x2={CHART_WIDTH - SIDE_PADDING + 8}
                    y2={line.y}
                    stroke="currentColor"
                    className="text-border/40"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={animationPhase !== 'waiting' ? { opacity: 0.6, pathLength: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
                  />
                ))}

                {/* Baseline */}
                <motion.line
                  x1={SIDE_PADDING - 8}
                  y1={BAR_AREA_BOTTOM}
                  x2={CHART_WIDTH - SIDE_PADDING + 8}
                  y2={BAR_AREA_BOTTOM}
                  stroke="currentColor"
                  className="text-border/60"
                  strokeWidth="1.2"
                  initial={{ opacity: 0 }}
                  animate={animationPhase !== 'waiting' ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />

                {/* Bars with animations */}
                {bars.map((bar, i) => {
                  const isSelected = selectedBar === i;
                  const isDominant = i === dominantIndex && totalMeals > 0;

                  return (
                    <g key={bar.label}>
                      {/* Shadow/glow layer behind bar */}
                      <motion.rect
                        x={bar.x + 2}
                        y={BAR_AREA_BOTTOM}
                        width={BAR_WIDTH - 4}
                        rx={(BAR_WIDTH - 4) / 2}
                        ry={(BAR_WIDTH - 4) / 2}
                        fill={bar.color}
                        opacity={0}
                        initial={{ height: 0, y: BAR_AREA_BOTTOM }}
                        animate={animationPhase !== 'waiting' ? {
                          height: bar.barHeight,
                          y: bar.y,
                          opacity: isSelected ? 0.25 : isDominant && animationPhase === 'done' ? 0.15 : 0.08,
                        } : {}}
                        transition={{
                          height: { duration: bar.duration, delay: bar.delay, ease: [0.22, 1, 0.36, 1] },
                          y: { duration: bar.duration, delay: bar.delay, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.6, delay: bar.delay + bar.duration * 0.7 },
                        }}
                        style={{ filter: 'blur(8px)' }}
                      />

                      {/* Main bar */}
                      <motion.rect
                        x={bar.x}
                        y={BAR_AREA_BOTTOM}
                        width={BAR_WIDTH}
                        rx={BAR_WIDTH / 2}
                        ry={BAR_WIDTH / 2}
                        fill={`url(#barGrad-${i})`}
                        cursor="pointer"
                        initial={{ height: 0, y: BAR_AREA_BOTTOM }}
                        animate={animationPhase !== 'waiting' ? {
                          height: bar.barHeight,
                          y: bar.y,
                        } : {}}
                        transition={{
                          duration: bar.duration,
                          delay: bar.delay,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                          filter: isSelected ? `drop-shadow(0 0 10px ${bar.glowColor})` : 'none',
                        }}
                        onClick={() => setSelectedBar(selectedBar === i ? null : i)}
                        whileHover={{ scaleX: 1.08, transition: { duration: 0.2 } }}
                        whileTap={{ scaleX: 0.95 }}
                      />

                      {/* Shimmer sweep overlay */}
                      <motion.rect
                        x={bar.x}
                        y={BAR_AREA_BOTTOM}
                        width={BAR_WIDTH}
                        rx={BAR_WIDTH / 2}
                        ry={BAR_WIDTH / 2}
                        fill={`url(#shimmer-${i})`}
                        pointerEvents="none"
                        initial={{ height: 0, y: BAR_AREA_BOTTOM, opacity: 0 }}
                        animate={animationPhase !== 'waiting' ? {
                          height: bar.barHeight,
                          y: bar.y,
                          opacity: [0, 0, 0.8, 0],
                        } : {}}
                        transition={{
                          height: { duration: bar.duration, delay: bar.delay, ease: [0.22, 1, 0.36, 1] },
                          y: { duration: bar.duration, delay: bar.delay, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 1.2, delay: bar.delay + bar.duration * 0.6, ease: 'easeOut' },
                        }}
                      />

                      {/* Percentage label above bar */}
                      <motion.text
                        x={bar.x + BAR_WIDTH / 2}
                        y={bar.y - 12}
                        textAnchor="middle"
                        dominantBaseline="auto"
                        fill={bar.color}
                        fontWeight="800"
                        fontSize="13"
                        initial={{ opacity: 0, y: bar.y + 10 }}
                        animate={animationPhase !== 'waiting' ? {
                          opacity: bar.percentage > 0 ? 1 : 0.4,
                          y: bar.y - 12,
                        } : {}}
                        transition={{
                          opacity: { duration: 0.5, delay: bar.delay + bar.duration * 0.7 },
                          y: { duration: 0.6, delay: bar.delay + bar.duration * 0.6, ease: [0.16, 1, 0.3, 1] },
                        }}
                      >
                        {bar.percentage > 0 ? `${bar.percentage}%` : '-'}
                      </motion.text>

                      {/* Emoji below baseline */}
                      <motion.text
                        x={bar.x + BAR_WIDTH / 2}
                        y={BAR_AREA_BOTTOM + 22}
                        textAnchor="middle"
                        dominantBaseline="auto"
                        fontSize="18"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={animationPhase !== 'waiting' ? {
                          opacity: 1,
                          scale: isSelected ? 1.25 : 1,
                        } : {}}
                        transition={{
                          opacity: { duration: 0.4, delay: bar.delay + bar.duration * 0.5 },
                          scale: { type: 'spring', stiffness: 300, damping: 15, delay: bar.delay + bar.duration * 0.5 },
                        }}
                        cursor="pointer"
                        onClick={() => setSelectedBar(selectedBar === i ? null : i)}
                      >
                        {bar.emoji}
                      </motion.text>

                      {/* Label below emoji */}
                      <motion.text
                        x={bar.x + BAR_WIDTH / 2}
                        y={BAR_AREA_BOTTOM + 42}
                        textAnchor="middle"
                        dominantBaseline="auto"
                        fill="currentColor"
                        className="text-muted-foreground"
                        fontWeight="700"
                        fontSize="10"
                        initial={{ opacity: 0 }}
                        animate={animationPhase !== 'waiting' ? { opacity: 0.7 } : {}}
                        transition={{ duration: 0.4, delay: bar.delay + bar.duration * 0.8 }}
                      >
                        {bar.label}
                      </motion.text>

                      {/* Selection ring / highlight dot at top of bar */}
                      {isSelected && (
                        <motion.circle
                          cx={bar.x + BAR_WIDTH / 2}
                          cy={bar.y}
                          r={5}
                          fill="white"
                          stroke={bar.color}
                          strokeWidth={2.5}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        />
                      )}

                      {/* Dominant bar crown indicator - subtle pulsing dot */}
                      {isDominant && !isSelected && animationPhase === 'done' && (
                        <motion.circle
                          cx={bar.x + BAR_WIDTH / 2}
                          cy={bar.y - 2}
                          r={3}
                          fill={bar.color}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.4, 0.9, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Interactive stat row - appears after bars */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={animationPhase !== 'waiting' ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 4.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-4 gap-2 mt-2"
          >
            {periodData.map((period, i) => {
              const isSelected = selectedBar === i;
              return (
                <motion.button
                  key={period.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBar(selectedBar === i ? null : i)}
                  className={`text-center p-2.5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-gray-50 border-border/60 shadow-md'
                      : 'bg-transparent border-transparent hover:bg-gray-50/60'
                  }`}
                >
                  <div
                    className="text-base font-black"
                    style={{ color: period.color }}
                  >
                    {animationPhase !== 'waiting' ? (
                      <AnimatedCounter
                        target={period.count}
                        delay={bars[i]?.delay ?? 0.4 + i}
                        duration={bars[i]?.duration ?? 1}
                        suffix=""
                      />
                    ) : '0'}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    meals
                  </div>
                  {period.avgBloating > 0 && (
                    <div className="text-[9px] text-muted-foreground/70 font-medium mt-0.5">
                      avg {period.avgBloating}/5
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Selected segment insight */}
          <AnimatePresence>
            {selectedData && selectedBar !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-2xl bg-gray-50/80 border border-border/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{selectedData.emoji}</span>
                    <span className={`text-sm font-bold ${selectedData.textColor}`}>
                      {selectedData.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {selectedData.range}
                    </span>
                  </div>
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
            className="flex items-center justify-center gap-2 text-xs pt-4 mt-4 border-t border-border/30"
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
