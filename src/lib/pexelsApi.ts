/**
 * Pexels API Service for Food Images
 * Fetches high-quality food images with caching and fallbacks
 */

const PEXELS_API_KEY = 'VAV0bPM2tR8obutPU21nYePtMyVOSVw0noMc7uHmBaRwSYBeThciBYvP';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
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
 * Fetch food image from Pexels API
 */
async function fetchFromPexels(searchQuery: string): Promise<PexelsPhoto | null> {
  try {
    const params = new URLSearchParams({
      query: `${searchQuery} food`,
      per_page: '1',
      orientation: 'landscape',
    });

    const response = await fetch(`${PEXELS_API_URL}?${params}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      return data.photos[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return null;
  }
}

/**
 * Get category-specific fallback images
 * These are generic food category images as fallbacks
 */
const CATEGORY_FALLBACKS: Record<string, string> = {
  grains: 'bread pasta rice wheat',
  beans: 'beans legumes lentils',
  dairy: 'milk cheese yogurt',
  fruit: 'fresh fruit bowl',
  sweeteners: 'sugar honey syrup',
  gluten: 'wheat bread gluten',
  veggies: 'vegetables fresh produce',
  'fatty-food': 'fried food greasy',
  carbonated: 'soda sparkling water',
  sugar: 'dessert sweet candy',
  alcohol: 'beer wine drinks',
  processed: 'snacks packaged food',
};

/**
 * Main function to get food image
 * Returns URL and photographer credit
 */
export async function getFoodImage(
  foodName: string,
  category?: string
): Promise<{ url: string; photographer: string } | null> {
  // Check cache first
  const cached = getCachedImage(foodName);
  if (cached) {
    return cached;
  }

  // Try fetching specific food name
  let photo = await fetchFromPexels(foodName);

  // If not found, try category fallback
  if (!photo && category && CATEGORY_FALLBACKS[category]) {
    const cachedCategory = getCachedImage(CATEGORY_FALLBACKS[category]);
    if (cachedCategory) {
      return cachedCategory;
    }

    photo = await fetchFromPexels(CATEGORY_FALLBACKS[category]);
  }

  // If still no photo, try just the first word of the food name
  if (!photo) {
    const firstWord = foodName.split(' ')[0];
    if (firstWord !== foodName) {
      const cachedFirstWord = getCachedImage(firstWord);
      if (cachedFirstWord) {
        return cachedFirstWord;
      }

      photo = await fetchFromPexels(firstWord);
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
