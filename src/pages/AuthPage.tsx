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
  const {
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        error
      } = await signIn(email, password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error
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
          description: 'Please enter your name'
        });
        return;
      }
      const {
        error
      } = await signUp(email, password, displayName);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign up failed',
          description: error
        });
      } else {
        toast({
          title: 'Welcome to Bloat AI!',
          description: 'Your account has been created.'
        });
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome Screen
  if (view === 'welcome') {
    return <div className="min-h-screen bg-gradient-to-br from-sage via-mint to-sage-light flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] mx-auto space-y-8 animate-fade-in">
          {/* Logo Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl p-12 flex flex-col items-center justify-center">
            <img src="/bloat-ai-logo.svg" alt="Bloat AI Logo" className="w-34 h-34 object-contain mb-6" />
            
          </div>

          {/* Content on Background */}
          <div className="px-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome Back!
            </h1>
            <p className="text-base text-gray-700 mb-10 leading-relaxed">
              Your gut's best friend is here. Track what you eat, discover what bloats, and feel amazing again. Let's do this!
            </p>

            {/* Buttons */}
            <div className="space-y-4">
              <Button onClick={() => setView('signin')} className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Sign In
              </Button>
              <Button onClick={() => setView('signup')} variant="outline" className="w-full h-16 bg-white hover:bg-gray-50 text-gray-900 border-[3px] border-gray-900 rounded-full text-lg font-semibold transition-all duration-300">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>;
  }

  // Sign In Screen
  if (view === 'signin') {
    return <div className="min-h-screen bg-gradient-to-br from-sage via-mint to-sage-light flex items-center justify-center p-6">
        <div className="w-full max-w-[480px] mx-auto space-y-6 animate-fade-in">
          {/* Top Navigation */}
          <div className="flex items-center justify-between px-2">
            <button onClick={() => setView('welcome')} className="text-gray-800 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button onClick={() => setView('signup')} className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">
              Register
            </button>
          </div>

          {/* Logo Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl p-10 flex flex-col items-center justify-center">
            <img src="/bloat-ai-logo.svg" alt="Bloat AI Logo" className="w-23 h-23 object-contain mb-6 " />
            
            
          </div>

          {/* Form Card */}
          <div className="rounded-[2rem] shadow-2xl p-8 bg-[#d1d1d1]">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Sign In
            </h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              Ready to feel lighter? Your personalized bloat tracker is waiting. Let's get you back on track!
            </p>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="relative">
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 px-4 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all" required />
              </div>

              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 px-4 pr-12 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-right">
                <button type="button" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                {isLoading ? <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span> : 'Sign In'}
              </Button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>;
  }

  // Sign Up Screen
  return <div className="min-h-screen bg-gradient-to-br from-lavender via-peach to-lavender-light flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] mx-auto space-y-6 animate-fade-in">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-2">
          <button onClick={() => setView('welcome')} className="text-gray-800 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button onClick={() => setView('signin')} className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">
            Sign In
          </button>
        </div>

        {/* Logo Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 flex flex-col items-center justify-center">
          <img src="/bloat-ai-logo.svg" alt="Bloat AI Logo" className="w-23 h-23 object-contain mb-6 " />
          
          
        </div>

        {/* Form Card */}
        <div className="rounded-[2rem] shadow-2xl p-8 bg-peach-light my-[52px] py-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Sign Up
          </h2>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Join thousands feeling better every day. Your gut health journey starts here!
          </p>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="relative">
              <Input type="text" placeholder="Your Name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-14 px-4 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all" required />
            </div>

            <div className="relative">
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 px-4 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all" required />
            </div>

            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} className="h-14 px-4 pr-12 text-base rounded-2xl border-gray-200 focus:border-sage bg-gray-50 focus:bg-white placeholder:text-gray-400 transition-all" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
              {isLoading ? <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span> : 'Sign Up'}
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>;
}