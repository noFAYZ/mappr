// lib/hooks/useWalletAnalytics.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toaster";
import { ZerionExtension, WalletService, WalletData } from "@/lib/extensions/crypto/zerion";

// ==================== CORE INTERFACES ====================
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
  sync_status: "pending" | "syncing" | "success" | "error";
  sync_error?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  wallet_portfolio_summary?: WalletPortfolioSummary;
}

export interface WalletPortfolioSummary {
  total_value: number;
  day_change: number;
  day_change_percent: number;
  positions_count: number;
  chains_count: number;
  nft_count: number;
  last_sync_at?: string;
  networks: string[];
}

export interface WalletAnalytics {
  wallet: UserWallet;
  data: WalletData;
  performance: {
    rating: "excellent" | "good" | "neutral" | "poor";
    avg30DValue: number;
    totalReturn: number;
    totalReturnPercent: number;
    sharpeRatio: number;
    volatility: number;
  };
}

export interface SyncOptions {
  includeTransactions?: boolean;
  includeNFTs?: boolean;
  includeChart?: boolean;
  chartPeriod?: "hour" | "day" | "week" | "month" | "3months" | "year" | "max";
  forceRefresh?: boolean;
  skipToast?: boolean; // Add flag to skip individual toast for bulk operations
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  change24h?: number;
  change7d?: number;
  change30d?: number;
  totalPositions: number;
  totalChains: number;
  walletsCount: number;
  activeWallets: number;
  lastSyncTime: number;
}

// ==================== ERROR HANDLING ====================
export class WalletAnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public walletId?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "WalletAnalyticsError";
  }
}

// ==================== CACHE MANAGER ====================
class WalletDataCache {
  private cache = new Map<string, { data: WalletData; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(walletId: string, data: WalletData, ttl = this.DEFAULT_TTL): void {
    this.cache.set(walletId, {
      data: { ...data },
      timestamp: Date.now(),
      ttl
    });
  }

  get(walletId: string): WalletData | null {
    const cached = this.cache.get(walletId);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(walletId);
      return null;
    }

    return cached.data;
  }

  invalidate(walletId?: string): void {
    if (walletId) {
      this.cache.delete(walletId);
    } else {
      this.cache.clear();
    }
  }

  has(walletId: string): boolean {
    const cached = this.cache.get(walletId);
    if (!cached) return false;
    return Date.now() - cached.timestamp <= cached.ttl;
  }
}

// ==================== PERFORMANCE CALCULATOR ====================
class PerformanceCalculator {
  static calculateWalletPerformance(data: WalletData): WalletAnalytics["performance"] {
    const chartData = data.chart || [];
    const currentValue = data.portfolio?.totalValue || 0;
    
    const defaultPerformance = {
      rating: "neutral" as const,
      avg30DValue: currentValue,
      totalReturn: 0,
      totalReturnPercent: 0,
      sharpeRatio: 0,
      volatility: 0
    };

    if (chartData.length < 2) return defaultPerformance;

    const values = chartData.map(point => point.close_value || point.value || 0);
    const oldestValue = values[values.length - 1] || 0;
    const totalReturn = currentValue - oldestValue;
    const totalReturnPercent = oldestValue > 0 ? (totalReturn / oldestValue) * 100 : 0;
    
    // Calculate volatility (standard deviation)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);
    
    // Simple Sharpe ratio approximation
    const sharpeRatio = volatility > 0 ? totalReturnPercent / volatility : 0;

    // Determine rating based on performance
    let rating: "excellent" | "good" | "neutral" | "poor" = "neutral";
    if (totalReturnPercent > 20) rating = "excellent";
    else if (totalReturnPercent > 5) rating = "good";
    else if (totalReturnPercent < -20) rating = "poor";

    return {
      rating,
      avg30DValue: mean,
      totalReturn,
      totalReturnPercent,
      sharpeRatio,
      volatility: (volatility / mean) * 100
    };
  }
}

