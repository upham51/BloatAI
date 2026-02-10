import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useRecoveryMode } from '@/contexts/RecoveryModeContext';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Premium page transition animations
 * Uses Framer Motion for buttery-smooth 60fps animations
 */
export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const recoveryMode = useRecoveryMode();

  if (recoveryMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1],
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
  const recoveryMode = useRecoveryMode();

  if (recoveryMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.04,
            delayChildren: 0,
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
  const recoveryMode = useRecoveryMode();

  if (recoveryMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.2,
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
  const recoveryMode = useRecoveryMode();

  if (recoveryMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.15,
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
  const recoveryMode = useRecoveryMode();

  if (recoveryMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
