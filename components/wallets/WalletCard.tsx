'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Tooltip } from '@heroui/tooltip';
import {
  MoreVertical,
  RefreshCw,
  Copy,
  ExternalLink,
  Trash2,
  TrendingUp,
  TrendingDown,
  Globe,
  Coins,
  Clock,
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Timer,
  ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency, truncateAddress } from '@/lib/wallet-analytics/utils';

// Types
interface WalletCardProps {
  wallet: {
    id: string;
    address: string;
    name?: string;
    sync_status: 'synced' | 'syncing' | 'error' | 'stale';
    isWatchOnly?: boolean;
    wallet_portfolio_summary?: any;
  };

  showBalances?: boolean;
  isSelected?: boolean;
  onSelect?: (wallet: any) => void;
  onSync?: (walletId: string) => void;
  onRemove?: (walletId: string) => void;
  onViewDetails?: (wallet: any) => void;
  isSyncing?: boolean;
  viewMode?: 'list' | 'grid';
  className?: string;
}

interface NetworkIconProps {
  network: string;
}

interface PerformanceIndicatorProps {
  change24h?: number;
  showBalances: boolean;
}

interface StatusBadgeProps {
  status: string;
  lastSync?: string;
  className?: string;
}

interface NetworkListProps {
  networks: string[];
  maxVisible?: number;
  className?: string;
}



// Network Icons Component
const NetworkIcon: React.FC<NetworkIconProps> = ({ network }) => {
  const networkConfigs = {
    ethereum: { gradient: 'from-blue-500 to-purple-600' },
    polygon: { gradient: 'from-purple-500 to-pink-600' },
    arbitrum: { gradient: 'from-blue-400 to-cyan-600' },
    optimism: { gradient: 'from-red-500 to-pink-600' },
    base: { gradient: 'from-blue-600 to-indigo-600' },
  };

  const config = networkConfigs[network?.toLowerCase() as keyof typeof networkConfigs];
  
  if (!config) {
    return <Globe className="w-4 h-4 text-default-500" />;
  }

  return (
    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
      <div className="w-2 h-2 bg-white rounded-full" />
    </div>
  );
};

// Performance Indicator Component
const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ change24h, showBalances }) => {
  if (!showBalances || change24h === undefined) {
    return (
      <div className="flex items-center gap-1 text-xs text-default-400">
        <div className="w-3 h-3 bg-default-200 rounded animate-pulse" />
        <span>••%</span>
      </div>
    );
  }

  const isPositive = change24h >= 0;
  const color = isPositive ? 'text-success-600' : 'text-danger-700';
  const bgColor = isPositive ? 'bg-success-200/50 dark:bg-success-100' : 'bg-danger-100 dark:bg-danger-400/20';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Chip 

      className={`flex items-center  h-5 px-0 rounded-md text-[10px] font-bold ${bgColor} ${color}`}
      classNames={{
        content: 'font-medium',
      }}
     
    >
    
        {isPositive ? '+' : ''}{change24h.toFixed(2)}%
    
    </Chip>
  );
};

