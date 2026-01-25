// Milestone Types for the Retention Engine
// Tracks user progress through the "Gut Health Journey"

export type MilestoneTier = 1 | 2 | 3 | 4 | 5;

export type MilestoneStatus = 'locked' | 'in_progress' | 'completed';

export type ExperimentResult = 'trigger_confirmed' | 'trigger_cleared' | 'inconclusive' | null;

// Individual milestone definition
export interface Milestone {
  id: string;
  tier: MilestoneTier;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  status: MilestoneStatus;
  completedAt: string | null;
  order: number;
}

// Tier 1: First Session milestones
export interface Tier1State {
  firstMealLogged: boolean;
  firstMealLoggedAt: string | null;
  firstMealRated: boolean;
  firstMealRatedAt: string | null;
  threeMealsCompleted: boolean;
  threeMealsCompletedAt: string | null;
  patternDetectionUnlocked: boolean;
  patternDetectionUnlockedAt: string | null;
}

// Tier 2: 72-Hour Evidence Streak
export interface Tier2State {
  streakStartDate: string | null;
  day1Complete: boolean;
  day1CompletedAt: string | null;
  day2Complete: boolean;
  day2CompletedAt: string | null;
  day3Complete: boolean;
  day3CompletedAt: string | null;
  evidenceStreakComplete: boolean;
  evidenceStreakCompletedAt: string | null;
  suspectedTrigger: string | null;
  experimentsUnlocked: boolean;
  experimentsUnlockedAt: string | null;
}

// Tier 3: First Experiment
export interface Experiment {
  id: string;
  userId: string;
  triggerCategory: string;
  triggerName: string;
  hypothesis: string;
  startedAt: string;
  completedAt: string | null;
  experimentMealId: string | null;
  controlMealIds: string[];
  result: ExperimentResult;
  resultExplanation: string | null;
  bloatingWithTrigger: number | null;
  bloatingWithoutTrigger: number | null;
  percentageChange: number | null;
}

export interface Tier3State {
  experimentsCompleted: number;
  currentExperiment: Experiment | null;
  completedExperiments: Experiment[];
  firstExperimentCompleted: boolean;
  firstExperimentCompletedAt: string | null;
  causalityConfirmed: boolean;
  causalityConfirmedAt: string | null;
}

// Tier 4: 7-Day Baseline
export interface Tier4State {
  baselineStartDate: string | null;
  daysCompleted: number;
  dayCompletions: {
    day: number;
    date: string;
    mealsLogged: number;
    mealsRated: number;
    isComplete: boolean;
  }[];
  weeklyBaselineComplete: boolean;
  weeklyBaselineCompletedAt: string | null;
  aiGuideUnlocked: boolean;
  aiGuideUnlockedAt: string | null;
  aiGuideConsultation: AIGuideConsultation | null;
}

// AI Guide Consultation content
export interface AIGuideConsultation {
  generatedAt: string;
  greeting: string;
  analysis: string;
  actionPlan: {
    recommendation1: string;
    recommendation2: string;
    behavioralChanges: string[];
  };
  personalizedInsights: {
    sensitivityPattern: string;
    optimalEatingTime: string;
    confirmedTriggers: string[];
    safeFoods: string[];
  };
}

// Tier 5: 90-Day Gut Map & Blueprint
export interface Tier5State {
  journeyStartDate: string | null;
  currentDay: number;
  day30Complete: boolean;
  day30CompletedAt: string | null;
  day30Summary: string | null;
  day60Complete: boolean;
  day60CompletedAt: string | null;
  day60Summary: string | null;
  day90Complete: boolean;
  day90CompletedAt: string | null;
  blueprintUnlocked: boolean;
  blueprintUnlockedAt: string | null;
  blueprint: GutHealthBlueprint | null;
}

// The Ultimate Blueprint
export interface GutHealthBlueprint {
  generatedAt: string;
  userId: string;

  // Core Profile
  gutProfileName: string; // e.g., "The Delayed Reactor"
  gutProfileDescription: string;

  // Trigger Analysis
  confirmedTriggers: {
    category: string;
    severity: 'strong' | 'moderate' | 'mild';
    avgBloatingScore: number;
    frequency: number;
    examples: string[];
  }[];

  safeFoods: {
    category: string;
    avgBloatingScore: number;
    frequency: number;
    examples: string[];
  }[];

