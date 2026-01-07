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
    <div className="absolute inset-0 bg-card/95 backdrop-blur-xl z-10">
      {/* Background image preview */}
      {imageUrl && (
        <div className="absolute inset-0 opacity-30">
          <img
            src={imageUrl}
            alt="Scanning"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Scanning overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        {/* Scanning box */}
        <div className="relative w-full max-w-sm aspect-square border-2 border-primary/30 rounded-2xl overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-primary/20" />
              ))}
            </div>
          </div>

          {/* Horizontal laser line */}
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg transition-all duration-100 ease-linear"
            style={{
              top: `${scanPosition}%`,
              boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)',
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary blur-sm animate-pulse" />
          </div>

          {/* Scan line trail effect */}
          <div
            className="absolute left-0 right-0 h-8 bg-gradient-to-b from-primary/20 to-transparent transition-all duration-100 ease-linear"
            style={{
              top: `${scanPosition}%`,
            }}
          />

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
        </div>

        {/* Status text */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-lg font-bold text-foreground animate-pulse">
              AI Scanning
            </p>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>

          <p className="text-sm text-muted-foreground">
            Analyzing ingredients and triggers...
          </p>

          {/* Progress bar */}
          <div className="w-64 mx-auto">
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-sage-dark transition-all duration-100 ease-linear"
                style={{ width: `${scanPosition}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(scanPosition)}% complete
            </p>
          </div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
              style={{
                left: `${(i * 12) + 10}%`,
                top: `${scanPosition}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
