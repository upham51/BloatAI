import { forwardRef, useState, InputHTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  icon?: ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
  isValid?: boolean;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, icon, error, showPasswordToggle, isValid, type = 'text', className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Label */}
        <motion.label
          className={cn(
            'block text-sm font-medium mb-2 transition-colors duration-300',
            isFocused ? 'text-white' : 'text-gray-400',
            error && 'text-red-400'
          )}
          animate={{ x: isFocused ? 4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>

        {/* Input container */}
        <div className="relative group">
          {/* Glow effect on focus */}
          <motion.div
            className="absolute -inset-0.5 rounded-xl opacity-0 blur-sm"
            style={{
              background: error
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(220, 38, 38, 0.5))'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5))',
            }}
            animate={{ opacity: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Input wrapper */}
          <div
            className={cn(
              'relative flex items-center rounded-xl border-2 transition-all duration-300',
              'bg-white/[0.03] backdrop-blur-xl',
              isFocused && !error && 'border-indigo-500/50 bg-white/[0.05]',
              !isFocused && !error && 'border-white/10 hover:border-white/20',
              error && 'border-red-500/50 bg-red-500/[0.03]'
            )}
          >
            {/* Icon */}
            {icon && (
              <motion.div
                className={cn(
                  'pl-4 transition-colors duration-300',
                  isFocused ? 'text-indigo-400' : 'text-gray-500',
                  error && 'text-red-400'
                )}
                animate={{ scale: isFocused ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}

            {/* Input field */}
            <input
              ref={ref}
              type={inputType}
              className={cn(
                'w-full px-4 py-4 bg-transparent text-white placeholder-gray-500',
                'focus:outline-none text-base font-medium',
                'autofill:bg-transparent autofill:text-white',
                icon && 'pl-3',
                (showPasswordToggle || isValid !== undefined) && 'pr-12',
                className
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />

            {/* Password toggle / Valid check */}
            <div className="absolute right-4 flex items-center gap-2">
              {isValid && !error && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-green-400"
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}

              {showPasswordToggle && (
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'text-gray-500 hover:text-gray-300 transition-colors duration-200',
                    'focus:outline-none focus:text-indigo-400'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showPassword ? 'hide' : 'show'}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

PremiumInput.displayName = 'PremiumInput';
