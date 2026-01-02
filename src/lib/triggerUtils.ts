// Trigger icon mapping based on category
export const TRIGGER_ICONS: Record<string, string> = {
  // FODMAP categories
  'fodmaps-fructans': '🧅',
  'fodmaps-gos': '🫘',
  'fodmaps-lactose': '🥛',
  'fodmaps-fructose': '🍎',
  'fodmaps-polyols': '🍬',
  // Other categories
  'gluten': '🌾',
  'dairy': '🥛',
  'cruciferous': '🥦',
  'high-fat': '🍟',
  'carbonated': '🫧',
  'refined-sugar': '🍭',
  'alcohol': '🍷',
  // Generic food keywords
  'protein': '🥩',
  'meat': '🥩',
  'beef': '🥩',
  'pork': '🥩',
  'chicken': '🐔',
  'fish': '🐟',
  'wheat': '🌾',
  'bread': '🍞',
  'pasta': '🍝',
  'onion': '🧅',
  'garlic': '🧄',
  'milk': '🥛',
  'cheese': '🧀',
  'cream': '🥛',
  'sugar': '🍭',
  'broccoli': '🥦',
  'cauliflower': '🥦',
  'cabbage': '🥬',
  'beans': '🫘',
  'lentils': '🫘',
  'spicy': '🌶️',
  'hot': '🌶️',
  'chili': '🌶️',
  'jalapeño': '🌶️',
  'sparkling': '🫧',
  'soda': '🫧',
  'fried': '🍟',
  'greasy': '🍟',
  'caffeine': '☕',
  'coffee': '☕',
  'tea': '🍵',
  'wine': '🍷',
  'beer': '🍺',
};

// Common ingredient transformations to shorter names
const INGREDIENT_TRANSFORMATIONS: Record<string, string> = {
  'ground beef': 'Beef',
  'ground pork': 'Pork',
  'ground chicken': 'Chicken',
  'ground turkey': 'Turkey',
  'broccoli florets': 'Broccoli',
  'cauliflower florets': 'Cauliflower',
  'red onion': 'Onion',
  'white onion': 'Onion',
  'yellow onion': 'Onion',
  'green onion': 'Scallion',
  'soy sauce': 'Soy Sauce',
  'teriyaki sauce': 'Teriyaki',
  'whole wheat pasta': 'Wheat Pasta',
  'whole wheat bread': 'Wheat Bread',
  'low-fat greek yogurt': 'Yogurt',
  'greek yogurt': 'Yogurt',
  'plain yogurt': 'Yogurt',
  'jalapeño peppers': 'Jalapeño',
  'black beans': 'Black Beans',
  'kidney beans': 'Kidney Beans',
  'sparkling mineral water': 'Sparkling',
  'sparkling water': 'Sparkling',
  'hot sauce': 'Hot Sauce',
  'chili oil': 'Chili Oil',
  'olive oil': 'Olive Oil',
  'vegetable oil': 'Oil',
  'heavy cream': 'Cream',
  'sour cream': 'Sour Cream',
  'cream cheese': 'Cream Cheese',
  'parmesan cheese': 'Parmesan',
  'cheddar cheese': 'Cheddar',
  'mozzarella cheese': 'Mozzarella',
  'brown rice': 'Rice',
  'white rice': 'Rice',
  'basmati rice': 'Rice',
};

/**
 * Normalize and abbreviate ingredient name to 1-2 words max.
 * Used for both display purposes and deduplication.
 * Removes verbose descriptors, applies common transformations, and capitalizes.
 */
export function abbreviateIngredient(ingredient: string): string {
  if (!ingredient) return '';
  
  // Remove extra details in parentheses or after commas
  let abbreviated = ingredient
    .replace(/\(.*?\)/g, '') // Remove parenthetical notes
    .split(',')[0] // Take first part before comma
    .trim();
  
  const lowerCase = abbreviated.toLowerCase();
  
  // Check for exact transformations first
  if (INGREDIENT_TRANSFORMATIONS[lowerCase]) {
    return INGREDIENT_TRANSFORMATIONS[lowerCase];
  }
  
  // Check for partial matches in transformations
  for (const [key, value] of Object.entries(INGREDIENT_TRANSFORMATIONS)) {
    if (lowerCase.includes(key)) {
      return value;
    }
  }
  
  // Remove common descriptors
  abbreviated = abbreviated
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/^(fresh|raw|cooked|grilled|fried|baked|roasted|steamed|boiled)\s+/i, '')
    .replace(/^(diced|sliced|chopped|minced|crushed|shredded)\s+/i, '')
    .replace(/^(organic|natural|homemade)\s+/i, '');
  
  // Capitalize first letter of each word, limit to 2 words
  const words = abbreviated.split(/\s+/).slice(0, 2).filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || ingredient;
}

/**
 * Get emoji icon for a trigger category or food
 */
export function getIconForTrigger(categoryOrFood: string): string {
  if (!categoryOrFood) return '🍽️';
  
  const lower = categoryOrFood.toLowerCase();
  
  // Check for exact category match first
  if (TRIGGER_ICONS[lower]) {
    return TRIGGER_ICONS[lower];
  }
  
  // Check for partial matches
  for (const [key, icon] of Object.entries(TRIGGER_ICONS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return icon;
    }
  }
  
  // Default icon
  return '🍽️';
}

