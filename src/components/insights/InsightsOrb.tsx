import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface InsightsOrbProps {
  /** Average bloating score (1-5). Lower is better. */
  bloatLevel?: number;
  /** Size of the orb in pixels */
  size?: number;
  /** Whether to show the label */
  showLabel?: boolean;
  className?: string;
}

/**
 * A dynamic abstract orb that visualizes the user's bloat status.
 * - Smooth and green/teal when bloating is low (1-2)
 * - Slightly irregular and amber when moderate (3)
 * - Jagged and red when high (4-5)
 * - Neutral iridescent when no data
 */
export function InsightsOrb({
  bloatLevel,
  size = 120,
  showLabel = false,
  className = ''
}: InsightsOrbProps) {
  const { colors, morphPath, glowColor, pulseIntensity, label } = useMemo(() => {
    // No data - show iridescent neutral state
    if (bloatLevel === undefined || bloatLevel === 0) {
      return {
        colors: {
          primary: '#a78bfa', // violet
          secondary: '#818cf8', // indigo
          tertiary: '#c4b5fd', // light violet
        },
        morphPath: 'smooth',
        glowColor: 'rgba(167, 139, 250, 0.4)',
        pulseIntensity: 1,
        label: 'Building data...',
      };
    }

    // Great (1-1.5)
    if (bloatLevel <= 1.5) {
      return {
        colors: {
          primary: '#10b981', // emerald
          secondary: '#14b8a6', // teal
          tertiary: '#6ee7b7', // light emerald
        },
        morphPath: 'smooth',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        pulseIntensity: 0.8,
        label: 'Feeling great',
      };
    }

    // Good (1.5-2.5)
    if (bloatLevel <= 2.5) {
      return {
        colors: {
          primary: '#14b8a6', // teal
          secondary: '#22d3ee', // cyan
          tertiary: '#5eead4', // light teal
        },
        morphPath: 'gentle',
        glowColor: 'rgba(20, 184, 166, 0.45)',
        pulseIntensity: 0.9,
        label: 'Looking good',
      };
    }

    // Moderate (2.5-3.5)
    if (bloatLevel <= 3.5) {
      return {
        colors: {
          primary: '#f59e0b', // amber
          secondary: '#fb923c', // orange
          tertiary: '#fcd34d', // light amber
        },
        morphPath: 'wavy',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        pulseIntensity: 1.1,
        label: 'Some bloating',
      };
    }

    // High (3.5-4.5)
    if (bloatLevel <= 4.5) {
      return {
        colors: {
          primary: '#f97316', // orange
          secondary: '#ef4444', // red
          tertiary: '#fbbf24', // yellow accent
        },
        morphPath: 'irregular',
        glowColor: 'rgba(249, 115, 22, 0.45)',
        pulseIntensity: 1.2,
        label: 'High bloating',
      };
    }

    // Severe (4.5+)
    return {
      colors: {
        primary: '#ef4444', // red
        secondary: '#dc2626', // dark red
        tertiary: '#f87171', // light red
      },
      morphPath: 'jagged',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      pulseIntensity: 1.3,
      label: 'Severe bloating',
    };
  }, [bloatLevel]);

  // Generate SVG paths based on morphPath type
  const getPaths = () => {
    const halfSize = size / 2;
    const r = halfSize * 0.7; // base radius

    switch (morphPath) {
      case 'smooth':
        // Perfect circle blob
        return {
          outer: `M ${halfSize} ${halfSize - r}
                  C ${halfSize + r * 0.55} ${halfSize - r} ${halfSize + r} ${halfSize - r * 0.55} ${halfSize + r} ${halfSize}
                  C ${halfSize + r} ${halfSize + r * 0.55} ${halfSize + r * 0.55} ${halfSize + r} ${halfSize} ${halfSize + r}
                  C ${halfSize - r * 0.55} ${halfSize + r} ${halfSize - r} ${halfSize + r * 0.55} ${halfSize - r} ${halfSize}
                  C ${halfSize - r} ${halfSize - r * 0.55} ${halfSize - r * 0.55} ${halfSize - r} ${halfSize} ${halfSize - r} Z`,
          inner: `M ${halfSize} ${halfSize - r * 0.6}
                  C ${halfSize + r * 0.35} ${halfSize - r * 0.6} ${halfSize + r * 0.6} ${halfSize - r * 0.35} ${halfSize + r * 0.6} ${halfSize}
                  C ${halfSize + r * 0.6} ${halfSize + r * 0.35} ${halfSize + r * 0.35} ${halfSize + r * 0.6} ${halfSize} ${halfSize + r * 0.6}
                  C ${halfSize - r * 0.35} ${halfSize + r * 0.6} ${halfSize - r * 0.6} ${halfSize + r * 0.35} ${halfSize - r * 0.6} ${halfSize}
                  C ${halfSize - r * 0.6} ${halfSize - r * 0.35} ${halfSize - r * 0.35} ${halfSize - r * 0.6} ${halfSize} ${halfSize - r * 0.6} Z`,
        };

      case 'gentle':
        // Slightly organic blob
        return {
          outer: `M ${halfSize} ${halfSize - r * 0.95}
                  C ${halfSize + r * 0.6} ${halfSize - r * 0.9} ${halfSize + r * 0.95} ${halfSize - r * 0.5} ${halfSize + r * 0.9} ${halfSize + r * 0.1}
                  C ${halfSize + r * 0.85} ${halfSize + r * 0.6} ${halfSize + r * 0.5} ${halfSize + r * 0.95} ${halfSize} ${halfSize + r * 0.92}
                  C ${halfSize - r * 0.55} ${halfSize + r * 0.9} ${halfSize - r * 0.9} ${halfSize + r * 0.55} ${halfSize - r * 0.88} ${halfSize}
                  C ${halfSize - r * 0.85} ${halfSize - r * 0.5} ${halfSize - r * 0.55} ${halfSize - r * 0.9} ${halfSize} ${halfSize - r * 0.95} Z`,
          inner: `M ${halfSize} ${halfSize - r * 0.55}
                  C ${halfSize + r * 0.35} ${halfSize - r * 0.52} ${halfSize + r * 0.55} ${halfSize - r * 0.3} ${halfSize + r * 0.52} ${halfSize + r * 0.05}
                  C ${halfSize + r * 0.5} ${halfSize + r * 0.35} ${halfSize + r * 0.3} ${halfSize + r * 0.55} ${halfSize} ${halfSize + r * 0.53}
                  C ${halfSize - r * 0.32} ${halfSize + r * 0.52} ${halfSize - r * 0.52} ${halfSize + r * 0.32} ${halfSize - r * 0.5} ${halfSize}
                  C ${halfSize - r * 0.5} ${halfSize - r * 0.3} ${halfSize - r * 0.32} ${halfSize - r * 0.52} ${halfSize} ${halfSize - r * 0.55} Z`,
        };

      case 'wavy':
        // More irregular blob
        return {
          outer: `M ${halfSize} ${halfSize - r * 0.9}
                  C ${halfSize + r * 0.7} ${halfSize - r * 0.8} ${halfSize + r * 0.85} ${halfSize - r * 0.3} ${halfSize + r * 0.8} ${halfSize + r * 0.15}
                  C ${halfSize + r * 0.75} ${halfSize + r * 0.65} ${halfSize + r * 0.4} ${halfSize + r * 0.9} ${halfSize - r * 0.1} ${halfSize + r * 0.85}
                  C ${halfSize - r * 0.6} ${halfSize + r * 0.8} ${halfSize - r * 0.85} ${halfSize + r * 0.4} ${halfSize - r * 0.82} ${halfSize - r * 0.1}
                  C ${halfSize - r * 0.78} ${halfSize - r * 0.55} ${halfSize - r * 0.5} ${halfSize - r * 0.85} ${halfSize} ${halfSize - r * 0.9} Z`,
          inner: `M ${halfSize} ${halfSize - r * 0.5}
                  C ${halfSize + r * 0.4} ${halfSize - r * 0.45} ${halfSize + r * 0.5} ${halfSize - r * 0.15} ${halfSize + r * 0.45} ${halfSize + r * 0.1}
                  C ${halfSize + r * 0.42} ${halfSize + r * 0.38} ${halfSize + r * 0.22} ${halfSize + r * 0.52} ${halfSize - r * 0.05} ${halfSize + r * 0.48}
                  C ${halfSize - r * 0.35} ${halfSize + r * 0.45} ${halfSize - r * 0.5} ${halfSize + r * 0.22} ${halfSize - r * 0.47} ${halfSize - r * 0.05}
                  C ${halfSize - r * 0.45} ${halfSize - r * 0.32} ${halfSize - r * 0.28} ${halfSize - r * 0.5} ${halfSize} ${halfSize - r * 0.5} Z`,
        };

      case 'irregular':
        // Noticeably irregular blob
        return {
          outer: `M ${halfSize + r * 0.1} ${halfSize - r * 0.85}
                  C ${halfSize + r * 0.6} ${halfSize - r * 0.9} ${halfSize + r * 0.9} ${halfSize - r * 0.4} ${halfSize + r * 0.75} ${halfSize + r * 0.2}
                  C ${halfSize + r * 0.65} ${halfSize + r * 0.7} ${halfSize + r * 0.25} ${halfSize + r * 0.95} ${halfSize - r * 0.2} ${halfSize + r * 0.8}
                  C ${halfSize - r * 0.65} ${halfSize + r * 0.65} ${halfSize - r * 0.9} ${halfSize + r * 0.25} ${halfSize - r * 0.75} ${halfSize - r * 0.2}
                  C ${halfSize - r * 0.6} ${halfSize - r * 0.65} ${halfSize - r * 0.35} ${halfSize - r * 0.85} ${halfSize + r * 0.1} ${halfSize - r * 0.85} Z`,
          inner: `M ${halfSize + r * 0.05} ${halfSize - r * 0.48}
                  C ${halfSize + r * 0.35} ${halfSize - r * 0.5} ${halfSize + r * 0.52} ${halfSize - r * 0.22} ${halfSize + r * 0.42} ${halfSize + r * 0.12}
                  C ${halfSize + r * 0.35} ${halfSize + r * 0.4} ${halfSize + r * 0.12} ${halfSize + r * 0.55} ${halfSize - r * 0.12} ${halfSize + r * 0.45}
                  C ${halfSize - r * 0.38} ${halfSize + r * 0.38} ${halfSize - r * 0.52} ${halfSize + r * 0.12} ${halfSize - r * 0.42} ${halfSize - r * 0.12}
                  C ${halfSize - r * 0.35} ${halfSize - r * 0.38} ${halfSize - r * 0.2} ${halfSize - r * 0.48} ${halfSize + r * 0.05} ${halfSize - r * 0.48} Z`,
        };

      case 'jagged':
      default:
        // Very irregular, spiky blob
        return {
          outer: `M ${halfSize + r * 0.15} ${halfSize - r * 0.8}
                  L ${halfSize + r * 0.5} ${halfSize - r * 0.6}
                  C ${halfSize + r * 0.85} ${halfSize - r * 0.5} ${halfSize + r * 0.9} ${halfSize - r * 0.1} ${halfSize + r * 0.7} ${halfSize + r * 0.3}
                  L ${halfSize + r * 0.55} ${halfSize + r * 0.5}
                  C ${halfSize + r * 0.35} ${halfSize + r * 0.85} ${halfSize - r * 0.1} ${halfSize + r * 0.9} ${halfSize - r * 0.35} ${halfSize + r * 0.75}
                  L ${halfSize - r * 0.55} ${halfSize + r * 0.55}
                  C ${halfSize - r * 0.85} ${halfSize + r * 0.35} ${halfSize - r * 0.85} ${halfSize - r * 0.15} ${halfSize - r * 0.65} ${halfSize - r * 0.4}
                  L ${halfSize - r * 0.4} ${halfSize - r * 0.6}
                  C ${halfSize - r * 0.2} ${halfSize - r * 0.85} ${halfSize} ${halfSize - r * 0.9} ${halfSize + r * 0.15} ${halfSize - r * 0.8} Z`,
          inner: `M ${halfSize + r * 0.08} ${halfSize - r * 0.45}
                  L ${halfSize + r * 0.28} ${halfSize - r * 0.35}
                  C ${halfSize + r * 0.48} ${halfSize - r * 0.28} ${halfSize + r * 0.52} ${halfSize - r * 0.05} ${halfSize + r * 0.4} ${halfSize + r * 0.18}
                  L ${halfSize + r * 0.3} ${halfSize + r * 0.3}
                  C ${halfSize + r * 0.2} ${halfSize + r * 0.5} ${halfSize - r * 0.05} ${halfSize + r * 0.52} ${halfSize - r * 0.2} ${halfSize + r * 0.42}
                  L ${halfSize - r * 0.32} ${halfSize + r * 0.3}
                  C ${halfSize - r * 0.48} ${halfSize + r * 0.2} ${halfSize - r * 0.48} ${halfSize - r * 0.08} ${halfSize - r * 0.38} ${halfSize - r * 0.22}
                  L ${halfSize - r * 0.22} ${halfSize - r * 0.35}
                  C ${halfSize - r * 0.12} ${halfSize - r * 0.48} ${halfSize} ${halfSize - r * 0.52} ${halfSize + r * 0.08} ${halfSize - r * 0.45} Z`,
        };
    }
  };

  const paths = getPaths();

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: [0.6, 0.9, 0.6],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 3 * pulseIntensity,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: glowColor }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10"
      >
        <defs>
          {/* Outer gradient */}
          <radialGradient id={`orbGradient-${bloatLevel}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors.tertiary} />
            <stop offset="50%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </radialGradient>

          {/* Inner highlight gradient */}
          <radialGradient id={`orbHighlight-${bloatLevel}`} cx="35%" cy="25%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Shadow filter */}
          <filter id={`orbShadow-${bloatLevel}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={colors.primary} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Main blob shape */}
        <motion.path
          d={paths.outer}
          fill={`url(#orbGradient-${bloatLevel})`}
          filter={`url(#orbShadow-${bloatLevel})`}
          animate={{
            scale: [1, 1.02, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 4 * pulseIntensity,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />

        {/* Inner highlight blob */}
        <motion.path
          d={paths.inner}
          fill={`url(#orbHighlight-${bloatLevel})`}
          animate={{
            scale: [1, 1.05, 1],
            x: [-2, 2, -2],
            y: [-1, 1, -1],
          }}
          transition={{
            duration: 3 * pulseIntensity,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
        />

        {/* Sparkle/shine dot */}
        <motion.circle
          cx={size * 0.35}
          cy={size * 0.32}
          r={size * 0.04}
          fill="white"
          opacity={0.8}
          animate={{
            opacity: [0.5, 0.9, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Optional label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="text-xs font-bold text-muted-foreground">{label}</span>
        </motion.div>
      )}
    </div>
  );
}
