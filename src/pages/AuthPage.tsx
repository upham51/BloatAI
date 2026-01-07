import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type AuthView = 'welcome' | 'signin' | 'signup';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Google sign in failed',
          description: error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Google sign in failed',
        description: 'An error occurred',
      });
    }
  };

  // Welcome Screen
  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage via-mint to-sage-light flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center animate-fade-in">
          {/* Left Side - Logo Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-12 lg:p-16 flex flex-col items-center justify-center min-h-[500px]">
            <img
              src="/bloat-ai-logo.svg"
              alt="Bloat AI Logo"
              className="w-32 h-32 lg:w-40 lg:h-40 object-contain mb-8"
            />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center">
              BLOAT AI
            </h2>
          </div>

          {/* Right Side - Welcome Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-10 lg:p-14 min-h-[500px] flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Welcome
            </h1>
            <p className="text-base lg:text-lg text-gray-600 mb-10 leading-relaxed">
              Your gut's best friend is here. Track what you eat, discover what bloats, and feel amazing again. Let's do this!
            </p>

            {/* Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => setView('signin')}
                className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setView('signup')}
                variant="outline"
                className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign In Screen
  if (view === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage via-mint to-sage-light flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-stretch animate-fade-in">
          {/* Left Side - Logo Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-12 lg:p-16 flex flex-col items-center justify-center min-h-[600px] relative">
            <button
              onClick={() => setView('welcome')}
              className="absolute left-8 top-8 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <img
              src="/bloat-ai-logo.svg"
              alt="Bloat AI Logo"
              className="w-32 h-32 lg:w-40 lg:h-40 object-contain mb-8"
            />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
              Welcome
            </h2>
            <p className="text-gray-600 text-center max-w-xs">
              Ready to feel lighter? Your personalized bloat tracker is waiting.
            </p>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-10 lg:p-14 min-h-[600px] flex flex-col justify-center relative">
            <div className="text-right mb-6">
              <button
                onClick={() => setView('signup')}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Register
              </button>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Sign In
            </h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Enter your credentials to access your account
            </p>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 px-4 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 px-4 pr-12 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-8 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-full text-base font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                Continue with Google
              </Button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-peach to-lavender-light flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-stretch animate-fade-in">
        {/* Left Side - Logo Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-12 lg:p-16 flex flex-col items-center justify-center min-h-[650px] relative">
          <button
            onClick={() => setView('welcome')}
            className="absolute left-8 top-8 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src="/bloat-ai-logo.svg"
            alt="Bloat AI Logo"
            className="w-32 h-32 lg:w-40 lg:h-40 object-contain mb-8"
          />
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">
            Join Us
          </h2>
          <p className="text-gray-600 text-center max-w-xs">
            Your gut health journey starts here. Feel amazing again!
          </p>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-10 lg:p-14 min-h-[650px] flex flex-col justify-center relative">
          <div className="text-right mb-6">
            <button
              onClick={() => setView('signin')}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Sign Up
          </h2>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Create your account to start tracking your gut health
          </p>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="relative">
              <Input
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-14 px-4 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 px-4 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 px-4 pr-12 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-8 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-full text-base font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              Continue with Google
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
