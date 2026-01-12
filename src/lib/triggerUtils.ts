import { getTriggerCategory } from '@/types';

// Trigger icon mapping based on category
export const TRIGGER_ICONS: Record<string, string> = {
  // Simplified categories
  'grains': '🌾',
  'beans': '🫘',
  'dairy': '🥛',
  'fruit': '🍎',
  'sweeteners': '🍬',
  'gluten': '🌾',
  'veggies': '🥦',
  'fatty-food': '🍟',
  'carbonated': '🫧',
  'sugar': '🍭',
  'alcohol': '🍷',
  'processed': '📦',

  // Proteins
  'protein': '🥩',
  'meat': '🥩',
  'steak': '🥩',
  'beef': '🥩',
  'pork': '🐷',
  'bacon': '🥓',
  'ham': '🍖',
  'chicken': '🐔',
  'turkey': '🦃',
  'duck': '🦆',
  'fish': '🐟',
  'salmon': '🐟',
  'tuna': '🐟',
  'shrimp': '🦐',
  'seafood': '🦐',
  'shellfish': '🦞',
  'crab': '🦀',
  'lobster': '🦞',
  'egg': '🥚',
  'tofu': '🧈',
  'tempeh': '🧈',
  'prosciutto': '🥓',
  'pancetta': '🥓',
  'chorizo': '🌭',
  'salami': '🥓',
  'pepperoni': '🍕',
  'pastrami': '🥩',
  'corned beef': '🥩',
  'brisket': '🥩',
  'ribs': '🍖',
  'tenderloin': '🥩',
  'filet': '🥩',
  'sirloin': '🥩',
  'ribeye': '🥩',
  't-bone': '🥩',
  'porterhouse': '🥩',
  'lamb': '🍖',
  'veal': '🥩',
  'venison': '🦌',
  'trout': '🐟',
  'cod': '🐟',
  'halibut': '🐟',
  'sea bass': '🐟',
  'snapper': '🐟',
  'tilapia': '🐟',
  'catfish': '🐟',
  'mahi mahi': '🐟',
  'swordfish': '🐟',
  'anchovies': '🐟',
  'sardines': '🐟',
  'mackerel': '🐟',
  'octopus': '🐙',
  'squid': '🦑',
  'calamari': '🦑',
  'clams': '🦪',
  'mussels': '🦪',
  'oysters': '🦪',
  'scallops': '🦪',

  // Herbs & Spices
  'herb': '🌿',
  'herbs': '🌿',
  'compound herb': '🌿',
  'basil': '🌿',
  'parsley': '🌿',
  'cilantro': '🌿',
  'oregano': '🌿',
  'thyme': '🌿',
  'rosemary': '🌿',
  'mint': '🌿',
  'dill': '🌿',

  // Grains & Carbs
  'wheat': '🌾',
  'bread': '🍞',
  'pasta': '🍝',
  'rice': '🍚',
  'noodles': '🍜',
  'tortilla': '🫓',
  'bagel': '🥯',
  'croissant': '🥐',
  'cereal': '🥣',
  'oats': '🌾',
  'quinoa': '🌾',
  'corn': '🌽',
  'popcorn': '🍿',

  // Vegetables
  'vegetable': '🥗',
  'broccoli': '🥦',
  'cauliflower': '🥦',
  'cabbage': '🥬',
  'lettuce': '🥬',
  'spinach': '🥬',
  'kale': '🥬',
  'carrot': '🥕',
  'onion': '🧅',
  'scallion': '🧅',
  'green onion': '🧅',
  'shallot': '🧅',
  'leek': '🧅',
  'garlic': '🧄',
  'ginger': '🧄',
  'tomato': '🍅',
  'potato': '🥔',
  'sweet potato': '🍠',
  'yam': '🍠',
  'pepper': '🫑',
  'bell pepper': '🫑',
  'cucumber': '🥒',
  'pickle': '🥒',
  'eggplant': '🍆',
  'mushroom': '🍄',
  'avocado': '🥑',
  'zucchini': '🥒',
  'squash': '🎃',
  'pumpkin': '🎃',
  'asparagus': '🌱',
  'celery': '🌱',
  'radish': '🌱',
  'beet': '🌱',

  // Beans & Legumes (specific items only - 'beans' already defined above in Simplified categories)
  'black beans': '🫘',
  'kidney beans': '🫘',
  'pinto beans': '🫘',
  'chickpeas': '🫘',
  'lentils': '🫘',
  'peas': '🫘',
  'edamame': '🫛',
  'soy': '🫛',
  'soybean': '🫛',

  // Fruits (specific items only - 'fruit' already defined above in Simplified categories)
  'apple': '🍎',
  'banana': '🍌',
  'orange': '🍊',
  'lemon': '🍋',
  'lime': '🍋',
  'grape': '🍇',
  'strawberry': '🍓',
  'berry': '🫐',
  'blueberry': '🫐',
  'raspberry': '🫐',
  'blackberry': '🫐',
  'watermelon': '🍉',
  'melon': '🍈',
  'peach': '🍑',
  'pear': '🍐',
  'cherry': '🍒',
  'pineapple': '🍍',
  'mango': '🥭',
  'kiwi': '🥝',
  'coconut': '🥥',

  // Dairy
  'milk': '🥛',
  'cheese': '🧀',
  'cream': '🥛',
  'butter': '🧈',
  'yogurt': '🥛',
  'ice cream': '🍦',
  'mascarpone': '🧀',
  'ricotta': '🧀',
  'feta': '🧀',
  'goat cheese': '🧀',
  'brie': '🧀',
  'camembert': '🧀',
  'gorgonzola': '🧀',
  'blue cheese': '🧀',
  'gouda': '🧀',
  'swiss': '🧀',
  'provolone': '🧀',
  'fontina': '🧀',
  'gruyere': '🧀',
  'manchego': '🧀',
  'pecorino': '🧀',
  'asiago': '🧀',
  'havarti': '🧀',
  'bocconcini': '🧀',
  'burrata': '🧀',
  'queso': '🧀',

  // Condiments & Sauces
  'sauce': '🥫',
  'jus': '🥫',
  'au jus': '🥫',
  'gravy': '🥫',
  'soy sauce': '🥫',
  'teriyaki': '🥫',
  'hot sauce': '🌶️',
  'salsa': '🍅',
  'ketchup': '🍅',
  'mustard': '🌭',
  'mayo': '🥚',
  'mayonnaise': '🥚',
  'dressing': '🥗',
  'vinegar': '🧴',
  'balsamic': '🧴',
  'oil': '🧴',
  'olive oil': '🫒',
  'sesame oil': '🧴',
  'coconut oil': '🥥',
  'honey': '🍯',
  'syrup': '🍯',
  'jam': '🍓',
  'jelly': '🍇',
  'peanut butter': '🥜',
  'almond butter': '🥜',
  'dark sauce': '🥫',
  'brown sauce': '🥫',
  'demi-glace': '🥫',
  'reduction': '🥫',
  'glaze': '🍯',
  'aioli': '🥚',
  'pesto': '🌿',
  'chimichurri': '🌿',
  'hollandaise': '🥚',
  'béarnaise': '🥚',
  'bechamel': '🥛',
  'mornay': '🧀',
  'velouté': '🥫',
  'espagnole': '🥫',
  'coulis': '🍅',
  'chutney': '🍯',
  'relish': '🥒',
  'compote': '🍓',
  'crema': '🥛',
  'crème fraîche': '🥛',
  'compound butter': '🧈',
  'herb butter': '🧈',
  'garlic butter': '🧈',
  'truffle': '🍄',
  'truffle oil': '🧴',

  // Nuts & Seeds
  'nut': '🥜',
  'peanut': '🥜',
  'almond': '🥜',
  'walnut': '🥜',
  'cashew': '🥜',
  'pistachio': '🥜',
  'seed': '🌰',
  'sesame': '🌰',
  'sunflower': '🌻',

  // Sweets & Desserts (specific items only - 'sugar' already defined above in Simplified categories)
  'candy': '🍬',
  'chocolate': '🍫',
  'cake': '🍰',
  'cookie': '🍪',
  'donut': '🍩',
  'pie': '🥧',

  // Spices & Seasonings
  'spicy': '🌶️',
  'hot': '🌶️',
  'chili': '🌶️',
  'jalapeño': '🌶️',
  'salt': '🧂',

  // Beverages
  'sparkling': '🫧',
  'soda': '🥤',
  'cola': '🥤',
  'juice': '🧃',
  'fried': '🍟',
  'greasy': '🍟',
  'caffeine': '☕',
  'coffee': '☕',
  'tea': '🍵',
  'wine': '🍷',
  'beer': '🍺',
  'cocktail': '🍹',
  'water': '💧',

  // Prepared Foods
  'pizza': '🍕',
  'burger': '🍔',
  'sandwich': '🥪',
  'taco': '🌮',
  'burrito': '🌯',
  'sushi': '🍣',
  'ramen': '🍜',
  'soup': '🍲',
  'stew': '🍲',
  'curry': '🍛',
  'salad': '🥗',
  'fries': '🍟',
  'chips': '🥔',
  'casserole': '🍲',
  'pot pie': '🥧',
  'quiche': '🥧',
  'frittata': '🍳',
  'omelet': '🍳',
  'scramble': '🍳',
  'risotto': '🍚',
  'paella': '🍚',
  'biryani': '🍚',
  'pilaf': '🍚',
  'chowder': '🍲',
  'bisque': '🍲',
  'consommé': '🍲',
  'pho': '🍜',
  'udon': '🍜',
  'soba': '🍜',
  'lo mein': '🍜',
  'pad thai': '🍜',
  'lasagna': '🍝',
  'ravioli': '🍝',
  'gnocchi': '🍝',
  'penne': '🍝',
  'fettuccine': '🍝',
  'linguine': '🍝',
  'spaghetti': '🍝',
  'carbonara': '🍝',
  'bolognese': '🍝',
  'marinara': '🍝',
  'alfredo': '🍝',
  'puttanesca': '🍝',
  'arrabbiata': '🍝',
  'pesto pasta': '🍝',

  // Cooking Techniques & Preparations
  'grilled': '🔥',
  'grill marks': '🔥',
  'charred': '🔥',
  'seared': '🔥',
  'blackened': '🔥',
  'smoked': '🔥',
  'braised': '🍲',
  'roasted': '🥩',
  'baked': '🍞',
  'broiled': '🔥',
  'pan-fried': '🍳',
  'deep-fried': '🍟',
  'sautéed': '🍳',
  'stir-fried': '🍳',
  'poached': '🥚',
  'steamed': '🥦',
  'boiled': '💧',
  'blanched': '🥬',
  'caramelized': '🍯',
  'glazed': '🍯',
  'pickled': '🥒',
  'fermented': '🫙',
  'cured': '🥓',
  'marinated': '🥫',
  'brined': '🧂',
  'confit': '🦆',
  'tempura': '🍤',
  'crispy': '🍟',
  'crunchy': '🥖',
  'tender': '🥩',
  'juicy': '🍖',
  'flaky': '🥐',
  'garnish': '🌿',
  'drizzle': '🧈',
  'topped': '🍽️',
  'stuffed': '🫑',
  'breaded': '🍞',
  'crusted': '🥖',
  'raw': '🐟',
  'rare': '🥩',
  'medium rare': '🥩',
  'medium': '🥩',
  'well done': '🥩',
  'au gratin': '🧀',
  'en croute': '🥐',
  'flambe': '🔥',
  'julienned': '🥕',
  'diced': '🔪',
  'minced': '🔪',
  'sliced': '🔪',
  'chopped': '🔪',
  'shredded': '🧀',
  'grated': '🧀',
  'whipped': '🥛',
  'mashed': '🥔',
  'puréed': '🥫',
  'seasoned': '🧂',
  'spiced': '🌶️',
  'zested': '🍋',
  'infused': '🌿',
  'emulsion': '🥚',
  'roux': '🧈',
  'stock': '🍲',
  'broth': '🍲',
  'bouillon': '🍲',
  'marinade': '🥫',
  'brine': '🧂',
  'rub': '🧂',
  'crust': '🍞',
  'coating': '🍞',
  'batter': '🥞',
  'dough': '🍞',
  'pastry': '🥐',
  'phyllo': '🥐',
  'puff pastry': '🥐',
  'shortcrust': '🥧',
  'tart': '🥧',
  'galette': '🥧',
  'crumble': '🥧',
  'crisp': '🥧',
  'cobbler': '🥧',
  'mousse': '🍮',
  'custard': '🍮',
  'crème': '🍮',
  'flan': '🍮',
  'pudding': '🍮',
  'panna cotta': '🍮',
  'tiramisu': '🍰',
  'cheesecake': '🍰',
  'torte': '🍰',
  'gelato': '🍨',
  'sorbet': '🍨',
  'sherbet': '🍨',
  'granita': '🍧',
  'parfait': '🍨',
  'sundae': '🍨',
  'milkshake': '🥤',
  'smoothie': '🥤',
  'frappe': '🥤',
  'latte': '☕',
  'cappuccino': '☕',
  'espresso': '☕',
  'americano': '☕',
  'macchiato': '☕',
  'mocha': '☕',
  'matcha': '🍵',
  'chai': '🍵',
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
  'black forbidden rice': 'Black Forbidden Rice',
  'forbidden rice': 'Forbidden Rice',
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
 * Get category-based fallback emoji for unknown foods
 */
function getCategoryFallbackIcon(categoryOrFood: string): string {
  const lower = categoryOrFood.toLowerCase();

  // FODMAP categories
  if (lower.includes('fructan') || lower.includes('wheat') || lower.includes('gluten')) return '🌾';
  if (lower.includes('lactose') || lower.includes('dairy') || lower.includes('milk')) return '🥛';
  if (lower.includes('fructose') || lower.includes('sugar')) return '🍯';
  if (lower.includes('polyol')) return '🍬';
  if (lower.includes('gos') || lower.includes('bean') || lower.includes('legume')) return '🫘';

  // Food categories
  if (lower.includes('veggies') || lower.includes('vegetable') || lower.includes('greens')) return '🥬';
  if (lower.includes('protein') || lower.includes('meat')) return '🥩';
  if (lower.includes('fish') || lower.includes('seafood')) return '🐟';
  if (lower.includes('fat') || lower.includes('fried') || lower.includes('oil')) return '🍟';
  if (lower.includes('carbonated') || lower.includes('soda')) return '🫧';
  if (lower.includes('alcohol') || lower.includes('wine') || lower.includes('beer')) return '🍷';
  if (lower.includes('fruit')) return '🍎';
  if (lower.includes('grain') || lower.includes('rice') || lower.includes('pasta')) return '🍚';
  if (lower.includes('sauce') || lower.includes('condiment')) return '🥫';
  if (lower.includes('spice') || lower.includes('herb')) return '🌿';

  // Default
  return '🍽️';
}

/**
 * Get emoji icon for a trigger category or food
 */
export function getIconForTrigger(categoryOrFood: string): string {
  if (!categoryOrFood) return '🍽️';

  const lower = categoryOrFood.toLowerCase().trim();

  // Check for exact match first
  if (TRIGGER_ICONS[lower]) {
    return TRIGGER_ICONS[lower];
  }

  // Check for whole-word matches only (avoid "steak" matching "tea")
  const words = lower.split(/[\s\-/]+/);
  for (const word of words) {
    if (TRIGGER_ICONS[word]) {
      return TRIGGER_ICONS[word];
    }
  }

  // Check if any key is a whole word within the input
  for (const [key, icon] of Object.entries(TRIGGER_ICONS)) {
    // Only match if key appears as a complete word
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lower)) {
      return icon;
    }
  }

  // Use category-based fallback instead of generic plate
  return getCategoryFallbackIcon(lower);
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
    // Get the trigger category info
    const categoryInfo = getTriggerCategory(trigger.category);
    let displayName = categoryInfo?.displayName || trigger.category;

    // Special handling for onion and garlic - show as "Onion (Fructans)" or "Garlic (Fructans)"
    if (trigger.food) {
      const foodLower = trigger.food.toLowerCase();
      if (foodLower.includes('onion') && trigger.category === 'grains') {
        displayName = 'Onion (Fructans)';
      } else if (foodLower.includes('garlic') && trigger.category === 'grains') {
        displayName = 'Garlic (Fructans)';
      }
    }

    return {
      icon: getIconForTrigger(trigger.food || trigger.category),
      name: displayName,
      category: trigger.category,
    };
  });
}

