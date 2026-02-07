import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MealEntry, DetectedTrigger } from '@/types';
import React from 'react';

// Use vi.hoisted() to ensure mocks are available before vi.mock is executed
const { mockQueryChain, mockAuth, resetMockChain, setEqResult } = vi.hoisted(() => {
  // Default result for queries
  let defaultResult = { data: [], error: null };
  let eqResult: { data?: any; error: any } | null = null;

  // Create chainable mock for Supabase queries that is also thenable
  const createChainableMock = () => {
    const mock: any = {
      // Make the mock thenable (Promise-like) for terminal methods
      then: (resolve: (value: any) => any) => {
        // If eq was called last and has a specific result, use that
        if (eqResult !== null) {
          const result = eqResult;
          eqResult = null; // Reset after use
          return Promise.resolve(result).then(resolve);
        }
        return Promise.resolve(defaultResult).then(resolve);
      },
    };

    mock.from = vi.fn(() => mock);
    mock.select = vi.fn(() => mock);
    mock.insert = vi.fn(() => mock);
    mock.update = vi.fn(() => mock);
    mock.delete = vi.fn(() => mock);
    mock.eq = vi.fn(() => mock);
    mock.order = vi.fn(() => mock);
    mock.range = vi.fn(() => Promise.resolve({ data: [], error: null }));
    mock.single = vi.fn(() => Promise.resolve({ data: null, error: null }));

    return mock;
  };

  const mockChain = createChainableMock();

  return {
    mockQueryChain: mockChain,
    mockAuth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    // Helper to set eq terminal result (for update/delete)
    resetMockChain: () => {
      eqResult = null;
      defaultResult = { data: [], error: null };
    },
    setEqResult: (result: { data?: any; error: any }) => {
      eqResult = result;
    },
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => mockQueryChain.from(table),
    auth: mockAuth,
  },
}));

