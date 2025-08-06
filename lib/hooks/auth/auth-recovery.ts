import { supabase } from "@/lib/supabase";

export class AuthRecovery {
    static async attemptRecovery(): Promise<boolean> {
      try {
        console.log('Attempting auth recovery...');
        
        // Clear any potentially corrupt local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('supabase.auth.token');
        }
  
        // Force refresh session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Recovery failed:', error);
          return false;
        }
  
        console.log('Auth recovery successful');
        return !!data.session;
      } catch (error) {
        console.error('Recovery attempt failed:', error);
        return false;
      }
    }
  
    static async clearAuthState(): Promise<void> {
      try {
        await supabase.auth.signOut();
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('supabase.auth.token');
          // Clear any other auth-related storage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('supabase') || key.startsWith('auth')) {
              localStorage.removeItem(key);
            }
          });
        }
      } catch (error) {
        console.error('Error clearing auth state:', error);
      }
    }
  
    static async resetToCleanState(): Promise<void> {
      await this.clearAuthState();
      
      // Reload the page to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }
  