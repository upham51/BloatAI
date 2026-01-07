import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import WaveBackground from '@/components/auth/WaveBackground';
import BloatAILogo from '@/components/auth/BloatAILogo';

type AuthScreen = 'welcome' | 'auth';

export default function AuthPage() {
  const [screen, setScreen] = useState<AuthScreen>('welcome');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Sign in failed',
            description: error,
          });
        } else {
          navigate('/dashboard');
        }
      } else {
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
          toast({
            variant: 'destructive',
            title: 'Sign up failed',
            description: error,
          });
        } else {
          toast({
            title: 'Welcome to Bloat AI!',
            description: 'Your account has been created.',
          });
          navigate('/dashboard');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome Screen
  if (screen === 'welcome') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white">
        <WaveBackground />

        <div className="relative z-10 flex flex-col items-center justify-between min-h-screen px-6 py-12">
          {/* Logo at top */}
          <div className="mt-12 animate-fade-in">
            <BloatAILogo size="xl" showText={true} />
          </div>

          {/* Welcome content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
            <h1 className="text-4xl font-bold text-foreground mb-4 animate-slide-up">
              Welcome
            </h1>
            <p className="text-lg text-muted-foreground animate-slide-up delay-100">
              Track your gut health journey with AI-powered insights
            </p>
          </div>

          {/* Continue button at bottom */}
          <button
            onClick={() => setScreen('auth')}
            className="group flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-200"
          >
            <span className="text-lg font-medium">Continue</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Auth Screen (Sign in / Sign up)
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <WaveBackground />

      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8">
        {/* Logo at top */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <BloatAILogo size="lg" showText={true} />
        </div>

        {/* Auth Card */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-sage/10 animate-slide-up">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Sign in' : 'Sign up'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-12 h-14 text-base rounded-2xl border-sage/20 focus:border-sage"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="demo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 text-base rounded-2xl border-sage/20 focus:border-sage"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 text-base rounded-2xl border-sage/20 focus:border-sage"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        rememberMe
                          ? 'bg-primary border-primary'
                          : 'border-sage/40 group-hover:border-sage'
                      }`}
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      {rememberMe && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-foreground/70 group-hover:text-foreground transition-colors">
                      Remember Me
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-coral hover:text-coral/80 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an Account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/60 text-center mt-8 max-w-xs mx-auto">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
