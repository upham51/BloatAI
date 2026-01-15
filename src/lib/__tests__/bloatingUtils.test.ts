import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HIGH_BLOATING_THRESHOLD,
  LOW_BLOATING_THRESHOLD,
  MODERATE_BLOATING_THRESHOLD,
  isHighBloating,
  isLowBloating,
  isModerateBloating,
  getBloatingSeverity,
  retryWithBackoff,
  validateMealDescription,
} from '../bloatingUtils';

describe('bloatingUtils', () => {
  describe('Constants', () => {
    it('should have correct threshold values', () => {
      expect(HIGH_BLOATING_THRESHOLD).toBe(4);
      expect(LOW_BLOATING_THRESHOLD).toBe(2);
      expect(MODERATE_BLOATING_THRESHOLD).toBe(3);
    });
  });

  describe('isHighBloating', () => {
    it('should return true for ratings at or above high threshold', () => {
      expect(isHighBloating(4)).toBe(true);
      expect(isHighBloating(5)).toBe(true);
    });

    it('should return false for ratings below high threshold', () => {
      expect(isHighBloating(1)).toBe(false);
      expect(isHighBloating(2)).toBe(false);
      expect(isHighBloating(3)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isHighBloating(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isHighBloating(undefined)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isHighBloating(0)).toBe(false);
      expect(isHighBloating(3.9)).toBe(false);
      expect(isHighBloating(4.0)).toBe(true);
      expect(isHighBloating(4.1)).toBe(true);
      expect(isHighBloating(10)).toBe(true);
      expect(isHighBloating(-1)).toBe(false);
    });
  });

  describe('isLowBloating', () => {
    it('should return true for ratings at or below low threshold', () => {
      expect(isLowBloating(1)).toBe(true);
      expect(isLowBloating(2)).toBe(true);
    });

    it('should return false for ratings above low threshold', () => {
      expect(isLowBloating(3)).toBe(false);
      expect(isLowBloating(4)).toBe(false);
      expect(isLowBloating(5)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isLowBloating(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isLowBloating(undefined)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isLowBloating(0)).toBe(true);
      expect(isLowBloating(2.0)).toBe(true);
      expect(isLowBloating(2.1)).toBe(false);
      expect(isLowBloating(2.9)).toBe(false);
      expect(isLowBloating(-1)).toBe(true);
      expect(isLowBloating(-10)).toBe(true);
    });
  });

  describe('isModerateBloating', () => {
    it('should return true only for ratings exactly equal to moderate threshold', () => {
      expect(isModerateBloating(3)).toBe(true);
    });

    it('should return false for ratings not equal to moderate threshold', () => {
      expect(isModerateBloating(1)).toBe(false);
      expect(isModerateBloating(2)).toBe(false);
      expect(isModerateBloating(4)).toBe(false);
      expect(isModerateBloating(5)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isModerateBloating(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isModerateBloating(undefined)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      expect(isModerateBloating(0)).toBe(false);
      expect(isModerateBloating(2.9)).toBe(false);
      expect(isModerateBloating(3.0)).toBe(true);
      expect(isModerateBloating(3.1)).toBe(false);
      expect(isModerateBloating(-1)).toBe(false);
    });
  });

  describe('getBloatingSeverity', () => {
    it('should return "none" for rating 1', () => {
      expect(getBloatingSeverity(1)).toBe('none');
    });

    it('should return "low" for rating 2', () => {
      expect(getBloatingSeverity(2)).toBe('low');
    });

    it('should return "moderate" for rating 3', () => {
      expect(getBloatingSeverity(3)).toBe('moderate');
    });

    it('should return "high" for rating 4', () => {
      expect(getBloatingSeverity(4)).toBe('high');
    });

    it('should return "severe" for rating 5', () => {
      expect(getBloatingSeverity(5)).toBe('severe');
    });

    it('should return "none" for null', () => {
      expect(getBloatingSeverity(null)).toBe('none');
    });

    it('should return "none" for undefined', () => {
      expect(getBloatingSeverity(undefined)).toBe('none');
    });

    it('should return "none" for invalid ratings', () => {
      expect(getBloatingSeverity(0)).toBe('none');
      expect(getBloatingSeverity(6)).toBe('none');
      expect(getBloatingSeverity(10)).toBe('none');
      expect(getBloatingSeverity(-1)).toBe('none');
      expect(getBloatingSeverity(1.5)).toBe('none');
      expect(getBloatingSeverity(2.5)).toBe('none');
      expect(getBloatingSeverity(3.5)).toBe('none');
      expect(getBloatingSeverity(4.5)).toBe('none');
    });
  });

  describe('retryWithBackoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should return result on first successful attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const resultPromise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success');

      const resultPromise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const error = new Error('Persistent failure');
      const mockFn = vi.fn().mockRejectedValue(error);

      const resultPromise = retryWithBackoff(mockFn, 3);
      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow('Persistent failure');
      expect(mockFn).toHaveBeenCalledTimes(4); // initial + 3 retries
    });

    it('should use exponential backoff delays', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockRejectedValueOnce(new Error('Fail 4'));

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const resultPromise = retryWithBackoff(mockFn, 3, 1000);

      // Fast-forward through all timers
      await vi.runAllTimersAsync();

      // Check that console.log was called with exponential backoff messages
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1000ms'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('2000ms'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('4000ms'));

      consoleLogSpy.mockRestore();

      await expect(resultPromise).rejects.toThrow('Fail 4');
    });

    it('should respect custom maxRetries parameter', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = retryWithBackoff(mockFn, 2);
      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow('Fail');
      expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should respect custom baseDelay parameter', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success');

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const resultPromise = retryWithBackoff(mockFn, 3, 500);
      await vi.runAllTimersAsync();
      await resultPromise;

      // Should log with base delay of 500ms
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('500ms'));

      consoleLogSpy.mockRestore();
    });

    it('should handle zero retries by attempting once', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = retryWithBackoff(mockFn, 0);
      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow('Fail');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should preserve the type of the returned value', async () => {
      const mockFnString = vi.fn().mockResolvedValue('string result');
      const mockFnNumber = vi.fn().mockResolvedValue(42);
      const mockFnObject = vi.fn().mockResolvedValue({ data: 'test' });

      const stringPromise = retryWithBackoff(mockFnString);
      const numberPromise = retryWithBackoff(mockFnNumber);
      const objectPromise = retryWithBackoff(mockFnObject);

      await vi.runAllTimersAsync();

      await expect(stringPromise).resolves.toBe('string result');
      await expect(numberPromise).resolves.toBe(42);
      await expect(objectPromise).resolves.toEqual({ data: 'test' });
    });
  });

  describe('validateMealDescription', () => {
    it('should accept valid descriptions', () => {
      expect(validateMealDescription('Pizza')).toEqual({ valid: true });
      expect(validateMealDescription('Chicken breast with rice')).toEqual({ valid: true });
      expect(validateMealDescription('A delicious meal with lots of ingredients')).toEqual({ valid: true });
    });

    it('should reject empty string', () => {
      const result = validateMealDescription('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Meal description cannot be empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateMealDescription('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Meal description cannot be empty');
    });

    it('should reject descriptions shorter than 3 characters', () => {
      let result = validateMealDescription('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Meal description must be at least 3 characters');

      result = validateMealDescription('a');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Meal description must be at least 3 characters');
    });

    it('should accept descriptions with exactly 3 characters', () => {
      const result = validateMealDescription('abc');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject descriptions longer than 1000 characters', () => {
      const longDescription = 'a'.repeat(1001);
      const result = validateMealDescription(longDescription);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Meal description is too long (max 1000 characters)');
    });

    it('should accept descriptions with exactly 1000 characters', () => {
      const maxDescription = 'a'.repeat(1000);
      const result = validateMealDescription(maxDescription);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should trim whitespace before validation', () => {
      expect(validateMealDescription('  Pizza  ')).toEqual({ valid: true });
      expect(validateMealDescription('  ab  ')).toEqual({
        valid: false,
        error: 'Meal description must be at least 3 characters',
      });
      expect(validateMealDescription('  abc  ')).toEqual({ valid: true });
    });

    it('should handle newlines and special characters', () => {
      expect(validateMealDescription('Pizza\nwith cheese')).toEqual({ valid: true });
      expect(validateMealDescription('Test!@#$%^&*()')).toEqual({ valid: true });
      expect(validateMealDescription('Emoji test 🍕🍔')).toEqual({ valid: true });
    });

    it('should handle various edge cases', () => {
      // Just whitespace in the middle
      expect(validateMealDescription('   a   ')).toEqual({
        valid: false,
        error: 'Meal description must be at least 3 characters',
      });

      // Mix of valid and whitespace
      expect(validateMealDescription('  a b c  ')).toEqual({ valid: true });

      // Tabs and newlines
      expect(validateMealDescription('\t\n')).toEqual({
        valid: false,
        error: 'Meal description cannot be empty',
      });
    });
  });
});
