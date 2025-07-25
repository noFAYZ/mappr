import { BaseExtension } from '../base';
import  ZerionSDK from 'zerion-sdk-ts';

export class ZerionExtension extends BaseExtension {
  name = 'Zerion';
  provider = 'zerion';
  category = 'crypto';
  supportedDataTypes = ['portfolios', 'transactions', 'positions', 'nfts'];
  
  private sdk: ZerionSDK | null = null;

  async connect(credentials: Record<string, any>): Promise<boolean> {
    try {
      this.sdk = new ZerionSDK({
        apiKey: credentials.apiKey,
        timeout: 30000,
        retries: 3
      });
      
      // Test connection by fetching a simple endpoint
      await this.sdk.fungibles.getFungibles({ limit: 1 });
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }

  async disconnect(): Promise<void> {
    this.sdk = null;
  }

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    if (!credentials.apiKey) {
      throw new Error('API key is required');
    }
    
    try {
      const tempSDK = new ZerionSDK({
        apiKey: credentials.apiKey,
        timeout: 10000
      });
      
      await tempSDK.fungibles.getFungibles({ limit: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async sync(dataTypes?: string[]): Promise<any[]> {
    if (!this.sdk) {
      throw new Error('Extension not connected');
    }

    const types = dataTypes || this.supportedDataTypes;
    const results: any[] = [];

    try {
      for (const type of types) {
        switch (type) {
          case 'portfolios':
            // This would need wallet addresses from the user's configuration
            // For now, we'll return empty array
            results.push({
              type: 'portfolios',
              data: [],
              normalizedData: []
            });
            break;
            
          case 'transactions':
            // Similar to portfolios, needs specific wallet addresses
            results.push({
              type: 'transactions',
              data: [],
              normalizedData: []
            });
            break;
            
          case 'positions':
            results.push({
              type: 'positions',
              data: [],
              normalizedData: []
            });
            break;
            
          case 'nfts':
            results.push({
              type: 'nfts',
              data: [],
              normalizedData: []
            });
            break;
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getWalletPortfolio(address: string): Promise<any> {
    if (!this.sdk) {
      throw new Error('Extension not connected');
    }

    try {
      const portfolio = await this.sdk.wallets.getPortfolio(address);
      return this.normalizeData(portfolio, 'portfolio');
    } catch (error) {
      this.handleError(error);
    }
  }
}