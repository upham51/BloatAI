/**
 * Spoonacular API Integration
 * Free tier: 150 requests/day
 * Documentation: https://spoonacular.com/food-api/docs
 *
 * To use this API, you need to:
 * 1. Sign up at https://spoonacular.com/food-api/console
 * 2. Get your API key
 * 3. Add VITE_SPOONACULAR_API_KEY to your .env file
 */

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  summary?: string;
  cuisines?: string[];
  diets?: string[];
  dishTypes?: string[];
  instructions?: string;
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  image?: string;
}

export interface RecipeSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || '';
const BASE_URL = 'https://api.spoonacular.com';

/**
 * Search for recipes by ingredients (what can I make with these ingredients?)
 * @param ingredients - Array of ingredient names
 * @param number - Number of recipes to return (default: 10)
 */
export async function searchRecipesByIngredients(
  ingredients: string[],
  number: number = 10
): Promise<Recipe[]> {
  try {
    if (!API_KEY) {
      console.warn('Spoonacular API key not configured. Please add VITE_SPOONACULAR_API_KEY to .env');
      return [];
    }

    const ingredientsParam = ingredients.join(',');
    const response = await fetch(
      `${BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsParam)}&number=${number}&apiKey=${API_KEY}&ranking=2`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const recipes: Recipe[] = await response.json();
    return recipes;
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    throw error;
  }
}

/**
 * Search for recipes with dietary restrictions (e.g., low FODMAP)
 * @param query - Search query
 * @param diet - Diet type (e.g., 'gluten free', 'dairy free', 'low fodmap')
 * @param intolerances - Array of intolerances to exclude
 * @param number - Number of recipes to return
 */
export async function searchRecipesWithRestrictions(
  query: string = '',
  diet?: string,
  intolerances: string[] = [],
  number: number = 10
): Promise<RecipeSearchResponse> {
  try {
    if (!API_KEY) {
      console.warn('Spoonacular API key not configured');
      return { results: [], offset: 0, number: 0, totalResults: 0 };
    }

    const params = new URLSearchParams({
      apiKey: API_KEY,
      number: number.toString(),
      addRecipeInformation: 'true',
      fillIngredients: 'true',
    });

    if (query) params.append('query', query);
    if (diet) params.append('diet', diet);
    if (intolerances.length > 0) params.append('intolerances', intolerances.join(','));

    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RecipeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching recipes with restrictions:', error);
    throw error;
  }
}

/**
 * Get detailed recipe information by ID
 * @param recipeId - Recipe ID
 */
export async function getRecipeDetails(recipeId: number): Promise<Recipe | null> {
  try {
    if (!API_KEY) {
      console.warn('Spoonacular API key not configured');
      return null;
    }

    const response = await fetch(
      `${BASE_URL}/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=false`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const recipe: Recipe = await response.json();
    return recipe;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
}

/**
 * Get recipe suggestions based on user's safe foods
 * This function filters out recipes containing FODMAP triggers
 * @param safeIngredients - Array of safe ingredient names
 * @param excludeTriggers - Array of FODMAP categories to avoid
 * @param number - Number of recipes to return
 */
export async function getSafeFoodRecipes(
  safeIngredients: string[],
  excludeTriggers: string[] = [],
  number: number = 10
): Promise<Recipe[]> {
  try {
    if (!API_KEY) {
      console.warn('Spoonacular API key not configured');
      return [];
    }

    // Map FODMAP triggers to Spoonacular intolerances
    const intoleranceMap: Record<string, string> = {
      'Dairy': 'dairy',
      'Gluten': 'gluten',
      'Savory Carbs (grains)': 'grain',
    };

    const intolerances = excludeTriggers
      .map(trigger => intoleranceMap[trigger])
      .filter(Boolean);

    // If we have safe ingredients, search by them
    if (safeIngredients.length > 0) {
      return await searchRecipesByIngredients(safeIngredients, number);
    }

    // Otherwise, search for recipes avoiding triggers
    const result = await searchRecipesWithRestrictions(
      '',
      undefined,
      intolerances,
      number
    );

    return result.results;
  } catch (error) {
    console.error('Error getting safe food recipes:', error);
    return [];
  }
}

/**
 * Get low FODMAP recipe suggestions
 * Note: Spoonacular doesn't have a specific "low FODMAP" diet filter,
 * so we'll exclude common FODMAP triggers
 */
export async function getLowFODMAPRecipes(number: number = 10): Promise<Recipe[]> {
  try {
    // Exclude common high FODMAP ingredients
    const highFodmapIntolerances = [
      'wheat',
      'dairy',
      'onion',
      'garlic',
    ];

    const result = await searchRecipesWithRestrictions(
      'low fodmap',
      undefined,
      highFodmapIntolerances,
      number
    );

    return result.results;
  } catch (error) {
    console.error('Error getting low FODMAP recipes:', error);
    return [];
  }
}
