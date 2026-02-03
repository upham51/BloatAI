import { MealEntry, TRIGGER_CATEGORIES } from '@/types';
import { isHighBloating, isLowBloating } from './bloatingUtils';
import { deduplicateFoods, getSafeAlternatives, validatePercentage } from './triggerUtils';
import { getTriggerCategory } from '@/types';

// ============================================================
// NOTES PATTERN ANALYSIS
// ============================================================

export interface NotesPattern {
  type: 'stress' | 'timing' | 'rushing' | 'hunger' | 'restaurant' | 'period';
  label: string;
  keywords: string[];
  count: number;
  highBloatingCount: number;
  correlation: 'high' | 'medium' | 'low';
  avgBloating: number;
}

const NOTE_PATTERNS: Omit<NotesPattern, 'count' | 'highBloatingCount' | 'correlation' | 'avgBloating'>[] = [
  { type: 'stress', label: 'Stressed', keywords: ['stress', 'stressed', '😰', 'anxiety', 'anxious'] },
  { type: 'timing', label: 'Ate Late', keywords: ['late', '🌙', 'night', 'evening', 'bedtime'] },
  { type: 'rushing', label: 'Rushed', keywords: ['rush', 'rushed', '⚡', 'hurry', 'hurried', '🍴', 'quick', 'fast'] },
  { type: 'hunger', label: 'Very Hungry', keywords: ['hungry', '😋', 'starving', 'very hungry', 'famished'] },
  { type: 'restaurant', label: 'Restaurant', keywords: ['restaurant', '🍽️', 'dining out', 'ate out'] },
  { type: 'period', label: 'On Your Period', keywords: ['period', 'menstrual', '🩸', 'on your period', 'menstruation', 'cycle'] },
];

export function analyzeNotesPatterns(entries: MealEntry[]): NotesPattern[] {
  const completedEntries = entries.filter(e => e.rating_status === 'completed' && e.notes);

  if (completedEntries.length === 0) return [];

  const patterns = NOTE_PATTERNS.map(pattern => {
    const matchingEntries = completedEntries.filter(entry => {
      const notes = (entry.notes || '').toLowerCase();
      return pattern.keywords.some(keyword => notes.includes(keyword.toLowerCase()));
    });

    const highBloatingMatches = matchingEntries.filter(e => isHighBloating(e.bloating_rating));
    const bloatingScores = matchingEntries
      .map(e => e.bloating_rating)
      .filter((rating): rating is number => rating !== null && rating !== undefined);

    const avgBloating = bloatingScores.length > 0
      ? bloatingScores.reduce((sum, r) => sum + r, 0) / bloatingScores.length
      : 0;

    let correlation: 'high' | 'medium' | 'low' = 'low';
    if (matchingEntries.length >= 2) {
      const highBloatPercentage = (highBloatingMatches.length / matchingEntries.length) * 100;
      if (highBloatPercentage >= 60) correlation = 'high';
      else if (highBloatPercentage >= 30) correlation = 'medium';
    }

    return {
      ...pattern,
      count: matchingEntries.length,
      highBloatingCount: highBloatingMatches.length,
      correlation,
      avgBloating: Math.round(avgBloating * 10) / 10,
    };
  });

  return patterns.filter(p => p.count > 0).sort((a, b) => b.count - a.count);
}

// ============================================================
// TRIGGER FREQUENCY ANALYSIS (Extracted from InsightsPage)
// ============================================================

export interface TriggerFrequency {
  category: string;
  count: number;
  percentage: number;
  topFoods: Array<{ food: string; count: number }>;
  suspicionScore: 'high' | 'medium' | 'low';
  withHighBloating: number;
}

