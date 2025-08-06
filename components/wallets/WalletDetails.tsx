'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Avatar } from '@heroui/avatar';
import { Progress } from '@heroui/progress';
import { Spinner } from '@heroui/spinner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Globe,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  ImageIcon,
  ExternalLink,
  Copy,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Hash,
  Send,
  Download,
  Upload as UploadIcon,
  Repeat,
  Star,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { TabKey } from '@/lib/wallet-analytics/types';
import type { WalletData, WalletPosition } from '@/lib/wallet-analytics/types';
import { WalletHeader } from './WalletDetails/WalletHeader';
import ModernTabs from './WalletDetails/ModernTabs';
import { TokensList } from './WalletDetails/TokensList';

interface WalletDetailsProps {
  wallet: {
    id: string;
    address: string;
    name?: string;
    chainType?: string;
    lastSyncAt?: string;
    syncStatus?: 'success' | 'syncing' | 'error' | 'pending';
  };
  data: WalletData | null;
  showBalances: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  isLoading?: boolean;
}

// Portfolio Performance Chart Component
const PortfolioChart = ({ 
  data, 
  timeframe = '30d', 
  showBalances 
}: { 
  data: any; 
  timeframe?: string; 
  showBalances: boolean; 
}) => {
  const chartData = data?.chart || data?.history || [];
  
  if (!showBalances) {
    return (
      <div className="h-64 flex items-center justify-center bg-default-50 dark:bg-default-900 rounded-lg">
        <div className="text-center">
          <EyeOff className="w-12 h-12 text-default-300 mx-auto mb-2" />
          <p className="text-default-500">Chart hidden for privacy</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center bg-default-50 dark:bg-default-900 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-default-300 mx-auto mb-2" />
          <p className="text-default-500">No chart data available</p>
          <p className="text-xs text-default-400 mt-1">Sync wallet to view performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 rounded-lg p-4">
      <div className="text-center text-default-500 mt-20">
        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
        <p>Interactive chart coming soon</p>
        <p className="text-xs mt-1">{chartData.length} data points available</p>
      </div>
    </div>
  );
};

// NFT Collection Component
const NFTCollection = ({ 
  nfts, 
  showBalances 
}: { 
  nfts: any; 
  showBalances: boolean; 
}) => {
  const nftData = nfts?.data || nfts?.items || [];
  
  if (!nftData.length) {
    return (
      <Card className="border-none">
        <CardBody className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No NFTs found</h3>
          <p className="text-default-500">This wallet doesn't own any NFTs</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-none">
      <CardBody className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nftData.slice(0, 12).map((nft: any, index: number) => (
            <motion.div
              key={nft.id || index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="border-none bg-content1">
                <CardBody className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-default-100 to-default-200 dark:from-default-800 dark:to-default-900 rounded-lg flex items-center justify-center">
                    {nft.content?.preview?.url ? (
                      <img
                        src={nft.content.preview.url}
                        alt={nft.content?.detail?.name || 'NFT'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-default-400" />
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">
                      {nft.content?.detail?.name || nft.name || 'Unnamed NFT'}
                    </h4>
                    <p className="text-xs text-default-500 truncate">
                      {nft.collection?.name || 'Unknown Collection'}
                    </p>
                    {showBalances && nft.value && (
                      <p className="text-xs font-medium text-primary-600 mt-1">
                        ${nft.value.toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
          
          {nftData.length > 12 && (
            <Card className="border-none bg-content1 flex items-center justify-center cursor-pointer hover:bg-content2 transition-colors">
              <CardBody className="p-4 text-center">
                <div className="aspect-square flex flex-col items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-500 mb-2" />
                  <p className="text-sm font-medium">+{nftData.length - 12} more</p>
                  <p className="text-xs text-default-500">View all NFTs</p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Transaction History Component
const TransactionHistory = ({ 
  transactions, 
  showBalances 
}: { 
  transactions: any[]; 
  showBalances: boolean; 
}) => {
  const [filter, setFilter] = useState('all');
  
  const filteredTransactions = useMemo(() => {
    if (!transactions?.length) return [];
    if (filter === 'all') return transactions.slice(0, 10);
    return transactions.filter(tx => tx.type === filter).slice(0, 10);
  }, [transactions, filter]);

  const getTransactionIcon = useCallback((type: string) => {
    switch (type) {
      case 'send': return <Send className="w-4 h-4 text-danger-500" />;
      case 'receive': return <Download className="w-4 h-4 text-success-500" />;
      case 'swap': return <Repeat className="w-4 h-4 text-warning-500" />;
      case 'approve': return <CheckCircle2 className="w-4 h-4 text-primary-500" />;
      default: return <Activity className="w-4 h-4 text-default-500" />;
    }
  }, []);

  const formatValue = useCallback((value: number) => 
    showBalances ? `$${value?.toLocaleString() || '0'}` : '••••••'
  , [showBalances]);

  if (!filteredTransactions.length) {
    return (
      <Card className="border-none">
        <CardBody className="text-center py-12">
          <Activity className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-default-500">Transaction history will appear here</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-none">
      <CardBody className="p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'send', 'receive', 'swap', 'approve'].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? 'solid' : 'flat'}
              color={filter === type ? 'primary' : 'default'}
              onPress={() => setFilter(type)}
              className="capitalize whitespace-nowrap"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="border-none bg-content1">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-default-100 dark:bg-default-800 rounded-lg">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">{tx.type || 'Transaction'}</h4>
                        <div className="flex items-center gap-2 text-sm text-default-500">
                          <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatValue(tx.value)}</p>
                      <p className="text-sm text-default-500 font-mono">
                        {tx.hash?.slice(0, 6)}...{tx.hash?.slice(-4)}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ 
  data, 
  showBalances 
}: { 
  data: any; 
  showBalances: boolean; 
}) => {
  return (
    <Card className="border-none">
      <CardBody className="p-4">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
          <p className="text-default-500">Detailed performance metrics coming soon</p>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Wallet Details Component
const WalletDetails: React.FC<WalletDetailsProps> = ({ 
  wallet, 
  data, 
  showBalances, 
  onRefresh, 
  isRefreshing = false,
  isLoading = false
}) => {
  // All hooks must be called consistently at the top level
  const [selectedTab, setSelectedTab] = useState<TabKey>('tokens');

  // Extract positions data - handle different data structures
  // This useMemo must ALWAYS be called, regardless of data state
  const positions = useMemo(() => {
    if (!data) return [];
    
    // Try different possible data structures
    if (Array.isArray(data.positions)) return data.positions;
    if (Array.isArray(data.data)) return data.data;
    if (data.portfolio?.positions && Array.isArray(data.portfolio.positions)) return data.portfolio.positions;
    if (data.lastSyncData?.positions && Array.isArray(data.lastSyncData.positions)) return data.lastSyncData.positions;
    
    console.warn('WalletDetails: Unable to extract positions from data structure:', data);
    return [];
  }, [data]);
  
  // Reset tab when wallet changes
  useEffect(() => {
    setSelectedTab('tokens');
  }, [wallet?.id]);

  // Enhanced refresh handler
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    try {
      await onRefresh();
      toast.success('Wallet data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh wallet data');
    }
  }, [onRefresh, isRefreshing]);

  console.log("Selected Tab:", data);

  return (
    <div className="space-y-6 h-full">
      {/* Portfolio Overview */}
      <WalletHeader 
      
        data={data}
        address={wallet.address}
        showBalance={showBalances}
        onRefresh={handleRefresh}
        refreshing={isRefreshing || isLoading}
        isLoading={isLoading}
      />

      {/* Modern Tabbed Content */}
      <ModernTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        nftCount={data?.nftPortfolio?.length || 0}
        tokenCount={positions.length}
      >
        {selectedTab === 'tokens' && (
         <TokensList 
           walletId={wallet.id}
           positions={positions}
           showBalance={showBalances}
           isLoading={isLoading}
           isRefreshing={isRefreshing}
           onRefresh={handleRefresh}
         />
        )}

        {selectedTab === 'nfts' && (
          <NFTCollection 
            nfts={data?.nftPortfolio} 
            showBalances={showBalances} 
          />
        )}

        {selectedTab === 'transactions' && (
          <TransactionHistory 
            transactions={data?.transactions} 
            showBalances={showBalances} 
          />
        )}

        {selectedTab === 'analytics' && (
          <AnalyticsTab 
            data={data} 
            showBalances={showBalances} 
          />
        )}
      </ModernTabs>
    </div>
  );
};

export default WalletDetails;