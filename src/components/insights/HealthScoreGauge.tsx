import { useMemo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface HealthScoreGaugeProps {
  avgBloating: number; // 0-5 scale
  totalMeals: number;
  lowBloatingCount: number;
  highBloatingCount?: number;
}

export function HealthScoreGauge({ avgBloating, totalMeals, lowBloatingCount, highBloatingCount = 0 }: HealthScoreGaugeProps) {
  const healthScore = useMemo(() => {
    // Convert average bloating (1-5) to health score (0-100)
    // Lower bloating = higher health score
    const bloatingScore = ((5 - avgBloating) / 4) * 100;

    // Factor in success rate (low bloating meals)
    const successRate = totalMeals > 0 ? (lowBloatingCount / totalMeals) * 100 : 0;

    // Weighted average (70% bloating score, 30% success rate)
    const composite = bloatingScore * 0.7 + successRate * 0.3;

    return Math.round(Math.max(0, Math.min(100, composite)));
  }, [avgBloating, totalMeals, lowBloatingCount]);

  const { level, orbClass, ringColor, textColor, bgColor } = useMemo(() => {
    if (healthScore >= 70) {
      return {
        level: 'Healthy',
        orbClass: 'ambient-orb-healthy',
        ringColor: '#1A4D2E', // forest
        textColor: 'text-forest',
        bgColor: 'bg-forest/10',
      };
    } else if (healthScore >= 41) {
      return {
        level: 'Moderate',
        orbClass: 'ambient-orb-moderate',
        ringColor: '#E07A5F', // burnt
        textColor: 'text-burnt',
        bgColor: 'bg-burnt/10',
      };
    } else {
      return {
        level: 'Needs Attention',
        orbClass: 'ambient-orb-alert',
        ringColor: '#C45A3F', // burnt-dark
        textColor: 'text-burnt-dark',
        bgColor: 'bg-burnt/15',
      };
    }
  }, [healthScore]);

  // Calculate weekly progress (simulated)
  const weeklyChange = useMemo(() => {
    const change = Math.round((healthScore - 50) * 0.1);
    return change;
  }, [healthScore]);

  const animatedScore = useAnimatedNumber(healthScore, 700, 200);

  const goalScore = 60;

  // SVG ring parameters
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const progress = (healthScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Ambient orb background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`w-64 h-64 ambient-orb ${orbClass} opacity-30`}
        />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-display text-xl font-bold text-charcoal">Your Gut Health Score</h3>
          <p className="text-xs text-charcoal/50 font-medium">
            Based on your bloating patterns
          </p>
        </div>

        {/* Elegant Ring Gauge */}
        <div className="relative mb-6 flex justify-center">
          <svg
            width={size}
            height={size / 2 + 20}
            viewBox={`0 0 ${size} ${size / 2 + 20}`}
            className="overflow-visible"
          >
            {/* Glow filter for the ring */}
            <defs>
              <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradient for the ring */}
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={ringColor} stopOpacity="0.6" />
                <stop offset="100%" stopColor={ringColor} stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Background track */}
            <path
              d={`M ${strokeWidth / 2 + 10} ${size / 2 + 10}
                  A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 10} ${size / 2 + 10}`}
              fill="none"
              stroke="#D4DED4"
              strokeWidth={strokeWidth - 2}
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Progress arc */}
            <motion.path
              d={`M ${strokeWidth / 2 + 10} ${size / 2 + 10}
                  A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2 - 10} ${size / 2 + 10}`}
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              filter="url(#ringGlow)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />

            {/* Glowing tip */}
            <motion.circle
              cx={strokeWidth / 2 + 10 + (progress / circumference) * (size - strokeWidth - 20)}
              cy={size / 2 + 10 - Math.sin((progress / circumference) * Math.PI) * radius}
              r={strokeWidth / 2 + 2}
              fill={ringColor}
              filter="url(#ringGlow)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            />
          </svg>

          {/* Center Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center"
            >
              <span
                className="text-5xl font-bold tabular-nums"
                style={{ color: ringColor }}
              >
                {animatedScore}
              </span>
              <div className="text-xs text-charcoal/40 font-medium">out of 100</div>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold ${bgColor} ${textColor}`}
              >
                {level}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Weekly Progress & Goal */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <span className="text-sm text-charcoal/60 font-medium">This week:</span>
            <div className="flex items-center gap-1.5">
              {weeklyChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-forest" />
              ) : (
                <TrendingDown className="w-4 h-4 text-burnt" />
              )}
              <span className={`text-sm font-bold ${weeklyChange >= 0 ? 'text-forest' : 'text-burnt'}`}>
                {weeklyChange >= 0 ? '+' : ''}{weeklyChange} points
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50">
            <span className="text-sm text-charcoal/60 font-medium">Your goal:</span>
            <span className="text-sm font-bold text-charcoal">{goalScore}+ (Low risk)</span>
          </div>
        </div>

        {/* Zone Legend */}
        <div className="flex items-center justify-center gap-5 mb-5 text-xs pt-4 border-t border-charcoal/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-burnt-dark" />
            <span className="text-charcoal/50 font-medium">0-40</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-burnt" />
            <span className="text-charcoal/50 font-medium">41-69</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-forest" />
            <span className="text-charcoal/50 font-medium">70-100</span>
          </div>
        </div>

        {/* Improvement Plan Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all ${bgColor} hover:opacity-80 tactile-press ${textColor}`}
          onClick={() => {
            console.log('View Improvement Plan clicked');
          }}
        >
          View Improvement Plan →
        </motion.button>

        {/* Score Breakdown */}
        <div className="mt-5 pt-4 border-t border-charcoal/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal/50 font-medium">Avg Bloating Score</span>
            <span className="font-bold text-charcoal">{avgBloating.toFixed(1)}/5</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal/50 font-medium">Comfortable Meals</span>
            <span className="font-bold text-charcoal">
              {lowBloatingCount}/{totalMeals} ({Math.round((lowBloatingCount / totalMeals) * 100)}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal/50 font-medium">Uncomfortable Meals</span>
            <span className="font-bold text-charcoal">
              {highBloatingCount}/{totalMeals} ({Math.round((highBloatingCount / totalMeals) * 100)}%)
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
