/**
 * Open Food Facts API Integration
 * Free API for barcode scanning and product information
 * Documentation: https://world.openfoodfacts.org/data
 */

export interface OpenFoodFactsProduct {
  product_name: string;
  brands?: string;
  ingredients_text?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
  };
  nutrient_levels?: {
    fat?: string;
    salt?: string;
    'saturated-fat'?: string;
    sugars?: string;
  };
  image_url?: string;
  categories?: string;
  allergens?: string;
  traces?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
  code?: string;
}

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

/**
 * Fetch product information by barcode
 * @param barcode - The product barcode (EAN-13, UPC, etc.)
 * @returns Product information or null if not found
 */
export async function getProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(`${BASE_URL}/product/${barcode}.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OpenFoodFactsResponse = await response.json();

    // Status 1 means product found, 0 means not found
    if (data.status === 1 && data.product) {
      return data.product;
    }

    return null;
  } catch (error) {
    console.error('Error fetching product from Open Food Facts:', error);
    throw error;
  }
}

/**
 * Search products by name
 * @param query - Search query
 * @param page - Page number (default: 1)
 * @param pageSize - Results per page (default: 20)
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<OpenFoodFactsProduct[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&json=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Parse ingredients text to extract individual ingredients
 * @param ingredientsText - Raw ingredients text from product
 * @returns Array of ingredient names
 */
export function parseIngredients(ingredientsText?: string): string[] {
  if (!ingredientsText) return [];

  // Remove percentages and special characters, split by common delimiters
  const cleaned = ingredientsText
    .replace(/\d+\.?\d*%/g, '') // Remove percentages
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\[[^\]]*\]/g, ''); // Remove bracket content

  // Split by comma, semicolon, and "and"
  const ingredients = cleaned
    .split(/[,;]|\sand\s/i)
    .map(ing => ing.trim())
    .filter(ing => ing.length > 2); // Filter out very short strings

  return ingredients;
}

/**
 * Get nutrition summary for display
 * @param product - Open Food Facts product
 */
export function getNutritionSummary(product: OpenFoodFactsProduct) {
  const nutriments = product.nutriments || {};

  return {
    calories: nutriments['energy-kcal_100g'] || 0,
    protein: nutriments['proteins_100g'] || 0,
    carbs: nutriments['carbohydrates_100g'] || 0,
    fat: nutriments['fat_100g'] || 0,
    fiber: nutriments['fiber_100g'] || 0,
    sugar: nutriments['sugars_100g'] || 0,
  };
}

/**
 * Check if a product contains common allergens
 * @param product - Open Food Facts product
 */
export function getAllergens(product: OpenFoodFactsProduct): string[] {
  const allergens: string[] = [];

  if (product.allergens) {
    const allergenList = product.allergens.split(',').map(a => a.trim());
    allergens.push(...allergenList);
  }

  if (product.traces) {
    const tracesList = product.traces.split(',').map(t => `May contain: ${t.trim()}`);
    allergens.push(...tracesList);
  }

  return allergens;
}