export function analyzeTriggerFrequency(entries: MealEntry[]): TriggerFrequency[] {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');

  if (completedEntries.length === 0) return [];

  const totalMeals = completedEntries.length;
  const highBloatingMeals = completedEntries.filter(e => isHighBloating(e.bloating_rating));
  const totalHighBloating = highBloatingMeals.length;

  const triggerMealCounts: Record<string, {
    mealsWithTrigger: Set<string>;
    foods: Map<string, number>;
    highBloatingMealsWithTrigger: Set<string>;
  }> = {};

  completedEntries.forEach(entry => {
    entry.detected_triggers?.forEach(trigger => {
      if (!triggerMealCounts[trigger.category]) {
        triggerMealCounts[trigger.category] = {
          mealsWithTrigger: new Set(),
          foods: new Map(),
          highBloatingMealsWithTrigger: new Set()
        };
      }

      triggerMealCounts[trigger.category].mealsWithTrigger.add(entry.id);

      if (trigger.food) {
        const currentCount = triggerMealCounts[trigger.category].foods.get(trigger.food) || 0;
        triggerMealCounts[trigger.category].foods.set(trigger.food, currentCount + 1);
      }

      if (isHighBloating(entry.bloating_rating)) {
        triggerMealCounts[trigger.category].highBloatingMealsWithTrigger.add(entry.id);
      }
    });
  });

  const triggerFrequencies = Object.entries(triggerMealCounts)
    .map(([category, stats]) => {
      const mealCount = stats.mealsWithTrigger.size;
      const highBloatingCount = stats.highBloatingMealsWithTrigger.size;
      const validMealCount = Math.min(mealCount, totalMeals);
      const validHighBloatingCount = Math.min(highBloatingCount, totalHighBloating);

      return {
        category,
        count: validMealCount,
        percentage: validatePercentage((validMealCount / totalMeals) * 100),
        topFoods: Array.from(stats.foods.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([food, count]) => ({ food, count })),
        suspicionScore: validMealCount >= 3 && validHighBloatingCount >= 2
          ? 'high'
          : validHighBloatingCount >= 1
            ? 'medium'
            : 'low',
        withHighBloating: validHighBloatingCount,
      } as TriggerFrequency;
    })
    .sort((a, b) => b.count - a.count);

  return triggerFrequencies;
}

// ============================================================
// COMPREHENSIVE ANALYSIS
// ============================================================

export interface ComprehensiveInsight {
  // Basic stats
  totalMeals: number;
  mealsThisWeek: number;
  highBloatingCount: number;
  lowBloatingCount: number;
  avgBloating: number;

  // Trigger analysis
  triggerFrequencies: TriggerFrequency[];
  potentialTriggers: TriggerFrequency[];
  topFoods: Array<{ food: string; count: number }>;

  // Notes patterns
  notesPatterns: NotesPattern[];

  // Comprehensive summary
  summary: {
    overview: string[];
    behavioralInsights: string[];
    rootCauseConnections: string[];
    topRecommendations: string[];
  };
}

export function generateComprehensiveInsight(
  entries: MealEntry[]
): ComprehensiveInsight | null {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');

  if (completedEntries.length < 3) return null;

  const totalMeals = completedEntries.length;
  const last7Days = completedEntries.filter(e => {
    const entryDate = new Date(e.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate > weekAgo;
  });

  const highBloatingMeals = completedEntries.filter(e => isHighBloating(e.bloating_rating));
  const lowBloatingMeals = completedEntries.filter(e => isLowBloating(e.bloating_rating));

  const bloatingScores = completedEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null && r !== undefined);
  const avgBloating = bloatingScores.reduce((sum, r) => sum + r, 0) / bloatingScores.length;

  // Trigger analysis
  const triggerFrequencies = analyzeTriggerFrequency(entries);
  const potentialTriggers = triggerFrequencies
    .filter(t => t.suspicionScore !== 'low' && t.count >= 2)
    .slice(0, 3);

  // Top foods
  const allFoods: Map<string, number> = new Map();
  completedEntries.forEach(entry => {
    entry.detected_triggers?.forEach(trigger => {
      // Use food name if available, otherwise fall back to category
      // This ensures consistency with FoodSafetyList and prevents counting discrepancies
      const foodName = trigger.food || trigger.category;
      if (foodName) {
        const current = allFoods.get(foodName) || 0;
        allFoods.set(foodName, current + 1);
      }
    });
  });

  const foodsArray = Array.from(allFoods.entries()).map(([food, count]) => ({ food, count }));
  const topFoods = deduplicateFoods(foodsArray).slice(0, 5);

  // Notes patterns
  const notesPatterns = analyzeNotesPatterns(entries);

  // Generate comprehensive summary
  const summary = generateSummary({
    totalMeals,
    avgBloating,
    highBloatingCount: highBloatingMeals.length,
    lowBloatingCount: lowBloatingMeals.length,
    potentialTriggers,
    notesPatterns,
  });

  return {
    totalMeals,
    mealsThisWeek: last7Days.length,
    highBloatingCount: highBloatingMeals.length,
    lowBloatingCount: lowBloatingMeals.length,
    avgBloating: Math.round(avgBloating * 10) / 10,
    triggerFrequencies,
    potentialTriggers,
    topFoods,
    notesPatterns,
    summary,
  };
}

// ============================================================
// SUMMARY GENERATION
// ============================================================

interface SummaryInput {
  totalMeals: number;
  avgBloating: number;
  highBloatingCount: number;
  lowBloatingCount: number;
  potentialTriggers: TriggerFrequency[];
  notesPatterns: NotesPattern[];
}

