import React, { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MealEntry, DetectedTrigger } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { localPhotoStorage } from '@/lib/localPhotoStorage';

interface MealContextType {
  entries: MealEntry[];
  isLoading: boolean;
  hasMore: boolean;
  addEntry: (entry: Omit<MealEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<MealEntry>;
  updateEntry: (id: string, updates: Partial<MealEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateRating: (id: string, rating: number) => Promise<void>;
  skipRating: (id: string) => Promise<void>;
  getPendingEntry: () => MealEntry | null;
  getRecentEntries: (limit?: number) => MealEntry[];
  getTotalCount: () => number;
  getCompletedCount: () => number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

// Helper to convert DB row to MealEntry
function dbRowToMealEntry(row: any): MealEntry {
  return {
    ...row,
    detected_triggers: Array.isArray(row.detected_triggers)
      ? row.detected_triggers as DetectedTrigger[]
      : [],
    title_options: Array.isArray(row.title_options)
      ? row.title_options as string[]
      : [],
    entry_method: row.entry_method || 'photo',
  };
}

const ENTRIES_PER_PAGE = 20;

// Query key factory for consistent cache keys
export const mealKeys = {
  all: (userId: string) => ['meals', userId] as const,
};

// Fetch function extracted for testability
async function fetchMealPage(userId: string, pageParam: number) {
  const from = pageParam * ENTRIES_PER_PAGE;
  const to = from + ENTRIES_PER_PAGE - 1;

  const { data, error } = await supabase
    .from('meal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return (data || []).map(dbRowToMealEntry);
}

export function MealProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use infinite query for paginated data with automatic caching & deduplication
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: user ? mealKeys.all(user.id) : ['meals', 'none'],
    queryFn: ({ pageParam }) => fetchMealPage(user!.id, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ENTRIES_PER_PAGE ? allPages.length : undefined;
    },
    enabled: !!user,
  });

  // Flatten pages into a single entries array (memoized)
  const entries = useMemo(() => data?.pages.flat() ?? [], [data]);

  const hasMore = hasNextPage ?? false;

  // --- Mutations with optimistic updates ---

  const addMutation = useMutation({
    mutationFn: async (entryData: Omit<MealEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meal_entries')
        .insert({
          meal_description: entryData.meal_description,
          photo_url: entryData.photo_url,
          portion_size: entryData.portion_size,
          eating_speed: entryData.eating_speed,
          social_setting: entryData.social_setting,
          bloating_rating: entryData.bloating_rating,
          rating_status: entryData.rating_status,
          rating_due_at: entryData.rating_due_at,
          detected_triggers: entryData.detected_triggers as unknown as Json,
          custom_title: entryData.custom_title,
          meal_emoji: entryData.meal_emoji,
          meal_title: entryData.meal_title,
          title_options: entryData.title_options as unknown as Json,
          notes: entryData.notes,
          entry_method: entryData.entry_method,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return dbRowToMealEntry(data);
    },
    onSuccess: (newEntry) => {
      // Prepend new entry to first page of cache
      if (!user) return;
      queryClient.setQueryData(mealKeys.all(user.id), (old: any) => {
        if (!old?.pages) return old;
        const newPages = [...old.pages];
        newPages[0] = [newEntry, ...(newPages[0] || [])];
        return { ...old, pages: newPages };
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MealEntry> }) => {
      const dbUpdates: Record<string, any> = { ...updates };
      if (updates.detected_triggers) {
        dbUpdates.detected_triggers = updates.detected_triggers as unknown as Json;
      }

      const { error } = await supabase
        .from('meal_entries')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: ({ id, updates }) => {
      // Update entry in cache
      if (!user) return;
      queryClient.setQueryData(mealKeys.all(user.id), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: MealEntry[]) =>
            page.map(entry =>
              entry.id === id ? { ...entry, ...updates } : entry
            )
          ),
        };
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Find entry for photo cleanup
      const entry = entries.find(e => e.id === id);

      const { error } = await supabase
        .from('meal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete photo from local storage if it exists
      if (entry?.photo_url) {
        try {
          await localPhotoStorage.deletePhoto(entry.photo_url);
        } catch (photoError) {
          console.error('Failed to delete photo from local storage:', photoError);
          // Don't throw - entry is already deleted from DB
        }
      }

      return id;
    },
    onSuccess: (deletedId) => {
      // Remove entry from cache
      if (!user) return;
      queryClient.setQueryData(mealKeys.all(user.id), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: MealEntry[]) =>
            page.filter(entry => entry.id !== deletedId)
          ),
        };
      });
    },
  });

