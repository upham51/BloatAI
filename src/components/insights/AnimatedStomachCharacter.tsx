import { useEffect, useState, useRef } from 'react';

interface AnimatedStomachCharacterProps {
  healthScore: number; // 0-100
}

export function AnimatedStomachCharacter({ healthScore }: AnimatedStomachCharacterProps) {
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [shouldLoadVideo, setShouldLoadVideo] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const MAX_RETRIES = 3;

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
    setRetryCount(0);
    setShouldLoadVideo(false);
  }, [healthScore]);

  // Defer loading large video assets until after initial paint / idle time.
  useEffect(() => {
    if (!currentVideo) return;

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setShouldLoadVideo(true);
    };

    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cic = (window as any).cancelIdleCallback as ((id: number) => void) | undefined;

    if (ric) {
      const id = ric(enable, { timeout: 800 });
      return () => {
        cancelled = true;
        cic?.(id);
      };
    }

    const t = window.setTimeout(enable, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [currentVideo]);

  // Retry loading video when it fails
  useEffect(() => {
    if (!shouldLoadVideo) return;
    if (videoError && retryCount < MAX_RETRIES && videoRef.current) {
      const timer = setTimeout(() => {
        console.log(`Retrying video load (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        setVideoError(false);

        // Force reload by resetting src
        const video = videoRef.current;
        if (video) {
          video.load();
          video.play().catch(err => console.error('Video play failed:', err));
        }
      }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s

      return () => clearTimeout(timer);
    }
  }, [videoError, retryCount, shouldLoadVideo]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = (e.target as HTMLVideoElement).error;
    console.error('Video error:', error?.message || 'Unknown error', 'Code:', error?.code);

    // Only set error state if we've exhausted retries
    if (retryCount >= MAX_RETRIES) {
      console.error('Max retries reached, showing fallback');
      setVideoError(true);
    } else {
      setVideoError(true); // Trigger retry
    }
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.error('Autoplay failed:', err));
    }
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
        {shouldLoadVideo && (!videoError || retryCount < MAX_RETRIES) ? (
          <video
            ref={videoRef}
            key={currentVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={handleVideoError}
            onLoadedData={handleVideoLoad}
            onCanPlay={(e) => {
              const video = e.currentTarget;
              video.play().catch(err => console.log('Autoplay blocked:', err));
            }}
            className="w-full h-full object-contain transition-opacity duration-700"
            style={{
              mixBlendMode: 'multiply',
            }}
          >
            <source src={currentVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Placeholder while deferred-loading, or when video is not available
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
