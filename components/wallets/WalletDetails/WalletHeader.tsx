// components/WalletAnalytics/WalletHeader.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Card, 
  CardBody,
  Chip,
  Tooltip,
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink, 
  Clock, 
  Layers,
  Copy,
  Wallet,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Network,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  MoreVertical,
  CopyCheck,
  Settings,
  Share2,
  Bookmark,
} from 'lucide-react';
import WalletPortfolioChart from './WalletPortfolioChart';
import { FluentCopy20Filled, FluentCopy20Regular } from '@/components/icons/icons';
import { ChartDataPoint } from '@/lib/wallet-analytics/types';
import { OHLCDataPoint } from '@/lib/extensions/crypto/zerion';
import { formatCurrency, formatPercent } from '@/lib/wallet-analytics/utils';

interface WalletHeaderProps {
  address: string;
  data: any;
  onChainChange: (chainId: string) => void;
  showBalance: boolean;
  onToggleBalance: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  availableChains: string[];
  walletName?: string;
  variant?: 'default' | 'compact' | 'detailed';
  isLoading?: boolean;
}

interface ZerionChain {
  type: "chains";
  id: string;
  attributes: {
    external_id: string;
    name: string;
    icon: { url: string; };
    explorer: {
      name: string;
      token_url_format: string;
      tx_url_format: string;
      home_url: string;
    };
    rpc: { public_servers_url: string[]; };
    flags: {
      supports_trading: boolean;
      supports_sending: boolean;
      supports_bridge: boolean;
    };
  };
  relationships: any;
  links: { self: string; };
}

// Custom hooks
const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200
  }));

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      setDimensions({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width
      });
    };

    updateDimensions();
    const debouncedUpdate = debounce(updateDimensions, 100);
    window.addEventListener('resize', debouncedUpdate);
    return () => window.removeEventListener('resize', debouncedUpdate);
  }, []);

  return dimensions;
};

const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};


const formatPercentage = (value = 0, showBalance: boolean) => {
  if (!showBalance) return '••%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}%`;
};

const formatAddress = (address: string, isMobile: boolean) => {
  if (isMobile) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
};

// Components
const WalletAvatar = React.memo<{
  walletName: string;
  showBalance: boolean;
  isMobile: boolean;
  isActive?: boolean;
}>(({ walletName, showBalance, isMobile, isActive = true }) => (
  <div className="relative group">
    <Badge 
      size="sm"
      variant="solid"
      content={
        <div className="flex items-center justify-center w-4 h-4 px-0">
          {showBalance ? <Eye size={12} className="text-white" /> : <EyeOff size={12} className="text-white" />}
        </div>
      } 
      placement="bottom-right"
      className={`bg-gradient-to-r px-0 border-2 border-white/20  ${
        isActive ? 'from-orange-500 to-pink-500' : 'from-gray-500 to-gray-600'
      }`}
    >
      <Avatar
        name={walletName}
        size={isMobile ? "sm" : "md"}
        className={`rounded-xl md:rounded-2xl text-white font-bold hover:scale-105 ${
          isActive 
            ? 'bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600' 
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}
      />
    </Badge>
    {!isMobile && (
      <div className={`absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isActive ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20' : 'bg-gray-500/20'
      } blur-lg`} />
    )}
  </div>
));

const AddressDisplay = React.memo<{
  address: string;
  isMobile: boolean;
  onCopy: () => void;
  copySuccess: boolean;
}>(({ address, isMobile, onCopy, copySuccess }) => (
  <div className="flex items-center gap-2">
    <Tooltip 
      content={copySuccess ? "Copied!" : "Copy Address"} 
      className="text-xs font-medium rounded-lg"
      delay={0}
      closeDelay={0}
    >
      <button 
        className="group flex items-center cursor-pointer bg-default-50 dark:bg-white/5 rounded-lg px-2 py-1 hover:bg-default-100 dark:hover:bg-white/10 backdrop-blur-sm border border-divider  hover:scale-[1.02]"
        onClick={onCopy}
        type="button"
      >
        <code className="text-xs font-mono mr-2 font-medium text-foreground/80">
          {formatAddress(address, isMobile)}
        </code>
        <div className={`transition-transform duration-200 ${copySuccess ? 'scale-110' : 'group-hover:scale-110'}`}>
          {copySuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-foreground/60" />
          )}
        </div>
      </button>
    </Tooltip>
    
    <Tooltip content="View on Explorer" className="text-xs font-medium rounded-lg">
      <Button
        as="a"
        href={`https://etherscan.io/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        isIconOnly
        size="sm"
        variant="flat"
        className="min-w-0 w-7 h-7 bg-default-50 dark:bg-white/5 hover:bg-default-100 dark:hover:bg-white/10 border border-divider backdrop-blur-sm transition-all duration-200 hover:scale-105"
      >
        <ExternalLink size={12} className="text-foreground/60" />
      </Button>
    </Tooltip>
  </div>
));

