import { useEffect, useState } from 'react';

interface ScanningAnimationProps {
  imageUrl?: string | null;
  onComplete?: () => void;
}

export function ScanningAnimation({ imageUrl, onComplete }: ScanningAnimationProps) {
  const [scanPosition, setScanPosition] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

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

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-lavender/20 animate-pulse" />

      {/* Faded background image with heavy blur */}
      {imageUrl && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={imageUrl}
            alt="Scanning"
            className="w-full h-full object-cover blur-2xl"
          />
        </div>
      )}

      {/* Main content container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
        {/* Premium scanning frame */}
        <div className="relative w-full max-w-md">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-3xl opacity-40 blur-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />

          {/* Glass card container */}
          <div className="relative aspect-square bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-lavender/10" />

            {/* Premium grid pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-primary"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Animated scan line with premium glow */}
            <div
              className="absolute left-0 right-0 transition-all duration-100 ease-linear z-20"
              style={{ top: `${scanPosition}%` }}
            >
              {/* Primary glow line */}
              <div
                className="h-1 mx-8 bg-gradient-to-r from-transparent via-primary to-transparent relative"
                style={{
                  boxShadow: '0 0 30px 4px hsl(var(--primary)), 0 0 60px 8px hsl(var(--primary) / 0.4)',
                  filter: 'brightness(1.5)'
                }}
              >
                {/* Pulse effect on the line */}
                <div className="absolute inset-0 bg-white/40 animate-pulse" />
              </div>

              {/* Trail effect with gradient */}
              <div
                className="h-20 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent mx-8 -mt-1"
                style={{
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
                }}
              />
            </div>

            {/* Corner brackets with premium styling */}
            <div className="absolute top-6 left-6 w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent" />
            </div>
            <div className="absolute top-6 right-6 w-16 h-16">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary to-transparent" />
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary to-transparent" />
            </div>
            <div className="absolute bottom-6 left-6 w-16 h-16">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
              <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-t from-primary to-transparent" />
            </div>
            <div className="absolute bottom-6 right-6 w-16 h-16">
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-primary to-transparent" />
              <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-primary to-transparent" />
            </div>

            {/* Orbiting particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/60 rounded-full shadow-lg"
                  style={{
                    left: `${50 + 40 * Math.cos((i / 12) * 2 * Math.PI + scanPosition * 0.05)}%`,
                    top: `${50 + 40 * Math.sin((i / 12) * 2 * Math.PI + scanPosition * 0.05)}%`,
                    boxShadow: '0 0 10px 2px hsl(var(--primary) / 0.5)',
                    animation: `float ${2 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Premium status section */}
        <div className="mt-12 text-center space-y-6 w-full max-w-md">
          {/* AI Scanning title with animated gradient */}
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)',
                boxShadow: '0 0 20px hsl(var(--primary) / 0.8)'
              }}
            />
            <h2
              className="text-3xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent animate-pulse"
              style={{
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite, pulse 2s ease-in-out infinite'
              }}
            >
              AI Scanning
            </h2>
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--lavender)) 0%, hsl(var(--primary)) 100%)',
                boxShadow: '0 0 20px hsl(var(--lavender) / 0.8)',
                animationDelay: '0.3s'
              }}
            />
          </div>

          <p className="text-base text-white/70 font-medium tracking-wide">
            Analyzing ingredients and triggers...
          </p>

          {/* Premium progress bar */}
          <div className="w-full px-4">
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              {/* Background shimmer */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: 'shimmer 2s linear infinite'
                }}
              />

              {/* Progress fill with gradient */}
              <div
                className="h-full relative transition-all duration-100 ease-linear"
                style={{
                  width: `${scanPosition}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 50%, hsl(var(--primary)) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                  boxShadow: '0 0 20px hsl(var(--primary) / 0.6)'
                }}
              >
                {/* Bright leading edge */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/80 blur-sm" />
              </div>
            </div>

            {/* Percentage display */}
            <div className="flex items-center justify-center mt-4 gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-lavender bg-clip-text text-transparent">
                  {Math.round(scanPosition)}
                </span>
                <span className="text-xl font-semibold text-white/60">%</span>
              </div>
              <span className="text-sm text-white/50 font-medium">complete</span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0s' }} />
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Detecting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lavender animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Analyzing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sage animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframe animations */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
