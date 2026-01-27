import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
      {/* Base Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-background" />

      {/* Light ambient blobs (static, no JS animation) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-primary/15 via-accent/10 to-transparent blur-2xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary/20 via-accent/10 to-transparent blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-accent/15 via-primary/10 to-transparent blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-8">
        {/* Logo (no framer-motion on boot) */}
        <div className="flex justify-center mb-4">
          <div className="relative group transition-transform duration-300 hover:scale-105 hover:rotate-3 active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-mint to-lavender rounded-[2rem] blur-2xl opacity-35 group-hover:opacity-55 transition-opacity duration-500" />
            <div className="relative premium-card p-8 rounded-[2rem]">
              <img
                src="/bloat-ai-logo.svg"
                alt="Bloat AI"
                className="w-24 h-24 object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold text-foreground/80">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Health Tracking</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-[1.1] tracking-tight">
            Gut Guardian
          </h1>

          <p className="text-lg text-foreground/60 font-semibold max-w-sm mx-auto leading-relaxed">
            Your personal companion for optimal digestive health
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('/signin')}
            className="group relative w-full px-8 py-5 rounded-[1.5rem] bg-gradient-to-r from-primary via-mint to-primary text-primary-foreground font-bold text-lg overflow-hidden shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_70px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
            }}
          >
            <span className="relative flex items-center justify-center gap-2 z-10">
              Sign In
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="group w-full px-8 py-5 rounded-[1.5rem] premium-card text-foreground font-bold text-lg border-2 border-border/30 hover:border-primary/30 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center justify-center gap-2">
              Create Account
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Feature badges with icons */}
        <div className="flex items-center justify-center gap-6 pt-6">
          {[
            { icon: Shield, label: 'Secure', color: 'text-primary' },
            { icon: Lock, label: 'Private', color: 'text-lavender' },
            { icon: Heart, label: 'Trusted', color: 'text-coral' },
          ].map((item, index) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1.5 group cursor-default transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300">
                <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-foreground/70 tracking-wide">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
