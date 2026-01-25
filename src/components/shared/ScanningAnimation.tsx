import { useEffect, useState, useMemo, useRef } from 'react';
import { haptics } from '@/lib/haptics';

interface ScanningAnimationProps {
  imageUrl?: string | null;
  onComplete?: () => void;
}

export function ScanningAnimation({ imageUrl, onComplete }: ScanningAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastPhaseRef = useRef<number>(-1);

  const phases = useMemo(() => [
    'Initializing neural analysis',
    'Detecting food composition',
    'Analyzing nutritional data',
    'Identifying potential triggers',
    'Finalizing insights'
  ], []);

  // Start haptic pulse on mount, stop on unmount
  useEffect(() => {
    // Start the heavy pulsing haptic feedback
    haptics.startScanningPulse();

    return () => {
      // Stop scanning pulse and play completion haptic
      haptics.stopScanningPulse();
    };
  }, []);

  // Smooth progress animation using requestAnimationFrame
  useEffect(() => {
    const duration = 5000; // 5 seconds total

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      const newPhase = Math.min(Math.floor(newProgress / 20), phases.length - 1);

      setProgress(newProgress);
      setActivePhase(newPhase);

      // Trigger phase change haptic when phase changes
      if (newPhase !== lastPhaseRef.current) {
        lastPhaseRef.current = newPhase;
        haptics.scanPhaseChange(newPhase);
      }

      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Play scan complete celebration haptic
        haptics.scanComplete();
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete, phases.length]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden will-change-transform">
      {/* Premium dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#080812] to-slate-950" />

      {/* Subtle ambient glow - GPU accelerated */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Elegant floating orbs - minimal, GPU accelerated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] -top-48 -right-48 rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 60%)',
            animation: 'premium-float 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] -bottom-32 -left-32 rounded-full will-change-transform"
          style={{
            background: 'radial-gradient(circle, hsl(270 60% 50% / 0.1) 0%, transparent 60%)',
            animation: 'premium-float 15s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Main content container */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">

        {/* Central orb visualization */}
        <div className="relative w-72 h-72 flex items-center justify-center">

          {/* Outer ethereal ring */}
          <div
            className="absolute w-72 h-72 rounded-full will-change-transform"
            style={{
              border: '1px solid hsl(var(--primary) / 0.2)',
              animation: 'premium-spin 20s linear infinite',
            }}
          />

          {/* Middle pulsing ring */}
          <div
            className="absolute w-56 h-56 rounded-full will-change-transform"
            style={{
              border: '1px solid hsl(var(--primary) / 0.25)',
              animation: 'premium-spin 15s linear infinite reverse',
            }}
          >
            {/* Accent dots on ring */}
            <div
              className="absolute w-2 h-2 rounded-full bg-primary/60 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.8)' }}
            />
            <div
              className="absolute w-2 h-2 rounded-full bg-primary/60 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
              style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.8)' }}
            />
          </div>

          {/* Inner rotating ring */}
          <div
            className="absolute w-44 h-44 rounded-full will-change-transform"
            style={{
              border: '2px solid hsl(var(--primary) / 0.3)',
              animation: 'premium-spin 8s linear infinite',
            }}
          >
            <div
              className="absolute w-3 h-3 rounded-full bg-primary top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.9), 0 0 40px hsl(var(--primary) / 0.5)' }}
            />
          </div>

          {/* Central glow */}
          <div
            className="absolute w-40 h-40 rounded-full will-change-transform"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
              animation: 'premium-pulse 3s ease-in-out infinite',
            }}
          />

          {/* Image container with premium border */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden will-change-transform">
            {/* Animated border gradient */}
            <div
              className="absolute -inset-1 rounded-full will-change-transform"
              style={{
                background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(270 60% 60%), hsl(var(--primary)))',
                animation: 'premium-spin 3s linear infinite',
              }}
            />

            {/* Image wrapper */}
            <div className="absolute inset-[3px] rounded-full overflow-hidden bg-slate-900">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Analyzing"
                    className="w-full h-full object-cover"
                    style={{ filter: 'saturate(0.8) brightness(0.7)' }}
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
              )}

              {/* Scanning line sweep */}
              <div
                className="absolute inset-0 will-change-transform"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.4) 50%, transparent 100%)',
                  animation: 'scan-sweep 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* Pulse rings emanating outward */}
          <div
            className="absolute w-36 h-36 rounded-full border border-primary/40 will-change-transform"
            style={{ animation: 'premium-ripple 2s ease-out infinite' }}
          />
          <div
            className="absolute w-36 h-36 rounded-full border border-primary/30 will-change-transform"
            style={{ animation: 'premium-ripple 2s ease-out infinite 0.6s' }}
          />
          <div
            className="absolute w-36 h-36 rounded-full border border-primary/20 will-change-transform"
            style={{ animation: 'premium-ripple 2s ease-out infinite 1.2s' }}
          />
        </div>

        {/* Status section */}
        <div className="mt-12 flex flex-col items-center">
          {/* AI badge */}
          <div
            className="px-5 py-2 rounded-full backdrop-blur-md border border-white/10 mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(270 60% 50% / 0.1) 100%)',
            }}
          >
            <div className="flex items-center gap-2.5">
              {/* Animated dot */}
              <div className="relative w-2.5 h-2.5">
                <div
                  className="absolute inset-0 rounded-full bg-primary will-change-transform"
                  style={{ animation: 'premium-pulse 1.5s ease-in-out infinite' }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-primary/50 will-change-transform"
                  style={{ animation: 'premium-ripple 1.5s ease-out infinite' }}
                />
              </div>
              <span
                className="text-sm font-semibold tracking-wider uppercase"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(270 60% 70%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                AI Analysis
              </span>
            </div>
          </div>

          {/* Phase text */}
          <p
            className="text-lg font-light text-white/90 text-center mb-8 h-7 transition-opacity duration-300"
            style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}
          >
            {phases[activePhase]}
          </p>

          {/* Progress indicators */}
          <div className="flex items-center gap-2">
            {phases.map((_, index) => (
              <div
                key={index}
                className="relative h-2 rounded-full overflow-hidden transition-all duration-500 ease-out"
                style={{
                  width: activePhase === index ? 28 : 8,
                  background: index <= activePhase
                    ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(270 60% 60%))'
                    : 'hsl(0 0% 100% / 0.15)',
                  boxShadow: index <= activePhase
                    ? '0 0 12px hsl(var(--primary) / 0.6)'
                    : 'none',
                }}
              />
            ))}
          </div>

          {/* Progress percentage */}
          <div className="mt-6">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #fff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="relative h-20 flex items-center justify-center">
        <p className="text-xs text-white/40 tracking-[0.2em] uppercase font-medium">
          Powered by Advanced AI
        </p>
      </div>

      {/* Premium CSS animations - GPU optimized */}
      <style>{`
        @keyframes premium-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }

        @keyframes premium-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes premium-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes premium-ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @keyframes scan-sweep {
          0% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
}
