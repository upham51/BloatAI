import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from './useAdmin';
import { useProfile } from './useProfile';

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

export function useSubscription() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { data: userProfile } = useProfile(user?.id);
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);
  const [plan, setPlan] = useState<'monthly' | 'annual' | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const checkSubscription = useCallback(async () => {
    // Wait for auth and admin status to be determined
    if (authLoading || adminLoading) {
      return;
    }

    if (!user || !session) {
      setStatus('inactive');
      return;
    }

    // Admins and test accounts always have access
    if (isAdmin || userProfile?.test_mode) {
      setStatus('active');
      setPlan('annual');
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
    }
  }, [user, session, isAdmin, userProfile, authLoading, adminLoading]);

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

  const hasAccess = status === 'active' || isAdmin;

  return {
    status,
    hasAccess,
    subscriptionEnd,
    plan,
    isLoading: status === 'loading',
    isCheckingOut,
    startCheckout,
    openCustomerPortal,
    refreshSubscription: checkSubscription,
  };
}
