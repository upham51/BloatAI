/**
 * Ingredient Analyzer - Detects FODMAP triggers from ingredient lists
 * Used for barcode scanning and manual ingredient entry
 */

import { DetectedTrigger } from '@/types';

// FODMAP trigger keywords mapped to categories
const FODMAP_KEYWORDS: Record<string, { category: string; keywords: string[] }> = {
  grains: {
    category: 'grains',
    keywords: [
      'wheat', 'flour', 'bread', 'pasta', 'onion', 'onions', 'garlic',
      'shallot', 'leek', 'rye', 'barley', 'couscous', 'semolina',
      'fructan', 'inulin', 'chicory root'
    ]
  },
  beans: {
    category: 'beans',
    keywords: [
      'beans', 'lentils', 'lentil', 'chickpeas', 'chickpea', 'soy', 'soybean',
      'kidney bean', 'black bean', 'pinto bean', 'navy bean', 'lima bean',
      'fava bean', 'hummus', 'tofu', 'edamame'
    ]
  },
  dairy: {
    category: 'dairy',
    keywords: [
      'milk', 'cream', 'yogurt', 'yoghurt', 'cheese', 'butter', 'lactose',
      'whey', 'casein', 'buttermilk', 'sour cream', 'ice cream',
      'dairy', 'condensed milk', 'evaporated milk'
    ]
  },
  fruit: {
    category: 'fruit',
    keywords: [
      'apple', 'pear', 'mango', 'watermelon', 'cherry', 'cherries',
      'peach', 'apricot', 'plum', 'nectarine', 'persimmon',
      'dried fruit', 'raisin', 'date', 'fig', 'prune',
      'fruit juice concentrate', 'apple juice', 'pear juice'
    ]
  },
  sweeteners: {
    category: 'sweeteners',
    keywords: [
      'sorbitol', 'mannitol', 'xylitol', 'maltitol', 'isomalt',
      'sugar alcohol', 'polyol', 'sugar-free', 'aspartame',
      'high fructose corn syrup', 'corn syrup', 'agave',
      'honey', 'fructose'
    ]
  },
  gluten: {
    category: 'gluten',
    keywords: [
      'gluten', 'wheat', 'barley', 'rye', 'malt', 'brewer\'s yeast',
      'wheat starch', 'modified food starch'
    ]
  },
  veggies: {
    category: 'veggies',
    keywords: [
      'broccoli', 'cauliflower', 'cabbage', 'brussels sprouts',
      'asparagus', 'artichoke', 'mushroom', 'celery',
      'snow peas', 'sugar snap peas'
    ]
  },
  'fatty-food': {
    category: 'fatty-food',
    keywords: [
      'fried', 'deep fried', 'palm oil', 'hydrogenated',
      'trans fat', 'partially hydrogenated', 'lard',
      'bacon', 'sausage', 'fatty'
    ]
  },
  carbonated: {
    category: 'carbonated',
    keywords: [
      'carbonated', 'sparkling', 'soda', 'fizzy', 'co2',
      'carbon dioxide', 'seltzer', 'club soda'
    ]
  },
  sugar: {
    category: 'sugar',
    keywords: [
      'sugar', 'sucrose', 'glucose', 'dextrose', 'cane sugar',
      'brown sugar', 'powdered sugar', 'confectioners sugar',
      'turbinado', 'molasses', 'syrup'
    ]
  },
  alcohol: {
    category: 'alcohol',
    keywords: [
      'alcohol', 'ethanol', 'beer', 'wine', 'liquor',
      'vodka', 'rum', 'whiskey', 'gin', 'tequila'
    ]
  },
  processed: {
    category: 'processed',
    keywords: [
      'artificial', 'preservative', 'msg', 'monosodium glutamate',
      'nitrate', 'nitrite', 'sodium benzoate', 'sodium nitrite',
      'bht', 'bha', 'tbhq', 'food coloring', 'artificial flavor',
      'maltodextrin', 'modified corn starch'
    ]
  }
};

/**
 * Analyze ingredients text and detect FODMAP triggers
 * @param ingredientsText - Raw ingredients text (comma-separated list)
 * @returns Array of detected triggers
 */
export function analyzeIngredients(ingredientsText: string): DetectedTrigger[] {
  if (!ingredientsText || ingredientsText.trim().length === 0) {
    return [];
  }

  const triggers: DetectedTrigger[] = [];
  const lowerText = ingredientsText.toLowerCase();

  // Check each FODMAP category
  Object.entries(FODMAP_KEYWORDS).forEach(([_, { category, keywords }]) => {
    // Track matched keywords to avoid duplicates
    const matchedKeywords: string[] = [];

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

      if (regex.test(lowerText) && !matchedKeywords.some(k => k === keyword)) {
        matchedKeywords.push(keyword);
      }
    });

    // If we found matches in this category, add a trigger
    if (matchedKeywords.length > 0) {
      // Use the first matched keyword as the food name
      const primaryFood = matchedKeywords[0];

      // Calculate confidence based on number of matches
      // More matches = higher confidence
      const confidence = Math.min(0.5 + (matchedKeywords.length * 0.1), 0.95);

      triggers.push({
        category,
        food: capitalizeFirst(primaryFood),
        confidence
      });
    }
  });

  // Deduplicate by category (keep highest confidence)
  const uniqueTriggers = triggers.reduce((acc, trigger) => {
    const existing = acc.find(t => t.category === trigger.category);
    if (!existing || trigger.confidence > existing.confidence) {
      return [...acc.filter(t => t.category !== trigger.category), trigger];
    }
    return acc;
  }, [] as DetectedTrigger[]);

  return uniqueTriggers;
}

/**
 * Analyze a list of ingredient names (already parsed)
 * @param ingredients - Array of ingredient names
 */
export function analyzeIngredientList(ingredients: string[]): DetectedTrigger[] {
  if (!ingredients || ingredients.length === 0) {
    return [];
  }

  // Join ingredients into a text and analyze
  const ingredientsText = ingredients.join(', ');
  return analyzeIngredients(ingredientsText);
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get a summary of detected triggers for display
 */
export function getTriggerSummary(triggers: DetectedTrigger[]): string {
  if (triggers.length === 0) {
    return 'No common FODMAP triggers detected';
  }

  if (triggers.length === 1) {
    return `Contains ${triggers[0].food}`;
  }

  if (triggers.length === 2) {
    return `Contains ${triggers[0].food} and ${triggers[1].food}`;
  }

  return `Contains ${triggers[0].food}, ${triggers[1].food}, and ${triggers.length - 2} more`;
}

/**
 * Check if a product is likely low FODMAP
 * @param triggers - Detected triggers
 * @returns true if no high-confidence triggers found
 */
export function isLikelyLowFODMAP(triggers: DetectedTrigger[]): boolean {
  // If no triggers found, it's likely low FODMAP
  if (triggers.length === 0) return true;

  // If any high-confidence triggers (>0.7), it's not low FODMAP
  return !triggers.some(t => t.confidence > 0.7);
}
