import { useEffect, useState } from 'react';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
  ringColor: string;
}

export function AnimatedStomachCharacter({ healthScore, ringColor }: AnimatedStomachCharacterProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Determine mood and appearance based on score
  const isBad = healthScore < 41;
  const isGood = healthScore >= 70;
  const isMedium = !isBad && !isGood;

  // Random blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 3000 + 2000); // Random blink every 2-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Random wiggle trigger
  useEffect(() => {
    const wiggleInterval = setInterval(() => {
      setAnimationTrigger(prev => prev + 1);
    }, Math.random() * 4000 + 3000); // Random wiggle every 3-7 seconds

    return () => clearInterval(wiggleInterval);
  }, []);

  // Eye style based on mood
  const getEyeStyle = () => {
    if (isBlinking) return { scaleY: 0.1 };
    if (isBad) return { scaleY: 0.6 }; // Tired/sad eyes
    return { scaleY: 1 }; // Normal eyes
  };

  // Mouth path based on mood
  const getMouthPath = () => {
    if (isGood) {
      // Big happy smile
      return "M 40 60 Q 60 75 80 60";
    } else if (isMedium) {
      // Neutral/slight smile
      return "M 40 65 Q 60 68 80 65";
    } else {
      // Sad frown
      return "M 40 70 Q 60 60 80 70";
    }
  };

  // Bloated effect for bad scores
  const stomachScale = isBad ? 1.15 : 1;
  const bloatAnimation = isBad ? 'bloat-pulse' : 'float';

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Animated SVG Stomach */}
      <svg
        width="280"
        height="280"
        viewBox="0 0 120 120"
        className={`${bloatAnimation} wiggle`}
        style={{
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
          animation: `${bloatAnimation} 3s ease-in-out infinite`,
        }}
        key={animationTrigger}
      >
        {/* Stomach body - organic curved shape */}
        <g transform={`scale(${stomachScale})`} style={{ transformOrigin: '60px 60px' }}>
          {/* Main stomach shape */}
          <path
            d="
              M 60 20
              C 80 20, 95 35, 95 55
              C 95 65, 92 75, 85 82
              C 80 87, 70 92, 60 95
              C 50 92, 40 87, 35 82
              C 28 75, 25 65, 25 55
              C 25 35, 40 20, 60 20
              Z
            "
            fill={ringColor}
            opacity="0.9"
            className="stomach-body"
          />

          {/* Inner highlight for depth */}
          <path
            d="
              M 60 25
              C 75 25, 88 38, 88 52
              C 88 60, 85 68, 80 74
              C 75 79, 67 83, 60 85
              C 53 83, 45 79, 40 74
              C 35 68, 32 60, 32 52
              C 32 38, 45 25, 60 25
              Z
            "
            fill="white"
            opacity="0.15"
          />

          {/* Bloat lines when score is bad */}
          {isBad && (
            <>
              <path
                d="M 35 50 Q 60 48 85 50"
                stroke={ringColor}
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                strokeDasharray="2,2"
              />
              <path
                d="M 35 65 Q 60 63 85 65"
                stroke={ringColor}
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                strokeDasharray="2,2"
              />
            </>
          )}

          {/* Left eye */}
          <g transform="translate(45, 45)">
            {/* Eye white */}
            <ellipse
              cx="0"
              cy="0"
              rx="6"
              ry="7"
              fill="white"
              opacity="0.95"
            />
            {/* Pupil */}
            <ellipse
              cx="0"
              cy="1"
              rx="3"
              ry="4"
              fill="#1a1a1a"
              style={{
                transform: `scaleY(${getEyeStyle().scaleY})`,
                transformOrigin: 'center',
                transition: 'transform 0.15s ease-out',
              }}
            />
            {/* Shine */}
            <circle
              cx="-1"
              cy="-1"
              r="1.5"
              fill="white"
              opacity="0.8"
            />
          </g>

          {/* Right eye */}
          <g transform="translate(75, 45)">
            {/* Eye white */}
            <ellipse
              cx="0"
              cy="0"
              rx="6"
              ry="7"
              fill="white"
              opacity="0.95"
            />
            {/* Pupil */}
            <ellipse
              cx="0"
              cy="1"
              rx="3"
              ry="4"
              fill="#1a1a1a"
              style={{
                transform: `scaleY(${getEyeStyle().scaleY})`,
                transformOrigin: 'center',
                transition: 'transform 0.15s ease-out',
              }}
            />
            {/* Shine */}
            <circle
              cx="-1"
              cy="-1"
              r="1.5"
              fill="white"
              opacity="0.8"
            />
          </g>

          {/* Eyebrows - more expressive based on mood */}
          {isGood && (
            <>
              <path
                d="M 38 38 Q 45 35 52 37"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 68 37 Q 75 35 82 38"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
            </>
          )}

          {isBad && (
            <>
              <path
                d="M 38 40 Q 45 38 52 39"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
                className="sad-brow"
              />
              <path
                d="M 68 39 Q 75 38 82 40"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
                className="sad-brow"
              />
            </>
          )}

          {/* Mouth */}
          <path
            d={getMouthPath()}
            stroke="#1a1a1a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
            className="stomach-mouth"
          />

          {/* Blush marks when happy */}
          {isGood && (
            <>
              <ellipse
                cx="35"
                cy="58"
                rx="5"
                ry="3"
                fill="#ff6b9d"
                opacity="0.3"
              />
              <ellipse
                cx="85"
                cy="58"
                rx="5"
                ry="3"
                fill="#ff6b9d"
                opacity="0.3"
              />
            </>
          )}

          {/* Sweat drops when stressed (bad score) */}
          {isBad && (
            <>
              <ellipse
                cx="30"
                cy="40"
                rx="2"
                ry="3"
                fill="#87ceeb"
                opacity="0.6"
                className="sweat-drop"
              />
            </>
          )}
        </g>
      </svg>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(1deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
          75% { transform: translateY(-8px) rotate(0.5deg); }
        }

        @keyframes bloat-pulse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.03); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          50% { transform: rotate(-2deg); }
          75% { transform: rotate(1deg); }
        }

        @keyframes sweat-drop {
          0% { transform: translateY(0px); opacity: 0.6; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }

        .bloat-pulse {
          animation: bloat-pulse 2s ease-in-out infinite;
        }

        .wiggle {
          animation: wiggle 4s ease-in-out infinite;
        }

        .stomach-body {
          transition: all 0.5s ease-out;
        }

        .stomach-mouth {
          transition: all 0.3s ease-out;
        }

        .sweat-drop {
          animation: sweat-drop 1.5s ease-in infinite;
        }

        .sad-brow {
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
