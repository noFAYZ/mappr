// lib/wallet-analytics/types.ts
export interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface WalletPosition {
  id: string;
  attributes: {
    value: number;
    quantity_float: number;
    position_type: string;
    fungible_info: {
      symbol: string;
      name: string;
    };
    changes: {
      percent_1d: number;
    };
  };
  relationships: {
    chain: {
      data: {
        id: string;
      };
    };
  };
}

export interface NFTPosition {
  id: string;
  attributes: {
    nft_info: {
      token_id: string;
      name?: string;
      contract_address: string;
      interface: string;
      content?: {
        preview?: {
          url: string;
        };
      };
      flags?: {
        is_spam: boolean;
      };
    };
    collection_info?: {
      name: string;
    };
    last_price?: number;
    created_at?: number;
  };
  relationships: {
    chain: {
      data: {
        id: string;
      };
    };
  };
}

export interface Transaction {
  id: string;
  attributes: {
    operation_type: string;
    value: number;
    mined_at: number;
    hash: string;
    fee?: {
      value: number;
    };
  };
  relationships: {
    chain: {
      data: {
        id: string;
      };
    };
  };
}

export interface PortfolioData {
  portfolio?: {
    total: number;
    changes?: {
      percent_1d: number;
      absolute_1d: number;
    };
    all_time_high?: number;
  };
  positions?: WalletPosition[];
  pnl?: {
    unrealized_gain: number;
    realized_gain: number;
    total_fee: number;
    net_invested: number;
  };
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  date: string;
}

export interface ChartMetrics {
  current: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  high: number;
  low: number;
}

export type ViewMode = "grid" | "list";
export type SortOption = "recent" | "price" | "name" | "value";
export type TabKey = "tokens" | "nfts" | "transactions";
export type Period = "1h" | "24h" | "1w" | "1m" | "1y";

export interface WalletAnalyticsProps {
  address: string;
  showBalance?: boolean;
  onShowBalanceChange?: (show: boolean) => void;
  className?: string;
}
