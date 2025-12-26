import { NavLink } from 'react-router-dom';
import { Leaf, Plus, Compass, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Leaf, label: 'Home' },
  { to: '/history', icon: Compass, label: 'History' },
  { to: '/add-entry', icon: Plus, label: 'Log', isCenter: true },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
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
                'flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 group',
                isActive && !isCenter
                  ? 'text-foreground'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isCenter ? (
                  /* Center FAB-style button */
                  <div 
                    className={cn(
                      'relative flex items-center justify-center w-14 h-14 -mt-6 rounded-full transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-primary via-primary to-sage-dark scale-110'
                        : 'bg-gradient-to-br from-primary/90 to-sage-dark/90 hover:scale-105'
                    )}
                    style={{
                      boxShadow: isActive
                        ? '0 8px 24px -4px hsl(var(--primary) / 0.5), 0 4px 12px -2px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.3)'
                        : '0 4px 16px -4px hsl(var(--primary) / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.2)'
                    }}
                  >
                    <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                ) : (
                  /* Regular nav items with 3D depth */
                  <div 
                    className={cn(
                      'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300',
                      isActive 
                        ? 'bg-card -translate-y-1' 
                        : 'group-hover:bg-muted/30'
                    )}
                    style={isActive ? {
                      boxShadow: '0 8px 20px -4px hsl(var(--primary) / 0.15), 0 4px 8px -2px hsl(var(--foreground) / 0.05), 0 2px 4px hsl(var(--foreground) / 0.03), inset 0 -2px 0 hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.8)'
                    } : undefined}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-lg" />
                    )}
                    <Icon
                      className={cn(
                        'relative w-5 h-5 transition-all duration-300',
                        isActive 
                          ? 'text-primary' 
                          : 'opacity-70'
                      )}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                )}
                <span 
                  className={cn(
                    'text-[10px] font-semibold tracking-wide transition-all duration-300',
                    isCenter ? 'mt-1' : 'mt-0.5',
                    isActive 
                      ? isCenter ? 'text-primary' : 'text-foreground'
                      : 'opacity-50 group-hover:opacity-70'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}