const QuickStat = React.memo<{
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
  index: number;
  isMobile: boolean;
}>(({ icon: Icon, label, value, color, index, isMobile }) => (
  <div
    className="flex items-center gap-2 bg-content2/50 backdrop-blur-sm rounded-lg p-1 border border-divider text-center group hover:bg-content2 cursor-pointer "
    style={{ 
      animationDelay: `${300 + index * 100}ms`,
      animationFillMode: 'both'
    }}
  >
    <div className={`p-1 flex  rounded-lg bg-gradient-to-r ${color} group-hover:scale-105 `}>
      <Icon size={isMobile ? 12 : 14} className="text-white drop-shadow-sm" />
    </div>
    <div className=" flex gap-2">
      <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-200">
        {value.toLocaleString()}
      </p>
      <p className="text-[9px] text-foreground/60 uppercase font-medium tracking-wide">
        {label}
      </p>
    </div>
  </div>
));

const ActionButton = React.memo<{
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tooltip: string;
  onClick: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md';
}>(({ icon: Icon, tooltip, onClick, isLoading = false, variant = 'default', size = 'sm' }) => {
  const variantClasses = {
    default: 'bg-default-50 dark:bg-white/5 hover:bg-default-100 dark:hover:bg-white/10 text-foreground/60',
    primary: 'bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 text-primary-600 dark:text-primary-400',
    success: 'bg-success-50 dark:bg-success-500/10 hover:bg-success-100 dark:hover:bg-success-500/20 text-success-600 dark:text-success-400',
    warning: 'bg-warning-50 dark:bg-warning-500/10 hover:bg-warning-100 dark:hover:bg-warning-500/20 text-warning-600 dark:text-warning-400'
  };

  return (
    <Tooltip content={tooltip} className="text-xs font-medium rounded-lg">
      <Button
        isIconOnly
        size={size}
        variant="flat"
        onPress={onClick}
        isLoading={isLoading}
        className={`min-w-0 ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} ${variantClasses[variant]} border border-divider/50 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-md`}
      >
        <Icon size={size === 'sm' ? 14 : 16} />
      </Button>
    </Tooltip>
  );
});

