// components/WalletAnalytics/TokenRow.tsx
'use client';

import React, { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress,
  Tooltip,
  Chip
} from '@heroui/react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Copy,
  CheckCircle2,
  ExternalLink,
  LineChart,
  Flame,
  Crown,
  Diamond,
  Zap,
  Shield
} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

import { formatCurrency, formatNumber } from '@/lib/wallet-analytics/utils';
import { MaterialIconThemeVerified } from '@/components/icons/icons';
import { ZERION_CHAINS } from '@/lib/wallet-analytics/chains';

// Types
export interface ProcessedToken {
  id: string;
  symbol: string;
  name: string;
  value: number;
  quantity: number;
  price: number;
  change24h: number;
  chainId: string;
  isVerified: boolean;
  tokenAddress: string;
  icon?: string;
  percentage: number;
}

interface TokenRowProps {
  token: ProcessedToken;
  index: number;
  showBalance: boolean;
  portfolioTotalValue: number;
  onCopyAddress: (address: string) => void;
  copiedAddress: string | null;
}

// Utility Functions
const getTokenRarity = (value: number, totalValue: number) => {
  const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
  
  if (percentage >= 50) return { 
    level: 'legendary', 
    color: 'from-yellow-400 via-orange-500 to-red-500', 
    icon: Crown,
    gradient: 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20',
    border: 'border-yellow-400/50'
  };
  if (percentage >= 20) return { 
    level: 'epic', 
    color: 'from-purple-400 via-pink-500 to-purple-600', 
    icon: Diamond,
    gradient: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30',
    border: 'border-purple-400/50'
  };
  if (percentage >= 10) return { 
    level: 'rare', 
    color: 'from-blue-400 via-cyan-500 to-blue-600', 
    icon: Zap,
    gradient: 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30',
    border: 'border-blue-400/50'
  };
  if (percentage >= 5) return { 
    level: 'uncommon', 
    color: 'from-green-400 via-emerald-500 to-green-600', 
    icon: Shield,
    gradient: 'bg-gradient-to-r from-green-500/30 to-emerald-500/30',
    border: 'border-green-400/50'
  };
  
  return { 
    level: 'common', 
    color: 'from-gray-400 to-gray-500', 
    icon: Shield,
    gradient: 'bg-gray-100',
    border: 'border-gray-300'
  };
};

const getPerformanceColor = (change: number) => {
  if (change >= 10) return 'text-green-500';
  if (change >= 5) return 'text-green-400';
  if (change > 0) return 'text-emerald-400';
  if (change > -5) return 'text-orange-400';
  if (change > -10) return 'text-red-400';
  return 'text-red-500';
};

const getPerformanceIcon = (change: number) => {
  if (change >= 10) return Flame;
  if (change >= 5) return TrendingUp;
  if (change > 0) return ArrowUpRight;
  if (change > -5) return ArrowDownRight;
  return TrendingDown;
};

// Skeleton Component
export const TokenRowSkeleton = () => (
  <div className="flex items-center gap-3 p-4 min-h-[64px] animate-pulse">
    <div className="w-12 h-12 bg-default-300 rounded-xl"></div>
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-4 bg-default-300 rounded w-32"></div>
      <div className="h-3 bg-default-200 rounded w-20"></div>
    </div>
    <div className="hidden md:block w-20 h-2 bg-default-200 rounded"></div>
    <div className="text-right space-y-2">
      <div className="h-4 bg-default-300 rounded w-24"></div>
      <div className="h-3 bg-default-200 rounded w-16"></div>
    </div>
    <div className="w-8 h-8 bg-default-200 rounded-full"></div>
  </div>
);

