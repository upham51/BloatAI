import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from './useAdmin';

type SubscriptionStatus = 'active' | 'trial' | 'inactive' | 'loading';

export function useSubscription() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<Date | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setStatus('inactive');
        return;
      }

      // Admins always have access
      if (isAdmin) {
        setStatus('active');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan, subscription_ends_at, trial_ends_at')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking subscription:', error);
          setStatus('inactive');
          return;
        }

        const now = new Date();
        
        // Check trial
        if (data.subscription_status === 'trial' && data.trial_ends_at) {
          const trialEnd = new Date(data.trial_ends_at);
          setTrialEndsAt(trialEnd);
          if (trialEnd > now) {
            setStatus('trial');
            setPlan(data.subscription_plan);
            return;
          }
        }

        // Check active subscription
        if (data.subscription_status === 'active' && data.subscription_ends_at) {
          const subEnd = new Date(data.subscription_ends_at);
          setSubscriptionEndsAt(subEnd);
          if (subEnd > now) {
            setStatus('active');
            setPlan(data.subscription_plan);
            return;
          }
        }

        // No valid subscription
        setStatus('inactive');
        setPlan(null);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setStatus('inactive');
      }
    }

    checkSubscription();
  }, [user, isAdmin]);

  const hasAccess = status === 'active' || status === 'trial' || isAdmin;

  return {
    status,
    hasAccess,
    trialEndsAt,
    subscriptionEndsAt,
    plan,
    isLoading: status === 'loading',
  };
}
