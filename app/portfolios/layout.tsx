import { AuthGuard } from "@/components/auth/AuthGuard";
import React from "react";


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard>{children} </AuthGuard>;
};

export default Layout;
