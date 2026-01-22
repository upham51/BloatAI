import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MealEntry, DetectedTrigger } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { retryWithBackoff } from '@/lib/bloatingUtils';
import { localPhotoStorage } from '@/lib/localPhotoStorage';

interface MealContextType {
  entries: MealEntry[];
  isLoading: boolean;
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

export function MealProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
    } else {
      setEntries((data || []).map(dbRowToMealEntry));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const addEntry = async (entryData: Omit<MealEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MealEntry> => {
    if (!user) throw new Error('User not authenticated');

    // Use retry logic for database operations
    const { data, error } = await retryWithBackoff(async () => {
      const result = await supabase
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

      if (result.error) throw result.error;
      return result;
    });

    if (error) throw error;

    const newEntry = dbRowToMealEntry(data);
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = async (id: string, updates: Partial<MealEntry>) => {
    const dbUpdates: Record<string, any> = { ...updates };
    if (updates.detected_triggers) {
      dbUpdates.detected_triggers = updates.detected_triggers as unknown as Json;
    }

    // Fix optimistic update race condition: only update local state AFTER successful DB update
    const { error } = await retryWithBackoff(async () => {
      const result = await supabase
        .from('meal_entries')
        .update(dbUpdates)
        .eq('id', id);

      if (result.error) throw result.error;
      return result;
    });

    if (error) throw error;

    // Update local state only after successful database update
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  };

  const deleteEntry = async (id: string) => {
    // Find the entry to get the photo reference
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
        console.log('✅ Photo deleted from local storage:', entry.photo_url);
      } catch (error) {
        console.error('Failed to delete photo from local storage:', error);
        // Don't throw - entry is already deleted from DB
      }
    }

    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const updateRating = async (id: string, rating: number) => {
    await updateEntry(id, {
      bloating_rating: rating,
      rating_status: 'completed',
    });
  };

  const skipRating = async (id: string) => {
    await updateEntry(id, {
      rating_status: 'skipped',
    });
  };

  const getPendingEntry = (): MealEntry | null => {
    const now = new Date();

    // Filter all pending entries
    const pendingEntries = entries.filter(entry => entry.rating_status === 'pending');

    if (pendingEntries.length === 0) return null;

    // Find the entry that is most overdue (has the earliest rating_due_at that has passed)
    // Or the oldest pending entry if none have a due date
    const overdueEntries = pendingEntries.filter(entry => {
      if (!entry.rating_due_at) return false;
      const dueAt = new Date(entry.rating_due_at);
      return dueAt <= now;
    });

    // Return the most overdue entry (earliest due date)
    if (overdueEntries.length > 0) {
      return overdueEntries.sort((a, b) => {
        const aTime = new Date(a.rating_due_at!).getTime();
        const bTime = new Date(b.rating_due_at!).getTime();
        return aTime - bTime;
      })[0];
    }

    // If no overdue entries, return the oldest pending entry (still within 24 hours)
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
  };

  const getRecentEntries = (limit = 10): MealEntry[] => {
    return entries.slice(0, limit);
  };

  const getTotalCount = () => entries.length;
  const getCompletedCount = () => entries.filter(e => e.rating_status === 'completed').length;

  return (
    <MealContext.Provider
      value={{
        entries,
        isLoading,
        addEntry,
        updateEntry,
        deleteEntry,
        updateRating,
        skipRating,
        getPendingEntry,
        getRecentEntries,
        getTotalCount,
        getCompletedCount,
        refetch: fetchEntries,
      }}
    >
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
