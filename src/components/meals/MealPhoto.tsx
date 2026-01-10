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
}

export function MealPhoto({
  photoUrl,
  alt = '',
  className = '',
  onClick,
  priority = false,
  lazy = true
}: MealPhotoProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const { url: signedUrl, isLoading: urlLoading } = useSignedUrl(photoUrl);

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

  // Show skeleton while URL is loading
  const showSkeleton = urlLoading;

  if (showSkeleton) {
    return (
      <Skeleton
        className={cn(
          "w-full",
          className
        )}
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
    <img
      ref={imgRef}
      src={shouldLoad ? signedUrl : undefined}
      alt={alt}
      className={cn(
        className,
        !shouldLoad && 'invisible' // Hide image until it should load
      )}
      onClick={onClick}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
