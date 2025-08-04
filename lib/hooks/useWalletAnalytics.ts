// lib/hooks/useWalletAnalytics.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ZerionExtension, WalletService, WalletData } from '@/lib/extensions/crypto/zerion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../supabase';
import { 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  Wallet
} from 'lucide-react';

export interface UserWallet {
  id: string;
  user_id: string;
  address: string;
  name?: string;
  chain_type: string;
  wallet_type: string;
  is_active: boolean;
  is_primary: boolean;
  last_sync_at?: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  sync_error?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WalletAnalytics {
  wallet: UserWallet;
  data: WalletData;
  performance: {
    rating: 'excellent' | 'good' | 'neutral' | 'poor';
    avg30DValue: number;
    totalReturn: number;
    totalReturnPercent: number;
  };
}

export interface SyncOptions {
  includeTransactions?: boolean;
  includeNFTs?: boolean;
  includeChart?: boolean;
  chartPeriod?: 'hour' | 'day' | 'week' | 'month' | '3months' | 'year' | 'max';
  forceRefresh?: boolean;
}

// Enhanced toast utilities for wallet operations
const walletToast = {
  // Wallet connection success
  connected: (walletName: string, address: string) => {
    return toast.success('Wallet Connected Successfully', {
      description: `${walletName} has been added to your portfolio`,
      icon: CheckCircle,
      action: {
        label: 'Copy Address',
        onClick: () => {
          navigator.clipboard.writeText(address);
          toast.success('Address Copied', {
            description: 'Wallet address copied to clipboard',
            duration: 2000,
            icon: Copy
          });
        }
      }
    });
  },

  // Wallet sync success
  synced: (walletName: string, tokenCount: number, totalValue: number) => {
    return toast.success('Wallet Synced', {
      description: `${walletName} • ${tokenCount} tokens • $${totalValue.toLocaleString()}`,
      icon: RefreshCw,
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to wallet details or trigger callback
          console.log('Navigate to wallet details');
        }
      }
    });
  },

  // Wallet sync started
  syncStarted: (walletName: string) => {
    return toast.loading('Syncing Wallet Data', {
      description: `Fetching latest data for ${walletName}...`,
      icon: RefreshCw
    });
  },

  // Connection error
  connectionError: (walletName: string, error: string) => {
    return toast.error('Sync Failed', {
      description: `Unable to sync ${walletName}: ${error}`,
      icon: AlertCircle,
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: () => {
          // Retry sync logic will be passed from component
          console.log('Retry sync');
        }
      }
    });
  },

  // Wallet removed
  removed: (walletName: string) => {
    return toast.success('Wallet Removed', {
      description: `${walletName} has been removed from your portfolio`,
      icon: Trash2,
      duration: 4000
    });
  },

  // Portfolio overview
  portfolioUpdated: (walletsCount: number, totalValue: number, change: number) => {
    const changeIcon = change >= 0 ? TrendingUp : AlertCircle;
    const changeText = change >= 0 ? 'increased' : 'decreased';
    const changeColor = change >= 0 ? 'success' : 'error';
    
    return toast.info('Portfolio Updated', {
      description: `${walletsCount} wallets • $${totalValue.toLocaleString()} • ${changeText} ${Math.abs(change).toFixed(2)}%`,
      icon: Wallet,
      duration: 6000
    });
  },

  // All wallets synced
  allSynced: (successCount: number, totalCount: number, totalValue: number) => {
    if (successCount === totalCount) {
      return toast.success('All Wallets Synced', {
        description: `${totalCount} wallets updated • Portfolio value: $${totalValue.toLocaleString()}`,
        icon: CheckCircle,
        duration: 6000
      });
    } else {
      return toast.warning('Partial Sync Complete', {
        description: `${successCount}/${totalCount} wallets synced successfully`,
        icon: AlertCircle,
        duration: 8000,
        action: {
          label: 'View Issues',
          onClick: () => {
            console.log('Show sync issues');
          }
        }
      });
    }
  },

  // Rate limit warning
  rateLimited: () => {
    return toast.warning('Rate Limit Reached', {
      description: 'Please wait a moment before syncing again',
      icon: Clock,
      duration: 6000
    });
  },

  // Configuration error
  configError: (service: string) => {
    return toast.error('Configuration Error', {
      description: `${service} API key not configured. Please check your settings.`,
      icon: AlertCircle,
      duration: 10000,
      action: {
        label: 'Settings',
        onClick: () => {
          window.location.href = '/settings';
        }
      }
    });
  }
};

