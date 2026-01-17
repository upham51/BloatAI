/**
 * Pexels API Service for Food Images
 * Fetches high-quality food images with caching and fallbacks
 * Uses secure Supabase Edge Function to keep API key server-side
 */

import { supabase } from '@/integrations/supabase/client';

const CACHE_PREFIX = 'pexels_food_';
const CACHE_EXPIRY_DAYS = 30;

export interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface CachedImage {
  url: string;
  photographer: string;
  timestamp: number;
}

/**
 * Get a cached image from localStorage
 */
function getCachedImage(searchQuery: string): CachedImage | null {
  try {
    const cacheKey = CACHE_PREFIX + searchQuery.toLowerCase().replace(/\s+/g, '_');
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const parsedCache: CachedImage = JSON.parse(cached);
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    // Check if cache is still valid
    if (now - parsedCache.timestamp > expiryTime) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsedCache;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Cache an image in localStorage
 */
function cacheImage(searchQuery: string, url: string, photographer: string): void {
  try {
    const cacheKey = CACHE_PREFIX + searchQuery.toLowerCase().replace(/\s+/g, '_');
    const cacheData: CachedImage = {
      url,
      photographer,
      timestamp: Date.now(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching image:', error);
    // If localStorage is full, try to clear old entries
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      clearOldCache();
      // Try again after clearing
      try {
        const cacheKey = CACHE_PREFIX + searchQuery.toLowerCase().replace(/\s+/g, '_');
        const cacheData: CachedImage = {
          url,
          photographer,
          timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (retryError) {
        console.error('Failed to cache even after clearing:', retryError);
      }
    }
  }
}

/**
 * Clear old cached images (older than 30 days)
 */
function clearOldCache(): void {
  try {
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsedCache: CachedImage = JSON.parse(cached);
            if (now - parsedCache.timestamp > expiryTime) {
              keysToRemove.push(key);
            }
          }
        } catch {
          keysToRemove.push(key); // Remove corrupted entries
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}

/**
 * Fetch food image from Pexels API via secure Edge Function
 */
async function fetchFromPexels(searchQuery: string, includeFood: boolean = true): Promise<PexelsPhoto | null> {
  try {
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.warn('No active session - Pexels images require authentication');
      return null;
    }

    const query = includeFood ? `${searchQuery} food dish meal` : searchQuery;

    // Call the secure Edge Function instead of Pexels API directly
    const { data, error } = await supabase.functions.invoke('pexels-proxy', {
      body: {
        query,
        per_page: 1,
        orientation: 'landscape',
        category: includeFood ? 'food' : 'background',
      },
    });

    if (error) {
      console.error('Error calling pexels-proxy function:', error);
      return null;
    }

    if (data?.photos && data.photos.length > 0) {
      return data.photos[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return null;
  }
}

/**
 * Get category-specific fallback images with VERY specific keywords
 * These are designed to get accurate food category images
 */
const CATEGORY_FALLBACKS: Record<string, string> = {
  grains: 'wheat bread pasta rice grains',
  beans: 'kidney beans lentils chickpeas legumes bowl',
  dairy: 'milk cheese yogurt dairy products',
  fruit: 'fresh fruit apple banana orange',
  sweeteners: 'artificial sweetener packets sugar substitute',
  gluten: 'wheat gluten bread loaf',
  veggies: 'broccoli cabbage vegetables fresh',
  'fatty-food': 'fried chicken greasy burger french fries',
  carbonated: 'soda can sparkling water bubbles',
  sugar: 'white sugar cubes dessert cake',
  alcohol: 'beer glass wine bottle alcoholic beverage',
  processed: 'packaged snacks chips crackers processed',
};

/**
 * Main function to get food image
 * Returns URL and photographer credit
 */
export async function getFoodImage(
  foodName: string,
  category?: string
): Promise<{ url: string; photographer: string } | null> {
  // For categories, use the fallback directly with specific keywords
  if (category && CATEGORY_FALLBACKS[category]) {
    const fallbackQuery = CATEGORY_FALLBACKS[category];

    // Check cache for category fallback
    const cachedCategory = getCachedImage(fallbackQuery);
    if (cachedCategory) {
      return cachedCategory;
    }

    // Fetch using category-specific keywords (no extra "food" needed, already in query)
    const photo = await fetchFromPexels(fallbackQuery, false);

    if (photo) {
      const result = {
        url: photo.src.large,
        photographer: photo.photographer,
      };

      cacheImage(fallbackQuery, result.url, result.photographer);
      return result;
    }
  }

  // Fallback: Check cache for food name
  const cached = getCachedImage(foodName);
  if (cached) {
    return cached;
  }

  // Try fetching specific food name
  let photo = await fetchFromPexels(foodName, true);

  // If still no photo, try just the first word of the food name
  if (!photo) {
    const firstWord = foodName.split(' ')[0];
    if (firstWord !== foodName) {
      const cachedFirstWord = getCachedImage(firstWord);
      if (cachedFirstWord) {
        return cachedFirstWord;
      }

      photo = await fetchFromPexels(firstWord, true);
    }
  }

  // Return the photo if found and cache it
  if (photo) {
    const result = {
      url: photo.src.large,
      photographer: photo.photographer,
    };

    cacheImage(foodName, result.url, result.photographer);
    return result;
  }

  return null;
}

/**
 * Preload images for multiple food items
 * Useful for warming up the cache
 */
export async function preloadFoodImages(
  foods: Array<{ name: string; category?: string }>
): Promise<void> {
  const promises = foods.map(food =>
    getFoodImage(food.name, food.category).catch(err => {
      console.error(`Failed to preload image for ${food.name}:`, err);
      return null;
    })
  );

  await Promise.all(promises);
}

/**
 * Clear all cached Pexels images
 * Useful for debugging or resetting
 */
export function clearPexelsCache(): void {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} cached images`);
  } catch (error) {
    console.error('Error clearing Pexels cache:', error);
  }
}
