interface BloatAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function BloatAILogo({ size = 'md', showText = true, className = '' }: BloatAILogoProps) {
  const sizeMap = {
    sm: { logo: 40, text: 'text-xl' },
    md: { logo: 60, text: 'text-2xl' },
    lg: { logo: 80, text: 'text-3xl' },
    xl: { logo: 120, text: 'text-5xl' },
  };

  const { logo: logoSize, text: textSize } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Bloat AI Logo SVG - Stylized intestine with arrow */}
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 35%, 45%)" />
            <stop offset="100%" stopColor="hsl(165, 50%, 65%)" />
          </linearGradient>
        </defs>

        {/* Left intestine curve */}
        <path
          d="M25 15 Q15 15, 15 25 L15 95 Q15 105, 25 105 L25 75 Q25 65, 35 65 L45 65"
          fill="url(#logoGradient)"
          stroke="none"
        />

        {/* Right intestine curve */}
        <path
          d="M95 15 Q105 15, 105 25 L105 95 Q105 105, 95 105 L95 75 Q95 65, 85 65 L75 65"
          fill="url(#logoGradient)"
          stroke="none"
        />

        {/* Arrow pointing up (digestive health) */}
        <path
          d="M60 90 L60 40 M60 40 L45 55 M60 40 L75 55"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="text-center">
          <h1 className={`${textSize} font-bold text-foreground tracking-tight`}>
            BLOAT AI
          </h1>
        </div>
      )}
    </div>
  );
}
