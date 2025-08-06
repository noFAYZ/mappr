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
    <div className="relative flex min-h-screen w-full">
       {/* Enhanced Background for auth pages */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      {/* Sidebar */}
      {showSidebar && (<Sidebar />)}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 w-full relative">
        {/* Navbar */}
        {showNavbar && <Navbar />}

        {/* Page content */}
        <main className="flex-1 w-full overflow-x-auto relative">
          
          {/* Content Container with enhanced responsive design */}
          <div className="relative w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto">
            <div className="relative p-6">
              
              {/* Premium content wrapper with enhanced animations */}
              <div className="relative animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
                {/* Content backdrop for better readability */}
                <div className="relative">
                  {/* Subtle content background */}
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