export const useWalletAnalytics = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [walletData, setWalletData] = useState<Record<string, WalletData>>({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const zerionExtension = useMemo(() => new ZerionExtension(), []);

  // Load user wallets and their data from normalized tables
  const loadWallets = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      setWallets(data || []);

      // Load wallet data from normalized tables for existing UI compatibility
      const walletDataMap: Record<string, WalletData> = {};
      
      for (const wallet of data || []) {
        try {
          const walletData = await WalletService.getWalletData(wallet.id);
          if (walletData) {
            walletDataMap[wallet.id] = walletData;
          }
        } catch (err) {
          console.error(`Error loading data for wallet ${wallet.id}:`, err);
          // Fallback to last_sync_data for backward compatibility
          if (wallet.last_sync_data) {
            walletDataMap[wallet.id] = wallet.last_sync_data;
          }
        }
      }
      
      setWalletData(walletDataMap);

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to Load Wallets', {
        description: 'Unable to fetch wallet data from database',
        icon: AlertCircle,
        duration: 6000,
        action: {
          label: 'Retry',
          onClick: () => loadWallets()
        }
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Add new wallet
  const addWallet = useCallback(async (address: string, name?: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const wallet = await WalletService.addWallet(user.id, address, name);
      setWallets(prev => [wallet, ...prev]);
      
      walletToast.connected(name || 'Wallet', address);
      return true;

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to Add Wallet', {
        description: err.message,
        icon: AlertCircle,
        duration: 8000,
        action: {
          label: 'Try Again',
          onClick: () => {
            // Component can handle retry logic
            console.log('Retry add wallet');
          }
        }
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Remove wallet
  const removeWallet = useCallback(async (walletId: string): Promise<boolean> => {
    if (!user?.id || !selectedWallet) return false;

    const walletToRemove = wallets.find(w => w.id === walletId);
    if (!walletToRemove) return false;

    try {
      setLoading(true);
      setError(null);

      await WalletService.removeWallet(user.id, walletId);
      
      setWallets(prev => prev.filter(w => w.id !== walletId));
      setWalletData(prev => {
        const { [walletId]: removed, ...rest } = prev;
        return rest;
      });
      
      if (selectedWallet.id === walletId) {
        setSelectedWallet(null);
      }

      walletToast.removed(walletToRemove.name || 'Wallet');
      return true;

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to Remove Wallet', {
        description: err.message,
        icon: AlertCircle,
        duration: 6000,
        action: {
          label: 'Try Again',
          onClick: () => removeWallet(walletId)
        }
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedWallet, wallets]);

  // Sync wallet data with improved error handling and toast notifications
  const syncWallet = useCallback(async (
    walletId: string, 
    options: SyncOptions = {}
  ): Promise<boolean> => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return false;

    let loadingToastId: string | number | undefined;

    try {
      setSyncing(prev => ({ ...prev, [walletId]: true }));
      setError(null);

      // Show loading toast
      loadingToastId = walletToast.syncStarted(wallet.name || 'Wallet');

      // Update wallet status to syncing
      await supabase
        .from('user_wallets')
        .update({ sync_status: 'syncing' })
        .eq('id', walletId);

      // Initialize Zerion connection
      const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY;
      if (!apiKey) {
        toast.dismiss(loadingToastId);
        walletToast.configError('Zerion');
        throw new Error('Zerion API key not configured');
      }

      await zerionExtension.connect({ apiKey });

      // Sync wallet data
      const syncResult = await zerionExtension.syncWallet(wallet.address, {
        includeTransactions: options.includeTransactions ?? false,
        includeNFTs: options.includeNFTs ?? false,
        includeChart: options.includeChart ?? true,
        chartPeriod: options.chartPeriod ?? 'day',
        forceRefresh: options.forceRefresh ?? false
      });

      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Sync failed');
      }

      // Store data in normalized tables but also maintain compatibility
      if (syncResult.data) {
        await WalletService.updateWalletData(walletId, syncResult.data);
        
        // Update local state for immediate UI response
        setWalletData(prev => ({ ...prev, [walletId]: syncResult.data! }));
      }

      // Update wallet sync status
      setWallets(prev => prev.map(w => 
        w.id === walletId 
          ? { ...w, last_sync_at: new Date().toISOString(), sync_status: 'success', sync_error: null }
          : w
      ));

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      
      const tokenCount = syncResult.data?.positions?.length || 0;
      const totalValue = syncResult.data?.portfolio?.totalValue || 0;
      walletToast.synced(wallet.name || 'Wallet', tokenCount, totalValue);
      
      return true;

    } catch (err: any) {
      setError(err.message);
      
      // Dismiss loading toast
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      // Update wallet status to error
      await supabase
        .from('user_wallets')
        .update({ 
          sync_status: 'error',
          sync_error: err.message 
        })
        .eq('id', walletId);

      setWallets(prev => prev.map(w => 
        w.id === walletId 
          ? { ...w, sync_status: 'error', sync_error: err.message }
          : w
      ));

      // Show error toast with retry option
      toast.error('Sync Failed', {
        description: `${wallet.name || 'Wallet'}: ${err.message}`,
        icon: AlertCircle,
        duration: 8000,
        action: {
          label: 'Retry',
          onClick: () => syncWallet(walletId, options)
        }
      });

      return false;

    } finally {
      setSyncing(prev => ({ ...prev, [walletId]: false }));
    }
  }, [wallets, zerionExtension]);

  // Sync all wallets with comprehensive progress tracking
  const syncAllWallets = useCallback(async (options: SyncOptions = {}): Promise<void> => {
    if (wallets.length === 0) return;

    const loadingToastId = toast.loading('Syncing All Wallets', {
      description: `Processing ${wallets.length} wallets...`,
      icon: RefreshCw
    });

    try {
      const syncPromises = wallets.map(wallet => syncWallet(wallet.id, options));
      const results = await Promise.allSettled(syncPromises);
      
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      const totalValue = Object.values(walletData).reduce(
        (sum, data) => sum + (data?.portfolio?.totalValue || 0), 
        0
      );

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show completion summary
      walletToast.allSynced(successCount, wallets.length, totalValue);

    } catch (err: any) {
      toast.dismiss(loadingToastId);
      toast.error('Sync Failed', {
        description: 'An error occurred while syncing wallets',
        icon: AlertCircle,
        duration: 6000
      });
    }
  }, [wallets, syncWallet, walletData]);

  // Get aggregated portfolio data - maintain backward compatibility
  const getAggregatedPortfolio = useCallback((): {
    totalValue: number;
    totalChange: number;
    totalChangePercent: number;
    totalPositions: number;
    totalChains: number;
  } => {
    // Use existing walletData format for UI compatibility
    const aggregated = wallets.reduce((acc, wallet) => {
      const data = walletData[wallet.id];
      if (!data) return acc;

      acc.totalValue += data.portfolio?.totalValue || 0;
      acc.totalChange += data.portfolio?.dayChange || 0;
      acc.totalPositions += data.metadata?.positionsCount || 0;

      // Count unique chains across all wallets
      if (data.portfolio?.chains) {
        data.portfolio.chains.forEach(chain => acc.chains.add(chain));
      }

      return acc;
    }, {
      totalValue: 0,
      totalChange: 0,
      totalPositions: 0,
      chains: new Set<string>()
    });

    const totalChangePercent = aggregated.totalValue > 0 
      ? (aggregated.totalChange / (aggregated.totalValue - aggregated.totalChange)) * 100 
      : 0;

    return {
      totalValue: aggregated.totalValue,
      totalChange: aggregated.totalChange,
      totalChangePercent,
      totalPositions: aggregated.totalPositions,
      totalChains: aggregated.chains.size
    };
  }, [wallets, walletData]);

  // Get wallet analytics with performance metrics
  const getWalletAnalytics = useCallback(async (walletId: string): Promise<WalletAnalytics | null> => {
    const wallet = wallets.find(w => w.id === walletId);
    const data = walletData[walletId];
    
    if (!wallet || !data) return null;

    try {
      // Get historical chart data for performance calculation
      const { data: chartData, error } = await supabase
        .from('wallet_chart_data')
        .select('value, timestamp')
        .eq('wallet_id', walletId)
        .order('timestamp', { ascending: false })
        .limit(720); // 30 days of hourly data

      if (error) throw error;

      const avg30DValue = chartData?.length 
        ? chartData.reduce((sum, point) => sum + (point.value || 0), 0) / chartData.length
        : data.portfolio.totalValue;

      const oldestValue = chartData?.length ? chartData[chartData.length - 1]?.value || 0 : 0;
      const currentValue = data.portfolio.totalValue;
      const totalReturn = currentValue - oldestValue;
      const totalReturnPercent = oldestValue > 0 ? (totalReturn / oldestValue) * 100 : 0;

      // Calculate performance rating
      let rating: 'excellent' | 'good' | 'neutral' | 'poor' = 'neutral';
      if (totalReturnPercent > 20) rating = 'excellent';
      else if (totalReturnPercent > 5) rating = 'good';
      else if (totalReturnPercent < -20) rating = 'poor';

      return {
        wallet,
        data,
        performance: {
          rating,
          avg30DValue,
          totalReturn,
          totalReturnPercent
        }
      };

    } catch (err) {
      console.error('Error calculating wallet analytics:', err);
      return {
        wallet,
        data,
        performance: {
          rating: 'neutral',
          avg30DValue: data.portfolio.totalValue,
          totalReturn: 0,
          totalReturnPercent: 0
        }
      };
    }
  }, [wallets, walletData]);

  // Check if wallet is syncing
  const isWalletSyncing = useCallback((walletId: string): boolean => {
    return syncing[walletId] || false;
  }, [syncing]);

  // Load wallets on mount
  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  return {
    // State
    wallets,
    selectedWallet,
    walletData,
    loading,
    syncing,
    error,

    // Actions
    loadWallets,
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    setSelectedWallet,

    // Computed data
    getAggregatedPortfolio,
    getWalletAnalytics,
    isWalletSyncing,

    // Utils
    zerionExtension
  };
};

// Hook for individual wallet analytics
export const useWalletDetails = (walletId?: string) => {
  const { wallets, walletData, getWalletAnalytics, isWalletSyncing, syncWallet } = useWalletAnalytics();
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const wallet = useMemo(() => 
    walletId ? wallets.find(w => w.id === walletId) : null, 
    [wallets, walletId]
  );

  const data = useMemo(() => 
    walletId ? walletData[walletId] : null, 
    [walletData, walletId]
  );

  // Load analytics when wallet changes
  useEffect(() => {
    if (!walletId) {
      setAnalytics(null);
      return;
    }

    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const analyticsData = await getWalletAnalytics(walletId);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error loading analytics:', err);
        toast.error('Analytics Error', {
          description: 'Unable to load wallet analytics',
          icon: AlertCircle,
          duration: 4000
        });
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [walletId, getWalletAnalytics, data]); // Include data to refresh when wallet data changes

  const refresh = useCallback(async (): Promise<boolean> => {
    if (!walletId) return false;
    
    const result = await syncWallet(walletId, { forceRefresh: true });
    if (result && wallet) {
      // Show refresh success toast
      toast.success('Wallet Refreshed', {
        description: `${wallet.name || 'Wallet'} data updated successfully`,
        icon: RefreshCw,
        duration: 3000
      });
    }
    return result;
  }, [walletId, syncWallet, wallet]);

  return {
    wallet,
    data,
    analytics,
    loadingAnalytics,
    isLoading: isWalletSyncing(walletId || ''),
    refresh
  };
};

// Hook for portfolio overview - updated to work with existing UI
export const usePortfolioOverview = () => {
  const { wallets, walletData, getAggregatedPortfolio } = useWalletAnalytics();
  
  const portfolioSummary = useMemo(() => {
    const aggregated = getAggregatedPortfolio();
    
    return {
      ...aggregated,
      walletsCount: wallets.length,
      activeWallets: wallets.filter(w => w.sync_status === 'success').length,
      lastSyncTime: wallets.reduce((latest, wallet) => {
        const syncTime = wallet.last_sync_at ? new Date(wallet.last_sync_at).getTime() : 0;
        return Math.max(latest, syncTime);
      }, 0)
    };
  }, [wallets, getAggregatedPortfolio]);

  const topWallets = useMemo(() => {
    return wallets
      .map(wallet => ({
        wallet,
        data: walletData[wallet.id],
        value: walletData[wallet.id]?.portfolio?.totalValue || 0
      }))
      .filter(item => item.data)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [wallets, walletData]);

  return {
    portfolioSummary,
    topWallets,
    hasData: wallets.some(w => walletData[w.id])
  };
};