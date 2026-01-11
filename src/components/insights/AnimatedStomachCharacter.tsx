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
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Video Container */}
      <div
        className="relative w-[300px] h-[300px] flex items-center justify-center"
        style={{
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
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
            className="w-full h-full object-contain"
            style={{
              mixBlendMode: 'multiply',
            }}
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Fallback placeholder when video is not available
          <div className="flex flex-col items-center justify-center gap-4">
            <div
              className="text-8xl animate-bounce"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              }}
            >
              {getPlaceholderEmoji()}
            </div>
            <div
              className="text-lg font-medium"
              style={{ color: ringColor }}
            >
              {getPlaceholderText()}
            </div>
            <div className="text-xs text-gray-400 text-center px-4">
              Upload custom videos to /public/assets/videos/stomach/
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
