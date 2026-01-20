import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

// Generate smooth sine wave path
const generateSmoothWave = (width: number, height: number, amplitude: number, frequency: number) => {
  const points: string[] = [];
  const centerY = height / 2;
  const step = 2;

  for (let x = 0; x <= width; x += step) {
    const y = centerY + Math.sin((x / width) * Math.PI * frequency) * amplitude;
    points.push(`${x},${y}`);
  }

  return `M0,${centerY} ${points.map((p, i) => {
    if (i === 0) return '';
    return `L${p}`;
  }).join(' ')}`;
};

// Generate chaotic wave path
const generateChaoticWave = (width: number, height: number, seed: number = 0) => {
  const points: string[] = [];
  const centerY = height / 2;
  const step = 3;

  // Create jagged, erratic wave using multiple frequencies and random noise
  for (let x = 0; x <= width; x += step) {
    const progress = x / width;
    const noise1 = Math.sin(progress * Math.PI * 8 + seed) * 30;
    const noise2 = Math.sin(progress * Math.PI * 3 + seed * 1.3) * 45;
    const noise3 = Math.sin(progress * Math.PI * 15 + seed * 0.7) * 20;
    const random = (Math.sin(x * 0.5 + seed) * Math.cos(x * 0.3 + seed)) * 25;

    const y = centerY + noise1 + noise2 + noise3 + random;
    points.push(`${x},${y}`);
  }

  return `M0,${centerY} ${points.map((p, i) => {
    if (i === 0) return '';
    return `L${p}`;
  }).join(' ')}`;
};

// Ghost dot positions (floating untracked meals)
const ghostDots = [
  { x: 15, y: 70, delay: 0 },
  { x: 25, y: 45, delay: 0.1 },
  { x: 35, y: 60, delay: 0.2 },
  { x: 48, y: 35, delay: 0.3 },
  { x: 58, y: 55, delay: 0.15 },
  { x: 68, y: 40, delay: 0.25 },
  { x: 78, y: 65, delay: 0.05 },
  { x: 88, y: 50, delay: 0.35 },
];

// Solid pill positions (tracked meals on wave)
const getPillPositions = (waveData: { x: number; y: number }[]) => {
  return [
    waveData[Math.floor(waveData.length * 0.15)],
    waveData[Math.floor(waveData.length * 0.25)],
    waveData[Math.floor(waveData.length * 0.35)],
    waveData[Math.floor(waveData.length * 0.48)],
    waveData[Math.floor(waveData.length * 0.58)],
    waveData[Math.floor(waveData.length * 0.68)],
    waveData[Math.floor(waveData.length * 0.78)],
    waveData[Math.floor(waveData.length * 0.88)],
  ];
};

// Calculate smooth wave positions for pills
const calculateWavePositions = (width: number, height: number) => {
  const points: { x: number; y: number }[] = [];
  const centerY = height / 2;
  const amplitude = 30;
  const frequency = 2;

  for (let x = 0; x <= width; x += 2) {
    const y = centerY + Math.sin((x / width) * Math.PI * frequency) * amplitude;
    points.push({ x, y });
  }

  return points;
};

