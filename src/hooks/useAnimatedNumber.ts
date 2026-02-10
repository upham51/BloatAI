import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to target using requestAnimationFrame.
 * Lightweight alternative to framer-motion useSpring for simple countup.
 */
export function useAnimatedNumber(
  target: number,
  duration: number = 600,
  delay: number = 0,
): number {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    const timeout = setTimeout(() => {
      startTime.current = null;

      const animate = (timestamp: number) => {
        if (startTime.current === null) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for a satisfying deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(Math.round(eased * target));

        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        }
      };

      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, delay]);

  return current;
}
