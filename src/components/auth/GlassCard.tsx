import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative w-full max-w-md',
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.2))',
        }}
      />

      {/* Card border gradient */}
      <div
        className="absolute inset-0 rounded-2xl p-[1px]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        }}
      />

      {/* Glass card */}
      <div
        className={cn(
          'relative rounded-2xl p-8 md:p-10',
          'bg-white/[0.03] backdrop-blur-2xl',
          'border border-white/[0.08]',
          'shadow-2xl'
        )}
      >
        {/* Inner subtle gradient */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
