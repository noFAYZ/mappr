'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { useDisclosure } from '@heroui/modal';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Tooltip } from '@heroui/tooltip';
import { Divider } from '@heroui/divider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  MoreVertical,
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

import { useWalletAnalytics, usePortfolioOverview } from '@/lib/hooks/useWalletAnalytics';
import AddWalletModal from '@/components/wallets/AddWalletModal';
import WalletDetails from '@/components/wallets/WalletDetails';
import WalletCard from '@/components/wallets/WalletCard';
import WalletPageLoader from '@/components/wallets/WalletPageLoader';
import EmptyState from '@/components/wallets/EmptyState';
import PortfolioOverview from '@/components/wallets/PortfolioOverviewCards';
import { Spinner } from '@heroui/spinner';
import { SolarWalletBoldDuotone } from '@/components/icons/icons';

// Types
interface FilterOptions {
  status: 'all' | 'synced' | 'error' | 'pending';
  sortBy: 'name' | 'value' | 'lastSync' | 'created';
  sortOrder: 'asc' | 'desc';
}

// Portfolio Header Component
const PortfolioHeader: React.FC<{
  portfolioSummary: any;
  showBalances: boolean;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onToggleBalances: () => void;
  onAddWallet: () => void;
}> = ({
  portfolioSummary,
  showBalances,
  onRefreshAll,
  isRefreshing,
  onToggleBalances,
  onAddWallet
}) => {
  return (
    <Card className="border-none bg-transparent shadow-none ">
   
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Portfolio Overview */}
          <div className="flex-1">
            <PortfolioOverview
              summary={portfolioSummary}
              showBalances={showBalances}
              onRefreshAll={onRefreshAll}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Tooltip content={showBalances ? 'Hide balances' : 'Show balances'}>
              <Button
                variant="faded"
                size="sm"
                isIconOnly
                onPress={onToggleBalances}
                className="bg-background/50 backdrop-blur-sm rounded-full"
              >
                {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </Tooltip>

            <Tooltip content="Sync all wallets">
              <Button
                variant="faded"
                size="sm"
                isIconOnly
                onPress={onRefreshAll}
                isLoading={isRefreshing}
                className="bg-background/50 backdrop-blur-sm rounded-full"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>

            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
              onPress={onAddWallet}
              className="bg-gradient-to-r from-primary-500 to-pink-500 text-white"
            >
              Add Wallet
            </Button>
          </div>
        </div>
     
    </Card>
  );
};

