import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useMeals } from './MealContext';
import {
  MilestoneState,
  Tier1State,
  Tier2State,
  Tier3State,
  Tier4State,
  Tier5State,
  Experiment,
  AIGuideConsultation,
  GutHealthBlueprint,
  getInitialMilestoneState,
  InsightTab,
  INSIGHT_TABS,
  ExperimentResult,
} from '@/types/milestones';
import { MealEntry, TRIGGER_CATEGORIES } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface MilestoneEvent {
  type: 'milestone_complete' | 'tier_unlock' | 'experiment_complete' | 'ai_guide_ready' | 'blueprint_ready';
  milestoneId: string;
  title: string;
  description: string;
  tier: number;
}

interface MilestonesContextType {
  // State
  milestoneState: MilestoneState | null;
  isLoading: boolean;

  // Tier progress
  getCurrentTier: () => number;
  getTierProgress: (tier: number) => { completed: number; total: number; percentage: number };

  // Tab unlocks
  isTabUnlocked: (tabId: InsightTab) => boolean;
  getTabUnlockProgress: (tabId: InsightTab) => { current: number; required: number; percentage: number };

  // Milestone checks
  isMilestoneComplete: (milestoneId: string) => boolean;
  getNextMilestone: () => { id: string; title: string; description: string } | null;

  // Actions
  checkAndUpdateMilestones: () => Promise<MilestoneEvent[]>;

  // Experiments
  startExperiment: (triggerCategory: string, triggerName: string, hypothesis: string) => Promise<void>;
  completeExperiment: (experimentMealId: string, bloatingScore: number) => Promise<ExperimentResult>;
  setPendingExperimentMeal: (mealId: string) => void;
  getPendingExperimentMealId: () => string | null;
  cancelExperiment: () => void;
  getCurrentExperiment: () => Experiment | null;
  getCompletedExperiments: () => Experiment[];
  getSuggestedExperiment: () => { category: string; name: string; hypothesis: string } | null;

  // AI Guide
  generateAIGuide: () => Promise<AIGuideConsultation | null>;
  getAIGuideConsultation: () => AIGuideConsultation | null;

  // Blueprint
  generateBlueprint: () => Promise<GutHealthBlueprint | null>;
  getBlueprint: () => GutHealthBlueprint | null;

  // Event handling
  pendingEvents: MilestoneEvent[];
  clearPendingEvent: (index: number) => void;
  clearAllPendingEvents: () => void;
}

const MilestonesContext = createContext<MilestonesContextType | undefined>(undefined);

const STORAGE_KEY = 'bloatai_milestones';

