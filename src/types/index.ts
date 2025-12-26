// User types
export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
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
    id: 'fodmaps-fructans',
    displayName: 'FODMAPs - Fructans',
    examples: 'Wheat, bread, onions, garlic',
    color: '#FF6B6B'
  },
  {
    id: 'fodmaps-gos',
    displayName: 'FODMAPs - GOS',
    examples: 'Beans, lentils, chickpeas',
    color: '#FF8E53'
  },
  {
    id: 'fodmaps-lactose',
    displayName: 'FODMAPs - Lactose',
    examples: 'Milk, soft cheese, yogurt',
    color: '#FFA07A'
  },
  {
    id: 'fodmaps-fructose',
    displayName: 'FODMAPs - Fructose',
    examples: 'Apples, honey, mango',
    color: '#FFB347'
  },
  {
    id: 'fodmaps-polyols',
    displayName: 'FODMAPs - Polyols',
    examples: 'Sugar-free gum, stone fruits',
    color: '#FFCC5C'
  },
  {
    id: 'gluten',
    displayName: 'Gluten',
    examples: 'Wheat, barley, rye, beer',
    color: '#95E1D3'
  },
  {
    id: 'dairy',
    displayName: 'Dairy',
    examples: 'All milk products',
    color: '#A8E6CF'
  },
  {
    id: 'cruciferous',
    displayName: 'Cruciferous',
    examples: 'Broccoli, cabbage, Brussels sprouts',
    color: '#7FB069'
  },
  {
    id: 'high-fat',
    displayName: 'High-Fat/Fried',
    examples: 'Fried foods, fatty meats',
    color: '#C77DFF'
  },
  {
    id: 'carbonated',
    displayName: 'Carbonated',
    examples: 'Soda, sparkling water',
    color: '#9D84B7'
  },
  {
    id: 'refined-sugar',
    displayName: 'Refined Sugar',
    examples: 'Candy, pastries, white bread',
    color: '#E0ACD5'
  },
  {
    id: 'alcohol',
    displayName: 'Alcohol',
    examples: 'Beer, wine, spirits',
    color: '#F3B0C3'
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
}

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
