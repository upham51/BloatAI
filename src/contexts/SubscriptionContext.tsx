import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

type SubscriptionStatus = 'active' | 'inactive' | 'loading';

export const STRIPE_PLANS = {
  monthly: {
    price_id: "price_1SihQELn3mHLHbNAg7k2bm2R",
    product_id: "prod_Tg3XKLLW1XjpRQ",
    name: "Monthly",
    price: 9.99,
    interval: "month"
  },
  annual: {
    price_id: "price_1SihTILn3mHLHbNAl52h18FO",
    product_id: "prod_Tg3apW7wlhwTdR",
    name: "Annual",
    price: 29.99,
    interval: "year"
  }
} as const;

interface SubscriptionContextType {
  status: SubscriptionStatus;
  hasAccess: boolean;
  subscriptionEnd: Date | null;
  plan: 'monthly' | 'annual' | null;
  isLoading: boolean;
  isInitialLoad: boolean;
  isCheckingOut: boolean;
  isBypassActive: boolean;
  startCheckout: (planType: 'monthly' | 'annual') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);
  const [plan, setPlan] = useState<'monthly' | 'annual' | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Check if paywall bypass is active via environment variable
  const isBypassActive = import.meta.env.VITE_BYPASS_PAYWALL === 'true';

  const checkSubscription = useCallback(async () => {
    // Wait for auth and admin status to be determined
    if (authLoading || adminLoading) {
      return;
    }

    if (!user || !session) {
      setStatus('inactive');
      setIsInitialLoad(false);
      return;
    }

    // If paywall bypass is active, grant all authenticated users free access
    if (isBypassActive) {
      setStatus('active');
      setPlan('annual'); // Grandfathered into free annual plan
      setIsInitialLoad(false);
      console.log('🎉 Paywall bypass active - granting free access');
      return;
    }

    // Admins always have access
    if (isAdmin) {
      setStatus('active');
      setPlan('annual');
      setIsInitialLoad(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setStatus('inactive');
        setIsInitialLoad(false);
        return;
      }

      if (data.subscribed) {
        setStatus('active');
        setPlan(data.plan);
        setSubscriptionEnd(data.subscription_end ? new Date(data.subscription_end) : null);
      } else {
        setStatus('inactive');
        setPlan(null);
        setSubscriptionEnd(null);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setStatus('inactive');
    } finally {
      setIsInitialLoad(false);
    }
  }, [user, session, isAdmin, authLoading, adminLoading, isBypassActive]);

  useEffect(() => {
    checkSubscription();

    // Auto-refresh every 60 seconds
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async (planType: 'monthly' | 'annual') => {
    if (!session) return;

    setIsCheckingOut(true);
    try {
      const priceId = STRIPE_PLANS[planType].price_id;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  const hasAccess = status === 'active' || isAdmin || isBypassActive;

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        hasAccess,
        subscriptionEnd,
        plan,
        isLoading: status === 'loading',
        isInitialLoad,
        isCheckingOut,
        isBypassActive,
        startCheckout,
        openCustomerPortal,
        refreshSubscription: checkSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
