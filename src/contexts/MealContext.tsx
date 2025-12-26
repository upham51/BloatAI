import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MealEntry, PortionSize, EatingSpeed, SocialSetting, DetectedTrigger } from '@/types';
import { useAuth } from './AuthContext';

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
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const STORAGE_KEY = 'bloat_ai_meals';

export function MealProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
    setIsLoading(false);
  }, [user]);

  // Save entries to localStorage
  useEffect(() => {
    if (user && !isLoading) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user, isLoading]);

  const addEntry = async (entryData: Omit<MealEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MealEntry> => {
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();
    const newEntry: MealEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      user_id: user.id,
      created_at: now,
      updated_at: now,
    };

    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = async (id: string, updates: Partial<MealEntry>) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updated_at: new Date().toISOString() }
          : entry
      )
    );
  };

  const deleteEntry = async (id: string) => {
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
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return entries.find(entry => {
      if (entry.rating_status !== 'pending') return false;
      if (!entry.rating_due_at) return false;
      
      const dueAt = new Date(entry.rating_due_at);
      return dueAt <= now && new Date(entry.created_at) >= oneDayAgo;
    }) || null;
  };

  const getRecentEntries = (limit = 10): MealEntry[] => {
    return entries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
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
