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
// OFFICIAL TRIGGER TAXONOMY (12 Categories)
// These are the ONLY categories the AI can detect and users can select
// ============================================================

export interface TriggerCategory {
  id: string;
  displayName: string;
  examples: string;
  color: string;
}

export const TRIGGER_CATEGORIES: TriggerCategory[] = [
  {
    id: 'grains',
    displayName: 'Savory Carbs',
    examples: 'Wheat, bread, onions, garlic',
    color: '#FF6B6B'
  },
  {
    id: 'beans',
    displayName: 'Beans',
    examples: 'Beans, lentils, chickpeas',
    color: '#FF8E53'
  },
  {
    id: 'dairy',
    displayName: 'Dairy',
    examples: 'Milk, cheese, yogurt',
    color: '#FFA07A'
  },
  {
    id: 'fruit',
    displayName: 'Fruit',
    examples: 'Apples, mango, pears',
    color: '#FFB347'
  },
  {
    id: 'sweeteners',
    displayName: 'Sweeteners',
    examples: 'Sugar-free gum, candy',
    color: '#FFCC5C'
  },
  {
    id: 'gluten',
    displayName: 'Gluten',
    examples: 'Wheat, barley, rye',
    color: '#95E1D3'
  },
  {
    id: 'veggies',
    displayName: 'Veggies',
    examples: 'Broccoli, cabbage',
    color: '#7FB069'
  },
  {
    id: 'fatty-food',
    displayName: 'Fatty Food',
    examples: 'Fried foods, greasy meat',
    color: '#C77DFF'
  },
  {
    id: 'carbonated',
    displayName: 'Carbonated',
    examples: 'Soda, sparkling water',
    color: '#9D84B7'
  },
  {
    id: 'sugar',
    displayName: 'Sugar',
    examples: 'Candy, pastries',
    color: '#E0ACD5'
  },
  {
    id: 'alcohol',
    displayName: 'Alcohol',
    examples: 'Beer, wine',
    color: '#F3B0C3'
  },
  {
    id: 'processed',
    displayName: 'Processed',
    examples: 'Packaged snacks, cereals',
    color: '#FFB6D9'
  }
];

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

// Common triggers for manual text entry
export const COMMON_TRIGGERS = [
  { id: 'wheat', name: 'Wheat/Bread', category: 'grains' },
  { id: 'onions', name: 'Onions', category: 'grains' },
  { id: 'garlic', name: 'Garlic', category: 'grains' },
  { id: 'beans', name: 'Beans/Lentils', category: 'beans' },
  { id: 'milk', name: 'Milk', category: 'dairy' },
  { id: 'yogurt', name: 'Yogurt', category: 'dairy' },
  { id: 'cheese', name: 'Cheese', category: 'dairy' },
  { id: 'apples', name: 'Apples', category: 'fruit' },
  { id: 'pears', name: 'Pears', category: 'fruit' },
  { id: 'watermelon', name: 'Watermelon', category: 'fruit' },
  { id: 'mushrooms', name: 'Mushrooms', category: 'sweeteners' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'sweeteners' },
  { id: 'fried', name: 'Fried Food', category: 'fatty-food' },
  { id: 'soda', name: 'Soda/Fizzy Drinks', category: 'carbonated' },
  { id: 'candy', name: 'Candy/Sweets', category: 'sugar' },
  { id: 'alcohol', name: 'Alcohol', category: 'alcohol' }
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
