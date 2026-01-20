import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Week grid - 4 weeks x 7 days
const WEEKS = 4;
const DAYS = 7;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Pattern: Tuesdays and Fridays are trigger days (indices 1 and 4)
const TRIGGER_PATTERN = [1, 4]; // Tuesday, Friday

// Generate calendar data
const generateCalendar = () => {
  const days = [];
  let dayNumber = 1;

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < DAYS; day++) {
      const isTriggerDay = TRIGGER_PATTERN.includes(day);
      days.push({
        week,
        day,
        dayNumber,
        dayName: DAY_LABELS[day],
        isTriggerDay,
        delay: week * 0.15 + day * 0.05
      });
      dayNumber++;
    }
  }

  return days;
};

export function AnimatedOnboardingScreen2() {
  const [showPattern, setShowPattern] = useState(false);
  const [highlightedDay, setHighlightedDay] = useState<number | null>(null);
  const calendar = generateCalendar();

  useEffect(() => {
    // Start pattern reveal
    const timer = setTimeout(() => {
      setShowPattern(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showPattern) {
      // Sequentially highlight trigger days
      const triggers = calendar.filter(d => d.isTriggerDay);
      let currentIndex = 0;

      const highlightInterval = setInterval(() => {
        if (currentIndex < triggers.length) {
          setHighlightedDay(triggers[currentIndex].dayNumber);
          currentIndex++;
        } else {
          // Reset and loop
          currentIndex = 0;
          setHighlightedDay(null);
          setTimeout(() => {
            setHighlightedDay(triggers[0].dayNumber);
          }, 500);
        }
      }, 800);

      return () => clearInterval(highlightInterval);
    }
  }, [showPattern, calendar]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-lavender/5 to-mint/10">

      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 100 + Math.random() * 150,
              height: 100 + Math.random() * 150,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? 'hsl(270, 40%, 85%)' : 'hsl(165, 50%, 82%)'
              } 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2
            }}
          />
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-lavender via-mint to-lavender bg-clip-text text-transparent">
            Your Body Speaks in Patterns
          </h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Notice something? Your discomfort isn't random.
          </motion.p>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-3 mb-4">
            {DAY_LABELS.map((label, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                className="text-center text-sm font-medium text-muted-foreground"
              >
                {label}
              </motion.div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-3">
            {calendar.map((dayInfo) => {
              const isHighlighted = highlightedDay === dayInfo.dayNumber;
              const shouldGlow = showPattern && dayInfo.isTriggerDay;

              return (
                <motion.div
                  key={dayInfo.dayNumber}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.6 + dayInfo.delay,
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                  className="relative aspect-square"
                >
                  {/* Day cell background */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 flex items-center justify-center"
                    animate={{
                      borderColor: shouldGlow
                        ? isHighlighted
                          ? 'hsl(270, 40%, 65%)'
                          : 'hsl(270, 40%, 75%)'
                        : 'hsl(220, 15%, 85%)',
                      backgroundColor: shouldGlow
                        ? isHighlighted
                          ? 'hsl(270, 40%, 85%)'
                          : 'hsl(270, 40%, 92%)'
                        : 'hsl(30, 20%, 98%)',
                      scale: isHighlighted ? 1.1 : 1
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <motion.span
                      className="text-base font-semibold"
                      animate={{
                        color: shouldGlow
                          ? 'hsl(270, 40%, 40%)'
                          : 'hsl(220, 15%, 50%)',
                        scale: isHighlighted ? 1.15 : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {dayInfo.dayNumber}
                    </motion.span>
                  </motion.div>

                  {/* Glow effect for trigger days */}
                  {shouldGlow && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'radial-gradient(circle, hsl(270, 40%, 75%) 0%, transparent 70%)',
                        filter: 'blur(12px)'
                      }}
                      animate={{
                        opacity: isHighlighted ? [0.3, 0.6, 0.3] : [0, 0.3, 0],
                        scale: isHighlighted ? [1, 1.4, 1] : [1, 1.2, 1]
                      }}
                      transition={{
                        duration: isHighlighted ? 1.5 : 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}

                  {/* Pulse ring for highlighted day */}
                  {isHighlighted && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-2xl border-2 border-lavender"
                          initial={{ opacity: 0, scale: 1 }}
                          animate={{
                            opacity: [0.6, 0],
                            scale: [1, 1.5]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: 'easeOut'
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Pain icon for trigger days */}
                  {shouldGlow && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 bg-coral rounded-full flex items-center justify-center shadow-soft"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 1.5 + dayInfo.delay,
                        duration: 0.5,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                    >
                      <motion.span
                        className="text-xs"
                        animate={isHighlighted ? {
                          rotate: [0, -10, 10, -10, 0],
                        } : {}}
                        transition={{
                          duration: 0.5,
                          ease: 'easeInOut'
                        }}
                      >
                        😣
                      </motion.span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Pattern insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showPattern ? 1 : 0, y: showPattern ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-6">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-lavender/20 rounded-full border-2 border-lavender/40"
              animate={{
                borderColor: ['hsl(270, 40%, 40%)', 'hsl(270, 40%, 70%)', 'hsl(270, 40%, 40%)']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <span className="text-2xl">📅</span>
              <span className="font-semibold text-foreground">Tuesday</span>
            </motion.div>

            <span className="text-2xl text-muted-foreground">+</span>

            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-lavender/20 rounded-full border-2 border-lavender/40"
              animate={{
                borderColor: ['hsl(270, 40%, 40%)', 'hsl(270, 40%, 70%)', 'hsl(270, 40%, 40%)']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3
              }}
            >
              <span className="text-2xl">📅</span>
              <span className="font-semibold text-foreground">Friday</span>
            </motion.div>
          </div>

          <motion.p
            className="text-xl font-medium text-lavender"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            ✨ You're not broken. You're just not random.
          </motion.p>
        </motion.div>

        {/* Bottom caption */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 px-6 py-4 bg-lavender/10 border-2 border-lavender/30 rounded-2xl backdrop-blur-sm max-w-lg"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-3xl"
          >
            🧠
          </motion.div>
          <p className="text-sm font-medium text-foreground">
            <span className="text-lavender font-semibold">BloatAI learns</span> your body's unique rhythm. Your pattern might be different—and that's okay.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
