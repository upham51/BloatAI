import { MealEntry } from '@/types';
import { RootCauseAssessment } from '@/types/quiz';
import { isHighBloating, isLowBloating } from './bloatingUtils';
import { deduplicateFoods, getSafeAlternatives, validatePercentage } from './triggerUtils';
import { getTriggerCategory } from '@/types';
import { CATEGORY_DISPLAY_NAMES } from './quizScoring';

// ============================================================
// NOTES PATTERN ANALYSIS
// ============================================================

export interface NotesPattern {
  type: 'stress' | 'timing' | 'rushing' | 'hunger' | 'restaurant';
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

  // Quiz integration
  quizHighRiskCategories: Array<{
    category: string;
    displayName: string;
    score: number;
    maxScore: number;
    level: string;
  }>;
  quizRedFlags: string[];

  // Comprehensive summary
  summary: {
    overview: string[];
    behavioralInsights: string[];
    rootCauseConnections: string[];
    topRecommendations: string[];
  };
}

export function generateComprehensiveInsight(
  entries: MealEntry[],
  quiz: RootCauseAssessment | null | undefined
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
      if (trigger.food) {
        const current = allFoods.get(trigger.food) || 0;
        allFoods.set(trigger.food, current + 1);
      }
    });
  });

  const foodsArray = Array.from(allFoods.entries()).map(([food, count]) => ({ food, count }));
  const topFoods = deduplicateFoods(foodsArray).slice(0, 5);

  // Notes patterns
  const notesPatterns = analyzeNotesPatterns(entries);

  // Quiz analysis
  const quizHighRiskCategories = quiz ? [
    { key: 'aerophagia', displayName: CATEGORY_DISPLAY_NAMES.aerophagia, score: quiz.aerophagia_score, maxScore: 10 },
    { key: 'motility', displayName: CATEGORY_DISPLAY_NAMES.motility, score: quiz.motility_score, maxScore: 11 },
    { key: 'dysbiosis', displayName: CATEGORY_DISPLAY_NAMES.dysbiosis, score: quiz.dysbiosis_score, maxScore: 11 },
    { key: 'brainGut', displayName: CATEGORY_DISPLAY_NAMES.brainGut, score: quiz.brain_gut_score, maxScore: 14 },
    { key: 'hormonal', displayName: CATEGORY_DISPLAY_NAMES.hormonal, score: quiz.hormonal_score, maxScore: 6 },
    { key: 'structural', displayName: CATEGORY_DISPLAY_NAMES.structural, score: quiz.structural_score, maxScore: 10 },
    { key: 'lifestyle', displayName: CATEGORY_DISPLAY_NAMES.lifestyle, score: quiz.lifestyle_score, maxScore: 6 },
  ].filter(cat => {
    const percentage = (cat.score / cat.maxScore) * 100;
    return percentage >= 50; // Moderate or High risk
  }).map(cat => ({
    category: cat.key,
    displayName: cat.displayName,
    score: cat.score,
    maxScore: cat.maxScore,
    level: (cat.score / cat.maxScore) * 100 >= 66 ? 'High' : 'Moderate',
  })) : [];

  // Generate comprehensive summary
  const summary = generateSummary({
    totalMeals,
    avgBloating,
    highBloatingCount: highBloatingMeals.length,
    lowBloatingCount: lowBloatingMeals.length,
    potentialTriggers,
    notesPatterns,
    quiz,
    quizHighRiskCategories,
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
    quizHighRiskCategories,
    quizRedFlags: quiz?.red_flags || [],
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
  quiz: RootCauseAssessment | null | undefined;
  quizHighRiskCategories: Array<{ category: string; displayName: string; level: string }>;
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

  // Root cause connections (quiz + food triggers)
  if (input.quiz && input.quizHighRiskCategories.length > 0) {
    // Cross-reference quiz results with food patterns
    const hasStressIssues = input.quizHighRiskCategories.some(c => c.category === 'brainGut');
    const stressPattern = input.notesPatterns.find(p => p.type === 'stress');

    if (hasStressIssues && stressPattern && stressPattern.count >= 2) {
      rootCauseConnections.push(
        `Your root cause assessment shows ${input.quizHighRiskCategories.find(c => c.category === 'brainGut')?.level} brain-gut connection issues, which aligns with ${stressPattern.count} stressed meals tracked`
      );
    }

    const hasMotilityIssues = input.quizHighRiskCategories.some(c => c.category === 'motility');
    const rushingPattern = input.notesPatterns.find(p => p.type === 'rushing');

    if (hasMotilityIssues && rushingPattern && rushingPattern.count >= 2) {
      rootCauseConnections.push(
        `Your root cause assessment indicates ${input.quizHighRiskCategories.find(c => c.category === 'motility')?.level} motility concerns, and ${rushingPattern.count} meals were eaten rushed`
      );
    }

    const hasDysbiosisIssues = input.quizHighRiskCategories.some(c => c.category === 'dysbiosis');
    if (hasDysbiosisIssues && input.potentialTriggers.length > 0) {
      const fodmapTriggers = input.potentialTriggers.filter(t => t.category.startsWith('fodmaps'));
      if (fodmapTriggers.length > 0) {
        rootCauseConnections.push(
          `Your root cause assessment shows ${input.quizHighRiskCategories.find(c => c.category === 'dysbiosis')?.level} microbial imbalance risk, which may explain your sensitivity to FODMAPs`
        );
      }
    }

    // If no specific connections, mention top risk category
    if (rootCauseConnections.length === 0 && input.quizHighRiskCategories.length > 0) {
      const topCategory = input.quizHighRiskCategories[0];
      rootCauseConnections.push(
        `Your root cause assessment identifies ${topCategory.displayName} as a ${topCategory.level} risk factor`
      );
    }
  }

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

  if (input.quiz && input.quizHighRiskCategories.length > 0) {
    const topQuizCategory = input.quizHighRiskCategories[0];
    if (topQuizCategory.category === 'aerophagia') {
      topRecommendations.push('Focus on eating slowly, chewing thoroughly, and avoiding talking while eating');
    } else if (topQuizCategory.category === 'lifestyle') {
      topRecommendations.push('Incorporate gentle movement after meals (10-15 min walk) to aid digestion');
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
