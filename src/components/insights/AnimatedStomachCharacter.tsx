import { useEffect, useState } from 'react';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
  ringColor: string;
}

export function AnimatedStomachCharacter({ healthScore }: AnimatedStomachCharacterProps) {
  const [currentVideo, setCurrentVideo] = useState<string>('');

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
  }, [healthScore]);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Video Container */}
      <div
        className="relative w-[300px] h-[300px] flex items-center justify-center"
        style={{
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))',
        }}
      >
        {currentVideo && (
          <video
            key={currentVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
