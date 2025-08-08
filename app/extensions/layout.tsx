import React from "react";

import { AuthGuard } from "@/components/shared/AuthGuard";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard>{children} </AuthGuard>;
};

export default Layout;
