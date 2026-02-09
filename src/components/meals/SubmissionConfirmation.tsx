import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import checkmarkConfetti from '@/assets/checkmark-confetti.json';

const CONFIRMATION_PHRASES = [
  "This small decision just strengthened your future baseline.",
  "Your gut data is becoming quietly powerful.",
  "Another entry, another signal your body can work with.",
  "You're turning guesswork into something measurable.",
  "Momentum like this is what makes habits feel effortless.",
  "Your gut story is getting clearer with every check-in.",
  "This is how long-term change actually looks.",
  "Tiny, consistent entries. Big shifts over time.",
  "You just made it easier for tomorrow to feel better.",
  "Your future self will recognize this pattern.",
  "You're teaching your body, one log at a time.",
  "This is the kind of consistency most people skip.",
  "Another quiet vote for the way you want to feel.",
  "You're building evidence for what actually works for you.",
  "Your gut is getting the attention it's always needed.",
  "The more you log, the less your symptoms stay random.",
  "You're turning your gut health into a solvable problem.",
  "Patterns like these are where relief usually starts.",
  "You just invested in comfort a few days from now.",
  "This is the kind of data real change is built on.",
];

const FADE_OUT_DURATION = 0.6;
const DISPLAY_DURATION = 2500;

interface SubmissionConfirmationProps {
  show: boolean;
  onComplete: () => void;
}

export function SubmissionConfirmation({ show, onComplete }: SubmissionConfirmationProps) {
  const [isExiting, setIsExiting] = useState(false);

  const phrase = useMemo(() => {
    if (!show) return '';
    return CONFIRMATION_PHRASES[Math.floor(Math.random() * CONFIRMATION_PHRASES.length)];
  }, [show]);

  useEffect(() => {
    if (!show) {
      setIsExiting(false);
      return;
    }

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, DISPLAY_DURATION);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, DISPLAY_DURATION + FADE_OUT_DURATION * 1000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{
            duration: isExiting ? FADE_OUT_DURATION : 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ pointerEvents: 'all' }}
          aria-modal="true"
          role="dialog"
          aria-label="Meal saved confirmation"
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #1a1a1f 0%, #2a2a2e 35%, #e8e4df 100%)',
            }}
          />

          {/* Soft glow behind animation */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(52, 178, 51, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center justify-center px-8 max-w-md w-full">
            {/* Lottie animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px]"
            >
              <Lottie
                animationData={checkmarkConfetti}
                loop={false}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>

            {/* Phrase text */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.5,
              }}
              className="mt-8 text-center leading-relaxed"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                fontSize: 'clamp(1rem, 4vw, 1.175rem)',
                fontWeight: 450,
                letterSpacing: '0.01em',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              {phrase}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