// ============================================================
// SAFE ALTERNATIVES - Comprehensive FODMAP-friendly options
// Based on Monash University research and clinical validation
// ============================================================

export interface SafeAlternativeItem {
  name: string;
  portion?: string;
  notes?: string;
}

export interface TriggerAlternativesData {
  alternatives: SafeAlternativeItem[];
  keyBrands?: string[];
  protip: string;
}

// Comprehensive safe alternatives mapping for all 12 trigger categories
const SAFE_ALTERNATIVES_DETAILED: Record<string, TriggerAlternativesData> = {
  'grains': {
    alternatives: [
      { name: 'Sourdough bread', portion: '2 slices', notes: 'Long fermented' },
      { name: 'Gluten-free bread', notes: 'Rice/corn-based' },
      { name: 'Chickpea pasta', portion: '1 cup', notes: 'Highest protein' },
      { name: 'Rice pasta', notes: 'Easy to digest' },
      { name: 'White rice', notes: 'Unlimited' },
      { name: 'Quinoa', notes: 'Unlimited' },
      { name: 'Garlic-infused oil', notes: 'For flavor' },
      { name: 'Scallions', notes: 'Green parts only' },
    ],
    keyBrands: ['Udi\'s', 'Simple Kneads', 'Barilla GF', 'Dr. Schar'],
    protip: 'Sourdough\'s fermentation naturally breaks down fructans, making it easier to digest than regular bread.',
  },
  'beans': {
    alternatives: [
      { name: 'Edamame', portion: '½ cup', notes: 'Lowest FODMAP, 9g protein' },
      { name: 'Canned lentils', portion: '¼ cup', notes: 'Rinse well' },
      { name: 'Canned chickpeas', portion: '¼ cup', notes: 'Rinse well' },
      { name: 'Firm tofu', notes: 'Unlimited, 10g protein per serving' },
      { name: 'Tempeh', portion: '100g', notes: 'Fermented soy' },
      { name: 'Eggs', notes: 'Unlimited protein' },
    ],
    keyBrands: [],
    protip: 'Canned beans have 60-70% fewer FODMAPs than dried. Always rinse thoroughly to remove the liquid.',
  },
  'dairy': {
    alternatives: [
      { name: 'Cashew milk', notes: 'Bloat score: 1 (best)' },
      { name: 'Almond milk', notes: 'Bloat score: 2' },
      { name: 'Coconut milk', notes: 'Bloat score: 3' },
      { name: 'Lactose-free milk', notes: 'Real dairy, no lactose' },
      { name: 'Hard cheeses', notes: 'Cheddar, parmesan - very low lactose' },
      { name: 'Lactose-free yogurt', notes: 'Good for probiotics' },
    ],
    keyBrands: ['Lactaid', 'Fairlife', 'Green Valley'],
    protip: 'Hard aged cheeses like cheddar and parmesan have almost no lactose. The longer the aging, the better!',
  },
  'fruit': {
    alternatives: [
      { name: 'Blueberries', portion: '1 cup', notes: 'Antioxidant-rich' },
      { name: 'Strawberries', portion: '10 berries', notes: 'Low FODMAP' },
      { name: 'Raspberries', portion: '⅓ cup', notes: 'High fiber' },
      { name: 'Oranges', portion: '1 orange', notes: 'Vitamin C' },
      { name: 'Kiwi', portion: '2 kiwis', notes: 'Digestive enzymes' },
      { name: 'Grapes', notes: 'Unlimited' },
      { name: 'Pineapple', portion: '1 cup', notes: 'Anti-inflammatory' },
      { name: 'Cantaloupe', portion: '¾ cup', notes: 'Hydrating' },
    ],
    keyBrands: [],
    protip: 'Avoid apples, pears, mango, and watermelon - they\'re high in fructose and can cause bloating.',
  },
  'sweeteners': {
    alternatives: [
      { name: 'Maple syrup', notes: 'Natural, low FODMAP' },
      { name: 'White/brown sugar', notes: 'Table sugar is safe' },
      { name: 'Rice malt syrup', notes: 'Fructose-free' },
      { name: 'Stevia', portion: '2 tsp', notes: 'Zero calorie' },
      { name: 'Glucose', notes: 'Pure glucose' },
    ],
    keyBrands: [],
    protip: 'Avoid all sugar alcohols (sorbitol, xylitol, mannitol, erythritol) - they\'re major bloating triggers.',
  },
  'gluten': {
    alternatives: [
      { name: 'White rice', notes: 'Unlimited, easily digested' },
      { name: 'Quinoa', notes: 'Complete protein' },
      { name: 'Oats', notes: 'Certified GF oats' },
      { name: 'Gluten-free bread', notes: 'Check for low FODMAP' },
      { name: 'Sourdough', portion: '2 slices', notes: 'Fermentation breaks down gluten' },
      { name: 'Rice pasta', notes: 'Great pasta alternative' },
      { name: 'Corn tortillas', notes: 'Naturally GF' },
    ],
    keyBrands: ['Udi\'s', 'Canyon Bakehouse', 'Schär'],
    protip: 'Gluten-free doesn\'t always mean low FODMAP. Check labels for onion, garlic, honey, and high-FODMAP flours.',
  },
  'veggies': {
    alternatives: [
      { name: 'Bell peppers', notes: 'All colors, unlimited' },
      { name: 'Carrots', notes: 'Unlimited, great raw or cooked' },
      { name: 'Zucchini', notes: 'Unlimited, versatile' },
      { name: 'Cucumber', notes: 'Hydrating, unlimited' },
      { name: 'Spinach', notes: 'Nutrient-dense, unlimited' },
      { name: 'Eggplant', notes: 'Unlimited' },
      { name: 'Sweet potatoes', notes: 'Complex carbs' },
      { name: 'Tomatoes', notes: 'Unlimited' },
      { name: 'Bok choy', notes: 'Asian greens' },
      { name: 'Kale', notes: 'Superfood' },
    ],
    keyBrands: [],
    protip: 'Cruciferous veggies like broccoli and cabbage are okay in small amounts (¾ cup), but unlimited bell peppers, carrots, and zucchini are safer bets.',
  },
  'fatty-food': {
    alternatives: [
      { name: 'Grilled chicken breast', notes: 'Lean protein' },
      { name: 'Baked salmon', notes: 'Omega-3s, bake instead of fry' },
      { name: 'Air-fried options', notes: 'Less oil, same crunch' },
      { name: 'Turkey', notes: 'Lean protein' },
      { name: 'Cod or tilapia', notes: 'White fish, very lean' },
      { name: 'Firm tofu', notes: 'Plant-based protein' },
      { name: 'Olive oil', notes: 'Small amounts for cooking' },
    ],
    keyBrands: [],
    protip: 'High fat slows digestion, causing food to ferment longer in your gut. Bake, grill, or air-fry instead of deep-frying.',
  },
  'carbonated': {
    alternatives: [
      { name: 'Still water', notes: 'Best hydration' },
      { name: 'Peppermint tea', notes: 'Soothes digestion' },
      { name: 'Ginger tea', notes: 'Anti-inflammatory' },
      { name: 'Rooibos tea', notes: 'Caffeine-free' },
      { name: 'Lactose-free milk', notes: 'Calcium source' },
      { name: 'Almond milk', notes: 'Dairy-free' },
      { name: 'Cranberry juice', notes: 'Low FODMAP in moderation' },
      { name: 'Infused water', notes: 'Cucumber, mint, lemon' },
    ],
    keyBrands: [],
    protip: 'The CO₂ gas in carbonated drinks causes bloating for many people, even if the drink itself is low FODMAP.',
  },
  'sugar': {
    alternatives: [
      { name: 'Dark chocolate', portion: '30g', notes: '70%+ cocoa' },
      { name: 'Lactose-free ice cream', notes: 'Real ice cream, no lactose' },
      { name: 'Plain potato chips', notes: 'Check ingredients' },
      { name: 'Popcorn', portion: '7 cups', notes: 'Air-popped or light oil' },
      { name: 'Rice crackers', notes: 'With peanut butter' },
      { name: 'Fresh fruit', notes: 'Low FODMAP options' },
      { name: 'Maple syrup treats', notes: 'Homemade with safe sweeteners' },
    ],
    keyBrands: ['Walker\'s GF shortbread', 'Made Good cookies (check ingredients)'],
    protip: 'Satisfy your sweet tooth with dark chocolate or lactose-free ice cream. Homemade treats with maple syrup are great too!',
  },
  'alcohol': {
    alternatives: [
      { name: 'Red wine', portion: '5 oz', notes: 'Low FODMAP' },
      { name: 'White wine', portion: '5 oz', notes: 'Low FODMAP' },
      { name: 'Sparkling wine', portion: '5 oz', notes: 'May cause some bloating' },
      { name: 'Vodka', portion: '1 shot', notes: 'Mix with cranberry juice' },
      { name: 'Gin', portion: '1 shot', notes: 'Try a gin & soda' },
      { name: 'Whiskey', portion: '1 shot', notes: 'Neat or on rocks' },
      { name: 'Tequila', portion: '1 shot', notes: 'Margarita with fresh lime' },
    ],
    keyBrands: [],
    protip: 'Avoid regular beer (high FODMAPs) and rum (high fructose). Stick to wine or distilled spirits with low FODMAP mixers.',
  },
  'processed': {
    alternatives: [
      { name: 'Plain potato chips', notes: 'Check for onion/garlic powder' },
      { name: 'Popcorn', notes: 'Air-popped, lightly salted' },
      { name: 'Rice crackers', notes: 'Simple ingredients' },
      { name: 'Corn tortilla chips', notes: 'Plain, unseasoned' },
      { name: 'Hard-boiled eggs', notes: 'Protein-packed snack' },
      { name: 'Cheese cubes', notes: 'Hard cheeses' },
      { name: 'FODY Foods snacks', notes: 'Certified low FODMAP' },
      { name: 'Skinny Pop', notes: 'Clean popcorn' },
    ],
    keyBrands: ['FODY Foods', 'Skinny Pop', 'Nature Valley PB bars'],
    protip: 'Check labels for hidden triggers: onion/garlic powder, honey, agave, HFCS, inulin, and sugar alcohols.',
  },
};

