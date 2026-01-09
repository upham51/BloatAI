import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WaveBackground } from '@/components/auth/WaveBackground';

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
    <div className="min-h-screen bg-white relative flex items-center justify-center px-4">
      {/* Wave at bottom */}
      <WaveBackground position="bottom" className="opacity-100" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <img
            src="/bloat-ai-logo.svg"
            alt="Bloat AI"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">
          Welcome to
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-16">
          Gut Guardian
        </h2>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/signin')}
            className="w-full px-8 py-5 rounded-[2rem] bg-black text-white font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="w-full px-8 py-5 rounded-[2rem] bg-white text-black font-semibold text-lg border-2 border-black hover:bg-black hover:text-white transition-colors duration-200"
          >
            Sign Up
          </button>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-gray-600 text-sm">
          Track your gut health journey
        </p>
      </div>
    </div>
  );
}
