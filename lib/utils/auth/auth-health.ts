import { authDebugger } from "./auth-debug";

import { supabase } from "@/lib/supabase";

export class AuthHealthCheck {
  static async runFullCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Test 1: Connection to Supabase
    const connectionOk = await authDebugger.checkSupabaseConnection();

    if (!connectionOk) {
      issues.push("Cannot connect to Supabase");
      recommendations.push(
        "Check your Supabase configuration and internet connection",
      );
    }

    // Test 2: Session validity
    const authInfo = await authDebugger.getCurrentAuthInfo();

    if (authInfo.errors && authInfo.errors.length > 0) {
      issues.push(...authInfo.errors);
    }

    // Test 3: Session expiry
    if (authInfo.sessionExpiry) {
      const expiryTime = new Date(authInfo.sessionExpiry).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry <= 0) {
        issues.push("Session has expired");
        recommendations.push("User needs to sign in again");
      } else if (timeUntilExpiry < 15 * 60 * 1000) {
        // Less than 15 minutes
        recommendations.push("Session expires soon - consider refreshing");
      }
    }

    // Test 4: Local storage issues
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
      } catch (error) {
        issues.push("Local storage not available");
        recommendations.push("Check browser settings and privacy mode");
      }
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }

  static async quickCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.getSession();

      return !error && !!data.session;
    } catch (error) {
      return false;
    }
  }
}
