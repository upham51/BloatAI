import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { GlassCard } from '@/components/auth/GlassCard';
import { PremiumInput } from '@/components/auth/PremiumInput';
import { PremiumButton } from '@/components/auth/PremiumButton';
import { User, Mail, Lock, Shield, ArrowLeft, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setIsLoading(false);
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { error } = await signUp(email, password, name);

      if (error) {
        toast.error(error);
        setIsLoading(false);
        return;
      }

      toast.success('Account created successfully!');
      // Navigation will happen automatically via useEffect when user state updates
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  // Check if passwords match for visual feedback
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
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
        ease: "easeOut" as const,
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
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-6"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-6"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, rotate: -5 }}
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
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              Create your account
            </h1>
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Start your healthy journey today
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <PremiumInput
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
              error={errors.name}
              autoComplete="name"
            />

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
              placeholder="Create a password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password}
              showPasswordToggle
              autoComplete="new-password"
            />

            <PremiumInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              icon={<Shield className="w-5 h-5" />}
              error={errors.confirmPassword}
              showPasswordToggle
              isValid={passwordsMatch}
              autoComplete="new-password"
            />

            {/* Submit button */}
            <div className="pt-3">
              <PremiumButton type="submit" isLoading={isLoading}>
                Create Account
              </PremiumButton>
            </div>

            {/* Terms notice */}
            <motion.p
              variants={itemVariants}
              className="text-xs text-center text-gray-500 pt-2"
            >
              By creating an account, you agree to our{' '}
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </motion.p>
          </motion.form>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="relative my-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-500">
                Already have an account?
              </span>
            </div>
          </motion.div>

          {/* Sign in link */}
          <motion.div variants={itemVariants} className="text-center">
            <Link
              to="/signin"
              className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <span>Sign in instead</span>
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