export function AnimatedOnboardingScreen1() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isTransformed, setIsTransformed] = useState(false);
  const waveControls = useAnimation();

  const svgWidth = 800;
  const svgHeight = 300;

  const chaoticPath = generateChaoticWave(svgWidth, svgHeight);
  const smoothPath = generateSmoothWave(svgWidth, svgHeight, 30, 2);
  const wavePositions = calculateWavePositions(svgWidth, svgHeight);
  const pillPositions = getPillPositions(wavePositions);

  useEffect(() => {
    // Start animation after a brief delay
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasAnimated) {
      // Trigger the transformation
      const transformTimer = setTimeout(() => {
        setIsTransformed(true);
      }, 2000);

      return () => clearTimeout(transformTimer);
    }
  }, [hasAnimated]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-sage/20 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: 0
            }}
            animate={{
              y: [null, `${Math.random() * 100}%`],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 space-y-12">

        {/* Title - fades in first */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className={`transition-all duration-1000 ${isTransformed ? 'text-sky' : 'text-coral'}`}>
              {isTransformed ? 'Signal' : 'Noise'}
            </span>
            {' '}→{' '}
            <span className={`transition-all duration-1000 ${isTransformed ? 'text-sky' : 'text-muted-foreground'}`}>
              {isTransformed ? 'Signal' : 'Signal'}
            </span>
          </h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-md mx-auto"
            animate={{
              opacity: isTransformed ? 1 : 0.7
            }}
          >
            {isTransformed
              ? "See patterns. Predict discomfort. Take control."
              : "Random pain feels unpredictable..."}
          </motion.p>
        </motion.div>

        {/* SVG Wave Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl"
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.08))' }}
          >
            {/* Wave path */}
            <motion.path
              d={chaoticPath}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{
                stroke: 'hsl(10, 70%, 75%)',
                pathLength: 0
              }}
              animate={{
                d: isTransformed ? smoothPath : chaoticPath,
                stroke: isTransformed ? 'hsl(200, 60%, 75%)' : 'hsl(10, 70%, 75%)',
                pathLength: 1
              }}
              transition={{
                d: {
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3
                },
                stroke: {
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3
                },
                pathLength: {
                  duration: 2,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
            />

            {/* Ghost dots (untracked) - float and fade */}
            {!isTransformed && ghostDots.map((dot, i) => (
              <motion.g key={`ghost-${i}`}>
                <motion.circle
                  cx={`${dot.x}%`}
                  cy={`${dot.y}%`}
                  r="8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.3, 0.5, 0.3],
                    scale: [0, 1, 1.1, 1],
                    y: [0, -5, 5, -3],
                  }}
                  transition={{
                    duration: 2,
                    delay: dot.delay + 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                  }}
                  fill="hsl(220, 15%, 40%)"
                  className="blur-[1px]"
                />
              </motion.g>
            ))}

            {/* Solid pills (tracked) - snap to wave */}
            {ghostDots.map((dot, i) => (
              <motion.g key={`pill-${i}`}>
                {/* Pill glow effect */}
                <motion.ellipse
                  initial={{
                    cx: `${dot.x}%`,
                    cy: `${dot.y}%`,
                    rx: 0,
                    ry: 0,
                    opacity: 0
                  }}
                  animate={isTransformed ? {
                    cx: pillPositions[i].x,
                    cy: pillPositions[i].y,
                    rx: 18,
                    ry: 12,
                    opacity: 0.3
                  } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + i * 0.08,
                    ease: [0.34, 1.56, 0.64, 1] // Elastic snap
                  }}
                  fill="hsl(200, 60%, 85%)"
                  className="blur-sm"
                />

                {/* Main pill */}
                <motion.ellipse
                  initial={{
                    cx: `${dot.x}%`,
                    cy: `${dot.y}%`,
                    rx: 0,
                    ry: 0,
                    opacity: 0
                  }}
                  animate={isTransformed ? {
                    cx: pillPositions[i].x,
                    cy: pillPositions[i].y,
                    rx: 14,
                    ry: 9,
                    opacity: 1
                  } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + i * 0.08,
                    ease: [0.34, 1.56, 0.64, 1] // Elastic snap
                  }}
                  fill="hsl(200, 60%, 75%)"
                  stroke="hsl(200, 60%, 65%)"
                  strokeWidth="1.5"
                />

                {/* Snap particle effect */}
                {isTransformed && (
                  <>
                    {[...Array(6)].map((_, particleIdx) => {
                      const angle = (particleIdx / 6) * Math.PI * 2;
                      const distance = 25;
                      return (
                        <motion.circle
                          key={`particle-${i}-${particleIdx}`}
                          cx={pillPositions[i].x}
                          cy={pillPositions[i].y}
                          r="2"
                          fill="hsl(200, 60%, 85%)"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            x: [0, Math.cos(angle) * distance],
                            y: [0, Math.sin(angle) * distance],
                            scale: [1, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            delay: 0.5 + i * 0.08,
                            ease: 'easeOut'
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </motion.g>
            ))}

            {/* Breathing glow overlay on smooth wave */}
            {isTransformed && (
              <motion.path
                d={smoothPath}
                fill="none"
                stroke="hsl(200, 60%, 85%)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="blur-md"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.4, 0.6, 0.4],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  opacity: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.8
                  },
                  scale: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.8
                  }
                }}
              />
            )}
          </svg>
        </motion.div>

        {/* Track button simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: hasAnimated && !isTransformed ? 1 : 0,
            y: hasAnimated && !isTransformed ? 0 : 20,
            scale: isTransformed ? 0 : 1
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative"
        >
          <motion.button
            className="px-8 py-4 bg-sage text-foreground rounded-2xl font-semibold text-lg shadow-soft hover:shadow-medium transition-shadow"
            animate={!isTransformed ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            Track Your Meal
          </motion.button>
        </motion.div>

        {/* Bottom caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: isTransformed ? 2 : 1 }}
          className={`text-center text-xl font-medium transition-colors duration-1000 ${
            isTransformed ? 'text-sky' : 'text-muted-foreground'
          }`}
        >
          {isTransformed
            ? "✨ Don't just endure the chaos. Predict it."
            : "...until you track it."}
        </motion.p>

        {/* Insight callout - appears after transformation */}
        {isTransformed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 2.2,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="flex items-center gap-3 px-6 py-4 bg-sky/10 border-2 border-sky/30 rounded-2xl backdrop-blur-sm"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="text-3xl"
            >
              💡
            </motion.div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-sky font-semibold">See that spike?</span> That's Thursday's smoothie. Now you know.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
