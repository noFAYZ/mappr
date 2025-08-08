// lib/hooks/useWalletAnalytics.ts
import { useState, useEffect, useCallback, useMemo } from "react";

import {
  ZerionExtension,
  WalletService,
  WalletData,
} from "@/lib/extensions/crypto/zerion";
import { useToast } from "@/components/ui/Toaster";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// Core Interfaces
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
}

export interface WalletAnalytics {
  wallet: UserWallet;
  data: WalletData;
  performance: {
    rating: "excellent" | "good" | "neutral" | "poor";
    avg30DValue: number;
    totalReturn: number;
    totalReturnPercent: number;
  };
}

export interface SyncOptions {
  includeTransactions?: boolean;
  includeNFTs?: boolean;
  includeChart?: boolean;
  chartPeriod?: "hour" | "day" | "week" | "month" | "3months" | "year" | "max";
  forceRefresh?: boolean;
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  totalPositions: number;
  totalChains: number;
  walletsCount: number;
  activeWallets: number;
  lastSyncTime: number;
}

// Main Hook Implementation
export const useWalletAnalytics = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Core State
  const [wallets, setWallets] = useState<UserWallet[]>([]);

  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [selectedWalletData, setSelectedWalletData] =
    useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Zerion Extension Instance
  const zerionExtension = useMemo(() => new ZerionExtension(), []);

  // Load User Wallets (without wallet data)
  const loadWallets = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      setLoadingWallets(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from("user_wallets")
        .select(
          `
    *,
    wallet_portfolio_summary (
      total_value,
      day_change,
      day_change_percent,
      positions_count,
      nft_count,
      chains_count,
      last_sync_at
    )
  `,
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;

      setWallets(data || []);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load wallets";

      setError(errorMessage);

      toast.error("Failed to Load Wallets", {
        description: errorMessage,
        duration: 6000,
        actions: [
          {
            label: "Retry",
            handler: () => loadWallets(),
          },
        ],
      });
    } finally {
      setLoadingWallets(false);
    }
  }, [user?.id]);

  const loadWalletsSummaries = useCallback(
    async (wallets: UserWallet[]): Promise<void> => {
      if (!user?.id) return;

      try {
        setError(null);
        // Get aggregated data from portfolio summaries
        const { data: summaries, error } = await supabase
          .from("wallet_portfolio_summary")
          .select(`*`)
          .in(
            "wallet_id",
            wallets.map((w) => w.id),
          );

        if (error) throw error;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load wallets";

        setError(errorMessage);

        toast.error("Failed to Load Wallets", {
          description: errorMessage,
          duration: 6000,
          actions: [
            {
              label: "Retry",
              handler: () => loadWallets(),
            },
          ],
        });
      } finally {
      }
    },
    [user?.id],
  );

  // Load Selected Wallet Data
  const loadSelectedWalletData = useCallback(
    async (walletId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const walletData = await WalletService.getWalletData(walletId);

        setSelectedWalletData(walletData);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load wallet data";

        setError(errorMessage);

        toast.error("Failed to Load Wallet Data", {
          description: errorMessage,
          duration: 6000,
        });

        setSelectedWalletData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Add New Wallet
  const addWallet = useCallback(
    async (address: string, name?: string): Promise<boolean> => {
      if (!user?.id) {
        toast.error("Authentication Required", {
          description: "Please log in to add wallets",
        });

        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const wallet = await WalletService.addWallet(user.id, address, name);

        setWallets((prev) => [wallet, ...prev]);

        toast.success("Wallet Added Successfully", {
          description: `${name || "Wallet"} has been added to your portfolio`,
          actions: [
            {
              label: "View Wallet",
              handler: () => setSelectedWallet(wallet),
            },
          ],
        });

        return true;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to add wallet";

        setError(errorMessage);

        toast.error("Failed to Add Wallet", {
          description: errorMessage,
          duration: 8000,
          actions: [
            {
              label: "Try Again",
              handler: () => addWallet(address, name),
            },
          ],
        });

        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // Remove Wallet
  const removeWallet = useCallback(
    async (walletId: string): Promise<boolean> => {
      if (!user?.id) {
        toast.error("Authentication Required");

        return false;
      }

      const walletToRemove = wallets.find((w) => w.id === walletId);

      if (!walletToRemove) {
        toast.error("Wallet Not Found");

        return false;
      }

      try {
        setLoading(true);
        setError(null);

        await WalletService.removeWallet(user.id, walletId);

        setWallets((prev) => prev.filter((w) => w.id !== walletId));

        // Clear selected wallet if it was removed
        if (selectedWallet?.id === walletId) {
          setSelectedWallet(null);
          setSelectedWalletData(null);
        }

        toast.success("Wallet Removed", {
          description: `${walletToRemove.name || "Wallet"} has been removed from your portfolio`,
        });

        return true;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to remove wallet";

        setError(errorMessage);

        toast.error("Failed to Remove Wallet", {
          description: errorMessage,
          duration: 6000,
          actions: [
            {
              label: "Try Again",
              handler: () => removeWallet(walletId),
            },
          ],
        });

        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, wallets, selectedWallet],
  );

  // Sync Wallet Data
  const syncWallet = useCallback(
    async (walletId: string, options: SyncOptions = {}): Promise<boolean> => {
      const wallet = wallets.find((w) => w.id === walletId);

      if (!wallet) {
        toast.error("Wallet Not Found");

        return false;
      }

      try {
        setSyncing((prev) => ({ ...prev, [walletId]: true }));
        setError(null);

        // Update wallet status to syncing
        await supabase
          .from("user_wallets")
          .update({ sync_status: "syncing" })
          .eq("id", walletId);

        // Show syncing toast
        const syncingToastId = toast.loading("Syncing Wallet", {
          description: `Fetching latest data for ${wallet.name || "wallet"}...`,
          persistent: true,
        });

        // Initialize Zerion connection
        const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY;

        if (!apiKey) {
          throw new Error("Zerion API key not configured");
        }

        await zerionExtension.connect({ apiKey });

        // Sync wallet data
        const syncResult = await zerionExtension.syncWallet(wallet.address, {
          includeTransactions: options.includeTransactions ?? true,
          includeNFTs: options.includeNFTs ?? true,
          includeChart: options.includeChart ?? true,
          chartPeriod: options.chartPeriod ?? "week",
          forceRefresh: options.forceRefresh ?? false,
        });

        if (!syncResult.success) {
          throw new Error(syncResult.error || "Sync failed");
        }

        // Store data in normalized tables
        if (syncResult.data) {
          await WalletService.updateWalletData(walletId, syncResult.data);

          // Update selected wallet data if this is the selected wallet
          if (selectedWallet?.id === walletId) {
            const updatedWalletData =
              await WalletService.getWalletData(walletId);

            setSelectedWalletData(updatedWalletData);
          }
        }

        // Update wallet sync status
        setWallets((prev) =>
          prev.map((w) =>
            w.id === walletId
              ? {
                  ...w,
                  last_sync_at: new Date().toISOString(),
                  sync_status: "success",
                  sync_error: null,
                }
              : w,
          ),
        );

        // Dismiss loading toast and show success
        toast.removeToast(syncingToastId);

        toast.success("Wallet Synced Successfully", {
          description: `${wallet.name || "Wallet"} data has been updated`,
          actions: [
            {
              label: "View Details",
              handler: () => setSelectedWallet(wallet),
            },
          ],
        });

        return true;
      } catch (err: any) {
        const errorMessage = err.message || "Sync failed";

        setError(errorMessage);

        // Update wallet status to error
        await supabase
          .from("user_wallets")
          .update({
            sync_status: "error",
            sync_error: errorMessage,
          })
          .eq("id", walletId);

        setWallets((prev) =>
          prev.map((w) =>
            w.id === walletId
              ? { ...w, sync_status: "error", sync_error: errorMessage }
              : w,
          ),
        );

        toast.error("Sync Failed", {
          description: `Failed to sync ${wallet.name || "wallet"}: ${errorMessage}`,
          duration: 8000,
          actions: [
            {
              label: "Retry",
              handler: () => syncWallet(walletId, options),
            },
          ],
        });

        return false;
      } finally {
        setSyncing((prev) => ({ ...prev, [walletId]: false }));
      }
    },
    [wallets, zerionExtension, selectedWallet],
  );

  // Sync All Wallets
  const syncAllWallets = useCallback(
    async (options: SyncOptions = {}): Promise<void> => {
      if (wallets.length === 0) {
        toast.info("No Wallets to Sync");

        return;
      }

      const syncPromises = wallets.map((wallet) =>
        syncWallet(wallet.id, options),
      );
      const results = await Promise.allSettled(syncPromises);

      const successful = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failed === 0) {
        toast.success("All Wallets Synced", {
          description: `Successfully synced ${successful} wallets`,
        });
      } else {
        toast.warning("Partial Sync Complete", {
          description: `${successful} succeeded, ${failed} failed`,
        });
      }
    },
    [wallets, syncWallet],
  );

  // Get Aggregated Portfolio Data
  const getAggregatedPortfolio =
    useCallback(async (): Promise<PortfolioSummary> => {
      try {
        if (!user?.id || wallets.length === 0) {
          return {
            totalValue: 0,
            totalChange: 0,
            totalChangePercent: 0,
            totalPositions: 0,
            totalChains: 0,
            walletsCount: 0,
            activeWallets: 0,
            lastSyncTime: 0,
          };
        }

        // Get aggregated data from portfolio summaries
        const { data: summaries, error } = await supabase
          .from("wallet_portfolio_summary")
          .select(`*`)
          .in(
            "wallet_id",
            wallets.map((w) => w.id),
          );

        if (error) throw error;

        const aggregated = (summaries || []).reduce(
          (acc, summary) => {
            acc.totalValue += summary.total_value || 0;
            acc.totalChange += summary.day_change || 0;
            acc.totalPositions += summary.positions_count || 0;
            acc.totalChains = Math.max(
              acc.totalChains,
              summary.chains_count || 0,
            );

            return acc;
          },
          {
            totalValue: 0,
            totalChange: 0,
            totalPositions: 0,
            totalChains: 0,
          },
        );

        const totalChangePercent =
          aggregated.totalValue > 0
            ? (aggregated.totalChange /
                (aggregated.totalValue - aggregated.totalChange)) *
              100
            : 0;

        const activeWallets = wallets.filter(
          (w) => w.sync_status === "success",
        ).length;
        const lastSyncTime = wallets.reduce((latest, wallet) => {
          const syncTime = wallet.last_sync_at
            ? new Date(wallet.last_sync_at).getTime()
            : 0;

          return Math.max(latest, syncTime);
        }, 0);

        return {
          ...aggregated,
          totalChangePercent,
          walletsCount: wallets.length,
          activeWallets,
          lastSyncTime,
        };
      } catch (err) {
        console.error("Error getting aggregated portfolio:", err);

        return {
          totalValue: 0,
          totalChange: 0,
          totalChangePercent: 0,
          totalPositions: 0,
          totalChains: 0,
          walletsCount: wallets.length,
          activeWallets: 0,
          lastSyncTime: 0,
        };
      }
    }, [wallets, user?.id]);

  // Get Wallet Analytics with Performance Metrics
  const getWalletAnalytics = useCallback(
    async (walletId: string): Promise<WalletAnalytics | null> => {
      const wallet = wallets.find((w) => w.id === walletId);

      if (!wallet) return null;

      try {
        const data = await WalletService.getWalletData(walletId);

        if (!data) return null;

        // Get historical chart data for performance calculation
        const { data: chartData, error } = await supabase
          .from("wallet_chart_data")
          .select("value, timestamp")
          .eq("wallet_id", walletId)
          .order("timestamp", { ascending: false })
          .limit(720); // 30 days of hourly data

        if (error) throw error;

        const avg30DValue = chartData?.length
          ? chartData.reduce((sum, point) => sum + (point.value || 0), 0) /
            chartData.length
          : data.portfolio.totalValue;

        const oldestValue = chartData?.length
          ? chartData[chartData.length - 1]?.value || 0
          : 0;
        const currentValue = data.portfolio.totalValue;
        const totalReturn = currentValue - oldestValue;
        const totalReturnPercent =
          oldestValue > 0 ? (totalReturn / oldestValue) * 100 : 0;

        // Calculate performance rating
        let rating: "excellent" | "good" | "neutral" | "poor" = "neutral";

        if (totalReturnPercent > 20) rating = "excellent";
        else if (totalReturnPercent > 5) rating = "good";
        else if (totalReturnPercent < -20) rating = "poor";

        return {
          wallet,
          data,
          performance: {
            rating,
            avg30DValue,
            totalReturn,
            totalReturnPercent,
          },
        };
      } catch (err) {
        console.error("Error calculating wallet analytics:", err);

        return null;
      }
    },
    [wallets],
  );

  // Utility Functions
  const isWalletSyncing = useCallback(
    (walletId: string): boolean => {
      return syncing[walletId] || false;
    },
    [syncing],
  );

  const selectWallet = useCallback(
    (wallet: UserWallet | null): void => {
      setSelectedWallet(wallet);
      if (wallet) {
        loadSelectedWalletData(wallet.id);
      } else {
        setSelectedWalletData(null);
      }
    },
    [loadSelectedWalletData],
  );

  // Load wallets on mount
  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  // Load selected wallet data when selected wallet changes
  useEffect(() => {
    if (selectedWallet) {
      loadSelectedWalletData(selectedWallet.id);
    }
  }, [selectedWallet, loadSelectedWalletData]);

  return {
    // State
    wallets,
    selectedWallet,
    selectedWalletData,
    loading,
    syncing,
    error,
    loadingWallets,

    // Actions
    loadWallets,
    addWallet,
    removeWallet,
    syncWallet,
    syncAllWallets,
    selectWallet,

    // Computed data
    getAggregatedPortfolio,
    getWalletAnalytics,
    isWalletSyncing,

    // Utils
    zerionExtension,
  };
};

// Hook for individual wallet details
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
    () => (walletId ? wallets.find((w) => w.id === walletId) : selectedWallet),
    [wallets, walletId, selectedWallet],
  );

  const data = useMemo(
    () => (walletId === selectedWallet?.id ? selectedWalletData : null),
    [selectedWalletData, walletId, selectedWallet],
  );

  // Load analytics when wallet changes
  useEffect(() => {
    if (!wallet?.id) {
      setAnalytics(null);

      return;
    }

    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const analyticsData = await getWalletAnalytics(wallet.id);

        setAnalytics(analyticsData);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setAnalytics(null);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [wallet?.id, getWalletAnalytics, data]);

  // Select wallet if walletId is provided
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
    refresh: () =>
      wallet
        ? syncWallet(wallet.id, { forceRefresh: true })
        : Promise.resolve(false),
  };
};

// Hook for portfolio overview
export const usePortfolioOverview = () => {
  const { wallets, getAggregatedPortfolio } = useWalletAnalytics();
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    totalPositions: 0,
    totalChains: 0,
    walletsCount: 0,
    activeWallets: 0,
    lastSyncTime: 0,
  });
  const [loading, setLoading] = useState(false);

  // Update portfolio summary when wallets change
  useEffect(() => {
    const updateSummary = async () => {
      setLoading(true);
      try {
        const aggregated = await getAggregatedPortfolio();

        setPortfolioSummary(aggregated);
      } catch (err) {
        console.error("Error updating portfolio summary:", err);
      } finally {
        setLoading(false);
      }
    };

    updateSummary();
  }, [wallets, getAggregatedPortfolio]);

  const topWallets = useMemo(() => {
    return wallets
      .filter((wallet) => wallet.sync_status === "success")
      .sort((a, b) => {
        // This would need actual wallet data for sorting by value
        // For now, sort by last sync time
        const aTime = a.last_sync_at ? new Date(a.last_sync_at).getTime() : 0;
        const bTime = b.last_sync_at ? new Date(b.last_sync_at).getTime() : 0;

        return bTime - aTime;
      })
      .slice(0, 5)
      .map((wallet) => ({
        wallet,
        value: 0, // This would be populated with actual data
        data: null, // This would be populated with actual data
      }));
  }, [wallets]);

  return {
    portfolioSummary,
    topWallets,
    loading,
    hasData: wallets.some((w) => w.sync_status === "success"),
  };
};
