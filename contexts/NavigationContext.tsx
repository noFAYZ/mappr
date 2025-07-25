'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  // Sidebar state
  isSidebarVisible: boolean;
  isSidebarCollapsed: boolean;
  sidebarMode: 'sidebar' | 'overlay' | 'hidden';
  
  // Navigation state
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMode: (mode: 'sidebar' | 'overlay' | 'hidden') => void;
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
}

// Default navigation configuration
const DEFAULT_CONFIG = {
  isSidebarVisible: true,
  isSidebarCollapsed: false,
  sidebarMode: 'sidebar' as const,
};

// Breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  
  // Core state
  const [isSidebarVisible, setIsSidebarVisible] = useState(DEFAULT_CONFIG.isSidebarVisible);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(DEFAULT_CONFIG.isSidebarCollapsed);
  const [sidebarMode, setSidebarMode] = useState<'sidebar' | 'overlay' | 'hidden'>(DEFAULT_CONFIG.sidebarMode);
  const [pageTitle, setPageTitle] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < MOBILE_BREAKPOINT) {
        setScreenSize('mobile');
        setSidebarMode('overlay');
        setIsSidebarVisible(false);
      } else if (width < TABLET_BREAKPOINT) {
        setScreenSize('tablet');
        setSidebarMode('sidebar');
        setIsSidebarVisible(true);
        setIsSidebarCollapsed(true);
      } else {
        setScreenSize('desktop');
        setSidebarMode('sidebar');
        setIsSidebarVisible(true);
        setIsSidebarCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle route changes
  useEffect(() => {
    // Auto-close sidebar on mobile when route changes
    if (screenSize === 'mobile') {
      setIsSidebarVisible(false);
    }

    // Generate breadcrumbs and page title from pathname
    const pathSegments = pathname.split('/').filter(Boolean);
    const newBreadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with dashboard
    newBreadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip the first segment if it's 'dashboard'
      if (segment === 'dashboard' && index === 0) {
        return;
      }

      const label = formatSegmentLabel(segment);
      newBreadcrumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath, // Last item has no href
      });
    });

    setBreadcrumbs(newBreadcrumbs);
    
    // Set page title based on last breadcrumb
    const lastBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
    setPageTitle(lastBreadcrumb?.label || 'Dashboard');
  }, [pathname, screenSize]);

  // Persist sidebar state in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-state');
    if (savedState) {
      try {
        const { collapsed, visible } = JSON.parse(savedState);
        if (screenSize === 'desktop') {
          setIsSidebarCollapsed(collapsed);
          setIsSidebarVisible(visible);
        }
      } catch (error) {
        console.error('Error loading sidebar state:', error);
      }
    }
  }, [screenSize]);

  useEffect(() => {
    if (screenSize === 'desktop') {
      localStorage.setItem('sidebar-state', JSON.stringify({
        collapsed: isSidebarCollapsed,
        visible: isSidebarVisible
      }));
    }
  }, [isSidebarCollapsed, isSidebarVisible, screenSize]);

  // Actions
  const toggleSidebar = () => {
    if (screenSize === 'mobile') {
      setIsSidebarVisible(!isSidebarVisible);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const setSidebarVisible = (visible: boolean) => {
    setIsSidebarVisible(visible);
  };

  const setSidebarCollapsedState = (collapsed: boolean) => {
    if (screenSize !== 'mobile') {
      setIsSidebarCollapsed(collapsed);
    }
  };

  const setSidebarModeState = (mode: 'sidebar' | 'overlay' | 'hidden') => {
    setSidebarMode(mode);
  };

  const value: NavigationContextType = {
    // State
    isSidebarVisible,
    isSidebarCollapsed,
    sidebarMode,
    currentPath: pathname,
    breadcrumbs,
    pageTitle,
    
    // Actions
    toggleSidebar,
    setSidebarVisible,
    setSidebarCollapsed: setSidebarCollapsedState,
    setSidebarMode: setSidebarModeState,
    setPageTitle,
    setBreadcrumbs,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
}

// Utility function to format path segments into readable labels
function formatSegmentLabel(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'ai': 'AI Assistant',
    'api': 'API',
    'oauth': 'OAuth',
    'settings': 'Settings',
    'dashboard': 'Dashboard',
    'extensions': 'Extensions',
    'portfolios': 'Portfolios',
    'analytics': 'Analytics',
    'billing': 'Billing',
    'profile': 'Profile',
    'help': 'Help & Support',
    'admin': 'Admin Panel',
  };

  if (specialCases[segment.toLowerCase()]) {
    return specialCases[segment.toLowerCase()];
  }

  // Convert kebab-case and snake_case to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Hook for setting page metadata
export function usePageMeta(title: string, breadcrumbs?: BreadcrumbItem[]) {
  const { setPageTitle, setBreadcrumbs } = useNavigationContext();

  useEffect(() => {
    setPageTitle(title);
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  }, [title, breadcrumbs, setPageTitle, setBreadcrumbs]);
}

// Hook for responsive sidebar behavior
export function useSidebarResponsive() {
  const {
    isSidebarVisible,
    isSidebarCollapsed,
    sidebarMode,
    toggleSidebar,
    setSidebarVisible,
    setSidebarCollapsed,
  } = useNavigationContext();

  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < MOBILE_BREAKPOINT) {
        setScreenSize('mobile');
      } else if (width < TABLET_BREAKPOINT) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    isSidebarVisible,
    isSidebarCollapsed,
    sidebarMode,
    toggleSidebar,
    setSidebarVisible,
    setSidebarCollapsed,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
  };
}

// Navigation items configuration
export const navigationConfig = {
  main: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      badge: null,
    },
    {
      label: 'Extensions',
      href: '/extensions',
      icon: '🔌',
      badge: 'New',
      submenu: [
        { label: 'Browse All', href: '/extensions' },
        { label: 'Connected', href: '/extensions/connected' },
        { label: 'Add New', href: '/extensions/add' },
      ],
    },
    {
      label: 'Portfolios',
      href: '/portfolios',
      icon: '📈',
      badge: null,
      submenu: [
        { label: 'Overview', href: '/portfolios' },
        { label: 'Performance', href: '/portfolios/performance' },
        { label: 'Create New', href: '/portfolios/create' },
      ],
    },
    {
      label: 'Data Sources',
      href: '/data',
      icon: '💾',
      badge: null,
      submenu: [
        { label: 'All Data', href: '/data' },
        { label: 'Crypto', href: '/data/crypto' },
        { label: 'Banking', href: '/data/banking' },
        { label: 'Business', href: '/data/business' },
      ],
    },
    {
      label: 'AI Assistant',
      href: '/ai',
      icon: '🤖',
      badge: 'Beta',
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: '📊',
      badge: null,
    },
  ],
  settings: [
    {
      label: 'Settings',
      href: '/settings',
      icon: '⚙️',
    },
    {
      label: 'Billing',
      href: '/billing',
      icon: '💳',
    },
    {
      label: 'Help & Support',
      href: '/help',
      icon: '❓',
    },
  ],
  admin: [
    {
      label: 'Admin Panel',
      href: '/admin',
      icon: '👑',
      submenu: [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Extensions', href: '/admin/extensions' },
        { label: 'Analytics', href: '/admin/analytics' },
      ],
    },
  ],
};