import { useEffect, useState } from 'react';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
}

export function AnimatedStomachCharacter({ healthScore }: AnimatedStomachCharacterProps) {
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [videoError, setVideoError] = useState<boolean>(false);

  // Determine which video to show based on score ranges
  // 70-100: Excellent (relaxed, content) - happy
  // 31-69: Moderate (concerned but calm) - moderate
  // 0-30: Poor (uncomfortable, slumped) - sad
  useEffect(() => {
    let videoPath = '';

    if (healthScore >= 70) {
      // Excellent health - relaxed, upright, content
      videoPath = '/assets/videos/stomach/happy.mp4';
    } else if (healthScore >= 31) {
      // Moderate health - slightly slouched, concerned but calm
      videoPath = '/assets/videos/stomach/moderate.mp4';
    } else {
      // Poor health - slumped posture, visibly uncomfortable
      videoPath = '/assets/videos/stomach/sad.mp4';
    }

    setCurrentVideo(videoPath);
    setVideoError(false);
  }, [healthScore]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  // Determine mood for placeholder
  const isExcellent = healthScore >= 70;
  const isPoor = healthScore < 31;

  // Placeholder when video is not available
  const getPlaceholderEmoji = () => {
    if (isPoor) return '😰';
    if (isExcellent) return '😊';
    return '😐';
  };

  const getPlaceholderText = () => {
    if (isPoor) return 'Needs Care';
    if (isExcellent) return 'Optimal';
    return 'Moderate';
  };

  return (
    <div
      className="relative flex items-center justify-center animate-breathe"
      style={{
        width: '240px',
        height: '240px',
      }}
    >
      {/* Simple container for video/character */}
      <div className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden bg-white/50">
        {!videoError ? (
          <video
            key={currentVideo}
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-contain transition-opacity duration-700"
            style={{
              mixBlendMode: 'multiply',
            }}
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Fallback placeholder when video is not available
          <div className="flex flex-col items-center justify-center gap-3 p-4">
            <div
              className="text-7xl"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
              }}
            >
              {getPlaceholderEmoji()}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {getPlaceholderText()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
