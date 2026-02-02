import { getTriggerCategory, LEGACY_CATEGORY_MAP } from '@/types';

// Trigger icon mapping based on category
export const TRIGGER_ICONS: Record<string, string> = {
  // ============================================================
  // NEW 9-CATEGORY TAXONOMY
  // ============================================================
  'veggie-vengeance': '🥦',
  'fruit-fury': '🍎',
  'gluten-gang': '🌾',
  'dairy-drama': '🧀',
  'bad-beef': '🥓',
  'chemical-chaos': '⚗️',
  'grease-gridlock': '🍟',
  'spice-strike': '🌶️',
  'bubble-trouble': '🫧',

  // Legacy category mappings (for backwards compatibility)
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

  // Beverages & Bubble Trouble
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
  'straw': '🥤',
  'drinking straw': '🥤',
  'energy drink': '⚡',
  'red bull': '⚡',
  'monster': '⚡',
  'celsius': '⚡',
  'champagne': '🍾',
  'prosecco': '🍾',
  'cider': '🍺',
  'kombucha': '🫧',
  'seltzer': '🫧',
  'tonic': '🫧',
  'club soda': '🫧',

  // Bad Beef (Processed Meats)
  'hot dog': '🌭',
  'sausage': '🌭',
  'bratwurst': '🌭',
  'bologna': '🥩',
  'deli meat': '🥩',
  'spam': '🥫',
  'jerky': '🥩',
  'canned tuna': '🐟',
  'smoked fish': '🐟',

  // Chemical Chaos (Artificial stuff)
  'sugar-free': '⚗️',
  'diet': '⚗️',
  'protein bar': '⚗️',
  'low carb': '⚗️',
  'skinny': '⚗️',
  'xylitol': '⚗️',
  'sorbitol': '⚗️',
  'maltitol': '⚗️',
  'erythritol': '⚗️',
  'inulin': '⚗️',
  'chicory': '⚗️',

  // Spice Strike
  'sriracha': '🌶️',
  'tabasco': '🌶️',
  'buffalo': '🌶️',
  'habanero': '🌶️',
  'ghost pepper': '🌶️',
  'cayenne': '🌶️',
  'wasabi': '🌶️',
  'horseradish': '🌶️',

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
// Groups similar items together for better deduplication and display
const INGREDIENT_TRANSFORMATIONS: Record<string, string> = {
  // Meats
  'ground beef': 'Beef',
  'ground pork': 'Pork',
  'ground chicken': 'Chicken',
  'ground turkey': 'Turkey',
  'chicken breast': 'Chicken',
  'chicken thigh': 'Chicken',
  'chicken thighs': 'Chicken',
  'beef steak': 'Beef',
  'pork chop': 'Pork',
  'pork chops': 'Pork',

  // Vegetables
  'broccoli florets': 'Broccoli',
  'cauliflower florets': 'Cauliflower',
  'red onion': 'Onion',
  'white onion': 'Onion',
  'yellow onion': 'Onion',
  'sweet onion': 'Onion',
  'green onion': 'Scallion',
  'green onions': 'Scallion',
  'spring onion': 'Scallion',
  'spring onions': 'Scallion',
  'bell pepper': 'Bell Pepper',
  'bell peppers': 'Bell Pepper',
  'red pepper': 'Bell Pepper',
  'green pepper': 'Bell Pepper',
  'jalapeño peppers': 'Jalapeño',
  'jalapeno': 'Jalapeño',

  // Sauces - GROUP ALL SIMILAR SAUCES TOGETHER
  'soy sauce': 'Sauce',
  'teriyaki sauce': 'Sauce',
  'teriyaki': 'Sauce',
  'bbq sauce': 'Sauce',
  'barbecue sauce': 'Sauce',
  'tomato sauce': 'Sauce',
  'marinara sauce': 'Sauce',
  'pasta sauce': 'Sauce',
  'alfredo sauce': 'Sauce',
  'pesto sauce': 'Sauce',
  'hot sauce': 'Sauce',
  'sriracha': 'Sauce',
  'sriracha sauce': 'Sauce',
  'fish sauce': 'Sauce',
  'oyster sauce': 'Sauce',
  'hoisin sauce': 'Sauce',
  'worcestershire sauce': 'Sauce',
  'steak sauce': 'Sauce',
  'enchilada sauce': 'Sauce',
  'buffalo sauce': 'Sauce',
  'wing sauce': 'Sauce',
  'sweet and sour sauce': 'Sauce',
  'honey mustard sauce': 'Sauce',
  'garlic sauce': 'Sauce',
  'aioli': 'Sauce',
  'chimichurri': 'Sauce',
  'tahini sauce': 'Sauce',
  'tzatziki': 'Sauce',
  'gravy': 'Sauce',

  // Dressings - GROUP TOGETHER
  'ranch dressing': 'Dressing',
  'caesar dressing': 'Dressing',
  'italian dressing': 'Dressing',
  'balsamic dressing': 'Dressing',
  'vinaigrette': 'Dressing',
  'balsamic vinaigrette': 'Dressing',
  'honey mustard dressing': 'Dressing',
  'blue cheese dressing': 'Dressing',
  'thousand island': 'Dressing',
  'french dressing': 'Dressing',
  'salad dressing': 'Dressing',

  // Condiments
  'ketchup': 'Condiment',
  'mustard': 'Condiment',
  'dijon mustard': 'Condiment',
  'yellow mustard': 'Condiment',
  'mayonnaise': 'Condiment',
  'mayo': 'Condiment',
  'relish': 'Condiment',

  // Grains & Carbs
  'whole wheat pasta': 'Pasta',
  'wheat pasta': 'Pasta',
  'spaghetti': 'Pasta',
  'penne': 'Pasta',
  'linguine': 'Pasta',
  'fettuccine': 'Pasta',
  'rigatoni': 'Pasta',
  'macaroni': 'Pasta',
  'whole wheat bread': 'Bread',
  'white bread': 'Bread',
  'sourdough bread': 'Bread',
  'wheat bread': 'Bread',
  'rye bread': 'Bread',
  'brown rice': 'Rice',
  'white rice': 'Rice',
  'basmati rice': 'Rice',
  'jasmine rice': 'Rice',
  'fried rice': 'Rice',
  'black forbidden rice': 'Black Rice',
  'forbidden rice': 'Black Rice',

  // Dairy
  'low-fat greek yogurt': 'Yogurt',
  'greek yogurt': 'Yogurt',
  'plain yogurt': 'Yogurt',
  'vanilla yogurt': 'Yogurt',
  'heavy cream': 'Cream',
  'whipping cream': 'Cream',
  'half and half': 'Cream',
  'sour cream': 'Sour Cream',
  'cream cheese': 'Cream Cheese',
  'parmesan cheese': 'Cheese',
  'cheddar cheese': 'Cheese',
  'mozzarella cheese': 'Cheese',
  'swiss cheese': 'Cheese',
  'provolone cheese': 'Cheese',
  'american cheese': 'Cheese',
  'feta cheese': 'Cheese',
  'goat cheese': 'Cheese',
  'blue cheese': 'Cheese',
  'ricotta cheese': 'Cheese',
  'cottage cheese': 'Cheese',

  // Beans
  'black beans': 'Beans',
  'kidney beans': 'Beans',
  'pinto beans': 'Beans',
  'navy beans': 'Beans',
  'cannellini beans': 'Beans',
  'white beans': 'Beans',
  'garbanzo beans': 'Chickpeas',
  'chickpeas': 'Chickpeas',

  // Drinks
  'sparkling mineral water': 'Sparkling Water',
  'sparkling water': 'Sparkling Water',
  'soda water': 'Sparkling Water',
  'club soda': 'Sparkling Water',
  'tonic water': 'Sparkling Water',

  // Oils
  'chili oil': 'Oil',
  'olive oil': 'Oil',
  'vegetable oil': 'Oil',
  'canola oil': 'Oil',
  'sesame oil': 'Oil',
  'coconut oil': 'Oil',
  'avocado oil': 'Oil',

  // Seasonings
  'garlic powder': 'Seasoning',
  'onion powder': 'Seasoning',
  'paprika': 'Seasoning',
  'cumin': 'Seasoning',
  'oregano': 'Seasoning',
  'basil': 'Seasoning',
  'thyme': 'Seasoning',
  'rosemary': 'Seasoning',
  'italian seasoning': 'Seasoning',
  'taco seasoning': 'Seasoning',
  'cajun seasoning': 'Seasoning',
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

/**
 * Migrate a legacy category ID to the new 9-category taxonomy
 */
export function migrateLegacyCategory(category: string): string {
  // If it's already a new category, return as-is
  const newCategories = [
    'veggie-vengeance', 'fruit-fury', 'gluten-gang', 'dairy-drama',
    'bad-beef', 'chemical-chaos', 'grease-gridlock', 'spice-strike', 'bubble-trouble'
  ];
  if (newCategories.includes(category)) {
    return category;
  }
  // Otherwise, map from legacy to new
  return LEGACY_CATEGORY_MAP[category] || category;
}

export function formatTriggerDisplay(
  triggers: Array<{ category: string; food?: string }>
): FormattedTrigger[] {
  if (!triggers || triggers.length === 0) return [];

  return triggers.map(trigger => {
    // Migrate legacy category if needed
    const migratedCategory = migrateLegacyCategory(trigger.category);

    // Get the trigger category info
    const categoryInfo = getTriggerCategory(migratedCategory);
    let displayName = categoryInfo?.displayName || trigger.category;

    // For new categories, we can show the food name if it's more specific
    if (trigger.food && categoryInfo) {
      const foodLower = trigger.food.toLowerCase();
      // Show specific food names for common triggers
      if (migratedCategory === 'veggie-vengeance') {
        if (foodLower.includes('onion')) displayName = 'Onion';
        else if (foodLower.includes('garlic')) displayName = 'Garlic';
        else if (foodLower.includes('bean')) displayName = 'Beans';
        else if (foodLower.includes('broccoli')) displayName = 'Broccoli';
      } else if (migratedCategory === 'bubble-trouble') {
        if (foodLower.includes('straw')) displayName = 'Straw';
        else if (foodLower.includes('soda') || foodLower.includes('cola')) displayName = 'Soda';
        else if (foodLower.includes('beer')) displayName = 'Beer';
      }
    }

    return {
      icon: getIconForTrigger(trigger.food || migratedCategory),
      name: displayName,
      category: migratedCategory,
    };
  });
}

// ============================================================
// SAFE ALTERNATIVES - Comprehensive low-bloat options
// Based on the 9-category trigger taxonomy
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

// Comprehensive safe alternatives mapping for all 9 trigger categories
const SAFE_ALTERNATIVES_DETAILED: Record<string, TriggerAlternativesData> = {
  // ============================================================
  // 01. VEGGIE VENGEANCE - High-FODMAP Vegetables & Legumes
  // ============================================================
  'veggie-vengeance': {
    alternatives: [
      { name: 'Carrots', notes: 'Unlimited, great raw or cooked' },
      { name: 'Cucumber', notes: 'Hydrating, unlimited' },
      { name: 'Eggplant/Aubergine', notes: 'Unlimited' },
      { name: 'Green Beans', notes: 'Safe alternative to legumes' },
      { name: 'Lettuce (all types)', notes: 'Unlimited' },
      { name: 'Potatoes', notes: 'Easy to digest' },
      { name: 'Tomatoes', notes: 'Unlimited' },
      { name: 'Zucchini/Courgette', notes: 'Versatile, unlimited' },
      { name: 'Bok Choy', notes: 'Asian greens' },
      { name: 'Spinach', notes: 'Nutrient-dense' },
      { name: 'Bell Peppers', notes: 'All colors, unlimited' },
      { name: 'Kale', notes: 'Superfood' },
      { name: 'Radishes', notes: 'Crunchy, low FODMAP' },
      { name: 'Scallions (GREEN part only)', notes: 'Safe for flavor' },
      { name: 'Ginger', notes: 'Anti-inflammatory' },
      { name: 'Chives', portion: 'small amounts', notes: 'Safe herb' },
      { name: 'Firm Tofu', notes: 'Plant protein alternative' },
      { name: 'Tempeh', notes: 'Fermented soy' },
      { name: 'Eggs', notes: 'Complete protein' },
    ],
    keyBrands: ['FODY Foods (garlic-free sauces)'],
    protip: 'Onions and garlic are the biggest culprits. Use garlic-infused oil (FODMAPs don\'t transfer to oil) and green scallion tops for flavor without the bloat.',
  },

  // ============================================================
  // 02. FRUIT FURY - High-Fructose Fruits & Sweeteners
  // ============================================================
  'fruit-fury': {
    alternatives: [
      { name: 'Bananas (unripe)', notes: 'Green-tipped are best' },
      { name: 'Blueberries', portion: '1 cup', notes: 'Antioxidant-rich' },
      { name: 'Strawberries', portion: '10 berries', notes: 'Low fructose' },
      { name: 'Raspberries', portion: '⅓ cup', notes: 'High fiber' },
      { name: 'Cantaloupe', portion: '¾ cup', notes: 'Hydrating' },
      { name: 'Honeydew Melon', notes: 'Safe melon choice' },
      { name: 'Kiwi', portion: '2 kiwis', notes: 'Digestive enzymes' },
      { name: 'Oranges', portion: '1 orange', notes: 'Vitamin C' },
      { name: 'Mandarins', notes: 'Easy to digest' },
      { name: 'Lemons', notes: 'For flavor' },
      { name: 'Limes', notes: 'For flavor' },
      { name: 'Grapes', notes: 'Unlimited' },
      { name: 'Pineapple', portion: '1 cup', notes: 'Anti-inflammatory' },
      { name: 'Papaya', notes: 'Digestive enzymes' },
      { name: 'Passion Fruit', notes: 'Tropical safe option' },
      { name: 'Maple Syrup', notes: 'Safe sweetener' },
      { name: 'Rice Malt Syrup', notes: 'Fructose-free' },
      { name: 'Table Sugar (sucrose)', portion: 'small amounts', notes: 'Safer than fructose' },
      { name: 'Stevia', notes: 'Zero calorie' },
    ],
    keyBrands: [],
    protip: 'Avoid apples, pears, mango, watermelon, and all dried fruits. Fresh berries are your best friends!',
  },

  // ============================================================
  // 03. GLUTEN GANG - Wheat, Barley, Rye Products
  // ============================================================
  'gluten-gang': {
    alternatives: [
      { name: 'Rice (white, brown)', notes: 'Unlimited, easily digested' },
      { name: 'Quinoa', notes: 'Complete protein' },
      { name: 'Corn/Polenta', notes: 'Naturally GF' },
      { name: 'Buckwheat', notes: 'Despite the name, GF' },
      { name: 'Millet', notes: 'Ancient grain, safe' },
      { name: 'Tapioca', notes: 'GF starch' },
      { name: 'Gluten-free Oats', notes: 'Certified GF only' },
      { name: 'Gluten-free Bread', notes: 'Check for FODMAP ingredients' },
      { name: 'Rice Pasta', notes: 'Great pasta alternative' },
      { name: 'Gluten-free Pasta', notes: 'Many options available' },
      { name: 'Rice Cakes', notes: 'Light snack' },
      { name: 'Corn Tortillas', notes: 'Naturally GF' },
      { name: 'Rice Noodles', notes: 'Asian dishes' },
      { name: 'Potato Flour', notes: 'For baking' },
      { name: 'Almond Flour', notes: 'Low carb baking' },
      { name: 'Coconut Flour', notes: 'High fiber baking' },
    ],
    keyBrands: ['Udi\'s', 'Canyon Bakehouse', 'Schär', 'Barilla GF'],
    protip: 'Gluten-free doesn\'t always mean low FODMAP. Check labels for onion, garlic, honey, and high-FODMAP flours.',
  },

  // ============================================================
  // 04. DAIRY DRAMA - High-Lactose Milk Products
  // ============================================================
  'dairy-drama': {
    alternatives: [
      { name: 'Lactose-free Milk', notes: 'Real dairy, no lactose' },
      { name: 'Lactose-free Yogurt', notes: 'Good for probiotics' },
      { name: 'Hard Aged Cheeses', notes: 'Cheddar, Swiss, Parmesan - very low lactose' },
      { name: 'Brie', notes: 'Aged soft cheese, low lactose' },
      { name: 'Camembert', notes: 'Aged soft cheese, low lactose' },
      { name: 'Mozzarella (aged)', notes: 'Not fresh mozzarella' },
      { name: 'Feta', notes: 'Moderate lactose, small portions' },
      { name: 'Goat Cheese (aged)', notes: 'Easier to digest' },
      { name: 'Havarti', notes: 'Semi-hard, low lactose' },
      { name: 'Almond Milk', notes: 'Dairy-free option' },
      { name: 'Coconut Milk', notes: 'Creamy alternative' },
      { name: 'Rice Milk', notes: 'Light option' },
      { name: 'Oat Milk', notes: 'Check for additives' },
    ],
    keyBrands: ['Lactaid', 'Fairlife', 'Green Valley Creamery'],
    protip: 'Hard aged cheeses like cheddar and parmesan have almost no lactose. The longer the aging, the better! Avoid soft fresh cheeses like ricotta and cottage cheese.',
  },

  // ============================================================
  // 05. BAD BEEF - Processed/Cured/Aged Meats
  // ============================================================
  'bad-beef': {
    alternatives: [
      { name: 'Grilled Chicken', notes: 'Fresh, unprocessed' },
      { name: 'Baked Fish (fresh)', notes: 'Not canned or smoked' },
      { name: 'Plain Cooked Beef', notes: 'Fresh cuts, not deli' },
      { name: 'Plain Cooked Pork', notes: 'Fresh, not bacon/ham' },
      { name: 'Plain Cooked Lamb', notes: 'Fresh cuts' },
      { name: 'Plain Cooked Turkey', notes: 'Fresh, not deli' },
      { name: 'Fresh Seafood', notes: 'Shrimp, prawns, lobster' },
      { name: 'Mussels', notes: 'Fresh, not canned' },
      { name: 'Oysters', notes: 'Fresh' },
      { name: 'Eggs', notes: 'Versatile protein' },
      { name: 'Firm Tofu', notes: 'Plant protein' },
      { name: 'Tempeh', notes: 'Fermented option' },
      { name: 'Pea Protein', notes: 'Plant-based powder' },
    ],
    keyBrands: [],
    protip: 'The key is FRESH meat without preservatives. Avoid deli counters, cured meats, and anything with nitrates/nitrites. Cook your own protein!',
  },

  // ============================================================
  // 06. CHEMICAL CHAOS - Artificial Sweeteners & Additives
  // ============================================================
  'chemical-chaos': {
    alternatives: [
      { name: 'Fresh Whole Foods', notes: 'Best option always' },
      { name: 'Homemade Foods', notes: 'Control ingredients' },
      { name: 'Maple Syrup', notes: 'Natural sweetener' },
      { name: 'Rice Malt Syrup', notes: 'Fructose-free' },
      { name: 'Table Sugar', portion: 'small amounts', notes: 'Better than sugar alcohols' },
      { name: 'Stevia', notes: 'Natural zero-calorie' },
      { name: 'Fresh Fruits', notes: 'Low FODMAP options' },
      { name: 'Unsulphured Dried Fruits', notes: 'No sulfites added' },
      { name: 'Regular Gum', notes: 'Not sugar-free' },
      { name: 'Dark Chocolate', portion: '30g', notes: 'No sugar alcohols' },
    ],
    keyBrands: ['FODY Foods (no artificial additives)'],
    protip: 'Avoid anything ending in "-ol" (sorbitol, xylitol, maltitol, erythritol). Also watch out for inulin/chicory root fiber in "healthy" products - major bloat trigger!',
  },

  // ============================================================
  // 07. GREASE GRIDLOCK - High-Fat & Fried Foods
  // ============================================================
  'grease-gridlock': {
    alternatives: [
      { name: 'Grilled Proteins', notes: 'Chicken, fish, lean meat' },
      { name: 'Baked Proteins', notes: 'Oven-roasted' },
      { name: 'White Fish', notes: 'Cod, tilapia - very lean' },
      { name: 'Steamed Vegetables', notes: 'No added fat' },
      { name: 'Air-fried Options', notes: 'Less oil, same crunch' },
      { name: 'Lean Meats', notes: 'Chicken breast, turkey' },
      { name: 'Olive Oil', portion: 'small amounts', notes: 'Light cooking' },
      { name: 'Moderate Portions', notes: 'Smaller servings of fatty foods' },
    ],
    keyBrands: [],
    protip: 'High fat slows digestion, causing food to ferment longer in your gut. Steam, bake, grill, or air-fry instead of deep-frying. Pizza is a triple threat: fat + wheat + cheese!',
  },

  // ============================================================
  // 08. SPICE STRIKE - Hot Peppers & Irritating Acids
  // ============================================================
  'spice-strike': {
    alternatives: [
      { name: 'Basil', notes: 'Mild, aromatic' },
      { name: 'Oregano', notes: 'Mediterranean flavor' },
      { name: 'Thyme', notes: 'Subtle herb' },
      { name: 'Ginger', portion: 'small amounts', notes: 'Actually helps digestion' },
      { name: 'Turmeric', notes: 'Anti-inflammatory' },
      { name: 'Paprika (mild)', notes: 'Not hot paprika' },
      { name: 'Fresh Herbs', notes: 'Parsley, cilantro, dill' },
      { name: 'Lemon Juice', portion: 'for flavor', notes: 'Small amounts' },
      { name: 'Cumin', notes: 'Warm, not hot' },
      { name: 'Coriander', notes: 'Mild spice' },
    ],
    keyBrands: [],
    protip: 'Capsaicin in hot peppers literally irritates your stomach lining. Vinegar and tomato paste (concentrated) can do the same. Build tolerance slowly if you love spice!',
  },

  // ============================================================
  // 09. BUBBLE TROUBLE - Carbonation & Air-Swallowing
  // ============================================================
  'bubble-trouble': {
    alternatives: [
      { name: 'Still Water', notes: 'Best hydration' },
      { name: 'Herbal Teas', notes: 'Peppermint soothes digestion' },
      { name: 'Ginger Tea', notes: 'Anti-bloating' },
      { name: 'Coffee', notes: 'No carbonation' },
      { name: 'Regular Tea', notes: 'Still beverage' },
      { name: 'Non-carbonated Flavored Water', notes: 'Infused water' },
      { name: 'Fresh Juice', notes: 'Low FODMAP fruits' },
      { name: 'Eat Slowly', notes: 'Chew 20-30 times per bite' },
      { name: 'Calm Environment', notes: 'Avoid eating while stressed' },
      { name: 'No Straws', notes: 'Drink from the glass' },
      { name: 'Stop at 80% Full', notes: 'Don\'t overeat' },
    ],
    keyBrands: [],
    protip: 'It\'s not just soda - beer, sparkling water, and even drinking through straws introduce air. Eating too fast and talking while eating are sneaky culprits too!',
  },

  // ============================================================
  // LEGACY MAPPINGS (for backwards compatibility)
  // ============================================================
  'grains': {
    alternatives: [
      { name: 'Sourdough bread', portion: '2 slices', notes: 'Long fermented' },
      { name: 'Gluten-free bread', notes: 'Rice/corn-based' },
      { name: 'Rice pasta', notes: 'Easy to digest' },
      { name: 'White rice', notes: 'Unlimited' },
      { name: 'Quinoa', notes: 'Unlimited' },
      { name: 'Garlic-infused oil', notes: 'For flavor' },
      { name: 'Scallions', notes: 'Green parts only' },
    ],
    keyBrands: ['Udi\'s', 'Barilla GF'],
    protip: 'Sourdough\'s fermentation naturally breaks down fructans.',
  },
  'beans': {
    alternatives: [
      { name: 'Edamame', portion: '½ cup', notes: 'Lowest FODMAP' },
      { name: 'Canned lentils', portion: '¼ cup', notes: 'Rinse well' },
      { name: 'Firm tofu', notes: 'Unlimited' },
      { name: 'Tempeh', portion: '100g', notes: 'Fermented soy' },
      { name: 'Eggs', notes: 'Unlimited protein' },
    ],
    keyBrands: [],
    protip: 'Canned beans have fewer FODMAPs than dried. Rinse well.',
  },
  'dairy': {
    alternatives: [
      { name: 'Lactose-free milk', notes: 'Real dairy' },
      { name: 'Hard cheeses', notes: 'Cheddar, parmesan' },
      { name: 'Almond milk', notes: 'Dairy-free' },
    ],
    keyBrands: ['Lactaid', 'Fairlife'],
    protip: 'Aged cheeses have almost no lactose.',
  },
  'fruit': {
    alternatives: [
      { name: 'Blueberries', portion: '1 cup' },
      { name: 'Strawberries', portion: '10 berries' },
      { name: 'Oranges', portion: '1 orange' },
      { name: 'Grapes', notes: 'Unlimited' },
    ],
    keyBrands: [],
    protip: 'Avoid apples, pears, mango, and watermelon.',
  },
  'sweeteners': {
    alternatives: [
      { name: 'Maple syrup', notes: 'Natural' },
      { name: 'Table sugar', notes: 'Safe in moderation' },
      { name: 'Stevia', notes: 'Zero calorie' },
    ],
    keyBrands: [],
    protip: 'Avoid all sugar alcohols ending in "-ol".',
  },
  'gluten': {
    alternatives: [
      { name: 'Rice', notes: 'Unlimited' },
      { name: 'Quinoa', notes: 'Complete protein' },
      { name: 'Gluten-free bread' },
      { name: 'Corn tortillas', notes: 'Naturally GF' },
    ],
    keyBrands: ['Udi\'s', 'Schär'],
    protip: 'GF doesn\'t always mean low FODMAP.',
  },
  'veggies': {
    alternatives: [
      { name: 'Bell peppers', notes: 'Unlimited' },
      { name: 'Carrots', notes: 'Unlimited' },
      { name: 'Zucchini', notes: 'Unlimited' },
      { name: 'Spinach', notes: 'Nutrient-dense' },
    ],
    keyBrands: [],
    protip: 'Avoid onions, garlic, and cruciferous veggies in large amounts.',
  },
  'fatty-food': {
    alternatives: [
      { name: 'Grilled chicken', notes: 'Lean protein' },
      { name: 'Baked fish', notes: 'Not fried' },
      { name: 'Air-fried options', notes: 'Less oil' },
    ],
    keyBrands: [],
    protip: 'Bake, grill, or air-fry instead of deep-frying.',
  },
  'carbonated': {
    alternatives: [
      { name: 'Still water', notes: 'Best hydration' },
      { name: 'Herbal tea', notes: 'Peppermint, ginger' },
      { name: 'Infused water', notes: 'Cucumber, mint' },
    ],
    keyBrands: [],
    protip: 'CO₂ causes bloating even in low FODMAP drinks.',
  },
  'sugar': {
    alternatives: [
      { name: 'Dark chocolate', portion: '30g' },
      { name: 'Fresh fruit', notes: 'Low FODMAP options' },
    ],
    keyBrands: [],
    protip: 'Use maple syrup instead of honey.',
  },
  'alcohol': {
    alternatives: [
      { name: 'Red/white wine', portion: '5 oz' },
      { name: 'Vodka', portion: '1 shot' },
      { name: 'Gin', portion: '1 shot' },
    ],
    keyBrands: [],
    protip: 'Avoid beer and rum.',
  },
  'processed': {
    alternatives: [
      { name: 'Plain potato chips', notes: 'Check ingredients' },
      { name: 'Popcorn', notes: 'Air-popped' },
      { name: 'Rice crackers' },
    ],
    keyBrands: ['FODY Foods', 'Skinny Pop'],
    protip: 'Check for hidden onion/garlic powder.',
  },
};

// Simple alternatives array (includes both new and legacy categories)
const SAFE_ALTERNATIVES: Record<string, string[]> = {
  // New 9-category taxonomy
  'veggie-vengeance': ['carrots', 'cucumber', 'bell peppers', 'zucchini', 'spinach', 'lettuce', 'tomatoes', 'potatoes', 'green beans', 'scallions (green part)'],
  'fruit-fury': ['blueberries (1 cup)', 'strawberries (10)', 'oranges', 'grapes', 'kiwi', 'pineapple (1 cup)', 'bananas (unripe)', 'cantaloupe'],
  'gluten-gang': ['rice', 'quinoa', 'gluten-free bread', 'corn tortillas', 'rice pasta', 'buckwheat', 'gluten-free oats'],
  'dairy-drama': ['lactose-free milk', 'hard aged cheeses', 'almond milk', 'coconut milk', 'lactose-free yogurt', 'oat milk'],
  'bad-beef': ['grilled chicken', 'baked fish', 'fresh beef', 'fresh pork', 'eggs', 'tofu', 'tempeh', 'fresh seafood'],
  'chemical-chaos': ['fresh whole foods', 'maple syrup', 'table sugar', 'stevia', 'homemade foods', 'regular gum'],
  'grease-gridlock': ['grilled proteins', 'baked fish', 'steamed vegetables', 'air-fried options', 'lean meats', 'white fish'],
  'spice-strike': ['basil', 'oregano', 'thyme', 'ginger', 'turmeric', 'mild paprika', 'fresh herbs', 'cumin'],
  'bubble-trouble': ['still water', 'herbal tea', 'ginger tea', 'coffee', 'fresh juice', 'eat slowly', 'no straws'],
  // Legacy categories
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
