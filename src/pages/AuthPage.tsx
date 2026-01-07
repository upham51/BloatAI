import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { haptics } from '@/lib/haptics';

type AuthView = 'welcome' | 'signin' | 'signup';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.medium();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        haptics.error();
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error,
        });
      } else {
        haptics.success();
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.medium();
    setIsLoading(true);

    try {
      if (!displayName.trim()) {
        toast({
          variant: 'destructive',
          title: 'Name required',
          description: 'Please enter your name',
        });
        return;
      }
      const { error } = await signUp(email, password, displayName);
      if (error) {
        haptics.error();
        toast({
          variant: 'destructive',
          title: 'Sign up failed',
          description: error,
        });
      } else {
        haptics.success();
        toast({
          title: 'Welcome to Bloat AI!',
          description: 'Your account has been created.',
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome Screen
  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint via-sage-light to-lavender/30 flex items-center justify-center p-5">
        <div className="w-full max-w-md animate-fade-in">
          {/* Main Card */}
          <div className="bg-card/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/30">
            {/* Logo Section - Cream/White Background */}
            <div className="bg-background p-12 flex flex-col items-center">
              <div className="w-28 h-28 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-6xl">🌿</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight text-center">
                BLOAT AI
              </h1>
            </div>

            {/* Welcome Section - Dark Green Background */}
            <div
              className="p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--sage-dark)), hsl(var(--primary)))'
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome Back!
              </h2>
              <p className="text-white/90 text-base leading-relaxed mb-8">
                Your gut's best friend is here. Track what you eat, discover what bloats, and feel amazing again. Let's do this!
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    haptics.light();
                    setView('signin');
                  }}
                  className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background rounded-full text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    haptics.light();
                    setView('signup');
                  }}
                  className="w-full h-14 bg-background hover:bg-background/90 text-foreground rounded-full text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign In Screen
  if (view === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint via-sage-light to-lavender/30 flex items-center justify-center p-5">
        <div className="w-full max-w-md animate-fade-in">
          {/* Main Card */}
          <div className="bg-card/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/30">
            {/* Logo Section */}
            <div className="bg-background p-8 flex flex-col items-center">
              <div className="w-20 h-20 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">🌿</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight text-center">
                BLOAT AI
              </h1>
            </div>

            {/* Form Section - Dark Green Background */}
            <div
              className="p-8"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--sage-dark)), hsl(var(--primary)))'
              }}
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Sign In
              </h2>

              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 px-4 text-base rounded-2xl bg-background/95 border-0 placeholder:text-muted-foreground text-foreground"
                  required
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 px-4 text-base rounded-2xl bg-background/95 border-0 placeholder:text-muted-foreground text-foreground"
                  required
                  minLength={6}
                />

                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background rounded-full text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <p className="text-xs text-white/70 text-center mt-6">
                By continuing, you agree to our Terms of Service
                <br />
                and Privacy Policy
              </p>

              <button
                onClick={() => {
                  haptics.light();
                  setView('welcome');
                }}
                className="w-full text-sm text-white/80 hover:text-white transition-colors mt-4"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint via-sage-light to-lavender/30 flex items-center justify-center p-5">
      <div className="w-full max-w-md animate-fade-in">
        {/* Main Card */}
        <div className="bg-card/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/30">
          {/* Logo Section */}
          <div className="bg-background p-8 flex flex-col items-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl">🌿</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight text-center">
              BLOAT AI
            </h1>
          </div>

          {/* Form Section - Dark Green Background */}
          <div
            className="p-8"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--sage-dark)), hsl(var(--primary)))'
            }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Sign Up
            </h2>

            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-14 px-4 text-base rounded-2xl bg-background/95 border-0 placeholder:text-muted-foreground text-foreground"
                required
              />

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 px-4 text-base rounded-2xl bg-background/95 border-0 placeholder:text-muted-foreground text-foreground"
                required
              />

              <Input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 px-4 text-base rounded-2xl bg-background/95 border-0 placeholder:text-muted-foreground text-foreground"
                required
                minLength={6}
              />

              <Button
                type="submit"
                className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background rounded-full text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>

            <p className="text-xs text-white/70 text-center mt-6">
              By continuing, you agree to our Terms of Service
              <br />
              and Privacy Policy
            </p>

            <button
              onClick={() => {
                haptics.light();
                setView('welcome');
              }}
              className="w-full text-sm text-white/80 hover:text-white transition-colors mt-4"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
