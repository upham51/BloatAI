import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ children, isLoading, disabled, variant = 'primary', className, ...props }, ref) => {
    const isDisabled = disabled || isLoading;

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
        'hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400',
        'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-purple-500/30',
        'text-white font-semibold'
      ),
      secondary: cn(
        'bg-white/[0.05] border-2 border-white/10',
        'hover:bg-white/[0.1] hover:border-white/20',
        'text-white font-medium'
      ),
      ghost: cn(
        'bg-transparent hover:bg-white/[0.05]',
        'text-gray-400 hover:text-white font-medium'
      ),
    };

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'relative w-full py-4 px-6 rounded-xl',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
          'overflow-hidden group',
          variants[variant],
          className
        )}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        {...props}
      >
        {/* Animated shimmer effect */}
        {variant === 'primary' && !isDisabled && (
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.2) 50%, transparent 75%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Button content */}
        <span className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
              <span>Please wait...</span>
            </>
          ) : (
            <>
              <span>{children}</span>
              <motion.svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </motion.svg>
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
