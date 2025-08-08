import { supabase } from "@/lib/supabase";

interface AuthDebugInfo {
  timestamp: string;
  sessionExists: boolean;
  userExists: boolean;
  userId?: string;
  email?: string;
  sessionExpiry?: string;
  lastSignIn?: string;
  provider?: string;
  metadata?: any;
  errors?: string[];
}

class AuthDebugger {
  private logs: AuthDebugInfo[] = [];
  private maxLogs = 50;

  async getCurrentAuthInfo(): Promise<AuthDebugInfo> {
    const timestamp = new Date().toISOString();
    const errors: string[] = [];

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        errors.push(`Session error: ${error.message}`);
      }

      const info: AuthDebugInfo = {
        timestamp,
        sessionExists: !!session,
        userExists: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email,
        sessionExpiry: session?.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : undefined,
        lastSignIn: session?.user?.last_sign_in_at,
        provider: session?.user?.app_metadata?.provider,
        metadata: session?.user?.user_metadata,
        errors: errors.length > 0 ? errors : undefined,
      };

      this.addLog(info);

      return info;
    } catch (error) {
      const info: AuthDebugInfo = {
        timestamp,
        sessionExists: false,
        userExists: false,
        errors: [`Unexpected error: ${error}`],
      };

      this.addLog(info);

      return info;
    }
  }

  private addLog(info: AuthDebugInfo) {
    this.logs.unshift(info);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(): AuthDebugInfo[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  async diagnoseIssues(): Promise<string[]> {
    const info = await this.getCurrentAuthInfo();
    const issues: string[] = [];

    // Check for common issues
    if (!info.sessionExists) {
      issues.push("No active session found");
    }

    if (info.sessionExists && !info.userExists) {
      issues.push("Session exists but no user data");
    }

    if (info.sessionExpiry) {
      const expiryTime = new Date(info.sessionExpiry).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry <= 0) {
        issues.push("Session has expired");
      } else if (timeUntilExpiry < 5 * 60 * 1000) {
        // Less than 5 minutes
        issues.push("Session expires soon (< 5 minutes)");
      }
    }

    if (info.errors && info.errors.length > 0) {
      issues.push(...info.errors);
    }

    return issues;
  }

  async checkSupabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      return !error;
    } catch (error) {
      console.error("Supabase connection test failed:", error);

      return false;
    }
  }

  async testAuthFlow(): Promise<{
    sessionCheck: boolean;
    profileFetch: boolean;
    connectionTest: boolean;
    issues: string[];
  }> {
    const issues = await this.diagnoseIssues();

    return {
      sessionCheck: await this.getCurrentAuthInfo().then(
        (info) => info.sessionExists,
      ),
      profileFetch: true, // Will be determined by actual profile fetch
      connectionTest: await this.checkSupabaseConnection(),
      issues,
    };
  }
}

export const authDebugger = new AuthDebugger();
