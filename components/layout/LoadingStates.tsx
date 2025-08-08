import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div
          className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground/80">Loading...</p>
        <p className="text-xs text-foreground/60">Please wait</p>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardBody className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </CardBody>
        </Card>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto p-6">
    <Card>
      <CardBody className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  </div>
);
