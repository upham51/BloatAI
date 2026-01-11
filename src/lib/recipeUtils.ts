/**
 * Recipe search utilities for opening recipe searches in the browser
 */

/**
 * Opens a Pinterest recipe search for the given food in a new tab
 * @param foodName - Name of the food to search for (e.g., "Zucchini", "Rice")
 * @example
 * openRecipeSearch("Zucchini") // Opens: https://www.pinterest.com/search/pins/?q=healthy+zucchini+recipes
 */
export function openRecipeSearch(foodName: string): void {
  // Clean and format the food name for URL
  const cleanFoodName = foodName.trim().toLowerCase();

  // Build Pinterest search URL with "healthy {food} recipes" query
  const searchQuery = `healthy ${cleanFoodName} recipes`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${encodedQuery}`;

  // Open in new tab
  window.open(pinterestUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Alternative: Opens a Google recipe search for the given food
 * @param foodName - Name of the food to search for
 */
export function openGoogleRecipeSearch(foodName: string): void {
  const cleanFoodName = foodName.trim().toLowerCase();
  const searchQuery = `healthy simple ${cleanFoodName} recipes`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const googleUrl = `https://www.google.com/search?q=${encodedQuery}`;

  window.open(googleUrl, '_blank', 'noopener,noreferrer');
}
