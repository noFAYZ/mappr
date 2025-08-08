import React from "react";

import { DashboardProvider } from "@/contexts/DashboardContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
