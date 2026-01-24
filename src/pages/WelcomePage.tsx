import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Lock, Heart } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Dramatic Gradient Background - Inspired by reference screenshots */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-peach-100" />

      {/* Animated Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large pink/peach blob */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-300/40 via-peach-300/30 to-orange-200/20 blur-3xl"
        />

        {/* Purple/lavender blob */}
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-300/35 via-lavender-300/25 to-blue-200/20 blur-3xl"
        />

        {/* Mint/teal accent blob */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-mint/30 via-sky/20 to-teal-200/15 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-8">
        {/* Logo with dramatic entrance */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex justify-center mb-4"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-mint to-lavender rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

            {/* Logo container */}
            <div className="relative premium-card p-8 rounded-[2rem]">
              <img
                src="/bloat-ai-logo.svg"
                alt="Bloat AI"
                className="w-24 h-24 object-contain"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Heading with stagger animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold text-foreground/80"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Health Tracking</span>
            </motion.div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-[1.1] tracking-tight">
            Gut Guardian
          </h1>

          <p className="text-lg text-foreground/60 font-semibold max-w-sm mx-auto leading-relaxed">
            Your personal companion for optimal digestive health
          </p>
        </motion.div>

        {/* CTA Buttons with premium animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signin')}
            className="group relative w-full px-8 py-5 rounded-[1.5rem] bg-gradient-to-r from-primary via-mint to-primary text-white font-bold text-lg overflow-hidden shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_70px_-12px_rgba(0,0,0,0.3)] transition-all duration-500"
            style={{
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
            }}
          >
            <span className="relative flex items-center justify-center gap-2 z-10">
              Sign In
              <motion.svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </span>

            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
            className="group w-full px-8 py-5 rounded-[1.5rem] premium-card text-foreground font-bold text-lg border-2 border-border/30 hover:border-primary/30 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-500"
          >
            <span className="flex items-center justify-center gap-2">
              Create Account
              <motion.svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </motion.svg>
            </span>
          </motion.button>
        </motion.div>

        {/* Feature badges with icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-center gap-6 pt-6"
        >
          {[
            { icon: Shield, label: 'Secure', color: 'text-primary' },
            { icon: Lock, label: 'Private', color: 'text-lavender' },
            { icon: Heart, label: 'Trusted', color: 'text-coral' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -2, scale: 1.05 }}
              className="flex flex-col items-center gap-1.5 group cursor-default"
            >
              <div className="w-10 h-10 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300">
                <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-foreground/70 tracking-wide">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
