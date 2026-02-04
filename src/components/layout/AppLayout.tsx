import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-mesh-gradient">
      <main className={cn("max-w-lg mx-auto", showNav && "pb-28")}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
