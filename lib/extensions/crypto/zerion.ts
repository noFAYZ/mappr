// lib/extensions/crypto/zerion.ts
import ZerionSDK from "zerion-sdk-ts";

import { BaseExtension } from "../base";

import { DataNormalizer } from "@/lib/utils/data-normalization";
import { ErrorHandler } from "@/lib/utils/error-handler";
import { CacheManager } from "@/lib/utils/cache-manager";
import { supabase } from "@/lib/supabase";
import { toTimestampz } from "@/lib/utils/time";
import { SyncOptions } from "@/lib/hooks/useWalletAnalytics";

export interface ZerionCredentials {
  apiKey: string;
  endpoint?: string;
}

export interface WalletData {
  address: string;
  name?: string;
  portfolio: {
    totalValue: number;
    dayChange: number;
    dayChangePercent: number;
    chains: any[];
  };
  positions: any[];
  transactions: any[];
  nftPortfolio: any;
  pnl: {
    total: number;
    realized: number;
    unrealized: number;
  };
  chart: any[];
  metadata: {
    lastSyncAt: string;
    positionsCount: number;
    chainsCount: number;
    transactionsCount: number;
    nftsCount: number;
  };
}

export interface SyncResult {
  success: boolean;
  data?: WalletData;
  error?: string;
  syncedAt: string;
  syncDuration: number;
}

export interface OHLCDataPoint {
  chart_timestamp: string;
  open_value: number;
  high_value: number;
  low_value: number;
  close_value: number;
  avg_value: number;
  volume: number;
  period_label: string;
}

export class ZerionExtension extends BaseExtension {
  name = "Zerion";
  provider = "zerion";
  category = "crypto";
  supportedDataTypes = [
    "portfolio",
    "positions",
    "transactions",
    "nfts",
    "chart",
  ];

  private sdk: any;
  private cache: CacheManager;

  constructor() {
    super();
    this.cache = new CacheManager("zerion", {
      defaultTTL: 5 * 60 * 1000,
      maxSize: 1000,
    });
  }

