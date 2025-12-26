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

export interface DetectedTrigger {
  category: string;
  food: string;
  confidence: number;
}

export interface MealEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  meal_description: string;
  photo_url: string | null;
  portion_size: PortionSize;
  eating_speed: EatingSpeed;
  social_setting: SocialSetting;
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

// Portion size options
export const PORTION_OPTIONS: { value: PortionSize; label: string; emoji: string }[] = [
  { value: 'small', label: 'Small', emoji: '🍽️' },
  { value: 'normal', label: 'Normal', emoji: '🍽️' },
  { value: 'large', label: 'Large', emoji: '🍽️' },
];

// Eating speed options
export const SPEED_OPTIONS: { value: EatingSpeed; label: string; emoji: string }[] = [
  { value: 'slow', label: 'Slow', emoji: '🐢' },
  { value: 'normal', label: 'Normal', emoji: '🚶' },
  { value: 'fast', label: 'Fast', emoji: '🐰' },
];

// Social setting options
export const SOCIAL_OPTIONS: { value: SocialSetting; label: string; emoji: string }[] = [
  { value: 'solo', label: 'Solo', emoji: '🧘' },
  { value: 'with_others', label: 'With Others', emoji: '👥' },
];

// FODMAP trigger categories
export const TRIGGER_CATEGORIES = [
  'FODMAPs-fructans',
  'FODMAPs-GOS',
  'FODMAPs-lactose',
  'FODMAPs-fructose',
  'FODMAPs-polyols',
  'gluten',
  'dairy',
  'cruciferous',
  'high-fat',
  'carbonated',
  'refined-sugar',
  'alcohol',
] as const;

export type TriggerCategory = typeof TRIGGER_CATEGORIES[number];

// Trigger category display names and colors
export const TRIGGER_DISPLAY: Record<string, { name: string; color: string }> = {
  'FODMAPs-fructans': { name: 'Fructans', color: 'bg-orange-100 text-orange-800' },
  'FODMAPs-GOS': { name: 'GOS', color: 'bg-yellow-100 text-yellow-800' },
  'FODMAPs-lactose': { name: 'Lactose', color: 'bg-blue-100 text-blue-800' },
  'FODMAPs-fructose': { name: 'Fructose', color: 'bg-pink-100 text-pink-800' },
  'FODMAPs-polyols': { name: 'Polyols', color: 'bg-purple-100 text-purple-800' },
  'gluten': { name: 'Gluten', color: 'bg-amber-100 text-amber-800' },
  'dairy': { name: 'Dairy', color: 'bg-sky-100 text-sky-800' },
  'cruciferous': { name: 'Cruciferous', color: 'bg-green-100 text-green-800' },
  'high-fat': { name: 'High Fat', color: 'bg-red-100 text-red-800' },
  'carbonated': { name: 'Carbonated', color: 'bg-cyan-100 text-cyan-800' },
  'refined-sugar': { name: 'Sugar', color: 'bg-rose-100 text-rose-800' },
  'alcohol': { name: 'Alcohol', color: 'bg-violet-100 text-violet-800' },
};
