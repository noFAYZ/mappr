"use client";

import type { Database } from "@/types/supabase";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

// Types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  signOut: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

type AuthContextType = AuthState & AuthActions;

// Constants
const AUTH_TIMEOUT = 10000; // 10 seconds
const PROFILE_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

// Cache for profile data
const profileCache = new Map<
  string,
  { data: Profile | null; timestamp: number }
>();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced Auth Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const profileFetchRef = useRef<AbortController>();
  const isMountedRef = useRef(true);

  // Enhanced profile fetcher with caching
  const fetchProfile = useCallback(
    async (userId: string, signal?: AbortSignal): Promise<Profile | null> => {
      try {
        // Check cache first
        const cached = profileCache.get(userId);

        if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TIME) {
          return cached.data;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (signal?.aborted) return null;

        if (error && error.code !== "PGRST116") {
          console.error("Profile fetch error:", error);
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }

        // Update cache
        profileCache.set(userId, { data, timestamp: Date.now() });

        return data;
      } catch (error) {
        if (!signal?.aborted) {
          console.error("Profile fetch error:", error);
          throw error;
        }

        return null;
      }
    },
    [],
  );

  // Update state helper
  const updateState = useCallback((updates: Partial<AuthState>) => {
    if (!isMountedRef.current) return;
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Initialize authentication
  useEffect(() => {
    isMountedRef.current = true;

    const initializeAuth = async () => {
      try {
        updateState({ isLoading: true, error: null });

        // Timeout protection
        initTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            console.warn("Auth initialization timeout");
            updateState({
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isInitialized: true,
              error: "Authentication timeout",
            });
          }
        }, AUTH_TIMEOUT);

        // Get session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (error) {
          throw new Error(`Session error: ${error.message}`);
        }

        const newState: Partial<AuthState> = {
          session,
          user: session?.user ?? null,
          isInitialized: true,
        };

        // Fetch profile if user exists
        if (session?.user) {
          profileFetchRef.current = new AbortController();
          try {
            const profileData = await fetchProfile(
              session.user.id,
              profileFetchRef.current.signal,
            );

            if (
              isMountedRef.current &&
              !profileFetchRef.current.signal.aborted
            ) {
              newState.profile = profileData;
            }
          } catch (error) {
            console.error("Profile fetch during init failed:", error);
            newState.error = "Failed to load user profile";
          }
        } else {
          newState.profile = null;
        }

        if (isMountedRef.current) {
          updateState({
            ...newState,
            isLoading: false,
          });

          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMountedRef.current) {
          updateState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isInitialized: true,
            error:
              error instanceof Error ? error.message : "Authentication failed",
          });
        }
      }
    };

    initializeAuth();

    // Auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      console.log(`Auth event: ${event}`, session?.user?.id);

      // Cancel ongoing profile fetch
      if (profileFetchRef.current) {
        profileFetchRef.current.abort();
      }

      const newState: Partial<AuthState> = {
        session,
        user: session?.user ?? null,
        error: null,
      };

      // Handle profile based on session
      if (session?.user) {
        profileFetchRef.current = new AbortController();
        try {
          const profileData = await fetchProfile(
            session.user.id,
            profileFetchRef.current.signal,
          );

          if (isMountedRef.current && !profileFetchRef.current.signal.aborted) {
            newState.profile = profileData;
          }
        } catch (error) {
          console.error("Profile fetch on auth change failed:", error);
          newState.error = "Failed to load user profile";
        }
      } else {
        newState.profile = null;
        // Clear profile cache on sign out
        profileCache.clear();
      }

      if (isMountedRef.current) {
        updateState({
          ...newState,
          isLoading: false,
          isInitialized: true,
        });
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();

      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      if (profileFetchRef.current) {
        profileFetchRef.current.abort();
      }
    };
  }, [fetchProfile, updateState]);

  // Sign in
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    try {
      updateState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";

      updateState({ error: message, isLoading: false });

      return { error: message };
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ): Promise<{ error: string | null }> => {
    try {
      updateState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";

      updateState({ error: message, isLoading: false });

      return { error: message };
    }
  };

  // Reset password
  const resetPassword = async (
    email: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Password reset failed";

      return { error: message };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    updateState({ isLoading: true });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Always clear local state
      profileCache.clear();
      updateState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  };

  // Update profile
  const updateProfile = async (
    updates: Partial<Profile>,
  ): Promise<{ error: string | null }> => {
    if (!state.user || !state.profile) {
      return { error: "No authenticated user or profile" };
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", state.user.id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Update cache and state
      profileCache.set(state.user.id, { data, timestamp: Date.now() });
      updateState({ profile: data });

      return { error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profile update failed";

      return { error: message };
    }
  };

  // Refresh session
  const refreshSession = async (): Promise<void> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error) throw error;

      updateState({
        session,
        user: session?.user ?? null,
      });
    } catch (error) {
      console.error("Session refresh error:", error);
      throw error;
    }
  };

  // Clear error
  const clearError = (): void => {
    updateState({ error: null });
  };

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Enhanced Auth Hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// Auth utilities
export const authUtils = {
  hasPermission: (user: User | null, permission: string): boolean => {
    return user?.app_metadata?.permissions?.includes(permission) || false;
  },

  hasRole: (user: User | null, role: string): boolean => {
    return user?.app_metadata?.role === role;
  },

  getDisplayName: (user: User | null, profile: Profile | null): string => {
    return (
      profile?.full_name ||
      profile?.first_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User"
    );
  },

  isProfileComplete: (profile: Profile | null): boolean => {
    return !!(profile?.full_name && profile?.avatar_url);
  },

  generateRedirectUrl: (basePath: string): string => {
    if (typeof window === "undefined") return basePath;
    const currentPath = window.location.pathname + window.location.search;

    return `${basePath}?redirect=${encodeURIComponent(currentPath)}`;
  },

  isEmailValid: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  },

  getPasswordStrength: (
    password: string,
  ): { score: number; message: string } => {
    if (password.length < 6) {
      return { score: 0, message: "Too short" };
    }
    if (password.length < 8) {
      return { score: 1, message: "Weak" };
    }

    let score = 2;
    let requirements = 0;

    if (/[a-z]/.test(password)) requirements++;
    if (/[A-Z]/.test(password)) requirements++;
    if (/[0-9]/.test(password)) requirements++;
    if (/[^A-Za-z0-9]/.test(password)) requirements++;

    if (requirements >= 3) score = 3;
    if (requirements === 4 && password.length >= 10) score = 4;

    const messages = ["Too short", "Weak", "Fair", "Good", "Strong"];

    return { score, message: messages[score] };
  },
};
