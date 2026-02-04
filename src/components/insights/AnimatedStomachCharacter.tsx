import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
}

// Premium SVG-based animated character - no heavy video files!
// Designed to load instantly while looking like a $5M Pixar character

export function AnimatedStomachCharacter({ healthScore }: AnimatedStomachCharacterProps) {
  const characterState = useMemo(() => {
    if (healthScore >= 70) return 'happy';
    if (healthScore >= 31) return 'moderate';
    return 'strained';
  }, [healthScore]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: '268px',
        height: '268px',
      }}
    >
      <AnimatePresence mode="wait">
        {characterState === 'happy' && <HappyGuttie key="happy" />}
        {characterState === 'moderate' && <ModerateGuttie key="moderate" />}
        {characterState === 'strained' && <StrainedGuttie key="strained" />}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HAPPY GUTTIE (70-100) - Dancing, celebrating, living their best life!
// ============================================================================
function HappyGuttie() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          {/* Premium gradient for the body */}
          <linearGradient id="happyBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="happyBodyShadow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          {/* Sparkle gradient */}
          <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          {/* Cheek blush */}
          <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dancing body with squash and stretch */}
        <motion.g
          animate={{
            y: [0, -8, 0, -4, 0],
            scaleX: [1, 0.95, 1.05, 0.98, 1],
            scaleY: [1, 1.08, 0.95, 1.03, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: '100px', originY: '120px' }}
        >
          {/* Shadow under character */}
          <motion.ellipse
            cx="100"
            cy="175"
            rx="50"
            ry="12"
            fill="rgba(0,0,0,0.1)"
            animate={{
              rx: [50, 45, 55, 48, 50],
              opacity: [0.1, 0.15, 0.08, 0.12, 0.1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Main body - cute blob shape */}
          <motion.path
            d="M100 30 C145 30 170 60 170 100 C170 145 150 165 100 165 C50 165 30 145 30 100 C30 60 55 30 100 30"
            fill="url(#happyBodyGradient)"
            stroke="#10b981"
            strokeWidth="2"
          />
          {/* Body shading for 3D effect */}
          <motion.path
            d="M100 30 C145 30 170 60 170 100 C170 145 150 165 100 165 C50 165 30 145 30 100 C30 60 55 30 100 30"
            fill="url(#happyBodyShadow)"
          />
          {/* Highlight on top */}
          <motion.ellipse
            cx="85"
            cy="55"
            rx="25"
            ry="15"
            fill="white"
            opacity="0.4"
          />

          {/* Happy squinting eyes */}
          <motion.g
            animate={{ scaleY: [1, 0.3, 1] }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            {/* Left eye - happy arc */}
            <motion.path
              d="M70 85 Q80 75 90 85"
              stroke="#065f46"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right eye - happy arc */}
            <motion.path
              d="M110 85 Q120 75 130 85"
              stroke="#065f46"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Big happy smile */}
          <motion.path
            d="M70 110 Q100 145 130 110"
            stroke="#065f46"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: [
                "M70 110 Q100 145 130 110",
                "M72 112 Q100 150 128 112",
                "M70 110 Q100 145 130 110",
              ]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Rosy cheeks */}
          <circle cx="55" cy="100" r="15" fill="url(#blushGradient)" />
          <circle cx="145" cy="100" r="15" fill="url(#blushGradient)" />

          {/* Tiny arms waving */}
          <motion.g
            animate={{ rotate: [-20, 30, -20] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '35px', originY: '100px' }}
          >
            <ellipse cx="25" cy="95" rx="12" ry="8" fill="#6ee7b7" stroke="#10b981" strokeWidth="2" />
          </motion.g>
          <motion.g
            animate={{ rotate: [20, -30, 20] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '165px', originY: '100px' }}
          >
            <ellipse cx="175" cy="95" rx="12" ry="8" fill="#6ee7b7" stroke="#10b981" strokeWidth="2" />
          </motion.g>
        </motion.g>

        {/* Sparkles around the character */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '100px', originY: '100px' }}
        >
          <Sparkle x={25} y={40} delay={0} />
          <Sparkle x={165} y={35} delay={0.3} />
          <Sparkle x={180} y={130} delay={0.6} />
          <Sparkle x={15} y={145} delay={0.9} />
        </motion.g>

        {/* Floating hearts */}
        <FloatingHeart x={160} y={50} delay={0} />
        <FloatingHeart x={35} y={60} delay={1.5} />
      </svg>
    </motion.div>
  );
}

// Sparkle component for happy state
function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      <motion.path
        d={`M${x} ${y - 8} L${x} ${y + 8} M${x - 8} ${y} L${x + 8} ${y}`}
        stroke="url(#sparkleGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.g>
  );
}

