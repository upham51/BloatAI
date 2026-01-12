import { useSignedUrl } from '@/hooks/useSignedUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface MealPhotoProps {
  photoUrl: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean; // For first image in list
  lazy?: boolean; // Enable lazy loading (default true)
  thumbnail?: boolean; // Use thumbnail optimization (300px, quality 80)
}

export function MealPhoto({
  photoUrl,
  alt = '',
  className = '',
  onClick,
  priority = false,
  lazy = true,
  thumbnail = false
}: MealPhotoProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Apply thumbnail optimization for list views
  const transformOptions = thumbnail ? { width: 300, quality: 80 } : undefined;
  const { url: signedUrl, isLoading: urlLoading } = useSignedUrl(photoUrl, transformOptions);

  // Lazy loading with Intersection Observer
  // Fixed: Ensure observer is set up AFTER img element is rendered
  useEffect(() => {
    // Skip if not lazy loading, or if priority, or if we should already load
    if (!lazy || priority || shouldLoad) return;

    // Skip if img ref not yet available (skeleton still showing)
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading earlier for better UX
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority, shouldLoad, urlLoading]); // Include urlLoading to re-run when skeleton disappears

  // Show blur-up placeholder while URL is loading
  const showPlaceholder = urlLoading || (!imageLoaded && shouldLoad && signedUrl);

  if (showPlaceholder && urlLoading) {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm animate-pulse",
          className
        )}
        onClick={onClick}
      />
    );
  }

  // Error state - show placeholder
  if (imageError || !signedUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/30 text-muted-foreground",
          className
        )}
        onClick={onClick}
      >
        <span className="text-2xl">📷</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} onClick={onClick}>
      {/* Blur-up placeholder shown while image loads */}
      {!imageLoaded && shouldLoad && signedUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm animate-pulse" />
      )}

      <img
        ref={imgRef}
        src={shouldLoad ? signedUrl : undefined}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          !shouldLoad && 'invisible', // Hide image until it should load
          imageLoaded ? 'opacity-100' : 'opacity-0' // Fade in when loaded
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}
