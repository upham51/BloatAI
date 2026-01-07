/**
 * Shared utilities for bloating rating logic
 * Ensures consistency across the entire application
 */

/**
 * High bloating threshold - ratings at or above this are considered "high bloating"
 */
export const HIGH_BLOATING_THRESHOLD = 4;

/**
 * Low bloating threshold - ratings at or below this are considered "low/comfortable"
 */
export const LOW_BLOATING_THRESHOLD = 2;

/**
 * Moderate bloating threshold
 */
export const MODERATE_BLOATING_THRESHOLD = 3;

/**
 * Check if a bloating rating is considered "high"
 */
export function isHighBloating(rating: number | null | undefined): boolean {
  if (rating === null || rating === undefined) return false;
  return rating >= HIGH_BLOATING_THRESHOLD;
}

/**
 * Check if a bloating rating is considered "low" (comfortable)
 */
export function isLowBloating(rating: number | null | undefined): boolean {
  if (rating === null || rating === undefined) return false;
  return rating <= LOW_BLOATING_THRESHOLD;
}

/**
 * Check if a bloating rating is considered "moderate"
 */
export function isModerateBloating(rating: number | null | undefined): boolean {
  if (rating === null || rating === undefined) return false;
  return rating === MODERATE_BLOATING_THRESHOLD;
}

/**
 * Get bloating severity level
 */
export function getBloatingSeverity(rating: number | null | undefined): 'none' | 'low' | 'moderate' | 'high' | 'severe' {
  if (rating === null || rating === undefined) return 'none';
  if (rating === 1) return 'none';
  if (rating === 2) return 'low';
  if (rating === 3) return 'moderate';
  if (rating === 4) return 'high';
  if (rating === 5) return 'severe';
  return 'none';
}

/**
 * Retry helper for async operations with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Validate that a meal description meets minimum requirements
 */
export function validateMealDescription(description: string): { valid: boolean; error?: string } {
  const trimmed = description.trim();

  if (!trimmed) {
    return { valid: false, error: 'Meal description cannot be empty' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Meal description must be at least 3 characters' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Meal description is too long (max 200 characters)' };
  }

  return { valid: true };
}
