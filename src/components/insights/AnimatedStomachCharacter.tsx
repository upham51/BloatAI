import { useEffect, useState } from 'react';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
  ringColor: string;
}

export function AnimatedStomachCharacter({ healthScore, ringColor }: AnimatedStomachCharacterProps) {
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [videoError, setVideoError] = useState<boolean>(false);

  // Determine which video to show based on score
  useEffect(() => {
    let videoPath = '';

    if (healthScore < 41) {
      // Sad/poor health
      videoPath = '/assets/videos/stomach/sad.mp4';
    } else if (healthScore >= 70) {
      // Happy/excellent health
      videoPath = '/assets/videos/stomach/happy.mp4';
    } else {
      // Moderate/good health
      videoPath = '/assets/videos/stomach/moderate.mp4';
    }

    setCurrentVideo(videoPath);
    setVideoError(false);
  }, [healthScore]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  // Determine mood for placeholder
  const isBad = healthScore < 41;
  const isGood = healthScore >= 70;

  // Placeholder when video is not available
  const getPlaceholderEmoji = () => {
    if (isBad) return '😰';
    if (isGood) return '😊';
    return '😐';
  };

  const getPlaceholderText = () => {
    if (isBad) return 'Needs Care';
    if (isGood) return 'Feeling Great!';
    return 'Doing OK';
  };

  return (
    <div className="relative w-full h-80 flex items-center justify-center py-8">
      {/* Outer decorative frame with gradient border */}
      <div className="relative">
        {/* Gradient border frame */}
        <div
          className="absolute inset-0 rounded-3xl transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${ringColor}20, ${ringColor}40, ${ringColor}20)`,
            padding: '3px',
            filter: 'blur(0.5px)',
          }}
        >
          <div className="w-full h-full bg-white rounded-3xl" />
        </div>

        {/* Main frame container with premium styling */}
        <div
          className="relative rounded-3xl overflow-hidden transition-all duration-500"
          style={{
            width: '340px',
            height: '340px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.03),
              0 2px 4px rgba(0,0,0,0.04),
              0 8px 16px rgba(0,0,0,0.06),
              0 16px 32px rgba(0,0,0,0.08),
              0 0 60px ${ringColor}15
            `,
          }}
        >
          {/* Inner decorative pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${ringColor} 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Video content container with padding */}
          <div className="relative w-full h-full p-5 flex items-center justify-center">
            {/* Inner frame with subtle shadow */}
            <div
              className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #fefefe 0%, #fcfcfc 100%)',
                boxShadow: `
                  inset 0 1px 3px rgba(0,0,0,0.06),
                  inset 0 0 0 1px rgba(0,0,0,0.02)
                `,
              }}
            >
              {!videoError ? (
                <video
                  key={currentVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={handleVideoError}
                  className="w-full h-full object-contain transition-opacity duration-500"
                  style={{
                    mixBlendMode: 'multiply',
                  }}
                >
                  <source src={currentVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                // Fallback placeholder when video is not available
                <div className="flex flex-col items-center justify-center gap-4 p-6">
                  <div
                    className="text-8xl animate-bounce"
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
                    }}
                  >
                    {getPlaceholderEmoji()}
                  </div>
                  <div
                    className="text-lg font-semibold tracking-tight"
                    style={{ color: ringColor }}
                  >
                    {getPlaceholderText()}
                  </div>
                  <div className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                    Upload custom videos to /public/assets/videos/stomach/
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Corner accents for premium feel */}
          <div
            className="absolute top-0 left-0 w-16 h-16"
            style={{
              background: `radial-gradient(circle at top left, ${ringColor}08, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-16 h-16"
            style={{
              background: `radial-gradient(circle at bottom right, ${ringColor}08, transparent 70%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
