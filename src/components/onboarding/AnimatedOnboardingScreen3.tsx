import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Camera, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

type AnimationStage = 'idle' | 'camera' | 'snap' | 'card' | 'flip' | 'insight';

export function AnimatedOnboardingScreen3() {
  const [stage, setStage] = useState<AnimationStage>('idle');
  const [insightRevealed, setInsightRevealed] = useState(false);

  useEffect(() => {
    const sequence = [
      { stage: 'camera' as AnimationStage, delay: 800 },
      { stage: 'snap' as AnimationStage, delay: 1500 },
      { stage: 'card' as AnimationStage, delay: 500 },
      { stage: 'flip' as AnimationStage, delay: 800 },
      { stage: 'insight' as AnimationStage, delay: 600 },
    ];

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const runSequence = () => {
      if (currentIndex < sequence.length) {
        timeoutId = setTimeout(() => {
          setStage(sequence[currentIndex].stage);
          if (sequence[currentIndex].stage === 'insight') {
            setInsightRevealed(true);
          }
          currentIndex++;
          runSequence();
        }, sequence[currentIndex].delay);
      } else {
        // Loop the animation
        timeoutId = setTimeout(() => {
          setStage('idle');
          setInsightRevealed(false);
          currentIndex = 0;
          runSequence();
        }, 4000);
      }
    };

    runSequence();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-mint/5 to-sky/10">

      {/* Sparkle particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 3,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          >
            <Sparkles className="w-4 h-4 text-sage" />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 space-y-12">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-mint via-sky to-sage bg-clip-text text-transparent">
            Track Once, Understand Forever
          </h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            10 seconds to log. A lifetime of knowing your body.
          </motion.p>
        </motion.div>

        {/* Animation container */}
        <div className="relative w-full max-w-sm h-96 flex items-center justify-center">

          {/* Camera viewfinder */}
          <AnimatePresence mode="wait">
            {(stage === 'idle' || stage === 'camera') && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Camera frame */}
                <motion.div
                  className="relative w-72 h-72 bg-gradient-to-br from-muted/20 to-muted/40 rounded-3xl border-4 border-sage/40 overflow-hidden shadow-elevated backdrop-blur-sm"
                  animate={{
                    borderColor: stage === 'camera' ? ['hsl(160, 35%, 75%)', 'hsl(160, 35%, 65%)', 'hsl(160, 35%, 75%)'] : 'hsl(160, 35%, 75%)'
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  {/* Mock food photo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-peach via-coral to-peach/80 rounded-3xl shadow-soft" />
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-6xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      🥗
                    </motion.div>
                  </div>

                  {/* Corner brackets */}
                  {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
                    <motion.div
                      key={i}
                      className={`absolute ${pos} w-8 h-8`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut'
                      }}
                    >
                      <div className={`absolute ${pos.includes('top') ? 'top-0' : 'bottom-0'} ${pos.includes('left') ? 'left-0' : 'right-0'} w-8 h-1 bg-sage`} />
                      <div className={`absolute ${pos.includes('top') ? 'top-0' : 'bottom-0'} ${pos.includes('left') ? 'left-0' : 'right-0'} w-1 h-8 bg-sage`} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Camera button */}
                <motion.button
                  className="mt-8 w-20 h-20 bg-sage rounded-full shadow-elevated flex items-center justify-center border-4 border-background"
                  animate={stage === 'camera' ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <Camera className="w-8 h-8 text-foreground" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash effect */}
          {stage === 'snap' && (
            <motion.div
              className="absolute inset-0 bg-white rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}

          {/* Card with data */}
          <AnimatePresence mode="wait">
            {(stage === 'card' || stage === 'flip' || stage === 'insight') && (
              <motion.div
                key="card"
                className="absolute"
                initial={{ opacity: 0, scale: 0.5, rotateY: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: stage === 'flip' || stage === 'insight' ? 180 : 0
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
                  rotateY: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: 1000
                }}
              >
                {/* Card front (meal info) */}
                <motion.div
                  className="w-80 h-96 bg-background rounded-3xl shadow-elevated border-2 border-sage/30 p-6 flex flex-col"
                  style={{
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d'
                  }}
                  animate={{
                    rotateY: stage === 'flip' || stage === 'insight' ? 180 : 0
                  }}
                >
                  {/* Card content - front */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      className="w-32 h-32 bg-gradient-to-br from-peach via-coral to-peach/80 rounded-3xl shadow-soft flex items-center justify-center text-6xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      🥗
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-center space-y-2"
                    >
                      <h3 className="text-2xl font-bold text-foreground">Caesar Salad</h3>
                      <p className="text-sm text-muted-foreground">Today at 12:30 PM</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex flex-wrap gap-2 justify-center"
                    >
                      {['Lettuce', 'Parmesan', 'Croutons', 'Dressing'].map((ingredient, i) => (
                        <motion.span
                          key={ingredient}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                          className="px-3 py-1 bg-sage/20 rounded-full text-xs font-medium text-foreground"
                        >
                          {ingredient}
                        </motion.span>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Sparkles className="w-4 h-4 text-sage" />
                      <span>Logged in 8 seconds</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Card back (insights) */}
                <motion.div
                  className="absolute inset-0 w-80 h-96 bg-gradient-to-br from-sky/20 to-mint/20 backdrop-blur-sm rounded-3xl shadow-elevated border-2 border-sky/40 p-6 flex flex-col"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Card content - back */}
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={insightRevealed ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                      className="text-6xl"
                    >
                      💡
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={insightRevealed ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-2xl font-bold text-sky text-center"
                    >
                      Instant Insights
                    </motion.h3>

                    {/* Insight items */}
                    <div className="space-y-3 w-full">
                      {[
                        { icon: TrendingUp, text: 'High fiber content detected', color: 'text-mint' },
                        { icon: AlertCircle, text: 'Contains dairy (your trigger)', color: 'text-coral' },
                        { icon: Sparkles, text: 'Best eaten before 2 PM', color: 'text-sage' }
                      ].map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={insightRevealed ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center gap-3 p-3 bg-background/50 rounded-xl backdrop-blur-sm"
                        >
                          <insight.icon className={`w-5 h-5 ${insight.color}`} />
                          <span className="text-sm font-medium text-foreground">{insight.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={insightRevealed ? { opacity: 1 } : {}}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="text-xs text-muted-foreground text-center"
                    >
                      Powered by your tracking history
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom caption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          <p className="text-xl font-medium text-sky">
            ✨ One photo. Endless understanding.
          </p>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-4 px-6 py-4 bg-mint/10 border-2 border-mint/30 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto"
          >
            {[
              { label: 'Snap', icon: '📸', duration: '2s' },
              { label: 'AI Analyzes', icon: '🤖', duration: '3s' },
              { label: 'Learn Patterns', icon: '🧠', duration: '5s' },
              { label: 'Live Better', icon: '✨', duration: 'Forever' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + i * 0.2, duration: 0.5 }}
                className="flex flex-col items-center gap-1 min-w-[80px]"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeInOut'
                  }}
                  className="text-2xl"
                >
                  {step.icon}
                </motion.div>
                <span className="text-xs font-semibold text-foreground">{step.label}</span>
                <span className="text-[10px] text-mint font-medium">{step.duration}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
