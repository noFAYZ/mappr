// utils/auth.ts
export const authUtils = {
  /**
   * Check if user has required permissions
   */
  hasPermission: (user: any, permission: string): boolean => {
    return user?.app_metadata?.permissions?.includes(permission) || false;
  },

  /**
   * Check if user has required role
   */
  hasRole: (user: any, role: string): boolean => {
    return user?.app_metadata?.role === role;
  },

  /**
   * Get user display name
   */
  getDisplayName: (user: any, profile: any): string => {
    return (
      profile?.full_name ||
      profile?.first_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User"
    );
  },

  /**
   * Check if profile is complete
   */
  isProfileComplete: (profile: any): boolean => {
    return !!(profile?.full_name && profile?.avatar_url);
  },

  /**
   * Generate redirect URL with current path
   */
  generateRedirectUrl: (basePath: string): string => {
    const currentPath = window.location.pathname + window.location.search;

    return `${basePath}?redirect=${encodeURIComponent(currentPath)}`;
  },
};
