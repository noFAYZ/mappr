import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import React from "react";

const WalletPageLoader = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-default-200 rounded-lg w-64 animate-pulse" />
          <div className="h-4 bg-default-200 rounded-lg w-96 animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-default-200 rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-default-200 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-default-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Portfolio Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-none bg-content1">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-default-200 rounded w-20 animate-pulse" />
                  <div className="h-8 bg-default-200 rounded w-24 animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-default-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-4 bg-default-200 rounded w-32 animate-pulse" />
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card className="border-none bg-content1">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-10 bg-default-200 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-default-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-default-200 rounded-lg animate-pulse" />
              <div className="h-10 w-20 bg-default-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Wallet Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-none bg-content1">
            <CardBody className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-default-200 rounded animate-pulse" />
                <div className="w-12 h-12 bg-default-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-default-200 rounded w-24 animate-pulse" />
                  <div className="h-3 bg-default-200 rounded w-20 animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-default-200 rounded-full animate-pulse" />
              </div>

              {/* Value Section */}
              <div className="mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-default-200 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-default-200 rounded w-12 animate-pulse" />
                </div>
                <div className="h-8 bg-default-200 rounded w-32 animate-pulse" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center space-y-1">
                    <div className="h-6 bg-default-200 rounded w-8 mx-auto animate-pulse" />
                    <div className="h-3 bg-default-200 rounded w-12 mx-auto animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-divider">
                <div className="h-3 bg-default-200 rounded w-20 animate-pulse" />
                <div className="h-4 w-4 bg-default-200 rounded animate-pulse" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 text-default-500">
          <Spinner color="primary" size="sm" />
          <span className="text-small font-medium">
            Loading your wallets...
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalletPageLoader;
