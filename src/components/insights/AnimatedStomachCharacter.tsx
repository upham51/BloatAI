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

  // Mouth path based on mood
  const getMouthPath = () => {
    if (isGood) {
      // Big happy smile
      return "M 45 65 Q 60 72 75 65";
    } else if (isMedium) {
      // Neutral/slight smile
      return "M 45 67 Q 60 70 75 67";
    } else {
      // Sad frown
      return "M 45 72 Q 60 65 75 72";
    }
  };

  // Bloated effect for bad scores
  const stomachWidth = isBad ? 1.15 : 1;
  const bloatAnimation = isBad ? 'bloat-pulse' : 'float';

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Animated SVG Stomach */}
      <svg
        width="300"
        height="300"
        viewBox="0 0 120 140"
        className={`${bloatAnimation} wiggle`}
        style={{
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
          animation: `${bloatAnimation} 3s ease-in-out infinite`,
        }}
        key={animationTrigger}
      >
        {/* Stomach body - realistic J-shaped stomach */}
        <g transform={`scale(${stomachWidth}, 1)`} style={{ transformOrigin: '60px 70px' }}>
          {/* Main stomach J-shape */}
          <path
            d="
              M 55 25
              C 50 25, 45 28, 43 33
              L 40 45
              C 38 52, 35 58, 35 65
              C 35 75, 40 85, 48 92
              C 52 96, 56 100, 60 102
              C 64 104, 70 105, 75 103
              C 82 100, 88 95, 92 88
              C 95 82, 96 75, 96 68
              C 96 60, 94 52, 90 45
              C 88 40, 85 35, 82 32
              C 75 25, 68 22, 60 22
              C 58 22, 56 23, 55 25
              Z
            "
            fill={ringColor}
            opacity="0.9"
            className="stomach-body"
            strokeWidth="3"
            stroke={ringColor}
            strokeOpacity="0.3"
          />

          {/* Inner highlight for depth */}
          <path
            d="
              M 55 30
              C 52 32, 48 35, 46 40
              L 44 50
              C 42 56, 40 62, 40 68
              C 40 76, 44 84, 50 90
              C 54 94, 58 97, 62 98
              C 66 99, 70 99, 74 97
              C 79 94, 84 90, 87 84
              C 90 79, 91 73, 91 68
              C 91 61, 89 54, 86 48
              C 84 43, 82 38, 79 35
              C 74 30, 68 27, 60 27
              C 58 28, 56 29, 55 30
              Z
            "
            fill="white"
            opacity="0.2"
          />

          {/* Bloat lines when score is bad */}
          {isBad && (
            <>
              <path
                d="M 42 55 Q 60 53 88 55"
                stroke={ringColor}
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                strokeDasharray="3,3"
              />
              <path
                d="M 42 70 Q 60 68 90 70"
                stroke={ringColor}
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                strokeDasharray="3,3"
              />
              <path
                d="M 48 85 Q 60 83 88 85"
                stroke={ringColor}
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                strokeDasharray="3,3"
              />
            </>
          )}

          {/* Left eye */}
          <g transform="translate(50, 55)">
            {/* Eye white */}
            <ellipse
              cx="0"
              cy="0"
              rx="5"
              ry={isBlinking ? 0.5 : 6}
              fill="#1a1a1a"
              className="eye-transition"
            />
            {!isBlinking && (
              <>
                {/* Pupil */}
                <ellipse
                  cx="0"
                  cy="0.5"
                  rx="3"
                  ry={isBad ? 2.5 : 4}
                  fill="#1a1a1a"
                  className="eye-transition"
                />
                {/* Shine */}
                <circle
                  cx="-1"
                  cy="-1"
                  r="1.5"
                  fill="white"
                  opacity="0.9"
                />
              </>
            )}
          </g>

          {/* Right eye */}
          <g transform="translate(78, 55)">
            {/* Eye white */}
            <ellipse
              cx="0"
              cy="0"
              rx="5"
              ry={isBlinking ? 0.5 : 6}
              fill="#1a1a1a"
              className="eye-transition"
            />
            {!isBlinking && (
              <>
                {/* Pupil */}
                <ellipse
                  cx="0"
                  cy="0.5"
                  rx="3"
                  ry={isBad ? 2.5 : 4}
                  fill="#1a1a1a"
                  className="eye-transition"
                />
                {/* Shine */}
                <circle
                  cx="-1"
                  cy="-1"
                  r="1.5"
                  fill="white"
                  opacity="0.9"
                />
              </>
            )}
          </g>

          {/* Eyebrows - more expressive based on mood */}
          {isGood && (
            <>
              <path
                d="M 43 48 Q 50 45 57 47"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 71 47 Q 78 45 85 48"
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
                d="M 43 50 Q 50 48 57 49"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 71 49 Q 78 48 85 50"
                stroke="#1a1a1a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
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
                cx="38"
                cy="65"
                rx="5"
                ry="3"
                fill="#ff6b9d"
                opacity="0.3"
              />
              <ellipse
                cx="90"
                cy="65"
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
                cx="35"
                cy="48"
                rx="2.5"
                ry="3.5"
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

        .eye-transition {
          transition: ry 0.15s ease-out;
        }

        .sweat-drop {
          animation: sweat-drop 1.5s ease-in infinite;
        }
      `}</style>
    </div>
  );
}