// Main TokenRow Component
export const TokenRow = React.memo<TokenRowProps>(({ 
  token, 
  index, 
  showBalance, 
  portfolioTotalValue,
  onCopyAddress,
  copiedAddress 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPositive = token.change24h >= 0;
  const rarity = getTokenRarity(token.value, portfolioTotalValue);
  const PerformanceIcon = getPerformanceIcon(token.change24h);
  const chainInfo = ZERION_CHAINS.find(c => c.id === token.chainId);

  // Format price display
  const formatPrice = (price: number) => {
    if (price === 0) return '$0.00';
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  // Calculate performance badge visibility
  const showPerformanceBadge = Math.abs(token.change24h) >= 10;
  const showRarityGlow = rarity.level !== 'common';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ 
        delay: index * 0.02, 
        duration: 0.05,
        ease: "easeOut"
      }}
      className={clsx(
        "group relative overflow-hidden ",
        isHovered 
          ? "bg-gradient-to-r from-primary-50 via-secondary-50/50 to-transparent dark:from-primary-950/50 dark:via-secondary-950/25 dark:to-transparent" 
          : "hover:bg-default-50 dark:hover:bg-default-100/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover gradient overlay */}
      <div className={clsx(
        "absolute inset-0 opacity-0 transition-opacity ",
        isHovered && "opacity-100",
        "bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent"
      )} />
      
      <div className="relative z-10 flex items-center gap-3 p-2 min-h-[64px]">
        {/* Token Avatar & Chain Info */}
        <div className="relative flex-shrink-0 group/avatar">
          <Avatar
            src={token.icon || undefined}
            fallback={
              <div className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold relative overflow-hidden ",
           
                isHovered && "scale-105 shadow-lg"
              )}>
                <span className="relative z-10">{token.symbol.slice(0, 2)}</span>
             
              </div>
            }
            className={clsx(
              "w-10 h-10 shadow-sm  border-none ",
             
              isHovered && "scale-105 shadow-lg"
            )}
          />
          
          {/* Chain Badge */}
          {chainInfo && (
            <Tooltip content={chainInfo.attributes.name}>
              <div className={clsx(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background  shadow-sm flex items-center justify-center ",
                isHovered && "scale-105"
              )}>
                {chainInfo.attributes?.icon ? (
                  <Image
                    src={chainInfo.attributes.icon?.url || ''}
                    width={16}
                    height={16}
                    className="w-4 h-4 rounded-full"
                    alt={chainInfo?.name || "chain"}
                  />
                ) : (
                  <span className="text-xs font-medium text-default-600">
                    {chainInfo?.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
            </Tooltip>
          )}
          
   
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate flex items-center gap-2">
              <span className={clsx(
                "text-sm",
                isHovered && "text-primary"
              )}>
                {token.symbol}
              </span>

              <span className="text-xs text-default-600 font-medium truncate max-w-[200px]">
              ({token.name})
            </span>
              
              {token.isVerified && (
                <Tooltip content="Verified token">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 hover:scale-110">
                    <MaterialIconThemeVerified className="w-4 h-4" />
                  </div>
                </Tooltip>
              )}
              
      
              
              {/* Performance Badge */}
              {showPerformanceBadge && (
                <Tooltip content={`${token.daychange >= 10 ? 'Hot' : 'Volatile'} token`}>
                  <div className={clsx(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0  hover:scale-105",
                    token.change24h >= 10 ? "bg-green-500/20" : "bg-red-500/20"
                  )}>
                    {token.change24h >= 10 ? (
                      <Flame className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </Tooltip>
              )}
            </h4>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
          
            
            <div className="flex items-center gap-2">
              <Chip
                variant="flat"
              
                size="sm"
                className={clsx(
                  "text-[11px] font-semibold rounded-md h-5  bg-default-200",
                  isHovered && " text-primary border-primary/20"
                )}
              >
                {formatNumber(token.quantity, showBalance)}
              </Chip>
              
              {/* Price per token */}
              {token.price > 0 && (
                <span className="text-[11px] font-semibold text-default-500 font-mono">
                  {formatPrice(token.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Allocation (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 min-w-[100px] group/progress">
          <div className="flex-1 relative">
            <Progress 
              value={token.percentage} 
              color={
                token.percentage > 20 ? "warning" : 
                token.percentage > 10 ? "secondary" : 
                "primary"
              }
              size="md"
              className="h-2"
              classNames={{
                indicator: clsx(
                  "",
                  rarity.level !== 'common' && `bg-gradient-to-r ${rarity.color}`,
                  isHovered && "shadow-sm scale-y-105"
                )
              }}
            />
            
            {/* Progress glow effect for high-value holdings */}
            {token.percentage > 10 && (
              <div className={clsx(
                "absolute inset-0 rounded-full blur-sm opacity-0 ",
                isHovered && "opacity-60",
                token.percentage > 20 ? "bg-yellow-400" : 
                token.percentage > 10 ? "bg-purple-400" : 
                "bg-blue-400"
              )} />
            )}
          </div>
          
          <Tooltip content={`${token.percentage.toFixed(2)}% of portfolio`}>
            <span className={clsx(
              "text-xs font-semibold min-w-[32px] text-right ",
              token.percentage > 10 ? "text-warning" : "text-default-500",
              isHovered && "text-primary scale-105"
            )}>
              {token.percentage.toFixed(1)}%
            </span>
          </Tooltip>
        </div>

        {/* Value & Performance */}
        <div className="text-right min-w-[100px]">
          <p className={clsx(
            "text-sm font-bold ",
            isHovered && "scale-105 text-primary"
          )}>
            {formatCurrency(token.value, showBalance)}
          </p>
          
          <div className={clsx(
            "flex items-center justify-end text-xs font-semibold ",
            getPerformanceColor(token.change24h),
            isHovered && "scale-105"
          )}>
          
            <span>{isPositive ? '+' : ''}{token.change24h.toFixed(2)}%</span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className={clsx(
          " transform flex-shrink-0",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}>
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className={clsx(
                  "text-default-400 hover:text-primary w-8 h-8 min-w-8 ",
                  "hover:bg-primary/10 hover:scale-105"
                )}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu className="min-w-[180px]" >
              <DropdownItem 
                key="copy" 
                startContent={
                  copiedAddress === token.tokenAddress ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
                onPress={() => onCopyAddress(token.tokenAddress)}
                className="transition-colors text-[10px] text-default-600 "
              >
                {copiedAddress === token.tokenAddress ? 'Address Copied!' : 'Copy Address'}
              </DropdownItem>
              <DropdownItem 
                key="external" 
                startContent={<ExternalLink className="w-4 h-4" />}
                className="transition-colors text-[10px] text-default-600 "
              >
                View on Explorer
              </DropdownItem>
              <DropdownItem 
                key="chart" 
                startContent={<LineChart className="w-4 h-4" />}
                className="transition-colors text-[10px] text-default-600"
              >
                View Chart
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Mobile Portfolio Allocation 
      <div className="lg:hidden px-4 pb-3">
        <div className="flex items-center justify-between text-xs text-default-500 mb-1">
          <span>Portfolio allocation</span>
          <span className="font-semibold">{token.percentage.toFixed(1)}%</span>
        </div>
        <Progress 
          value={token.percentage} 
          color={
            token.percentage > 20 ? "warning" : 
            token.percentage > 10 ? "secondary" : 
            "primary"
          }
          size="sm"
          className="h-1"
          classNames={{
            indicator: clsx(
              rarity.level !== 'common' && `bg-gradient-to-r ${rarity.color}`
            )
          }}
        />
      </div>*/}


    </motion.div>
  );
});

TokenRow.displayName = 'TokenRow';