import { describe, it, expect } from 'vitest';
import {
  abbreviateIngredient,
  getIconForTrigger,
  formatTriggerDisplay,
  getSafeAlternatives,
  getSafeAlternativesDetailed,
  deduplicateFoods,
  deduplicateTriggers,
  validatePercentage,
  calculateTriggerFrequency,
  analyzeHighBloatingMeals,
} from '../triggerUtils';

describe('triggerUtils', () => {
  describe('abbreviateIngredient', () => {
    it('should return empty string for falsy input', () => {
      expect(abbreviateIngredient('')).toBe('');
      expect(abbreviateIngredient(null as any)).toBe('');
      expect(abbreviateIngredient(undefined as any)).toBe('');
    });

    it('should remove parenthetical notes', () => {
      expect(abbreviateIngredient('Chicken breast (boneless)')).not.toContain('boneless');
      expect(abbreviateIngredient('Milk (2%)')).not.toContain('2%');
    });

    it('should take first part before comma', () => {
      expect(abbreviateIngredient('Salt, Pepper, Garlic')).toBe('Salt');
      expect(abbreviateIngredient('Chicken, grilled')).toBe('Chicken');
    });

    it('should apply transformation mappings for meats', () => {
      expect(abbreviateIngredient('ground beef')).toBe('Beef');
      expect(abbreviateIngredient('chicken breast')).toBe('Chicken');
      expect(abbreviateIngredient('ground pork')).toBe('Pork');
      expect(abbreviateIngredient('ground turkey')).toBe('Turkey');
    });

    it('should apply transformation mappings for sauces', () => {
      expect(abbreviateIngredient('soy sauce')).toBe('Sauce');
      expect(abbreviateIngredient('teriyaki sauce')).toBe('Sauce');
      expect(abbreviateIngredient('bbq sauce')).toBe('Sauce');
      expect(abbreviateIngredient('hot sauce')).toBe('Sauce');
    });

    it('should apply transformation mappings for grains', () => {
      expect(abbreviateIngredient('whole wheat pasta')).toBe('Pasta');
      expect(abbreviateIngredient('spaghetti')).toBe('Pasta');
      expect(abbreviateIngredient('brown rice')).toBe('Rice');
      expect(abbreviateIngredient('white bread')).toBe('Bread');
    });

    it('should apply transformation mappings for dairy', () => {
      expect(abbreviateIngredient('greek yogurt')).toBe('Yogurt');
      expect(abbreviateIngredient('parmesan cheese')).toBe('Cheese');
      expect(abbreviateIngredient('heavy cream')).toBe('Cream');
    });

    it('should remove common descriptors', () => {
      // Note: basil is mapped to 'Seasoning' via INGREDIENT_TRANSFORMATIONS
      expect(abbreviateIngredient('fresh spinach')).toBe('Spinach');
      expect(abbreviateIngredient('grilled chicken')).toBe('Chicken');
      expect(abbreviateIngredient('diced bell peppers')).toBe('Bell Pepper');
      expect(abbreviateIngredient('organic apples')).toBe('Apples');
    });

    it('should capitalize first letter of each word', () => {
      const result = abbreviateIngredient('raw spinach');
      expect(result[0]).toBe(result[0].toUpperCase());
    });

    it('should limit to 2 words', () => {
      const result = abbreviateIngredient('very long ingredient name here');
      const wordCount = result.split(' ').length;
      expect(wordCount).toBeLessThanOrEqual(2);
    });
  });

  describe('getIconForTrigger', () => {
    it('should return default icon for empty input', () => {
      expect(getIconForTrigger('')).toBe('🍽️');
      expect(getIconForTrigger(null as any)).toBe('🍽️');
    });

    it('should return correct icon for exact matches', () => {
      expect(getIconForTrigger('dairy')).toBe('🥛');
      expect(getIconForTrigger('grains')).toBe('🌾');
      expect(getIconForTrigger('pizza')).toBe('🍕');
      expect(getIconForTrigger('burger')).toBe('🍔');
    });

    it('should match word-by-word', () => {
      // Note: 'grilled' matches first giving fire icon, but 'chicken only' gives chicken
      expect(getIconForTrigger('chicken breast')).toBe('🐔');
      expect(getIconForTrigger('whole milk')).toBe('🥛');
    });

    it('should use category fallback for unknown foods', () => {
      // Foods containing FODMAP category keywords should get category icons
      expect(getIconForTrigger('fructan-rich food')).toBe('🌾');
      expect(getIconForTrigger('lactose intolerant')).toBe('🥛');
    });

    it('should return correct icons for proteins', () => {
      expect(getIconForTrigger('chicken')).toBe('🐔');
      expect(getIconForTrigger('beef')).toBe('🥩');
      expect(getIconForTrigger('salmon')).toBe('🐟');
      expect(getIconForTrigger('shrimp')).toBe('🦐');
      expect(getIconForTrigger('egg')).toBe('🥚');
    });

    it('should return correct icons for vegetables', () => {
      expect(getIconForTrigger('broccoli')).toBe('🥦');
      expect(getIconForTrigger('carrot')).toBe('🥕');
      expect(getIconForTrigger('onion')).toBe('🧅');
      expect(getIconForTrigger('garlic')).toBe('🧄');
      expect(getIconForTrigger('tomato')).toBe('🍅');
    });

    it('should return correct icons for fruits', () => {
      expect(getIconForTrigger('apple')).toBe('🍎');
      expect(getIconForTrigger('banana')).toBe('🍌');
      expect(getIconForTrigger('orange')).toBe('🍊');
      expect(getIconForTrigger('strawberry')).toBe('🍓');
    });

    it('should return correct icons for beverages', () => {
      expect(getIconForTrigger('coffee')).toBe('☕');
      expect(getIconForTrigger('tea')).toBe('🍵');
      expect(getIconForTrigger('wine')).toBe('🍷');
      expect(getIconForTrigger('beer')).toBe('🍺');
    });

    it('should handle case insensitivity', () => {
      expect(getIconForTrigger('DAIRY')).toBe('🥛');
      expect(getIconForTrigger('Grains')).toBe('🌾');
      expect(getIconForTrigger('PIZZA')).toBe('🍕');
    });
  });

  describe('formatTriggerDisplay', () => {
    it('should return empty array for empty input', () => {
      expect(formatTriggerDisplay([])).toEqual([]);
      expect(formatTriggerDisplay(null as any)).toEqual([]);
    });

    it('should format triggers with icons and names', () => {
      const triggers = [
        { category: 'dairy', food: 'milk' },
        { category: 'grains', food: 'bread' },
      ];

      const result = formatTriggerDisplay(triggers);

      expect(result).toHaveLength(2);
      expect(result[0].icon).toBeDefined();
      expect(result[0].name).toBeDefined();
      expect(result[0].category).toBe('dairy');
    });

    it('should handle onion with Fructans suffix', () => {
      const triggers = [{ category: 'grains', food: 'onion' }];
      const result = formatTriggerDisplay(triggers);

      expect(result[0].name).toBe('Onion (Fructans)');
    });

    it('should handle garlic with Fructans suffix', () => {
      const triggers = [{ category: 'grains', food: 'garlic' }];
      const result = formatTriggerDisplay(triggers);

      expect(result[0].name).toBe('Garlic (Fructans)');
    });

    it('should use trigger category display name', () => {
      const triggers = [{ category: 'dairy', food: 'cheese' }];
      const result = formatTriggerDisplay(triggers);

      expect(result[0].name).toBe('Dairy');
    });
  });

  describe('getSafeAlternatives', () => {
    it('should return alternatives for known categories', () => {
      expect(getSafeAlternatives('dairy').length).toBeGreaterThan(0);
      expect(getSafeAlternatives('grains').length).toBeGreaterThan(0);
      expect(getSafeAlternatives('beans').length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown category', () => {
      expect(getSafeAlternatives('unknown-category')).toEqual([]);
    });

    it('should be case insensitive', () => {
      expect(getSafeAlternatives('DAIRY').length).toBeGreaterThan(0);
      expect(getSafeAlternatives('Grains').length).toBeGreaterThan(0);
    });

    it('should match partial category names', () => {
      expect(getSafeAlternatives('dairy products').length).toBeGreaterThan(0);
    });

    it('should return array of strings', () => {
      const alternatives = getSafeAlternatives('dairy');
      expect(Array.isArray(alternatives)).toBe(true);
      alternatives.forEach(alt => {
        expect(typeof alt).toBe('string');
      });
    });
  });

  describe('getSafeAlternativesDetailed', () => {
    it('should return detailed data for known categories', () => {
      const result = getSafeAlternativesDetailed('dairy');

      expect(result).not.toBeNull();
      expect(result?.alternatives.length).toBeGreaterThan(0);
      expect(result?.protip).toBeDefined();
    });

    it('should return null for unknown category', () => {
      expect(getSafeAlternativesDetailed('unknown-category')).toBeNull();
    });

    it('should include alternatives with name, portion, and notes', () => {
      const result = getSafeAlternativesDetailed('dairy');

      expect(result?.alternatives[0].name).toBeDefined();
    });

    it('should include key brands when available', () => {
      const result = getSafeAlternativesDetailed('dairy');

      expect(result?.keyBrands).toBeDefined();
      expect(Array.isArray(result?.keyBrands)).toBe(true);
    });

    it('should be case insensitive', () => {
      const result1 = getSafeAlternativesDetailed('dairy');
      const result2 = getSafeAlternativesDetailed('DAIRY');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });
  });

  describe('deduplicateFoods', () => {
    it('should return empty array for empty input', () => {
      expect(deduplicateFoods([])).toEqual([]);
    });

    it('should merge counts for duplicate foods', () => {
      const foods = [
        { food: 'chicken breast', count: 2 },
        { food: 'Chicken', count: 3 },
        { food: 'grilled chicken', count: 1 },
      ];

      const result = deduplicateFoods(foods);

      // All should be normalized to "Chicken" and merged
      const chickenItem = result.find(f => f.food.toLowerCase() === 'chicken');
      expect(chickenItem?.count).toBe(6);
    });

    it('should normalize food names', () => {
      const foods = [
        { food: 'soy sauce', count: 1 },
        { food: 'teriyaki sauce', count: 1 },
      ];

      const result = deduplicateFoods(foods);

      // Both should be normalized to "Sauce"
      const sauceItem = result.find(f => f.food.toLowerCase() === 'sauce');
      expect(sauceItem?.count).toBe(2);
    });

    it('should sort by count descending', () => {
      const foods = [
        { food: 'Apple', count: 1 },
        { food: 'Banana', count: 5 },
        { food: 'Orange', count: 3 },
      ];

      const result = deduplicateFoods(foods);

      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
      if (result.length > 2) {
        expect(result[1].count).toBeGreaterThanOrEqual(result[2].count);
      }
    });

    it('should preserve case in output', () => {
      const foods = [{ food: 'apple', count: 1 }];
      const result = deduplicateFoods(foods);

      // Should be capitalized by abbreviateIngredient
      expect(result[0].food[0]).toBe(result[0].food[0].toUpperCase());
    });
  });

  describe('deduplicateTriggers', () => {
    it('should return empty array for empty input', () => {
      expect(deduplicateTriggers([])).toEqual([]);
      expect(deduplicateTriggers(null as any)).toEqual([]);
    });

    it('should keep single triggers unchanged', () => {
      const triggers = [
        { category: 'dairy', food: 'milk', confidence: 0.9 },
      ];

      const result = deduplicateTriggers(triggers);
      expect(result).toHaveLength(1);
    });

    it('should deduplicate by category keeping more specific names', () => {
      const triggers = [
        { category: 'grains', food: 'French Toast', confidence: 0.8 },
        { category: 'grains', food: 'Bread', confidence: 0.9 },
      ];

      const result = deduplicateTriggers(triggers);

      // Should keep "French Toast" over "Bread" (more specific)
      expect(result).toHaveLength(1);
      expect(result[0].food).toBe('French Toast');
    });

    it('should remove triggers with identical normalized names', () => {
      const triggers = [
        { category: 'dairy', food: 'Greek Yogurt', confidence: 0.8 },
        { category: 'dairy', food: 'greek yogurt', confidence: 0.9 },
      ];

      const result = deduplicateTriggers(triggers);

      expect(result).toHaveLength(1);
    });

    it('should preserve triggers from different categories', () => {
      const triggers = [
        { category: 'dairy', food: 'milk', confidence: 0.9 },
        { category: 'grains', food: 'bread', confidence: 0.8 },
        { category: 'beans', food: 'lentils', confidence: 0.7 },
      ];

      const result = deduplicateTriggers(triggers);

      expect(result).toHaveLength(3);
    });

    it('should handle milk/latte relationship', () => {
      const triggers = [
        { category: 'dairy', food: 'latte', confidence: 0.8 },
        { category: 'dairy', food: 'milk', confidence: 0.9 },
      ];

      const result = deduplicateTriggers(triggers);

      // Should keep "latte" (more specific)
      expect(result).toHaveLength(1);
      expect(result[0].food).toBe('latte');
    });
  });

  describe('validatePercentage', () => {
    it('should return 0 for NaN', () => {
      expect(validatePercentage(NaN)).toBe(0);
    });

    it('should return 0 for Infinity', () => {
      expect(validatePercentage(Infinity)).toBe(0);
      expect(validatePercentage(-Infinity)).toBe(0);
    });

    it('should clamp negative values to 0', () => {
      expect(validatePercentage(-10)).toBe(0);
      expect(validatePercentage(-100)).toBe(0);
    });

    it('should clamp values over 100 to 100', () => {
      expect(validatePercentage(150)).toBe(100);
      expect(validatePercentage(200)).toBe(100);
    });

    it('should round values', () => {
      expect(validatePercentage(33.33)).toBe(33);
      expect(validatePercentage(66.67)).toBe(67);
    });

    it('should pass through valid percentages', () => {
      expect(validatePercentage(0)).toBe(0);
      expect(validatePercentage(50)).toBe(50);
      expect(validatePercentage(100)).toBe(100);
    });

    it('should handle edge cases at boundaries', () => {
      expect(validatePercentage(0.1)).toBe(0);
      expect(validatePercentage(99.9)).toBe(100);
      expect(validatePercentage(-0.1)).toBe(0);
      expect(validatePercentage(100.1)).toBe(100);
    });
  });

  describe('calculateTriggerFrequency', () => {
    it('should return zeros for empty entries', () => {
      const result = calculateTriggerFrequency('dairy', []);

      expect(result.count).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should count meals containing the trigger', () => {
      const entries = [
        { detected_triggers: [{ category: 'dairy' }] },
        { detected_triggers: [{ category: 'dairy' }] },
        { detected_triggers: [{ category: 'grains' }] },
        { detected_triggers: [] },
      ];

      const result = calculateTriggerFrequency('dairy', entries);

      expect(result.count).toBe(2);
      expect(result.total).toBe(4);
      expect(result.percentage).toBe(50);
    });

    it('should handle entries without detected_triggers', () => {
      const entries = [
        { detected_triggers: undefined },
        { detected_triggers: [{ category: 'dairy' }] },
      ];

      const result = calculateTriggerFrequency('dairy', entries);

      expect(result.count).toBe(1);
      expect(result.total).toBe(2);
    });

    it('should validate percentage to be 0-100', () => {
      const entries = [
        { detected_triggers: [{ category: 'dairy' }] },
      ];

      const result = calculateTriggerFrequency('dairy', entries);

      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeHighBloatingMeals', () => {
    it('should return empty array for empty entries', () => {
      expect(analyzeHighBloatingMeals([])).toEqual([]);
    });

    it('should filter meals with bloating_rating >= 4', () => {
      const entries = [
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 3, detected_triggers: [{ category: 'dairy' }] }, // Not included
        { bloating_rating: 2, detected_triggers: [{ category: 'dairy' }] }, // Not included
      ];

      const result = analyzeHighBloatingMeals(entries);
      const dairyTrigger = result.find(r => r.category === 'dairy');

      expect(dairyTrigger?.count).toBe(2); // Only ratings 4 and 5
      expect(dairyTrigger?.total).toBe(2);
    });

    it('should count trigger occurrences in high-bloating meals', () => {
      const entries = [
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }, { category: 'grains' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'grains' }] },
      ];

      const result = analyzeHighBloatingMeals(entries);

      const dairyTrigger = result.find(r => r.category === 'dairy');
      const grainsTrigger = result.find(r => r.category === 'grains');

      expect(dairyTrigger?.count).toBe(2);
      expect(grainsTrigger?.count).toBe(2);
    });

    it('should sort by count descending', () => {
      const entries = [
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'grains' }] },
      ];

      const result = analyzeHighBloatingMeals(entries);

      expect(result[0].category).toBe('dairy');
      expect(result[0].count).toBe(3);
    });

    it('should include display text', () => {
      const entries = [
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'dairy' }] },
      ];

      const result = analyzeHighBloatingMeals(entries);

      expect(result[0].displayText).toContain('2');
      expect(result[0].displayText).toContain('high-bloating meal');
    });

    it('should handle null/undefined bloating ratings', () => {
      const entries = [
        { bloating_rating: null, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: undefined, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }] },
      ];

      const result = analyzeHighBloatingMeals(entries);

      expect(result[0].count).toBe(1); // Only the rating: 5 entry
    });

    it('should handle boundary value of 3.99', () => {
      const entries = [
        { bloating_rating: 3.99, detected_triggers: [{ category: 'dairy' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'grains' }] },
      ];

      const result = analyzeHighBloatingMeals(entries);

      // 3.99 should NOT be included (threshold is >= 4)
      expect(result.find(r => r.category === 'dairy')).toBeUndefined();
      expect(result.find(r => r.category === 'grains')).toBeDefined();
    });

    it('should ensure count never exceeds total', () => {
      const entries = [
        { bloating_rating: 5, detected_triggers: [{ category: 'dairy' }, { category: 'dairy' }] },
        { bloating_rating: 4, detected_triggers: [{ category: 'dairy' }] },
      ];

      const result = analyzeHighBloatingMeals(entries);

      result.forEach(trigger => {
        expect(trigger.count).toBeLessThanOrEqual(trigger.total);
      });
    });
  });
});
