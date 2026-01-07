import { describe, it, expect } from 'vitest';
import { analyzeNotesPatterns, analyzeTriggerFrequency, generateComprehensiveInsight } from '../insightsAnalysis';
import { MealEntry } from '@/types';
import { RootCauseAssessment } from '@/types/quiz';

describe('insightsAnalysis', () => {
  const createMockEntry = (overrides: Partial<MealEntry> = {}): MealEntry => ({
    id: Math.random().toString(),
    user_id: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    meal_description: 'Test meal',
    photo_url: null,
    portion_size: 'normal',
    eating_speed: 'normal',
    social_setting: 'solo',
    bloating_rating: 3,
    rating_status: 'completed',
    rating_due_at: null,
    detected_triggers: [],
    custom_title: null,
    meal_emoji: null,
    meal_title: null,
    title_options: [],
    notes: null,
    entry_method: 'photo',
    ...overrides,
  });

  describe('analyzeNotesPatterns', () => {
    it('should detect stress patterns in notes', () => {
      const entries = [
        createMockEntry({ notes: 'Felt stressed 😰', bloating_rating: 5 }),
        createMockEntry({ notes: 'Very stressed today', bloating_rating: 4 }),
        createMockEntry({ notes: 'Relaxed meal', bloating_rating: 2 }),
      ];

      const patterns = analyzeNotesPatterns(entries);
      const stressPattern = patterns.find(p => p.type === 'stress');

      expect(stressPattern).toBeDefined();
      expect(stressPattern?.count).toBe(2);
      expect(stressPattern?.highBloatingCount).toBe(2);
      expect(stressPattern?.correlation).toBe('high');
    });

    it('should detect timing patterns', () => {
      const entries = [
        createMockEntry({ notes: 'Ate late 🌙', bloating_rating: 4 }),
        createMockEntry({ notes: 'Late night meal', bloating_rating: 5 }),
        createMockEntry({ notes: 'Regular dinner', bloating_rating: 2 }),
      ];

      const patterns = analyzeNotesPatterns(entries);
      const timingPattern = patterns.find(p => p.type === 'timing');

      expect(timingPattern).toBeDefined();
      expect(timingPattern?.count).toBe(2);
      expect(timingPattern?.avgBloating).toBeGreaterThan(4);
    });

    it('should ignore incomplete entries', () => {
      const entries = [
        createMockEntry({ notes: 'Stressed', rating_status: 'pending' }),
        createMockEntry({ notes: 'Stressed', rating_status: 'completed', bloating_rating: 4 }),
      ];

      const patterns = analyzeNotesPatterns(entries);
      const stressPattern = patterns.find(p => p.type === 'stress');

      expect(stressPattern?.count).toBe(1); // Only completed entry
    });
  });

  describe('analyzeTriggerFrequency', () => {
    it('should calculate trigger frequency correctly', () => {
      const entries = [
        createMockEntry({
          detected_triggers: [
            { category: 'fodmaps-fructans', food: 'wheat', confidence: 0.9 },
          ],
          bloating_rating: 5,
        }),
        createMockEntry({
          detected_triggers: [
            { category: 'fodmaps-fructans', food: 'onion', confidence: 0.8 },
          ],
          bloating_rating: 4,
        }),
        createMockEntry({
          detected_triggers: [
            { category: 'dairy', food: 'milk', confidence: 0.85 },
          ],
          bloating_rating: 2,
        }),
      ];

      const frequencies = analyzeTriggerFrequency(entries);

      expect(frequencies).toHaveLength(2);
      expect(frequencies[0].category).toBe('fodmaps-fructans');
      expect(frequencies[0].count).toBe(2);
      expect(frequencies[0].percentage).toBe(67); // 2/3 * 100
      expect(frequencies[0].suspicionScore).toBe('high'); // 2 high bloating meals
    });

    it('should not exceed 100% frequency', () => {
      const entries = [
        createMockEntry({
          detected_triggers: [{ category: 'dairy', food: 'milk', confidence: 0.9 }],
        }),
      ];

      const frequencies = analyzeTriggerFrequency(entries);

      expect(frequencies[0].percentage).toBeLessThanOrEqual(100);
    });

    it('should deduplicate meals in trigger count', () => {
      const entries = [
        createMockEntry({
          id: 'meal-1',
          detected_triggers: [
            { category: 'dairy', food: 'milk', confidence: 0.9 },
            { category: 'dairy', food: 'cheese', confidence: 0.8 },
          ],
        }),
      ];

      const frequencies = analyzeTriggerFrequency(entries);

      expect(frequencies[0].count).toBe(1); // One meal, not 2
      expect(frequencies[0].topFoods).toHaveLength(2); // But 2 foods
    });
  });

  describe('generateComprehensiveInsight', () => {
    it('should return null for insufficient data', () => {
      const entries = [
        createMockEntry(),
        createMockEntry(),
      ];

      const insight = generateComprehensiveInsight(entries, null);

      expect(insight).toBeNull();
    });

    it('should generate comprehensive insights with quiz data', () => {
      const entries = [
        createMockEntry({
          notes: 'Stressed 😰',
          detected_triggers: [{ category: 'fodmaps-fructans', food: 'wheat', confidence: 0.9 }],
          bloating_rating: 5,
        }),
        createMockEntry({
          notes: 'Stressed',
          detected_triggers: [{ category: 'fodmaps-fructans', food: 'onion', confidence: 0.8 }],
          bloating_rating: 4,
        }),
        createMockEntry({
          detected_triggers: [{ category: 'dairy', food: 'milk', confidence: 0.85 }],
          bloating_rating: 2,
        }),
      ];

      const mockQuiz: Partial<RootCauseAssessment> = {
        brain_gut_score: 12, // High brain-gut score
        dysbiosis_score: 8,
        overall_score: 65,
        red_flags: ['High stress correlation detected'],
      } as RootCauseAssessment;

      const insight = generateComprehensiveInsight(entries, mockQuiz as RootCauseAssessment);

      expect(insight).toBeDefined();
      expect(insight?.totalMeals).toBe(3);
      expect(insight?.notesPatterns).toHaveLength(1); // Stress pattern
      expect(insight?.quizHighRiskCategories.length).toBeGreaterThan(0);
      expect(insight?.summary.overview.length).toBeGreaterThan(0);
      expect(insight?.summary.rootCauseConnections.length).toBeGreaterThan(0); // Should connect stress notes + quiz
    });

    it('should calculate average bloating correctly', () => {
      const entries = [
        createMockEntry({ bloating_rating: 5 }),
        createMockEntry({ bloating_rating: 3 }),
        createMockEntry({ bloating_rating: 2 }),
      ];

      const insight = generateComprehensiveInsight(entries, null);

      expect(insight?.avgBloating).toBeCloseTo(3.3, 1);
    });

    it('should include behavioral insights from notes', () => {
      const entries = [
        createMockEntry({ notes: 'Ate late 🌙', bloating_rating: 5 }),
        createMockEntry({ notes: 'Late meal', bloating_rating: 5 }),
        createMockEntry({ notes: 'Regular meal', bloating_rating: 2 }),
      ];

      const insight = generateComprehensiveInsight(entries, null);

      expect(insight?.summary.behavioralInsights.length).toBeGreaterThan(0);
      expect(insight?.summary.behavioralInsights[0]).toContain('Ate Late');
    });

    it('should provide action recommendations', () => {
      const entries = [
        createMockEntry({
          detected_triggers: [{ category: 'fodmaps-fructans', food: 'wheat', confidence: 0.9 }],
          bloating_rating: 5,
        }),
        createMockEntry({
          detected_triggers: [{ category: 'fodmaps-fructans', food: 'onion', confidence: 0.8 }],
          bloating_rating: 4,
        }),
        createMockEntry({
          bloating_rating: 2,
        }),
      ];

      const insight = generateComprehensiveInsight(entries, null);

      expect(insight?.summary.topRecommendations.length).toBeGreaterThan(0);
      expect(insight?.summary.topRecommendations[0]).toBeTruthy();
    });
  });
});
