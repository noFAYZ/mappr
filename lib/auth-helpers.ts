import { supabase } from '@/lib/supabase';

export const authHelpers = {
  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github', redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Send magic link
   */
  async signInWithMagicLink(email: string, redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Update password
   */
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Enhanced sign out with error handling
   */
  async signOut() {
    try {
      // First try normal sign out
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('Auth session missing!')) {
        console.error('Sign out error:', error);
      }
    } catch (error: any) {
      // Ignore session missing errors
      if (!error.message?.includes('Auth session missing!')) {
        console.error('Sign out error:', error);
      }
    }
    
    // Always clear local storage regardless of API success
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.token') || 
              key.startsWith('sb-') ||
              key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.auth.token') || 
              key.startsWith('sb-') ||
              key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
  },

  /**
   * Get current session with error handling
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        return { session: null, error };
      }
      
      return { session: data.session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  },

  /**
   * Check if user is authenticated (with error handling)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { session } = await this.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },
};