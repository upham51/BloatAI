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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/30 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-300',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
