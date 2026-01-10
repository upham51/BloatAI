import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Premium page transition animations
 * Uses Framer Motion for buttery-smooth 60fps animations
 */
export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for luxury feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered container for animating children in sequence
 */
export const StaggerContainer = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Individual stagger item
 */
export const StaggerItem = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scale and fade transition for modal-like content
 */
export const ScaleTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 1.0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide from right transition for drawer/detail views
 */
export const SlideTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
