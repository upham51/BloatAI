import { describe, it, expect } from 'vitest';
import {
  analyzeIngredients,
  analyzeIngredientList,
  getTriggerSummary,
  isLikelyLowFODMAP,
} from '../ingredientAnalyzer';
import { DetectedTrigger } from '@/types';

describe('ingredientAnalyzer', () => {
  describe('analyzeIngredients', () => {
    it('should return empty array for empty input', () => {
      expect(analyzeIngredients('')).toEqual([]);
      expect(analyzeIngredients('   ')).toEqual([]);
    });

    it('should return empty array for null/undefined', () => {
      expect(analyzeIngredients(null as any)).toEqual([]);
      expect(analyzeIngredients(undefined as any)).toEqual([]);
    });

    // Grains category
    describe('grains detection', () => {
      it('should detect wheat', () => {
        const result = analyzeIngredients('whole wheat flour, sugar, salt');
        const grainsTrigger = result.find(t => t.category === 'grains');

        expect(grainsTrigger).toBeDefined();
        expect(grainsTrigger?.food).toBe('Wheat');
      });

      it('should detect onion and garlic as grains (fructans)', () => {
        const result = analyzeIngredients('onion powder, garlic, salt');
        const grainsTrigger = result.find(t => t.category === 'grains');

        expect(grainsTrigger).toBeDefined();
      });

      it('should detect bread', () => {
        const result = analyzeIngredients('bread crumbs, eggs, milk');
        const grainsTrigger = result.find(t => t.category === 'grains');

        expect(grainsTrigger).toBeDefined();
      });

      it('should detect inulin and chicory root', () => {
        const result = analyzeIngredients('inulin, chicory root fiber, sugar');
        const grainsTrigger = result.find(t => t.category === 'grains');

        expect(grainsTrigger).toBeDefined();
      });
    });

    // Beans category
    describe('beans detection', () => {
      it('should detect beans', () => {
        const result = analyzeIngredients('black beans, rice, salt');
        const beansTrigger = result.find(t => t.category === 'beans');

        expect(beansTrigger).toBeDefined();
      });

      it('should detect lentils', () => {
        const result = analyzeIngredients('red lentils, onion, cumin');
        const beansTrigger = result.find(t => t.category === 'beans');

        expect(beansTrigger).toBeDefined();
      });

      it('should detect chickpeas and hummus', () => {
        const result = analyzeIngredients('hummus, tahini, lemon');
        const beansTrigger = result.find(t => t.category === 'beans');

        expect(beansTrigger).toBeDefined();
      });

      it('should detect soy and tofu', () => {
        const result = analyzeIngredients('tofu, soy sauce, ginger');
        const beansTrigger = result.find(t => t.category === 'beans');

        expect(beansTrigger).toBeDefined();
      });
    });

    // Dairy category
    describe('dairy detection', () => {
      it('should detect milk', () => {
        const result = analyzeIngredients('milk, sugar, vanilla');
        const dairyTrigger = result.find(t => t.category === 'dairy');

        expect(dairyTrigger).toBeDefined();
        expect(dairyTrigger?.food).toBe('Milk');
      });

      it('should detect cream and yogurt', () => {
        const result = analyzeIngredients('heavy cream, yogurt, honey');
        const dairyTrigger = result.find(t => t.category === 'dairy');

        expect(dairyTrigger).toBeDefined();
      });

      it('should detect cheese', () => {
        const result = analyzeIngredients('cheddar cheese, butter, salt');
        const dairyTrigger = result.find(t => t.category === 'dairy');

        expect(dairyTrigger).toBeDefined();
      });

      it('should detect whey and casein', () => {
        const result = analyzeIngredients('whey protein, casein, flavoring');
        const dairyTrigger = result.find(t => t.category === 'dairy');

        expect(dairyTrigger).toBeDefined();
      });

      it('should detect lactose', () => {
        const result = analyzeIngredients('lactose, maltodextrin, flavoring');
        const dairyTrigger = result.find(t => t.category === 'dairy');

        expect(dairyTrigger).toBeDefined();
      });
    });

    // Fruit category
    describe('fruit detection', () => {
      it('should detect apple', () => {
        const result = analyzeIngredients('apple juice, sugar, citric acid');
        const fruitTrigger = result.find(t => t.category === 'fruit');

        expect(fruitTrigger).toBeDefined();
      });

      it('should detect pear and mango', () => {
        const result = analyzeIngredients('pear puree, mango, water');
        const fruitTrigger = result.find(t => t.category === 'fruit');

        expect(fruitTrigger).toBeDefined();
      });

      it('should detect dried fruits', () => {
        const result = analyzeIngredients('raisins, dates, figs');
        const fruitTrigger = result.find(t => t.category === 'fruit');

        expect(fruitTrigger).toBeDefined();
      });
    });

    // Sweeteners category
    describe('sweeteners detection', () => {
      it('should detect sorbitol', () => {
        const result = analyzeIngredients('sorbitol, flavoring, coloring');
        const sweetenersTrigger = result.find(t => t.category === 'sweeteners');

        expect(sweetenersTrigger).toBeDefined();
        expect(sweetenersTrigger?.food).toBe('Sorbitol');
      });

      it('should detect other sugar alcohols', () => {
        const result = analyzeIngredients('xylitol, mannitol, maltitol');
        const sweetenersTrigger = result.find(t => t.category === 'sweeteners');

        expect(sweetenersTrigger).toBeDefined();
      });

      it('should detect high fructose corn syrup', () => {
        const result = analyzeIngredients('high fructose corn syrup, water, flavoring');
        const sweetenersTrigger = result.find(t => t.category === 'sweeteners');

        expect(sweetenersTrigger).toBeDefined();
      });

      it('should detect honey and agave', () => {
        const result = analyzeIngredients('honey, agave nectar, water');
        const sweetenersTrigger = result.find(t => t.category === 'sweeteners');

        expect(sweetenersTrigger).toBeDefined();
      });
    });

    // Gluten category
    describe('gluten detection', () => {
      it('should detect gluten', () => {
        const result = analyzeIngredients('vital wheat gluten, flour, water');
        const glutenTrigger = result.find(t => t.category === 'gluten');

        expect(glutenTrigger).toBeDefined();
      });

      it('should detect barley and rye', () => {
        const result = analyzeIngredients('barley malt, rye flour, salt');
        const glutenTrigger = result.find(t => t.category === 'gluten');

        expect(glutenTrigger).toBeDefined();
      });

      it('should detect malt', () => {
        const result = analyzeIngredients('malt extract, sugar, flavoring');
        const glutenTrigger = result.find(t => t.category === 'gluten');

        expect(glutenTrigger).toBeDefined();
      });
    });

    // Veggies category
    describe('veggies detection', () => {
      it('should detect broccoli and cauliflower', () => {
        const result = analyzeIngredients('broccoli florets, cauliflower, salt');
        const veggiesTrigger = result.find(t => t.category === 'veggies');

        expect(veggiesTrigger).toBeDefined();
      });

      it('should detect cabbage and brussels sprouts', () => {
        const result = analyzeIngredients('cabbage, brussels sprouts, oil');
        const veggiesTrigger = result.find(t => t.category === 'veggies');

        expect(veggiesTrigger).toBeDefined();
      });

      it('should detect mushrooms', () => {
        const result = analyzeIngredients('mushroom powder, salt, pepper');
        const veggiesTrigger = result.find(t => t.category === 'veggies');

        expect(veggiesTrigger).toBeDefined();
      });

      it('should detect asparagus and artichoke', () => {
        const result = analyzeIngredients('asparagus tips, artichoke hearts');
        const veggiesTrigger = result.find(t => t.category === 'veggies');

        expect(veggiesTrigger).toBeDefined();
      });
    });

    // Fatty-food category
    describe('fatty-food detection', () => {
      it('should detect fried foods', () => {
        const result = analyzeIngredients('deep fried chicken, oil');
        const fattyTrigger = result.find(t => t.category === 'fatty-food');

        expect(fattyTrigger).toBeDefined();
      });

      it('should detect hydrogenated oils', () => {
        const result = analyzeIngredients('partially hydrogenated oil, sugar');
        const fattyTrigger = result.find(t => t.category === 'fatty-food');

        expect(fattyTrigger).toBeDefined();
      });

      it('should detect bacon and sausage', () => {
        const result = analyzeIngredients('bacon bits, sausage, eggs');
        const fattyTrigger = result.find(t => t.category === 'fatty-food');

        expect(fattyTrigger).toBeDefined();
      });
    });

    // Carbonated category
    describe('carbonated detection', () => {
      it('should detect carbonated drinks', () => {
        const result = analyzeIngredients('carbonated water, flavoring');
        const carbonatedTrigger = result.find(t => t.category === 'carbonated');

        expect(carbonatedTrigger).toBeDefined();
      });

      it('should detect soda and sparkling', () => {
        const result = analyzeIngredients('soda water, sparkling wine');
        const carbonatedTrigger = result.find(t => t.category === 'carbonated');

        expect(carbonatedTrigger).toBeDefined();
      });
    });

    // Sugar category
    describe('sugar detection', () => {
      it('should detect sugar', () => {
        const result = analyzeIngredients('sugar, flour, eggs');
        const sugarTrigger = result.find(t => t.category === 'sugar');

        expect(sugarTrigger).toBeDefined();
      });

      it('should detect glucose and dextrose', () => {
        const result = analyzeIngredients('glucose syrup, dextrose, flavoring');
        const sugarTrigger = result.find(t => t.category === 'sugar');

        expect(sugarTrigger).toBeDefined();
      });

      it('should detect molasses and syrup', () => {
        const result = analyzeIngredients('molasses, maple syrup, butter');
        const sugarTrigger = result.find(t => t.category === 'sugar');

        expect(sugarTrigger).toBeDefined();
      });
    });

    // Alcohol category
    describe('alcohol detection', () => {
      it('should detect alcohol', () => {
        const result = analyzeIngredients('ethanol, water, flavoring');
        const alcoholTrigger = result.find(t => t.category === 'alcohol');

        expect(alcoholTrigger).toBeDefined();
      });

      it('should detect beer and wine', () => {
        const result = analyzeIngredients('beer, wine vinegar, salt');
        const alcoholTrigger = result.find(t => t.category === 'alcohol');

        expect(alcoholTrigger).toBeDefined();
      });

      it('should detect spirits', () => {
        const result = analyzeIngredients('vodka, rum, whiskey');
        const alcoholTrigger = result.find(t => t.category === 'alcohol');

        expect(alcoholTrigger).toBeDefined();
      });
    });

    // Processed category
    describe('processed detection', () => {
      it('should detect artificial ingredients', () => {
        const result = analyzeIngredients('artificial flavor, coloring, preservative');
        const processedTrigger = result.find(t => t.category === 'processed');

        expect(processedTrigger).toBeDefined();
      });

      it('should detect MSG', () => {
        const result = analyzeIngredients('monosodium glutamate, salt, pepper');
        const processedTrigger = result.find(t => t.category === 'processed');

        expect(processedTrigger).toBeDefined();
      });

      it('should detect preservatives', () => {
        const result = analyzeIngredients('sodium benzoate, sodium nitrite, BHT');
        const processedTrigger = result.find(t => t.category === 'processed');

        expect(processedTrigger).toBeDefined();
      });
    });

    // Confidence calculation
    describe('confidence calculation', () => {
      it('should start with base confidence of 0.5', () => {
        const result = analyzeIngredients('milk');

        expect(result[0].confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should increase confidence with more matches', () => {
        const singleMatch = analyzeIngredients('milk');
        const multipleMatches = analyzeIngredients('milk, cream, yogurt, cheese, butter');

        const singleDairy = singleMatch.find(t => t.category === 'dairy');
        const multipleDairy = multipleMatches.find(t => t.category === 'dairy');

        expect(multipleDairy!.confidence).toBeGreaterThan(singleDairy!.confidence);
      });

      it('should cap confidence at 0.95', () => {
        // Create ingredient list with many matches
        const result = analyzeIngredients('milk, cream, yogurt, cheese, butter, whey, casein, lactose, buttermilk, ice cream');

        result.forEach(trigger => {
          expect(trigger.confidence).toBeLessThanOrEqual(0.95);
        });
      });
    });

    // Deduplication
    describe('deduplication', () => {
      it('should deduplicate by category', () => {
        const result = analyzeIngredients('milk, cream, yogurt, cheese');
        const dairyTriggers = result.filter(t => t.category === 'dairy');

        expect(dairyTriggers).toHaveLength(1);
      });

      it('should keep highest confidence when deduplicating', () => {
        // Multiple dairy items should result in higher confidence
        const result = analyzeIngredients('milk, cream, yogurt');
        const dairyTrigger = result.find(t => t.category === 'dairy');

        expect(dairyTrigger!.confidence).toBeGreaterThan(0.5);
      });
    });

    // Case insensitivity
    describe('case insensitivity', () => {
      it('should detect triggers regardless of case', () => {
        const lower = analyzeIngredients('wheat flour');
        const upper = analyzeIngredients('WHEAT FLOUR');
        const mixed = analyzeIngredients('WhEaT fLoUr');

        expect(lower.find(t => t.category === 'grains')).toBeDefined();
        expect(upper.find(t => t.category === 'grains')).toBeDefined();
        expect(mixed.find(t => t.category === 'grains')).toBeDefined();
      });
    });

    // Word boundary matching
    describe('word boundary matching', () => {
      it('should use word boundaries to avoid partial matches', () => {
        // "tea" should not match in "steak"
        const result = analyzeIngredients('steak, potatoes');

        // Should not detect false positives
        expect(result.find(t => t.food?.toLowerCase() === 'tea')).toBeUndefined();
      });
    });
  });

  describe('analyzeIngredientList', () => {
    it('should return empty array for empty input', () => {
      expect(analyzeIngredientList([])).toEqual([]);
    });

    it('should return empty array for null/undefined', () => {
      expect(analyzeIngredientList(null as any)).toEqual([]);
      expect(analyzeIngredientList(undefined as any)).toEqual([]);
    });

    it('should join ingredients and analyze', () => {
      const result = analyzeIngredientList(['milk', 'wheat flour', 'sugar']);

      expect(result.find(t => t.category === 'dairy')).toBeDefined();
      expect(result.find(t => t.category === 'grains')).toBeDefined();
    });

    it('should handle array of ingredients', () => {
      const ingredients = ['onion powder', 'garlic salt', 'black pepper'];
      const result = analyzeIngredientList(ingredients);

      expect(result.find(t => t.category === 'grains')).toBeDefined();
    });
  });

  describe('getTriggerSummary', () => {
    it('should return "No common FODMAP triggers detected" for empty array', () => {
      expect(getTriggerSummary([])).toBe('No common FODMAP triggers detected');
    });

    it('should format single trigger', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.8 },
      ];

      expect(getTriggerSummary(triggers)).toBe('Contains Milk');
    });

    it('should format two triggers with "and"', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.8 },
        { category: 'grains', food: 'Wheat', confidence: 0.7 },
      ];

      expect(getTriggerSummary(triggers)).toBe('Contains Milk and Wheat');
    });

    it('should format three or more triggers with count', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.8 },
        { category: 'grains', food: 'Wheat', confidence: 0.7 },
        { category: 'beans', food: 'Beans', confidence: 0.6 },
      ];

      expect(getTriggerSummary(triggers)).toBe('Contains Milk, Wheat, and 1 more');
    });

    it('should handle many triggers', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.8 },
        { category: 'grains', food: 'Wheat', confidence: 0.7 },
        { category: 'beans', food: 'Beans', confidence: 0.6 },
        { category: 'fruit', food: 'Apple', confidence: 0.5 },
        { category: 'sweeteners', food: 'Honey', confidence: 0.5 },
      ];

      const summary = getTriggerSummary(triggers);

      expect(summary).toContain('Contains Milk, Wheat, and 3 more');
    });
  });

  describe('isLikelyLowFODMAP', () => {
    it('should return true for empty triggers', () => {
      expect(isLikelyLowFODMAP([])).toBe(true);
    });

    it('should return true if all triggers have confidence <= 0.7', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.6 },
        { category: 'grains', food: 'Wheat', confidence: 0.7 },
      ];

      expect(isLikelyLowFODMAP(triggers)).toBe(true);
    });

    it('should return false if any trigger has confidence > 0.7', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.8 },
        { category: 'grains', food: 'Wheat', confidence: 0.6 },
      ];

      expect(isLikelyLowFODMAP(triggers)).toBe(false);
    });

    it('should handle edge case at exactly 0.7', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.7 },
      ];

      expect(isLikelyLowFODMAP(triggers)).toBe(true);
    });

    it('should return false for high confidence trigger', () => {
      const triggers: DetectedTrigger[] = [
        { category: 'dairy', food: 'Milk', confidence: 0.95 },
      ];

      expect(isLikelyLowFODMAP(triggers)).toBe(false);
    });
  });
});
