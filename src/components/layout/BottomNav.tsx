import { NavLink } from 'react-router-dom';
import { Plus, Compass, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GutIcon } from '@/components/icons/GutIcon';

const navItems = [
  { to: '/dashboard', icon: GutIcon, label: 'Home' },
  { to: '/history', icon: Compass, label: 'History' },
  { to: '/add-entry', icon: Plus, label: 'Log', isCenter: true },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
    >
      {/* Glass background with depth */}
      <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl border-t border-border/30" />

      {/* Subtle top shadow for depth */}
      <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-foreground/[0.02] to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-around h-20 max-w-md mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label, isCenter }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-2 group',
                isActive && !isCenter
                  ? 'text-foreground'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isCenter ? (
                  /* Center FAB-style button with glow and spring animation */
                  <motion.div
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.92 }}
                    animate={isActive ? { scale: 1.08, rotate: 0 } : { scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="relative flex items-center justify-center w-16 h-16 -mt-8 rounded-full bg-gradient-to-br from-primary via-emerald-500 to-teal-500"
                  >
                    {/* Animated glow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          '0 0 20px 4px hsl(var(--primary) / 0.4), 0 0 40px 8px hsl(var(--primary) / 0.2)',
                          '0 0 30px 8px hsl(var(--primary) / 0.5), 0 0 60px 12px hsl(var(--primary) / 0.3)',
                          '0 0 20px 4px hsl(var(--primary) / 0.4), 0 0 40px 8px hsl(var(--primary) / 0.2)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    {/* Outer pulse ring */}
                    <motion.div
                      className="absolute inset-[-4px] rounded-full border-2 border-primary/30"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                    {/* Button content */}
                    <motion.div
                      animate={isActive ? { rotate: 135 } : { rotate: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-10"
                    >
                      <Icon className="w-8 h-8 text-primary-foreground drop-shadow-lg" strokeWidth={2.5} />
                    </motion.div>
                  </motion.div>
                ) : (
                  /* Regular nav items with spring animations */
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? { y: -4 } : { y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    className={cn(
                      'relative flex items-center justify-center w-12 h-12 rounded-2xl',
                      isActive
                        ? 'bg-card'
                        : 'group-hover:bg-muted/30'
                    )}
                    style={isActive ? {
                      boxShadow: '0 8px 20px -4px hsl(var(--primary) / 0.15), 0 4px 8px -2px hsl(var(--foreground) / 0.05), 0 2px 4px hsl(var(--foreground) / 0.03), inset 0 -2px 0 hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.8)'
                    } : undefined}
                  >
                    {/* Active glow with fade animation */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 rounded-2xl bg-primary/10 blur-lg"
                      />
                    )}
                    <motion.div
                      animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon
                        className={cn(
                          'relative w-5 h-5',
                          isActive
                            ? 'text-primary'
                            : 'opacity-70'
                        )}
                        strokeWidth={isActive ? 2.5 : 1.5}
                      />
                    </motion.div>
                  </motion.div>
                )}
                <motion.span
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'text-[10px] font-semibold tracking-wide',
                    isCenter ? 'mt-1' : 'mt-0.5',
                    isActive
                      ? isCenter ? 'text-primary' : 'text-foreground'
                      : 'group-hover:opacity-70'
                  )}
                >
                  {label}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}