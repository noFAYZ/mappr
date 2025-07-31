'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Avatar } from '@heroui/avatar';
import { Progress } from '@heroui/progress';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Badge } from '@heroui/badge';
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
  Trash2,
  Filter,
  Download,
  Search,
  MoreVertical,
  Zap,
  Shield,
  Globe,
  Layers,
  PieChart,
  LineChart,
  Calendar,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { useWalletAnalytics, usePortfolioOverview } from '@/lib/hooks/useWalletAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

const WalletPage = () => {
  const [showBalances, setShowBalances] = useState(true);
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'change' | 'added'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onOpenChange: onAddModalOpenChange } = useDisclosure();
  const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onOpenChange: onBulkModalOpenChange } = useDisclosure();
  
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
    hasWallets,
    walletData
  } = useWalletAnalytics();

  const { portfolioSummary, topWallets } = usePortfolioOverview();

  // Debug function to test modal
  const handleAddWalletClick = () => {
    console.log('Add wallet clicked, modal state:', isAddModalOpen);
    onAddModalOpen();
    console.log('Modal should be opening...');
  };

  // Filter and sort wallets
  const filteredWallets = React.useMemo(() => {
    let filtered = wallets.filter(wallet => {
      const matchesSearch = wallet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'synced' && wallet.sync_status === 'success') ||
        (filterStatus === 'syncing' && wallet.sync_status === 'syncing') ||
        (filterStatus === 'error' && wallet.sync_status === 'error') ||
        (filterStatus === 'pending' && wallet.sync_status === 'pending');
      
      return matchesSearch && matchesStatus;
    });

    // Sort wallets
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'value':
          aValue = walletData[a.id]?.portfolio?.totalValue || 0;
          bValue = walletData[b.id]?.portfolio?.totalValue || 0;
          break;
        case 'name':
          aValue = a.name || a.address;
          bValue = b.name || b.address;
          break;
        case 'change':
          aValue = walletData[a.id]?.portfolio?.dayChangePercent || 0;
          bValue = walletData[b.id]?.portfolio?.dayChangePercent || 0;
          break;
        case 'added':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [wallets, searchQuery, filterStatus, sortBy, sortOrder, walletData]);

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

  const handleBulkAction = async (action: string) => {
    if (selectedWalletIds.length === 0) {
      toast.error('Please select wallets first');
      return;
    }

    switch (action) {
      case 'sync':
        await Promise.all(selectedWalletIds.map(id => syncWallet(id)));
        break;
      case 'delete':
        if (confirm(`Are you sure you want to remove ${selectedWalletIds.length} wallets?`)) {
          await Promise.all(selectedWalletIds.map(id => removeWallet(id)));
          setSelectedWalletIds([]);
        }
        break;
    }
  };

  const selectAll = () => {
    if (selectedWalletIds.length === filteredWallets.length) {
      setSelectedWalletIds([]);
    } else {
      setSelectedWalletIds(filteredWallets.map(w => w.id));
    }
  };

  // Show loading state
  if (loading && wallets.length === 0) {
    return <WalletPageLoader />;
  }

  // Show empty state only when not loading and no wallets
  if (!loading && wallets.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyWalletsState onAddWallet={handleAddWalletClick} />
        <AddWalletModal
          isOpen={isAddModalOpen}
          onOpenChange={onAddModalOpenChange}
          onAdd={addWallet}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/20 dark:to-secondary-950/20">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Your Wallets</h1>
                  <p className="text-default-500">
                    {portfolioSummary.walletsCount} wallets • {portfolioSummary.totalChains} chains • {portfolioSummary.totalPositions} positions
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
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <p className="text-sm text-default-500">Total Portfolio Value</p>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-default-500" />
                  <p className="text-sm text-default-500">24h Change</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-bold ${getPerformanceColor(portfolioSummary.totalChange)}`}>
                    {formatCurrency(Math.abs(portfolioSummary.totalChange))}
                  </p>
                  <Chip
                    variant="flat"
                    color={portfolioSummary.totalChange >= 0 ? 'success' : 'danger'}
                    startContent={portfolioSummary.totalChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  >
                    {formatPercentage(portfolioSummary.totalChangePercent)}
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-default-500" />
                  <p className="text-sm text-default-500">Active Wallets</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold">{portfolioSummary.activeWallets}</p>
                  <p className="text-default-500">of {portfolioSummary.walletsCount}</p>
                  <Progress 
                    value={(portfolioSummary.activeWallets / portfolioSummary.walletsCount) * 100}
                    className="flex-1 max-w-[100px]"
                    color="primary"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Quick Actions</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="h-4 w-4" />}
              onPress={onAddModalOpen}
              className="w-full justify-start"
            >
              Add New Wallet
            </Button>
            <Button
              variant="flat"
              size="sm"
              startContent={<RefreshCw className={`h-4 w-4 ${syncingCount > 0 ? 'animate-spin' : ''}`} />}
              onPress={() => syncAllWallets()}
              isLoading={syncingCount > 0}
              className="w-full justify-start"
            >
              Sync All Wallets
            </Button>
            <Button
              variant="flat"
              size="sm"
              startContent={<Download className="h-4 w-4" />}
              className="w-full justify-start"
            >
              Export Data
            </Button>
            {selectedWalletIds.length > 0 && (
              <Button
                variant="flat"
                color="secondary"
                size="sm"
                startContent={<Target className="h-4 w-4" />}
                onPress={onBulkModalOpen}
                className="w-full justify-start"
              >
                Bulk Actions ({selectedWalletIds.length})
              </Button>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center flex-1">
              <Input
                placeholder="Search wallets..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="h-4 w-4" />}
                className="max-w-xs"
                size="sm"
              />
              
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    size="sm"
                    startContent={<Filter className="h-4 w-4" />}
                    endContent={<ChevronDown className="h-4 w-4" />}
                  >
                    Status: {filterStatus === 'all' ? 'All' : filterStatus}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  selectedKeys={[filterStatus]}
                  onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0] as string)}
                >
                  <DropdownItem key="all">All Wallets</DropdownItem>
                  <DropdownItem key="synced">Synced</DropdownItem>
                  <DropdownItem key="syncing">Syncing</DropdownItem>
                  <DropdownItem key="error">Error</DropdownItem>
                  <DropdownItem key="pending">Pending</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    size="sm"
                    endContent={<ChevronDown className="h-4 w-4" />}
                  >
                    Sort: {sortBy} {sortOrder === 'desc' ? '↓' : '↑'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="value" onPress={() => setSortBy('value')}>
                    Portfolio Value
                  </DropdownItem>
                  <DropdownItem key="change" onPress={() => setSortBy('change')}>
                    24h Change
                  </DropdownItem>
                  <DropdownItem key="name" onPress={() => setSortBy('name')}>
                    Name
                  </DropdownItem>
                  <DropdownItem key="added" onPress={() => setSortBy('added')}>
                    Date Added
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="flat"
                size="sm"
                onPress={selectAll}
                startContent={selectedWalletIds.length === filteredWallets.length ? 
                  <CheckCircle className="h-4 w-4" /> : 
                  <Circle className="h-4 w-4" />
                }
              >
                {selectedWalletIds.length === filteredWallets.length ? 'Deselect' : 'Select'} All
              </Button>
              
              <Tabs
                selectedKey={viewMode}
                onSelectionChange={(key) => setViewMode(key as 'grid' | 'list')}
                size="sm"
                variant="light"
              >
                <Tab key="grid" title={<LayoutGrid className="h-4 w-4" />} />
                <Tab key="list" title={<List className="h-4 w-4" />} />
              </Tabs>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Wallets Grid/List */}
      <AnimatePresence mode="wait">
        {filteredWallets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardBody className="flex items-center justify-center h-32">
                <div className="text-center space-y-2">
                  <Search className="h-8 w-8 text-default-300 mx-auto" />
                  <p className="text-default-500">No wallets found matching your criteria</p>
                  <Button size="sm" variant="flat" onPress={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={viewMode === 'grid' ? 
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 
              'space-y-3'
            }
          >
            {filteredWallets.map((wallet, index) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                walletData={walletData[wallet.id]}
                isSelected={selectedWalletIds.includes(wallet.id)}
                onToggleSelect={() => {
                  setSelectedWalletIds(prev => 
                    prev.includes(wallet.id) 
                      ? prev.filter(id => id !== wallet.id)
                      : [...prev, wallet.id]
                  );
                }}
                onSync={() => syncWallet(wallet.id)}
                onRemove={() => removeWallet(wallet.id)}
                showBalances={showBalances}
                isLoading={isWalletSyncing(wallet.id)}
                viewMode={viewMode}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalOpenChange}
        onAdd={addWallet}
      />

      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onOpenChange={onBulkModalOpenChange}
        selectedCount={selectedWalletIds.length}
        onAction={handleBulkAction}
      />
    </div>
  );
};

// Wallet Card Component
const WalletCard = ({ 
  wallet, 
  walletData,
  isSelected, 
  onToggleSelect,
  onSync, 
  onRemove, 
  showBalances, 
  isLoading,
  viewMode,
  delay = 0
}: {
  wallet: any;
  walletData: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSync: () => void;
  onRemove: () => void;
  showBalances: boolean;
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  delay?: number;
}) => {
  const value = walletData?.portfolio?.totalValue || 0;
  const change = walletData?.portfolio?.dayChange || 0;
  const changePercent = walletData?.portfolio?.dayChangePercent || 0;
  const positionsCount = walletData?.metadata?.positionsCount || 0;
  const chainsCount = walletData?.metadata?.chainsCount || 0;

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success('Address copied to clipboard');
  };

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${wallet.address}`, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-danger" />;
      default: return <Clock className="h-4 w-4 text-default-400" />;
    }
  };

  const getPerformanceIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="h-4 w-4 text-success" />;
    if (change < -5) return <TrendingDown className="h-4 w-4 text-danger" />;
    return null;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
      >
        <Card className={`transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary border-primary' : ''
        }`}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={onToggleSelect}
                  className="rounded border-default-300 text-primary focus:ring-primary"
                />
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      size="md"
                      name={wallet.address.slice(2, 4).toUpperCase()}
                      className="bg-gradient-to-br from-primary to-secondary text-white"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIcon(wallet.sync_status)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{wallet.name}</h3>
                      {getPerformanceIcon(changePercent)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-default-500">
                      <code className="bg-default-100 px-2 py-1 rounded text-xs">
                        {truncateAddress(wallet.address)}
                      </code>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={copyAddress}
                        className="h-6 w-6 min-w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={openEtherscan}
                        className="h-6 w-6 min-w-6"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-semibold">
                    {showBalances ? `${value.toLocaleString()}` : '••••••'}
                  </p>
                  <p className={`text-sm ${changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                    {showBalances ? `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%` : '•••%'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-default-500">
                  <div className="text-center">
                    <p>{positionsCount}</p>
                    <p className="text-xs">Positions</p>
                  </div>
                  <div className="text-center">
                    <p>{chainsCount}</p>
                    <p className="text-xs">Chains</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={onSync}
                    isLoading={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                        View Details
                      </DropdownItem>
                      <DropdownItem key="edit" startContent={<Settings className="h-4 w-4" />}>
                        Edit Name
                      </DropdownItem>
                      <DropdownItem 
                        key="delete" 
                        className="text-danger" 
                        color="danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                        onPress={onRemove}
                      >
                        Remove Wallet
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${isLoading ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="rounded border-default-300 text-primary focus:ring-primary"
              />
              <div className="relative">
                <Avatar
                  size="sm"
                  name={wallet.address.slice(2, 4).toUpperCase()}
                  className="bg-gradient-to-br from-primary to-secondary text-white"
                />
                <Badge
                  content=""
                  color={wallet.sync_status === 'success' ? 'success' : 
                         wallet.sync_status === 'error' ? 'danger' : 'warning'}
                  placement="bottom-right"
                  size="sm"
                />
              </div>
            </div>
            
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="sync" startContent={<RefreshCw className="h-4 w-4" />} onPress={onSync}>
                  Sync Now
                </DropdownItem>
                <DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
                  View Details
                </DropdownItem>
                <DropdownItem key="copy" startContent={<Copy className="h-4 w-4" />} onPress={copyAddress}>
                  Copy Address
                </DropdownItem>
                <DropdownItem key="etherscan" startContent={<ExternalLink className="h-4 w-4" />} onPress={openEtherscan}>
                  View on Etherscan
                </DropdownItem>
                <DropdownItem 
                  key="delete" 
                  className="text-danger" 
                  color="danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={onRemove}
                >
                  Remove
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold truncate">{wallet.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-default-100 px-2 py-1 rounded font-mono">
                  {truncateAddress(wallet.address)}
                </code>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={copyAddress}
                  className="h-5 w-5 min-w-5"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {walletData ? (
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-bold">
                    {showBalances ? `${value.toLocaleString()}` : '••••••'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={changePercent >= 0 ? 'success' : 'danger'}
                      startContent={changePercent >= 0 ? 
                        <TrendingUp className="h-3 w-3" /> : 
                        <TrendingDown className="h-3 w-3" />
                      }
                    >
                      {showBalances ? `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%` : '•••%'}
                    </Chip>
                    {getPerformanceIcon(changePercent)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-default-400" />
                    <span>{positionsCount} positions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-default-400" />
                    <span>{chainsCount} chains</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-default-500">
                  <span>Last sync: {wallet.last_sync_at ? 
                    new Date(wallet.last_sync_at).toLocaleDateString() : 'Never'
                  }</span>
                  <Chip
                    size="sm"
                    variant="dot"
                    color={getStatusColor(wallet.sync_status)}
                  >
                    {wallet.sync_status}
                  </Chip>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-6 bg-default-100 rounded animate-pulse" />
                <div className="h-4 bg-default-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-default-100 rounded animate-pulse w-1/2" />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
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
        setError('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              Add New Wallet
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Wallet Address"
                  placeholder="0x742d35Cc6634C0532925a3b8D7C9b6f67C7e3Dd9"
                  value={address}
                  onValueChange={setAddress}
                  isRequired
                  startContent={<Wallet className="h-4 w-4 text-default-400" />}
                  description="Enter a valid Ethereum wallet address (0x...)"
                  className="font-mono"
                />
                <Input
                  label="Wallet Name (Optional)"
                  placeholder="My Main Wallet"
                  value={name}
                  onValueChange={setName}
                  startContent={<Award className="h-4 w-4 text-default-400" />}
                  description="Give your wallet a memorable name"
                />
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-50 border border-danger-200 dark:bg-danger-950/20 dark:border-danger-900/50">
                    <AlertTriangle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                    <p className="text-sm text-danger">{error}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 dark:bg-primary-950/20 dark:border-primary-900/50">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm text-primary">
                      <p className="font-medium">What happens next?</p>
                      <ul className="mt-1 space-y-1 text-xs opacity-90">
                        <li>• We'll fetch your portfolio data from Zerion</li>
                        <li>• Your wallet will be synced automatically</li>
                        <li>• You can view detailed analytics and performance</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                startContent={!loading ? <Plus className="h-4 w-4" /> : undefined}
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

// Bulk Actions Modal
const BulkActionsModal = ({ isOpen, onOpenChange, selectedCount, onAction }: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAction: (action: string) => Promise<void>;
}) => {
  const [loading, setLoading] = useState('');

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onAction(action);
      onOpenChange(false);
    } finally {
      setLoading('');
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Bulk Actions ({selectedCount} wallets)
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <Button
                  variant="flat"
                  className="w-full justify-start"
                  startContent={<RefreshCw className="h-4 w-4" />}
                  onPress={() => handleAction('sync')}
                  isLoading={loading === 'sync'}
                >
                  Sync All Selected Wallets
                </Button>
                <Button
                  variant="flat"
                  color="danger"
                  className="w-full justify-start"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => handleAction('delete')}
                  isLoading={loading === 'delete'}
                >
                  Remove All Selected Wallets
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// Loading State
const WalletPageLoader = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="lg:col-span-3">
        <CardBody>
          <div className="space-y-4">
            <div className="h-8 bg-default-200 rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-default-100 rounded animate-pulse" />
              <div className="h-20 bg-default-100 rounded animate-pulse" />
              <div className="h-20 bg-default-100 rounded animate-pulse" />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <div className="space-y-3">
            <div className="h-4 bg-default-200 rounded animate-pulse" />
            <div className="h-8 bg-default-100 rounded animate-pulse" />
            <div className="h-8 bg-default-100 rounded animate-pulse" />
            <div className="h-8 bg-default-100 rounded animate-pulse" />
          </div>
        </CardBody>
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Card key={i}>
          <CardBody>
            <div className="space-y-3">
              <div className="h-6 bg-default-200 rounded animate-pulse" />
              <div className="h-4 bg-default-100 rounded animate-pulse w-3/4" />
              <div className="h-8 bg-default-100 rounded animate-pulse" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  </div>
);

// Empty State
const EmptyWalletsState = ({ onAddWallet }: { onAddWallet: () => void }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Card className="max-w-md mx-auto">
      <CardBody className="text-center space-y-6 p-8">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
          <Wallet className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">No wallets added yet</h3>
          <p className="text-default-500">
            Connect your crypto wallets to start tracking your portfolio performance and get detailed analytics.
          </p>
        </div>
        <div className="space-y-3">
          <Button 
            color="primary" 
            size="lg" 
            startContent={<Plus className="h-5 w-5" />} 
            onPress={() => {
              console.log('Empty state button clicked');
              onAddWallet();
            }}
            className="w-full"
          >
            Add Your First Wallet
          </Button>
          <p className="text-xs text-default-400">
            We support Ethereum and all major EVM-compatible chains
          </p>
        </div>
      </CardBody>
    </Card>
  </div>
);

// Helper components for missing icons
const Circle = ({ className }: { className?: string }) => (
  <div className={`rounded-full border-2 border-current ${className}`} style={{ width: '1em', height: '1em' }} />
);

const LayoutGrid = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const List = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

export default WalletPage;