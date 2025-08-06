'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================================
// AUTH PROVIDER - Enhanced with proper error handling and timeouts
// ================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isInitialized: false,
  });

  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const profileFetchRef = useRef<AbortController>();

  // Profile fetcher with error handling and caching
  const fetchProfile = async (userId: string, signal?: AbortSignal): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (signal?.aborted) return null;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Error fetching profile:', error);
      }
      return null;
    }
  };

  // Initialize auth state with timeout protection
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, isInitialized: false }));

        // Set timeout to prevent infinite loading
        initTimeoutRef.current = setTimeout(() => {
          if (isMounted) {
            console.warn('Auth initialization timeout - setting to not authenticated');
            setState(prev => ({
              ...prev,
              user: null,
              session: null,
              profile: null,
              isLoading: false,
              isInitialized: true,
            }));
          }
        }, 3000); // 10 second timeout

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isInitialized: true,
          }));
          return;
        }

        // Update state with session data
        const newState: Partial<AuthState> = {
          session,
          user: session?.user ?? null,
          isInitialized: true,
        };

        // Fetch profile if user exists
        if (session?.user) {
          profileFetchRef.current = new AbortController();
          const profileData = await fetchProfile(
            session.user.id,
            profileFetchRef.current.signal
          );
          
          if (isMounted && !profileFetchRef.current.signal.aborted) {
            newState.profile = profileData;
          }
        } else {
          newState.profile = null;
        }

        if (isMounted) {
          setState(prev => ({
            ...prev,
            ...newState,
            isLoading: false,
          }));
          
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
          }
        }

      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isInitialized: true,
          }));
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event, session?.user?.id);

        // Cancel any ongoing profile fetch
        if (profileFetchRef.current) {
          profileFetchRef.current.abort();
        }

        const newState: Partial<AuthState> = {
          session,
          user: session?.user ?? null,
        };

        // Handle profile data based on session
        if (session?.user) {
          profileFetchRef.current = new AbortController();
          try {
            const profileData = await fetchProfile(
              session.user.id,
              profileFetchRef.current.signal
            );
            
            if (isMounted && !profileFetchRef.current.signal.aborted) {
              newState.profile = profileData;
            }
          } catch (error) {
            console.error('Error fetching profile on auth change:', error);
          }
        } else {
          newState.profile = null;
        }

        if (isMounted) {
          setState(prev => ({
            ...prev,
            ...newState,
            isLoading: false,
            isInitialized: true,
          }));
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      if (profileFetchRef.current) {
        profileFetchRef.current.abort();
      }
    };
  }, []);

  // Enhanced sign out with state cleanup
  const signOut = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails on server, clear local state
    } finally {
      setState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  };

  // Profile update with optimistic updates
  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!state.user || !state.profile) {
      throw new Error('No authenticated user or profile');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', state.user.id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        profile: data,
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Refresh session manually
  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    signOut,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ================================
// ENHANCED AUTH HOOK
// ================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
