import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useEffect, useState } from 'react';
import { haptics } from '@/lib/haptics';

interface MilestoneCheckmarkProps {
  isComplete: boolean;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'sage' | 'mint' | 'lavender' | 'peach' | 'gold';
  showGlow?: boolean;
  onComplete?: () => void;
  delay?: number;
}

const sizeConfig = {
  sm: { container: 24, stroke: 2, icon: 12 },
  md: { container: 32, stroke: 2.5, icon: 16 },
  lg: { container: 40, stroke: 3, icon: 20 },
};

const colorConfig = {
  sage: {
    bg: 'from-sage/20 to-sage-light/30',
    border: 'border-sage/40',
    fill: 'from-sage to-sage-dark',
    glow: 'shadow-sage/40',
    check: '#4a9d8c',
  },
  mint: {
    bg: 'from-mint/20 to-emerald-100/30',
    border: 'border-mint/40',
    fill: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-400/40',
    check: '#10b981',
  },
  lavender: {
    bg: 'from-lavender/20 to-purple-100/30',
    border: 'border-lavender/40',
    fill: 'from-purple-400 to-violet-500',
    glow: 'shadow-purple-400/40',
    check: '#a855f7',
  },
  peach: {
    bg: 'from-peach/20 to-orange-100/30',
    border: 'border-peach/40',
    fill: 'from-orange-400 to-amber-500',
    glow: 'shadow-orange-400/40',
    check: '#f59e0b',
  },
  gold: {
    bg: 'from-amber-100/30 to-yellow-100/30',
    border: 'border-amber-300/40',
    fill: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-400/50',
    check: '#eab308',
  },
};

export const MilestoneCheckmark = forwardRef<HTMLDivElement, MilestoneCheckmarkProps>(function MilestoneCheckmark(
  {
    isComplete,
    isActive = false,
    size = 'md',
    color = 'sage',
    showGlow = true,
    onComplete,
    delay = 0,
  },
  ref
) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showCheck, setShowCheck] = useState(isComplete);

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  useEffect(() => {
    if (isComplete && !hasAnimated) {
      const timer = setTimeout(() => {
        setShowCheck(true);
        setHasAnimated(true);
        haptics.milestoneComplete();
        onComplete?.();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasAnimated, delay, onComplete]);

  // SVG path for checkmark
  const checkmarkPath = "M5 12l5 5L20 7";
  const radius = (config.container - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: config.container, height: config.container }}
      ref={ref}
    >
      {/* Background circle */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} border ${colors.border}`}
        initial={false}
        animate={{
          scale: isActive && !isComplete ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isActive && !isComplete ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Glow effect for completed state */}
      <AnimatePresence>
        {showCheck && showGlow && (
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.fill} blur-md opacity-40`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 0.4 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Completed fill */}
      <AnimatePresence>
        {showCheck && (
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.fill}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Circle progress (for stroke-draw effect) */}
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${config.container} ${config.container}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <AnimatePresence>
          {showCheck && (
            <motion.circle
              cx={config.container / 2}
              cy={config.container / 2}
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: 0 }}
              exit={{ strokeDashoffset: circumference }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ opacity: 0.3 }}
            />
          )}
        </AnimatePresence>
      </svg>

      {/* Checkmark SVG */}
      <svg
        className="relative z-10"
        width={config.icon}
        height={config.icon}
        viewBox="0 0 24 24"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        <AnimatePresence>
          {showCheck ? (
            <motion.path
              d={checkmarkPath}
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{
                pathLength: { duration: 0.18, ease: [0.16, 1, 0.3, 1], delay: 0.05 },
                opacity: { duration: 0.1 },
              }}
            />
          ) : isActive ? (
            <motion.circle
              cx="12"
              cy="12"
              r="4"
              fill={colors.check}
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            <motion.circle
              cx="12"
              cy="12"
              r="3"
              fill="currentColor"
              className="text-muted-foreground/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </AnimatePresence>
      </svg>

      {/* Celebration particles */}
      <AnimatePresence>
        {showCheck && hasAnimated && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full bg-gradient-to-br ${colors.fill}`}
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.02,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

MilestoneCheckmark.displayName = 'MilestoneCheckmark';

// Timeline connector line
export function MilestoneConnector({
  isComplete,
  isActive,
  orientation = 'horizontal',
}: {
  isComplete: boolean;
  isActive: boolean;
  orientation?: 'horizontal' | 'vertical';
}) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={`relative ${isHorizontal ? 'h-0.5 flex-1 mx-1' : 'w-0.5 flex-1 my-1'}`}
    >
      {/* Background line */}
      <div className={`absolute inset-0 bg-muted/30 rounded-full`} />

      {/* Progress fill */}
      <motion.div
        className={`absolute ${isHorizontal ? 'inset-y-0 left-0' : 'inset-x-0 top-0'} bg-gradient-to-r from-sage to-mint rounded-full`}
        initial={false}
        animate={{
          [isHorizontal ? 'width' : 'height']: isComplete ? '100%' : isActive ? '50%' : '0%',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Active pulse */}
      {isActive && !isComplete && (
        <motion.div
          className={`absolute ${isHorizontal ? 'right-0 top-1/2 -translate-y-1/2' : 'bottom-0 left-1/2 -translate-x-1/2'} w-2 h-2 bg-sage rounded-full`}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
