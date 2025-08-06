import { useAuth } from "@/contexts/AuthContext";
import { authUtils } from "@/lib/utils/auth/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useAuthRedirect(redirectTo?: string) {
    const { user, isLoading, isInitialized } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (isInitialized && !isLoading && !user && redirectTo) {
        router.push(authUtils.generateRedirectUrl(redirectTo));
      }
    }, [user, isLoading, isInitialized, router, redirectTo]);
  
    return { user, isLoading: !isInitialized || isLoading };
  }
  
  // hooks/useRequireAuth.ts
  export function useRequireAuth(redirectTo = '/auth/signin') {
    return useAuthRedirect(redirectTo);
  }
  
  export function useAuthStatus() {
    const { user, profile, isLoading, isInitialized } = useAuth();
    
    return {
      isAuthenticated: !!user,
      hasProfile: !!profile,
      isLoading: !isInitialized || isLoading,
      isReady: isInitialized && !isLoading,
      user,
      profile
    };
  }