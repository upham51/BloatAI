import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DynamicBackgroundProps {
  /**
   * Categories to rotate through for background images
   * Default: wellness, nature, and healthy lifestyle themes
   */
  categories?: string[];
  /**
   * Opacity of the dark overlay (0-1)
   * Default: 0.7
   */
  overlayOpacity?: number;
  /**
   * Whether to blur the background
   * Default: false
   */
  blur?: boolean;
  /**
   * Enable fallback gradient when images fail or are loading
   * Default: true
   */
  enableFallback?: boolean;
}

/**
 * DynamicBackground Component
 * Displays beautiful, dynamic background images from Pexels with caching
 * Features:
 * - Fetches wellness/nature images from Pexels
 * - Caches images for 24 hours in localStorage
 * - Dark overlay for text readability
 * - Smooth fade-in animations
 * - Fallback gradient when images unavailable
 * - Automatic daily rotation
 */
export function DynamicBackground({
  categories = [
    'wellness morning light',
    'peaceful nature landscape',
    'healthy lifestyle calm',
    'serene forest sunrise',
    'tranquil ocean waves',
    'mindfulness meditation zen',
    'fresh vegetables healthy',
  ],
  overlayOpacity = 0.7,
  blur = false,
  enableFallback = true,
}: DynamicBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [photographer, setPhotographer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    loadBackgroundImage();
  }, []);

  /**
   * Load background image from cache or Pexels API
   */
  const loadBackgroundImage = async () => {
    try {
      // Check if we have a cached image for today
      const cached = getCachedBackground();
      if (cached) {
        setBackgroundImage(cached.url);
        setPhotographer(cached.photographer);
        setIsLoading(false);
        return;
      }

      // Fetch new image from Pexels via Edge Function
      const image = await fetchBackgroundImage();
      if (image) {
        setBackgroundImage(image.url);
        setPhotographer(image.photographer);
        cacheBackground(image.url, image.photographer);
      } else {
        // Use fallback gradient if fetch fails
        setUseFallback(true);
      }
    } catch (error) {
      console.error('Error loading background image:', error);
      setUseFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch background image from Pexels via secure Edge Function
   */
  const fetchBackgroundImage = async (): Promise<{ url: string; photographer: string } | null> => {
    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session - background images require authentication');
        return null;
      }

      // Select a random category from the list
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Call the secure Edge Function
      const { data, error } = await supabase.functions.invoke('pexels-proxy', {
        body: {
          query: randomCategory,
          per_page: 1,
          orientation: 'landscape',
          category: 'background',
        },
      });

      if (error) {
        console.error('Error fetching background image:', error);
        return null;
      }

      if (data?.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        return {
          url: photo.src.large2x || photo.src.large,
          photographer: photo.photographer,
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchBackgroundImage:', error);
      return null;
    }
  };

  /**
   * Get cached background from localStorage
   * Cache expires after 24 hours
   */
  const getCachedBackground = (): { url: string; photographer: string } | null => {
    try {
      const cached = localStorage.getItem('pexels_background_cache');
      if (!cached) return null;

      const { url, photographer, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

      // Check if cache is still valid (24 hours)
      if (now - timestamp > TWENTY_FOUR_HOURS) {
        localStorage.removeItem('pexels_background_cache');
        return null;
      }

      return { url, photographer };
    } catch (error) {
      console.error('Error reading background cache:', error);
      return null;
    }
  };

  /**
   * Cache background image in localStorage
   */
  const cacheBackground = (url: string, photographer: string): void => {
    try {
      const cacheData = {
        url,
        photographer,
        timestamp: Date.now(),
      };
      localStorage.setItem('pexels_background_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching background:', error);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {/* Background Image or Fallback Gradient */}
      {!useFallback && backgroundImage ? (
        <>
          {/* The actual background image */}
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${blur ? 'blur-sm' : ''}`}
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />

          {/* Photographer credit (subtle, bottom right) */}
          {photographer && (
            <div className="absolute bottom-2 right-2 text-xs text-white/40 z-10 backdrop-blur-sm bg-black/20 px-2 py-1 rounded">
              Photo by {photographer}
            </div>
          )}
        </>
      ) : enableFallback ? (
        /* Fallback gradient with dark, premium aesthetic */
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      ) : null}

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/60 via-black/50 to-black/70"
        style={{
          opacity: overlayOpacity,
        }}
      />

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-radial from-transparent via-transparent to-black/40" />
    </div>
  );
}
