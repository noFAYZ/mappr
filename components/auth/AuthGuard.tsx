"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@heroui/card";

import { LogoLoader } from "../icons";

import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireProfile?: boolean;
}

export const AuthLoadingFallback = () => (
  <div className="flex flex-col gap-3 items-center justify-center min-h-[85vh]">
    <Card className="flex flex-col  items-center justify-center  p-8 md:px-10 border border-divider rounded-2xl">
      <LogoLoader className="w-12 h-12 mb-6" />

      <h1 className="text-medium leading-tight font-semibold">
        Authenticating..
      </h1>
      <p className="text-sm text-default-600">Please wait while log you in.</p>
    </Card>
  </div>
);

export function AuthGuard({
  children,
  fallback,
  redirectTo = "/auth/signin",
  requireProfile = false,
}: AuthGuardProps) {
  const { user, profile, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    const currentPath = window.location.pathname;
    const searchParams = window.location.search;
    const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath + searchParams)}`;

    router.push(redirectUrl);
  }, [router, redirectTo]);

  // Handle authentication state changes
  useEffect(() => {
    // Don't do anything until auth is initialized
    if (!isInitialized) return;

    // If no user and not loading, redirect to sign in
    if (!user && !isLoading) {
      handleRedirect();

      return;
    }

    // If require profile is true and user exists but no profile, stay in loading
    if (requireProfile && user && !profile && !isLoading) {
      console.warn("Profile required but not found for user:", user.id);
      // Could redirect to profile creation or show error
      // For now, we'll allow through and let the app handle it
    }
  }, [user, profile, isLoading, isInitialized, requireProfile, handleRedirect]);

  // Show loading state
  if (!isInitialized || isLoading) {
    return fallback || <AuthLoadingFallback />;
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  // Show children if authenticated (and profile exists if required)
  if (!requireProfile || profile) {
    return <>{children}</>;
  }

  // Loading profile
  return fallback || <AuthLoadingFallback />;
}

interface ConditionalAuthProps {
  children: React.ReactNode;
  condition?: (user: any, profile: any) => boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ConditionalAuth({
  children,
  condition = () => true,
  fallback,
  redirectTo = "/auth/signin",
}: ConditionalAuthProps) {
  const { user, profile, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!user && !isLoading) {
      router.push(redirectTo);

      return;
    }

    if (user && !condition(user, profile)) {
      if (fallback) return;
      router.push("/unauthorized");
    }
  }, [
    user,
    profile,
    isLoading,
    isInitialized,
    condition,
    fallback,
    redirectTo,
    router,
  ]);

  if (!isInitialized || isLoading) {
    return <AuthLoadingFallback />;
  }

  if (!user) {
    return null;
  }

  if (!condition(user, profile)) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  redirectTo = "/dashboard",
}: PublicRouteProps) {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, isInitialized, router, redirectTo]);

  if (!isInitialized || isLoading) {
    return <AuthLoadingFallback />;
  }

  // Only show content if not authenticated
  if (!user) {
    return <>{children}</>;
  }

  // Redirecting authenticated user
  return null;
}
