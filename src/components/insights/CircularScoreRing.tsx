import { useEffect, useState } from 'react';

interface CircularScoreRingProps {
  score: number; // 0-100
  size?: number; // Diameter in pixels
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function CircularScoreRing({
  score,
  size = 280,
  strokeWidth = 8,
  children
}: CircularScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  // Determine gradient colors based on score
  const getGradientColors = () => {
    if (score >= 70) {
      // Excellent - Green
      return {
        start: '#10b981',  // emerald-500
        mid: '#34d399',    // emerald-400
        end: '#6ee7b7',    // emerald-300
      };
    } else if (score >= 41) {
      // Moderate - Yellow/Orange
      return {
        start: '#f59e0b',  // amber-500
        mid: '#fbbf24',    // amber-400
        end: '#fcd34d',    // amber-300
      };
    } else {
      // Needs improvement - Orange/Red
      return {
        start: '#ef4444',  // red-500
        mid: '#f97316',    // orange-500
        end: '#fb923c',    // orange-400
      };
    }
  };

  const colors = getGradientColors();
  const gradientId = `score-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG Ring */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.08))' }}
      >
        <defs>
          {/* Gradient definition */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>

      {/* Content in center */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
