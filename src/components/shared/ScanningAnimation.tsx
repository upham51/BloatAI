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
    <div className="absolute inset-0 z-10 flex flex-col">
      {/* Top section - Scanning area with overlay on image */}
      <div className="relative flex-1">
        {/* Faded background image with blur */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-30">
            <img
              src={imageUrl}
              alt="Scanning"
              className="w-full h-full object-cover blur-sm"
            />
          </div>
        )}

        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/70" />

        {/* Scanning frame - Slimmer design */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative w-full max-w-xs aspect-square">
            {/* Subtle glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--lavender)) 100%)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />

          {/* Slim scanning container */}
          <div className="relative aspect-square bg-gradient-to-br from-card/20 to-card/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lavender/5" />

            {/* Animated scan line */}
            <div
              className="absolute left-0 right-0 transition-all duration-100 ease-linear z-20"
              style={{ top: `${scanPosition}%` }}
            >
              <div
                className="h-0.5 mx-4 bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{
                  boxShadow: '0 0 20px 2px hsl(var(--primary))',
                  filter: 'brightness(1.5)'
                }}
              />
            </div>

            {/* Corner brackets - Slimmer */}
            <div className="absolute top-3 left-3 w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
              <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-primary to-transparent" />
            </div>
            <div className="absolute top-3 right-3 w-12 h-12">
              <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary to-transparent" />
              <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-primary to-transparent" />
            </div>
            <div className="absolute bottom-3 left-3 w-12 h-12">
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
              <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-primary to-transparent" />
            </div>
            <div className="absolute bottom-3 right-3 w-12 h-12">
              <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary to-transparent" />
              <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-primary to-transparent" />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Bottom section - White area with AI Scanning status */}
      <div className="bg-background h-64 flex flex-col items-center justify-center px-6 space-y-5">
        {/* Loading skeleton for content area */}
        <div className="w-full max-w-md space-y-3 animate-pulse">
          {/* Title skeleton */}
          <div className="h-4 bg-muted rounded-full w-3/4 mx-auto"></div>
          <div className="h-3 bg-muted rounded-full w-full"></div>
          <div className="h-3 bg-muted rounded-full w-5/6 mx-auto"></div>
        </div>

        {/* AI Scanning status */}
        <div className="flex items-center justify-center gap-2.5 mt-4">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 15px hsl(var(--primary) / 0.6)'
            }}
          ></div>
          <h2 className="text-lg font-bold text-primary">
            AI Scanning
          </h2>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-100 ease-linear bg-primary"
              style={{
                width: `${scanPosition}%`,
                boxShadow: '0 0 10px hsl(var(--primary) / 0.4)'
              }}
            ></div>
          </div>
          <div className="flex items-center justify-center mt-2 gap-1">
            <span className="text-xl font-bold text-primary">
              {Math.round(scanPosition)}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        {/* Status text */}
        <p className="text-sm text-muted-foreground">
          Analyzing ingredients and triggers...
        </p>
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
