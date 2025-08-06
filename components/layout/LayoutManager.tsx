"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { AuthGuard, PublicRoute } from '@/components/auth/AuthGuard';
import { layoutUtils } from '@/lib/utils/layout';

interface LayoutManagerProps {
  children: React.ReactNode;
}

export function LayoutManager({ children }: LayoutManagerProps) {
  const pathname = usePathname();
  
  const showSidebar = !layoutUtils.shouldHideSidebar(pathname);
  const showNavbar = !layoutUtils.shouldHideNavbar(pathname);
  const isMinimal = layoutUtils.isMinimalLayout(pathname);
  const isPublic = layoutUtils.isPublicRoute(pathname);
  const requiresAuth = layoutUtils.requiresAuth(pathname);
  const requiresProfile = layoutUtils.requiresProfile(pathname);

  // Public routes - no authentication required
  if (isPublic) {
    return (
      <PublicRoute>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </PublicRoute>
    );
  }

  // Protected routes with authentication
  if (requiresAuth || requiresProfile) {
    return (
      <AuthGuard requireProfile={requiresProfile}>
        <AppLayout 
          showSidebar={showSidebar}
          showNavbar={showNavbar}
          isMinimal={isMinimal}
        >
          {children}
        </AppLayout>
      </AuthGuard>
    );
  }

  // Default layout for other routes
  return (
    <AppLayout 
      showSidebar={showSidebar}
      showNavbar={showNavbar}
      isMinimal={isMinimal}
    >
      {children}
    </AppLayout>
  );
}

// ================================
// APP LAYOUT - Main app layout component
// ================================

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar: boolean;
  showNavbar: boolean;
  isMinimal: boolean;
}

function AppLayout({ children, showSidebar, showNavbar, isMinimal }: AppLayoutProps) {
  if (isMinimal) {
    return (
      <div className="min-h-screen bg-background">
        {showNavbar && <Navbar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        {showNavbar && <Navbar />}

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <div className="relative w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto">
            <div className="relative p-6">
              <div className="relative animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
                <div className="relative">
                  <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-3xl -z-10 opacity-60" />
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}