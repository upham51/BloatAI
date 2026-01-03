import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAdmin } from '@/hooks/useAdmin';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { Loader2 } from 'lucide-react';

interface OnboardingGateProps {
  children: React.ReactNode;
}

/**
 * OnboardingGate
 *
 * Ensures user completes onboarding BEFORE accessing any gated content
 * including the subscription paywall.
 *
 * Flow:
 * 1. User signs up
 * 2. OnboardingGate shows onboarding modal (mandatory)
 * 3. After completion, user proceeds to SubscriptionGate
 * 4. SubscriptionGate checks for payment
 * 5. User accesses app
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { user } = useAuth();
  const { data: userProfile, isLoading, refetch } = useProfile(user?.id);
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Skip onboarding for admins and test accounts
    if (isAdmin || userProfile?.test_mode) {
      setShowOnboarding(false);
      return;
    }

    if (userProfile && !userProfile.onboarding_completed) {
      setShowOnboarding(true);
    } else if (userProfile && userProfile.onboarding_completed) {
      setShowOnboarding(false);
    }
  }, [userProfile, isAdmin]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    refetch(); // Refresh profile to get updated onboarding status
  };

  if (isLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If onboarding not completed, show the modal and block everything else
  if (showOnboarding && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-lavender/10 to-mint/10">
        <OnboardingModal
          isOpen={showOnboarding}
          userId={user.id}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  // Onboarding completed, proceed to children (SubscriptionGate, then actual page)
  return <>{children}</>;
}
