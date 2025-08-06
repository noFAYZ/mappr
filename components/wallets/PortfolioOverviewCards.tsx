'use client';

import React, { useMemo } from 'react';
import { Button, Tooltip } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Coins,
  Globe,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  BarChart3,
  DollarSign,
  Network,
  Layers
} from 'lucide-react';
import clsx from 'clsx';
import {  HugeiconsBlockchain06, SolarWalletBoldDuotone, SolarWalletOutline } from '../icons/icons';

// Types
interface PortfolioSummary {
  totalValue?: number;
  totalChangePercent?: number;
  walletsCount?: number;
  totalPositions?: number;
  totalChains?: number;
  change24h?: number;
  change7d?: number;
  change30d?: number;
}

interface PortfolioOverviewProps {
  summary?: PortfolioSummary;
  showBalances: boolean;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
  onToggleBalances?: () => void;
}

// Utility Functions
const formatValue = (value: number | undefined, showBalances: boolean): string => {
  if (!showBalances) return '••••••';
  if (!value) return '$0';
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const formatPercent = (value: number | undefined, showBalances: boolean): string => {
  if (!showBalances) return '••%';
  if (value === undefined || value === null) return '0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatNumber = (value: number | undefined): string => {
  if (!value) return '0';
  return value.toLocaleString();
};

// Animated Counter Component
const AnimatedCounter: React.FC<{
  value: string;
  className?: string;
  duration?: number;
}> = ({ value, className, duration = 0.5 }) => {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration }}
      className={className}
    >
      {value}
    </motion.div>
  );
};

// Main Portfolio Value Display
const HeroValueDisplay: React.FC<{
  value?: number;
  change?: number;
  showBalances: boolean;
  isRefreshing: boolean;
}> = ({ value, change, showBalances, isRefreshing }) => {
  const isPositive = (change || 0) >= 0;
  
  return (
    <motion.div 
      className="relative text-left py-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.p 
        className="text-xs font-medium uppercase tracking-widest text-default-400 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Total Portfolio Value
      </motion.p>
      
      <div className="relative flex items-baseline gap-2">
  
          <AnimatedCounter
            value={formatValue(value, showBalances)}
            className="text-4xl md:text-5xl lg:text-6xl  tracking-tight text-foreground/90"
          />
      
        
        {isRefreshing && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-5 h-5 text-default-400" />
          </motion.div>
        )}


        {showBalances && change !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-2 mt-6"
          >
            <div className={clsx(
              "flex items-center gap-1.5  rounded-full ",
           
              isPositive ? "text-success-600" : "text-danger-600"
            )}>
          
              <span className="font-medium text-sm">
                {formatPercent(change, showBalances)} 1d
              </span>
            </div>
          </motion.div>
        )}
 
      </div>

     
    </motion.div>
  );
};

// Minimal Metric Display
const MetricDisplay: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: number;
  showBalances?: boolean;
  index: number;
}> = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  showBalances = true, 
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.2 }}
      className="group"
    >
      <div className=" px-3  ">
        <div className="flex items-center justify-between gap-2">
          <div className="p-2.5 rounded-xl bg-primary-500/25 group-hover:bg-primary-500/30 transition-colors ">
            <Icon className="w-5 h-5 text-primary-900" />
          </div>
          
          {trend !== undefined && showBalances && (
            <div className={clsx(
              "flex items-center gap-1 text-xs font-medium",
              trend >= 0 ? "text-success-600" : "text-danger-600"
            )}>
             
              {formatPercent(trend, showBalances)}
            </div>
          )}

        <div >
          
          <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
            {label}
          </p>
          <p className="text-lg font-mono tracking-tight text-foreground">
            {typeof value === 'string' ? value : formatNumber(value)}
          </p>
        </div>

        </div>

      </div>
    </motion.div>
  );
};


// Main Component
export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ 
  summary, 
  showBalances, 
  onRefreshAll, 
  isRefreshing = false,
  onToggleBalances
}) => {
  const metrics = useMemo(() => [
    {
      icon: SolarWalletBoldDuotone,
      label: "Wallets",
      value: summary?.walletsCount || 0,
    },
    {
      icon: Coins,
      label: "Positions",
      value: summary?.totalPositions || 0,
    },
    {
      icon: HugeiconsBlockchain06,
      label: "Networks",
      value: summary?.totalChains || 0,
    }
  ], [summary]);

  const performancePeriods = useMemo(() => [
    { label: "24 Hours", value: summary?.change24h, period: "1D" },
    { label: "7 Days", value: summary?.change7d, period: "1W" },
    { label: "30 Days", value: summary?.change30d, period: "1M" }
  ], [summary]);

  return (
    <div className="flex justify-between mx-auto items-center  gap-8">


      {/* Hero Value */}
      <HeroValueDisplay
        value={summary?.totalValue}
        change={summary?.totalChangePercent}
        showBalances={showBalances}
        isRefreshing={isRefreshing}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Metrics - Takes up 3 columns */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-x divide-default-200  space-y-1">
            {metrics.map((metric, index) => (
              <MetricDisplay
                key={metric.label}
                {...metric}
                index={index}
              />
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default PortfolioOverview;