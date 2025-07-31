// hooks/useWalletAnalytics.ts
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
  last_sync_data?: WalletData;
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

// Main hook for wallet analytics
export const useWalletAnalytics = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [walletData, setWalletData] = useState<Record<string, WalletData>>({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const zerionExtension = useMemo(() => new ZerionExtension(), []);

  // Load user wallets
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

      // Load cached data for each wallet
      const walletDataMap: Record<string, WalletData> = {};
      for (const wallet of data || []) {
        if (wallet.last_sync_data) {
          walletDataMap[wallet.id] = wallet.last_sync_data;
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
  const addWallet = useCallback(async (address: string, name?: string): Promise<UserWallet | null> => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error('Invalid wallet address format');
      }

      // Check if wallet already exists
      const existingWallet = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
      if (existingWallet) {
        throw new Error('Wallet already added');
      }

      const { data, error: dbError } = await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          address: address.toLowerCase(),
          name: name || `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
          chain_type: 'ethereum',
          wallet_type: 'external',
          is_active: true,
          metadata: {
            addedAt: new Date().toISOString(),
            source: 'manual'
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newWallet = data as UserWallet;
      setWallets(prev => [newWallet, ...prev]);

      // Auto-sync the new wallet
      await syncWallet(newWallet.id, { forceRefresh: true });

      toast.success('Wallet added successfully');
      return newWallet;

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, wallets]);

  // Remove wallet
  const removeWallet = useCallback(async (walletId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('id', walletId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      setWallets(prev => prev.filter(w => w.id !== walletId));
      setWalletData(prev => {
        const newData = { ...prev };
        delete newData[walletId];
        return newData;
      });

      if (selectedWallet?.id === walletId) {
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

  // Sync wallet data
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

      // Initialize Zerion connection (you'll need to store API key securely)
      const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY;
      if (!apiKey) {
        throw new Error('Zerion API key not configured');
      }

      await zerionExtension.connect({ apiKey });

      // Sync wallet data
      const syncResult = await zerionExtension.syncWallet(wallet.address, {
        includeTransactions: options.includeTransactions ?? true,
        includeNFTs: options.includeNFTs ?? true,
        includeChart: options.includeChart ?? true,
        chartPeriod: options.chartPeriod ?? 'day'
      });

      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Sync failed');
      }

      // Update wallet in database
      const { error: updateError } = await supabase
        .from('user_wallets')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_data: syncResult.data,
          sync_status: 'success',
          sync_error: null
        })
        .eq('id', walletId);

      if (updateError) throw updateError;

      // Create portfolio snapshot
      await supabase.rpc('create_portfolio_snapshot', { wallet_uuid: walletId });

      // Update local state
      setWallets(prev => prev.map(w => 
        w.id === walletId 
          ? { ...w, last_sync_at: new Date().toISOString(), sync_status: 'success', last_sync_data: syncResult.data }
          : w
      ));

      if (syncResult.data) {
        setWalletData(prev => ({ ...prev, [walletId]: syncResult.data! }));
      }

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

  // Get aggregated portfolio data
  const getAggregatedPortfolio = useCallback((): {
    totalValue: number;
    totalChange: number;
    totalChangePercent: number;
    totalPositions: number;
    totalChains: number;
  } => {
    const aggregated = wallets.reduce((acc, wallet) => {
      const data = walletData[wallet.id];
      if (!data) return acc;

      acc.totalValue += data.portfolio.totalValue || 0;
      acc.totalChange += data.portfolio.dayChange || 0;
      acc.totalPositions += data.metadata.positionsCount || 0;

      // Count unique chains across all wallets
      data.portfolio.chains.forEach(chain => acc.chains.add(chain));

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
      // Get historical performance data
      const { data: snapshots, error } = await supabase
        .from('portfolio_snapshots')
        .select('total_value, snapshot_date')
        .eq('wallet_id', walletId)
        .order('snapshot_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      const avg30DValue = snapshots?.length 
        ? snapshots.reduce((sum, s) => sum + (Number(s.total_value) || 0), 0) / snapshots.length
        : 0;

      const oldestSnapshot = snapshots?.[snapshots.length - 1];
      const currentValue = data.portfolio.totalValue || 0;
      const oldValue = Number(oldestSnapshot?.total_value) || currentValue;
      
      const totalReturn = currentValue - oldValue;
      const totalReturnPercent = oldValue > 0 ? (totalReturn / oldValue) * 100 : 0;

      let rating: 'excellent' | 'good' | 'neutral' | 'poor' = 'neutral';
      if (totalReturnPercent > 20) rating = 'excellent';
      else if (totalReturnPercent > 5) rating = 'good';
      else if (totalReturnPercent < -10) rating = 'poor';

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
      console.error('Error getting wallet analytics:', err);
      return null;
    }
  }, [wallets, walletData]);

  // Initialize hook
  useEffect(() => {
    if (user?.id) {
      loadWallets();
    }
  }, [user?.id, loadWallets]);

  // Real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`wallet_updates_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_wallets',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setWallets(prev => prev.map(w => 
              w.id === payload.new.id ? payload.new as UserWallet : w
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    // State
    wallets,
    selectedWallet,
    walletData,
    loading,
    syncing,
    error,

    // Actions
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    setSelectedWallet,
    loadWallets,

    // Computed data
    getAggregatedPortfolio,
    getWalletAnalytics,

    // Utilities
    isWalletSyncing: (walletId: string) => syncing[walletId] || false,
    getWalletData: (walletId: string) => walletData[walletId] || null,
    hasWallets: wallets.length > 0,
    syncingCount: Object.values(syncing).filter(Boolean).length
  };
};

// Hook for individual wallet data
export const useWalletData = (walletId: string | null) => {
  const { wallets, walletData, syncWallet, isWalletSyncing, getWalletAnalytics } = useWalletAnalytics();
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
  }, [walletId, getWalletAnalytics]);

  return {
    wallet,
    data,
    analytics,
    loadingAnalytics,
    isLoading: isWalletSyncing(walletId || ''),
    refresh: () => walletId ? syncWallet(walletId, { forceRefresh: true }) : Promise.resolve(false)
  };
};

// Hook for portfolio overview
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
        value: walletData[wallet.id]?.portfolio.totalValue || 0
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