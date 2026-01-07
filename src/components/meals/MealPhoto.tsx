import { useSignedUrl } from '@/hooks/useSignedUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MealPhotoProps {
  photoUrl: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export function MealPhoto({ photoUrl, alt = '', className = '', onClick }: MealPhotoProps) {
  const { url: signedUrl, isLoading } = useSignedUrl(photoUrl);

  if (isLoading) {
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
      src={signedUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
}
