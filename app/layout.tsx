"use client";

import "@/styles/globals.css";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { Space_Grotesk } from "next/font/google";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LayoutManager } from "@/components/layout/LayoutManager";
import { ToastProvider } from "@/components/ui/Toaster";

// Premium font configuration
const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

// Pages where sidebar and navbar should be hidden
const NO_SIDEBAR_PAGES = [
  "/auth/login",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/callback",
  "/", // Landing page
];

// Pages where only navbar should be hidden (but sidebar can stay)
const NO_NAVBAR_PAGES = [
  "/auth/login",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/callback",
  "/", // Landing page
];

// Special handling for onboarding - show navbar but no sidebar
const ONBOARDING_PAGES = ["/onboarding"];

interface LayoutContentProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();

  const shouldHideSidebar = NO_SIDEBAR_PAGES.some(
    (page) => pathname === page || pathname.startsWith(page + "/"),
  );

  const shouldHideNavbar = NO_NAVBAR_PAGES.some(
    (page) => pathname === page || pathname.startsWith(page + "/"),
  );

  const isOnboardingPage = ONBOARDING_PAGES.some(
    (page) => pathname === page || pathname.startsWith(page + "/"),
  );

  // Auth pages and landing page get a simple layout
  if (shouldHideSidebar && !isOnboardingPage) {
    return (
      <div className="min-h-screen bg-background">
        {/* Enhanced Background for auth pages
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div> */}

        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  // Onboarding pages get navbar but no sidebar
  if (isOnboardingPage) {
    return (
      <div className="min-h-screen bg-background">
        {/* Enhanced Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="relative z-10">
          {/* Simplified navbar for onboarding */}
          <Navbar className="bg-background/80 backdrop-blur-xl border-b border-default-200/50 shadow-sm" />

          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    );
  }

  // Dashboard pages get the full layout with sidebar and navbar
  return (
    <div className="relative flex min-h-screen w-full">
      {/* Enhanced Background Patterns */}

      {/* Sidebar with enhanced glass effect */}
      <Sidebar />

      {/* Main Content Wrapper with enhanced styling */}
      <div className="flex-1 flex flex-col min-w-0 w-full relative">
        {/* Premium Navbar with enhanced glass effect */}
        {!shouldHideNavbar && <Navbar />}

        {/* Main Content Area with premium styling */}
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

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <title>{siteConfig.name}</title>
        <meta content={siteConfig.description} name="description" />
        <meta
          content="data aggregation, financial dashboard, crypto analytics, business intelligence, portfolio management, SaaS platform"
          name="keywords"
        />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          spaceGrotesk.className,
        )}
      >
        <Providers>
          <AuthProvider>
            <NavigationProvider>
              <ToastProvider>
                <LayoutManager>{children}</LayoutManager>
              </ToastProvider>
            </NavigationProvider>{" "}
            {/* <AuthDebugPanel /> */}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
