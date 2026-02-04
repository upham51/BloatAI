import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { GlassCard } from '@/components/auth/GlassCard';
import { PremiumInput } from '@/components/auth/PremiumInput';
import { PremiumButton } from '@/components/auth/PremiumButton';
import { Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';

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
      setIsLoading(false);
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
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }

      toast.success('Welcome back!');
      // Navigation will happen automatically via useEffect when user state updates
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Invalid email or password');
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

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AuthBackground />

      <GlassCard>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back button */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-8"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50" />

              {/* Logo container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <img
                  src="/bloat-ai-logo.svg"
                  alt="Bloat AI"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Continue your healthy journey
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <PremiumInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email}
              autoComplete="email"
            />

            <PremiumInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password}
              showPasswordToggle
              autoComplete="current-password"
            />

            {/* Forgot password */}
            <motion.div
              variants={itemVariants}
              className="flex justify-end"
            >
              <motion.button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-400 hover:text-indigo-400 font-medium transition-colors duration-300"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                Forgot password?
              </motion.button>
            </motion.div>

            {/* Submit button */}
            <div className="pt-2">
              <PremiumButton type="submit" isLoading={isLoading}>
                Sign In
              </PremiumButton>
            </div>
          </motion.form>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-500">
                New to Bloat AI?
              </span>
            </div>
          </motion.div>

          {/* Sign up link */}
          <motion.div variants={itemVariants} className="text-center">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <span>Create an account</span>
              <motion.svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </motion.svg>
            </Link>
          </motion.div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