  // --- API methods (stable references via useCallback) ---

  const addEntry = useCallback(
    async (entryData: Omit<MealEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MealEntry> => {
      if (!user) throw new Error('User not authenticated');
      return addMutation.mutateAsync(entryData);
    },
    [user, addMutation]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<MealEntry>): Promise<void> => {
      await updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation]
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const updateRating = useCallback(
    async (id: string, rating: number): Promise<void> => {
      await updateEntry(id, {
        bloating_rating: rating,
        rating_status: 'completed',
      });
    },
    [updateEntry]
  );

  const skipRating = useCallback(
    async (id: string): Promise<void> => {
      await updateEntry(id, {
        rating_status: 'skipped',
      });
    },
    [updateEntry]
  );

  const getPendingEntry = useCallback((): MealEntry | null => {
    const now = new Date();

    const pendingEntries = entries.filter(entry => entry.rating_status === 'pending');
    if (pendingEntries.length === 0) return null;

    // Find the entry that is most overdue
    const overdueEntries = pendingEntries.filter(entry => {
      if (!entry.rating_due_at) return false;
      const dueAt = new Date(entry.rating_due_at);
      return dueAt <= now;
    });

    if (overdueEntries.length > 0) {
      return overdueEntries.sort((a, b) => {
        const aTime = new Date(a.rating_due_at!).getTime();
        const bTime = new Date(b.rating_due_at!).getTime();
        return aTime - bTime;
      })[0];
    }

    // If no overdue entries, return the oldest pending entry within 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentPending = pendingEntries.filter(entry => {
      const createdAt = new Date(entry.created_at);
      return createdAt >= oneDayAgo;
    });

    if (recentPending.length > 0) {
      return recentPending.sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      })[0];
    }

    return null;
  }, [entries]);

  const getRecentEntries = useCallback(
    (limit = 10): MealEntry[] => entries.slice(0, limit),
    [entries]
  );

  const getTotalCount = useCallback(() => entries.length, [entries]);

  const getCompletedCount = useCallback(
    () => entries.filter(e => e.rating_status === 'completed').length,
    [entries]
  );

  const refetch = useCallback(async () => {
    if (!user) return;
    await queryClient.invalidateQueries({ queryKey: mealKeys.all(user.id) });
  }, [user, queryClient]);

  const loadMore = useCallback(async () => {
    if (!isFetchingNextPage && hasMore) {
      await fetchNextPage();
    }
  }, [isFetchingNextPage, hasMore, fetchNextPage]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<MealContextType>(
    () => ({
      entries,
      isLoading,
      hasMore,
      addEntry,
      updateEntry,
      deleteEntry,
      updateRating,
      skipRating,
      getPendingEntry,
      getRecentEntries,
      getTotalCount,
      getCompletedCount,
      refetch,
      loadMore,
    }),
    [
      entries, isLoading, hasMore,
      addEntry, updateEntry, deleteEntry, updateRating, skipRating,
      getPendingEntry, getRecentEntries, getTotalCount, getCompletedCount,
      refetch, loadMore,
    ]
  );

  return (
    <MealContext.Provider value={contextValue}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeals() {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeals must be used within a MealProvider');
  }
  return context;
}
