import { useSignedUrl } from '@/hooks/useSignedUrl';

interface MealPhotoProps {
  photoUrl: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export function MealPhoto({ photoUrl, alt = '', className = '', onClick }: MealPhotoProps) {
  const signedUrl = useSignedUrl(photoUrl);

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
