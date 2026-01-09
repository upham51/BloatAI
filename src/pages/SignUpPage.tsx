import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthInput } from '@/components/auth/AuthInput';
import { GradientButton } from '@/components/auth/GradientButton';
import { WaveBackground } from '@/components/auth/WaveBackground';
import { toast } from 'sonner';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await signUp(email, password, name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
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
          to="/signin"
          className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          <span className="font-medium">Sign In</span>
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
            Sign Up
          </h1>

          {/* Wave Divider */}
          <div className="relative h-32 mb-8">
            <WaveBackground position="top" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              error={errors.name}
              autoComplete="name"
            />

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
              autoComplete="new-password"
            />

            <div className="pt-4">
              <GradientButton type="submit" isLoading={isLoading}>
                Create Account
              </GradientButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
