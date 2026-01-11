import { useEffect, useState, useRef } from 'react';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
  ringColor: string;
}

export function AnimatedStomachCharacter({ healthScore, ringColor }: AnimatedStomachCharacterProps) {
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Process video to remove white background
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Remove white pixels (chroma key effect for white)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is close to white (adjust threshold as needed)
          const threshold = 200; // Lower = more aggressive white removal
          if (r > threshold && g > threshold && b > threshold) {
            // Make pixel transparent
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    video.addEventListener('play', () => {
      processFrame();
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentVideo]);

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
          <div className="relative w-full h-full">
            {/* Hidden video element */}
            <video
              ref={videoRef}
              key={currentVideo}
              autoPlay
              loop
              muted
              playsInline
              onError={handleVideoError}
              className="hidden"
            >
              <source src={currentVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Canvas to display processed video */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />
          </div>
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