// Status Badge Component
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, lastSync, className = "" }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'synced':
        return {
          color: 'success' as const,
          icon: CheckCircle2,
          label: 'Synced',
          description: 'Up to date'
        };
      case 'syncing':
        return {
          color: 'warning' as const,
          icon: RefreshCw,
          label: 'Syncing',
          description: 'Updating...',
          animated: true
        };
      case 'error':
        return {
          color: 'danger' as const,
          icon: AlertTriangle,
          label: 'Error',
          description: 'Sync failed'
        };
      case 'stale':
        return {
          color: 'default' as const,
          icon: Timer,
          label: 'Stale',
          description: 'Needs update'
        };
      default:
        return {
          color: 'default' as const,
          icon: Clock,
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Tooltip 
      content={
        <div className="text-center">
          <p className="font-medium">{config.description}</p>
          {lastSync && (
            <p className="text-xs text-default-500 mt-1">
              Last sync: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
      }
    >
      <Chip
        size="sm"
        variant="flat"
        color={config.color}
        startContent={
          <Icon className={`w-3 h-3 ${config.animated ? 'animate-spin' : ''}`} />
        }
        className={className}
      >
        {config.label}
      </Chip>
    </Tooltip>
  );
};

// Network List Component
const NetworkList: React.FC<NetworkListProps> = ({ networks, maxVisible = 3, className = "" }) => {
  const visibleNetworks = networks?.slice(0, maxVisible) || [];
  const hiddenCount = Math.max(0, (networks?.length || 0) - maxVisible);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleNetworks.map((network, index) => (
        <Tooltip key={index} content={network}>
          <div className="p-1 bg-default-100 dark:bg-default-800 rounded-md hover:bg-default-200 dark:hover:bg-default-700 transition-colors">
            <NetworkIcon network={network} />
          </div>
        </Tooltip>
      ))}
      {hiddenCount > 0 && (
        <Tooltip content={`+${hiddenCount} more networks`}>
          <div className="p-1 bg-default-100 dark:bg-default-800 rounded-md text-xs font-medium text-default-600 min-w-[24px] text-center">
            +{hiddenCount}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

// Wallet Actions Component - Fixed to prevent nested buttons
const WalletActions: React.FC<{
  wallet: any;
  onSync: (id: string) => void;
  onRemove: (id: string) => void;
  isSyncing: boolean;
  isHovered: boolean;
  onViewDetails?: (wallet: any) => void;
}> = ({ wallet, onSync, onRemove, isSyncing, isHovered, onViewDetails }) => {
  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(wallet.address);
    toast.success('Address copied to clipboard');
  }, [wallet.address]);

  const handleViewOnExplorer = useCallback(() => {
    window.open(`https://etherscan.io/address/${wallet.address}`, '_blank');
  }, [wallet.address]);

  const handleSync = useCallback((e: React.MouseEvent) => {

    onSync(wallet.id);
  }, [onSync, wallet.id]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
  
    onRemove(wallet.id);
  }, [onRemove, wallet.id]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
  
    onViewDetails?.(wallet);
  }, [onViewDetails, wallet]);

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
     {/*  <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex gap-1"
          >
            <Tooltip content="Sync wallet">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="primary"
                onClick={handleSync}
                isLoading={isSyncing}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Tooltip>
            {onViewDetails && (
              <Tooltip content="View details">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onClick={handleViewDetails}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Tooltip>
            )} 
          </motion.div>
        )}
      </AnimatePresence>*/}

      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Wallet actions">
          <DropdownItem
            key="sync"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={handleSync}
            isDisabled={isSyncing}
          >
            Sync Now
          </DropdownItem>
          <DropdownItem
            key="copy"
            startContent={<Copy className="w-4 h-4" />}
            onPress={handleCopyAddress}
          >
            Copy Address
          </DropdownItem>
          <DropdownItem
            key="explorer"
            startContent={<ExternalLink className="w-4 h-4" />}
            onPress={handleViewOnExplorer}
          >
            View on Explorer
          </DropdownItem>
          <DropdownItem
            key="remove"
            className="text-danger"
            color="danger"
            startContent={<Trash2 className="w-4 h-4" />}
            onPress={handleRemove}
          >
            Remove Wallet
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

