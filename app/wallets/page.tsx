'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { 
  Eye, 
  EyeOff,
  Plus, 
  RefreshCw, 
  Search,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Coins,
  Clock,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { useWalletAnalytics, usePortfolioOverview } from '@/lib/hooks/useWalletAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AddWalletModal from '@/components/wallets/AddWalletModal';
import WalletDetails from '@/components/wallets/WalletDetails';
import WalletPageLoader from '@/components/wallets/WalletPageLoader';
import EmptyState from '@/components/wallets/EmptyState';
import WalletCard from '@/components/wallets/WalletCard';

export default function WalletsPage() {
  const [showBalances, setShowBalances] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedWalletIds, setSelectedWalletIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [viewMode, setViewMode] = useState('grid');
  
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
    hasWallets,
    walletData
  } = useWalletAnalytics();

  const { portfolioSummary } = usePortfolioOverview();

  // Filtered and sorted wallets
  const filteredWallets = useMemo(() => {
    let filtered = wallets.filter(wallet => {
      const matchesSearch = !searchQuery || 
        wallet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || wallet.sync_status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aData = walletData[a.id];
      const bData = walletData[b.id];
      
      switch (sortBy) {
        case 'value':
          const aValue = aData?.portfolio?.totalValue || 0;
          const bValue = bData?.portfolio?.totalValue || 0;
          return bValue - aValue;
        case 'change':
          const aChange = aData?.portfolio?.dayChange || 0;
          const bChange = bData?.portfolio?.dayChange || 0;
          return bChange - aChange;
        case 'name':
          return (a.name || a.address).localeCompare(b.name || b.address);
        case 'added':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [wallets, searchQuery, filterStatus, sortBy, walletData]);

  const formatCurrency = (value) => {
    if (!showBalances) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    if (!showBalances) return '•••%';
    return `${value >= 0 ? '+' : ''}${(value || 0).toFixed(2)}%`;
  };

  const handleBulkAction = async (action) => {
    if (selectedWalletIds.length === 0) {
      toast.error('Please select wallets first');
      return;
    }

    switch (action) {
      case 'sync':
        toast.promise(
          Promise.all(selectedWalletIds.map(id => syncWallet(id))),
          {
            loading: `Syncing ${selectedWalletIds.length} wallets...`,
            success: 'All wallets synced successfully',
            error: 'Some wallets failed to sync'
          }
        );
        break;
      case 'delete':
        if (confirm(`Are you sure you want to remove ${selectedWalletIds.length} wallets?`)) {
          toast.promise(
            Promise.all(selectedWalletIds.map(id => removeWallet(id))),
            {
              loading: `Removing ${selectedWalletIds.length} wallets...`,
              success: 'Wallets removed successfully',
              error: 'Failed to remove some wallets'
            }
          );
          setSelectedWalletIds([]);
        }
        break;
    }
  };

  // If a wallet is selected, show wallet details
  if (selectedWallet) {
    return (
      <WalletDetails 
        wallet={selectedWallet} 
        onBack={() => setSelectedWallet(null)} 
        showBalances={showBalances}
        onToggleBalances={() => setShowBalances(!showBalances)}
        formatCurrency={formatCurrency}
        formatPercentage={formatPercentage}
      />
    );
  }

  // Show loading state
  if (loading && wallets.length === 0) {
    return <WalletPageLoader />;
  }

  // Show empty state only when not loading and no wallets
  if (!loading && wallets.length === 0) {
    return (
      <div className="p-6">
        <EmptyState onAddWallet={onAddModalOpen} />
        <AddWalletModal 
          isOpen={isAddModalOpen}
          onOpenChange={onAddModalOpenChange}
          onAdd={addWallet}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            Portfolio Wallets
          </h1>
          <p className="text-default-500">
            {portfolioSummary.walletsCount} wallets • {portfolioSummary.totalChains} chains • {portfolioSummary.totalPositions} positions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {syncingCount > 0 && (
            <Chip variant="flat" color="warning" startContent={<RefreshCw className="h-3 w-3 animate-spin" />}>
              Syncing {syncingCount} wallets
            </Chip>
          )}
          
          <Button
            variant="flat"
            startContent={showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            onPress={() => setShowBalances(!showBalances)}
          >
            {showBalances ? 'Hide' : 'Show'} Balances
          </Button>
          
          <Button
            color="primary"
            variant="flat"
            startContent={<RefreshCw className={`h-4 w-4 ${syncingCount > 0 ? 'animate-spin' : ''}`} />}
            onPress={() => syncAllWallets()}
            isDisabled={syncingCount > 0}
          >
            Sync All
          </Button>
          
          <Button
            color="success"
            startContent={<Plus className="h-4 w-4" />}
            onPress={onAddModalOpen}
          >
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none bg-content1">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-default-500">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(portfolioSummary.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {portfolioSummary.totalChangePercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger" />
              )}
              <span className={`text-small font-medium ${portfolioSummary.totalChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPercentage(portfolioSummary.totalChangePercent)} (24h)
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-content1">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-default-500">Active Wallets</p>
                <p className="text-2xl font-bold text-foreground">
                  {portfolioSummary.activeWallets || portfolioSummary.walletsCount}
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
            <p className="mt-4 text-small text-default-500">
              Out of {portfolioSummary.walletsCount} total
            </p>
          </CardBody>
        </Card>

        <Card className="border-none bg-content1">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-default-500">Total Positions</p>
                <p className="text-2xl font-bold text-foreground">
                  {portfolioSummary.totalPositions}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Coins className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <p className="mt-4 text-small text-default-500">
              Across {portfolioSummary.totalChains} chains
            </p>
          </CardBody>
        </Card>

        <Card className="border-none bg-content1">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-default-500">Last Sync</p>
                <p className="text-lg font-bold text-foreground">
                  {portfolioSummary.lastSyncTime ? 
                    new Date(portfolioSummary.lastSyncTime).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="mt-4 text-small text-default-500">
              Portfolio sync status
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="border-none bg-content1">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <Input
              classNames={{
                base: "flex-1",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Search wallets by name or address..."
              size="sm"
              startContent={<Search className="h-4 w-4" />}
              type="search"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            
            {/* Filters */}
            <div className="flex gap-2 items-center">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" size="sm" startContent={<Filter className="h-4 w-4" />}>
                    Status: {filterStatus === 'all' ? 'All' : filterStatus}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Filter by status"
                  selectedKeys={[filterStatus]}
                  onSelectionChange={(keys) => setFilterStatus(Array.from(keys)[0])}
                >
                  <DropdownItem key="all">All Status</DropdownItem>
                  <DropdownItem key="success">Active</DropdownItem>
                  <DropdownItem key="syncing">Syncing</DropdownItem>
                  <DropdownItem key="error">Error</DropdownItem>
                  <DropdownItem key="pending">Pending</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" size="sm">
                    Sort: {sortBy}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Sort wallets"
                  selectedKeys={[sortBy]}
                  onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
                >
                  <DropdownItem key="value">Sort by Value</DropdownItem>
                  <DropdownItem key="change">Sort by Change</DropdownItem>
                  <DropdownItem key="name">Sort by Name</DropdownItem>
                  <DropdownItem key="added">Sort by Date Added</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <div className="flex">
                <Button
                  isIconOnly
                  variant={viewMode === 'grid' ? 'solid' : 'flat'}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  size="sm"
                  onPress={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  variant={viewMode === 'list' ? 'solid' : 'flat'}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  size="sm"
                  onPress={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedWalletIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <Chip color="primary" size="sm">
                  {selectedWalletIds.length}
                </Chip>
                <span className="text-small text-primary font-medium">
                  wallet{selectedWalletIds.length > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<RefreshCw className="h-3 w-3" />}
                  onPress={() => handleBulkAction('sync')}
                >
                  Sync All
                </Button>
                
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 className="h-3 w-3" />}
                  onPress={() => handleBulkAction('delete')}
                >
                  Remove All
                </Button>
                
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  onPress={() => setSelectedWalletIds([])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Wallets Grid/List */}
      <AnimatePresence mode="wait">
        {filteredWallets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 text-default-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No wallets found</h3>
            <p className="text-default-500">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first wallet to get started'
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
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
                onSelect={() => setSelectedWallet(wallet)}
                onSync={() => syncWallet(wallet.id)}
                onRemove={() => removeWallet(wallet.id)}
                showBalances={showBalances}
                isLoading={isWalletSyncing(wallet.id)}
                formatCurrency={formatCurrency}
                formatPercentage={formatPercentage}
                viewMode={viewMode}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Wallet Modal */}
      <AddWalletModal 
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalOpenChange}
        onAdd={addWallet}
      />
    </div>
  );
};
