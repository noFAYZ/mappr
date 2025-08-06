export const ROUTE_CONFIG = {
    PUBLIC: [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/callback',
      '/terms',
      '/privacy',
    ],
    
    PROTECTED: {
      REQUIRE_AUTH: [
        '/dashboard',
        '/portfolios',
        '/extensions',
        '/profile',
      ],
      
      REQUIRE_PROFILE: [
        '/onboarding',
      ],
    },
    
    LAYOUT: {
      NO_SIDEBAR: [
        '/auth/signin',
        '/auth/signup',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
        '/auth/callback',
        '/',
      ],
      
      NO_NAVBAR: [
        '/auth/signin',
        '/auth/signup',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
        '/auth/callback',
        '/',
      ],
      
      MINIMAL: [
        '/onboarding',
      ],
    },
  } as const;
  