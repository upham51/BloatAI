import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, CreditCard, ArrowRight, Leaf, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription, STRIPE_PLANS } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

const FEATURES = [
  'Unlimited meal logging with photos',
  'AI FODMAP trigger detection',
  'Personalized bloating insights',
  'Weekly trigger analysis reports',
  'Combination trigger detection',
  'Safe foods library builder',
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasAccess, isLoading, isCheckingOut, startCheckout, plan, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  // Handle checkout return
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast({
        title: 'Welcome to Bloat AI Pro!',
        description: 'Your subscription is now active. Enjoy unlimited access!',
      });
      refreshSubscription();
      navigate('/dashboard', { replace: true });
    } else if (checkoutStatus === 'cancelled') {
      toast({
        title: 'Checkout cancelled',
        description: 'No worries, you can subscribe anytime.',
      });
    }
  }, [searchParams, toast, navigate, refreshSubscription]);

  // Redirect if already subscribed
  useEffect(() => {
    if (hasAccess && !isLoading) {
      navigate('/dashboard');
    }
  }, [hasAccess, isLoading, navigate]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await startCheckout(billingPeriod);
  };

  const selectedPlan = billingPeriod === 'annual' ? STRIPE_PLANS.annual : STRIPE_PLANS.monthly;
  const annualPlan = STRIPE_PLANS.annual;
  const monthlyPlan = STRIPE_PLANS.monthly;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-mint/30 blob opacity-60 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-lavender/40 blob-2 opacity-50 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-peach/20 blob-3 opacity-40 blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            ← Back
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Bloat AI</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Unlock Your Gut Health Journey
          </h1>
          <p className="text-muted-foreground">
            Get unlimited AI-powered bloating insights and personalized trigger analysis
          </p>
        </div>

        {/* Billing Toggle - Centered above card */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center bg-muted/50 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="premium-card p-6 mb-6 relative overflow-hidden">
          {/* Badges */}
          <div className="flex gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Popular
            </span>
            {billingPeriod === 'annual' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-medium">
                Save 75%
              </span>
            )}
          </div>

          {/* Plan Name */}
          <h2 className="text-xl font-bold text-foreground mb-4">Bloat AI Pro</h2>

          {/* Price Display */}
          <div className="mb-4">
            {billingPeriod === 'annual' ? (
              <div>
                <span className="text-lg text-muted-foreground line-through mr-2">
                  ${(monthlyPlan.price * 12).toFixed(2)}
                </span>
                <span className="text-4xl font-bold text-primary">
                  ${annualPlan.price}
                </span>
                <span className="text-muted-foreground">/year</span>
                <p className="text-sm text-primary mt-1">(${(annualPlan.price / 12).toFixed(2)}/month)</p>
              </div>
            ) : (
              <div>
                <span className="text-4xl font-bold text-primary">
                  ${monthlyPlan.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-6">
            Finally understand what's causing your bloating with AI-powered FODMAP analysis and personalized insights.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleSubscribe}
            disabled={isCheckingOut || isLoading}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-sage-dark hover:from-sage-dark hover:to-primary transition-all duration-300"
            style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.35)' }}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Opening Checkout...
              </>
            ) : (
              <>
                Subscribe Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Fine Print */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {billingPeriod === 'annual' 
              ? `$${annualPlan.price}/year • Cancel anytime`
              : `$${monthlyPlan.price}/month • Cancel anytime`
            }
          </p>
        </Card>

        {/* Trust Signals */}
        <div className="flex justify-center gap-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Secure payment</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Powered by Stripe</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