// Filters Component
const WalletFilters: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  walletCount: number;
}> = ({ searchQuery, onSearchChange, filters, onFiltersChange, walletCount }) => {
  const statusOptions = [
    { key: 'all', label: 'All Wallets' },
    { key: 'synced', label: 'Synced' },
    { key: 'error', label: 'Error' },
    { key: 'pending', label: 'Pending' }
  ];

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value' },
    { key: 'lastSync', label: 'Last Sync' },
    { key: 'created', label: 'Date Added' }
  ];

  return (
   
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search wallets..."
              value={searchQuery}
              onValueChange={onSearchChange}
              startContent={<Search className="w-4 h-4 text-default-400 " />}
              variant="faded"
              size='md'
              className="w-full border-divider "
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="faded"
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
                  className="capitalize"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {statusOptions.find(opt => opt.key === filters.status)?.label}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[filters.status]}
                onSelectionChange={(keys) => 
                  onFiltersChange({ ...filters, status: Array.from(keys)[0] as any })
                }
              >
                {statusOptions.map(option => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Sort */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="faded"
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
                  className="capitalize"
                >
                  <SortAsc className="w-4 h-4 mr-1" />
                  {sortOptions.find(opt => opt.key === filters.sortBy)?.label}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[filters.sortBy]}
                onSelectionChange={(keys) => 
                  onFiltersChange({ ...filters, sortBy: Array.from(keys)[0] as any })
                }
              >
                {sortOptions.map(option => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Sort Order */}
            <Button
              variant="faded"
              size="sm"
              radius="full"
              isIconOnly
              onPress={() => 
                onFiltersChange({ 
                  ...filters, 
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                })
              }
              className="capitalize"
            >
              <TrendingUp className={`w-4 h-4 transition-transform ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>


    
  );
};

// Wallets List Component
const WalletsList: React.FC<{
  wallets: any[];
  selectedWallet: any;
  onSelectWallet: (wallet: any) => void;
  showBalances: boolean;
  onSyncWallet: (walletId: string) => void;
  onRemoveWallet: (walletId: string) => void;
  isWalletSyncing: (walletId: string) => boolean;
}> = ({
  wallets,
  selectedWallet,
  onSelectWallet,
  showBalances,
  onSyncWallet,
  onRemoveWallet,
  isWalletSyncing
}) => {
  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="w-12 h-12 text-default-300 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No wallets found</h3>
        <p className="text-default-500 text-sm">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <WalletCard
              wallet={wallet}
              data={ wallet?.wallet_portfolio_summary} // Data will be loaded when selected
              isSelected={selectedWallet?.id === wallet.id}
              isSyncing={isWalletSyncing(wallet.id)}
              showBalances={showBalances}
              onSelect={onSelectWallet}
              onSync={onSyncWallet}
              onRemove={onRemoveWallet}
              viewMode="list"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Wallet Details Panel Component
const WalletDetailsPanel: React.FC<{
  wallet: any;
  data: any;
  showBalances: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  isLoading?: boolean;
}> = ({ wallet, data, showBalances, onRefresh, isRefreshing, isLoading }) => {
  if (!wallet && !data) {
    return (
      <Card className="border-none bg-content1 h-full">
        <CardBody className="flex items-center justify-center p-12">
          <div className="text-center">
            <SolarWalletBoldDuotone className="w-16 h-16 text-default-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a wallet</h3>
            <p className="text-default-500">
              Choose a wallet from the list to view its details
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }


  

  return (
    <WalletDetails
      wallet={wallet}
      data={data}
      showBalances={showBalances}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      isLoading={isLoading}
      
    />
  );
};

// Main Wallets Page Component
export default function WalletsPage() {
  // State
  const [showBalances, setShowBalances] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    sortBy: 'lastSync',
    sortOrder: 'desc'
  });

  // Hooks
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onOpenChange: onAddModalOpenChange } = useDisclosure();
  
  const {
    wallets,
    selectedWallet,
    selectedWalletData,
    loading,
    loadingWallets,

    error,
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    isWalletSyncing,
    selectWallet
  } = useWalletAnalytics();

  const { portfolioSummary } = usePortfolioOverview();



  // Handlers
  const handleAddWallet = useCallback(async (address: string, name?: string): Promise<void> => {
    try {
      const success = await addWallet(address, name);
      if (success) {
        onAddModalOpenChange(false);
      }
    } catch (error) {
      throw error; // Let modal handle the error
    }
  }, [addWallet, onAddModalOpenChange]);

  const handleSyncWallet = useCallback(async (walletId: string): Promise<void> => {
    await syncWallet(walletId,{chartPeriod:'week'});
  }, [syncWallet]);

  const handleSyncAll = useCallback(async (): Promise<void> => {
    await syncAllWallets();
  }, [syncAllWallets]);

  const handleRemoveWallet = useCallback(async (walletId: string): Promise<void> => {
    await removeWallet(walletId);
  }, [removeWallet]);

  const handleSelectWallet = useCallback((wallet: any): void => {
    selectWallet(wallet);
  }, [selectWallet]);

  // Computed values
  const filteredAndSortedWallets = useMemo(() => {
    let filtered = wallets.filter(wallet => {
      // Search filter
      const matchesSearch = !searchQuery || 
        wallet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.address?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'all' || wallet.sync_status === filters.status;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name || a.address;
          bValue = b.name || b.address;
          break;
        case 'lastSync':
          aValue = a.last_sync_at ? new Date(a.last_sync_at).getTime() : 0;
          bValue = b.last_sync_at ? new Date(b.last_sync_at).getTime() : 0;
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return filters.sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [wallets, searchQuery, filters]);

  const isAnySyncing = useMemo(() => {
    return wallets.some(wallet => isWalletSyncing(wallet.id));
  }, [wallets, isWalletSyncing]);

  // Loading state
  if (loadingWallets ) {
    return <WalletPageLoader />;
  }

  // Empty state
  if (wallets.length === 0 && !loading) {
    return (
      <div className="p-6">
        <EmptyState onAddWallet={onAddModalOpen} />
        <AddWalletModal
          isOpen={isAddModalOpen}
          onOpenChange={onAddModalOpenChange}
          onAdd={handleAddWallet}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Header */}
      <PortfolioHeader
        portfolioSummary={portfolioSummary}
        showBalances={showBalances}
        onRefreshAll={handleSyncAll}
        isRefreshing={isAnySyncing}
        onToggleBalances={() => setShowBalances(!showBalances)}
        onAddWallet={onAddModalOpen}
      />

      {/* Filters
      <WalletFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        walletCount={filteredAndSortedWallets.length}
      /> */}

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-400px)]">
        {/* Left Panel - Wallets List */}
        <div className="lg:col-span-4 xl:col-span-4">
          <Card className="border-none bg-content1 ">
            <CardBody className="p-4">
              <WalletsList
                wallets={wallets}
                selectedWallet={selectedWalletData}
                onSelectWallet={handleSelectWallet}
                showBalances={showBalances}
                onSyncWallet={handleSyncWallet}
                onRemoveWallet={handleRemoveWallet}
                isWalletSyncing={isWalletSyncing}
              />
            </CardBody>
          </Card>
        </div>

        {/* Right Panel - Wallet Details */}
        <div className="lg:col-span-8 xl:col-span-8 ">
          <WalletDetailsPanel
            wallet={selectedWallet}
            data={selectedWalletData}
            showBalances={showBalances}
            onRefresh={() => selectedWallet && handleSyncWallet(selectedWallet.id)}
            isRefreshing={selectedWallet ? isWalletSyncing(selectedWallet.id) : false}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Add Wallet Modal */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onOpenChange={onAddModalOpenChange}
        onAdd={handleAddWallet}
      />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="border-danger bg-danger-50 dark:bg-danger-950">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-danger" />
                <div>
                  <p className="text-sm font-medium text-danger">Error</p>
                  <p className="text-xs text-danger-600">{error}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}