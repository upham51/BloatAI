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
  strokeWidth = 32,
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

  // Determine gradient colors based on score - 3D tube effect
  const getGradientColors = () => {
    if (score >= 70) {
      // Excellent - Green with metallic depth
      return {
        // Main gradient (outer glow)
        outerStart: '#10b981',  // emerald-500
        outerMid: '#34d399',    // emerald-400
        outerEnd: '#6ee7b7',    // emerald-300
        // Inner gradient (3D depth)
        innerStart: '#059669',  // emerald-600 (darker)
        innerMid: '#10b981',    // emerald-500
        innerEnd: '#34d399',    // emerald-400
        // Glow color
        glowColor: 'rgba(16, 185, 129, 0.4)',
      };
    } else if (score >= 41) {
      // Moderate - Amber/Orange with metallic depth
      return {
        outerStart: '#f59e0b',  // amber-500
        outerMid: '#fbbf24',    // amber-400
        outerEnd: '#fcd34d',    // amber-300
        innerStart: '#d97706',  // amber-600 (darker)
        innerMid: '#f59e0b',    // amber-500
        innerEnd: '#fbbf24',    // amber-400
        glowColor: 'rgba(245, 158, 11, 0.4)',
      };
    } else {
      // Needs improvement - Red/Orange with metallic depth
      return {
        outerStart: '#ef4444',  // red-500
        outerMid: '#f97316',    // orange-500
        outerEnd: '#fb923c',    // orange-400
        innerStart: '#dc2626',  // red-600 (darker)
        innerMid: '#ef4444',    // red-500
        innerEnd: '#f97316',    // orange-500
        glowColor: 'rgba(239, 68, 68, 0.4)',
      };
    }
  };

  const colors = getGradientColors();
  const gradientId = `score-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const innerGradientId = `score-inner-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const trackGradientId = `track-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG Ring with 3D Tube Effect */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
      >
        <defs>
          {/* Outer gradient for main ring (lighter, glowing) */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.outerStart} />
            <stop offset="50%" stopColor={colors.outerMid} />
            <stop offset="100%" stopColor={colors.outerEnd} />
          </linearGradient>

          {/* Inner gradient for 3D depth */}
          <linearGradient id={innerGradientId} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={colors.innerStart} />
            <stop offset="50%" stopColor={colors.innerMid} />
            <stop offset="100%" stopColor={colors.innerEnd} />
          </linearGradient>

          {/* Track gradient (subtle recessed look) */}
          <linearGradient id={trackGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="50%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>

          {/* Drop shadow filter for 3D effect with stronger glow */}
          <filter id="progress-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feFlood floodColor={colors.glowColor}/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Inner shadow for track (recessed channel) - deeper */}
          <filter id="track-inset" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feFlood floodColor="rgba(0,0,0,0.2)"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background track - recessed channel with inner shadow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${trackGradientId})`}
          strokeWidth={strokeWidth}
          opacity={0.5}
          filter="url(#track-inset)"
        />

        {/* Inner semi-transparent layer for depth */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${innerGradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity={0.7}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Main progress circle with outer glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth - 4}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          filter="url(#progress-glow)"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Top highlight for glossy 3D tube effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 4}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity={0.9}
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
