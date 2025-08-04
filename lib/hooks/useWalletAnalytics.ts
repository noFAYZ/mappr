// lib/hooks/useWalletAnalytics.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ZerionExtension, WalletService, WalletData } from '@/lib/extensions/crypto/zerion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../supabase';

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
      toast.error('Failed to load wallets');
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
      
      toast.success('Wallet added successfully');
      return true;

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to add wallet');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Remove wallet
  const removeWallet = useCallback(async (walletId: string): Promise<boolean> => {
    if (!user?.id || !selectedWallet) return false;

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

      toast.success('Wallet removed successfully');
      return true;

    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to remove wallet');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedWallet]);

  // Sync wallet data with improved error handling
  const syncWallet = useCallback(async (
    walletId: string, 
    options: SyncOptions = {}
  ): Promise<boolean> => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return false;

    try {
      setSyncing(prev => ({ ...prev, [walletId]: true }));
      setError(null);

      // Update wallet status to syncing
      await supabase
        .from('user_wallets')
        .update({ sync_status: 'syncing' })
        .eq('id', walletId);

      // Initialize Zerion connection
      const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY;
      if (!apiKey) {
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

      console.log(syncResult  ) 

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

      toast.success(`Wallet ${wallet.name} synced successfully`);
      return true;

    } catch (err: any) {
      setError(err.message);
      
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

      toast.error(`Failed to sync ${wallet.name}: ${err.message}`);
      return false;

    } finally {
      setSyncing(prev => ({ ...prev, [walletId]: false }));
    }
  }, [wallets, zerionExtension]);

  // Sync all wallets
  const syncAllWallets = useCallback(async (options: SyncOptions = {}): Promise<void> => {
    const syncPromises = wallets.map(wallet => syncWallet(wallet.id, options));
    await Promise.allSettled(syncPromises);
  }, [wallets, syncWallet]);

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
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [walletId, getWalletAnalytics, data]); // Include data to refresh when wallet data changes

  return {
    wallet,
    data,
    analytics,
    loadingAnalytics,
    isLoading: isWalletSyncing(walletId || ''),
    refresh: () => walletId ? syncWallet(walletId, { forceRefresh: true }) : Promise.resolve(false)
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