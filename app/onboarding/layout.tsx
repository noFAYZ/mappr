import React from "react";

import { OnboardingProvider } from "@/contexts/OnboardingContext";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="relative z-10">{children}</div>
      </div>
    </OnboardingProvider>
  );
}
