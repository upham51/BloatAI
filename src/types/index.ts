// User types
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  age_range?: string;
  biological_sex?: string;
  primary_goal?: string;
  bloating_frequency?: string;
  medications?: string[];
  onboarding_completed_at?: string;
}

// Meal entry types
export type PortionSize = 'small' | 'normal' | 'large';
export type EatingSpeed = 'slow' | 'normal' | 'fast';
export type SocialSetting = 'solo' | 'with_others';
export type RatingStatus = 'pending' | 'completed' | 'skipped';

// ============================================================
// OFFICIAL TRIGGER TAXONOMY (9 Categories)
// Catchy names with strict non-overlapping food assignments
// These are the ONLY categories the AI can detect and users can select
// ============================================================

export interface TriggerCategory {
  id: string;
  displayName: string;
  examples: string;
  color: string;
  emoji: string;
  threat: string;        // The primary issue (e.g., "Fermentation & Gas")
  mechanism: string;     // Technical term (e.g., "FODMAPs - Fructans/GOS")
}

export const TRIGGER_CATEGORIES: TriggerCategory[] = [
  {
    id: 'veggie-vengeance',
    displayName: 'Veggie Vengeance',
    examples: 'Onions, garlic, beans, broccoli, cauliflower',
    color: '#7FB069',    // Sage green
    emoji: '🥦',
    threat: 'Fermentation & Gas',
    mechanism: 'FODMAPs - Fructans/GOS'
  },
  {
    id: 'fruit-fury',
    displayName: 'Fruit Fury',
    examples: 'Apples, pears, mango, watermelon, dried fruits',
    color: '#FF6B6B',    // Coral red
    emoji: '🍎',
    threat: 'Sugar Overload',
    mechanism: 'Fructose malabsorption'
  },
  {
    id: 'gluten-gang',
    displayName: 'Gluten Gang',
    examples: 'Bread, pasta, wheat, barley, rye',
    color: '#FFB347',    // Warm wheat
    emoji: '🌾',
    threat: 'Digestion Difficulty',
    mechanism: 'Gluten proteins'
  },
  {
    id: 'dairy-drama',
    displayName: 'Dairy Drama',
    examples: 'Milk, ice cream, soft cheese, yogurt',
    color: '#87CEEB',    // Sky blue
    emoji: '🧀',
    threat: 'Enzyme Deficiency',
    mechanism: 'Lactose intolerance'
  },
  {
    id: 'bad-beef',
    displayName: 'Bad Beef',
    examples: 'Bacon, sausages, deli meats, hot dogs',
    color: '#CD5C5C',    // Indian red
    emoji: '🥓',
    threat: 'Preservatives & Histamines',
    mechanism: 'Processed meat additives'
  },
  {
    id: 'chemical-chaos',
    displayName: 'Chemical Chaos',
    examples: 'Sugar-free gum, diet foods, protein bars',
    color: '#9D84B7',    // Lavender
    emoji: '⚗️',
    threat: 'Gut Rejection',
    mechanism: 'Sugar alcohols & additives'
  },
  {
    id: 'grease-gridlock',
    displayName: 'Grease Gridlock',
    examples: 'Fried foods, butter, fatty meats, pizza',
    color: '#C77DFF',    // Purple
    emoji: '🍟',
    threat: 'Slow Digestion',
    mechanism: 'High fat content'
  },
  {
    id: 'spice-strike',
    displayName: 'Spice Strike',
    examples: 'Hot peppers, sriracha, jalapeños, curry',
    color: '#FF8E53',    // Orange
    emoji: '🌶️',
    threat: 'Physical Irritation',
    mechanism: 'Capsaicin & acids'
  },
  {
    id: 'bubble-trouble',
    displayName: 'Bubble Trouble',
    examples: 'Soda, beer, sparkling water, straws',
    color: '#95E1D3',    // Mint
    emoji: '🫧',
    threat: 'Trapped Air',
    mechanism: 'Carbonation & air swallowing'
  }
];

