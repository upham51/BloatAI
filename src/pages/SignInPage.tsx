import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthInput } from '@/components/auth/AuthInput';
import { GradientButton } from '@/components/auth/GradientButton';
import { WaveBackground } from '@/components/auth/WaveBackground';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <Link
          to="/signup"
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Sign Up</span>
        </Link>
      </div>

      {/* Content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-md mx-auto relative">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src="/bloat-ai-logo.svg"
              alt="Bloat AI"
              className="w-20 h-20 object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-bold text-black text-center mb-8">
            Sign In
          </h1>

          {/* Wave Divider */}
          <div className="relative h-32 mb-8">
            <WaveBackground position="top" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              error={errors.email}
              autoComplete="email"
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-black transition-colors underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="pt-4">
              <GradientButton type="submit" isLoading={isLoading}>
                Sign In
              </GradientButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
