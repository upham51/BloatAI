import { Navigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { hasAccess, isInitialLoad, isBypassActive } = useSubscription();

  // Only show loading on the very first check, not on page navigations
  if (isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <>
      {isBypassActive && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            🎉 <strong>Paywall Bypass Active:</strong> All users have free access. Set VITE_BYPASS_PAYWALL="false" in .env to re-enable paywall.
          </p>
        </div>
      )}
      {children}
    </>
  );
}
