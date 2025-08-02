// lib/extensions/crypto/zerion-enhanced.ts
import { BaseExtension } from '../base';
import { EncryptionService } from '@/lib/utils/encryption';
import { DataNormalizer } from '@/lib/utils/data-normalization';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { CacheManager } from '@/lib/utils/cache-manager';

// Import the SDK - ensure you have zerion-sdk-ts installed
// npm install zerion-sdk-ts
import ZerionSDK from 'zerion-sdk-ts';
import { supabase } from '@/lib/supabase';

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
    positions: any[];
    chains: string[];
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

export class ZerionExtension extends BaseExtension {
  name = 'Zerion';
  provider = 'zerion';
  category = 'crypto';
  supportedDataTypes = ['portfolio', 'positions', 'transactions', 'nfts', 'chart'];
  
  private sdk: any;
  private cache: CacheManager;

  constructor() {
    super();
    this.cache = new CacheManager('zerion', {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000
    });
  }

  async connect(credentials: ZerionCredentials): Promise<void> {
    try {
      if (!credentials.apiKey) {
        throw new Error('API key is required for Zerion connection');
      }

      // Initialize SDK
      this.sdk = new ZerionSDK({
        apiKey: credentials.apiKey,
        timeout: 30000,
        retries: 3,
        retryDelay: 2000
      });

      // Test connection
      await this.validateCredentials(credentials);
      
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.connect');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.sdk = null;
    this.cache.clear();
  }

  async validateCredentials(credentials: ZerionCredentials): Promise<boolean> {
    try {
      // Test with a simple API call
      await this.sdk.fungibles.getTopFungibles(1);
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.validateCredentials');
      return false;
    }
  }

  async syncWallet(address: string, options: {
    includeTransactions?: boolean;
    includeNFTs?: boolean;
    includeChart?: boolean;
    chartPeriod?: string;
  } = {}): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isValidAddress(address)) {
        throw new Error(`Invalid wallet address: ${address}`);
      }