  // Personalized Food Pyramid
  foodPyramid: {
    avoidCompletely: string[];
    limitIntake: string[];
    enjoyFreely: string[];
    healingFoods: string[];
  };

  // Circadian Rhythm
  optimalEatingTimes: {
    breakfast: { start: string; end: string; note: string };
    lunch: { start: string; end: string; note: string };
    dinner: { start: string; end: string; note: string };
  };

  // Behavioral Insights
  behavioralPatterns: {
    finding: string;
    impact: 'positive' | 'negative' | 'neutral';
    recommendation: string;
  }[];

  // Progress Over Time
  progressJourney: {
    week1Avg: number;
    week4Avg: number;
    week8Avg: number;
    week12Avg: number;
    overallImprovement: number;
  };

  // Weekly Summary
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  weekendVsWeekday: 'better_weekends' | 'better_weekdays' | 'similar';
}

// Complete Milestone State
export interface MilestoneState {
  userId: string;
  tier1: Tier1State;
  tier2: Tier2State;
  tier3: Tier3State;
  tier4: Tier4State;
  tier5: Tier5State;

  // Overall progress
  currentTier: MilestoneTier;
  totalMealsLogged: number;
  totalMealsRated: number;
  currentStreak: number;
  longestStreak: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Default initial state
export const getInitialMilestoneState = (userId: string): MilestoneState => ({
  userId,
  tier1: {
    firstMealLogged: false,
    firstMealLoggedAt: null,
    firstMealRated: false,
    firstMealRatedAt: null,
    threeMealsCompleted: false,
    threeMealsCompletedAt: null,
    patternDetectionUnlocked: false,
    patternDetectionUnlockedAt: null,
  },
  tier2: {
    streakStartDate: null,
    day1Complete: false,
    day1CompletedAt: null,
    day2Complete: false,
    day2CompletedAt: null,
    day3Complete: false,
    day3CompletedAt: null,
    evidenceStreakComplete: false,
    evidenceStreakCompletedAt: null,
    suspectedTrigger: null,
    experimentsUnlocked: false,
    experimentsUnlockedAt: null,
  },
  tier3: {
    experimentsCompleted: 0,
    currentExperiment: null,
    completedExperiments: [],
    firstExperimentCompleted: false,
    firstExperimentCompletedAt: null,
    causalityConfirmed: false,
    causalityConfirmedAt: null,
  },
  tier4: {
    baselineStartDate: null,
    daysCompleted: 0,
    dayCompletions: [],
    weeklyBaselineComplete: false,
    weeklyBaselineCompletedAt: null,
    aiGuideUnlocked: false,
    aiGuideUnlockedAt: null,
    aiGuideConsultation: null,
  },
  tier5: {
    journeyStartDate: null,
    currentDay: 0,
    day30Complete: false,
    day30CompletedAt: null,
    day30Summary: null,
    day60Complete: false,
    day60CompletedAt: null,
    day60Summary: null,
    day90Complete: false,
    day90CompletedAt: null,
    blueprintUnlocked: false,
    blueprintUnlockedAt: null,
    blueprint: null,
  },
  currentTier: 1,
  totalMealsLogged: 0,
  totalMealsRated: 0,
  currentStreak: 0,
  longestStreak: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Milestone definitions for UI
export const MILESTONE_DEFINITIONS: Milestone[] = [
  // Tier 1
  {
    id: 'first_meal',
    tier: 1,
    title: 'First Data Point',
    description: 'Log your first meal to begin your gut health journey',
    shortDescription: 'Log first meal',
    icon: '🍽️',
    status: 'in_progress',
    completedAt: null,
    order: 1,
  },
  {
    id: 'first_rating',
    tier: 1,
    title: 'First Feedback',
    description: 'Rate how your first meal made you feel',
    shortDescription: 'Rate first meal',
    icon: '⭐',
    status: 'locked',
    completedAt: null,
    order: 2,
  },
  {
    id: 'three_meals',
    tier: 1,
    title: 'Pattern Seeker',
    description: 'Log and rate 3 meals to unlock pattern detection',
    shortDescription: '3 meals rated',
    icon: '📊',
    status: 'locked',
    completedAt: null,
    order: 3,
  },
  {
    id: 'pattern_detection',
    tier: 1,
    title: 'Pattern Detection',
    description: 'AI analysis is now active on your meals',
    shortDescription: 'AI activated',
    icon: '🔬',
    status: 'locked',
    completedAt: null,
    order: 4,
  },
  // Tier 2
  {
    id: 'evidence_day1',
    tier: 2,
    title: 'Day 1 Evidence',
    description: 'Complete your first day of the 72-hour evidence streak',
    shortDescription: 'Day 1 complete',
    icon: '1️⃣',
    status: 'locked',
    completedAt: null,
    order: 5,
  },
  {
    id: 'evidence_day2',
    tier: 2,
    title: 'Day 2 Evidence',
    description: 'Continue building your evidence with day 2 data',
    shortDescription: 'Day 2 complete',
    icon: '2️⃣',
    status: 'locked',
    completedAt: null,
    order: 6,
  },
  {
    id: 'evidence_day3',
    tier: 2,
    title: 'Evidence Collector',
    description: 'Complete 72 hours of continuous tracking',
    shortDescription: 'Day 3 complete',
    icon: '🏆',
    status: 'locked',
    completedAt: null,
    order: 7,
  },
  // Tier 3
  {
    id: 'first_experiment',
    tier: 3,
    title: 'First Experiment',
    description: 'Complete your first elimination experiment',
    shortDescription: 'Experiment done',
    icon: '🧪',
    status: 'locked',
    completedAt: null,
    order: 8,
  },
  // Tier 4
  {
    id: 'weekly_baseline',
    tier: 4,
    title: '7-Day Baseline',
    description: 'Complete a full week of tracking including weekends',
    shortDescription: 'Week complete',
    icon: '📅',
    status: 'locked',
    completedAt: null,
    order: 9,
  },
  {
    id: 'ai_guide',
    tier: 4,
    title: 'AI Guide Unlocked',
    description: 'Receive your personalized AI gut health consultation',
    shortDescription: 'AI Guide ready',
    icon: '🤖',
    status: 'locked',
    completedAt: null,
    order: 10,
  },
  // Tier 5
  {
    id: 'day_30',
    tier: 5,
    title: '30-Day Milestone',
    description: 'One month of gut health tracking complete',
    shortDescription: '30 days',
    icon: '🌟',
    status: 'locked',
    completedAt: null,
    order: 11,
  },
  {
    id: 'day_60',
    tier: 5,
    title: '60-Day Milestone',
    description: 'Two months of dedication to your gut health',
    shortDescription: '60 days',
    icon: '💫',
    status: 'locked',
    completedAt: null,
    order: 12,
  },
  {
    id: 'day_90',
    tier: 5,
    title: 'Blueprint Unlocked',
    description: 'Your complete Gut Health Blueprint is ready',
    shortDescription: 'Blueprint ready',
    icon: '👑',
    status: 'locked',
    completedAt: null,
    order: 13,
  },
];

// Insight tab definitions
export type InsightTab = 'analysis' | 'experiments' | 'blueprint' | 'ai_guide';

export interface InsightTabDefinition {
  id: InsightTab;
  title: string;
  icon: string;
  description: string;
  unlockRequirement: string;
  unlockCheckFn: (state: MilestoneState) => boolean;
}

export const INSIGHT_TABS: InsightTabDefinition[] = [
  {
    id: 'analysis',
    title: 'Analysis',
    icon: '📊',
    description: 'Your personalized gut health analysis and trigger insights',
    unlockRequirement: 'Log and rate 3 meals',
    unlockCheckFn: (state) => state.tier1.patternDetectionUnlocked,
  },
  {
    id: 'experiments',
    title: 'Experiments',
    icon: '🧪',
    description: 'Scientific experiments to confirm your triggers',
    unlockRequirement: 'Complete the 72-hour evidence streak',
    unlockCheckFn: (state) => state.tier2.experimentsUnlocked,
  },
  {
    id: 'ai_guide',
    title: 'AI Guide',
    icon: '🤖',
    description: 'Your personal AI gut health consultant',
    unlockRequirement: 'Complete your 7-day baseline',
    unlockCheckFn: (state) => state.tier4.aiGuideUnlocked,
  },
  {
    id: 'blueprint',
    title: 'Blueprint',
    icon: '📋',
    description: 'Your complete 90-day Gut Health Blueprint',
    unlockRequirement: 'Complete 90 days of tracking',
    unlockCheckFn: (state) => state.tier5.blueprintUnlocked,
  },
];
