'use client'
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { useDisclosure } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Progress } from '@heroui/progress';
import { Tooltip } from '@heroui/tooltip';
import { Divider } from '@heroui/divider';
import { 
  Eye, 
  EyeOff,
  Plus, 
  RefreshCw, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  Activity,
  BarChart3,
  Globe,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  SortAsc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useWalletAnalytics, usePortfolioOverview } from '@/lib/hooks/useWalletAnalytics';
import { useUIStore } from '@/stores/ui';
import AddWalletModal from '@/components/wallets/AddWalletModal';
import WalletDetails from '@/components/wallets/WalletDetails';
import WalletCard from '@/components/wallets/WalletCard';
import WalletPageLoader from '@/components/wallets/WalletPageLoader';
import EmptyState from '@/components/wallets/EmptyState';
import PortfolioOverview from '@/components/wallets/PortfolioOverviewCards';


// Left Panel - Wallets List
const WalletsList = ({ 
  wallets, 
  walletData, 
  selectedWallet, 
  onSelectWallet, 
  showBalances, 
  searchQuery, 
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortBy, 
  onSortChange,
  onSyncWallet,
  onRemoveWallet,
  isWalletSyncing
}) => {
  const formatValue = (value) => showBalances ? `$${value?.toLocaleString() || '0'}` : '••••••';
  const formatPercent = (value) => {
    if (!showBalances) return '••%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value?.toFixed(2) || '0'}%`;
  };

  const filteredWallets = useMemo(() => {
    let filtered = wallets.filter(wallet => {
      const matchesSearch = !searchQuery || 
        wallet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || wallet.sync_status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      const aData = walletData[a.id];
      const bData = walletData[b.id];
      
      switch (sortBy) {
        case 'value':
          return (bData?.portfolio?.totalValue || 0) - (aData?.portfolio?.totalValue || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'change':
          return (bData?.portfolio?.totalChange || 0) - (aData?.portfolio?.totalChange || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [wallets, walletData, searchQuery, filterStatus, sortBy]);

  return (
    <Card className=" rounded-2xl flex flex-col p-4 h-fit border border-divider space-y-2">
        {/* Enhanced Header */}
        <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className=""
      >
        {/* Search Bar */}
        <div className="mb-1">
          <Input
          variant='faded'
            placeholder="Search wallets by name or address..."
            value={searchQuery}
            onValueChange={onSearchChange}
            startContent={<Search className="w-4 h-4 text-default-400" />}
            classNames={{
            
            }}
            isClearable
            size="md"
          />
        </div>
   
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Dropdown classNames={{
              content:'max-w-fit text-xs',
            }}>
              <DropdownTrigger>
                <Button 
                  size="sm" 
                  variant="faded" 
                  startContent={<Filter className="w-3.5 h-3.5 text-default-600" />}
                  endContent={<ChevronDown className="w-3.5 h-3.5 text-default-600" />}
                  className=" text-default-600"
                >
                  {filterStatus === 'all' ? 'All' : filterStatus}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[filterStatus]}
                onSelectionChange={(keys) => onFilterChange(Array.from(keys)[0])}
                
              >
                <DropdownItem key="all">All Status</DropdownItem>
                <DropdownItem key="success" startContent={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}>
                  Synced
                </DropdownItem>
                <DropdownItem key="syncing" startContent={<RefreshCw className="w-3.5 h-3.5 text-warning" />}>
                  Syncing
                </DropdownItem>
                <DropdownItem key="error" startContent={<AlertCircle className="w-3.5 h-3.5 text-danger" />}>
                  Error
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
   
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  size="sm" 
                  variant="faded" 
                  startContent={<SortAsc className="w-3.5 h-3.5" />}
                  endContent={<ChevronDown className="w-3.5 h-3.5" />}
                  className="text-default-600"
                >
                  Sort
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => onSortChange(Array.from(keys)[0])}
                className="min-w-36"
              >
                <DropdownItem key="value" startContent={<TrendingUp className="w-3.5 h-3.5" />}>
                  Portfolio Value
                </DropdownItem>
                <DropdownItem key="name" startContent={<Wallet className="w-3.5 h-3.5" />}>
                  Name
                </DropdownItem>
                <DropdownItem key="change" startContent={<TrendingUp className="w-3.5 h-3.5" />}>
                  Change %
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
   
          <div className="text-xs text-default-500 font-medium">
            {filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''}
          </div>
        </div>
      </motion.div>
      {/* Wallets List */}
      <div className="flex-1 space-y-2">
        <AnimatePresence>
          {filteredWallets.map((wallet, index) => {
            const data = walletData[wallet.id];
            const isSelected = selectedWallet?.id === wallet.id;
            const isSyncing = isWalletSyncing(wallet.id);

            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <WalletCard
                  wallet={wallet}
                  data={data}
                  isSelected={isSelected}
                  isSyncing={isSyncing}
                  showBalances={showBalances}
                  onSelect={onSelectWallet}
                  onSync={onSyncWallet}
                  onRemove={onRemoveWallet}
              
                />
            
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredWallets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <Search className="w-12 h-12 text-default-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No wallets found</h3>
            <p className="text-default-600 text-sm mb-4">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Right Panel - Wallet Details Container
const WalletDetailsPanel = ({ wallet, data, showBalances, onRefresh, isRefreshing }) => {
  // Format helper functions
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
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value || 0).toFixed(2)}%`;
  };

  if (!wallet) {
    return (
      <div className=" flex items-center justify-center text-center p-8">
        <div>
          <Wallet className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a wallet</h3>
          <p className="text-default-600">Choose a wallet from the list to view its details</p>
        </div>
      </div>
    );
  }

  return (
    <WalletDetails
      wallet={wallet}
      data={data}
      showBalances={showBalances}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      formatCurrency={formatCurrency}
      formatPercentage={formatPercentage}
    />
  );
};

// Main Wallets Page Component
export default function WalletsPage() {
  const [showBalances, setShowBalances] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onOpenChange: onAddModalOpenChange } = useDisclosure();
  const { addNotification } = useUIStore();

  const {
    wallets,
    loading,
    error,
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    isWalletSyncing,
    syncing,


    walletData
  } = useWalletAnalytics();

  const { portfolioSummary } = usePortfolioOverview();

  

  // Format helper functions
  const formatCurrency = useCallback((value) => {
    if (!showBalances) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }, [showBalances]);

  const formatPercentage = useCallback((value) => {
    if (!showBalances) return '•••%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value || 0).toFixed(2)}%`;
  }, [showBalances]);

  // Handlers
  const handleSyncWallet = useCallback(async (walletId) => {
    try {
      await syncWallet(walletId);
      addNotification({
        type: 'success',
        title: 'Wallet Synced',
        message: 'Wallet data has been updated successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: error.message || 'Failed to sync wallet data.'
      });
    }
  }, [syncWallet, addNotification]);

  const handleSyncAll = useCallback(async () => {
    try {
      await syncAllWallets();
      addNotification({
        type: 'success',
        title: 'All Wallets Synced',
        message: 'All wallet data has been updated successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Some wallets failed to sync. Please try again.'
      });
    }
  }, [syncAllWallets, addNotification]);

  const handleRemoveWallet = useCallback(async (walletId) => {
    try {
      await removeWallet(walletId);
      if (selectedWallet?.id === walletId) {
        setSelectedWallet(null);
      }
      addNotification({
        type: 'success',
        title: 'Wallet Removed',
        message: 'Wallet has been removed from your portfolio.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Remove Failed',
        message: error.message || 'Failed to remove wallet.'
      });
    }
  }, [removeWallet, selectedWallet, addNotification]);

  const handleAddWallet = useCallback(async (address, name) => {
    try {
      const newWallet = await addWallet(address, name);
      if (newWallet) {
        setSelectedWallet(newWallet);
        addNotification({
          type: 'success',
          title: 'Wallet Added',
          message: 'Wallet has been added to your portfolio.'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Add Failed',
        message: error.message || 'Failed to add wallet.'
      });
      throw error; // Re-throw so modal can handle it
    }
  }, [addWallet, addNotification]);

  // Loading state
  if (loading ) {
    return <WalletPageLoader />;
  }

  // Empty state
  if (wallets?.length<0 && !loading) {
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
    <div className="space-y-4">
      {/* Portfolio Overview */}

      
     
      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-2 rounded-2xl border border-divider ">
        <div className="flex items-center gap-2">
    
           <PortfolioOverview
        summary={portfolioSummary}
        showBalances={showBalances}
        onRefreshAll={handleSyncAll}
        isRefreshing={syncing}
      />
     
        </div>

        <div className="flex items-center justify-center gap-2">
          <Tooltip content={showBalances ? 'Hide balances' : 'Show balances'}>
            <Button
             variant="faded"
             size='sm'
             radius='full'
              isIconOnly
            
              onPress={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </Tooltip>
          <Tooltip content={'Sync All'}>
          <Button
            variant="faded"
            size='sm'
            radius='full'
            startContent={<RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />}
            onPress={handleSyncAll}
           
            isIconOnly
          >
          
          </Button>  
           </Tooltip>

           <Button
            color="primary"
            size='sm'
            startContent={<Plus className="w-4 h-4" />}
            onPress={onAddModalOpen}
            className="bg-gradient-to-br from-primary-500 to-pink-500 h-8 rounded-none"
          >
            Add Wallet
          </Button>
        </div>
      </Card>

      {/* Split Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Left Panel - Wallets List */}
        <div className="lg:col-span-4 xl:col-span-4">
      
         
              <WalletsList
                wallets={wallets}
                walletData={walletData}
                selectedWallet={selectedWallet}
                onSelectWallet={setSelectedWallet}
                showBalances={showBalances}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onSyncWallet={handleSyncWallet}
                onRemoveWallet={handleRemoveWallet}
                isWalletSyncing={isWalletSyncing}
              />
         
        </div>

        {/* Right Panel - Wallet Details */}
        <div className="lg:col-span-8 xl:col-span-8">
    
              <WalletDetailsPanel
                wallet={selectedWallet}
                data={selectedWallet ? walletData[selectedWallet.id] : null}
                showBalances={showBalances}
                onRefresh={() => selectedWallet && handleSyncWallet(selectedWallet.id)}
                isRefreshing={selectedWallet ? isWalletSyncing(selectedWallet.id) : false}
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:w-96"
        >
          <Card className="border-l-4 border-l-danger bg-danger-50 dark:bg-danger-950">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-danger-700 dark:text-danger-300">
                    Error loading wallets
                  </p>
                  <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
                    {error}
                  </p>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}