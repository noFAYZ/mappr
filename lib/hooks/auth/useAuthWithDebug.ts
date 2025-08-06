import { useAuth } from '@/contexts/AuthContext';
import { authDebugger } from '@/lib/utils/auth/auth-debug';
import { useEffect, useState } from 'react';

export function useAuthWithDebug() {
  const auth = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Only run debug info collection in development
    if (process.env.NODE_ENV === 'development') {
      const updateDebugInfo = async () => {
        const info = await authDebugger.getCurrentAuthInfo();
        setDebugInfo(info);
      };

      updateDebugInfo();

      // Update debug info when auth state changes
      const interval = setInterval(updateDebugInfo, 5000); // Every 5 seconds

      return () => clearInterval(interval);
    }
  }, [auth.user, auth.isLoading]);

  return {
    ...auth,
    debugInfo: process.env.NODE_ENV === 'development' ? debugInfo : null,
  };
}
