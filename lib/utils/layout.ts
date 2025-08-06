import { ROUTE_CONFIG } from '@/config/routes';

export const layoutUtils = {
  shouldHideSidebar: (pathname: string): boolean => {
    return ROUTE_CONFIG.LAYOUT.NO_SIDEBAR.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  },

  shouldHideNavbar: (pathname: string): boolean => {
    return ROUTE_CONFIG.LAYOUT.NO_NAVBAR.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  },

  isMinimalLayout: (pathname: string): boolean => {
    return ROUTE_CONFIG.LAYOUT.MINIMAL.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  },

  isPublicRoute: (pathname: string): boolean => {
    return ROUTE_CONFIG.PUBLIC.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  },

  requiresAuth: (pathname: string): boolean => {
    return ROUTE_CONFIG.PROTECTED.REQUIRE_AUTH.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  },

  requiresProfile: (pathname: string): boolean => {
    return ROUTE_CONFIG.PROTECTED.REQUIRE_PROFILE.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  },
};