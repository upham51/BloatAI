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

  // Generate floating particles - MORE particles for ultra-premium feel
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.6 + 0.2,
      color: i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'lavender' : 'mint'
    })), []
  );

  // Generate data stream particles that flow upward
  const dataStreams = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      size: Math.random() * 3 + 1
    })), []
  );

  // Generate orbital rings data - MORE rings with varied effects
  const rings = useMemo(() => [
    { size: 160, duration: 15, direction: 1, opacity: 0.2, dotCount: 3 },
    { size: 200, duration: 20, direction: -1, opacity: 0.15, dotCount: 4 },
    { size: 250, duration: 25, direction: 1, opacity: 0.1, dotCount: 2 },
    { size: 310, duration: 35, direction: -1, opacity: 0.06, dotCount: 5 },
    { size: 380, duration: 45, direction: 1, opacity: 0.04, dotCount: 3 }
  ], []);

  // Generate hexagonal grid points
  const hexPoints = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (i % 6) * 80 + (Math.floor(i / 6) % 2) * 40,
      y: Math.floor(i / 6) * 70,
      delay: i * 0.1,
      opacity: Math.random() * 0.3 + 0.1
    })), []
  );

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden">
      {/* Deep space ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a0a1a] to-slate-950" />

      {/* Animated hexagonal grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {hexPoints.map((point) => (
          <div
            key={point.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: point.x,
              top: point.y,
              background: 'hsl(var(--primary))',
              opacity: point.opacity,
              animation: `hex-pulse 3s ease-in-out infinite`,
              animationDelay: `${point.delay}s`
            }}
          />
        ))}
      </div>

      {/* Animated gradient mesh background - More orbs with varied colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[700px] h-[700px] -top-64 -left-64 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, hsl(165 50% 40% / 0.1) 50%, transparent 70%)',
            animation: 'float-slow 15s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] -bottom-48 -right-48 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(280 70% 50% / 0.18) 0%, hsl(300 60% 40% / 0.08) 50%, transparent 70%)',
            animation: 'float-slow 18s ease-in-out infinite reverse'
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] top-1/4 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--lavender) / 0.15) 0%, transparent 70%)',
            animation: 'breathe 8s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] top-2/3 -left-32 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(200 80% 50% / 0.12) 0%, transparent 70%)',
            animation: 'float-slow 20s ease-in-out infinite'
          }}
        />
      </div>

      {/* Data stream particles flowing upward */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dataStreams.map((stream) => (
          <div
            key={stream.id}
            className="absolute rounded-full"
            style={{
              width: stream.size,
              height: stream.size * 8,
              left: `${stream.x}%`,
              bottom: '-20px',
              background: `linear-gradient(to top, transparent, hsl(var(--primary) / 0.6), transparent)`,
              animation: `data-stream ${stream.duration}s linear infinite`,
              animationDelay: `${stream.delay}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Floating particles with varied colors */}
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
              background: `radial-gradient(circle, hsl(var(--${particle.color}) / ${particle.opacity}) 0%, transparent 70%)`,
              animation: `particle-float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 ${particle.size * 2}px hsl(var(--${particle.color}) / ${particle.opacity * 0.5})`
            }}
          />
        ))}
      </div>

      {/* Holographic scan lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.1) 2px, hsl(var(--primary) / 0.1) 4px)',
          animation: 'scan-lines 8s linear infinite'
        }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">

        {/* Central visualization container */}
        <div className="relative w-80 h-80 flex items-center justify-center">

          {/* Outer ethereal glow */}
          <div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 60%)',
              animation: 'ethereal-glow 4s ease-in-out infinite'
            }}
          />

          {/* Orbital rings with multiple dots per ring */}
          {rings.map((ring, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                width: ring.size,
                height: ring.size,
                border: `1px solid hsl(var(--primary) / ${ring.opacity})`,
                animation: `spin-${ring.direction > 0 ? 'clockwise' : 'counter'} ${ring.duration}s linear infinite`,
                boxShadow: `inset 0 0 ${ring.size / 10}px hsl(var(--primary) / ${ring.opacity * 0.5})`
              }}
            >
              {/* Multiple ring accent dots */}
              {Array.from({ length: ring.dotCount }).map((_, dotIndex) => (
                <div
                  key={dotIndex}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${(360 / ring.dotCount) * dotIndex}deg) translateX(${ring.size / 2}px) translateY(-50%)`,
                    background: `hsl(var(--primary) / ${ring.opacity * 4})`,
                    boxShadow: `0 0 12px hsl(var(--primary) / ${ring.opacity * 3}), 0 0 24px hsl(var(--primary) / ${ring.opacity * 2})`
                  }}
                />
              ))}
            </div>
          ))}

          {/* Inner energy field */}
          <div
            className="absolute w-48 h-48 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.1), transparent, hsl(var(--lavender) / 0.1), transparent)',
              animation: 'spin-clockwise 6s linear infinite',
              filter: 'blur(15px)'
            }}
          />

          {/* Central glowing core - Multiple layers */}
          <div className="absolute w-44 h-44 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(var(--primary) / 0.1) 50%, transparent 70%)',
              filter: 'blur(25px)',
              animation: 'core-pulse 3s ease-in-out infinite'
            }}
          />
          <div className="absolute w-36 h-36 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--lavender) / 0.2) 0%, transparent 70%)',
              filter: 'blur(20px)',
              animation: 'core-pulse 3s ease-in-out infinite 0.5s'
            }}
          />

          {/* Image preview circle with ultra-premium treatment */}
          <div className="relative w-40 h-40 rounded-full overflow-hidden">
            {/* Outer chromatic glow ring - double layer */}
            <div
              className="absolute -inset-2 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(165 50% 60%), hsl(var(--lavender)), hsl(280 70% 60%), hsl(200 80% 55%), hsl(var(--primary)))',
                animation: 'spin-clockwise 3s linear infinite',
                filter: 'blur(4px)',
                opacity: 0.8
              }}
            />
            <div
              className="absolute -inset-1 rounded-full"
              style={{
                background: 'conic-gradient(from 180deg, hsl(var(--primary)), hsl(var(--lavender)), hsl(280 70% 60%), hsl(var(--primary)))',
                animation: 'spin-counter 5s linear infinite',
                filter: 'blur(2px)'
              }}
            />

            {/* Inner container */}
            <div className="absolute inset-1 rounded-full overflow-hidden bg-slate-900 shadow-inner">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Analyzing"
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'saturate(0.85) brightness(0.75) contrast(1.1)',
                      animation: 'subtle-zoom 10s ease-in-out infinite'
                    }}
                  />
                  {/* Overlay gradient on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/50" />
                  {/* Holographic overlay */}
                  <div
                    className="absolute inset-0 opacity-30 mix-blend-overlay"
                    style={{
                      background: 'linear-gradient(135deg, transparent 20%, hsl(var(--primary) / 0.3) 50%, transparent 80%)',
                      animation: 'holographic-sweep 3s linear infinite'
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
              )}

              {/* Scanning sweep effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `conic-gradient(from ${scanPosition * 3.6}deg, transparent 0deg, hsl(var(--primary) / 0.4) 20deg, hsl(var(--lavender) / 0.3) 40deg, transparent 60deg)`,
                }}
              />
            </div>

            {/* Pulse rings emanating from center - more rings with varied timing */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="absolute w-full h-full rounded-full border border-primary/30"
                style={{ animation: 'pulse-ring 2s ease-out infinite' }}
              />
              <div
                className="absolute w-full h-full rounded-full border border-lavender/25"
                style={{ animation: 'pulse-ring 2s ease-out infinite 0.4s' }}
              />
              <div
                className="absolute w-full h-full rounded-full border border-primary/20"
                style={{ animation: 'pulse-ring 2s ease-out infinite 0.8s' }}
              />
              <div
                className="absolute w-full h-full rounded-full border border-lavender/15"
                style={{ animation: 'pulse-ring 2s ease-out infinite 1.2s' }}
              />
            </div>
          </div>

          {/* Dual scanning beams */}
          <div
            className="absolute w-56 h-0.5 left-1/2 top-1/2 -translate-x-1/2 origin-center"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.9) 30%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.9) 70%, transparent 100%)',
              boxShadow: '0 0 25px 3px hsl(var(--primary) / 0.5), 0 0 50px 5px hsl(var(--primary) / 0.2)',
              animation: 'scan-rotate 2.5s linear infinite',
              transformOrigin: 'center center'
            }}
          />
          <div
            className="absolute w-48 h-px left-1/2 top-1/2 -translate-x-1/2 origin-center opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--lavender) / 0.8) 50%, transparent 100%)',
              boxShadow: '0 0 15px 2px hsl(var(--lavender) / 0.4)',
              animation: 'scan-rotate 4s linear infinite reverse',
              transformOrigin: 'center center'
            }}
          />
        </div>

        {/* Status section with ultra-premium glass morphism */}
        <div className="mt-10 flex flex-col items-center">
          {/* Premium badge with enhanced glow */}
          <div
            className="px-6 py-2.5 rounded-full backdrop-blur-xl border border-white/15 mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--lavender) / 0.15) 50%, hsl(280 70% 50% / 0.1) 100%)',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.1)'
            }}
          >
            {/* Animated shimmer */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.3), transparent)',
                animation: 'badge-shimmer 2s linear infinite'
              }}
            />
            <div className="flex items-center gap-3 relative z-10">
              {/* Animated neural icon */}
              <div className="relative w-6 h-6">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'hsl(var(--primary))',
                    animation: 'morph 3s ease-in-out infinite',
                    boxShadow: '0 0 15px hsl(var(--primary) / 0.6)'
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'hsl(var(--lavender))',
                    animation: 'morph 3s ease-in-out infinite 1.5s',
                    boxShadow: '0 0 15px hsl(var(--lavender) / 0.6)'
                  }}
                />
                {/* Center dot */}
                <div className="absolute inset-2 rounded-full bg-white/80" />
              </div>
              <span
                className="text-sm font-bold tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 50%, hsl(280 70% 60%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none'
                }}
              >
                AI Analysis
              </span>
            </div>
          </div>

          {/* Phase text with animated transition */}
          <div className="h-8 overflow-hidden">
            <p
              className="text-xl font-light text-white/95 text-center transition-all duration-500"
              style={{
                textShadow: '0 0 40px hsl(var(--primary) / 0.4), 0 2px 10px hsl(0 0% 0% / 0.3)',
                animation: 'text-glow 2s ease-in-out infinite'
              }}
            >
              {phases[activePhase]}
            </p>
          </div>

          {/* Elegant progress indicator */}
          <div className="flex items-center gap-3 mt-8">
            {phases.map((_, index) => (
              <div
                key={index}
                className="relative transition-all duration-700"
                style={{
                  width: activePhase === index ? 32 : 10,
                  height: 10,
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div
                  className="absolute inset-0 rounded-full transition-all duration-700"
                  style={{
                    background: index <= activePhase
                      ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 50%, hsl(280 70% 60%) 100%)'
                      : 'hsl(var(--muted) / 0.2)',
                    boxShadow: index <= activePhase
                      ? '0 0 20px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.3)'
                      : 'none',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
                {activePhase === index && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                    <div
                      className="absolute -inset-1 rounded-full opacity-50"
                      style={{
                        background: 'hsl(var(--primary))',
                        filter: 'blur(6px)',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Progress percentage */}
          <div className="mt-6 flex items-center gap-2">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(0 0% 100%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {Math.min(scanPosition, 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bottom decorative section */}
      <div className="relative h-28 flex flex-col items-center justify-center gap-3">
        {/* Animated wave decoration */}
        <div className="absolute inset-x-0 top-0 h-px">
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.3) 25%, hsl(var(--lavender) / 0.4) 50%, hsl(var(--primary) / 0.3) 75%, transparent 100%)',
              animation: 'wave-shimmer 3s linear infinite'
            }}
          />
        </div>

        {/* Tagline with premium styling */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/30" />
          <p className="text-xs text-white/50 tracking-[0.25em] uppercase font-medium">
            Powered by Advanced AI
          </p>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      </div>

      {/* Ultra Premium animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -40px) scale(1.15); }
          50% { transform: translate(-30px, 30px) scale(0.9); }
          75% { transform: translate(20px, -20px) scale(1.05); }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.15; transform: translate(-50%, 0) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, 0) scale(1.3); }
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(30px, -40px) scale(1.3);
            opacity: 0.7;
          }
          50% {
            transform: translate(-15px, -70px) scale(0.7);
            opacity: 0.5;
          }
          75% {
            transform: translate(20px, -30px) scale(1.2);
            opacity: 0.6;
          }
        }

        @keyframes data-stream {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-500px);
            opacity: 0;
          }
        }

        @keyframes hex-pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.5);
          }
        }

        @keyframes scan-lines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100%);
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
            opacity: 0.5;
          }
          100% {
            transform: scale(2.5);
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
            opacity: 0.9;
          }
          50% {
            transform: scale(0.4) rotate(180deg);
            opacity: 0.3;
          }
        }

        @keyframes subtle-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes ethereal-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }

        @keyframes core-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }

        @keyframes holographic-sweep {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) rotate(45deg);
          }
        }

        @keyframes badge-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes text-glow {
          0%, 100% {
            opacity: 0.95;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes wave-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