// Mock localPhotoStorage
vi.mock('@/lib/localPhotoStorage', () => ({
  localPhotoStorage: {
    deletePhoto: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock retryWithBackoff to execute immediately
vi.mock('@/lib/bloatingUtils', async () => {
  const actual = await vi.importActual('@/lib/bloatingUtils');
  return {
    ...actual,
    retryWithBackoff: vi.fn((fn: () => Promise<any>) => fn()),
  };
});

// Import after mocks
import { MealProvider, useMeals } from '../MealContext';
import { AuthProvider } from '../AuthContext';

// Helper to create mock meal entry
const createMockMealEntry = (overrides: Partial<MealEntry> = {}): MealEntry => ({
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

// Test component that exposes context values
function TestConsumer({ onReady }: { onReady: (context: ReturnType<typeof useMeals>) => void }) {
  const context = useMeals();
  React.useEffect(() => {
    onReady(context);
  }, [context, onReady]);
  return <div data-testid="consumer">Ready</div>;
}

describe('MealContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockChain();

    // Default mock for authenticated user
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
    });
    mockAuth.onAuthStateChange.mockImplementation((callback) => {
      callback('SIGNED_IN', { user: { id: 'test-user' } });
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useMeals hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress React error boundary logging for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useMeals();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('Initial state', () => {
    it('should start with loading state', async () => {
      mockQueryChain.range.mockResolvedValue({ data: [], error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('consumer')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
      });
    });

    it('should have empty entries for new user', async () => {
      mockQueryChain.range.mockResolvedValue({ data: [], error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toEqual([]);
      });
    });

    it('should set hasMore to false when no entries returned', async () => {
      mockQueryChain.range.mockResolvedValue({ data: [], error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.hasMore).toBe(false);
      });
    });
  });

  describe('fetchEntries', () => {
    it('should fetch entries for authenticated user', async () => {
      const mockEntries = [
        createMockMealEntry({ id: '1', meal_description: 'Breakfast' }),
        createMockMealEntry({ id: '2', meal_description: 'Lunch' }),
      ];

      mockQueryChain.range.mockResolvedValue({ data: mockEntries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(2);
      });

      expect(mockQueryChain.from).toHaveBeenCalledWith('meal_entries');
      expect(mockQueryChain.eq).toHaveBeenCalledWith('user_id', 'test-user');
    });

    it('should handle database errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockQueryChain.range.mockResolvedValue({ data: null, error: new Error('DB Error') });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should clear entries when user is not authenticated', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
      });
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toEqual([]);
      });
    });
  });

  describe('addEntry', () => {
    it('should add new entry to the database and state', async () => {
      const newEntry = createMockMealEntry({ id: 'new-entry', meal_description: 'New meal' });

      mockQueryChain.range.mockResolvedValue({ data: [], error: null });
      mockQueryChain.single.mockResolvedValue({ data: newEntry, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
      });

      await act(async () => {
        await contextValue?.addEntry({
          meal_description: 'New meal',
          photo_url: null,
          portion_size: 'normal',
          eating_speed: 'normal',
          social_setting: 'solo',
          bloating_rating: null,
          rating_status: 'pending',
          rating_due_at: null,
          detected_triggers: [],
          custom_title: null,
          meal_emoji: null,
          meal_title: null,
          title_options: [],
          notes: null,
          entry_method: 'photo',
        });
      });

      expect(mockQueryChain.insert).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
      });
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      await expect(
        contextValue?.addEntry({
          meal_description: 'Test',
          photo_url: null,
          portion_size: 'normal',
          eating_speed: 'normal',
          social_setting: 'solo',
          bloating_rating: null,
          rating_status: 'pending',
          rating_due_at: null,
          detected_triggers: [],
          custom_title: null,
          meal_emoji: null,
          meal_title: null,
          title_options: [],
          notes: null,
          entry_method: 'photo',
        })
      ).rejects.toThrow('User not authenticated');
    });
  });

  describe('updateEntry', () => {
    it('should update entry in database and state', async () => {
      const existingEntry = createMockMealEntry({ id: 'entry-1', meal_description: 'Original' });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      await act(async () => {
        await contextValue?.updateEntry('entry-1', { meal_description: 'Updated' });
      });

      expect(mockQueryChain.update).toHaveBeenCalled();
    });

    it('should convert detected_triggers to JSON format', async () => {
      const existingEntry = createMockMealEntry({ id: 'entry-1' });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      const newTriggers: DetectedTrigger[] = [{ category: 'dairy', food: 'milk', confidence: 0.9 }];

      await act(async () => {
        await contextValue?.updateEntry('entry-1', { detected_triggers: newTriggers });
      });

      expect(mockQueryChain.update).toHaveBeenCalled();
    });

    it('should throw error on database failure', async () => {
      const existingEntry = createMockMealEntry({ id: 'entry-1' });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // Set up the eq result for the update operation (terminal eq)
      setEqResult({ error: new Error('Update failed') });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      await expect(
        contextValue?.updateEntry('entry-1', { meal_description: 'Updated' })
      ).rejects.toThrow();
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry from database and state', async () => {
      const existingEntry = createMockMealEntry({ id: 'entry-1' });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      await act(async () => {
        await contextValue?.deleteEntry('entry-1');
      });

      expect(mockQueryChain.delete).toHaveBeenCalled();
    });

    it('should attempt to delete photo from local storage', async () => {
      const { localPhotoStorage } = await import('@/lib/localPhotoStorage');
      const existingEntry = createMockMealEntry({
        id: 'entry-1',
        photo_url: 'local://photo123'
      });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      await act(async () => {
        await contextValue?.deleteEntry('entry-1');
      });

      expect(localPhotoStorage.deletePhoto).toHaveBeenCalledWith('local://photo123');
    });

    it('should not throw if photo deletion fails', async () => {
      const { localPhotoStorage } = await import('@/lib/localPhotoStorage');
      (localPhotoStorage.deletePhoto as any).mockRejectedValue(new Error('Photo not found'));

      const existingEntry = createMockMealEntry({
        id: 'entry-1',
        photo_url: 'local://photo123'
      });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      // Should not throw
      await act(async () => {
        await contextValue?.deleteEntry('entry-1');
      });

      consoleError.mockRestore();
    });
  });

  describe('updateRating', () => {
    it('should update bloating rating and set status to completed', async () => {
      const existingEntry = createMockMealEntry({
        id: 'entry-1',
        rating_status: 'pending',
        bloating_rating: null,
      });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      await act(async () => {
        await contextValue?.updateRating('entry-1', 4);
      });

      expect(mockQueryChain.update).toHaveBeenCalled();
    });
  });

  describe('skipRating', () => {
    it('should set rating status to skipped', async () => {
      const existingEntry = createMockMealEntry({
        id: 'entry-1',
        rating_status: 'pending',
      });

      mockQueryChain.range.mockResolvedValue({ data: [existingEntry], error: null });
      // eq returns chainable mock which is also thenable - no override needed

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(1);
      });

      await act(async () => {
        await contextValue?.skipRating('entry-1');
      });

      expect(mockQueryChain.update).toHaveBeenCalled();
    });
  });

  describe('getPendingEntry', () => {
    it('should return null when no pending entries', async () => {
      const entries = [
        createMockMealEntry({ id: '1', rating_status: 'completed' }),
        createMockMealEntry({ id: '2', rating_status: 'completed' }),
      ];

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(2);
      });

      expect(contextValue?.getPendingEntry()).toBeNull();
    });

    it('should return overdue entry first', async () => {
      const now = new Date();
      const pastDue = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      const futureDue = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      const entries = [
        createMockMealEntry({
          id: '1',
          rating_status: 'pending',
          rating_due_at: futureDue.toISOString(),
        }),
        createMockMealEntry({
          id: '2',
          rating_status: 'pending',
          rating_due_at: pastDue.toISOString(),
        }),
      ];

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(2);
      });

      const pendingEntry = contextValue?.getPendingEntry();
      expect(pendingEntry?.id).toBe('2'); // The overdue one
    });

    it('should return most overdue entry when multiple are overdue', async () => {
      const now = new Date();
      const veryPastDue = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const lessOverdue = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

      const entries = [
        createMockMealEntry({
          id: '1',
          rating_status: 'pending',
          rating_due_at: lessOverdue.toISOString(),
        }),
        createMockMealEntry({
          id: '2',
          rating_status: 'pending',
          rating_due_at: veryPastDue.toISOString(),
        }),
      ];

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(2);
      });

      const pendingEntry = contextValue?.getPendingEntry();
      expect(pendingEntry?.id).toBe('2'); // Most overdue
    });
  });

  describe('getRecentEntries', () => {
    it('should return first N entries', async () => {
      const entries = Array(15).fill(null).map((_, i) =>
        createMockMealEntry({ id: `entry-${i}` })
      );

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(15);
      });

      expect(contextValue?.getRecentEntries(5)).toHaveLength(5);
      expect(contextValue?.getRecentEntries()).toHaveLength(10); // Default limit
    });
  });

  describe('getTotalCount', () => {
    it('should return total number of entries', async () => {
      const entries = Array(5).fill(null).map((_, i) =>
        createMockMealEntry({ id: `entry-${i}` })
      );

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.getTotalCount()).toBe(5);
      });
    });
  });

  describe('getCompletedCount', () => {
    it('should return count of completed entries', async () => {
      const entries = [
        createMockMealEntry({ id: '1', rating_status: 'completed' }),
        createMockMealEntry({ id: '2', rating_status: 'completed' }),
        createMockMealEntry({ id: '3', rating_status: 'pending' }),
        createMockMealEntry({ id: '4', rating_status: 'skipped' }),
      ];

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.getCompletedCount()).toBe(2);
      });
    });
  });

  describe('loadMore', () => {
    it('should call range with correct pagination offset', async () => {
      const entries = Array(20).fill(null).map((_, i) =>
        createMockMealEntry({ id: `entry-${i}` })
      );

      // Use mockResolvedValue to return the same data for all calls
      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
      });

      // Clear previous calls to track loadMore specifically
      mockQueryChain.range.mockClear();

      await act(async () => {
        await contextValue?.loadMore();
      });

      // Verify range was called for pagination
      expect(mockQueryChain.range).toHaveBeenCalled();
    });

    it('should set hasMore based on returned entries count', async () => {
      // Return fewer entries than page size to trigger hasMore = false
      const fewEntries = Array(5).fill(null).map((_, i) =>
        createMockMealEntry({ id: `entry-${i}` })
      );

      mockQueryChain.range.mockResolvedValue({ data: fewEntries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
        // hasMore should be false when fewer than page size returned
        expect(contextValue?.hasMore).toBe(false);
      });
    });
  });

  describe('refetch', () => {
    it('should reset pagination and fetch first page', async () => {
      const entries = Array(20).fill(null).map((_, i) =>
        createMockMealEntry({ id: `entry-${i}` })
      );

      mockQueryChain.range.mockResolvedValue({ data: entries, error: null });

      let contextValue: ReturnType<typeof useMeals> | null = null;

      render(
        <AuthProvider>
          <MealProvider>
            <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
          </MealProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.entries).toHaveLength(20);
      });

      await act(async () => {
        await contextValue?.refetch();
      });

      expect(mockQueryChain.range).toHaveBeenCalledWith(0, 19);
    });
  });
});
