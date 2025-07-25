import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata } from "next";
import { Space_Grotesk } from 'next/font/google';

import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Premium font configuration
const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

// Enhanced metadata for premium SaaS
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'data aggregation',
    'financial dashboard',
    'crypto analytics',
    'business intelligence',
    'portfolio management',
    'SaaS platform',
  ],
  authors: [
    {
      name: "MoneyMappr",
      url: "https://moneymappr.com",
    },
  ],
  creator: "Faizan",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@money_mappr",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          spaceGrotesk.variable
        )}
      >
        <Providers>
          <AuthProvider>
            <NavigationProvider>
              
              {/* Main App Container with enhanced premium styling */}
              <div className="relative flex min-h-screen w-full">
                
                {/* Enhanced Background Patterns */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {/* Primary gradient mesh */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
                  
                  {/* Dynamic grid pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
                  
                  {/* Floating orbs for depth */}
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                {/* Sidebar with enhanced glass effect */}
                <Sidebar 
                  className="bg-background/80 backdrop-blur-xl border-r border-default-200/50 shadow-lg"
                />
                
                {/* Main Content Wrapper with enhanced styling */}
                <div className="flex-1 flex flex-col min-w-0 w-full relative">
                  
                  {/* Premium Navbar with enhanced glass effect */}
                  <Navbar className="bg-background/80 backdrop-blur-xl border-b border-default-200/50 shadow-sm" />
                  
                  {/* Main Content Area with premium styling */}
                  <main className="flex-1 w-full overflow-x-auto relative">
                    
                    {/* Content Container with enhanced responsive design */}
                    <div className="relative w-full min-h-[calc(100vh-4rem)] max-w-[2000px] mx-auto">
                      <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
                        
                        {/* Premium content wrapper with enhanced animations */}
                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out">
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
              
            </NavigationProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}