function generateSummary(input: SummaryInput) {
  const overview: string[] = [];
  const behavioralInsights: string[] = [];
  const rootCauseConnections: string[] = [];
  const topRecommendations: string[] = [];

  // Overview
  overview.push(
    `You've tracked ${input.totalMeals} meal${input.totalMeals !== 1 ? 's' : ''} with an average bloating of ${input.avgBloating.toFixed(1)}/5`
  );

  if (input.highBloatingCount > 0) {
    const percentage = Math.round((input.highBloatingCount / input.totalMeals) * 100);
    overview.push(`${percentage}% of your meals caused significant bloating (${input.highBloatingCount} meals)`);
  }

  if (input.lowBloatingCount > 0) {
    const percentage = Math.round((input.lowBloatingCount / input.totalMeals) * 100);
    overview.push(`${percentage}% of your meals were comfortable (${input.lowBloatingCount} meals)`);
  }

  // Behavioral insights from notes
  const highCorrelationPatterns = input.notesPatterns.filter(p => p.correlation === 'high');
  if (highCorrelationPatterns.length > 0) {
    highCorrelationPatterns.forEach(pattern => {
      behavioralInsights.push(
        `${pattern.label} meals have ${Math.round((pattern.highBloatingCount / pattern.count) * 100)}% bloating rate (${pattern.highBloatingCount}/${pattern.count} meals)`
      );
    });
  }

  const mediumCorrelationPatterns = input.notesPatterns.filter(p => p.correlation === 'medium');
  if (mediumCorrelationPatterns.length > 0 && behavioralInsights.length < 2) {
    mediumCorrelationPatterns.slice(0, 2 - behavioralInsights.length).forEach(pattern => {
      behavioralInsights.push(
        `${pattern.label} meals show moderate bloating (avg ${pattern.avgBloating}/5 across ${pattern.count} meals)`
      );
    });
  }

  // Root cause connections (food triggers and behavioral patterns)

  // Top recommendations
  if (input.potentialTriggers.length > 0) {
    const topTrigger = input.potentialTriggers[0];
    const triggerInfo = getTriggerCategory(topTrigger.category);
    const alternatives = getSafeAlternatives(topTrigger.category);

    if (alternatives.length > 0) {
      topRecommendations.push(
        `Try replacing ${triggerInfo?.displayName || topTrigger.category} with ${alternatives.slice(0, 2).join(' or ')}`
      );
    } else {
      topRecommendations.push(
        `Consider eliminating ${triggerInfo?.displayName || topTrigger.category} for 1-2 weeks to test sensitivity`
      );
    }
  }

  if (highCorrelationPatterns.length > 0) {
    const topPattern = highCorrelationPatterns[0];
    if (topPattern.type === 'stress') {
      topRecommendations.push('Practice stress management techniques before meals (deep breathing, mindful eating)');
    } else if (topPattern.type === 'rushing') {
      topRecommendations.push('Allow at least 20-30 minutes for meals to improve digestion and reduce bloating');
    } else if (topPattern.type === 'timing') {
      topRecommendations.push('Try eating your last meal at least 3 hours before bedtime');
    }
  }

  // Ensure we have at least one recommendation
  if (topRecommendations.length === 0) {
    topRecommendations.push('Continue logging meals to identify patterns and track your progress');
  }

  return {
    overview,
    behavioralInsights,
    rootCauseConnections,
    topRecommendations: topRecommendations.slice(0, 3), // Limit to top 3
  };
}

// ============================================================
// ADVANCED INSIGHTS FOR COMPREHENSIVE CARD
// ============================================================

export interface TriggerConfidenceLevel {
  category: string;
  confidence: 'high' | 'investigating' | 'needsData';
  confidencePercentage: number; // 0-100, based on sample size
  occurrences: number;
  avgBloatingWith: number;
  avgBloatingWithout: number;
  impactScore: number; // avgBloatingWith - avgBloatingWithout
  topFoods: string[];
  percentage: number;
  // Enhanced metrics for Spotify Wrapped UI
  enhancedImpactScore?: number; // Weighted score with consistency, frequency, recency
  consistencyFactor?: number; // 0.5-1.0: how reliably it causes bloating
  frequencyWeight?: number; // 0.8-1.5: how often user eats it
  recencyBoost?: number; // 1.0-1.2: whether it's recent
  personalBaselineAdjustment?: number; // How much above user's baseline
  recentOccurrences?: number; // Occurrences in last 7 days
}

// Helper interfaces for refactored functions
interface TriggerStats {
  occurrences: number;
  bloatingScores: number[];
  foods: Set<string>;
  highBloatingCount: number;
  recentOccurrences: number;
}