/**
 * Format trigger for display with icon and abbreviated name
 */
export interface FormattedTrigger {
  icon: string;
  name: string;
  category: string;
}

export function formatTriggerDisplay(
  triggers: Array<{ category: string; food?: string }>
): FormattedTrigger[] {
  if (!triggers || triggers.length === 0) return [];
  
  return triggers.map(trigger => {
    const displayName = trigger.food || trigger.category;
    return {
      icon: getIconForTrigger(trigger.category),
      name: abbreviateIngredient(displayName),
      category: trigger.category,
    };
  });
}

// Safe food alternatives for common triggers
const SAFE_ALTERNATIVES: Record<string, string[]> = {
  'fodmaps-fructans': ['garlic-infused oil', 'green part of scallions', 'chives', 'asafoetida'],
  'fodmaps-gos': ['canned lentils (rinsed)', 'firm tofu', 'tempeh'],
  'fodmaps-lactose': ['lactose-free milk', 'hard cheeses', 'almond milk', 'oat milk'],
  'fodmaps-fructose': ['blueberries', 'strawberries', 'oranges', 'grapes'],
  'fodmaps-polyols': ['maple syrup', 'rice malt syrup', 'glucose'],
  'gluten': ['rice', 'quinoa', 'gluten-free bread', 'sourdough (long ferment)'],
  'dairy': ['lactose-free milk', 'almond milk', 'oat milk', 'coconut yogurt'],
  'cruciferous': ['carrots', 'zucchini', 'bell peppers', 'spinach', 'cucumber'],
  'high-fat': ['grilled proteins', 'baked alternatives', 'air-fried options'],
  'carbonated': ['still water', 'herbal tea', 'infused water'],
  'refined-sugar': ['maple syrup', 'stevia', 'fresh fruit'],
  'alcohol': ['mocktails', 'sparkling water with lime', 'kombucha'],
  'spicy': ['herbs like basil', 'mild paprika', 'turmeric'],
};

/**
 * Get safe alternatives for a trigger category
 */
export function getSafeAlternatives(category: string): string[] {
  const lower = category.toLowerCase();
  if (SAFE_ALTERNATIVES[lower]) {
    return SAFE_ALTERNATIVES[lower];
  }
  for (const [key, alternatives] of Object.entries(SAFE_ALTERNATIVES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return alternatives;
    }
  }
  return [];
}

/**
 * Deduplicate foods by normalizing names and merging counts
 */
export function deduplicateFoods(
  foods: Array<{ food: string; count: number }>
): Array<{ food: string; count: number }> {
  const normalized: Record<string, { food: string; count: number }> = {};

  for (const item of foods) {
    const normalizedName = abbreviateIngredient(item.food);
    const key = normalizedName.toLowerCase();

    if (normalized[key]) {
      normalized[key].count += item.count;
    } else {
      normalized[key] = { food: normalizedName, count: item.count };
    }
  }

  return Object.values(normalized).sort((a, b) => b.count - a.count);
}

/**
 * Validate percentage to ensure it's between 0-100
 */
export function validatePercentage(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.min(Math.max(Math.round(value), 0), 100);
}

/**
 * Calculate trigger frequency with validated percentages
 */
export function calculateTriggerFrequency(
  category: string,
  entries: Array<{ detected_triggers?: Array<{ category: string }> }>
): { count: number; total: number; percentage: number } {
  const totalMeals = entries.length;
  if (totalMeals === 0) return { count: 0, total: 0, percentage: 0 };
  
  const mealsWithTrigger = entries.filter(entry =>
    entry.detected_triggers?.some(t => t.category === category)
  ).length;
  
  const percentage = (mealsWithTrigger / totalMeals) * 100;
  
  return {
    count: mealsWithTrigger,
    total: totalMeals,
    percentage: validatePercentage(percentage),
  };
}

/**
 * Analyze high-bloating meals for trigger patterns
 */
export interface HighBloatingTrigger {
  category: string;
  count: number;
  total: number;
  displayText: string;
}

export function analyzeHighBloatingMeals(
  entries: Array<{ 
    bloating_rating?: number | null; 
    detected_triggers?: Array<{ category: string; food?: string }> 
  }>
): HighBloatingTrigger[] {
  const highBloatingMeals = entries.filter(m => 
    m.bloating_rating !== null && 
    m.bloating_rating !== undefined && 
    m.bloating_rating >= 4
  );
  const totalHighBloating = highBloatingMeals.length;
  
  if (totalHighBloating === 0) return [];
  
  // Count triggers in high-bloating meals
  const triggerCounts: Record<string, number> = {};
  highBloatingMeals.forEach(meal => {
    meal.detected_triggers?.forEach(trigger => {
      triggerCounts[trigger.category] = (triggerCounts[trigger.category] || 0) + 1;
    });
  });
  
  // Format for display - ensure count never exceeds total
  return Object.entries(triggerCounts)
    .map(([category, count]) => {
      const validCount = Math.min(count, totalHighBloating);
      return {
        category,
        count: validCount,
        total: totalHighBloating,
        displayText: `Found in ${validCount} of your ${totalHighBloating} high-bloating meal${totalHighBloating !== 1 ? 's' : ''}`,
      };
    })
    .sort((a, b) => b.count - a.count);
}
