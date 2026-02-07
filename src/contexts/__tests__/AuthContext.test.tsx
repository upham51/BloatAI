import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// Hoisted mock functions - these are declared before vi.mock is hoisted
const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: mockAuth,
  },
}));

// Import after mock
import { AuthProvider, useAuth } from '../AuthContext';

// Mock window.location
const mockLocation = {
  origin: 'http://localhost:8080',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Test component that exposes context values
function TestConsumer({ onReady }: { onReady: (context: ReturnType<typeof useAuth>) => void }) {
  const context = useAuth();
  React.useEffect(() => {
    onReady(context);
  }, [context, onReady]);
  return <div data-testid="consumer">Ready</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for no session
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress React error boundary logging for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('Initial state', () => {
    it('should start with loading state', async () => {
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      // Initially loading
      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });
    });

    it('should have null user when not authenticated', async () => {
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user).toBeNull();
        expect(contextValue?.session).toBeNull();
      });
    });

    it('should have user when session exists', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user).not.toBeNull();
        expect(contextValue?.user?.id).toBe('test-user');
      });
    });
  });

  describe('signIn', () => {
    it('should call signInWithPassword with correct parameters', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      await act(async () => {
        await contextValue?.signIn('test@example.com', 'password123');
      });

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return null error on success', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      let result: { error: string | null } | undefined;
      await act(async () => {
        result = await contextValue?.signIn('test@example.com', 'password123');
      });

      expect(result?.error).toBeNull();
    });

    it('should return error message on failure', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      let result: { error: string | null } | undefined;
      await act(async () => {
        result = await contextValue?.signIn('test@example.com', 'wrong-password');
      });

      expect(result?.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should call signUp with correct parameters', async () => {
      mockAuth.signUp.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      await act(async () => {
        await contextValue?.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:8080/',
          data: { full_name: 'Test User' },
        },
      });
    });

    it('should return null error on success', async () => {
      mockAuth.signUp.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      let result: { error: string | null } | undefined;
      await act(async () => {
        result = await contextValue?.signUp('test@example.com', 'password123', 'Test User');
      });

      expect(result?.error).toBeNull();
    });

    it('should return error message on failure', async () => {
      mockAuth.signUp.mockResolvedValue({
        error: { message: 'Email already in use' },
      });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      let result: { error: string | null } | undefined;
      await act(async () => {
        result = await contextValue?.signUp('existing@example.com', 'password123', 'Test User');
      });

      expect(result?.error).toBe('Email already in use');
    });

    it('should store displayName in user metadata', async () => {
      mockAuth.signUp.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      await act(async () => {
        await contextValue?.signUp('test@example.com', 'password123', 'John Doe');
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: { full_name: 'John Doe' },
          }),
        })
      );
    });
  });

  describe('signInWithGoogle', () => {
    it('should call signInWithOAuth with correct provider', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      await act(async () => {
        await contextValue?.signInWithGoogle();
      });

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:8080/dashboard',
        },
      });
    });

    it('should return null error on success', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      let result: { error: string | null } | undefined;
      await act(async () => {
        result = await contextValue?.signInWithGoogle();
      });

      expect(result?.error).toBeNull();
    });

    it('should return error message on failure', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth error' },
      });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      let result: { error: string | null } | undefined;
      await act(async () => {
        result = await contextValue?.signInWithGoogle();
      });

      expect(result?.error).toBe('OAuth error');
    });
  });

  describe('signOut', () => {
    it('should call signOut', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      await act(async () => {
        await contextValue?.signOut();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Auth state listener', () => {
    it('should set up auth state listener on mount', async () => {
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer onReady={() => {}} />
        </AuthProvider>
      );

      expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: unsubscribeMock } } };
      });

      const { unmount } = render(
        <AuthProvider>
          <TestConsumer onReady={() => {}} />
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should update state on auth state change', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      let authStateCallback: ((event: string, session: any) => void) | null = null;

      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user).toBeNull();
      });

      // Simulate sign in
      await act(async () => {
        if (authStateCallback) {
          authStateCallback('SIGNED_IN', mockSession);
        }
      });

      await waitFor(() => {
        expect(contextValue?.user?.id).toBe('test-user');
      });
    });

    it('should check for existing session on mount', async () => {
      mockAuth.onAuthStateChange.mockImplementation(() => {
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      render(
        <AuthProvider>
          <TestConsumer onReady={() => {}} />
        </AuthProvider>
      );

      expect(mockAuth.getSession).toHaveBeenCalled();
    });

    it('should set loading to false after checking session', async () => {
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.isLoading).toBe(false);
      });
    });
  });

  describe('Session persistence', () => {
    it('should restore session on page refresh', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user?.id).toBe('test-user');
        expect(contextValue?.session?.user?.id).toBe('test-user');
      });
    });
  });

  describe('User and session consistency', () => {
    it('should keep user and session in sync', async () => {
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        // User should match session.user
        expect(contextValue?.user).toEqual(contextValue?.session?.user);
      });
    });

    it('should have both null when signed out', async () => {
      mockAuth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      let contextValue: ReturnType<typeof useAuth> | null = null;

      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => { contextValue = ctx; }} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user).toBeNull();
        expect(contextValue?.session).toBeNull();
      });
    });
  });
});