// Grid View Component - Fixed button nesting issue
const GridView: React.FC<WalletCardProps> = ({
  wallet,

  showBalances = true,
  isSelected = false,
  onSelect,
  onSync,
  onRemove,
  onViewDetails,
  isSyncing = false,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatValue = useCallback((value?: number) => {
    if (!showBalances) return '••••••';
    if (value === undefined || value === null) return '$0';
    return `$${value.toLocaleString()}`;
  }, [showBalances]);

  const formatCount = useCallback((count?: number) => {
    if (!showBalances) return '••';
    return count?.toString() || '0';
  }, [showBalances]);

  const portfolioValue = wallet?.wallet_portfolio_summary
  ?.totalValue?.positions || 0;
  const change24h = wallet?.wallet_portfolio_summary
  ?.dayChangePercent;
  const positionsCount = wallet?.wallet_portfolio_summary
  ?.positionsCount || 0;
  const chainsCount = wallet?.wallet_portfolio_summary
  ?.chainsCount || 0;
  const nftsCount = wallet?.wallet_portfolio_summary
  ?.nftsCount || 0;
  const lastSyncAt = wallet?.wallet_portfolio_summary
  ?.lastSyncAt;
  const networks = wallet?.wallet_portfolio_summary
  || ['ethereum'];

  const avatarGradient = useMemo(() => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-red-500 to-orange-600',
      'from-orange-500 to-yellow-600',
      'from-yellow-500 to-green-600',
      'from-green-500 to-blue-600',
      'from-blue-500 to-indigo-600',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-cyan-600'
    ];
    const index = wallet.address ? wallet.address.charCodeAt(2) % gradients.length : 0;
    return gradients[index];
  }, [wallet.address]);

  const cardClassName = `
    border-none cursor-pointer transition-all duration-75 group rounded-2xl
    ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950' : 'bg-content1 hover:bg-content2'}
    hover:shadow-lg hover:-translate-y-1
    ${className}
  `;

  const handleCardClick = useCallback(() => {
    onSelect?.(wallet);
  }, [onSelect, wallet]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Fixed: Remove isPressable from Card to prevent button nesting */}
      <Card className={cardClassName} onClick={handleCardClick}>
        <CardBody className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar
                  size="md"
                  name={wallet.address?.slice(2, 4).toUpperCase()}
                  className={`bg-gradient-to-br ${avatarGradient} text-white font-bold`}
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                  wallet.sync_status === 'synced' ? 'bg-success-500' :
                  wallet.sync_status === 'syncing' ? 'bg-warning-500' :
                  wallet.sync_status === 'error' ? 'bg-danger-500' : 'bg-default-300'
                }`} />
                {isSyncing && (
                  <div className="absolute -top-1 -right-1 w-3 h-3">
                    <div className="w-full h-full bg-warning-500 rounded-full animate-ping" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {wallet.name || 'Unnamed Wallet'}
                  </h3>
                  {wallet.isWatchOnly && (
                    <Tooltip content="Watch-only wallet">
                      <div className="p-1 bg-default-100 rounded">
                        <Activity className="w-3 h-3 text-default-500" />
                      </div>
                    </Tooltip>
                  )}
                </div>
                <p className="text-xs text-default-500 font-mono truncate">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </p>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <WalletActions
                wallet={wallet}
                onSync={onSync!}
                onRemove={onRemove!}
                isSyncing={isSyncing}
                isHovered={isHovered}
                onViewDetails={onViewDetails}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-3">
            <StatusBadge status={wallet.sync_status} lastSync={lastSyncAt} />
            <PerformanceIndicator change24h={change24h} showBalances={showBalances} />
          </div>

          {/* Portfolio Value */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-default-500">Portfolio Value</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatValue(portfolioValue)}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins className="w-3 h-3 text-primary-500" />
              </div>
              <p className="text-lg font-semibold text-primary-600">
                {formatCount(positionsCount)}
              </p>
              <p className="text-xs text-default-500">Tokens</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Globe className="w-3 h-3 text-success-500" />
              </div>
              <p className="text-lg font-semibold text-success-600">
                {formatCount(chainsCount)}
              </p>
              <p className="text-xs text-default-500">Networks</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ImageIcon className="w-3 h-3 text-warning-500" />
              </div>
              <p className="text-lg font-semibold text-warning-600">
                {formatCount(nftsCount)}
              </p>
              <p className="text-xs text-default-500">NFTs</p>
            </div>
          </div>

          {/* Networks */}
          {networks.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-default-500">Networks:</span>
              <NetworkList networks={networks} maxVisible={4} />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-divider">
            <div className="flex items-center gap-1 text-xs text-default-500">
              <Clock className="w-3 h-3" />
              {lastSyncAt ? (
                <span>Updated {new Date(lastSyncAt).toLocaleDateString()}</span>
              ) : (
                <span>Never synced</span>
              )}
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    endContent={<ChevronRight className="w-3 h-3" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(wallet);
                    }}
                  >
                    Details
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// List View Component - Fixed button nesting issue
const ListView: React.FC<WalletCardProps> = ({
  wallet,

  showBalances = true,
  isSelected = false,
  onSelect,
  onSync,
  onRemove,
  onViewDetails,
  isSyncing = false,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatValue = useCallback((value?: number) => {
    if (!showBalances) return '••••••';
    if (value === undefined || value === null) return '$0';
    return `$${value.toLocaleString()}`;
  }, [showBalances]);

  const formatCount = useCallback((count?: number) => {
    if (!showBalances) return '••';
    return count?.toString() || '0';
  }, [showBalances]);

  const portfolioValue = wallet?.wallet_portfolio_summary?.total_value || 0;
  const change24h = wallet?.wallet_portfolio_summary?.day_change_percent || 0;
  const positionsCount = wallet?.wallet_portfolio_summary?.positions_count || 0;
  const chainsCount = wallet?.wallet_portfolio_summary?.chains_count || 0;
  const nftsCount = wallet?.wallet_portfolio_summary?.nft_count || 0;

  const avatarGradient = useMemo(() => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-red-500 to-orange-600',
      'from-orange-500 to-yellow-600',
      'from-yellow-500 to-green-600',
      'from-green-500 to-blue-600',
      'from-blue-500 to-indigo-600',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-cyan-600'
    ];
    const index = wallet.address ? wallet.address.charCodeAt(2) % gradients.length : 0;
    return gradients[index];
  }, [wallet.address]);

  const cardClassName = ` 
     cursor-pointer bg-content2 border border-divider group rounded-xl overflow-visible
    ${isSelected ? ' bg-primary-500/20 dark:bg-default-200' : ''}
    hover:bg-default-100 animate-in fade-in-0  slide-in-from-bottom-6
    ${className}
  `;

  const handleCardClick = useCallback(() => {
    onSelect?.(wallet);
    onViewDetails?.(wallet);
  }, [onSelect, wallet]);
 

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)} onClick={handleCardClick}
    >
         
      {/* Gradient overlay */}
    
      
      {/* Fixed: Remove isPressable from Card to prevent button nesting */}
      <Card className={cardClassName} >
         
        <CardBody className="py-2 px-3 overflow-visible">
          <div className="flex items-center gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-visible">
            {isSyncing && (
                  <div className="absolute -top-1 right-1 w-2 h-2">
                    <div className="w-full h-full bg-warning-500 rounded-full animate-ping" />
                  </div>
                )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate text-sm">
                    {wallet.name || 'Unnamed Wallet'} 
                  </h3>
                  {wallet.isWatchOnly && (
                    <Tooltip content="Watch-only wallet">
                      <Chip size="sm" variant="flat" startContent={<Activity className="w-3 h-3" />}>
                        Watch Only
                      </Chip>
                    </Tooltip>
                  )}
                </div>
                <p className="text-xs text-default-500 font-mono bg-content2 rounded-lg w-fit px-2 py-1">
                  {truncateAddress(wallet.address, 14, 4)}
                </p>
              </div>
            </div>

            {/* Portfolio Value */}
            <div className="flex flex-col align-middle text-right justify-end min-w-0 flex-shrink-0">
              <p className=" font-semibold text-default-600 ">
                {formatCurrency(portfolioValue, showBalances,true)}
              </p>
              <PerformanceIndicator change24h={change24h} showBalances={showBalances} />
            </div>

            {/* Actions */}
            <div onClick={(e) => e.stopPropagation()}>
              <WalletActions
                wallet={wallet}
                onSync={onSync!}
                onRemove={onRemove!}
                isSyncing={isSyncing}
                isHovered={isHovered}
                onViewDetails={onViewDetails}
              />
            </div>
          </div>


        </CardBody>
      </Card>
    </motion.div>
  );
};

// Main Wallet Card Component
const WalletCard: React.FC<WalletCardProps> = ({ viewMode = 'list', ...props }) => {
  return viewMode === 'grid' ? <GridView {...props} /> : <ListView {...props} />;
};

export default WalletCard;