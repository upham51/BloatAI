import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate a signed URL for a private storage file
 * Returns the signed URL if the path is a storage path, otherwise returns the original URL
 * Also returns a loading state to enable skeleton/loading UI
 */
export function useSignedUrl(photoUrl: string | null): { url: string | null; isLoading: boolean } {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!photoUrl) {
      setSignedUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Check if this is a Supabase storage URL that needs signing
    // Old public URLs contain the project ID and 'object/public/'
    // New storage paths are just the file path like 'userId/timestamp.ext'
    const isStoragePath = !photoUrl.startsWith('http') || photoUrl.includes('/storage/v1/object/');

    if (!isStoragePath) {
      // External URL, use as-is
      setSignedUrl(photoUrl);
      setIsLoading(false);
      return;
    }

    let filePath = photoUrl;

    // Extract file path from full Supabase URL if needed
    if (photoUrl.includes('/storage/v1/object/')) {
      // Parse the path from URL like: .../storage/v1/object/public/meal-photos/userId/file.jpg
      const match = photoUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/meal-photos\/(.+)/);
      if (match) {
        filePath = match[1];
      }
    }

    // Generate signed URL with 1-hour expiry
    const generateSignedUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('meal-photos')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
          console.error('Error generating signed URL:', error);
          // Fallback to the original URL
          setSignedUrl(photoUrl);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Error in signed URL generation:', err);
        setSignedUrl(photoUrl);
      } finally {
        setIsLoading(false);
      }
    };

    generateSignedUrl();
  }, [photoUrl]);

  return { url: signedUrl, isLoading };
}

/**
 * Utility function to get signed URL (for non-React contexts)
 */
export async function getSignedUrl(photoUrl: string | null): Promise<string | null> {
  if (!photoUrl) return null;

  const isStoragePath = !photoUrl.startsWith('http') || photoUrl.includes('/storage/v1/object/');
  
  if (!isStoragePath) {
    return photoUrl;
  }

  let filePath = photoUrl;
  
  if (photoUrl.includes('/storage/v1/object/')) {
    const match = photoUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/meal-photos\/(.+)/);
    if (match) {
      filePath = match[1];
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from('meal-photos')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Error generating signed URL:', error);
      return photoUrl;
    }
    return data.signedUrl;
  } catch (err) {
    console.error('Error in signed URL generation:', err);
    return photoUrl;
  }
}
