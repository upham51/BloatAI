export default function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main wave shape - using sage/mint gradient */}
      <svg
        className="absolute top-0 left-0 w-full h-[65%]"
        viewBox="0 0 375 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(165, 50%, 82%)" />
            <stop offset="50%" stopColor="hsl(160, 40%, 78%)" />
            <stop offset="100%" stopColor="hsl(270, 40%, 85%)" />
          </linearGradient>
        </defs>
        <path
          d="M0 0 L375 0 L375 500 Q280 550, 187.5 500 T0 500 Z"
          fill="url(#waveGradient)"
        />
      </svg>

      {/* Floating geometric shapes for depth */}
      <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-white/20 blur-xl animate-pulse" />
      <div className="absolute top-40 right-8 w-24 h-24 rounded-full bg-white/15 blur-2xl animate-pulse delay-100" />
      <div className="absolute top-60 left-1/2 w-20 h-20 rounded-full bg-white/10 blur-xl animate-pulse delay-200" />
    </div>
  );
}
