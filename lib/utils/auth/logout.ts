import { authHelpers } from "@/lib/auth-helpers";

export const logoutUtils = {
  /**
   * Safe logout that handles all error cases
   */
  async safeLogout(redirectTo: string = "/auth/signin"): Promise<void> {
    try {
      // Use enhanced auth helpers sign out
      await authHelpers.signOut();

      // Force reload to clear any cached state
      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error("Logout error:", error);

      // Even if logout fails, redirect to sign in
      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      }
    }
  },

  /**
   * Force logout (clears everything and redirects)
   */
  async forceLogout(redirectTo: string = "/auth/signin"): Promise<void> {
    try {
      // Clear all storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();

        // Clear cookies by setting them to expire
        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/",
            );
        });
      }

      // Redirect
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Force logout error:", error);
      window.location.href = redirectTo;
    }
  },
};
