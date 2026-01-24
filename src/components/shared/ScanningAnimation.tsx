import { useEffect, useState, useMemo } from 'react';

interface ScanningAnimationProps {
  imageUrl?: string | null;
  onComplete?: () => void;
}

export function ScanningAnimation({ imageUrl, onComplete }: ScanningAnimationProps) {
  const [scanPosition, setScanPosition] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [activePhase, setActivePhase] = useState(0);

  const phases = useMemo(() => [
    'Initializing neural analysis',
    'Detecting food composition',
    'Analyzing nutritional data',
    'Identifying potential triggers',
    'Finalizing insights'
  ], []);

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanPosition((prev) => {
        if (prev >= 100) {
          setIsScanning(false);
          onComplete?.();
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isScanning, onComplete]);

  // Update phase based on scan position
  useEffect(() => {
    const phaseIndex = Math.min(Math.floor(scanPosition / 20), phases.length - 1);
    setActivePhase(phaseIndex);
  }, [scanPosition, phases.length]);

  // Generate floating particles
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2
    })), []
  );

  // Generate orbital rings data
  const rings = useMemo(() => [
    { size: 180, duration: 20, direction: 1, opacity: 0.15 },
    { size: 240, duration: 25, direction: -1, opacity: 0.1 },
    { size: 300, duration: 30, direction: 1, opacity: 0.08 }
  ], []);

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden">
      {/* Ambient background with deep gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] -top-48 -left-48 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            animation: 'float-slow 15s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] -bottom-32 -right-32 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(280 70% 50% / 0.12) 0%, transparent 70%)',
            animation: 'float-slow 18s ease-in-out infinite reverse'
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] top-1/3 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--lavender) / 0.1) 0%, transparent 70%)',
            animation: 'breathe 8s ease-in-out infinite'
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `radial-gradient(circle, hsl(var(--primary) / ${particle.opacity}) 0%, transparent 70%)`,
              animation: `particle-float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">

        {/* Central visualization container */}
        <div className="relative w-72 h-72 flex items-center justify-center">

          {/* Orbital rings */}
          {rings.map((ring, index) => (
            <div
              key={index}
              className="absolute rounded-full border"
              style={{
                width: ring.size,
                height: ring.size,
                borderColor: `hsl(var(--primary) / ${ring.opacity})`,
                animation: `spin-${ring.direction > 0 ? 'clockwise' : 'counter'} ${ring.duration}s linear infinite`
              }}
            >
              {/* Ring accent dots */}
              <div
                className="absolute w-2 h-2 rounded-full -top-1 left-1/2 -translate-x-1/2"
                style={{
                  background: `hsl(var(--primary) / ${ring.opacity * 3})`,
                  boxShadow: `0 0 10px hsl(var(--primary) / ${ring.opacity * 2})`
                }}
              />
            </div>
          ))}

          {/* Central glowing core */}
          <div className="absolute w-40 h-40 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
              filter: 'blur(20px)'
            }}
          />

          {/* Image preview circle with premium treatment */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden">
            {/* Outer glow ring */}
            <div
              className="absolute -inset-1 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--lavender)), hsl(280 70% 60%), hsl(var(--primary)))',
                animation: 'spin-clockwise 4s linear infinite',
                filter: 'blur(2px)'
              }}
            />

            {/* Inner container */}
            <div className="absolute inset-0.5 rounded-full overflow-hidden bg-slate-900">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Analyzing"
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'saturate(0.8) brightness(0.7)',
                      animation: 'subtle-zoom 10s ease-in-out infinite'
                    }}
                  />
                  {/* Overlay gradient on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
              )}

              {/* Scanning sweep effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `conic-gradient(from ${scanPosition * 3.6}deg, transparent 0deg, hsl(var(--primary) / 0.3) 30deg, transparent 60deg)`,
                  animation: 'none'
                }}
              />
            </div>

            {/* Pulse rings emanating from center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="absolute w-full h-full rounded-full border border-primary/20"
                style={{ animation: 'pulse-ring 2s ease-out infinite' }}
              />
              <div
                className="absolute w-full h-full rounded-full border border-primary/20"
                style={{ animation: 'pulse-ring 2s ease-out infinite 0.5s' }}
              />
              <div
                className="absolute w-full h-full rounded-full border border-primary/20"
                style={{ animation: 'pulse-ring 2s ease-out infinite 1s' }}
              />
            </div>
          </div>

          {/* Scanning beam */}
          <div
            className="absolute w-48 h-0.5 left-1/2 top-1/2 -translate-x-1/2 origin-center"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.8) 50%, transparent 100%)',
              boxShadow: '0 0 20px 2px hsl(var(--primary) / 0.4)',
              animation: 'scan-rotate 3s linear infinite',
              transformOrigin: 'center center'
            }}
          />
        </div>

        {/* Status section with glass morphism */}
        <div className="mt-12 flex flex-col items-center">
          {/* Premium badge */}
          <div
            className="px-5 py-2 rounded-full backdrop-blur-xl border border-white/10 mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--lavender) / 0.1) 100%)'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Animated DNA-like icon */}
              <div className="relative w-5 h-5">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'hsl(var(--primary))',
                    animation: 'morph 3s ease-in-out infinite'
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'hsl(var(--lavender))',
                    animation: 'morph 3s ease-in-out infinite 1.5s'
                  }}
                />
              </div>
              <span
                className="text-sm font-semibold tracking-wider uppercase"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                AI Analysis
              </span>
            </div>
          </div>

          {/* Phase text with animated transition */}
          <div className="h-7 overflow-hidden">
            <p
              className="text-lg font-light text-white/90 text-center transition-all duration-500"
              style={{
                textShadow: '0 0 30px hsl(var(--primary) / 0.3)'
              }}
            >
              {phases[activePhase]}
            </p>
          </div>

          {/* Elegant progress dots */}
          <div className="flex items-center gap-3 mt-6">
            {phases.map((_, index) => (
              <div
                key={index}
                className="relative transition-all duration-500"
                style={{
                  width: activePhase === index ? 24 : 8,
                  height: 8
                }}
              >
                <div
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{
                    background: index <= activePhase
                      ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)'
                      : 'hsl(var(--muted) / 0.3)',
                    boxShadow: index <= activePhase
                      ? '0 0 15px hsl(var(--primary) / 0.5)'
                      : 'none'
                  }}
                />
                {activePhase === index && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative section */}
      <div className="relative h-32 flex items-center justify-center">
        {/* Subtle wave decoration */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Tagline */}
        <p className="text-xs text-white/40 tracking-widest uppercase font-light">
          Powered by Advanced AI
        </p>
      </div>

      {/* Premium animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.1; transform: translate(-50%, 0) scale(1); }
          50% { opacity: 0.2; transform: translate(-50%, 0) scale(1.2); }
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(20px, -30px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translate(-10px, -50px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translate(15px, -20px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes spin-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-counter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes scan-rotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes morph {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(0.5) rotate(180deg);
            opacity: 0.4;
          }
        }

        @keyframes subtle-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