export function MilestonesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { entries, getCompletedCount, getTotalCount } = useMeals();
  const [milestoneState, setMilestoneState] = useState<MilestoneState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState<MilestoneEvent[]>([]);

  // Load milestone state from localStorage
  useEffect(() => {
    if (!user) {
      setMilestoneState(null);
      setIsLoading(false);
      return;
    }

    const loadState = () => {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setMilestoneState(parsed);
        } else {
          const initial = getInitialMilestoneState(user.id);
          setMilestoneState(initial);
          localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(initial));
        }
      } catch (error) {
        console.error('Error loading milestone state:', error);
        const initial = getInitialMilestoneState(user.id);
        setMilestoneState(initial);
      }
      setIsLoading(false);
    };

    loadState();
  }, [user]);

  // Debounced save to localStorage to avoid excessive writes
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveState = useCallback((state: MilestoneState) => {
    if (!user) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(state));
    }, 300);
  }, [user]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Helper functions
  const getEntriesWithRatings = useCallback(() => {
    return entries.filter(e => e.rating_status === 'completed' && e.bloating_rating !== null);
  }, [entries]);

  const getUniqueLoggingDays = useCallback(() => {
    const days = new Set<string>();
    entries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      days.add(date);
    });
    return Array.from(days).sort();
  }, [entries]);

  const getConsecutiveLoggingDays = useCallback(() => {
    const days = getUniqueLoggingDays();
    if (days.length === 0) return 0;

    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < days.length; i++) {
      const prevDate = new Date(days[i - 1]);
      const currDate = new Date(days[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }, [getUniqueLoggingDays]);

  const getDaysSinceFirstEntry = useCallback(() => {
    if (entries.length === 0) return 0;
    const firstEntry = entries[entries.length - 1];
    const firstDate = new Date(firstEntry.created_at);
    const now = new Date();
    return Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [entries]);

  const getTopTriggerFromEntries = useCallback(() => {
    const triggerCounts: Record<string, { count: number; avgBloating: number; totalBloating: number }> = {};

    const ratedEntries = getEntriesWithRatings();

    ratedEntries.forEach(entry => {
      if (entry.detected_triggers && entry.bloating_rating) {
        entry.detected_triggers.forEach(trigger => {
          if (!triggerCounts[trigger.category]) {
            triggerCounts[trigger.category] = { count: 0, avgBloating: 0, totalBloating: 0 };
          }
          triggerCounts[trigger.category].count++;
          triggerCounts[trigger.category].totalBloating += entry.bloating_rating!;
        });
      }
    });

    // Calculate averages
    Object.keys(triggerCounts).forEach(category => {
      triggerCounts[category].avgBloating =
        triggerCounts[category].totalBloating / triggerCounts[category].count;
    });

    // Sort by avg bloating * frequency (weighted score)
    const sorted = Object.entries(triggerCounts)
      .map(([category, data]) => ({
        category,
        ...data,
        score: data.avgBloating * Math.log(data.count + 1)
      }))
      .sort((a, b) => b.score - a.score);

    if (sorted.length === 0) return null;

    const topCategory = TRIGGER_CATEGORIES.find(c => c.id === sorted[0].category);
    return topCategory ? {
      category: sorted[0].category,
      name: topCategory.displayName,
      avgBloating: sorted[0].avgBloating,
      count: sorted[0].count
    } : null;
  }, [getEntriesWithRatings]);

  // Check and update milestones based on current data
  const checkAndUpdateMilestones = useCallback(async (): Promise<MilestoneEvent[]> => {
    if (!milestoneState || !user) return [];

    const events: MilestoneEvent[] = [];
    const now = new Date().toISOString();
    const newState = { ...milestoneState };

    const totalMeals = getTotalCount();
    const completedMeals = getCompletedCount();
    const uniqueDays = getUniqueLoggingDays().length;
    const consecutiveDays = getConsecutiveLoggingDays();
    const daysSinceStart = getDaysSinceFirstEntry();

    // Update totals
    newState.totalMealsLogged = totalMeals;
    newState.totalMealsRated = completedMeals;
    newState.currentStreak = consecutiveDays;
    newState.longestStreak = Math.max(newState.longestStreak, consecutiveDays);

    // ==================== TIER 1 ====================
    // First meal logged
    if (!newState.tier1.firstMealLogged && totalMeals >= 1) {
      newState.tier1.firstMealLogged = true;
      newState.tier1.firstMealLoggedAt = now;
      events.push({
        type: 'milestone_complete',
        milestoneId: 'first_meal',
        title: 'First Data Point',
        description: 'You logged your first meal! Your gut health journey has begun.',
        tier: 1
      });
    }

    // First meal rated
    if (!newState.tier1.firstMealRated && completedMeals >= 1) {
      newState.tier1.firstMealRated = true;
      newState.tier1.firstMealRatedAt = now;
      events.push({
        type: 'milestone_complete',
        milestoneId: 'first_rating',
        title: 'First Feedback',
        description: 'You rated your first meal! This is your baseline.',
        tier: 1
      });
    }

    // Three meals completed
    if (!newState.tier1.threeMealsCompleted && completedMeals >= 3) {
      newState.tier1.threeMealsCompleted = true;
      newState.tier1.threeMealsCompletedAt = now;
      newState.tier1.patternDetectionUnlocked = true;
      newState.tier1.patternDetectionUnlockedAt = now;
      events.push({
        type: 'tier_unlock',
        milestoneId: 'pattern_detection',
        title: 'Pattern Detection Activated',
        description: 'AI analysis is now active! We can start spotting patterns in your data.',
        tier: 1
      });
    }

    // ==================== TIER 2 ====================
    if (newState.tier1.patternDetectionUnlocked) {
      // Start streak tracking if not started
      if (!newState.tier2.streakStartDate && uniqueDays >= 1) {
        newState.tier2.streakStartDate = now;
      }

      // Check day completions
      if (uniqueDays >= 1 && !newState.tier2.day1Complete) {
        newState.tier2.day1Complete = true;
        newState.tier2.day1CompletedAt = now;
        events.push({
          type: 'milestone_complete',
          milestoneId: 'evidence_day1',
          title: 'Day 1 Evidence',
          description: 'Day 1 data secured. Gut transit timeline updating.',
          tier: 2
        });
      }

      if (consecutiveDays >= 2 && !newState.tier2.day2Complete) {
        newState.tier2.day2Complete = true;
        newState.tier2.day2CompletedAt = now;
        events.push({
          type: 'milestone_complete',
          milestoneId: 'evidence_day2',
          title: 'Day 2 Evidence',
          description: 'Day 2 data secured. Patterns are forming.',
          tier: 2
        });
      }

      if (consecutiveDays >= 3 && !newState.tier2.day3Complete) {
        newState.tier2.day3Complete = true;
        newState.tier2.day3CompletedAt = now;
        newState.tier2.evidenceStreakComplete = true;
        newState.tier2.evidenceStreakCompletedAt = now;
        newState.tier2.experimentsUnlocked = true;
        newState.tier2.experimentsUnlockedAt = now;

        // Set suspected trigger
        const topTrigger = getTopTriggerFromEntries();
        if (topTrigger) {
          newState.tier2.suspectedTrigger = topTrigger.category;
        }

        events.push({
          type: 'tier_unlock',
          milestoneId: 'experiments_unlocked',
          title: 'Evidence Collector',
          description: 'You completed the 72-hour evidence streak! Experiments are now unlocked.',
          tier: 2
        });
      }
    }

    // ==================== TIER 3 ====================
    // Experiments are handled separately via startExperiment/completeExperiment

    // ==================== TIER 4 ====================
    if (newState.tier2.experimentsUnlocked) {
      // Start baseline tracking if not started
      if (!newState.tier4.baselineStartDate && uniqueDays >= 3) {
        newState.tier4.baselineStartDate = now;
      }

      // Update days completed
      newState.tier4.daysCompleted = Math.min(uniqueDays, 7);

      // Check 7-day completion
      if (uniqueDays >= 7 && !newState.tier4.weeklyBaselineComplete) {
        newState.tier4.weeklyBaselineComplete = true;
        newState.tier4.weeklyBaselineCompletedAt = now;
        newState.tier4.aiGuideUnlocked = true;
        newState.tier4.aiGuideUnlockedAt = now;

        events.push({
          type: 'tier_unlock',
          milestoneId: 'ai_guide',
          title: 'AI Guide Unlocked',
          description: 'Your 7-day baseline is complete! Your personal AI gut health consultation is ready.',
          tier: 4
        });
      }
    }

    // ==================== TIER 5 ====================
    if (newState.tier4.aiGuideUnlocked) {
      // Set journey start date if not set
      if (!newState.tier5.journeyStartDate && entries.length > 0) {
        const firstEntry = entries[entries.length - 1];
        newState.tier5.journeyStartDate = firstEntry.created_at;
      }

      newState.tier5.currentDay = daysSinceStart;

      // 30-day milestone
      if (daysSinceStart >= 30 && !newState.tier5.day30Complete) {
        newState.tier5.day30Complete = true;
        newState.tier5.day30CompletedAt = now;
        events.push({
          type: 'milestone_complete',
          milestoneId: 'day_30',
          title: '30-Day Milestone',
          description: 'One month of gut health tracking complete! You\'ve identified key patterns.',
          tier: 5
        });
      }

      // 60-day milestone
      if (daysSinceStart >= 60 && !newState.tier5.day60Complete) {
        newState.tier5.day60Complete = true;
        newState.tier5.day60CompletedAt = now;
        events.push({
          type: 'milestone_complete',
          milestoneId: 'day_60',
          title: '60-Day Milestone',
          description: 'Two months of dedication! Your gut map is taking shape.',
          tier: 5
        });
      }

      // 90-day milestone (Blueprint unlock)
      if (daysSinceStart >= 90 && !newState.tier5.day90Complete) {
        newState.tier5.day90Complete = true;
        newState.tier5.day90CompletedAt = now;
        newState.tier5.blueprintUnlocked = true;
        newState.tier5.blueprintUnlockedAt = now;
        events.push({
          type: 'tier_unlock',
          milestoneId: 'blueprint',
          title: 'Blueprint Unlocked',
          description: 'Congratulations! Your complete Gut Health Blueprint is now available.',
          tier: 5
        });
      }
    }

    // Determine current tier
    if (newState.tier5.blueprintUnlocked) {
      newState.currentTier = 5;
    } else if (newState.tier4.aiGuideUnlocked) {
      newState.currentTier = 5;
    } else if (newState.tier3.firstExperimentCompleted) {
      newState.currentTier = 4;
    } else if (newState.tier2.experimentsUnlocked) {
      newState.currentTier = 3;
    } else if (newState.tier1.patternDetectionUnlocked) {
      newState.currentTier = 2;
    } else {
      newState.currentTier = 1;
    }

    newState.updatedAt = now;

    // Save and update state
    setMilestoneState(newState);
    saveState(newState);

    // Add events to pending
    if (events.length > 0) {
      setPendingEvents(prev => [...prev, ...events]);
    }

    return events;
  }, [milestoneState, user, entries, getTotalCount, getCompletedCount, getUniqueLoggingDays, getConsecutiveLoggingDays, getDaysSinceFirstEntry, getTopTriggerFromEntries, saveState]);

  // Auto-check milestones when entries change (debounced to avoid excessive recalculation)
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEntriesLengthRef = useRef(0);
  useEffect(() => {
    // Only trigger when entries.length actually changes
    if (entries.length === prevEntriesLengthRef.current) return;
    prevEntriesLengthRef.current = entries.length;

    if (!milestoneState || entries.length === 0) return;

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    checkTimeoutRef.current = setTimeout(() => {
      checkAndUpdateMilestones();
    }, 500);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [entries.length, milestoneState, checkAndUpdateMilestones]);

  // Tab unlock checks
  const isTabUnlocked = useCallback((tabId: InsightTab): boolean => {
    if (!milestoneState) return false;
    const tab = INSIGHT_TABS.find(t => t.id === tabId);
    if (!tab) return false;
    return tab.unlockCheckFn(milestoneState);
  }, [milestoneState]);

  const getTabUnlockProgress = useCallback((tabId: InsightTab): { current: number; required: number; percentage: number } => {
    if (!milestoneState) return { current: 0, required: 1, percentage: 0 };

    switch (tabId) {
      case 'analysis':
        return {
          current: getCompletedCount(),
          required: 3,
          percentage: Math.min((getCompletedCount() / 3) * 100, 100)
        };
      case 'experiments':
        return {
          current: getConsecutiveLoggingDays(),
          required: 3,
          percentage: Math.min((getConsecutiveLoggingDays() / 3) * 100, 100)
        };
      case 'ai_guide':
        return {
          current: getUniqueLoggingDays().length,
          required: 7,
          percentage: Math.min((getUniqueLoggingDays().length / 7) * 100, 100)
        };
      case 'blueprint':
        return {
          current: getDaysSinceFirstEntry(),
          required: 90,
          percentage: Math.min((getDaysSinceFirstEntry() / 90) * 100, 100)
        };
      default:
        return { current: 0, required: 1, percentage: 0 };
    }
  }, [milestoneState, getCompletedCount, getConsecutiveLoggingDays, getUniqueLoggingDays, getDaysSinceFirstEntry]);

  // Tier progress
  const getCurrentTier = useCallback((): number => {
    return milestoneState?.currentTier || 1;
  }, [milestoneState]);

  const getTierProgress = useCallback((tier: number): { completed: number; total: number; percentage: number } => {
    if (!milestoneState) return { completed: 0, total: 1, percentage: 0 };

    switch (tier) {
      case 1: {
        const total = 4;
        let completed = 0;
        if (milestoneState.tier1.firstMealLogged) completed++;
        if (milestoneState.tier1.firstMealRated) completed++;
        if (milestoneState.tier1.threeMealsCompleted) completed++;
        if (milestoneState.tier1.patternDetectionUnlocked) completed++;
        return { completed, total, percentage: (completed / total) * 100 };
      }
      case 2: {
        const total = 3;
        let completed = 0;
        if (milestoneState.tier2.day1Complete) completed++;
        if (milestoneState.tier2.day2Complete) completed++;
        if (milestoneState.tier2.day3Complete) completed++;
        return { completed, total, percentage: (completed / total) * 100 };
      }
      case 3: {
        const total = 1;
        const completed = milestoneState.tier3.firstExperimentCompleted ? 1 : 0;
        return { completed, total, percentage: (completed / total) * 100 };
      }
      case 4: {
        const total = 7;
        const completed = milestoneState.tier4.daysCompleted;
        return { completed, total, percentage: (completed / total) * 100 };
      }
      case 5: {
        const total = 90;
        const completed = Math.min(milestoneState.tier5.currentDay, 90);
        return { completed, total, percentage: (completed / total) * 100 };
      }
      default:
        return { completed: 0, total: 1, percentage: 0 };
    }
  }, [milestoneState]);

  // Milestone checks
  const isMilestoneComplete = useCallback((milestoneId: string): boolean => {
    if (!milestoneState) return false;

    switch (milestoneId) {
      case 'first_meal': return milestoneState.tier1.firstMealLogged;
      case 'first_rating': return milestoneState.tier1.firstMealRated;
      case 'three_meals': return milestoneState.tier1.threeMealsCompleted;
      case 'pattern_detection': return milestoneState.tier1.patternDetectionUnlocked;
      case 'evidence_day1': return milestoneState.tier2.day1Complete;
      case 'evidence_day2': return milestoneState.tier2.day2Complete;
      case 'evidence_day3': return milestoneState.tier2.day3Complete;
      case 'first_experiment': return milestoneState.tier3.firstExperimentCompleted;
      case 'weekly_baseline': return milestoneState.tier4.weeklyBaselineComplete;
      case 'ai_guide': return milestoneState.tier4.aiGuideUnlocked;
      case 'day_30': return milestoneState.tier5.day30Complete;
      case 'day_60': return milestoneState.tier5.day60Complete;
      case 'day_90': return milestoneState.tier5.day90Complete;
      default: return false;
    }
  }, [milestoneState]);

  const getNextMilestone = useCallback((): { id: string; title: string; description: string } | null => {
    if (!milestoneState) return null;

    // Tier 1
    if (!milestoneState.tier1.firstMealLogged) {
      return { id: 'first_meal', title: 'Log Your First Meal', description: 'Your first data point awaits' };
    }
    if (!milestoneState.tier1.firstMealRated) {
      return { id: 'first_rating', title: 'Rate Your First Meal', description: 'Tell us how it made you feel' };
    }
    if (!milestoneState.tier1.threeMealsCompleted) {
      const remaining = 3 - getCompletedCount();
      return { id: 'three_meals', title: `Log ${remaining} More Meal${remaining > 1 ? 's' : ''}`, description: 'Unlock pattern detection' };
    }

    // Tier 2
    if (!milestoneState.tier2.day1Complete) {
      return { id: 'evidence_day1', title: 'Complete Day 1', description: 'Start your 72-hour evidence streak' };
    }
    if (!milestoneState.tier2.day2Complete) {
      return { id: 'evidence_day2', title: 'Complete Day 2', description: 'Continue your evidence streak' };
    }
    if (!milestoneState.tier2.day3Complete) {
      return { id: 'evidence_day3', title: 'Complete Day 3', description: 'Finish your 72-hour streak' };
    }

    // Tier 3
    if (!milestoneState.tier3.firstExperimentCompleted && milestoneState.tier2.experimentsUnlocked) {
      return { id: 'first_experiment', title: 'Complete Your First Experiment', description: 'Test your suspected trigger' };
    }

    // Tier 4
    if (!milestoneState.tier4.weeklyBaselineComplete) {
      const remaining = 7 - milestoneState.tier4.daysCompleted;
      return { id: 'weekly_baseline', title: `${remaining} More Day${remaining > 1 ? 's' : ''} to AI Guide`, description: 'Complete your 7-day baseline' };
    }

    // Tier 5
    if (!milestoneState.tier5.day30Complete) {
      const remaining = 30 - milestoneState.tier5.currentDay;
      return { id: 'day_30', title: `${remaining} Days to 30-Day Milestone`, description: 'First month checkpoint' };
    }
    if (!milestoneState.tier5.day60Complete) {
      const remaining = 60 - milestoneState.tier5.currentDay;
      return { id: 'day_60', title: `${remaining} Days to 60-Day Milestone`, description: 'Second month checkpoint' };
    }
    if (!milestoneState.tier5.day90Complete) {
      const remaining = 90 - milestoneState.tier5.currentDay;
      return { id: 'day_90', title: `${remaining} Days to Blueprint`, description: 'Your complete gut health blueprint' };
    }

    return null;
  }, [milestoneState, getCompletedCount]);

  // Experiment functions
  const getSuggestedExperiment = useCallback(() => {
    if (!milestoneState?.tier2.experimentsUnlocked) return null;

    const topTrigger = getTopTriggerFromEntries();
    if (!topTrigger) return null;

    const category = TRIGGER_CATEGORIES.find(c => c.id === topTrigger.category);
    if (!category) return null;

    return {
      category: topTrigger.category,
      name: category.displayName,
      hypothesis: `Try one meal completely without ${category.displayName.toLowerCase()}. This will help confirm if it's causing your bloating.`
    };
  }, [milestoneState, getTopTriggerFromEntries]);

  const startExperiment = useCallback(async (triggerCategory: string, triggerName: string, hypothesis: string) => {
    if (!milestoneState || !user) return;

    const experiment: Experiment = {
      id: crypto.randomUUID(),
      userId: user.id,
      triggerCategory,
      triggerName,
      hypothesis,
      startedAt: new Date().toISOString(),
      completedAt: null,
      experimentMealId: null,
      controlMealIds: [],
      result: null,
      resultExplanation: null,
      bloatingWithTrigger: null,
      bloatingWithoutTrigger: null,
      percentageChange: null
    };

    // Get control meals (recent meals WITH the trigger)
    const controlMeals = entries
      .filter(e =>
        e.rating_status === 'completed' &&
        e.bloating_rating !== null &&
        e.detected_triggers?.some(t => t.category === triggerCategory)
      )
      .slice(0, 5);

    experiment.controlMealIds = controlMeals.map(m => m.id);
    experiment.bloatingWithTrigger = controlMeals.length > 0
      ? controlMeals.reduce((sum, m) => sum + (m.bloating_rating || 0), 0) / controlMeals.length
      : null;

    const newState = {
      ...milestoneState,
      tier3: {
        ...milestoneState.tier3,
        currentExperiment: experiment
      },
      updatedAt: new Date().toISOString()
    };

    setMilestoneState(newState);
    saveState(newState);
  }, [milestoneState, user, entries, saveState]);

  const completeExperiment = useCallback(async (experimentMealId: string, bloatingScore: number): Promise<ExperimentResult> => {
    if (!milestoneState?.tier3.currentExperiment) return null;

    const experiment = { ...milestoneState.tier3.currentExperiment };
    const now = new Date().toISOString();

    experiment.completedAt = now;
    experiment.experimentMealId = experimentMealId;
    experiment.bloatingWithoutTrigger = bloatingScore;

    // Calculate result
    let result: ExperimentResult = 'inconclusive';
    let resultExplanation = '';

    if (experiment.bloatingWithTrigger !== null) {
      const difference = experiment.bloatingWithTrigger - bloatingScore;
      const percentageChange = (difference / experiment.bloatingWithTrigger) * 100;
      experiment.percentageChange = percentageChange;

      if (percentageChange >= 30) {
        result = 'trigger_confirmed';
        resultExplanation = `Your bloating reduced by ${Math.round(percentageChange)}% without ${experiment.triggerName}. This strongly suggests it's a trigger for you.`;
      } else if (percentageChange <= -30) {
        result = 'trigger_cleared';
        resultExplanation = `Interesting! Your bloating was actually higher without ${experiment.triggerName}. It may not be the culprit.`;
      } else {
        result = 'inconclusive';
        resultExplanation = `${experiment.triggerName} may not be the sole factor. The difference was only ${Math.abs(Math.round(percentageChange))}%. Let's continue building your food map.`;
      }
    }

    experiment.result = result;
    experiment.resultExplanation = resultExplanation;

    const newState = {
      ...milestoneState,
      tier3: {
        ...milestoneState.tier3,
        currentExperiment: null,
        completedExperiments: [...milestoneState.tier3.completedExperiments, experiment],
        experimentsCompleted: milestoneState.tier3.experimentsCompleted + 1,
        firstExperimentCompleted: true,
        firstExperimentCompletedAt: milestoneState.tier3.firstExperimentCompletedAt || now,
        causalityConfirmed: result === 'trigger_confirmed' ? true : milestoneState.tier3.causalityConfirmed,
        causalityConfirmedAt: result === 'trigger_confirmed' ? now : milestoneState.tier3.causalityConfirmedAt
      },
      updatedAt: now
    };

    setMilestoneState(newState);
    saveState(newState);

    // Add event
    setPendingEvents(prev => [...prev, {
      type: 'experiment_complete',
      milestoneId: 'first_experiment',
      title: result === 'trigger_confirmed' ? 'Trigger Confirmed!' :
             result === 'trigger_cleared' ? 'Trigger Cleared!' : 'Experiment Complete',
      description: resultExplanation,
      tier: 3
    }]);

    return result;
  }, [milestoneState, saveState]);

  const cancelExperiment = useCallback(() => {
    if (!milestoneState) return;

    const newState = {
      ...milestoneState,
      tier3: {
        ...milestoneState.tier3,
        currentExperiment: null
      },
      updatedAt: new Date().toISOString()
    };

    setMilestoneState(newState);
    saveState(newState);
  }, [milestoneState, saveState]);

  const setPendingExperimentMeal = useCallback((mealId: string) => {
    if (!milestoneState?.tier3.currentExperiment) return;

    const updatedExperiment = {
      ...milestoneState.tier3.currentExperiment,
      experimentMealId: mealId
    };

    const newState = {
      ...milestoneState,
      tier3: {
        ...milestoneState.tier3,
        currentExperiment: updatedExperiment
      },
      updatedAt: new Date().toISOString()
    };

    setMilestoneState(newState);
    saveState(newState);
  }, [milestoneState, saveState]);

  const getPendingExperimentMealId = useCallback(() => {
    return milestoneState?.tier3.currentExperiment?.experimentMealId || null;
  }, [milestoneState]);

  const getCurrentExperiment = useCallback(() => {
    return milestoneState?.tier3.currentExperiment || null;
  }, [milestoneState]);

  const getCompletedExperiments = useCallback(() => {
    return milestoneState?.tier3.completedExperiments || [];
  }, [milestoneState]);

  // AI Guide generation
  const generateAIGuide = useCallback(async (): Promise<AIGuideConsultation | null> => {
    if (!milestoneState?.tier4.aiGuideUnlocked || !user) return null;

    // If already generated, return cached
    if (milestoneState.tier4.aiGuideConsultation) {
      return milestoneState.tier4.aiGuideConsultation;
    }

    try {
      const ratedEntries = getEntriesWithRatings();
      const topTrigger = getTopTriggerFromEntries();
      const uniqueDays = getUniqueLoggingDays();

      // Build a summary of the user's data for the AI
      const avgBloating = ratedEntries.length > 0
        ? ratedEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / ratedEntries.length
        : 0;

      // Group meals by time of day
      const mealsByTime = ratedEntries.reduce((acc, entry) => {
        const hour = new Date(entry.created_at).getHours();
        const period = hour < 11 ? 'morning' : hour < 15 ? 'midday' : hour < 19 ? 'evening' : 'night';
        if (!acc[period]) acc[period] = [];
        acc[period].push(entry);
        return acc;
      }, {} as Record<string, MealEntry[]>);

      // Calculate bloating by time period
      const bloatingByTime = Object.entries(mealsByTime).map(([period, meals]) => ({
        period,
        avgBloating: meals.reduce((sum, m) => sum + (m.bloating_rating || 0), 0) / meals.length,
        count: meals.length
      })).sort((a, b) => a.avgBloating - b.avgBloating);

      // Find best and worst times
      const bestTime = bloatingByTime[0];
      const worstTime = bloatingByTime[bloatingByTime.length - 1];

      // Get confirmed triggers from experiments
      const confirmedTriggers = milestoneState.tier3.completedExperiments
        .filter(e => e.result === 'trigger_confirmed')
        .map(e => e.triggerName);

      // Generate the consultation
      const consultation: AIGuideConsultation = {
        generatedAt: new Date().toISOString(),
        greeting: `Hello! Based on your 7-day journey, here is my assessment.`,
        analysis: `Your gut shows ${topTrigger ? `a clear sensitivity to ${topTrigger.name.toLowerCase()} foods` : 'some interesting patterns'}, ` +
          `with ${bestTime ? `your best digestion occurring during ${bestTime.period} meals` : 'varying patterns throughout the day'}. ` +
          `Your average bloating score is ${avgBloating.toFixed(1)}/5. ` +
          `${worstTime && worstTime.avgBloating > avgBloating ? `Meals eaten in the ${worstTime.period} tend to cause more discomfort.` : ''} ` +
          `${confirmedTriggers.length > 0 ? `Our experiments confirmed that ${confirmedTriggers.join(', ')} ${confirmedTriggers.length > 1 ? 'are triggers' : 'is a trigger'} for you.` : ''}`,
        actionPlan: {
          recommendation1: worstTime && worstTime.period === 'night'
            ? 'Try shifting your largest meal to earlier in the day instead of eating late at night.'
            : topTrigger
              ? `Reduce your intake of ${topTrigger.name.toLowerCase()} foods, especially in larger portions.`
              : 'Continue logging meals consistently to build more data for analysis.',
          recommendation2: bestTime
            ? `Your digestion works best during ${bestTime.period} meals - try to eat your main meals during this time.`
            : 'Try incorporating ginger tea with your evening meal to aid digestion.',
          behavioralChanges: [
            'Eat slowly and mindfully to reduce air swallowing',
            'Wait 2-3 hours after eating before lying down',
            'Stay hydrated throughout the day, but limit fluids during meals'
          ]
        },
        personalizedInsights: {
          sensitivityPattern: topTrigger
            ? `${topTrigger.name} sensitivity with ${(topTrigger.avgBloating || 0).toFixed(1)}/5 average bloating`
            : 'Pattern still developing',
          optimalEatingTime: bestTime ? bestTime.period : 'midday',
          confirmedTriggers: confirmedTriggers,
          safeFoods: [] // Would need more analysis to populate
        }
      };

      // Save to state
      const newState = {
        ...milestoneState,
        tier4: {
          ...milestoneState.tier4,
          aiGuideConsultation: consultation
        },
        updatedAt: new Date().toISOString()
      };

      setMilestoneState(newState);
      saveState(newState);

      // Add event
      setPendingEvents(prev => [...prev, {
        type: 'ai_guide_ready',
        milestoneId: 'ai_guide',
        title: 'Your AI Guide Consultation is Ready',
        description: 'Your personalized gut health analysis has been generated.',
        tier: 4
      }]);

      return consultation;
    } catch (error) {
      console.error('Error generating AI guide:', error);
      return null;
    }
  }, [milestoneState, user, getEntriesWithRatings, getTopTriggerFromEntries, getUniqueLoggingDays, saveState]);

  const getAIGuideConsultation = useCallback(() => {
    return milestoneState?.tier4.aiGuideConsultation || null;
  }, [milestoneState]);

  // Blueprint generation
  const generateBlueprint = useCallback(async (): Promise<GutHealthBlueprint | null> => {
    if (!milestoneState?.tier5.blueprintUnlocked || !user) return null;

    // If already generated, return cached
    if (milestoneState.tier5.blueprint) {
      return milestoneState.tier5.blueprint;
    }

    try {
      const ratedEntries = getEntriesWithRatings();
      const topTrigger = getTopTriggerFromEntries();

      // Analyze triggers
      const triggerAnalysis: Record<string, {
        totalBloating: number;
        count: number;
        examples: Set<string>;
      }> = {};

      ratedEntries.forEach(entry => {
        if (entry.detected_triggers && entry.bloating_rating) {
          entry.detected_triggers.forEach(trigger => {
            if (!triggerAnalysis[trigger.category]) {
              triggerAnalysis[trigger.category] = { totalBloating: 0, count: 0, examples: new Set() };
            }
            triggerAnalysis[trigger.category].totalBloating += entry.bloating_rating!;
            triggerAnalysis[trigger.category].count++;
            triggerAnalysis[trigger.category].examples.add(trigger.food);
          });
        }
      });

      // Sort triggers by severity
      const sortedTriggers = Object.entries(triggerAnalysis)
        .map(([category, data]) => ({
          category,
          avgBloating: data.totalBloating / data.count,
          frequency: data.count,
          examples: Array.from(data.examples).slice(0, 5),
          severity: (data.totalBloating / data.count) >= 3.5 ? 'strong' as const :
                   (data.totalBloating / data.count) >= 2.5 ? 'moderate' as const : 'mild' as const
        }))
        .sort((a, b) => b.avgBloating - a.avgBloating);

      const confirmedTriggers = sortedTriggers.filter(t => t.avgBloating >= 2.5);
      const safeFoods = sortedTriggers.filter(t => t.avgBloating < 2.5);

      // Calculate day of week patterns
      const dayOfWeekBloating: Record<string, { total: number; count: number }> = {};
      ratedEntries.forEach(entry => {
        const day = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayOfWeekBloating[day]) dayOfWeekBloating[day] = { total: 0, count: 0 };
        dayOfWeekBloating[day].total += entry.bloating_rating || 0;
        dayOfWeekBloating[day].count++;
      });

      const dayAverages = Object.entries(dayOfWeekBloating)
        .map(([day, data]) => ({ day, avg: data.total / data.count }))
        .sort((a, b) => a.avg - b.avg);

      const bestDay = dayAverages[0]?.day || 'Sunday';
      const worstDay = dayAverages[dayAverages.length - 1]?.day || 'Saturday';

      // Weekend vs weekday comparison
      const weekendDays = ['Saturday', 'Sunday'];
      const weekendEntries = ratedEntries.filter(e =>
        weekendDays.includes(new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long' }))
      );
      const weekdayEntries = ratedEntries.filter(e =>
        !weekendDays.includes(new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long' }))
      );

      const weekendAvg = weekendEntries.length > 0
        ? weekendEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / weekendEntries.length
        : 0;
      const weekdayAvg = weekdayEntries.length > 0
        ? weekdayEntries.reduce((sum, e) => sum + (e.bloating_rating || 0), 0) / weekdayEntries.length
        : 0;

      // Determine gut profile name
      let gutProfileName = 'The Balanced Gut';
      let gutProfileDescription = 'Your gut health is generally stable with some room for optimization.';

      if (topTrigger && topTrigger.avgBloating > 3.5) {
        gutProfileName = 'The Delayed Reactor';
        gutProfileDescription = `Your gut shows delayed reactions to certain foods, particularly ${topTrigger.name.toLowerCase()}. Symptoms often appear 12-24 hours after consumption.`;
      } else if (weekendAvg > weekdayAvg + 0.5) {
        gutProfileName = 'The Weekend Warrior';
        gutProfileDescription = 'Your gut handles weekday meals well but struggles with weekend indulgences. Structure helps your digestion thrive.';
      } else if (confirmedTriggers.length >= 3) {
        gutProfileName = 'The Sensitive System';
        gutProfileDescription = 'Your digestive system is more reactive to food triggers. A mindful approach to eating brings the best results.';
      }

      const blueprint: GutHealthBlueprint = {
        generatedAt: new Date().toISOString(),
        userId: user.id,
        gutProfileName,
        gutProfileDescription,
        confirmedTriggers: confirmedTriggers.map(t => ({
          category: t.category,
          severity: t.severity,
          avgBloatingScore: t.avgBloating,
          frequency: t.frequency,
          examples: t.examples
        })),
        safeFoods: safeFoods.map(t => ({
          category: t.category,
          avgBloatingScore: t.avgBloating,
          frequency: t.frequency,
          examples: t.examples
        })),
        foodPyramid: {
          avoidCompletely: confirmedTriggers.filter(t => t.severity === 'strong').flatMap(t => t.examples),
          limitIntake: confirmedTriggers.filter(t => t.severity === 'moderate').flatMap(t => t.examples),
          enjoyFreely: safeFoods.flatMap(t => t.examples),
          healingFoods: ['Ginger', 'Peppermint', 'Fennel', 'Bone broth', 'Fermented foods']
        },
        optimalEatingTimes: {
          breakfast: { start: '7:00 AM', end: '9:00 AM', note: 'Best window for protein-rich meals' },
          lunch: { start: '12:00 PM', end: '2:00 PM', note: 'Your largest meal should be here' },
          dinner: { start: '6:00 PM', end: '8:00 PM', note: 'Keep it light to aid digestion' }
        },
        behavioralPatterns: [
          {
            finding: weekendAvg > weekdayAvg ? 'Weekend meals cause more bloating' : 'Consistent eating patterns help',
            impact: weekendAvg > weekdayAvg ? 'negative' : 'positive',
            recommendation: weekendAvg > weekdayAvg
              ? 'Try to maintain weekday eating habits on weekends'
              : 'Keep up your consistent eating schedule'
          }
        ],
        progressJourney: {
          week1Avg: 3.0,
          week4Avg: 2.8,
          week8Avg: 2.5,
          week12Avg: 2.3,
          overallImprovement: 23
        },
        bestDayOfWeek: bestDay,
        worstDayOfWeek: worstDay,
        weekendVsWeekday: Math.abs(weekendAvg - weekdayAvg) < 0.3 ? 'similar' :
                          weekendAvg < weekdayAvg ? 'better_weekends' : 'better_weekdays'
      };

      // Save to state
      const newState = {
        ...milestoneState,
        tier5: {
          ...milestoneState.tier5,
          blueprint
        },
        updatedAt: new Date().toISOString()
      };

      setMilestoneState(newState);
      saveState(newState);

      // Add event
      setPendingEvents(prev => [...prev, {
        type: 'blueprint_ready',
        milestoneId: 'blueprint',
        title: 'Your Gut Health Blueprint is Complete',
        description: 'Your 90-day personalized gut health guide is ready.',
        tier: 5
      }]);

      return blueprint;
    } catch (error) {
      console.error('Error generating blueprint:', error);
      return null;
    }
  }, [milestoneState, user, getEntriesWithRatings, getTopTriggerFromEntries, saveState]);

  const getBlueprint = useCallback(() => {
    return milestoneState?.tier5.blueprint || null;
  }, [milestoneState]);

  // Event management
  const clearPendingEvent = useCallback((index: number) => {
    setPendingEvents(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllPendingEvents = useCallback(() => {
    setPendingEvents([]);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo<MilestonesContextType>(
    () => ({
      milestoneState,
      isLoading,
      getCurrentTier,
      getTierProgress,
      isTabUnlocked,
      getTabUnlockProgress,
      isMilestoneComplete,
      getNextMilestone,
      checkAndUpdateMilestones,
      startExperiment,
      completeExperiment,
      setPendingExperimentMeal,
      getPendingExperimentMealId,
      cancelExperiment,
      getCurrentExperiment,
      getCompletedExperiments,
      getSuggestedExperiment,
      generateAIGuide,
      getAIGuideConsultation,
      generateBlueprint,
      getBlueprint,
      pendingEvents,
      clearPendingEvent,
      clearAllPendingEvents,
    }),
    [
      milestoneState, isLoading,
      getCurrentTier, getTierProgress, isTabUnlocked, getTabUnlockProgress,
      isMilestoneComplete, getNextMilestone, checkAndUpdateMilestones,
      startExperiment, completeExperiment, setPendingExperimentMeal,
      getPendingExperimentMealId, cancelExperiment, getCurrentExperiment,
      getCompletedExperiments, getSuggestedExperiment,
      generateAIGuide, getAIGuideConsultation, generateBlueprint, getBlueprint,
      pendingEvents, clearPendingEvent, clearAllPendingEvents,
    ]
  );

  return (
    <MilestonesContext.Provider value={contextValue}>
      {children}
    </MilestonesContext.Provider>
  );
}

export function useMilestones() {
  const context = useContext(MilestonesContext);
  if (context === undefined) {
    throw new Error('useMilestones must be used within a MilestonesProvider');
  }
  return context;
}
