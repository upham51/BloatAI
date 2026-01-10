import { MealEntry } from '@/types';
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