interface EnhancedMetrics {
  consistencyFactor: number;
  frequencyWeight: number;
  recencyBoost: number;
  personalBaselineAdjustment: number;
  weightedAvgWith: number;
  enhancedImpactScore: number;
}

export interface CombinationInsight {
  triggers: string[];
  occurrences: number;
  avgBloatingTogether: number;
  avgBloatingSeparate: number;
  isWorseTogether: boolean;
}

export interface WeeklyComparison {
  thisWeekAvgBloating: number;
  overallAvgBloating: number;
  thisWeekHighBloatingRate: number;
  overallHighBloatingRate: number;
  trend: 'improving' | 'worsening' | 'stable';
  newPatterns: string[];
}

export interface SuccessMetrics {
  currentAvgBloating: number;
  previousPeriodAvgBloating: number;
  improvementPercentage: number;
  currentStreak: number;
  longestStreak: number;
  comfortableMealRate: number;
  triggerAvoidanceRate: number;
}

export interface TestingRecommendation {
  type: 'reintroduce' | 'eliminate' | 'confirm';
  food: string;
  reason: string;
  daysAvoided?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ComprehensiveAdvancedInsights {
  triggerConfidence: TriggerConfidenceLevel[];
  combinations: CombinationInsight[];
  weeklyComparison: WeeklyComparison;
  successMetrics: SuccessMetrics;
  testingRecommendations: TestingRecommendation[];
  predictedBloating?: number;
}

// ============================================================
// HELPER FUNCTIONS FOR TRIGGER CONFIDENCE ANALYSIS
// ============================================================

// Collects statistics for all trigger categories from meal entries
function collectTriggerStats(
  completedEntries: MealEntry[],
  sevenDaysAgo: Date
): {
  triggerStats: Record<string, TriggerStats>;
  mealsWithoutTrigger: Record<string, number[]>;
} {
  const triggerStats: Record<string, TriggerStats> = {};
  const mealsWithoutTrigger: Record<string, number[]> = {};

  // Initialize stats for ALL categories
  TRIGGER_CATEGORIES.forEach(categoryInfo => {
    triggerStats[categoryInfo.id] = {
      occurrences: 0,
      bloatingScores: [],
      foods: new Set(),
      highBloatingCount: 0,
      recentOccurrences: 0,
    };
    mealsWithoutTrigger[categoryInfo.id] = [];
  });

  // Helper to ensure a category has initialized stats
  const ensureCategoryStats = (category: string) => {
    if (!triggerStats[category]) {
      triggerStats[category] = {
        occurrences: 0,
        bloatingScores: [],
        foods: new Set(),
        highBloatingCount: 0,
        recentOccurrences: 0,
      };
      mealsWithoutTrigger[category] = [];
    }
  };

  // Collect trigger stats from entries
  completedEntries.forEach(entry => {
    const triggersInMeal = new Set<string>();
    const entryDate = new Date(entry.created_at);
    const isRecent = entryDate > sevenDaysAgo;

    entry.detected_triggers?.forEach(trigger => {
      // Ensure stats exist for this category (handles categories not in TRIGGER_CATEGORIES)
      ensureCategoryStats(trigger.category);

      triggersInMeal.add(trigger.category);

      if (entry.bloating_rating) {
        triggerStats[trigger.category].bloatingScores.push(entry.bloating_rating);

        if (entry.bloating_rating >= 4) {
          triggerStats[trigger.category].highBloatingCount++;
        }
      }

      if (trigger.food) {
        triggerStats[trigger.category].foods.add(trigger.food);
      }
    });

    // Track meals without each trigger
    TRIGGER_CATEGORIES.forEach(categoryInfo => {
      if (!triggersInMeal.has(categoryInfo.id) && entry.bloating_rating) {
        mealsWithoutTrigger[categoryInfo.id].push(entry.bloating_rating);
      }
    });
  });

  // Count occurrences (unique meals with this trigger)
  completedEntries.forEach(entry => {
    const counted = new Set<string>();
    const entryDate = new Date(entry.created_at);
    const isRecent = entryDate > sevenDaysAgo;

    entry.detected_triggers?.forEach(trigger => {
      if (!counted.has(trigger.category)) {
        // Ensure stats exist (defensive check)
        ensureCategoryStats(trigger.category);

        triggerStats[trigger.category].occurrences++;

        if (isRecent) {
          triggerStats[trigger.category].recentOccurrences++;
        }

        counted.add(trigger.category);
      }
    });
  });

  return { triggerStats, mealsWithoutTrigger };
}

// Calculates how consistently a trigger causes bloating (0.5-1.0)
function calculateConsistencyFactor(
  highBloatingCount: number,
  occurrences: number
): number {
  if (occurrences === 0) return 0.5;

  const bloatingRate = highBloatingCount / occurrences;
  return Math.max(0.5, Math.min(1.0, 0.5 + (bloatingRate * 0.5)));
}

// Calculates weight based on how frequently the user eats this trigger (0.8-1.5)
function calculateFrequencyWeight(
  occurrences: number,
  totalMeals: number
): number {
  if (occurrences === 0 || totalMeals === 0) return 1.0;

  const frequencyRate = occurrences / totalMeals;

  if (frequencyRate >= 0.5) {
    return 1.5; // Eating in 50%+ of meals
  } else if (frequencyRate >= 0.25) {
    return 1.2; // Eating in 25-50% of meals
  } else if (frequencyRate < 0.1) {
    return 0.8; // Rarely eating it
  }

  return 1.0;
}

// Calculates boost based on recency of occurrences (1.0-1.2)
function calculateRecencyBoost(
  recentOccurrences: number,
  totalOccurrences: number
): number {
  if (recentOccurrences === 0 || totalOccurrences === 0) return 1.0;

  const recentRate = recentOccurrences / totalOccurrences;

  if (recentRate >= 0.6) {
    return 1.2; // 60%+ recent
  } else if (recentRate >= 0.3) {
    return 1.1; // 30-60% recent
  }

  return 1.0;
}

// Calculates weighted average bloating, giving more weight to severe episodes
function calculateWeightedAverage(bloatingScores: number[]): number {
  if (bloatingScores.length === 0) return 0;

  const weightedSum = bloatingScores.reduce((sum, score) => {
    const weight = score >= 4 ? 1.5 : score >= 3 ? 1.0 : 0.7;
    return sum + (score * weight);
  }, 0);

  const totalWeight = bloatingScores.reduce((sum, score) => {
    const weight = score >= 4 ? 1.5 : score >= 3 ? 1.0 : 0.7;
    return sum + weight;
  }, 0);

  return weightedSum / totalWeight;
}

// Calculates all enhanced metrics for a trigger
function calculateEnhancedMetrics(
  stats: TriggerStats,
  avgWith: number,
  avgWithout: number,
  personalBaseline: number,
  totalMeals: number
): EnhancedMetrics {
  const consistencyFactor = calculateConsistencyFactor(
    stats.highBloatingCount,
    stats.occurrences
  );

  const frequencyWeight = calculateFrequencyWeight(
    stats.occurrences,
    totalMeals
  );

  const recencyBoost = calculateRecencyBoost(
    stats.recentOccurrences,
    stats.occurrences
  );

  const personalBaselineAdjustment = avgWith - personalBaseline;
  const weightedAvgWith = calculateWeightedAverage(stats.bloatingScores);

  const enhancedImpactScore = (weightedAvgWith - avgWithout)
    * consistencyFactor
    * frequencyWeight
    * recencyBoost;

  return {
    consistencyFactor,
    frequencyWeight,
    recencyBoost,
    personalBaselineAdjustment,
    weightedAvgWith,
    enhancedImpactScore,
  };
}

// Determines confidence level based on sample size and severity
function determineConfidenceLevel(
  occurrences: number,
  avgWith: number
): 'high' | 'investigating' | 'needsData' {
  if (occurrences >= 5 && avgWith >= 3) {
    return 'high';
  } else if (occurrences >= 2 && occurrences < 5) {
    return 'investigating';
  }
  return 'needsData';
}

// Builds the final result object for a trigger category
function buildTriggerConfidenceResult(
  categoryId: string,
  stats: TriggerStats,
  avgWith: number,
  avgWithout: number,
  impactScore: number,
  confidencePercentage: number,
  confidence: 'high' | 'investigating' | 'needsData',
  enhancedMetrics: EnhancedMetrics,
  totalMeals: number
): TriggerConfidenceLevel {
  return {
    category: categoryId,
    confidence,
    confidencePercentage: Math.round(confidencePercentage),
    occurrences: stats.occurrences,
    avgBloatingWith: Math.round(avgWith * 10) / 10,
    avgBloatingWithout: Math.round(avgWithout * 10) / 10,
    impactScore: Math.round(impactScore * 10) / 10,
    topFoods: Array.from(stats.foods).slice(0, 3),
    percentage: totalMeals > 0
      ? Math.round((stats.occurrences / totalMeals) * 100)
      : 0,
    enhancedImpactScore: Math.round(enhancedMetrics.enhancedImpactScore * 100) / 100,
    consistencyFactor: Math.round(enhancedMetrics.consistencyFactor * 100) / 100,
    frequencyWeight: Math.round(enhancedMetrics.frequencyWeight * 100) / 100,
    recencyBoost: Math.round(enhancedMetrics.recencyBoost * 100) / 100,
    personalBaselineAdjustment: Math.round(enhancedMetrics.personalBaselineAdjustment * 10) / 10,
    recentOccurrences: stats.recentOccurrences,
  };
}

// ============================================================
// MAIN TRIGGER CONFIDENCE ANALYSIS
// ============================================================

// Analyze trigger confidence levels
export function analyzeTriggerConfidence(entries: MealEntry[]): TriggerConfidenceLevel[] {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');
  if (completedEntries.length === 0) return [];

  // Calculate user's personal baseline (overall average bloating)
  const allBloatingScores = completedEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null && r !== undefined);
  const personalBaseline = allBloatingScores.length > 0
    ? allBloatingScores.reduce((a, b) => a + b, 0) / allBloatingScores.length
    : 2.5;