// ==================== MAIN HOOK ====================
export const useWalletAnalytics = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // State Management
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [selectedWalletData, setSelectedWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<WalletAnalyticsError | null>(null);

  // Refs and Services
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new WalletDataCache());
  const zerionExtension = useMemo(() => new ZerionExtension(), []);

  // ==================== ERROR HANDLING ====================
  const handleError = useCallback((error: unknown, context: string, walletId?: string): WalletAnalyticsError => {
    let walletError: WalletAnalyticsError;

    if (error instanceof WalletAnalyticsError) {
      walletError = error;
    } else if (error instanceof Error) {
      walletError = new WalletAnalyticsError(
        `${context}: ${error.message}`,
        "OPERATION_FAILED",
        walletId,
        error
      );
    } else {
      walletError = new WalletAnalyticsError(
        `${context}: Unknown error occurred`,
        "UNKNOWN_ERROR",
        walletId
      );
    }

    console.error(`[WalletAnalytics] ${context}:`, walletError);
    setError(walletError);
    return walletError;
  }, []);

  // ==================== DATABASE OPERATIONS ====================
  const loadWallets = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setWallets([]);
      return;
    }

    try {
      setLoadingWallets(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from("user_wallets")
        .select(`
          *,
          wallet_portfolio_summary (
            total_value,
            day_change,
            day_change_percent,
            positions_count,
            chains_count,
            nft_count,
            last_sync_at
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (dbError) {
        throw new WalletAnalyticsError(
          "Failed to load wallets from database",
          "DATABASE_ERROR",
          undefined,
          dbError
        );
      }

      setWallets(data || []);
    } catch (error) {
      handleError(error, "Loading wallets");
      setWallets([]);
    } finally {
      setLoadingWallets(false);
    }
  }, [user?.id, handleError]);

  // ==================== WALLET DATA OPERATIONS ====================
  const loadWalletData = useCallback(async (
    walletId: string,
    options: SyncOptions = {}
  ): Promise<WalletData | null> => {
    let loadingToastId: string | null = null;

    try {
      // Check cache first unless force refresh
      if (!options.forceRefresh) {
        const cached = cacheRef.current.get(walletId);
        if (cached) return cached;
      }

      // Try to get existing data from database first
      const existingData = await WalletService.getWalletData(walletId);
      if (existingData && !options.forceRefresh) {
        cacheRef.current.set(walletId, existingData);
        return existingData;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        throw new WalletAnalyticsError(
          "Wallet not found",
          "WALLET_NOT_FOUND",
          walletId
        );
      }

      setSyncing(prev => ({ ...prev, [walletId]: true }));

      // Show loading toast
      loadingToastId = toast.loading("Syncing Wallet Data", {
        description: `Fetching latest data for ${wallet.name || wallet.address.slice(0, 8)}...`
      });

      // Initialize Zerion connection if not already connected
      const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY;
      
      if (!apiKey) {
        throw new WalletAnalyticsError(
          "Zerion API key not configured",
          "MISSING_API_KEY",
          walletId
        );
      }

      await zerionExtension.connect({ apiKey });

      // Sync wallet data using Zerion
      const syncResult = await zerionExtension.syncWallet(wallet.address, {
        includeTransactions: options.includeTransactions ?? true,
        includeNFTs: options.includeNFTs ?? false,
        includeChart: options.includeChart ?? true,
        chartPeriod: options.chartPeriod ?? "week",
        forceRefresh: options.forceRefresh ?? false
      });

      if (!syncResult.success) {
        throw new WalletAnalyticsError(
          syncResult.error || "Sync failed",
          "SYNC_FAILED",
          walletId
        );
      }

      if (!syncResult.data) {
        throw new WalletAnalyticsError(
          "No data received from provider",
          "NO_DATA",
          walletId
        );
      }

      // Store data in normalized database tables
      await WalletService.updateWalletData(walletId, syncResult.data);

      // Cache the result
      cacheRef.current.set(walletId, syncResult.data);

      // Update wallet sync status
      await supabase
        .from("user_wallets")
        .update({
          sync_status: "success",
          last_sync_at: new Date().toISOString(),
          sync_error: null
        })
        .eq("id", walletId);

      // Remove loading toast and show success
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
      }
      toast.success("Wallet Synced Successfully", {
        description: `Portfolio data updated for ${wallet.name || wallet.address.slice(0, 8)}`
      });

      return syncResult.data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (loadingToastId) {
          toast.removeToast(loadingToastId);
        }
        return null; // Request was cancelled
      }

      const walletError = handleError(error, "Loading wallet data", walletId);
      
      // Update wallet error status
      await supabase
        .from("user_wallets")
        .update({
          sync_status: "error",
          sync_error: walletError.message
        })
        .eq("id", walletId);

      // Remove loading toast and show error
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
      }
      toast.error("Wallet Sync Failed", {
        description: walletError.message
      });

      return null;
    } finally {
      setSyncing(prev => ({ ...prev, [walletId]: false }));
    }
  }, [wallets, zerionExtension, handleError, toast]);

  // ==================== WALLET MANAGEMENT ====================
  const addWallet = useCallback(async (
    address: string,
    name?: string,
    chainType: string = "evm"
  ): Promise<boolean> => {
    if (!user?.id) {
      throw new WalletAnalyticsError(
        "User not authenticated",
        "AUTH_ERROR"
      );
    }

    let loadingToastId: string | null = null;

    try {
      setLoading(true);
      setError(null);

      // Show loading toast
      loadingToastId = toast.loading("Adding Wallet", {
        description: `Adding ${address.slice(0, 8)}... to your portfolio`
      });

      // Validate address format
      if (!address || address.length < 20) {
        throw new WalletAnalyticsError(
          "Invalid wallet address format",
          "INVALID_ADDRESS"
        );
      }

      // Check for duplicates
      const existingWallet = wallets.find(w => 
        w.address.toLowerCase() === address.toLowerCase()
      );
      
      if (existingWallet) {
        throw new WalletAnalyticsError(
          "Wallet already exists",
          "DUPLICATE_WALLET"
        );
      }

      // Insert new wallet
      const { data, error: dbError } = await supabase
        .from("user_wallets")
        .insert({
          user_id: user.id,
          address: address.toLowerCase(),
          name: name?.trim() || null,
          chain_type: chainType,
          wallet_type: "external",
          is_active: true,
          is_primary: wallets.length === 0,
          sync_status: "pending",
          metadata: {}
        })
        .select()
        .single();

      if (dbError) {
        throw new WalletAnalyticsError(
          "Failed to save wallet",
          "DATABASE_ERROR",
          undefined,
          dbError
        );
      }

      // Remove loading toast and show success
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
      }
      toast.success("Wallet Added Successfully", {
        description: `${name || address.slice(0, 8)} has been added to your portfolio`
      });

      // Refresh wallets list
      await loadWallets();

      // Initial sync in background
      if (data?.id) {
        setTimeout(() => {
          loadWalletData(data.id, { forceRefresh: true }).catch(console.error);
        }, 100);
      }

      return true;
    } catch (error) {
      const walletError = handleError(error, "Adding wallet");
      
      // Remove loading toast and show error
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
      }
      toast.error("Failed to Add Wallet", {
        description: walletError.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, wallets, loadWallets, loadWalletData, handleError, toast]);

  const removeWallet = useCallback(async (walletId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        toast.error("Wallet Not Found", {
          description: "The wallet you're trying to remove was not found"
        });
        return false;
      }

      const { error: dbError } = await supabase
        .from("user_wallets")
        .update({ is_active: false })
        .eq("id", walletId);

      if (dbError) {
        throw new WalletAnalyticsError(
          "Failed to remove wallet",
          "DATABASE_ERROR",
          walletId,
          dbError
        );
      }

      // Clear cache and selected wallet if it's the removed one
      cacheRef.current.invalidate(walletId);
      if (selectedWallet?.id === walletId) {
        setSelectedWallet(null);
        setSelectedWalletData(null);
      }

      toast.success("Wallet Removed", {
        description: `${wallet.name || wallet.address.slice(0, 8)} has been removed from your portfolio`
      });

      await loadWallets();
      return true;
    } catch (error) {
      const walletError = handleError(error, "Removing wallet", walletId);
      toast.error("Failed to Remove Wallet", {
        description: walletError.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallets, selectedWallet?.id, loadWallets, handleError, toast]);

  // ==================== SYNC OPERATIONS ====================
  const syncWallet = useCallback(async (
    walletId: string,
    options: SyncOptions = {}
  ): Promise<boolean> => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return false;

    let loadingToastId: string | null = null;

    try {
      // Show loading toast for individual wallet sync (only if not called from syncAllWallets)
      if (!options.skipToast) {
        loadingToastId = toast.loading("Syncing Wallet", {
          description: `Syncing ${wallet.name || wallet.address.slice(0, 8)}...`
        });
      }

      const data = await loadWalletData(walletId, { ...options, forceRefresh: true });
      
      if (data) {
        // Remove loading toast and show success (only if we showed loading toast)
        if (loadingToastId) {
          toast.removeToast(loadingToastId);
          toast.success("Wallet Synced Successfully", {
            description: `Portfolio data updated for ${wallet.name || wallet.address.slice(0, 8)}`
          });
        }
        return true;
      }
      
      // Remove loading toast on failure
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
        toast.error("Wallet Sync Failed", {
          description: `Failed to sync ${wallet.name || wallet.address.slice(0, 8)}`
        });
      }
      
      return false;
    } catch (error) {
      // Remove loading toast and show error
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
        toast.error("Wallet Sync Failed", {
          description: `Failed to sync ${wallet.name || wallet.address.slice(0, 8)}`
        });
      }
      return false;
    }
  }, [wallets, loadWalletData, toast]);

  const syncAllWallets = useCallback(async (): Promise<void> => {
    const activeWallets = wallets.filter(w => w.is_active);
    
    if (activeWallets.length === 0) {
      toast.info("No Wallets to Sync", {
        description: "Add some wallets to your portfolio first"
      });
      return;
    }

    let loadingToastId: string | null = null;

    try {
      // Show loading toast
      loadingToastId = toast.loading("Syncing All Wallets", {
        description: `Syncing ${activeWallets.length} wallet(s)...`
      });

      const promises = activeWallets.map(wallet => 
        syncWallet(wallet.id, { skipToast: true }).catch(error => {
          console.error(`Failed to sync wallet ${wallet.id}:`, error);
          return false;
        })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => 
        result.status === "fulfilled" && result.value === true
      ).length;
      const failed = results.length - successful;

      // Remove loading toast
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
      }

      // Show final result toast
      if (failed === 0) {
        toast.success("All Wallets Synced", {
          description: `Successfully synced all ${successful} wallet(s)`
        });
      } else if (successful > 0) {
        toast.warning("Partial Sync Complete", {
          description: `${successful} wallet(s) synced, ${failed} failed`
        });
      } else {
        toast.error("Sync Failed", {
          description: "Failed to sync all wallets. Please try again."
        });
      }
    } catch (error) {
      // Remove loading toast and show error
      if (loadingToastId) {
        toast.removeToast(loadingToastId);
      }
      toast.error("Sync Failed", {
        description: "An error occurred while syncing wallets"
      });
    }
  }, [wallets, syncWallet, toast]);

  // ==================== COMPUTED VALUES ====================
  const aggregatedPortfolio = useMemo((): PortfolioSummary => {
    const activeWallets = wallets.filter(w => w.is_active && w.sync_status === "success");
    
    const summary = activeWallets.reduce((acc, wallet) => {
      const portfolioSummary = wallet.wallet_portfolio_summary;
      if (!portfolioSummary) return acc;

      return {
        totalValue: acc.totalValue + (portfolioSummary.total_value || 0),
        totalChange: acc.totalChange + (portfolioSummary.day_change || 0),
        totalPositions: acc.totalPositions + (portfolioSummary.positions_count || 0),
        totalChains: Math.max(acc.totalChains, portfolioSummary.chains_count || 0),
        activeWallets: acc.activeWallets + 1,
        lastSyncTime: Math.max(
          acc.lastSyncTime,
          portfolioSummary.last_sync_at ? new Date(portfolioSummary.last_sync_at).getTime() : 0
        )
      };
    }, {
      totalValue: 0,
      totalChange: 0,
      totalPositions: 0,
      totalChains: 0,
      activeWallets: 0,
      lastSyncTime: 0
    });

    const totalChangePercent = summary.totalValue > 0 
      ? (summary.totalChange / (summary.totalValue - summary.totalChange)) * 100 
      : 0;

    return {
      ...summary,
      totalChangePercent,
      walletsCount: wallets.length,
      change24h: totalChangePercent,
      change7d: undefined,
      change30d: undefined,
    };
  }, [wallets]);

  // ==================== WALLET SELECTION ====================
  const selectWallet = useCallback(async (wallet: UserWallet | null): Promise<void> => {
    setSelectedWallet(wallet);
    
    if (wallet) {
      // Check cache first
      const cached = cacheRef.current.get(wallet.id);
      if (cached) {
        setSelectedWalletData(cached);
      } else {
        setSelectedWalletData(null);
        const data = await loadWalletData(wallet.id);
        if (data) {
          setSelectedWalletData(data);
        }
      }
    } else {
      setSelectedWalletData(null);
    }
  }, [loadWalletData]);

  // ==================== UTILITY FUNCTIONS ====================
  const isWalletSyncing = useCallback((walletId: string): boolean => {
    return syncing[walletId] || false;
  }, [syncing]);

  const getWalletAnalytics = useCallback(async (walletId: string): Promise<WalletAnalytics | null> => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return null;

    // Try to get data from cache first
    const cachedData = cacheRef.current.get(walletId);
    let data = cachedData;

    // If no cached data, try to get from database
    if (!data) {
      try {
        data = await WalletService.getWalletData(walletId);
      } catch (error) {
        console.error("Failed to get wallet data for analytics:", error);
        return null;
      }
    }

    // If still no data, try to sync fresh data
    if (!data) {
      data = await loadWalletData(walletId, { forceRefresh: true });
    }

    if (!data) return null;

    // Calculate performance metrics
    const performance = PerformanceCalculator.calculateWalletPerformance(data);

    return {
      wallet,
      data,
      performance
    };
  }, [wallets, loadWalletData]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (user?.id) {
      loadWallets();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id, loadWallets]);

  useEffect(() => {
    return () => {
      cacheRef.current.invalidate();
    };
  }, []);

  // ==================== RETURN INTERFACE ====================
  return {
    // State
    wallets,
    selectedWallet,
    selectedWalletData,
    loading,
    loadingWallets,
    syncing,
    error,
    
    // Computed
    aggregatedPortfolio,
    
    // Actions
    loadWallets,
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    selectWallet,
    
    // Utilities
    isWalletSyncing,
    getWalletAnalytics,
    
    // Cache management
    invalidateCache: (walletId?: string) => cacheRef.current.invalidate(walletId),
    
    // Services
    zerionExtension
  };
};

// ==================== SPECIALIZED HOOKS ====================
export const useWalletDetails = (walletId?: string) => {
  const {
    wallets,
    selectedWallet,
    selectedWalletData,
    getWalletAnalytics,
    isWalletSyncing,
    syncWallet,
    selectWallet,
  } = useWalletAnalytics();

  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const wallet = useMemo(
    () => walletId ? wallets.find(w => w.id === walletId) : selectedWallet,
    [wallets, walletId, selectedWallet]
  );

  const data = useMemo(
    () => walletId === selectedWallet?.id ? selectedWalletData : null,
    [selectedWalletData, walletId, selectedWallet]
  );

  useEffect(() => {
    if (!wallet?.id) {
      setAnalytics(null);
      return;
    }

    let isMounted = true;

    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const analyticsData = await getWalletAnalytics(wallet.id);
        if (isMounted) {
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
        if (isMounted) {
          setAnalytics(null);
        }
      } finally {
        if (isMounted) {
          setLoadingAnalytics(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [wallet?.id, getWalletAnalytics]);

  useEffect(() => {
    if (walletId && wallet && selectedWallet?.id !== walletId) {
      selectWallet(wallet);
    }
  }, [walletId, wallet, selectedWallet, selectWallet]);

  return {
    wallet,
    data,
    analytics,
    loadingAnalytics,
    isLoading: wallet ? isWalletSyncing(wallet.id) : false,
    refresh: () => wallet ? syncWallet(wallet.id, { forceRefresh: true }) : Promise.resolve(false),
  };
};

export const usePortfolioOverview = () => {
  const { aggregatedPortfolio, wallets } = useWalletAnalytics();

  const topWallets = useMemo(() => {
    return wallets
      .filter(wallet => wallet.sync_status === "success" && wallet.wallet_portfolio_summary)
      .sort((a, b) => {
        const aValue = a.wallet_portfolio_summary?.total_value || 0;
        const bValue = b.wallet_portfolio_summary?.total_value || 0;
        return bValue - aValue;
      })
      .slice(0, 5);
  }, [wallets]);

  return {
    portfolioSummary: aggregatedPortfolio,
    topWallets,
    loading: false
  };
};