// Legacy simple alternatives array for backward compatibility
const SAFE_ALTERNATIVES: Record<string, string[]> = {
  'grains': ['sourdough (2 slices)', 'gluten-free bread', 'rice pasta', 'quinoa', 'garlic-infused oil', 'scallions (green parts)'],
  'beans': ['edamame (½ cup)', 'canned lentils (¼ cup, rinsed)', 'firm tofu', 'tempeh', 'eggs'],
  'dairy': ['cashew milk', 'almond milk', 'lactose-free milk', 'hard cheeses', 'coconut milk'],
  'fruit': ['blueberries (1 cup)', 'strawberries (10)', 'oranges', 'grapes', 'kiwi', 'pineapple (1 cup)'],
  'sweeteners': ['maple syrup', 'white/brown sugar', 'rice malt syrup', 'stevia (2 tsp)'],
  'gluten': ['rice', 'quinoa', 'gluten-free bread', 'sourdough (2 slices)', 'oats', 'corn tortillas'],
  'veggies': ['bell peppers', 'carrots', 'zucchini', 'cucumber', 'spinach', 'eggplant', 'sweet potatoes', 'tomatoes'],
  'fatty-food': ['grilled chicken', 'baked salmon', 'air-fried options', 'turkey', 'white fish', 'tofu'],
  'carbonated': ['still water', 'peppermint tea', 'ginger tea', 'rooibos tea', 'infused water', 'almond milk'],
  'sugar': ['dark chocolate (30g)', 'lactose-free ice cream', 'popcorn (7 cups)', 'rice crackers', 'fresh fruit'],
  'alcohol': ['red/white wine (5 oz)', 'vodka (1 shot)', 'gin (1 shot)', 'whiskey (1 shot)', 'tequila (1 shot)'],
  'processed': ['plain potato chips', 'popcorn', 'rice crackers', 'corn tortilla chips', 'hard-boiled eggs', 'FODY Foods'],
};

