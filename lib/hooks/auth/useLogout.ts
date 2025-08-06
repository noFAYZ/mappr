import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function useLogout() {
  const { signOut } = useAuth();
  const router = useRouter();

  const logout = useCallback(async (redirectTo: string = '/auth/signin') => {
    try {
      // Use the enhanced signOut from context
      await signOut();
      
      // Navigate to sign in page
      router.push(redirectTo);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force navigation even if logout fails
      router.push(redirectTo);
    }
  }, [signOut, router]);

  const forceLogout = useCallback(async (redirectTo: string = '/auth/signin') => {
    try {
      // Clear everything and force reload
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error('Force logout error:', error);
      window.location.href = redirectTo;
    }
  }, []);

  return { logout, forceLogout };
}