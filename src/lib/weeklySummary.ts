import { MealEntry, DetectedTrigger } from '@/types';
import { isHighBloating, isLowBloating } from './bloatingUtils';
import { getSafeAlternatives } from './triggerUtils';
import { analyzeNotesPatterns } from './insightsAnalysis';

// ============================================================
// WEEKLY SUMMARY TYPES
// ============================================================

export interface WeeklyMetrics {
  totalMeals: number;
  avgBloating: number;
  comfortableMeals: number;
  comfortablePercentage: number;
  challengingMeals: number;
  challengingPercentage: number;
  currentStreak: number;
  bestDay: string;
  bestDayAvg: number;
  worstDay: string;
  worstDayAvg: number;
}

export interface WeekComparison {
  thisWeekAvg: number;
  lastWeekAvg: number;
  weekOverWeekChange: number;
  trend: 'improving' | 'worsening' | 'stable';
}

export interface TriggerIntelligence {
  topTriggersEaten: Array<{
    category: string;
    count: number;
    avgBloating: number;
    topFoods: string[];
  }>;
  successfullyAvoided: string[];
  newTriggersIdentified: Array<{
    category: string;
    count: number;
    avgBloating: number;
  }>;
}

export interface BehavioralPatterns {
  stress: {
    thisWeek: number;
    lastWeek: number;
    change: number;
    bloatingRate: number;
  };
  lateEating: {
    thisWeek: number;
    lastWeek: number;
    change: number;
    bloatingRate: number;
  };
  rushing: {
    thisWeek: number;
    lastWeek: number;
    change: number;
    bloatingRate: number;
  };
}

export interface SmartSwap {
  trigger: string;
  alternatives: string[];
  occurrences: number;
  avgBloating: number;
}

export interface WeeklySummary {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: WeeklyMetrics;
  comparison: WeekComparison;
  triggerIntelligence: TriggerIntelligence;
  behavioralPatterns: BehavioralPatterns;
  narrative: {
    opening: string;
    trend: string;
    keyFinding: string;
    watchArea: string | null;
  };
  smartSwaps: SmartSwap[];
  dataQuality: {
    hasSufficientData: boolean;
    hasComparisonData: boolean;
    confidenceLevel: 'high' | 'medium' | 'low';
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()];
}