// Floating heart for happy state
function FloatingHeart({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      initial={{ y: y + 20, opacity: 0, scale: 0.5 }}
      animate={{
        y: [y + 20, y - 30],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.8],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    >
      <path
        d={`M${x} ${y + 5} C${x - 5} ${y} ${x - 10} ${y + 5} ${x} ${y + 12} C${x + 10} ${y + 5} ${x + 5} ${y} ${x} ${y + 5}`}
        fill="#f472b6"
        opacity="0.8"
      />
    </motion.g>
  );
}

// ============================================================================
// MODERATE GUTTIE (31-69) - Doing yoga, being mindful, working on themselves
// ============================================================================
function ModerateGuttie() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          {/* Calming amber gradient */}
          <linearGradient id="moderateBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="moderateBodyShadow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          {/* Zen glow */}
          <radialGradient id="zenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Zen aura glow */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="url(#zenGlow)"
          animate={{
            r: [85, 95, 85],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Breathing body animation */}
        <motion.g
          animate={{
            scaleX: [1, 1.03, 1],
            scaleY: [1, 0.97, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: '100px', originY: '120px' }}
        >
          {/* Shadow */}
          <motion.ellipse
            cx="100"
            cy="170"
            rx="45"
            ry="10"
            fill="rgba(0,0,0,0.08)"
          />

          {/* Main body */}
          <motion.path
            d="M100 35 C140 35 165 65 165 105 C165 145 145 160 100 160 C55 160 35 145 35 105 C35 65 60 35 100 35"
            fill="url(#moderateBodyGradient)"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <motion.path
            d="M100 35 C140 35 165 65 165 105 C165 145 145 160 100 160 C55 160 35 145 35 105 C35 65 60 35 100 35"
            fill="url(#moderateBodyShadow)"
          />
          {/* Highlight */}
          <ellipse cx="85" cy="60" rx="22" ry="12" fill="white" opacity="0.35" />

          {/* Peaceful closed eyes with slight movement */}
          <motion.g
            animate={{ y: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Left closed eye */}
            <path
              d="M65 90 Q80 85 95 90"
              stroke="#92400e"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right closed eye */}
            <path
              d="M105 90 Q120 85 135 90"
              stroke="#92400e"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Serene slight smile */}
          <motion.path
            d="M85 115 Q100 125 115 115"
            stroke="#92400e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Yoga pose arms - namaste position */}
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Hands together */}
            <ellipse cx="100" cy="75" rx="8" ry="12" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
            {/* Left arm */}
            <path
              d="M40 105 Q55 90 92 75"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right arm */}
            <path
              d="M160 105 Q145 90 108 75"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Small sweat drop - working on it! */}
          <motion.g
            animate={{
              y: [0, 15],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeIn',
            }}
          >
            <path
              d="M150 65 Q155 75 150 80 Q145 75 150 65"
              fill="#93c5fd"
              opacity="0.8"
            />
          </motion.g>
        </motion.g>

        {/* Floating "om" symbols */}
        <motion.text
          x="30"
          y="50"
          fontSize="16"
          fill="#fbbf24"
          opacity="0.6"
          animate={{
            y: [50, 40, 50],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ॐ
        </motion.text>
        <motion.text
          x="165"
          y="60"
          fontSize="14"
          fill="#fbbf24"
          opacity="0.6"
          animate={{
            y: [60, 50, 60],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ॐ
        </motion.text>

        {/* Tiny thought bubble - "I got this" */}
        <motion.g
          animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="155" cy="40" rx="25" ry="15" fill="white" stroke="#e5e7eb" strokeWidth="1" />
          <circle cx="140" cy="55" r="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
          <circle cx="135" cy="62" r="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
          <text x="155" y="44" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="500">
            I got this
          </text>
        </motion.g>
      </svg>
    </motion.div>
  );
}

// ============================================================================
// STRAINED GUTTIE (0-30) - Dramatically overwhelmed but still adorable!
// ============================================================================
function StrainedGuttie() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          {/* Stressed red-pink gradient */}
          <linearGradient id="strainedBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecaca" />
            <stop offset="50%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <linearGradient id="strainedBodyShadow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          {/* Sweat drop gradient */}
          <linearGradient id="sweatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Wobbling distressed body */}
        <motion.g
          animate={{
            rotate: [-3, 3, -3],
            y: [0, 2, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: '100px', originY: '120px' }}
        >
          {/* Shadow - wobbly */}
          <motion.ellipse
            cx="100"
            cy="170"
            rx="45"
            ry="10"
            fill="rgba(0,0,0,0.1)"
            animate={{
              rx: [45, 50, 45],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Main body - slightly squished */}
          <motion.path
            d="M100 40 C135 40 160 70 160 110 C160 150 140 162 100 162 C60 162 40 150 40 110 C40 70 65 40 100 40"
            fill="url(#strainedBodyGradient)"
            stroke="#ef4444"
            strokeWidth="2"
            animate={{
              d: [
                "M100 40 C135 40 160 70 160 110 C160 150 140 162 100 162 C60 162 40 150 40 110 C40 70 65 40 100 40",
                "M100 42 C138 42 162 72 162 112 C162 148 138 160 100 160 C62 160 38 148 38 112 C38 72 62 42 100 42",
                "M100 40 C135 40 160 70 160 110 C160 150 140 162 100 162 C60 162 40 150 40 110 C40 70 65 40 100 40",
              ]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.path
            d="M100 40 C135 40 160 70 160 110 C160 150 140 162 100 162 C60 162 40 150 40 110 C40 70 65 40 100 40"
            fill="url(#strainedBodyShadow)"
          />
          {/* Highlight */}
          <ellipse cx="85" cy="65" rx="20" ry="10" fill="white" opacity="0.3" />

          {/* Worried spiral eyes */}
          <motion.g
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Left eye - spiral */}
            <circle cx="75" cy="95" r="15" fill="white" stroke="#b91c1c" strokeWidth="2" />
            <motion.path
              d="M75 95 Q80 90 75 85 Q70 90 75 95 Q80 100 75 95"
              stroke="#b91c1c"
              strokeWidth="2"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '75px', originY: '95px' }}
            />
            {/* Right eye - spiral */}
            <circle cx="125" cy="95" r="15" fill="white" stroke="#b91c1c" strokeWidth="2" />
            <motion.path
              d="M125 95 Q130 90 125 85 Q120 90 125 95 Q130 100 125 95"
              stroke="#b91c1c"
              strokeWidth="2"
              fill="none"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ originX: '125px', originY: '95px' }}
            />
          </motion.g>

          {/* Wobbly distressed mouth */}
          <motion.path
            d="M75 130 Q90 138 100 130 Q110 138 125 130"
            stroke="#b91c1c"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: [
                "M75 130 Q90 138 100 130 Q110 138 125 130",
                "M75 132 Q90 140 100 132 Q110 140 125 132",
                "M75 130 Q90 138 100 130 Q110 138 125 130",
              ]
            }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Tiny arms flailing */}
          <motion.g
            animate={{ rotate: [-30, 30, -30] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '40px', originY: '105px' }}
          >
            <ellipse cx="30" cy="100" rx="10" ry="7" fill="#fca5a5" stroke="#ef4444" strokeWidth="2" />
          </motion.g>
          <motion.g
            animate={{ rotate: [30, -30, 30] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '160px', originY: '105px' }}
          >
            <ellipse cx="170" cy="100" rx="10" ry="7" fill="#fca5a5" stroke="#ef4444" strokeWidth="2" />
          </motion.g>
        </motion.g>

        {/* Multiple sweat drops */}
        <SweatDrop x={55} y={55} delay={0} />
        <SweatDrop x={145} y={60} delay={0.5} />
        <SweatDrop x={40} y={80} delay={1} />
        <SweatDrop x={160} y={85} delay={1.5} />

        {/* Stress lines */}
        <motion.g
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <line x1="45" y1="45" x2="35" y2="35" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="55" x2="28" y2="50" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          <line x1="155" y1="45" x2="165" y2="35" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          <line x1="160" y1="55" x2="172" y2="50" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Help me speech bubble */}
        <motion.g
          animate={{
            y: [0, -5, 0],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="160" cy="35" rx="28" ry="18" fill="white" stroke="#fca5a5" strokeWidth="2" />
          <circle cx="140" cy="55" r="5" fill="white" stroke="#fca5a5" strokeWidth="2" />
          <circle cx="135" cy="65" r="3" fill="white" stroke="#fca5a5" strokeWidth="2" />
          <text x="160" y="40" fontSize="11" fill="#dc2626" textAnchor="middle" fontWeight="bold">
            halp!
          </text>
        </motion.g>

        {/* Dramatic puff clouds */}
        <motion.g
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
            x: [-10, -30],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeOut',
          }}
        >
          <circle cx="35" cy="120" r="8" fill="#fecaca" />
          <circle cx="25" cy="115" r="6" fill="#fecaca" />
          <circle cx="28" cy="125" r="5" fill="#fecaca" />
        </motion.g>
        <motion.g
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0],
            x: [10, 30],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            delay: 0.75,
            ease: 'easeOut',
          }}
        >
          <circle cx="165" cy="120" r="8" fill="#fecaca" />
          <circle cx="175" cy="115" r="6" fill="#fecaca" />
          <circle cx="172" cy="125" r="5" fill="#fecaca" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

// Sweat drop component for strained state
function SweatDrop({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${y} Q${x + 4} ${y + 12} ${x} ${y + 15} Q${x - 4} ${y + 12} ${x} ${y}`}
      fill="url(#sweatGradient)"
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, 25],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}