  async connect(credentials: ZerionCredentials): Promise<void> {
    try {
      if (!credentials.apiKey) {
        throw new Error("API key is required for Zerion connection");
      }

      this.sdk = new ZerionSDK({
        apiKey: credentials.apiKey,
        timeout: 30000,
        retries: 3,
        retryDelay: 2000,
      });

      await this.validateCredentials(credentials);
    } catch (error) {
      ErrorHandler.handle(error, "ZerionExtension.connect");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.sdk = null;
    this.cache.clear();
  }

  async validateCredentials(credentials: ZerionCredentials): Promise<boolean> {
    try {
      await this.sdk.fungibles.getTopFungibles(1);

      return true;
    } catch (error) {
      ErrorHandler.handle(error, "ZerionExtension.validateCredentials");

      return false;
    }
  }

  async syncWallet(
    address: string,
    options: {
      includeTransactions?: boolean;
      includeNFTs?: boolean;
      includeChart?: boolean;
      chartPeriod?:
        | "hour"
        | "day"
        | "week"
        | "month"
        | "3months"
        | "year"
        | "max";
      forceRefresh?: boolean;
    } = {},
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const cacheKey = `wallet_${address}_${JSON.stringify(options)}`;

    try {
      if (!this.sdk) {
        throw new Error("Zerion SDK not initialized. Call connect() first.");
      }

      if (!this.isValidAddress(address)) {
        throw new Error("Invalid wallet address format");
      }

      // Check cache unless force refresh
      if (!options.forceRefresh) {
        const cached = this.cache.get(cacheKey);

        if (cached && !this.shouldRefreshCache(cached.metadata.lastSyncAt)) {
          return {
            success: true,
            data: cached,
            syncedAt: cached.metadata.lastSyncAt,
            syncDuration: Date.now() - startTime,
          };
        }
      }

      console.log(`Syncing wallet ${address} with options:`, options);

      // Prepare API calls
      const apiCalls = [
        this.sdk.wallets.getPortfolio(address),
        this.sdk.wallets.getPositions(address),
      ];

      if (options.includeTransactions) {
        apiCalls.push(this.sdk.wallets.getTransactions(address));
      }

      if (options.includeNFTs) {
        apiCalls.push(this.sdk.wallets.getNFTPositions(address));
      }

      if (options.includeChart) {
        apiCalls.push(
          this.sdk.wallets.getChart(address, options.chartPeriod || "week"),
        );
      }

      if (false) {
        apiCalls.push(this.sdk.wallets.getPnL(address, "week"));
      }

      // Execute API calls in parallel
      const results = await Promise.allSettled(apiCalls);

      // Extract results
      const portfolio =
        results[0].status === "fulfilled" ? results[0].value : null;
      const positions =
        results[1].status === "fulfilled" ? results[1].value : [];
      const transactions =
        options.includeTransactions && results[2]?.status === "fulfilled"
          ? results[2].value
          : [];
      const nfts =
        options.includeNFTs &&
        results[results.length - (options.includeChart ? 2 : 1)]?.status ===
          "fulfilled"
          ? results[results.length - (options.includeChart ? 2 : 1)].value
          : null;
      const chart =
        options.includeChart &&
        results[results.length - 1]?.status === "fulfilled"
          ? results[results.length - 1].value
          : [];
      const pnl =
        results[results.length - (options.includeChart ? 2 : 1)]?.status ===
        "fulfilled"
          ? results[results.length - (options.includeChart ? 2 : 1)].value
          : null;

      // Normalize and structure data
      const walletData: WalletData = {
        address,
        portfolio: this.normalizePortfolioData(portfolio?.data),
        positions: DataNormalizer.normalizePositions(positions?.data),
        transactions: DataNormalizer.normalizeTransactions(transactions?.data),
        nftPortfolio: DataNormalizer.normalizeNFTs(nfts?.data),
        pnl: pnl?.attributes || null,
        chart: DataNormalizer.normalizeChartData(chart?.data?.attributes),
        metadata: {
          lastSyncAt: new Date().toISOString(),
          positionsCount: positions?.data?.length || 0,
          chainsCount: this.getUniqueChains(positions?.data).length,
          transactionsCount: transactions?.length || 0,
          nftsCount: nfts?.data?.length || 0,
        },
      };

      console.log(
        `Wallet ${address} synced successfully in ${Date.now() - startTime}ms`,
        walletData,
      );

      this.cache.set(cacheKey, walletData);

      return {
        success: true,
        data: walletData,
        syncedAt: new Date().toISOString(),
        syncDuration: Date.now() - startTime,
      };
    } catch (error) {
      ErrorHandler.handle(error, "ZerionExtension.syncWallet");

      return {
        success: false,
        error: error.message,
        syncedAt: new Date().toISOString(),
        syncDuration: Date.now() - startTime,
      };
    }
  }

  private normalizePortfolioData(portfolio: any): WalletData["portfolio"] {
    const totalValue = portfolio?.attributes?.total?.positions || 0;
    const dayChange = portfolio?.attributes?.changes?.absolute_1d || 0;
    const dayChangePercent = portfolio?.attributes?.changes?.percent_1d || 0;
    const chainDistribution =
      portfolio?.attributes?.positions_distribution_by_chain;

    return {
      totalValue,
      dayChange,
      dayChangePercent,
      chains: chainDistribution,
    };
  }

  private calculatePnL(pnl: any): WalletData["pnl"] {
    return pnl?.attributes;
  }

  private getUniqueChains(positions: any[]): string[] {
    if (!positions) return [];

    const chains = new Set(
      positions.map((p) => p.relationships?.chain?.data?.id).filter(Boolean),
    );

    return Array.from(chains);
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private shouldRefreshCache(timestamp: string): boolean {
    const cacheAge = Date.now() - new Date(timestamp).getTime();

    return cacheAge > 5 * 60 * 1000;
  }
}

// Enhanced Wallet Service for normalized database operations
export class WalletService {
  static async addWallet(
    userId: string,
    address: string,
    name?: string,
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("user_wallets")
        .insert({
          user_id: userId,
          address: address?.toLowerCase(),
          name: name || `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
          is_active: true,
          metadata: {
            addedAt: new Date().toISOString(),
            source: "manual",
          },
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      ErrorHandler.handle(error, "WalletService.addWallet");
      throw error;
    }
  }

  static async removeWallet(userId: string, walletId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_wallets")
        .update({ is_active: false })
        .eq("id", walletId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      ErrorHandler.handle(error, "WalletService.removeWallet");
      throw error;
    }
  }

  static async getUserWallets(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, "WalletService.getUserWallets");
      throw error;
    }
  }

  // Updated method to store data in normalized tables
  static async updateWalletData(
    walletId: string,
    data: WalletData,
    options: SyncOptions,
  ): Promise<void> {
    try {
      // Begin transaction
      const updates = [];

      // 1. Update wallet summary
      updates.push(
        supabase
          .from("user_wallets")
          .update({
            last_sync_at: new Date().toISOString(),
            sync_status: "success",
          })
          .eq("id", walletId),
      );

      // 2. Store/update portfolio summary
      updates.push(
        supabase.from("wallet_portfolio_summary").upsert(
          {
            wallet_id: walletId,
            total_value: data.portfolio.totalValue,
            day_change: data.portfolio.dayChange,
            day_change_percent: data.portfolio.dayChangePercent,
            positions_count: data.metadata.positionsCount,
            nft_count: data.metadata.nftsCount,
            chains_count: data.metadata.chainsCount,
            last_sync_at: new Date().toISOString(),
          },
          {
            onConflict: "wallet_id",
          },
        ),
      );

      // 3. Replace positions (overwrite existing)
      if (data.positions?.length) {
        // First delete existing positions
        updates.push(
          supabase.from("wallet_positions").delete().eq("wallet_id", walletId),
        );

        // Then insert new positions
        const positionsToInsert = data.positions.map((pos) => ({
          wallet_id: walletId,
          token_address: pos.relationships?.fungible?.data?.id || null,
          symbol: pos.attributes.symbol,
          name: pos.attributes.name,
          value: pos.attributes.value,
          quantity: pos.attributes.quantity?.numeric,
          price: pos.attributes.price,
          change_24h: pos.attributes.change24h,
          icon_url: pos.attributes.icon,
          chain_id: pos.attributes.chain,
          protocol_id: pos.attributes.protocol,
          is_verified: pos.attributes.verified,
          position_type: "token",
          metadata: {
            originalData: pos,
            normalizedAt: new Date().toISOString(),
          },
        }));

        updates.push(
          supabase.from("wallet_positions").insert(positionsToInsert),
        );
      }

      // 4. Replace NFT positions (overwrite existing)
      if (data.nftPortfolio?.items?.length) {
        // First delete existing NFTs
        updates.push(
          supabase
            .from("wallet_nft_positions")
            .delete()
            .eq("wallet_id", walletId),
        );

        // Then insert new NFTs
        const nftsToInsert = data.nftPortfolio.items.map((nft) => ({
          wallet_id: walletId,
          token_id: nft.attributes.tokenId,
          collection_name: nft.attributes.collection,
          name: nft.attributes.name,
          description: nft.attributes.description,
          image_url: nft.attributes.image,
          floor_price: nft.attributes.value,
          chain_id: nft.attributes.chain,
          contract_address: nft.id,
          metadata: {
            originalData: nft,
            normalizedAt: new Date().toISOString(),
          },
        }));

        updates.push(
          supabase.from("wallet_nft_positions").insert(nftsToInsert),
        );
      }

      // 5. Append new transactions (if any)
      if (data.transactions?.length) {
        const existingTxHashes =
          await this.getExistingTransactionHashes(walletId);
        const newTransactions = data.transactions.filter(
          (tx) => !existingTxHashes.has(tx.attributes.hash),
        );

        if (newTransactions.length) {
          const transactionsToInsert = newTransactions.map((tx) => ({
            wallet_id: walletId,
            hash: tx.attributes.hash,
            status: tx.attributes.status,
            timestamp: tx.attributes.timestamp,
            block_number: tx.attributes.blockNumber,
            gas_used: tx.attributes.gasUsed,
            gas_price: tx.attributes.gasPrice,
            fee: tx.attributes.fee,
            value: tx.attributes.value,
            direction: tx.attributes.direction,
            chain_id: tx.attributes.chain,
            from_address: tx.attributes.from_address,
            to_address: tx.attributes.to_address,
            transaction_type: tx.type,
            metadata: {
              originalData: tx,
              normalizedAt: new Date().toISOString(),
            },
          }));

          updates.push(
            supabase.from("wallet_transactions").insert(transactionsToInsert),
          );
        }
      }

      // 6. Append chart data
      if (data.chart?.length) {
        const chartDataToInsert = data.chart.map((point) => ({
          wallet_id: walletId,
          timestamp: toTimestampz(point.timestamp),
          value: point.value,
          period: options?.chartPeriod || "week", // Default period, can be made configurable
        }));

        updates.push(
          supabase.from("wallet_chart_data").upsert(chartDataToInsert, {
            onConflict: "wallet_id,timestamp,period",
          }),
        );
      }

      // Execute all updates
      const results = await Promise.allSettled(updates);

      // Check for errors
      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (errors.length > 0) {
        throw new Error(`Database update errors: ${errors.join(", ")}`);
      }
    } catch (error) {
      ErrorHandler.handle(error, "WalletService.updateWalletData");
      throw error;
    }
  }

  private static async getExistingTransactionHashes(
    walletId: string,
  ): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("hash")
        .eq("wallet_id", walletId);

      if (error) throw error;

      return new Set(data?.map((tx) => tx.hash) || []);
    } catch (error) {
      console.error("Error fetching existing transaction hashes:", error);

      return new Set();
    }
  }

  static async getChartData(
    walletId: string,
    period: string,
  ): Promise<OHLCDataPoint[]> {
    const { data, error } = await supabase.rpc("get_ohlc_chart_data", {
      p_wallet_id: walletId,
      p_period: period,
    });

    if (error) {
      ErrorHandler.handle(error, "WalletService.getChartData");
      console.error("Chart data error:", error);

      return [];
    }

    return data || [];
  }

  // Retrieve wallet data from normalized tables
  static async getWalletData(walletId: string): Promise<WalletData | null> {
    try {
      // Get portfolio summary
      const { data: summary, error: summaryError } = await supabase
        .from("wallet_portfolio_summary")
        .select("*")
        .eq("wallet_id", walletId)
        .single();

      if (summaryError && summaryError.code !== "PGRST116") throw summaryError;

      // Get positions
      const { data: positions, error: positionsError } = await supabase
        .from("wallet_positions")
        .select("*")
        .eq("wallet_id", walletId)
        .order("value", { ascending: false });

      if (positionsError) throw positionsError;

      // Get NFTs
      const { data: nfts, error: nftsError } = await supabase
        .from("wallet_nft_positions")
        .select("*")
        .eq("wallet_id", walletId);

      if (nftsError) throw nftsError;

      // Get recent transactions
      const { data: transactions, error: txError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", walletId)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (txError) throw txError;

      // Get chart data
      /*  const { data: chartData, error: chartError } = await supabase
        .from('wallet_chart_data')
        .select('*')
        .eq('wallet_id', walletId)
        .order('timestamp', { ascending: true })
        .limit(168); // Last week of hourly data */
      // Usage function

      const chartData = (await this.getChartData(walletId, "week")) || [];

      // Get wallet info
      const { data: wallet, error: walletError } = await supabase
        .from("user_wallets")
        .select("address, name")
        .eq("id", walletId)
        .single();

      if (walletError) throw walletError;

      if (!summary && !positions?.length) {
        return null;
      }

      // Reconstruct WalletData format
      return {
        address: wallet.address,
        name: wallet.name,
        portfolio: {
          totalValue: summary?.total_value || 0,
          dayChange: summary?.day_change || 0,
          dayChangePercent: summary?.day_change_percent || 0,
          positions: positions || [],
          chains:
            [...new Set(positions?.map((p) => p.chain_id).filter(Boolean))] ||
            [],
        },
        positions: positions || [],
        transactions: transactions || [],
        nftPortfolio: {
          items: nfts || [],
          totalCount: nfts?.length || 0,
        },
        pnl: {
          total: summary?.total_value || 0,
          realized: 0,
          unrealized: summary?.total_value || 0,
        },
        chart: chartData || [],
        metadata: {
          lastSyncAt: summary?.last_sync_at || new Date().toISOString(),
          positionsCount: summary?.positions_count || 0,
          chainsCount: summary?.chains_count || 0,
          transactionsCount: transactions?.length || 0,
          nftsCount: summary?.nft_count || 0,
        },
      };
    } catch (error) {
      ErrorHandler.handle(error, "WalletService.getWalletData");
      throw error;
    }
  }
}

// Hook for using Zerion functionality
export const useZerionExtension = () => {
  const extension = new ZerionExtension();

  const connectZerion = async (apiKey: string) => {
    await extension.connect({ apiKey });
  };

  const syncWallet = async (address: string, options?: any) => {
    return await extension.syncWallet(address, options);
  };

  const addWallet = async (userId: string, address: string, name?: string) => {
    return await WalletService.addWallet(userId, address, name);
  };

  const removeWallet = async (userId: string, walletId: string) => {
    await WalletService.removeWallet(userId, walletId);
  };

  const getUserWallets = async (userId: string) => {
    return await WalletService.getUserWallets(userId);
  };

  return {
    connectZerion,
    syncWallet,
    addWallet,
    removeWallet,
    getUserWallets,
    extension,
  };
};
