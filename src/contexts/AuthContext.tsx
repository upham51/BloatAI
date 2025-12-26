import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage (will be replaced with Supabase)
const STORAGE_KEY = 'bloat_ai_user';
const USERS_KEY = 'bloat_ai_users';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  display_name: string;
}

function getStoredUsers(): StoredUser[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({
        id: parsed.id,
        email: parsed.email,
        display_name: parsed.display_name,
      });
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { error: 'No account found with this email' };
    }
    
    if (foundUser.password !== password) {
      return { error: 'Incorrect password' };
    }
    
    const userObj = {
      id: foundUser.id,
      email: foundUser.email,
      display_name: foundUser.display_name,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    setUser(userObj);
    return { error: null };
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
    const users = getStoredUsers();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists' };
    }
    
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      password,
      display_name: displayName,
    };
    
    users.push(newUser);
    saveStoredUsers(users);
    
    const userObj = {
      id: newUser.id,
      email: newUser.email,
      display_name: newUser.display_name,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    setUser(userObj);
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