      const cacheKey = `wallet_${address}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && !this.shouldRefreshCache(cached.timestamp)) {
        return {
          success: true,
          data: cached.data,
          syncedAt: cached.timestamp,
          syncDuration: Date.now() - startTime
        };
      }

      // Fetch all data in parallel for better performance
      const promises: Promise<any>[] = [
        this.getPortfolioData(address),
        this.getPositions(address),
      ];

      if (options.includeTransactions) {
        promises.push(this.getTransactions(address));
      }

      if (options.includeNFTs) {
        promises.push(this.getNFTs(address));
      }

      if (options.includeChart) {
        promises.push(this.getChart(address, options.chartPeriod || 'day'));
      }

      const results = await Promise.allSettled(promises);
      
      const portfolio = results[0].status === 'fulfilled' ? results[0].value : null;
      const positions = results[1].status === 'fulfilled' ? results[1].value : [];
      const transactions = options.includeTransactions && results[2]?.status === 'fulfilled' ? results[2].value : [];
      const nfts = options.includeNFTs && results[results.length - (options.includeChart ? 2 : 1)]?.status === 'fulfilled' 
        ? results[results.length - (options.includeChart ? 2 : 1)].value : null;
      const chart = options.includeChart && results[results.length - 1]?.status === 'fulfilled' 
        ? results[results.length - 1].value : [];


      // Normalize and structure data
      const walletData: WalletData = {
        address,
        portfolio: this.normalizePortfolioData(portfolio, positions),
        positions: DataNormalizer.normalizePositions(positions),
        transactions: DataNormalizer.normalizeTransactions(transactions),
        nftPortfolio: DataNormalizer.normalizeNFTs(nfts),
        pnl: this.calculatePnL(portfolio, positions),
        chart: DataNormalizer.normalizeChartData(chart?.attributes),
        metadata: {
          lastSyncAt: new Date().toISOString(),
          positionsCount: positions?.length || 0,
          chainsCount: this.getUniqueChains(positions).length,
          transactionsCount: transactions?.length || 0,
          nftsCount: nfts?.data?.length || 0
        }
      };

      console.log(`Zerion wallet data for ${address}`, walletData);


      // Cache the result
      this.cache.set(cacheKey, walletData);

      return {
        success: true,
        data: walletData,
        syncedAt: new Date().toISOString(),
        syncDuration: Date.now() - startTime
      };

    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.syncWallet');
      return {
        success: false,
        error: error.message,
        syncedAt: new Date().toISOString(),
        syncDuration: Date.now() - startTime
      };
    }
  }

  async sync(dataTypes: string[] = this.supportedDataTypes): Promise<any[]> {
    // This method would be called for bulk syncing of all connected wallets
    // Implementation depends on your specific requirements
    return [];
  }

  // Private helper methods
  private async getPortfolioData(address: string) {
    try {
      const response = await this.sdk.wallets.getPortfolio(address);
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.getPortfolioData');
      throw error;
    }
  }

  private async getPositions(address: string) {
    try {
      const response = await this.sdk.wallets.getPositions(address, {
        page: { size: 50 }
      });
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.getPositions');
      throw error;
    }
  }

  private async getTransactions(address: string, limit: number = 50) {
    try {
      const response = await this.sdk.wallets.getTransactions(address, {
        page: { size: limit }
      });
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.getTransactions');
      throw error;
    }
  }

  private async getNFTs(address: string) {
    try {
      const response = await this.sdk.wallets.getNFTPositions(address);
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.getNFTs');
      throw error;
    }
  }

  private async getChart(address: string, period: string) {
    try {
      const response = await this.sdk.wallets.getChart(address, period);
      return response.data;
    } catch (error) {
      ErrorHandler.handle(error, 'ZerionExtension.getChart');
      throw error;
    }
  }

  private normalizePortfolioData(portfolio: any, positions: any[]): WalletData['portfolio'] {
    const totalValue = portfolio?.attributes?.total || 0;
    const dayChange = portfolio?.attributes?.changes?.absolute_1d || 0;
    const dayChangePercent = portfolio?.attributes?.changes?.percent_1d || 0;
    const uniqueChains = this.getUniqueChains(positions);

    return {
      totalValue,
      dayChange,
      dayChangePercent,
      positions,
      chains: uniqueChains
    };
  }

  private calculatePnL(portfolio: any, positions: any[]): WalletData['pnl'] {
    // Calculate P&L from portfolio and positions data
    const totalValue = portfolio?.attributes?.total || 0;
    
    return {
      total: totalValue,
      realized: 0, // Would need transaction data to calculate
      unrealized: totalValue // Simplified calculation
    };
  }

  private getUniqueChains(positions: any[]): string[] {
    if (!positions) return [];
    
    const chains = new Set(
      positions
        .map(p => p.relationships?.chain?.data?.id)
        .filter(Boolean)
    );
    
    return Array.from(chains);
  }

  private isValidAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private shouldRefreshCache(timestamp: string): boolean {
    const cacheAge = Date.now() - new Date(timestamp).getTime();
    return cacheAge > 5 * 60 * 1000; // 5 minutes
  }
}

// Wallet Service for database operations
export class WalletService {
  static async addWallet(userId: string, address: string, name?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          address: address.toLowerCase(),
          name: name || `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
          is_active: true,
          metadata: {
            addedAt: new Date().toISOString(),
            source: 'manual'
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorHandler.handle(error, 'WalletService.addWallet');
      throw error;
    }
  }

  static async removeWallet(userId: string, walletId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('id', walletId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      ErrorHandler.handle(error, 'WalletService.removeWallet');
      throw error;
    }
  }

  static async getUserWallets(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, 'WalletService.getUserWallets');
      throw error;
    }
  }

  static async updateWalletData(walletId: string, data: WalletData): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_wallets')
        .update({
          last_sync_data: data,
          last_sync_at: new Date().toISOString(),
          sync_status: 'success'
        })
        .eq('id', walletId);

      if (error) throw error;

      // Store detailed data in aggregated_data table
      await this.storeAggregatedData(walletId, data);
    } catch (error) {
      ErrorHandler.handle(error, 'WalletService.updateWalletData');
      throw error;
    }
  }

  private static async storeAggregatedData(walletId: string, data: WalletData): Promise<void> {
    const records = [];

    // Store portfolio data
    if (data.portfolio) {
      records.push({
        wallet_id: walletId,
        data_type: 'portfolio',
        raw_data: data.portfolio,
        normalized_data: DataNormalizer.normalizePortfolio(data.portfolio),
        metadata: { syncedAt: data.metadata.lastSyncAt }
      });
    }

    // Store positions
    if (data.positions?.length) {
      records.push({
        wallet_id: walletId,
        data_type: 'positions',
        raw_data: data.positions,
        normalized_data: DataNormalizer.normalizePositions(data.positions),
        metadata: { count: data.positions.length }
      });
    }

    // Store transactions
    if (data.transactions?.length) {
      records.push({
        wallet_id: walletId,
        data_type: 'transactions',
        raw_data: data.transactions,
        normalized_data: DataNormalizer.normalizeTransactions(data.transactions),
        metadata: { count: data.transactions.length }
      });
    }

    if (records.length) {
      const { error } = await supabase
        .from('aggregated_data')
        .insert(records);

      if (error) throw error;
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
    extension
  };
};