// Main component
export const WalletHeader: React.FC<WalletHeaderProps> = ({
  address,
  data,
  showBalance,
  onToggleBalance,
  onRefresh,
  refreshing = false,
  availableChains,
  walletName = "My Wallet",
  variant = 'default',
  isLoading = false,
}) => {
  const [walletData, setWalletData] = useState<any | null>(data?.portfolio);
  const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  // Data processing
  useEffect(() => {
    if (data?.portfolio) {
      setWalletData(data.portfolio);
    }
  }, [data?.portfolio]);

  useEffect(() => {
    const transformChartData = (data: OHLCDataPoint[]) => {
      return data.map(point => ({
        timestamp: point.chart_timestamp,
        value: Number(point.close_value),
        label: point.period_label,
        dataPoints: point.data_points
      }));
    };

    if (data?.chart) {
      setChartData(transformChartData(data.chart));
    }
  }, [data?.chart]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setShowRefreshAnimation(true);
    onRefresh();
    setTimeout(() => setShowRefreshAnimation(false), 1200);
  }, [onRefresh]);

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }, [address]);

  // Memoized calculations
  const portfolioMetrics = useMemo(() => {
    if (!walletData) return null;
    
    const isPositiveChange = (walletData.dayChangePercent || 0) >= 0;
    const totalValue = walletData.totalValue || 0;
    const positionsCount = walletData.positionsCount || walletData.positions?.length || 0;
    const chainsCount = walletData.chainsCount || walletData.chains?.length || 0;
    
    return {
      isPositiveChange,
      totalValue,
      positionsCount,
      chainsCount,
      nftsCount: walletData.nftsCount || 0,
      dayChangePercent: walletData.dayChangePercent || 0,
      risk: totalValue > 100000 ? 'high' : totalValue > 10000 ? 'medium' : 'low',
      diversification: chainsCount > 3 ? 'high' : chainsCount > 1 ? 'medium' : 'low',
      activity: positionsCount > 20 ? 'high' : positionsCount > 5 ? 'medium' : 'low'
    };
  }, [walletData]);

  const quickStats = useMemo(() => [
    { 
      icon: Wallet, 
      label: 'Positions', 
      value: portfolioMetrics?.positionsCount || 0, 
      color: 'from-blue-400 to-cyan-400'
    },
    { 
      icon: Sparkles, 
      label: 'NFTs', 
      value: portfolioMetrics?.nftsCount || 0, 
      color: 'from-purple-400 to-pink-400'
    },
    { 
      icon: Network, 
      label: 'Chains', 
      value: portfolioMetrics?.chainsCount || 0, 
      color: 'from-green-400 to-emerald-400'
    }
  ], [portfolioMetrics]);

  const chartHeight = useMemo(() => {
    if (isMobile) return variant === 'compact' ? 180 : 220;
    if (isTablet) return variant === 'compact' ? 200 : 260;
    return variant === 'compact' ? 240 : 300;
  }, [isMobile, isTablet, variant]);



  return (
    <div className="relative w-full rounded-3xl border border-divider  to-transparent backdrop-blur-xl ">
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/3 via-transparent to-pink-500/3" />
      
      {/* Main content */}
      <div className="relative">
        {/* Header Section */}
        <div className="p-4 ">
          <div className="flex flex-col lg:flex-row gap-2 ">
            {/* Left Panel - Wallet Info */}
            <div className="flex-1 min-w-0">
              <div className="flex  gap-3  mb-1">
                <WalletAvatar 
                  walletName={walletName}
                  showBalance={showBalance}
                  isMobile={isMobile}
                  isActive={!!portfolioMetrics}
                />
                
                <div className="flex justify-between gap-4 min-w-0">
                  <div className='flex-1 min-w-0'>
                  {/* Wallet Name and Status */}
                  <div className="flex  items-center gap-2 mb-1">
                    <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">
                      {walletName}
                    </h2>
                    
                    {/* Status indicators - hidden on mobile */}
                    {!isMobile && portfolioMetrics && (
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            portfolioMetrics.diversification === 'high' ? 'success' : 
                            portfolioMetrics.diversification === 'medium' ? 'warning' : 'default'
                          }
                          startContent={<Network size={10} />}
                          className="text-[10px] h-5 px-2 bg-content2/50 backdrop-blur-sm border border-divider/50 rounded-lg"
                        >
                          {portfolioMetrics.diversification} diversity
                        </Chip>
                        
                        {portfolioMetrics.totalValue > 0 && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color={portfolioMetrics.isPositiveChange ? 'success' : 'danger'}
                            startContent={
                              portfolioMetrics.isPositiveChange ? 
                                <TrendingUp size={10} /> : 
                                <TrendingDown size={10} />
                            }
                            className="text-[10px] h-5 px-2 bg-content2/50 backdrop-blur-sm border border-divider/50 rounded-lg"
                          >
                            {formatPercentage(portfolioMetrics.dayChangePercent, showBalance)}
                          </Chip>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Address Section */}
                  <AddressDisplay
                    address={address}
                    isMobile={isMobile}
                    onCopy={copyAddress}
                    copySuccess={copySuccess}
                  />
                  </div>
                  {/* Portfolio Value - Mobile */}
                  {isMobile && portfolioMetrics && (
                    <div className="mt-3 p-3 bg-content2/30 rounded-xl border border-divider">
                      <div className="flex flex-col items-center justify-between">
                        <div>
                          <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-wide">
                            Portfolio Value
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {formatCurrency(portfolioMetrics.totalValue, showBalance, true)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={portfolioMetrics.isPositiveChange ? 'success' : 'danger'}
                            className="text-xs"
                          >
                            {formatPercentage(portfolioMetrics.dayChangePercent, showBalance)}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

           
            </div>

            {/* Right Panel - Quick Stats and Actions */}
            <div className="flex flex-col gap-4 lg:items-end">
              {/* Portfolio Value - Desktop */}
              {!isMobile && portfolioMetrics && (
                <div className="text-right">
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wide mb-1">
                    Portfolio Value
                  </p>

                  <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-default-600 bg-clip-text text-transparent transition-all duration-200"
                  >
                    {formatCurrency(
                      portfolioMetrics.totalValue ?? 0, 
                      showBalance, 
                      isMobile
                    )}
                  </span>
                  
                  <div>
                    <Chip
                      size={isMobile ? "sm" : "md"}
                      variant="light"
                      color={portfolioMetrics.isPositiveChange ? "success" : "danger"}
                      className={`text-[11px] sm:text-xs h-6 px-0 rounded-md ${portfolioMetrics.isPositiveChange ? 'bg-success-100 text-success-600': 'bg-danger-100 text-danger-700'}` }
                      classNames={{
                        content: "font-medium",
                      }}
                    >
                      {formatPercent((portfolioMetrics.dayChangePercent ?? 0))}
                    </Chip>
                  </div>

           
                </div>
             
                </div>
              )}

              {/* Quick Stats Grid 
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-3 lg:grid-cols-1 xl:grid-cols-3'}`}>
                {quickStats.map((stat, index) => (
                  <QuickStat
                    key={stat.label}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    color={stat.color}
                    index={index}
                    isMobile={isMobile}
                  />
                ))}
              </div>*/}

       
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="relative">
          <WalletPortfolioChart 
            walletAddress={address}
            chartData={chartData}
            initialPeriod="week"
            showBalance={showBalance}
            theme='solid'
            variant='detailed'
            height={chartHeight}
            className="w-full"
            isLoading={isLoading}
            showControls={!isMobile}
            compact={variant === 'compact'}
          />
        </div>
      </div>
    </div>
  );
};

WalletHeader.displayName = 'WalletHeader';