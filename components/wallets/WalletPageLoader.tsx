import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { motion } from "framer-motion";
import clsx from "clsx";

// Skeleton Components
const SkeletonLine = ({ 
  width = "100%", 
  height = "h-4", 
  rounded = "rounded", 
  delay = 0 
}: {
  width?: string;
  height?: string;
  rounded?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
    className={clsx(
      "bg-default-200 animate-pulse",
      height,
      rounded
    )}
    style={{ width }}
  />
);

// Portfolio Header Skeleton
const PortfolioHeaderSkeleton = () => (
  <Card className="border-none bg-transparent shadow-none">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      {/* Hero Value Display */}
      <div className="flex-1">
        <div className="flex justify-between items-center gap-8">
          {/* Main Value Section */}
          <div className="relative text-left py-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SkeletonLine width="80px" height="h-3" delay={0.1} />
            </motion.div>
            
            <div className="relative flex items-baseline gap-2 mt-2">
              <SkeletonLine width="200px" height="h-12" delay={0.2} />
              <SkeletonLine width="60px" height="h-6" delay={0.3} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 + 0.2 }}
                className="group px-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <SkeletonLine width="40px" height="h-10" rounded="rounded-xl" />
                  <div className="space-y-1">
                    <SkeletonLine width="40px" height="h-3" />
                    <SkeletonLine width="24px" height="h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {[...Array(3)].map((_, index) => (
          <SkeletonLine 
            key={index}
            width="40px" 
            height="h-10" 
            rounded="rounded-full"
            delay={0.3 + index * 0.1}
          />
        ))}
      </div>
    </div>
  </Card>
);

// Wallet Card Skeleton
const WalletCardSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 + 0.1 }}
  >
    <Card className="border-none bg-content1 hover:shadow-lg transition-all duration-200">
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <SkeletonLine width="16px" height="h-4" rounded="rounded" />
          <SkeletonLine width="48px" height="h-12" rounded="rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="80px" height="h-4" />
            <SkeletonLine width="120px" height="h-3" />
          </div>
          <SkeletonLine width="60px" height="h-6" rounded="rounded-full" />
        </div>

        {/* Value Section */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <SkeletonLine width="60px" height="h-3" />
            <SkeletonLine width="40px" height="h-3" />
          </div>
          <SkeletonLine width="100px" height="h-8" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="text-center space-y-1">
              <SkeletonLine width="32px" height="h-6" />
              <SkeletonLine width="48px" height="h-3" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-divider">
          <SkeletonLine width="80px" height="h-3" />
          <SkeletonLine width="16px" height="h-4" rounded="rounded" />
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

// Wallet Details Panel Skeleton
const WalletDetailsPanelSkeleton = () => (
  <Card className="border-none bg-content1 h-full">
    <CardBody className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine width="160px" height="h-6" />
          <SkeletonLine width="240px" height="h-4" />
        </div>
        <div className="flex gap-2">
          <SkeletonLine width="32px" height="h-8" rounded="rounded-lg" />
          <SkeletonLine width="80px" height="h-8" rounded="rounded-lg" />
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border border-divider">
            <CardBody className="p-4 text-center">
              <SkeletonLine width="40px" height="h-10" rounded="rounded-lg" />
              <div className="space-y-2 mt-3">
                <SkeletonLine width="80px" height="h-6" />
                <SkeletonLine width="60px" height="h-3" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-1 p-1 bg-default-100 rounded-lg">
          {[...Array(4)].map((_, index) => (
            <SkeletonLine 
              key={index}
              width="80px" 
              height="h-8" 
              rounded="rounded-md"
              delay={index * 0.05}
            />
          ))}
        </div>

        {/* Tab Content */}
        <Card className="border border-divider">
          <CardBody className="p-4">
            {/* Summary Card */}
            <Card className="border border-divider mb-4">
              <CardBody className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <SkeletonLine width="60px" height="h-3" />
                      <SkeletonLine width="80px" height="h-6" />
                    </div>
                    <div className="flex items-center gap-4">
                      {[...Array(2)].map((_, index) => (
                        <div key={index} className="text-center">
                          <SkeletonLine width="40px" height="h-4" />
                          <SkeletonLine width="50px" height="h-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Token List */}
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-divider last:border-0">
                  <div className="flex items-center gap-3">
                    <SkeletonLine width="40px" height="h-10" rounded="rounded-full" />
                    <div className="space-y-1">
                      <SkeletonLine width="60px" height="h-4" />
                      <SkeletonLine width="40px" height="h-3" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <SkeletonLine width="80px" height="h-4" />
                    <SkeletonLine width="60px" height="h-3" />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </CardBody>
  </Card>
);

// Main Wallet Page Loader Component
const WalletPageLoader: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Header */}
      <PortfolioHeaderSkeleton />

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-400px)]">
        {/* Left Panel - Wallets List */}
        <div className="lg:col-span-4 xl:col-span-4">
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <Card className="border-none bg-content1">
              <CardBody className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <SkeletonLine width="100%" height="h-10" rounded="rounded-lg" />
                  <div className="flex gap-2">
                    <SkeletonLine width="100px" height="h-10" rounded="rounded-lg" />
                    <SkeletonLine width="120px" height="h-10" rounded="rounded-lg" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Wallet Cards */}
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <WalletCardSkeleton key={index} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Wallet Details */}
        <div className="lg:col-span-8 xl:col-span-8">
          <WalletDetailsPanelSkeleton />
        </div>
      </div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="border-none bg-background/80 backdrop-blur-sm shadow-lg">
          <CardBody className="p-3">
            <div className="flex items-center gap-3 text-default-500">
              <Spinner color="primary" size="sm" />
              <span className="text-sm font-medium">
                Loading wallet data...
              </span>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default WalletPageLoader;