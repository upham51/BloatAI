// ============================================================
// ONBOARDING TYPES (5 Questions)
// ============================================================

export type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+';
export type BiologicalSex = 'male' | 'female';
export type PrimaryGoal = 'find-triggers' | 'track-patterns' | 'manage-symptoms' | 'general-wellness';
export type BloatingFrequency = 'daily' | 'few-times-week' | 'weekly' | 'occasionally' | 'rarely';

export interface OnboardingData {
  ageRange: AgeRange;
  biologicalSex: BiologicalSex;
  primaryGoal: PrimaryGoal;
  bloatingFrequency: BloatingFrequency;
  medications: string[];
  completedAt?: string;
}

// ============================================================
// ROOT CAUSE QUIZ TYPES (25 Questions)
// ============================================================

// Section 1: Eating & Breathing Mechanics (4Q)
export type EatingPace = 'very-fast' | 'moderate' | 'slow';
export type EatingHabit = 'chew-gum' | 'use-straws' | 'talk-eating' | 'eat-stressed' | 'carbonated-daily' | 'smoke-vape' | 'none';
export type LiquidConsumption = 'large-amounts' | 'moderate-amounts' | 'minimal' | 'rarely-drink';
export type BreathingPattern = 'often-mouth' | 'sometimes-mouth' | 'usually-nose' | 'never-noticed';

// Section 2: Gut Motor Function (4Q)
export type BowelPattern = 'less-than-3' | '3-6-weekly' | 'daily' | 'multiple-daily';
export type StoolType = 'type-1-2' | 'type-3-4' | 'type-5-6' | 'type-7';
export type EarlyFullness = 'few-bites' | 'quickly' | 'normal' | 'rarely-full';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very-active';

// Section 3: Microbial Balance (4Q)
export type AntibioticUse = '3-plus' | '1-2' | 'none';
export type AcidRefluxMeds = 'daily-ppi' | 'previous-ppi' | 'occasional-antacids' | 'never';
export type BloatingPattern = 'morning-fasting' | 'progressive-day' | 'post-meal-1-2hrs' | 'random';
export type ProbioticIntake = 'daily' | 'weekly' | 'rarely' | 'never-worse';

// Section 4: Brain-Gut Connection (5Q)
export type StressImpact = 'immediate-correlation' | 'worse-stressful' | 'minimal-connection' | 'no-relationship';
export type VacationDifference = 'significantly-better' | 'somewhat-better' | 'no-difference' | 'actually-worse';
export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type StressManagement = 'meditation' | 'exercise-3plus' | 'therapy' | 'breathing' | 'none';
export type WorkLifeBalance = 'constantly-overwhelmed' | 'frequently-stressed' | 'manageable' | 'well-balanced';

// Section 5: Hormonal & Cyclical (2Q)
export type MenstrualEffect = 'severe-bloating' | 'moderate-bloating' | 'minimal-bloating' | 'no-pattern' | 'post-menopausal-na';
export type TimeSeasonalPattern = 'evening-worse' | 'seasonal-worse' | 'consistent' | 'morning-predominant';

// Section 6: Structural & Medical (4Q)
export type SurgeryHistory = 'multiple' | 'one-significant' | 'minor-only' | 'none';
export type PelvicFloorIssues = 'diagnosed' | 'suspected' | 'post-pregnancy' | 'no-issues';
export type CurrentMedication = 'opioids' | 'antidepressants' | 'blood-pressure' | 'diabetes' | 'birth-control' | 'thyroid' | 'none';
export type DiagnosedCondition = 'ibs' | 'ibd' | 'sibo' | 'food-intolerances' | 'endometriosis' | 'hypothyroidism' | 'diabetes' | 'none';

// Section 7: Physical Activity & Posture (2Q)
export type DailyPosture = 'hunched-8plus' | 'good-sitting-6-8' | 'mix-sit-stand' | 'active-minimal-sit';
export type DigestiveActivities = 'never' | 'occasionally-1-2' | 'regularly-3-4' | 'daily';

// Complete Quiz Answers
export interface RootCauseQuizAnswers {
  // Section 1: Eating & Breathing Mechanics
  eatingPace: EatingPace;
  eatingHabits: EatingHabit[];
  liquidConsumption: LiquidConsumption;
  breathingPattern: BreathingPattern;

  // Section 2: Gut Motor Function
  bowelPattern: BowelPattern;
  stoolType: StoolType;
  earlyFullness: EarlyFullness;
  activityLevel: ActivityLevel;

  // Section 3: Microbial Balance
  antibioticUse: AntibioticUse;
  acidRefluxMeds: AcidRefluxMeds;
  bloatingPattern: BloatingPattern;
  probioticIntake: ProbioticIntake;

  // Section 4: Brain-Gut Connection
  stressImpact: StressImpact;
  vacationDifference: VacationDifference;
  sleepQuality: SleepQuality;
  stressManagement: StressManagement[];
  workLifeBalance: WorkLifeBalance;

  // Section 5: Hormonal & Cyclical
  menstrualEffect?: MenstrualEffect; // Optional for males
  timeSeasonalPattern: TimeSeasonalPattern;

  // Section 6: Structural & Medical
  surgeryHistory: SurgeryHistory;
  pelvicFloorIssues?: PelvicFloorIssues; // Optional for males
  currentMedications: CurrentMedication[];
  diagnosedConditions: DiagnosedCondition[];

  // Section 7: Physical Activity & Posture
  dailyPosture: DailyPosture;
  digestiveActivities: DigestiveActivities;
}

// ============================================================
// SCORING & RESULTS TYPES
// ============================================================

export interface CategoryScore {
  score: number;
  maxScore: number;
  level: 'Low' | 'Moderate' | 'High';
  weight: number;
}

export interface QuizScores {
  aerophagia: CategoryScore;
  motility: CategoryScore;
  dysbiosis: CategoryScore;
  brainGut: CategoryScore;
  hormonal: CategoryScore;
  structural: CategoryScore;
  lifestyle: CategoryScore;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface RootCauseAssessment {
  id: string;
  user_id: string;
  completed_at: string;

  // Category scores
  aerophagia_score: number;
  motility_score: number;
  dysbiosis_score: number;
  brain_gut_score: number;
  hormonal_score: number;
  structural_score: number;
  lifestyle_score: number;

  // Overall metrics
  overall_score: number;
  risk_level: RiskLevel;
  top_causes: string[];
  red_flags: string[];

  // AI-generated report
  ai_report_summary: string;
  ai_report_action_steps: string[];
  ai_report_long_term: string[];
  ai_report_medical_consult?: string;

  // Raw answers
  individual_answers: RootCauseQuizAnswers;

  // Metadata
  retake_number: number;
  created_at: string;
}

export interface AssessmentComparison {
  previous: RootCauseAssessment;
  current: RootCauseAssessment;
  improvements: {
    category: string;
    change: number;
    percentageChange: number;
  }[];
  overallChange: number;
}

// ============================================================
// QUIZ UI TYPES
// ============================================================

export interface QuizQuestion {
  id: string;
  section: string;
  sectionNumber: number;
  questionNumber: number;
  text: string;
  type: 'single-choice' | 'multi-choice' | 'text-input';
  options?: QuizOption[];
  explanation?: string;
  skipLogic?: (answers: Partial<RootCauseQuizAnswers>) => boolean; // Function to determine if question should be skipped
}

export interface QuizOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface QuizProgress {
  currentSection: number;
  currentQuestion: number;
  totalQuestions: number;
  percentComplete: number;
  answers: Partial<RootCauseQuizAnswers>;
}