function calculateCurrentStreak(entries: MealEntry[]): number {
  // Sort by date descending (most recent first)
  const sorted = [...entries]
    .filter(e => e.rating_status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  let streak = 0;
  for (const entry of sorted) {
    if (isLowBloating(entry.bloating_rating)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getBestAndWorstDays(entries: MealEntry[]): {
  bestDay: string;
  bestDayAvg: number;
  worstDay: string;
  worstDayAvg: number;
} {
  const dayGroups: Record<string, number[]> = {};

  entries.forEach(entry => {
    if (entry.bloating_rating !== null && entry.bloating_rating !== undefined) {
      const day = getDayName(new Date(entry.created_at));
      if (!dayGroups[day]) {
        dayGroups[day] = [];
      }
      dayGroups[day].push(entry.bloating_rating);
    }
  });

  const dayAverages = Object.entries(dayGroups).map(([day, ratings]) => ({
    day,
    avg: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
  }));

  if (dayAverages.length === 0) {
    return { bestDay: 'N/A', bestDayAvg: 0, worstDay: 'N/A', worstDayAvg: 0 };
  }

  dayAverages.sort((a, b) => a.avg - b.avg);

  return {
    bestDay: dayAverages[0].day,
    bestDayAvg: dayAverages[0].avg,
    worstDay: dayAverages[dayAverages.length - 1].day,
    worstDayAvg: dayAverages[dayAverages.length - 1].avg,
  };
}

function analyzeTriggerIntelligence(
  thisWeekEntries: MealEntry[],
  allTimeEntries: MealEntry[]
): TriggerIntelligence {
  // Analyze triggers eaten this week
  const triggerCounts: Record<string, {
    count: number;
    totalBloating: number;
    foods: Set<string>;
  }> = {};

  thisWeekEntries.forEach(entry => {
    entry.detected_triggers?.forEach(trigger => {
      if (!triggerCounts[trigger.category]) {
        triggerCounts[trigger.category] = {
          count: 0,
          totalBloating: 0,
          foods: new Set(),
        };
      }
      triggerCounts[trigger.category].count++;
      if (entry.bloating_rating) {
        triggerCounts[trigger.category].totalBloating += entry.bloating_rating;
      }
      if (trigger.food) {
        triggerCounts[trigger.category].foods.add(trigger.food);
      }
    });
  });

  // Calculate top triggers with avg bloating > 3
  const topTriggersEaten = Object.entries(triggerCounts)
    .map(([category, data]) => ({
      category,
      count: data.count,
      avgBloating: data.count > 0 ? data.totalBloating / data.count : 0,
      topFoods: Array.from(data.foods).slice(0, 3),
    }))
    .filter(t => t.avgBloating > 3)
    .sort((a, b) => (b.count * b.avgBloating) - (a.count * a.avgBloating))
    .slice(0, 3);

  // Identify high-confidence triggers from historical data
  const historicalTriggers: Record<string, { count: number; totalBloating: number }> = {};
  allTimeEntries.forEach(entry => {
    entry.detected_triggers?.forEach(trigger => {
      if (!historicalTriggers[trigger.category]) {
        historicalTriggers[trigger.category] = { count: 0, totalBloating: 0 };
      }
      historicalTriggers[trigger.category].count++;
      if (entry.bloating_rating) {
        historicalTriggers[trigger.category].totalBloating += entry.bloating_rating;
      }
    });
  });

  // High-confidence triggers: 5+ occurrences with avg > 3
  const highConfidenceTriggers = Object.entries(historicalTriggers)
    .filter(([_, data]) => {
      const avg = data.totalBloating / data.count;
      return data.count >= 5 && avg > 3;
    })
    .map(([category]) => category);

  // Successfully avoided triggers
  const triggersEatenThisWeek = new Set(Object.keys(triggerCounts));
  const successfullyAvoided = highConfidenceTriggers.filter(
    t => !triggersEatenThisWeek.has(t)
  );

  // New triggers identified (2+ times this week, not in high-confidence)
  const newTriggersIdentified = Object.entries(triggerCounts)
    .filter(([category, data]) => {
      const avg = data.totalBloating / data.count;
      return data.count >= 2 && avg > 3 && !highConfidenceTriggers.includes(category);
    })
    .map(([category, data]) => ({
      category,
      count: data.count,
      avgBloating: data.totalBloating / data.count,
    }));

  return {
    topTriggersEaten,
    successfullyAvoided,
    newTriggersIdentified,
  };
}

function analyzeBehavioralPatterns(
  thisWeekEntries: MealEntry[],
  lastWeekEntries: MealEntry[]
): BehavioralPatterns {
  const analyzePattern = (entries: MealEntry[], keywords: string[]) => {
    const matching = entries.filter(e => {
      const notes = (e.notes || '').toLowerCase();
      return keywords.some(k => notes.includes(k.toLowerCase()));
    });

    const frequency = entries.length > 0 ? matching.length / entries.length : 0;

    const bloatingScores = matching
      .map(e => e.bloating_rating)
      .filter((r): r is number => r !== null && r !== undefined);

    const bloatingRate = bloatingScores.length > 0
      ? bloatingScores.reduce((sum, r) => sum + r, 0) / bloatingScores.length
      : 0;

    return { frequency, bloatingRate };
  };

  const stressKeywords = ['stress', 'stressed', '😰', 'anxiety', 'anxious'];
  const lateKeywords = ['late', '🌙', 'night', 'evening', 'bedtime'];
  const rushKeywords = ['rush', 'rushed', '⚡', 'hurry', 'hurried', 'quick', 'fast'];

  const thisWeekStress = analyzePattern(thisWeekEntries, stressKeywords);
  const lastWeekStress = analyzePattern(lastWeekEntries, stressKeywords);

  const thisWeekLate = analyzePattern(thisWeekEntries, lateKeywords);
  const lastWeekLate = analyzePattern(lastWeekEntries, lateKeywords);

  const thisWeekRush = analyzePattern(thisWeekEntries, rushKeywords);
  const lastWeekRush = analyzePattern(lastWeekEntries, rushKeywords);

  return {
    stress: {
      thisWeek: thisWeekStress.frequency,
      lastWeek: lastWeekStress.frequency,
      change: thisWeekStress.frequency - lastWeekStress.frequency,
      bloatingRate: thisWeekStress.bloatingRate,
    },
    lateEating: {
      thisWeek: thisWeekLate.frequency,
      lastWeek: lastWeekLate.frequency,
      change: thisWeekLate.frequency - lastWeekLate.frequency,
      bloatingRate: thisWeekLate.bloatingRate,
    },
    rushing: {
      thisWeek: thisWeekRush.frequency,
      lastWeek: lastWeekRush.frequency,
      change: thisWeekRush.frequency - lastWeekRush.frequency,
      bloatingRate: thisWeekRush.bloatingRate,
    },
  };
}

function generateNarrative(
  metrics: WeeklyMetrics,
  comparison: WeekComparison,
  triggerIntel: TriggerIntelligence,
  behavioral: BehavioralPatterns
): {
  opening: string;
  trend: string;
  keyFinding: string;
  watchArea: string | null;
} {
  // Opening statement
  const opening = `Analysis of ${metrics.totalMeals} meal${metrics.totalMeals !== 1 ? 's' : ''} this week shows an average bloating rating of ${metrics.avgBloating.toFixed(1)}/5.`;

  // Trend statement
  let trend: string;
  if (comparison.weekOverWeekChange < -5) {
    trend = `This represents a ${Math.abs(comparison.weekOverWeekChange).toFixed(0)}% improvement from the previous week.`;
  } else if (comparison.weekOverWeekChange > 5) {
    trend = `This represents a ${comparison.weekOverWeekChange.toFixed(0)}% increase from the previous week.`;
  } else {
    trend = 'Bloating levels remained stable compared to the previous week.';
  }

  // Key finding (prioritize most significant)
  let keyFinding: string;
  if (triggerIntel.newTriggersIdentified.length > 0) {
    const newTrigger = triggerIntel.newTriggersIdentified[0];
    keyFinding = `Data indicates a potential reaction to ${newTrigger.category} (appeared ${newTrigger.count} times with ${newTrigger.avgBloating.toFixed(1)}/5 average bloating).`;
  } else if (triggerIntel.successfullyAvoided.length > 0) {
    const avoided = triggerIntel.successfullyAvoided[0];
    keyFinding = `Successfully eliminated ${avoided} for all 7 days.`;
  } else if (behavioral.stress.change > 0.2 && behavioral.stress.bloatingRate > 3.5) {
    keyFinding = `Correlation analysis shows stress-related eating associated with ${behavioral.stress.bloatingRate.toFixed(1)}/5 average bloating.`;
  } else if (metrics.currentStreak >= 3) {
    keyFinding = `Maintained ${metrics.currentStreak} consecutive comfortable meal${metrics.currentStreak !== 1 ? 's' : ''}.`;
  } else {
    keyFinding = `${metrics.comfortablePercentage}% of meals were rated as comfortable.`;
  }

  // Watch area
  let watchArea: string | null = null;
  if (triggerIntel.topTriggersEaten.length > 0) {
    const topTrigger = triggerIntel.topTriggersEaten[0];
    watchArea = `Continued consumption of ${topTrigger.category} correlates with elevated symptoms (${topTrigger.avgBloating.toFixed(1)}/5 average).`;
  } else if (behavioral.lateEating.change > 0.3) {
    watchArea = `Late-night eating frequency increased by ${(behavioral.lateEating.change * 100).toFixed(0)}%, correlating with moderately elevated symptoms.`;
  } else if (behavioral.stress.change > 0.3) {
    watchArea = `Stress-related eating frequency increased by ${(behavioral.stress.change * 100).toFixed(0)}% this week.`;
  }

  return { opening, trend, keyFinding, watchArea };
}

function generateSmartSwaps(triggerIntel: TriggerIntelligence): SmartSwap[] {
  return triggerIntel.topTriggersEaten.map(trigger => ({
    trigger: trigger.category,
    alternatives: getSafeAlternatives(trigger.category).slice(0, 3),
    occurrences: trigger.count,
    avgBloating: trigger.avgBloating,
  }));
}

// ============================================================
// MAIN CALCULATION FUNCTION
// ============================================================

export function calculateWeeklySummary(allEntries: MealEntry[]): WeeklySummary | null {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Filter entries
  const thisWeekEntries = allEntries.filter(e => {
    const date = new Date(e.created_at);
    return date >= sevenDaysAgo && e.rating_status === 'completed';
  });

  const lastWeekEntries = allEntries.filter(e => {
    const date = new Date(e.created_at);
    return date >= fourteenDaysAgo && date < sevenDaysAgo && e.rating_status === 'completed';
  });

  const completedEntries = allEntries.filter(e => e.rating_status === 'completed');

  // Check minimum data requirements
  if (thisWeekEntries.length < 3) {
    return null;
  }

  // Calculate metrics
  const totalMeals = thisWeekEntries.length;
  const bloatingScores = thisWeekEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null && r !== undefined);

  const avgBloating = bloatingScores.length > 0
    ? bloatingScores.reduce((sum, r) => sum + r, 0) / bloatingScores.length
    : 0;

  const comfortableMeals = thisWeekEntries.filter(e => isLowBloating(e.bloating_rating)).length;
  const comfortablePercentage = Math.round((comfortableMeals / totalMeals) * 100);

  const challengingMeals = thisWeekEntries.filter(e => isHighBloating(e.bloating_rating)).length;
  const challengingPercentage = Math.round((challengingMeals / totalMeals) * 100);

  const currentStreak = calculateCurrentStreak(completedEntries);

  const { bestDay, bestDayAvg, worstDay, worstDayAvg } = getBestAndWorstDays(thisWeekEntries);

  const metrics: WeeklyMetrics = {
    totalMeals,
    avgBloating,
    comfortableMeals,
    comfortablePercentage,
    challengingMeals,
    challengingPercentage,
    currentStreak,
    bestDay,
    bestDayAvg,
    worstDay,
    worstDayAvg,
  };

  // Calculate week-over-week comparison
  const lastWeekBloatingScores = lastWeekEntries
    .map(e => e.bloating_rating)
    .filter((r): r is number => r !== null && r !== undefined);

  const lastWeekAvg = lastWeekBloatingScores.length > 0
    ? lastWeekBloatingScores.reduce((sum, r) => sum + r, 0) / lastWeekBloatingScores.length
    : avgBloating;

  const weekOverWeekChange = lastWeekBloatingScores.length > 0
    ? ((avgBloating - lastWeekAvg) / lastWeekAvg) * 100
    : 0;

  let trend: 'improving' | 'worsening' | 'stable';
  if (weekOverWeekChange < -5) {
    trend = 'improving';
  } else if (weekOverWeekChange > 5) {
    trend = 'worsening';
  } else {
    trend = 'stable';
  }

  const comparison: WeekComparison = {
    thisWeekAvg: avgBloating,
    lastWeekAvg,
    weekOverWeekChange,
    trend,
  };

  // Analyze triggers and behaviors
  const triggerIntelligence = analyzeTriggerIntelligence(thisWeekEntries, completedEntries);
  const behavioralPatterns = analyzeBehavioralPatterns(thisWeekEntries, lastWeekEntries);

  // Generate narrative
  const narrative = generateNarrative(metrics, comparison, triggerIntelligence, behavioralPatterns);

  // Generate smart swaps
  const smartSwaps = generateSmartSwaps(triggerIntelligence);

  // Data quality assessment
  const hasSufficientData = thisWeekEntries.length >= 3;
  const hasComparisonData = lastWeekEntries.length >= 2;

  let confidenceLevel: 'high' | 'medium' | 'low';
  if (thisWeekEntries.length >= 5 && hasComparisonData) {
    confidenceLevel = 'high';
  } else if (thisWeekEntries.length >= 3) {
    confidenceLevel = 'medium';
  } else {
    confidenceLevel = 'low';
  }

  return {
    dateRange: {
      start: sevenDaysAgo.toISOString(),
      end: now.toISOString(),
    },
    metrics,
    comparison,
    triggerIntelligence,
    behavioralPatterns,
    narrative,
    smartSwaps,
    dataQuality: {
      hasSufficientData,
      hasComparisonData,
      confidenceLevel,
    },
  };
}