  // Determine recent cutoff (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Collect all trigger statistics
  const { triggerStats, mealsWithoutTrigger } = collectTriggerStats(
    completedEntries,
    sevenDaysAgo
  );

  // Build results for all categories
  const results: TriggerConfidenceLevel[] = TRIGGER_CATEGORIES.map(categoryInfo => {
    const stats = triggerStats[categoryInfo.id];

    // Calculate basic averages
    const avgWith = stats.bloatingScores.length > 0
      ? stats.bloatingScores.reduce((a, b) => a + b, 0) / stats.bloatingScores.length
      : 0;

    const withoutScores = mealsWithoutTrigger[categoryInfo.id] || [];
    const avgWithout = withoutScores.length > 0
      ? withoutScores.reduce((a, b) => a + b, 0) / withoutScores.length
      : 0;

    const impactScore = avgWith - avgWithout;
    const confidencePercentage = Math.min(stats.occurrences / 5, 1.0) * 100;
    const confidence = determineConfidenceLevel(stats.occurrences, avgWith);

    // Calculate enhanced metrics
    const enhancedMetrics = calculateEnhancedMetrics(
      stats,
      avgWith,
      avgWithout,
      personalBaseline,
      completedEntries.length
    );

    return buildTriggerConfidenceResult(
      categoryInfo.id,
      stats,
      avgWith,
      avgWithout,
      impactScore,
      confidencePercentage,
      confidence,
      enhancedMetrics,
      completedEntries.length
    );
  });

