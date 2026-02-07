/**
 * Pexels API Integration for Premium Imagery
 *
 * Provides high-quality, curated imagery for:
 * - Time-based hero backgrounds (live API + static fallback)
 * - Food texture overlays for meal cards
 * - Editorial food photos for list items
 */

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
const HERO_CACHE_PREFIX = 'pexels_hero_';
const HERO_CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Time-based Pexels search queries for hero backgrounds
const timeBasedSearchQueries: Record<'morning' | 'afternoon' | 'evening' | 'night', string> = {
  morning: 'foggy forest minimal, white mist nature, soft sunrise, calm lake, zen morning',
  afternoon: 'aerial forest, pine tree pattern, green nature texture, clear sky, minimal mountains',
  evening: 'minimal sunset silhouette, dusk gradient, calm horizon, soft golden hour, simple landscape',
  night: 'dark forest minimal, moon silhouette, deep blue night, simple stars, black nature',
};

// Curated Pexels photo collections for organic modernism aesthetic
// Pre-selected IDs for consistent, premium imagery without API calls

export interface PexelsPhoto {
  id: number;
  src: string;
  alt: string;
  photographer: string;
}

// Time-based hero backgrounds
export const heroBackgrounds = {
  morning: [
    { id: 1, src: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Serene morning light through leaves', photographer: 'Pixabay' },
    { id: 2, src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Soft sunrise wellness', photographer: 'Dominika Roseclay' },
    { id: 3, src: 'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Morning tea ritual', photographer: 'Lisa Fotios' },
  ],
  afternoon: [
    { id: 4, src: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Fresh healthy lunch spread', photographer: 'Ella Olsson' },
    { id: 5, src: 'https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Natural light wellness', photographer: 'Taryn Elliott' },
    { id: 6, src: 'https://images.pexels.com/photos/1028598/pexels-photo-1028598.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Organic nature textures', photographer: 'Pixabay' },
  ],
  evening: [
    { id: 7, src: 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Cozy evening ambiance', photographer: 'Taryn Elliott' },
    { id: 8, src: 'https://images.pexels.com/photos/6957750/pexels-photo-6957750.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Warm herbal tea setting', photographer: 'Sora Shimazaki' },
    { id: 9, src: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Evening kitchen warmth', photographer: 'Engin Akyurt' },
  ],
  night: [
    { id: 10, src: 'https://images.pexels.com/photos/4033165/pexels-photo-4033165.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm night atmosphere', photographer: 'Taryn Elliott' },
    { id: 11, src: 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Restful night tea', photographer: 'Lisa Fotios' },
    { id: 12, src: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Peaceful night scene', photographer: 'freestocks.org' },
  ],
};

// Calming wellness backgrounds for History page hero
export const historyHeroBackgrounds: PexelsPhoto[] = [
  { id: 401, src: 'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm morning wellness ritual', photographer: 'Lisa Fotios' },
  { id: 402, src: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Soft green fern leaves', photographer: 'Pixabay' },
  { id: 403, src: 'https://images.pexels.com/photos/1028598/pexels-photo-1028598.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Organic nature textures', photographer: 'Pixabay' },
  { id: 404, src: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Misty mountain forest at dawn', photographer: 'Luca Bravo' },
  { id: 405, src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm lake surrounded by forest', photographer: 'Eberhard Grossgasteiger' },
];

/**
 * Get a random calming background for History page hero
 */
export function getHistoryHeroBackground(): PexelsPhoto {
  const randomIndex = Math.floor(Math.random() * historyHeroBackgrounds.length);
  return historyHeroBackgrounds[randomIndex];
}

// Minimalistic nature backgrounds for insights progress card
export const insightsNatureBackgrounds = [
  { id: 301, src: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Misty mountain forest at dawn', photographer: 'Luca Bravo' },
  { id: 302, src: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Calm lake surrounded by forest', photographer: 'Eberhard Grossgasteiger' },
  { id: 303, src: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Soft green fern leaves', photographer: 'Pixabay' },
  { id: 304, src: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Serene mountain valley landscape', photographer: 'Julius Silver' },
  { id: 305, src: 'https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Aerial view of lush green forest', photographer: 'Luca Bravo' },
];

/**
 * Get a random minimalistic nature background for insights progress card
 */
export function getInsightsNatureBackground(): PexelsPhoto {
  const randomIndex = Math.floor(Math.random() * insightsNatureBackgrounds.length);
  return insightsNatureBackgrounds[randomIndex];
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
 * Get a time-based hero background image
 */
export function getTimeBasedHeroBackground(): PexelsPhoto {
  const hour = new Date().getHours();

  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  const backgrounds = heroBackgrounds[timeOfDay];
  const randomIndex = Math.floor(Math.random() * backgrounds.length);

  return backgrounds[randomIndex];
}

/**
 * Fetch a time-based hero background from the Pexels API.
 * Uses the current time period to select an appropriate search query,
 * caches the result in localStorage, and falls back to static images on failure.
 */
export async function fetchTimeBasedHeroBackground(): Promise<PexelsPhoto> {
  const timePeriod = getTimePeriod();
  const query = timeBasedSearchQueries[timePeriod];

  // Check localStorage cache first
  try {
    const cacheKey = HERO_CACHE_PREFIX + timePeriod;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { photo: PexelsPhoto; timestamp: number };
      if (Date.now() - parsed.timestamp < HERO_CACHE_EXPIRY_MS) {
        return parsed.photo;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch {
    // Ignore cache read errors
  }

  // Attempt Pexels API call
  if (PEXELS_API_KEY) {
    try {
      const params = new URLSearchParams({
        query,
        per_page: '5',
        orientation: 'landscape',
      });

      const response = await fetch(`${PEXELS_API_URL}?${params}`, {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          const apiPhoto = data.photos[randomIndex];
          const photo: PexelsPhoto = {
            id: apiPhoto.id,
            src: apiPhoto.src.large2x || apiPhoto.src.large || apiPhoto.src.original,
            alt: apiPhoto.alt || `${timePeriod} background`,
            photographer: apiPhoto.photographer,
          };

          // Cache the result
          try {
            const cacheKey = HERO_CACHE_PREFIX + timePeriod;
            localStorage.setItem(cacheKey, JSON.stringify({ photo, timestamp: Date.now() }));
          } catch {
            // Ignore cache write errors
          }

          return photo;
        }
      }
    } catch (error) {
      console.error('Pexels API fetch failed for hero background:', error);
    }
  }

  // Fallback to static images
  return getTimeBasedHeroBackground();
}

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
