// Quiz and onboarding types

export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';
export type BiologicalSex = 'female' | 'male' | 'other' | 'prefer-not-to-say';
export type PrimaryGoal = 'identify-triggers' | 'reduce-symptoms' | 'track-patterns' | 'general-wellness';
export type BloatingFrequency = 'rarely' | 'sometimes' | 'often' | 'always';

export interface OnboardingData {
  ageRange: AgeRange;
  biologicalSex: BiologicalSex;
  primaryGoal: PrimaryGoal;
  bloatingFrequency: BloatingFrequency;
  completedAt?: string;
  medications: string[];
}

export interface RootCauseAssessment {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
  retake_number: number;
  answers: Record<string, unknown> | null;
  overall_score: number;
  primary_root_cause: string | null;
  secondary_root_cause: string | null;
  aerophagia_score: number;
  brain_gut_score: number;
  dysbiosis_score: number;
  hormonal_score: number;
  lifestyle_score: number;
  motility_score: number;
  structural_score: number;
}