  // Filter to only logged categories and sort by enhanced impact
  const loggedResults = results.filter(r => r.occurrences > 0);
  return loggedResults.sort((a, b) => {
    return (b.enhancedImpactScore || b.impactScore) - (a.enhancedImpactScore || a.impactScore);
  });
}

// Analyze food combinations
export function analyzeCombinations(entries: MealEntry[]): CombinationInsight[] {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');
  if (completedEntries.length < 5) return [];

  const combinationStats: Record<string, {
    occurrences: number;
    bloatingScores: number[];
  }> = {};

  const singleTriggerStats: Record<string, number[]> = {};

  completedEntries.forEach(entry => {
    const triggers = entry.detected_triggers?.map(t => t.category) || [];

    if (triggers.length >= 2 && entry.bloating_rating) {
      // Sort to ensure consistent combination keys
      const sorted = [...triggers].sort();

      // Check pairs
      for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}+${sorted[j]}`;

          if (!combinationStats[key]) {
            combinationStats[key] = { occurrences: 0, bloatingScores: [] };
          }

          combinationStats[key].occurrences++;
          combinationStats[key].bloatingScores.push(entry.bloating_rating);
        }
      }
    }

    // Track single trigger meals
    if (triggers.length === 1 && entry.bloating_rating) {
      const trigger = triggers[0];
      if (!singleTriggerStats[trigger]) {
        singleTriggerStats[trigger] = [];
      }
      singleTriggerStats[trigger].push(entry.bloating_rating);
    }
  });

  const combinations: CombinationInsight[] = [];

  Object.entries(combinationStats).forEach(([key, stats]) => {
    if (stats.occurrences < 2) return; // Need at least 2 occurrences

    const [trigger1, trigger2] = key.split('+');
    const avgTogether = stats.bloatingScores.reduce((a, b) => a + b, 0) / stats.bloatingScores.length;

    // Calculate average when eaten separately
    const scores1 = singleTriggerStats[trigger1] || [];
    const scores2 = singleTriggerStats[trigger2] || [];
    const allSeparateScores = [...scores1, ...scores2];

    const avgSeparate = allSeparateScores.length > 0
      ? allSeparateScores.reduce((a, b) => a + b, 0) / allSeparateScores.length
      : 0;

    const isWorseTogether = avgTogether > avgSeparate && (avgTogether - avgSeparate) >= 1;

    if (isWorseTogether || avgTogether >= 3.5) {
      combinations.push({
        triggers: [trigger1, trigger2],
        occurrences: stats.occurrences,
        avgBloatingTogether: Math.round(avgTogether * 10) / 10,
        avgBloatingSeparate: Math.round(avgSeparate * 10) / 10,
        isWorseTogether,
      });
    }
  });

  return combinations.sort((a, b) => b.avgBloatingTogether - a.avgBloatingTogether).slice(0, 3);
}

// Weekly vs Overall comparison
export function analyzeWeeklyComparison(entries: MealEntry[]): WeeklyComparison {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekEntries = completedEntries.filter(e => new Date(e.created_at) > weekAgo);
  const olderEntries = completedEntries.filter(e => new Date(e.created_at) <= weekAgo);

  const thisWeekScores = thisWeekEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null);

  const overallScores = completedEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null);

  const thisWeekAvg = thisWeekScores.length > 0
    ? thisWeekScores.reduce((a, b) => a + b, 0) / thisWeekScores.length
    : 0;

  const overallAvg = overallScores.length > 0
    ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
    : 0;

  const thisWeekHighRate = thisWeekEntries.length > 0
    ? (thisWeekEntries.filter(e => isHighBloating(e.bloating_rating)).length / thisWeekEntries.length) * 100
    : 0;

  const overallHighRate = completedEntries.length > 0
    ? (completedEntries.filter(e => isHighBloating(e.bloating_rating)).length / completedEntries.length) * 100
    : 0;

  let trend: 'improving' | 'worsening' | 'stable' = 'stable';
  const difference = thisWeekAvg - overallAvg;
  if (difference < -0.5) trend = 'improving';
  else if (difference > 0.5) trend = 'worsening';

  // Detect new patterns this week
  const newPatterns: string[] = [];
  const thisWeekTriggers = new Set<string>();
  const olderTriggers = new Set<string>();

  thisWeekEntries.forEach(e => {
    e.detected_triggers?.forEach(t => thisWeekTriggers.add(t.category));
  });

  olderEntries.forEach(e => {
    e.detected_triggers?.forEach(t => olderTriggers.add(t.category));
  });

  thisWeekTriggers.forEach(trigger => {
    const thisWeekCount = thisWeekEntries.filter(e =>
      e.detected_triggers?.some(t => t.category === trigger)
    ).length;

    const olderCount = olderEntries.filter(e =>
      e.detected_triggers?.some(t => t.category === trigger)
    ).length;

    // New trigger or significant increase
    if ((olderCount === 0 && thisWeekCount >= 2) ||
        (olderCount > 0 && thisWeekCount >= olderCount * 2 && thisWeekCount >= 3)) {
      const triggerInfo = getTriggerCategory(trigger);
      newPatterns.push(triggerInfo?.displayName || trigger);
    }
  });

  return {
    thisWeekAvgBloating: Math.round(thisWeekAvg * 10) / 10,
    overallAvgBloating: Math.round(overallAvg * 10) / 10,
    thisWeekHighBloatingRate: Math.round(thisWeekHighRate),
    overallHighBloatingRate: Math.round(overallHighRate),
    trend,
    newPatterns: newPatterns.slice(0, 2),
  };
}

// Success metrics calculation
export function calculateSuccessMetrics(entries: MealEntry[]): SuccessMetrics {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');

  const now = new Date();
  const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const previous14Days = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const recent = completedEntries.filter(e => new Date(e.created_at) > last14Days);
  const previous = completedEntries.filter(e => {
    const date = new Date(e.created_at);
    return date > previous14Days && date <= last14Days;
  });

  const recentScores = recent.map(e => e.bloating_rating).filter((r): r is number => r !== null);
  const previousScores = previous.map(e => e.bloating_rating).filter((r): r is number => r !== null);

  const currentAvg = recentScores.length > 0
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : 0;

  const previousAvg = previousScores.length > 0
    ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length
    : currentAvg;

  const improvement = previousAvg > 0
    ? ((previousAvg - currentAvg) / previousAvg) * 100
    : 0;

  // Calculate streak (consecutive days avoiding high triggers)
  const sortedByDate = [...completedEntries].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  sortedByDate.forEach(entry => {
    if (isLowBloating(entry.bloating_rating)) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      if (tempStreak > 0 && currentStreak === 0) {
        currentStreak = tempStreak;
      }
      tempStreak = 0;
    }
  });

  if (tempStreak > 0 && currentStreak === 0) currentStreak = tempStreak;

  const comfortableMeals = completedEntries.filter(e => isLowBloating(e.bloating_rating)).length;
  const comfortableRate = completedEntries.length > 0
    ? (comfortableMeals / completedEntries.length) * 100
    : 0;

  // Get high confidence triggers
  const triggerConfidence = analyzeTriggerConfidence(entries);
  const highConfidenceTriggers = triggerConfidence
    .filter(t => t.confidence === 'high')
    .map(t => t.category);

  // Calculate avoidance rate
  const recentWithHighTriggers = recent.filter(e =>
    e.detected_triggers?.some(t => highConfidenceTriggers.includes(t.category))
  ).length;

  const avoidanceRate = recent.length > 0
    ? ((recent.length - recentWithHighTriggers) / recent.length) * 100
    : 0;

  return {
    currentAvgBloating: Math.round(currentAvg * 10) / 10,
    previousPeriodAvgBloating: Math.round(previousAvg * 10) / 10,
    improvementPercentage: Math.round(improvement),
    currentStreak,
    longestStreak,
    comfortableMealRate: Math.round(comfortableRate),
    triggerAvoidanceRate: Math.round(avoidanceRate),
  };
}

// Generate testing recommendations
export function generateTestingRecommendations(entries: MealEntry[]): TestingRecommendation[] {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');
  if (completedEntries.length < 5) return [];

  const recommendations: TestingRecommendation[] = [];
  const triggerConfidence = analyzeTriggerConfidence(entries);

  const now = new Date();
  const foodLastSeen: Record<string, Date> = {};

  // Track when each food was last eaten
  completedEntries.forEach(entry => {
    entry.detected_triggers?.forEach(trigger => {
      const food = trigger.food || trigger.category;
      const entryDate = new Date(entry.created_at);

      if (!foodLastSeen[food] || entryDate > foodLastSeen[food]) {
        foodLastSeen[food] = entryDate;
      }
    });
  });

  // Check for reintroduction opportunities
  Object.entries(foodLastSeen).forEach(([food, lastDate]) => {
    const daysAvoided = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAvoided >= 10 && daysAvoided <= 30) {
      // Find if this food had high bloating before
      const entriesWithFood = completedEntries.filter(e =>
        e.detected_triggers?.some(t => (t.food || t.category) === food)
      );

      const hadHighBloating = entriesWithFood.some(e => isHighBloating(e.bloating_rating));

      if (hadHighBloating && entriesWithFood.length >= 2) {
        recommendations.push({
          type: 'reintroduce',
          food,
          reason: `You've avoided ${food} for ${daysAvoided} days. Reintroduce to confirm if it's still a trigger.`,
          daysAvoided,
          priority: daysAvoided >= 14 ? 'high' : 'medium',
        });
      }
    }
  });

  // Check for confirmation needed
  triggerConfidence.forEach(trigger => {
    if (trigger.confidence === 'investigating' && trigger.occurrences >= 3) {
      recommendations.push({
        type: 'confirm',
        food: trigger.category,
        reason: `${trigger.category} appeared ${trigger.occurrences} times. Continue tracking to confirm if it's a trigger.`,
        priority: 'medium',
      });
    }
  });

  // Suggest elimination for high confidence triggers still being eaten
  const recentTriggers = triggerConfidence.filter(t => t.confidence === 'high');
  recentTriggers.forEach(trigger => {
    const recentEntries = completedEntries.slice(0, 10);
    const stillEating = recentEntries.some(e =>
      e.detected_triggers?.some(t => t.category === trigger.category)
    );

    if (stillEating) {
      recommendations.push({
        type: 'eliminate',
        food: trigger.category,
        reason: `${trigger.category} is a confirmed trigger (${trigger.avgBloatingWith}/5 avg). Try eliminating for 2 weeks.`,
        priority: 'high',
      });
    }
  });

  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
}

// Generate comprehensive advanced insights
export function generateAdvancedInsights(entries: MealEntry[]): ComprehensiveAdvancedInsights | null {
  const completedEntries = entries.filter(e => e.rating_status === 'completed');
  if (completedEntries.length < 3) return null;

  return {
    triggerConfidence: analyzeTriggerConfidence(entries),
    combinations: analyzeCombinations(entries),
    weeklyComparison: analyzeWeeklyComparison(entries),
    successMetrics: calculateSuccessMetrics(entries),
    testingRecommendations: generateTestingRecommendations(entries),
  };
}
