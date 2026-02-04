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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom"
    >
      {/* Floating Dock Container - Glass Island */}
      <motion.div
        className="floating-dock flex items-center gap-1 px-3 py-2"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {navItems.map(({ to, icon: Icon, label, isCenter }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'relative flex items-center justify-center transition-all duration-300',
                isCenter ? 'mx-1' : ''
              )
            }
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: isCenter ? 1.1 : 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
                className="relative"
              >
                {isCenter ? (
                  /* Center FAB - Forest Green with Glow */
                  <div className="relative">
                    {/* Animated glow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-forest"
                      animate={{
                        boxShadow: isActive
                          ? [
                              '0 0 20px 4px rgba(26, 77, 46, 0.4)',
                              '0 0 28px 8px rgba(26, 77, 46, 0.5)',
                              '0 0 20px 4px rgba(26, 77, 46, 0.4)',
                            ]
                          : [
                              '0 0 12px 2px rgba(26, 77, 46, 0.2)',
                              '0 0 18px 4px rgba(26, 77, 46, 0.3)',
                              '0 0 12px 2px rgba(26, 77, 46, 0.2)',
                            ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <div
                      className={cn(
                        'relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300',
                        'bg-gradient-to-br from-forest to-forest-light',
                        'shadow-lg shadow-forest/30'
                      )}
                    >
                      <motion.div
                        animate={isActive ? { rotate: 45 } : { rotate: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  /* Regular nav items */
                  <div
                    className={cn(
                      'relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300',
                      isActive
                        ? 'bg-sage/80'
                        : 'bg-transparent hover:bg-sage/40'
                    )}
                  >
                    {/* Active glow indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute inset-0 rounded-2xl bg-forest/10"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      animate={isActive ? { y: -2 } : { y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-colors duration-300',
                          isActive
                            ? 'text-forest'
                            : 'text-charcoal/50'
                        )}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </motion.div>

                    {/* Label */}
                    <motion.span
                      animate={{
                        opacity: isActive ? 1 : 0.6,
                        y: isActive ? 0 : 2,
                      }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'text-[9px] font-bold tracking-wide mt-0.5 transition-colors duration-300',
                        isActive
                          ? 'text-forest'
                          : 'text-charcoal/50'
                      )}
                    >
                      {label}
                    </motion.span>

                    {/* Active dot indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-forest"
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </motion.div>
    </motion.nav>
  );
}
