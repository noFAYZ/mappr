// components/WalletAnalytics/WalletHeader.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  CopyCheck
} from 'lucide-react';
import WalletPortfolioChart from './WalletPortfolioChart';
import GooeyLoader from '@/components/shared/loader';
import { FluentCopy20Filled, FluentCopy20Regular } from '@/components/icons/icons';

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

export const WalletHeader: React.FC<WalletHeaderProps> = ({
  address,
  data,

  showBalance,
  onToggleBalance,
  onRefresh,
  refreshing = false,
  availableChains,
  walletName = "My Wallet",
  variant = 'default'
}) => {
  const [walletData, setWalletData] = useState<any | null>(data?.portfolio);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [supportedChains, setSupportedChains] = useState<ZerionChain[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  // Responsive breakpoint detection
  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  // Load wallet data and supported chains
  useEffect(() => {
    const loadWalletData = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        
      if(!data ) {
          console.warn('No wallet data available');
          setWalletData(null);
          return;
        }
      } catch (error) {
        console.error('Error loading wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWalletData();
  }, [address,data]);



  // Enhanced formatters
  const formatCurrency = (value = 0) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: value >= 1000000 ? 'compact' : 'standard'
    }).format(value);
  };
  
  const formatDetailedCurrency = (value = 0) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const formatPercentage = (value = 0) => {
    if (!showBalance) return '••%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${Number(value).toFixed(2)}%`;
  };
  
  const formatAddress = (address: string) => {
    if (isMobile) {
      return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  // Enhanced handlers
  const handleRefresh = () => {
    setShowRefreshAnimation(true);
    onRefresh();
    setTimeout(() => {
      setShowRefreshAnimation(false);
    }, 1200);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (!walletData) return null;
    
    const isPositiveChange = walletData.dayChangePercent >= 0;
    const risk = walletData.totalValue > 100000 ? 'high' : walletData.totalValue > 10000 ? 'medium' : 'low';
    const diversification = (walletData.chainsCount || 0) > 3 ? 'high' : (walletData.chainsCount || 0) > 1 ? 'medium' : 'low';
    
    return {
      isPositiveChange,
      risk,
      diversification,
      activity: walletData.positionsCount > 20 ? 'high' : walletData.positionsCount > 5 ? 'medium' : 'low'
    };
  }, [walletData]);

  // Helper function to get chain display info
  const getChainInfo = (chainId: string) => {
    const chain = supportedChains.find(c => c.id === chainId);
    return {
      id: chainId,
      name: chain?.attributes?.name || chainId,
      icon: chain?.attributes?.icon?.url || '🔗'
    };
  };



  return (
    <div className="relative w-full  rounded-2xl  border border-divider bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl animate-in fade-in-0 duration-100 slide-in-from-bottom-6">
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl lg:rounded-3xl  bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5" />
      
      {/* Main content */}
      <div className="relative">
        <div className="flex flex-col  min-h-0">
          {/* Left Panel - Wallet Info */}
          <div className=" p-4  flex justify-between ">
            {/* Header Section */}
            <div className="flex items-start justify-between  animate-in fade-in-0 slide-in-from-left-4 duration-100 ">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Avatar with modern styling */}
                <div className="relative group">
                 
                    <Badge 
                      size="sm"
                      variant="solid"
                      content={<Eye size={12} className="text-white" />} 
                      placement="bottom-right"
                      className="bg-gradient-to-r from-orange-500 to-pink-500 border-2 border-white/20" 
                    >
                      <Avatar
                        name={walletName}
                        size={isMobile ? "sm" : "md"}
                        className="rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white font-bold "
                      />
                    </Badge>
                
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm sm:text-base font-bold  truncate">{walletName}</h2>
                    
                    {/* Status indicators - hidden on mobile */}
                    {!isMobile && (
                      <div className="flex items-center gap-2 animate-in fade-in-0">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={portfolioMetrics?.diversification === 'high' ? 'success' : 
                                portfolioMetrics?.diversification === 'medium' ? 'warning' : 'danger'}
                          startContent={<Network size={10} />}
                          className="text-[10px] h-4.5 px-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md"
                        >
                          {portfolioMetrics?.diversification}
                        </Chip>
                      </div>
                    )}
                  </div>
                  
                  {/* Address Section with enhanced styling */}
                  <div className="flex items-center gap-2 ">
                    <Tooltip 
                      content={copySuccess ? "Copied!" : "Copy Address"} 
                      className="text-[10px] font-medium rounded-lg"
                    >
                      <div 
                        className="group flex items-center cursor-pointer bg-default dark:bg-white/5 rounded-lg px-2 py-0.5 dark:hover:bg-white/10 backdrop-blur-sm border border-white/10 "
                        onClick={copyAddress}
                      >
                        <code className="text-xs font-mono mr-2  font-medium">
                          {formatAddress(address)}
                        </code>
                        <div className={` ${copySuccess ? 'rotate-360' : ''}`}>
                          {copySuccess ? (
                            <FluentCopy20Filled className="w-3.5 h-3.5 " />
                          ) : (
                            <FluentCopy20Regular  className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </Tooltip>
                    
                    <Tooltip content="View on Explorer" className="text-[10px] font-medium rounded-lg">
                      <Button
                        as="a"
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="min-w-0 w-6 h-6 bg-default dark:bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm"
                      >
                        <ExternalLink size={12} className="" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Controls 
              {(isMobile || isTablet) && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="flat" 
                    isIconOnly 
                    onPress={onToggleBalance}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  >
                    {showBalance ? <Eye className="w-4 h-4 text-white/60" /> : <EyeOff className="w-4 h-4 text-white/60" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    onPress={handleRefresh}
                    isLoading={refreshing}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  >
                    <RefreshCw className={`w-4 h-4 text-white/60 transition-transform duration-300 ${showRefreshAnimation ? 'animate-spin' : ''}`} />
                  </Button>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button 
                        size="sm" 
                        variant="flat" 
                        isIconOnly
                        className="bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                      >
                        <MoreVertical className="w-4 h-4 text-white/60" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu className="bg-black/80 backdrop-blur-xl border border-white/10">
                      <DropdownItem startContent={<RefreshCw size={14} />}>
                        Refresh Data
                      </DropdownItem>
                      <DropdownItem startContent={<ExternalLink size={14} />}>
                        Export Data
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              )}*/}
            </div>


            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 ">
              {[
                { icon: Wallet, label: 'Positions', value: walletData?.positions?.length|| 0, color: 'from-blue-400 to-cyan-400', delay: '400ms' },
                { icon: Sparkles, label: 'NFTs', value: walletData?.nftsCount || 0, color: 'from-purple-400 to-pink-400', delay: '500ms' },
                { icon: Network, label: 'Chains', value: walletData?.chains?.length || 0, color: 'from-green-400 to-emerald-400', delay: '600ms' }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex  gap-1 bg-content3 backdrop-blur-sm rounded-xl p-2 border border-white/10 text-center justify-center group hover:bg-white/10 cursor-pointer animate-in fade-in-0 "
                  style={{ animationDelay: stat.delay }}
                >
             
                  <p className="font-bold text-base ">{stat.value}</p>
                  <p className="text-[10px] text-foreground/50 uppercase  font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

           
          </div>

     
            <WalletPortfolioChart 
              walletAddress={address}
              chartData={data?.chart || []}
              initialPeriod="week"
              showBalance={showBalance}
              showControls={true}
              compact={false}
              variant='minimal'
              height={isMobile ? 200 : isTablet ? 220 : 280}
              className="h-full"
            />
          </div>
       

        {/* Mobile Chain Selector
        {(isMobile || isTablet) && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-white/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-white/80 transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    {selectedChain === 'all' ? (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>All Networks</span>
                      </>
                    ) : (
                      <>
                        <img 
                          src={getChainInfo(selectedChain).icon} 
                          alt={getChainInfo(selectedChain).name}
                          className="w-4 h-4 rounded-full"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.style.display = 'inline';
                          }}
                        />
                        <span style={{ display: 'none' }}>🔗</span>
                        <span>{getChainInfo(selectedChain).name}</span>
                      </>
                    )}
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedChain]}
                onSelectionChange={(keys) => onChainChange(Array.from(keys)[0] as string)}
                className="bg-black/80 backdrop-blur-xl border border-white/10"
              >
                <DropdownItem key="all">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>All Networks</span>
                  </div>
                </DropdownItem>
                {availableChains.map((chainId) => {
                  const chainInfo = getChainInfo(chainId);
                  return (
                    <DropdownItem key={chainId}>
                      <div className="flex items-center gap-2">
                        <img 
                          src={chainInfo.icon} 
                          alt={chainInfo.name}
                          className="w-4 h-4 rounded-full"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.style.display = 'inline';
                          }}
                        />
                        <span style={{ display: 'none' }}>🔗</span>
                        <span>{chainInfo.name}</span>
                      </div>
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
        )} */}
      </div>
    </div>
  );
};