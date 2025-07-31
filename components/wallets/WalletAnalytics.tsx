import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Avatar } from '@heroui/avatar';
import { Progress } from '@heroui/progress';
import { 
  Wallet, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  Copy,
  ExternalLink,
  Settings,
  BarChart3,
  Coins,
  Image as ImageIcon,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { useWalletAnalytics, useWalletData, usePortfolioOverview } from '@/lib/hooks/useWalletAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const WalletAnalytics = () => {
  const [showBalances, setShowBalances] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onOpenChange: onAddModalOpenChange } = useDisclosure();
  
  const {
    wallets,
    loading,
    error,
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    isWalletSyncing,
    syncingCount,
    hasWallets
  } = useWalletAnalytics();

  const { portfolioSummary, topWallets } = usePortfolioOverview();
  const selectedWalletData = useWalletData(selectedWalletId);

  // Auto-select first wallet if none selected
  useEffect(() => {
    if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  const formatCurrency = (value: number) => {
    if (!showBalances) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (!showBalances) return '•••%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'syncing': return 'warning';
      case 'error': return 'danger';
      default: return 'default';
    }
  };

  const getPerformanceColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-default-500';
  };

  if (loading && !hasWallets) {
    return <WalletAnalyticsLoader />;
  }

  if (!hasWallets) {
    return <EmptyWalletsState onAddWallet={onAddModalOpen} />;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="border-none bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/20 dark:to-secondary-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/20">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Portfolio Overview</h2>
                <p className="text-sm text-default-500">
                  {portfolioSummary.walletsCount} wallets • {portfolioSummary.totalChains} chains
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="flat"
                size="sm"
                startContent={showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                onPress={() => setShowBalances(!showBalances)}
              >
                {showBalances ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="flat"
                size="sm"
                startContent={<RefreshCw className={`h-4 w-4 ${syncingCount > 0 ? 'animate-spin' : ''}`} />}
                onPress={() => syncAllWallets()}
                isLoading={syncingCount > 0}
              >
                Sync All
              </Button>
              <Button
                color="primary"
                size="sm"
                startContent={<Plus className="h-4 w-4" />}
                onPress={onAddModalOpen}
              >
                Add Wallet
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-default-500">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-default-500">24h Change</p>
              <div className="flex items-center gap-2">
                <p className={`text-xl font-semibold ${getPerformanceColor(portfolioSummary.totalChange)}`}>
                  {formatCurrency(Math.abs(portfolioSummary.totalChange))}
                </p>
                <Chip
                  variant="flat"
                  color={portfolioSummary.totalChange >= 0 ? 'success' : 'danger'}
                  size="sm"
                  startContent={portfolioSummary.totalChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                >
                  {formatPercentage(portfolioSummary.totalChangePercent)}
                </Chip>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-default-500">Total Positions</p>
              <p className="text-xl font-semibold">{portfolioSummary.totalPositions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-default-500">Active Wallets</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">{portfolioSummary.activeWallets}</p>
                <p className="text-sm text-default-500">/ {portfolioSummary.walletsCount}</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets List */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Wallets</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="space-y-1">
              {wallets.map((wallet) => (
                <WalletListItem
                  key={wallet.id}
                  wallet={wallet}
                  isSelected={selectedWalletId === wallet.id}
                  onSelect={() => setSelectedWalletId(wallet.id)}
                  onSync={() => syncWallet(wallet.id)}
                  onRemove={() => removeWallet(wallet.id)}
                  showBalances={showBalances}
                  isLoading={isWalletSyncing(wallet.id)}
                />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Selected Wallet Details */}
        <div className="lg:col-span-2">
          {selectedWalletData.wallet ? (
            <WalletDetailsView
              walletData={selectedWalletData}
              showBalances={showBalances}
              onRefresh={selectedWalletData.refresh}
            />
          ) : (
            <Card>
              <CardBody className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Wallet className="h-12 w-12 text-default-300 mx-auto" />
                  <p className="text-default-500">Select a wallet to view details</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <AddWalletModal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalOpenChange}
        onAdd={addWallet}
      />
    </div>
  );
};

// Wallet List Item Component
const WalletListItem = ({ 
  wallet, 
  isSelected, 
  onSelect, 
  onSync, 
  onRemove, 
  showBalances, 
  isLoading 
}: {
  wallet: any;
  isSelected: boolean;
  onSelect: () => void;
  onSync: () => void;
  onRemove: () => void;
  showBalances: boolean;
  isLoading: boolean;
}) => {
  const value = wallet.last_sync_data?.portfolio?.totalValue || 0;
  const change = wallet.last_sync_data?.portfolio?.dayChangePercent || 0;

  return (
    <div
      className={`p-3 cursor-pointer transition-colors hover:bg-default-100 ${
        isSelected ? 'bg-primary-50 dark:bg-primary-950/20 border-r-2 border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar
            size="sm"
            name={wallet.address.slice(2, 4).toUpperCase()}
            className="bg-gradient-to-br from-primary to-secondary text-white"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{wallet.name}</p>
              <Chip
                size="sm"
                variant="flat"
                color={getStatusColor(wallet.sync_status)}
                className="shrink-0"
              >
                {wallet.sync_status}
              </Chip>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-default-500 font-mono">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-4 w-4 min-w-4"
                onPress={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(wallet.address);
                  toast.success('Address copied');
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {wallet.last_sync_data && (
            <div className="text-right">
              <p className="text-sm font-medium">
                {showBalances ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value) : '••••••'}
              </p>
              <p className={`text-xs ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                {showBalances ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '•••%'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={(e) => {
                e.stopPropagation();
                onSync();
              }}
              isLoading={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wallet Details View Component
const WalletDetailsView = ({ walletData, showBalances, onRefresh }: {
  walletData: any;
  showBalances: boolean;
  onRefresh: () => void;
}) => {
  const { wallet, data, analytics, isLoading } = walletData;
  const [activeTab, setActiveTab] = useState('overview');

  if (!data) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 text-default-300 mx-auto" />
            <div>
              <p className="font-medium">No data available</p>
              <p className="text-sm text-default-500">Sync this wallet to see details</p>
            </div>
            <Button color="primary" onPress={onRefresh} isLoading={isLoading}>
              Sync Now
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Header */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size="lg"
                name={wallet.address.slice(2, 4).toUpperCase()}
                className="bg-gradient-to-br from-primary to-secondary text-white"
              />
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{wallet.name}</h2>
                  {analytics?.performance.rating && (
                    <Chip
                      variant="flat"
                      color={
                        analytics.performance.rating === 'excellent' ? 'success' :
                        analytics.performance.rating === 'good' ? 'primary' :
                        analytics.performance.rating === 'poor' ? 'danger' : 'default'
                      }
                      size="sm"
                    >
                      {analytics.performance.rating}
                    </Chip>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-default-500 font-mono">{wallet.address}</p>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      navigator.clipboard.writeText(wallet.address);
                      toast.success('Address copied');
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">
                {showBalances ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(data.portfolio.totalValue) : '••••••'}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <Chip
                  variant="flat"
                  color={data.portfolio.dayChange >= 0 ? 'success' : 'danger'}
                  size="sm"
                  startContent={data.portfolio.dayChange >= 0 ? 
                    <TrendingUp className="h-3 w-3" /> : 
                    <TrendingDown className="h-3 w-3" />
                  }
                >
                  {showBalances ? `${data.portfolio.dayChange >= 0 ? '+' : ''}${data.portfolio.dayChangePercent.toFixed(2)}%` : '•••%'}
                </Chip>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={onRefresh}
                  isLoading={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-divider">
            <div className="text-center">
              <p className="text-sm text-default-500">Positions</p>
              <p className="text-lg font-semibold">{data.metadata.positionsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-default-500">Chains</p>
              <p className="text-lg font-semibold">{data.metadata.chainsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-default-500">NFTs</p>
              <p className="text-lg font-semibold">{data.metadata.nftsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-default-500">Last Sync</p>
              <p className="text-sm text-default-500">
                {new Date(data.metadata.lastSyncAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabbed Content */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            classNames={{
              tabList: "px-4 pt-4",
              cursor: "bg-primary",
              tab: "h-9",
              tabContent: "text-sm font-medium"
            }}
          >
            <Tab
              key="overview"
              title={
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </div>
              }
            >
              <div className="p-4 space-y-4">
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-divider">
                      <CardBody>
                        <div className="text-center">
                          <p className="text-sm text-default-500">30D Average</p>
                          <p className="text-lg font-semibold">
                            {showBalances ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0
                            }).format(analytics.performance.avg30DValue) : '••••••'}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                    <Card className="border border-divider">
                      <CardBody>
                        <div className="text-center">
                          <p className="text-sm text-default-500">Total Return</p>
                          <p className={`text-lg font-semibold ${analytics.performance.totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                            {showBalances ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0
                            }).format(Math.abs(analytics.performance.totalReturn)) : '••••••'}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                    <Card className="border border-divider">
                      <CardBody>
                        <div className="text-center">
                          <p className="text-sm text-default-500">Return %</p>
                          <p className={`text-lg font-semibold ${analytics.performance.totalReturnPercent >= 0 ? 'text-success' : 'text-danger'}`}>
                            {showBalances ? `${analytics.performance.totalReturnPercent >= 0 ? '+' : ''}${analytics.performance.totalReturnPercent.toFixed(2)}%` : '•••%'}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}

                {/* Top Positions */}
                <div>
                  <h4 className="font-semibold mb-3">Top Positions</h4>
                  <div className="space-y-2">
                    {data.positions.slice(0, 5).map((position: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size="sm"
                            src={position.attributes?.fungible_info?.icon?.url}
                            name={position.attributes?.fungible_info?.symbol || 'TOKEN'}
                          />
                          <div>
                            <p className="font-medium">{position.attributes?.fungible_info?.name || 'Unknown Token'}</p>
                            <p className="text-sm text-default-500">{position.attributes?.fungible_info?.symbol || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {showBalances ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0
                            }).format(position.attributes?.value || 0) : '••••••'}
                          </p>
                          <p className="text-sm text-default-500">
                            {position.attributes?.quantity ? 
                              new Intl.NumberFormat('en-US', {
                                maximumFractionDigits: 4
                              }).format(parseFloat(position.attributes.quantity)) : '0'
                            } {position.attributes?.fungible_info?.symbol}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tab>

            <Tab
              key="tokens"
              title={
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Tokens ({data.metadata.positionsCount})
                </div>
              }
            >
              <TokensList positions={data.positions} showBalances={showBalances} />
            </Tab>

            <Tab
              key="nfts"
              title={
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  NFTs ({data.metadata.nftsCount})
                </div>
              }
            >
              <NFTsList nfts={data.nftPortfolio} showBalances={showBalances} />
            </Tab>

            <Tab
              key="transactions"
              title={
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Transactions
                </div>
              }
            >
              <TransactionsList transactions={data.transactions} />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

// Add Wallet Modal
const AddWalletModal = ({ isOpen, onOpenChange, onAdd }: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (address: string, name?: string) => Promise<any>;
}) => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onAdd(address.trim(), name.trim() || undefined);
      if (result) {
        onOpenChange(false);
        setAddress('');
        setName('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Add New Wallet</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Wallet Address"
                  placeholder="0x..."
                  value={address}
                  onValueChange={setAddress}
                  isRequired
                  description="Enter a valid Ethereum wallet address"
                />
                <Input
                  label="Wallet Name (Optional)"
                  placeholder="My Main Wallet"
                  value={name}
                  onValueChange={setName}
                  description="Give your wallet a memorable name"
                />
                {error && (
                  <div className="flex items-center gap-2 text-danger text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleAdd}
                isLoading={loading}
              >
                Add Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// Loading State
const WalletAnalyticsLoader = () => (
  <div className="space-y-6">
    <Card>
      <CardBody>
        <div className="flex items-center justify-center h-32">
          <Spinner size="lg" label="Loading wallets..." />
        </div>
      </CardBody>
    </Card>
  </div>
);

// Empty State
const EmptyWalletsState = ({ onAddWallet }: { onAddWallet: () => void }) => (
  <Card>
    <CardBody className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <Wallet className="h-16 w-16 text-default-300 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">No wallets added yet</h3>
          <p className="text-default-500">Add your first wallet to start tracking your portfolio</p>
        </div>
        <Button color="primary" size="lg" startContent={<Plus className="h-5 w-5" />} onPress={onAddWallet}>
          Add Your First Wallet
        </Button>
      </div>
    </CardBody>
  </Card>
);

// Simplified component placeholders (you can expand these based on your existing components)
const TokensList = ({ positions, showBalances }: { positions: any[]; showBalances: boolean }) => (
  <div className="p-4">
    <div className="space-y-2">
      {positions.map((position, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <Avatar
              size="sm"
              src={position.attributes?.fungible_info?.icon?.url}
              name={position.attributes?.fungible_info?.symbol || 'T'}
            />
            <div>
              <p className="font-medium">{position.attributes?.fungible_info?.name || 'Unknown'}</p>
              <p className="text-sm text-default-500">{position.attributes?.fungible_info?.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {showBalances ? `${(position.attributes?.value || 0).toLocaleString()}` : '••••••'}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NFTsList = ({ nfts, showBalances }: { nfts: any; showBalances: boolean }) => (
  <div className="p-4">
    <div className="text-center py-8">
      <ImageIcon className="h-12 w-12 text-default-300 mx-auto mb-2" />
      <p className="text-default-500">NFT collection display coming soon</p>
    </div>
  </div>
);

const TransactionsList = ({ transactions }: { transactions: any[] }) => (
  <div className="p-4">
    <div className="text-center py-8">
      <Activity className="h-12 w-12 text-default-300 mx-auto mb-2" />
      <p className="text-default-500">Transaction history coming soon</p>
    </div>
  </div>
);

export default WalletAnalytics;