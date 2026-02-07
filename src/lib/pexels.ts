/**
 * Pexels Collection-Based Image Integration
 *
 * Fetches curated imagery from Pexels collections for:
 * - Time-based hero backgrounds (Morning, Afternoon, Evening, Night)
 * - History page backgrounds
 * - Insights page backgrounds
 * - Food texture overlays for meal cards
 * - Editorial food photos for list items
 */

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';
const PEXELS_COLLECTIONS_URL = 'https://api.pexels.com/v1/collections';
const COLLECTION_CACHE_PREFIX = 'pexels_col_';
const COLLECTION_CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Pexels Collection IDs from curated collections
const COLLECTION_IDS = {
  morning: 'ezu0shz',
  afternoon: 'lwipi7f',
  evening: '7fp9q2z',
  night: 'g4f1tbc',
  history: '89mjhkg',
  insights: '89mjhkg',
} as const;

type CollectionKey = keyof typeof COLLECTION_IDS;

export interface PexelsPhoto {
  id: number;
  src: string;
  alt: string;
  photographer: string;
}

// Minimal static fallbacks (one per category) used when API is unavailable
const FALLBACK_PHOTOS: Record<CollectionKey, PexelsPhoto> = {
  morning: { id: 1, src: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Serene morning light', photographer: 'Pixabay' },
  afternoon: { id: 4, src: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Fresh healthy lunch', photographer: 'Ella Olsson' },
  evening: { id: 7, src: 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Cozy evening ambiance', photographer: 'Taryn Elliott' },
  night: { id: 10, src: 'https://images.pexels.com/photos/4033165/pexels-photo-4033165.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm night atmosphere', photographer: 'Taryn Elliott' },
  history: { id: 401, src: 'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm morning wellness', photographer: 'Lisa Fotios' },
  insights: { id: 501, src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm lake with mountains', photographer: 'Eberhard Grossgasteiger' },
};

/**
 * Fetch all photos from a Pexels collection.
 * Caches results in localStorage for 24 hours.
 */
async function fetchCollectionPhotos(collectionKey: CollectionKey): Promise<PexelsPhoto[]> {
  const collectionId = COLLECTION_IDS[collectionKey];
  const cacheKey = COLLECTION_CACHE_PREFIX + collectionKey;

  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { photos: PexelsPhoto[]; timestamp: number };
      if (Date.now() - parsed.timestamp < COLLECTION_CACHE_EXPIRY_MS) {
        return parsed.photos;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch {
    // Ignore cache read errors
  }

  if (!PEXELS_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${PEXELS_COLLECTIONS_URL}/${collectionId}?type=photos&per_page=80`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!response.ok) {
      console.error(`Pexels collection fetch failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const photos: PexelsPhoto[] = (data.media || [])
      .filter((item: Record<string, unknown>) => item.type === 'Photo')
      .map((item: Record<string, unknown>) => ({
        id: item.id as number,
        src: ((item.src as Record<string, string>)?.large2x ||
              (item.src as Record<string, string>)?.large ||
              (item.src as Record<string, string>)?.original || ''),
        alt: (item.alt as string) || `${collectionKey} background`,
        photographer: (item.photographer as string) || 'Unknown',
      }));

    if (photos.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ photos, timestamp: Date.now() }));
      } catch {
        // Ignore cache write errors
      }
    }

    return photos;
  } catch (error) {
    console.error('Pexels collection fetch error:', error);
    return [];
  }
}

/**
 * Get a random photo from a Pexels collection.
 * Falls back to a static image if the API is unavailable.
 */
async function getRandomCollectionPhoto(collectionKey: CollectionKey): Promise<PexelsPhoto> {
  const photos = await fetchCollectionPhotos(collectionKey);
  if (photos.length > 0) {
    return photos[Math.floor(Math.random() * photos.length)];
  }
  return FALLBACK_PHOTOS[collectionKey];
}

/**
 * Get current time period name for greeting
 */
export function getTimePeriod(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get a static fallback hero background (sync, for initial render)
 */
export function getTimeBasedHeroBackground(): PexelsPhoto {
  return FALLBACK_PHOTOS[getTimePeriod()];
}

/**
 * Fetch a random hero background from the time-appropriate Pexels collection
 */
export async function fetchTimeBasedHeroBackground(): Promise<PexelsPhoto> {
  return getRandomCollectionPhoto(getTimePeriod());
}

/**
 * Get a static fallback for History page hero (sync)
 */
export function getHistoryHeroBackground(): PexelsPhoto {
  return FALLBACK_PHOTOS.history;
}

/**
 * Fetch a random background from the History Pexels collection
 */
export async function fetchHistoryHeroBackground(): Promise<PexelsPhoto> {
  return getRandomCollectionPhoto('history');
}

/**
 * Get a static fallback for Insights nature background (sync)
 */
export function getInsightsNatureBackground(): PexelsPhoto {
  return FALLBACK_PHOTOS.insights;
}

/**
 * Fetch a random background from the Insights Pexels collection
 */
export async function fetchInsightsNatureBackground(): Promise<PexelsPhoto> {
  return getRandomCollectionPhoto('insights');
}

/**
 * Get a static fallback for Insights hero background (sync)
 */
export function getInsightsHeroBackground(): PexelsPhoto {
  return FALLBACK_PHOTOS.insights;
}

/**
 * Fetch a random background from the Insights Pexels collection
 */
export async function fetchInsightsHeroBackground(): Promise<PexelsPhoto> {
  return getRandomCollectionPhoto('insights');
}

// Meal card texture backgrounds (dark, moody aesthetic)
export const mealTextures = [
  { id: 101, src: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Dark marble texture', category: 'marble' },
  { id: 102, src: 'https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Moody food setting', category: 'food' },
  { id: 103, src: 'https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Dark kitchen surface', category: 'surface' },
  { id: 104, src: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Organic wood grain', category: 'wood' },
  { id: 105, src: 'https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Fresh geometric produce', category: 'produce' },
  { id: 106, src: 'https://images.pexels.com/photos/4871119/pexels-photo-4871119.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Rustic food styling', category: 'rustic' },
];

// Editorial food photos for list items (high-res ingredient shots)
export const foodPhotos: Record<string, PexelsPhoto> = {
  // Proteins
  steak: { id: 201, src: 'https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Premium steak', photographer: 'Snapwire' },
  chicken: { id: 202, src: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Grilled chicken', photographer: 'Chevanon Photography' },
  fish: { id: 203, src: 'https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh fish', photographer: 'Dana Tentis' },
  salmon: { id: 204, src: 'https://images.pexels.com/photos/1833349/pexels-photo-1833349.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Salmon fillet', photographer: 'Pixabay' },
  eggs: { id: 205, src: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh eggs', photographer: 'Pixabay' },

  // Vegetables
  broccoli: { id: 211, src: 'https://images.pexels.com/photos/47347/broccoli-vegetable-diet-food-47347.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh broccoli', photographer: 'Pixabay' },
  spinach: { id: 212, src: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh spinach leaves', photographer: 'Daria Shevtsova' },
  carrots: { id: 213, src: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh carrots', photographer: 'mali maeder' },
  tomatoes: { id: 214, src: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Ripe tomatoes', photographer: 'Pixabay' },
  peppers: { id: 215, src: 'https://images.pexels.com/photos/594137/pexels-photo-594137.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Bell peppers', photographer: 'Pixabay' },
  onion: { id: 216, src: 'https://images.pexels.com/photos/175415/pexels-photo-175415.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh onions', photographer: 'Pixabay' },
  garlic: { id: 217, src: 'https://images.pexels.com/photos/928251/pexels-photo-928251.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Garlic cloves', photographer: 'Pixabay' },
  mushrooms: { id: 218, src: 'https://images.pexels.com/photos/36438/mushrooms-brown-mushrooms-cook-eat.jpg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh mushrooms', photographer: 'Pixabay' },

  // Grains & Carbs
  rice: { id: 221, src: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Rice bowl', photographer: 'Pixabay' },
  pasta: { id: 222, src: 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh pasta', photographer: 'Engin Akyurt' },
  bread: { id: 223, src: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Artisan bread', photographer: 'Pixabay' },
  oats: { id: 224, src: 'https://images.pexels.com/photos/531378/pexels-photo-531378.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Oatmeal', photographer: 'JÉSHOOTS' },

  // Fruits
  apple: { id: 231, src: 'https://images.pexels.com/photos/347926/pexels-photo-347926.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh apple', photographer: 'Pixabay' },
  banana: { id: 232, src: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Ripe bananas', photographer: 'Eiliv-Sonas Aceron' },
  berries: { id: 233, src: 'https://images.pexels.com/photos/1253041/pexels-photo-1253041.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh berries', photographer: 'Suzy Hazelwood' },
  avocado: { id: 234, src: 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh avocado', photographer: 'Foodie Factor' },

  // Dairy
  cheese: { id: 241, src: 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Artisan cheese', photographer: 'Pixabay' },
  yogurt: { id: 242, src: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Creamy yogurt', photographer: 'Daria Shevtsova' },
  milk: { id: 243, src: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh milk', photographer: 'Pixabay' },

  // Beverages
  coffee: { id: 251, src: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Fresh coffee', photographer: 'Chevanon Photography' },
  tea: { id: 252, src: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Herbal tea', photographer: 'Lisa Fotios' },

  // Default fallback
  default: { id: 999, src: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200', alt: 'Healthy food', photographer: 'Ella Olsson' },
};

/**
 * Get a random meal texture for card backgrounds
 */
export function getRandomMealTexture() {
  const randomIndex = Math.floor(Math.random() * mealTextures.length);
  return mealTextures[randomIndex];
}

/**
 * Get a food photo by keyword matching
 * Supports fuzzy matching for common food items
 */
export function getFoodPhoto(foodName: string): PexelsPhoto {
  const normalizedName = foodName.toLowerCase().trim();

  // Direct match
  if (foodPhotos[normalizedName]) {
    return foodPhotos[normalizedName];
  }

  // Fuzzy matching for common variations
  const fuzzyMatches: Record<string, string> = {
    'beef': 'steak',
    'ribeye': 'steak',
    'sirloin': 'steak',
    'filet': 'steak',
    'poultry': 'chicken',
    'egg': 'eggs',
    'omelette': 'eggs',
    'omelet': 'eggs',
    'toast': 'bread',
    'sandwich': 'bread',
    'sourdough': 'bread',
    'noodles': 'pasta',
    'spaghetti': 'pasta',
    'penne': 'pasta',
    'steamed rice': 'rice',
    'white rice': 'rice',
    'brown rice': 'rice',
    'oatmeal': 'oats',
    'porridge': 'oats',
    'blueberries': 'berries',
    'strawberries': 'berries',
    'raspberries': 'berries',
    'grapes': 'berries',
    'greens': 'spinach',
    'kale': 'spinach',
    'lettuce': 'spinach',
    'salad': 'spinach',
    'pepper': 'peppers',
    'capsicum': 'peppers',
    'tomato': 'tomatoes',
    'cherry tomatoes': 'tomatoes',
    'carrot': 'carrots',
    'shrimp': 'fish',
    'tuna': 'fish',
    'cod': 'fish',
    'tilapia': 'fish',
    'cheddar': 'cheese',
    'mozzarella': 'cheese',
    'parmesan': 'cheese',
    'greek yogurt': 'yogurt',
    'latte': 'coffee',
    'espresso': 'coffee',
    'cappuccino': 'coffee',
    'green tea': 'tea',
    'chamomile': 'tea',
    'herbal': 'tea',
  };

  // Check fuzzy matches
  for (const [key, value] of Object.entries(fuzzyMatches)) {
    if (normalizedName.includes(key)) {
      return foodPhotos[value];
    }
  }

  // Partial match on photo keys
  for (const key of Object.keys(foodPhotos)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return foodPhotos[key];
    }
  }

  // Default fallback
  return foodPhotos.default;
}

/**
 * Preload images for better performance
 */
export function preloadImages(photos: PexelsPhoto[]): void {
  photos.forEach(photo => {
    const img = new Image();
    img.src = photo.src;
  });
}
