interface WaveBackgroundProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export const WaveBackground = ({ position = 'top', className = '' }: WaveBackgroundProps) => {
  const positionClasses = position === 'top'
    ? 'top-0 left-0'
    : 'bottom-0 left-0';

  return (
    <div className={`absolute ${positionClasses} w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1440 320"
        className="w-full h-auto"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#000000"
          fillOpacity="1"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
};