// ============================================================
// LEGACY CATEGORY MIGRATION MAP
// Maps old category IDs to new ones for existing data
// ============================================================
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'grains': 'gluten-gang',      // Wheat/bread → Gluten Gang (onions/garlic handled by food detection)
  'beans': 'veggie-vengeance',  // Beans/legumes → Veggie Vengeance
  'dairy': 'dairy-drama',       // Direct mapping
  'fruit': 'fruit-fury',        // Direct mapping
  'sweeteners': 'chemical-chaos', // Sugar alcohols → Chemical Chaos
  'gluten': 'gluten-gang',      // Direct mapping
  'veggies': 'veggie-vengeance', // Direct mapping
  'fatty-food': 'grease-gridlock', // Direct mapping
  'carbonated': 'bubble-trouble', // Direct mapping
  'sugar': 'fruit-fury',        // Sugar → Fruit Fury (fructose connection)
  'alcohol': 'bubble-trouble',  // Beer/wine carbonation → Bubble Trouble
  'processed': 'bad-beef'       // Processed foods → Bad Beef (closest match)
};

// Valid category IDs for validation
export const VALID_TRIGGER_IDS = TRIGGER_CATEGORIES.map(c => c.id);

export interface DetectedTrigger {
  category: string;
  food: string;
  confidence: number;
}

// Helper function to get category info
export function getTriggerCategory(id: string): TriggerCategory | undefined {
  return TRIGGER_CATEGORIES.find(c => c.id === id);
}

// Helper function to validate triggers
export function validateTriggers(triggers: DetectedTrigger[]): DetectedTrigger[] {
  return triggers.filter(trigger => {
    if (!VALID_TRIGGER_IDS.includes(trigger.category)) {
      console.warn(`Invalid trigger category detected: ${trigger.category}`);
      return false;
    }
    return true;
  });
}

export type EntryMethod = 'photo' | 'text';

export interface MealIngredient {
  name: string;
  detail: string;
  is_trigger: boolean;
  trigger_category: string | null;
}

export interface MealEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  meal_description: string;
  photo_url: string | null;
  portion_size: PortionSize | null;
  eating_speed: EatingSpeed | null;
  social_setting: SocialSetting | null;
  bloating_rating: number | null;
  rating_status: RatingStatus;
  rating_due_at: string | null;
  detected_triggers: DetectedTrigger[];
  custom_title: string | null;
  meal_emoji: string | null;
  meal_title: string | null;
  title_options: string[];
  notes: string | null;
  entry_method: EntryMethod;
}

// Common triggers for manual text entry (updated for new taxonomy)
export const COMMON_TRIGGERS = [
  // Veggie Vengeance
  { id: 'onions', name: 'Onions', category: 'veggie-vengeance' },
  { id: 'garlic', name: 'Garlic', category: 'veggie-vengeance' },
  { id: 'beans', name: 'Beans/Lentils', category: 'veggie-vengeance' },
  { id: 'broccoli', name: 'Broccoli', category: 'veggie-vengeance' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'veggie-vengeance' },
  { id: 'mushrooms', name: 'Mushrooms', category: 'veggie-vengeance' },
  // Fruit Fury
  { id: 'apples', name: 'Apples', category: 'fruit-fury' },
  { id: 'pears', name: 'Pears', category: 'fruit-fury' },
  { id: 'watermelon', name: 'Watermelon', category: 'fruit-fury' },
  { id: 'mango', name: 'Mango', category: 'fruit-fury' },
  // Gluten Gang
  { id: 'wheat', name: 'Wheat/Bread', category: 'gluten-gang' },
  { id: 'pasta', name: 'Pasta', category: 'gluten-gang' },
  // Dairy Drama
  { id: 'milk', name: 'Milk', category: 'dairy-drama' },
  { id: 'yogurt', name: 'Yogurt', category: 'dairy-drama' },
  { id: 'cheese', name: 'Soft Cheese', category: 'dairy-drama' },
  { id: 'icecream', name: 'Ice Cream', category: 'dairy-drama' },
  // Bad Beef
  { id: 'bacon', name: 'Bacon', category: 'bad-beef' },
  { id: 'sausage', name: 'Sausages', category: 'bad-beef' },
  { id: 'deli', name: 'Deli Meats', category: 'bad-beef' },
  // Chemical Chaos
  { id: 'sugarfree', name: 'Sugar-Free Gum', category: 'chemical-chaos' },
  { id: 'dietfood', name: 'Diet Foods', category: 'chemical-chaos' },
  // Grease Gridlock
  { id: 'fried', name: 'Fried Food', category: 'grease-gridlock' },
  { id: 'pizza', name: 'Pizza', category: 'grease-gridlock' },
  // Spice Strike
  { id: 'spicy', name: 'Spicy Food', category: 'spice-strike' },
  { id: 'hotsauce', name: 'Hot Sauce', category: 'spice-strike' },
  // Bubble Trouble
  { id: 'soda', name: 'Soda/Fizzy Drinks', category: 'bubble-trouble' },
  { id: 'beer', name: 'Beer', category: 'bubble-trouble' },
  { id: 'sparkling', name: 'Sparkling Water', category: 'bubble-trouble' },
  { id: 'straw', name: 'Drinking with Straw', category: 'bubble-trouble' }
];

