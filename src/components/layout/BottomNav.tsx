import { NavLink } from 'react-router-dom';
import { Leaf, MessageSquare, Compass, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Leaf, label: 'Home' },
  { to: '/add-entry', icon: MessageSquare, label: 'Log' },
  { to: '/history', icon: Compass, label: 'History' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/20 safe-bottom">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 group',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground/50 hover:text-muted-foreground/70'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div 
                  className={cn(
                    'relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300',
                    isActive 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10' 
                      : 'group-hover:bg-muted/30'
                  )}
                >
                  {/* Soft glow effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-md" />
                  )}
                  <Icon
                    className={cn(
                      'relative w-5 h-5 transition-all duration-300',
                      isActive 
                        ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]' 
                        : 'opacity-70'
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                </div>
                <span 
                  className={cn(
                    'text-[10px] mt-1 font-medium transition-all duration-300',
                    isActive 
                      ? 'opacity-100' 
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