/**
 * Get detailed safe alternatives data for a trigger category
 */
export function getSafeAlternativesDetailed(category: string): TriggerAlternativesData | null {
  const lower = category.toLowerCase();
  if (SAFE_ALTERNATIVES_DETAILED[lower]) {
    return SAFE_ALTERNATIVES_DETAILED[lower];
  }
  for (const [key, data] of Object.entries(SAFE_ALTERNATIVES_DETAILED)) {
    if (lower.includes(key) || key.includes(lower)) {
      return data;
    }
  }
  return null;
}

/**
 * Get safe alternatives for a trigger category (simple string array)
 * @deprecated Use getSafeAlternativesDetailed for richer data
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
 * Deduplicate triggers by removing redundant triggers in the same category.
 * For example, if both "French Toast" and "Bread" are detected as fructans,
 * keep only one (prefer the more specific/complete dish name).
 * Also removes triggers with identical normalized food names.
 */
export function deduplicateTriggers<T extends { category: string; food: string; confidence?: number }>(
  triggers: T[]
): T[] {
  if (!triggers || triggers.length === 0) return [];

  // Group triggers by category
  const byCategory: Record<string, T[]> = {};

  for (const trigger of triggers) {
    if (!byCategory[trigger.category]) {
      byCategory[trigger.category] = [];
    }
    byCategory[trigger.category].push(trigger);
  }

  // Deduplicate within each category
  const deduplicated: T[] = [];

  for (const [category, categoryTriggers] of Object.entries(byCategory)) {
    if (categoryTriggers.length === 1) {
      deduplicated.push(categoryTriggers[0]);
      continue;
    }

    // Check for duplicate normalized names
    const seen = new Set<string>();
    const unique: Array<T & { normalized: string }> = [];

    for (const trigger of categoryTriggers) {
      const normalized = abbreviateIngredient(trigger.food).toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push({ ...trigger, normalized });
      }
    }

    // If still multiple triggers in the same category, prefer the more specific one
    // (longer food name = more specific, e.g., "French Toast" > "Bread")
    if (unique.length > 1) {
      // Check if one food name contains another (e.g., "French Toast" contains "toast"/"bread")
      // In that case, keep the more specific one
      const filtered = unique.filter(trigger => {
        const lowerFood = trigger.food.toLowerCase();
        // Keep this trigger if no other trigger in this category has a name that contains this one
        const isContainedByAnother = unique.some(other => {
          if (other === trigger) return false;
          const otherFood = other.food.toLowerCase();
          // Check if the other food is longer and more specific
          return otherFood.length > lowerFood.length &&
                 (otherFood.includes(lowerFood) ||
                  // Check for common ingredient relationships
                  (lowerFood === 'bread' && (otherFood.includes('toast') || otherFood.includes('sandwich'))) ||
                  (lowerFood === 'milk' && otherFood.includes('latte')) ||
                  (lowerFood === 'wheat' && otherFood.includes('bread')));
        });
        return !isContainedByAnother;
      });

      // Return the original triggers (without the 'normalized' property)
      filtered.forEach(({ normalized, ...rest }) => {
        deduplicated.push(rest as unknown as T);
      });
    } else {
      unique.forEach(({ normalized, ...rest }) => {
        deduplicated.push(rest as unknown as T);
      });
    }
  }

  return deduplicated;
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