// Quick note chips for context
export const QUICK_NOTES = [
  { emoji: '😰', label: 'Stressed' },
  { emoji: '🌙', label: 'Ate late' },
  { emoji: '⚡', label: 'Rushed' },
  { emoji: '😋', label: 'Very hungry' },
  { emoji: '🍽️', label: 'Overate' },
  { emoji: '🩸', label: 'On your period' },
];

// Insight types
export interface TriggerRanking {
  category: string;
  severity_score: number;
  frequency: number;
  confidence: number;
  explanation: string;
  example_foods: string[];
}

export interface BehavioralInsight {
  finding: string;
  data: string;
  recommendation: string;
}

export interface ProgressMetrics {
  baseline_avg: number;
  recent_avg: number;
  improvement_pct: number;
  good_days_count: number;
  best_meal_pattern: string;
  worst_meal_pattern: string;
}

export interface Recommendation {
  trigger: string;
  reason: string;
  safe_alternative: string;
}

export interface ActionPlan {
  week_1: string;
  week_2: string;
  behavioral_changes: string[];
}

export interface FODMAPEducation {
  key_category: string;
  simple_explanation: string;
  common_sources: string[];
  low_fodmap_swaps: Record<string, string>;
}

export interface InsightsData {
  summary: string;
  trigger_rankings: TriggerRanking[];
  behavioral_insights: Record<string, BehavioralInsight>;
  progress_metrics: ProgressMetrics;
  recommendations: {
    eliminate_first: Recommendation[];
    action_plan: ActionPlan;
  };
  fodmap_education: FODMAPEducation | null;
  confidence_note: string;
  next_milestone: string;
}

export interface UserInsights {
  id: string;
  user_id: string;
  generated_at: string;
  insights_data: InsightsData;
  entry_count_at_generation: number;
  confidence_score: number;
}

// Rating labels
export const RATING_LABELS: Record<number, string> = {
  1: "No bloat",
  2: "Mild",
  3: "Some",
  4: "Bad",
  5: "Awful"
};

export const RATING_EMOJIS: Record<number, string> = {
  1: "😊",
  2: "🙂",
  3: "😐",
  4: "😣",
  5: "😫"
};

// Portion size options (kept for backwards compatibility)
export const PORTION_OPTIONS: { value: PortionSize; label: string; emoji: string }[] = [
  { value: 'small', label: 'Small', emoji: '🍽️' },
  { value: 'normal', label: 'Normal', emoji: '🍽️' },
  { value: 'large', label: 'Large', emoji: '🍽️' },
];

// Eating speed options (kept for backwards compatibility)
export const SPEED_OPTIONS: { value: EatingSpeed; label: string; emoji: string }[] = [
  { value: 'slow', label: 'Slow', emoji: '🐢' },
  { value: 'normal', label: 'Normal', emoji: '🚶' },
  { value: 'fast', label: 'Fast', emoji: '🐰' },
];

// Social setting options (kept for backwards compatibility)
export const SOCIAL_OPTIONS: { value: SocialSetting; label: string; emoji: string }[] = [
  { value: 'solo', label: 'Solo', emoji: '🧘' },
  { value: 'with_others', label: 'With Others', emoji: '👥' },
];
