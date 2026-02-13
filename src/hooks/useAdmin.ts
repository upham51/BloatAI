import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error checking admin role:', err);
    return false;
  }
}

export function useAdmin() {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: () => checkAdminRole(user!.id),
    enabled: !!user,
    // Cache admin status for 10 minutes to prevent duplicate DB queries
    // across AdminRoute, MealContext, SubscriptionContext etc.
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { isAdmin, isLoading };
}
