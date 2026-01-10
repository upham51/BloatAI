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
  const [shouldLoad, setShouldLoad] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const { url: signedUrl, isLoading: urlLoading } = useSignedUrl(photoUrl);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy || priority || shouldLoad) return;

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
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority, shouldLoad]);

  // Show skeleton while URL is loading OR image is loading
  const showSkeleton = urlLoading || (!imageLoaded && signedUrl);

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

  if (!signedUrl) {
    return null;
  }

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? signedUrl : undefined}
      alt={alt}
      className={className}
      onClick={onClick}
      onLoad={() => setImageLoaded(true)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
