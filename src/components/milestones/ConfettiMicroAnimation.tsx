import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { haptics } from '@/lib/haptics';

interface ConfettiMicroAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
  variant?: 'burst' | 'rain' | 'sparkle';
  color?: 'rainbow' | 'gold' | 'sage' | 'celebration';
  intensity?: 'low' | 'medium' | 'high';
}

const colorPalettes = {
  rainbow: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4'],
  gold: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fef3c7'],
  sage: ['#4ade80', '#22c55e', '#10b981', '#14b8a6', '#2dd4bf'],
  celebration: ['#ec4899', '#f472b6', '#a855f7', '#8b5cf6', '#fbbf24', '#10b981'],
};

const intensityConfig = {
  low: { count: 12, duration: 0.8 },
  medium: { count: 24, duration: 1.0 },
  high: { count: 40, duration: 1.2 },
};

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  type: 'circle' | 'square' | 'star';
}

export function ConfettiMicroAnimation({
  trigger,
  onComplete,
  variant = 'burst',
  color = 'celebration',
  intensity = 'medium',
}: ConfettiMicroAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateParticles = useCallback(() => {
    const config = intensityConfig[intensity];
    const colors = colorPalettes[color];
    const types: Particle['type'][] = ['circle', 'square', 'star'];

    return Array.from({ length: config.count }, (_, i) => ({
      id: i,
      x: variant === 'burst' ? (Math.random() - 0.5) * 200 : (Math.random() - 0.5) * 100,
      y: variant === 'rain' ? -Math.random() * 100 - 50 : (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720 - 360,
      scale: 0.3 + Math.random() * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.2,
      type: types[Math.floor(Math.random() * types.length)],
    }));
  }, [variant, color, intensity]);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      setParticles(generateParticles());
      haptics.confettiBurst();

      const config = intensityConfig[intensity];
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setParticles([]);
        onComplete?.();
      }, config.duration * 1000 + 200);

      return () => clearTimeout(timer);
    }
  }, [trigger, isAnimating, generateParticles, intensity, onComplete]);

  const renderParticle = (particle: Particle) => {
    switch (particle.type) {
      case 'star':
        return (
          <svg width="8" height="8" viewBox="0 0 24 24" fill={particle.color}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'square':
        return (
          <div
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: particle.color }}
          />
        );
      default:
        return (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: particle.color }}
          />
        );
    }
  };

  const getAnimationProps = (particle: Particle) => {
    const config = intensityConfig[intensity];

    switch (variant) {
      case 'rain':
        return {
          initial: { x: particle.x, y: -50, opacity: 0, scale: 0, rotate: 0 },
          animate: {
            x: particle.x + (Math.random() - 0.5) * 50,
            y: 150,
            opacity: [0, 1, 1, 0],
            scale: [0, particle.scale, particle.scale, 0],
            rotate: particle.rotation,
          },
          transition: {
            duration: config.duration,
            delay: particle.delay,
            ease: [0.16, 1, 0.3, 1],
          },
        };
      case 'sparkle':
        return {
          initial: { x: 0, y: 0, opacity: 0, scale: 0 },
          animate: {
            x: particle.x * 0.5,
            y: particle.y * 0.5,
            opacity: [0, 1, 1, 0],
            scale: [0, particle.scale * 1.5, particle.scale, 0],
          },
          transition: {
            duration: config.duration * 0.7,
            delay: particle.delay,
            ease: "easeOut",
          },
        };
      default: // burst
        return {
          initial: { x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 },
          animate: {
            x: particle.x,
            y: particle.y,
            opacity: [0, 1, 1, 0],
            scale: [0, particle.scale, particle.scale * 0.8, 0],
            rotate: particle.rotation,
          },
          transition: {
            duration: config.duration,
            delay: particle.delay,
            ease: [0.16, 1, 0.3, 1],
          },
        };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {isAnimating &&
            particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute"
                {...getAnimationProps(particle)}
              >
                {renderParticle(particle)}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Badge reveal animation component
export function BadgeReveal({
  show,
  icon,
  title,
  color = 'gold',
  onComplete,
}: {
  show: boolean;
  icon: string;
  title: string;
  color?: 'gold' | 'sage' | 'lavender';
  onComplete?: () => void;
}) {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (show && !hasShown) {
      setHasShown(true);
      haptics.badgeReveal();
      const timer = setTimeout(() => onComplete?.(), 1500);
      return () => clearTimeout(timer);
    }
  }, [show, hasShown, onComplete]);

  const gradients = {
    gold: 'from-amber-400 via-yellow-300 to-amber-500',
    sage: 'from-sage via-mint to-sage-dark',
    lavender: 'from-purple-400 via-violet-300 to-purple-500',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          {/* Glow background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${gradients[color]} blur-xl opacity-50 rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Badge container */}
          <motion.div
            className={`relative flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r ${gradients[color]} shadow-xl`}
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Icon */}
            <motion.span
              className="text-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 10,
                delay: 0.3,
              }}
            >
              {icon}
            </motion.span>

            {/* Title */}
            <motion.span
              className="text-sm font-bold text-white drop-shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {title}
            </motion.span>
          </motion.div>

          {/* Confetti */}
          <ConfettiMicroAnimation trigger={show} variant="sparkle" color="gold" intensity="low" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Unlock animation for tier transitions
export function TierUnlockAnimation({
  show,
  tier,
  title,
  description,
  onComplete,
}: {
  show: boolean;
  tier: number;
  title: string;
  description: string;
  onComplete?: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      haptics.tierUnlock();
      const timer = setTimeout(() => setShowConfetti(true), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const tierColors = {
    1: 'from-sage to-mint',
    2: 'from-amber-400 to-orange-500',
    3: 'from-purple-400 to-violet-500',
    4: 'from-rose-400 to-pink-500',
    5: 'from-amber-300 via-yellow-400 to-amber-500',
  };

  const tierIcons = {
    1: '🔬',
    2: '🏆',
    3: '🧪',
    4: '🤖',
    5: '👑',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          {/* Central unlock card */}
          <motion.div
            className="relative mx-4 max-w-sm"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow */}
            <motion.div
              className={`absolute -inset-4 bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors] || tierColors[1]} blur-2xl opacity-40 rounded-3xl`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
              {/* Badge icon */}
              <motion.div
                className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${tierColors[tier as keyof typeof tierColors] || tierColors[1]} flex items-center justify-center shadow-lg mb-4`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                  delay: 0.2,
                }}
              >
                <span className="text-4xl">
                  {tierIcons[tier as keyof typeof tierIcons] || '✨'}
                </span>
              </motion.div>

              {/* Unlocked text */}
              <motion.div
                className={`text-center mb-2 text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors] || tierColors[1]} bg-clip-text text-transparent`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Unlocked!
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl font-bold text-center text-foreground mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {title}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-center text-muted-foreground text-sm mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {description}
              </motion.p>

              {/* Continue button */}
              <motion.button
                className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors] || tierColors[1]} text-white font-semibold shadow-lg hover:shadow-xl transition-shadow`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={onComplete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </div>

            {/* Confetti overlay */}
            <ConfettiMicroAnimation trigger={showConfetti} variant="burst" color="celebration" intensity="high" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
