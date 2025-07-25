export interface ExtensionConfig {
    baseUrl?: string;
    version?: string;
    timeout?: number;
    retries?: number;
    [key: string]: any;
  }
  
  export interface ExtensionCredentials {
    apiKey?: string;
    secretKey?: string;
    accessToken?: string;
    refreshToken?: string;
    publicToken?: string;
    shopDomain?: string;
    companyId?: string;
    [key: string]: any;
  }
  
  export interface NormalizedTransaction {
    id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    currency: string;
    description: string;
    date: string;
    account?: string;
    category?: string;
    metadata: Record<string, any>;
  }
  
  export interface NormalizedBalance {
    account: string;
    amount: number;
    currency: string;
    type: 'crypto' | 'fiat' | 'token';
    symbol?: string;
    metadata: Record<string, any>;
  }
  
  export interface NormalizedPosition {
    asset: string;
    symbol: string;
    amount: number;
    value: number;
    currency: string;
    type: 'spot' | 'futures' | 'option' | 'stake';
    metadata: Record<string, any>;
  }
  
  