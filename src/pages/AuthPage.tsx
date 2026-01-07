import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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

  const { signIn, signUp } = useAuth();
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

  // Welcome Screen
  if (view === 'welcome') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-sage via-mint to-sage-light">
        <div className="flex flex-col min-h-screen w-full max-w-[480px] mx-auto">
          {/* Top Section - White Card with Logo */}
          <div className="px-8 pt-16 pb-8">
            <div className="bg-white rounded-[2rem] shadow-2xl py-12 px-8 flex flex-col items-center">
              <img
                src="/bloat-ai-logo.svg"
                alt="Bloat AI Logo"
                className="w-32 h-32 object-contain mb-6"
              />
              <h2 className="text-4xl font-bold text-gray-900 text-center">
                BLOAT AI
              </h2>
            </div>
          </div>

          {/* Bottom Section - Content on Colored Background */}
          <div className="flex-1 px-8 pb-16 flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome Back! 🎉
            </h1>
            <p className="text-lg text-gray-800 mb-12 leading-relaxed">
              Your gut's best friend is here. Track what you eat, discover what bloats, and feel amazing again. Let's do this!
            </p>

            {/* Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => setView('signin')}
                className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </Button>
              <Button
                onClick={() => setView('signup')}
                variant="outline"
                className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border-[3px] border-gray-900 rounded-full text-xl font-semibold transition-all duration-300"
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
      <div className="min-h-screen w-full bg-gradient-to-br from-sage via-mint to-sage-light">
        <div className="flex flex-col min-h-screen w-full max-w-[480px] mx-auto">
          {/* Top Section - White Card with Logo */}
          <div className="px-8 pt-16 pb-6 relative">
            <button
              onClick={() => setView('welcome')}
              className="absolute left-4 top-4 text-gray-900 hover:text-gray-700 transition-colors z-10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="bg-white rounded-[2rem] shadow-2xl py-12 px-8 flex flex-col items-center">
              <img
                src="/bloat-ai-logo.svg"
                alt="Bloat AI Logo"
                className="w-28 h-28 object-contain mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                Welcome
              </h2>
              <p className="text-gray-600 text-center text-sm">
                Ready to feel lighter? Your personalized bloat tracker is waiting.
              </p>
            </div>
          </div>

          {/* Bottom Section - Form on Colored Background */}
          <div className="flex-1 px-8 pb-16">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8">
              <div className="text-right mb-6">
                <button
                  onClick={() => setView('signup')}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Register
                </button>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Sign In
              </h2>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Ready to feel lighter? Your personalized bloat tracker is waiting. Let's get you back on track!
              </p>

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 px-5 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 px-5 pr-12 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
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
                  className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
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

              <p className="text-xs text-gray-400 text-center mt-8">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Screen
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-lavender via-peach to-lavender-light">
      <div className="flex flex-col min-h-screen w-full max-w-[480px] mx-auto">
        {/* Top Section - White Card with Logo */}
        <div className="px-8 pt-16 pb-6 relative">
          <button
            onClick={() => setView('welcome')}
            className="absolute left-4 top-4 text-gray-900 hover:text-gray-700 transition-colors z-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="bg-white rounded-[2rem] shadow-2xl py-12 px-8 flex flex-col items-center">
            <img
              src="/bloat-ai-logo.svg"
              alt="Bloat AI Logo"
              className="w-28 h-28 object-contain mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Join Us
            </h2>
            <p className="text-gray-600 text-center text-sm">
              Your gut health journey starts here. Feel amazing again!
            </p>
          </div>
        </div>

        {/* Bottom Section - Form on Colored Background */}
        <div className="flex-1 px-8 pb-16">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8">
            <div className="text-right mb-6">
              <button
                onClick={() => setView('signin')}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Sign Up
            </h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Join thousands feeling better every day. Your gut health journey starts here!
            </p>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-14 px-5 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 px-5 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 px-5 pr-12 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all"
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
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
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

            <p className="text-xs text-gray-400 text-center mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
