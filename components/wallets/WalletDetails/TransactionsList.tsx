import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Pagination,
  Tooltip,
  Avatar,
  Divider,
  Badge,
  Switch,
} from "@heroui/react";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Copy,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc,
  Hash,
  Clock,
  Flame,
  Sparkles,
  Shield,
  Coins,
  Repeat,
  ChevronRight,
  Activity,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowDown,
  ArrowUp,
  Wallet,
  DollarSign,
  Fuel,
  Link,
  User,
  Building2,
  Filter,
  MoreVertical,
  Layers,
  Star,
} from "lucide-react";
import { SolarGasStationBoldDuotone, UimClock } from "@/components/icons/icons";
import { formatRelativeTime, timestampzPresets, timestampzToReadable } from "@/lib/utils/time";

// Database types
interface WalletTransaction {
  id: string;
  wallet_id: string;
  hash: string;
  status: string | null;
  timestamp: string | null;
  block_number: number | null;
  gas_used: number | null;
  gas_price: number | null;
  fee: number | null;
  value: number | null;
  direction: string | null;
  chain_id: string | null;
  from_address: string | null;
  to_address: string | null;
  transaction_type: string | null;
  created_at: string | null;
  metadata: {
    hash: string;
    operationType: string;
    nonce?: number;
    fee?: {
      amount: number;
      currency: string;
      price?: number;
      value?: number;
      details?: any;
    };
    asset?: {
      name?: string;
      symbol?: string;
      address?: string;
      decimals?: number;
      isNFT: boolean;
      tokenId?: string;
      verified: boolean;
      icon?: string;
      interface?: string;
    };
    application?: {
      name?: string;
      icon?: string;
      contractAddress?: string;
      method?: any;
      dapp?: {
        type: string;
        id: string;
      };
    };
    actions?: Array<{
      id: string;
      type: string;
      applicationMetadata?: any;
    }>;
    transfers?: Array<{
      direction: string;
      quantity: number;
      quantityDetails?: any;
      recipient?: string;
      sender?: string;
      asset: string;
      assetInfo?: any;
      isNFT: boolean;
      tokenId?: string;
      actId?: string;
      price?: number;
      value?: number;
    }>;
    approvals?: Array<{
      asset: string;
      assetInfo?: any;
      quantity: number;
      quantityDetails?: any;
      sender?: string;
      actId?: string;
    }>;
    isTrash?: boolean;
    relationships?: any;
    normalized: boolean;
    normalizedAt: string;
    originalDataInfo?: any;
    originalTransaction?: any;
  } | null;
}

interface TransactionsListProps {
  walletId: string;
  transactions: WalletTransaction[];
  showBalances: boolean;
  onShowBalancesChange?: (show: boolean) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onTransactionClick?: (transaction: WalletTransaction) => void;
}

interface FilterOptions {
  search: string;
  type: string;
  status: string;
  timeRange: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  hideSpam: boolean;
}

// Configuration constants
const TRANSACTION_CONFIGS = {
  send: { 
    icon: ArrowUpRight, 
    label: "Sent", 
    direction: "out",
    variant: "danger"
  },
  receive: { 
    icon: ArrowDownLeft, 
    label: "Received", 
    direction: "in",
    variant: "success"
  },
  trade: { 
    icon: ArrowRightLeft, 
    label: "Traded", 
    direction: "both",
    variant: "warning"
  },
  swap: { 
    icon: Repeat, 
    label: "Swapped", 
    direction: "both",
    variant: "primary"
  },
  approve: { 
    icon: Shield, 
    label: "Approved", 
    direction: "none",
    variant: "secondary"
  },
  burn: { 
    icon: Flame, 
    label: "Burned", 
    direction: "out",
    variant: "danger"
  },
  mint: { 
    icon: Sparkles, 
    label: "Minted", 
    direction: "in",
    variant: "success"
  },
  deposit: { 
    icon: TrendingUp, 
    label: "Deposited", 
    direction: "in",
    variant: "primary"
  },
  execute: { 
    icon: Zap, 
    label: "Executed", 
    direction: "none",
    variant: "warning"
  },
  default: { 
    icon: Activity, 
    label: "Transaction", 
    direction: "none",
    variant: "default"
  },
} as const;

const NETWORK_CONFIGS = {
  ethereum: { 
    name: "ETH", 
    color: "primary",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png" 
  },
  polygon: { 
    name: "MATIC", 
    color: "secondary",
    icon: "https://cryptologos.cc/logos/polygon-matic-logo.png" 
  },
  arbitrum: { 
    name: "ARB", 
    color: "primary",
    icon: "https://cryptologos.cc/logos/arbitrum-arb-logo.png" 
  },
  optimism: { 
    name: "OP", 
    color: "danger",
    icon: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png" 
  },
  base: { 
    name: "BASE", 
    color: "primary",
    icon: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4" 
  },
  default: { 
    name: "UNKNOWN", 
    color: "default",
    icon: null 
  },
} as const;

// Utility functions
const getTransactionConfig = (type: string | null, direction: string | null) => {
  if (!type) {
    return direction === "in" 
      ? TRANSACTION_CONFIGS.receive 
      : TRANSACTION_CONFIGS.send;
  }
  return TRANSACTION_CONFIGS[type.toLowerCase() as keyof typeof TRANSACTION_CONFIGS] || TRANSACTION_CONFIGS.default;
};

const getNetworkConfig = (chain: string | null) => {
  if (!chain) return NETWORK_CONFIGS.default;
  return NETWORK_CONFIGS[chain.toLowerCase() as keyof typeof NETWORK_CONFIGS] || NETWORK_CONFIGS.default;
};

const formatCurrency = (amount: number | null, currency?: string, showBalance: boolean = true) => {
  if (!showBalance) return "••••";
  if (!amount) return "0";
  
  const absAmount = Math.abs(amount);
  const currencySymbol = currency || "";
  
  if (absAmount >= 1000000) {
    return `${(absAmount / 1000000).toFixed(2)}M ${currencySymbol}`;
  } else if (absAmount >= 1000) {
    return `${(absAmount / 1000).toFixed(2)}K ${currencySymbol}`;
  } else if (absAmount < 0.01 && absAmount !== 0) {
    return `<0.01 ${currencySymbol}`;
  }
  
  return `${absAmount.toFixed(4)} ${currencySymbol}`;
};

const formatUSDValue = (value: number | null, showBalance: boolean = true) => {
  if (!showBalance) return "••••";
  if (!value || value === 0) return "";
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1000000) {
    return `$${(absValue / 1000000).toFixed(2)}M`;
  } else if (absValue >= 1000) {
    return `$${(absValue / 1000).toFixed(2)}K`;
  } else if (absValue < 0.01 && absValue !== 0) {
    return "<$0.01";
  }
  
  return `$${absValue.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

const formatAddress = (address: string | null) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

// Summary Stats Component
const TransactionsSummary: React.FC<{
  transactions: WalletTransaction[];
  filteredCount: number;
}> = ({ transactions, filteredCount }) => {
  const stats = useMemo(() => {
    const confirmed = transactions.filter(tx => tx.status === "confirmed").length;
    const pending = transactions.filter(tx => tx.status === "pending").length;
    const failed = transactions.filter(tx => tx.status === "failed").length;
    const totalValue = transactions.reduce((sum, tx) => sum + Math.abs(tx.value || 0), 0);

    return { confirmed, pending, failed, totalValue };
  }, [transactions]);

  const summaryCards = [
    {
      label: "Total",
      value: transactions.length,
      icon: Activity,
      color: "default",
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "success",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      color: "warning",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "danger",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((stat) => (
        <Card key={stat.label} className="border-divider bg-default-100  backdrop-blur-sm">
          <CardBody className="p-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-500/20`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-medium font-bold text-foreground">{stat.value.toLocaleString()}</p>
                <p className="text-[10px] text-default-600 uppercase">{stat.label}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

// Transaction Row Component
const TransactionRow: React.FC<{
  transaction: WalletTransaction;
  showBalance: boolean;
  onCopyHash: (hash: string) => void;
  onClick?: () => void;
}> = ({ transaction, showBalance, onCopyHash, onClick }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = useCallback(async (e: React.MouseEvent, hash: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
      onCopyHash(hash);
    } catch (err) {
      console.error("Failed to copy hash:", err);
    }
  }, [onCopyHash]);

  const metadata = transaction.metadata;
  const application = metadata?.application;
  const asset = metadata?.asset;
  const transfers = metadata?.transfers || [];
  const approvals = metadata?.approvals || [];

  const txConfig = getTransactionConfig(transaction.transaction_type, transaction.direction);
  const networkConfig = getNetworkConfig(transaction.chain_id);
  const Icon = txConfig.icon;

  const displayValue = transaction.value || 0;
  const displayCurrency = asset?.symbol || "ETH";
  const hasMultipleTransfers = transfers.length > 1;
  const hasApprovals = approvals.length > 0;
  const isNFT = asset?.isNFT;

  const totalUSDValue = useMemo(() => {
    const mainValue = metadata?.fee?.value || 0;
    const transferValues = transfers.reduce((sum, transfer) => sum + (transfer.value || 0), 0);
    return mainValue + transferValues;
  }, [metadata, transfers]);

  const inTransfer = transfers.find(t => t.direction === "in");
  const outTransfer = transfers.find(t => t.direction === "out");

  return (
    <Card 
      className="group border-divider  backdrop-blur-sm hover:bg-content2/80  cursor-pointer"
      onClick={onClick}
    >
      <CardBody className="p-2">
        <div className="flex items-start gap-4">
          {/* Transaction Icon with Network Badge */}
          <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${txConfig.variant}-100 dark:bg-${txConfig.variant}-900/20 border border-divider shadow-xl`}>
              <Icon className={`w-5 h-5 text-${txConfig.variant}-600 dark:text-${txConfig.variant}-400`} />
            </div>

            {/* Network Badge */}
            <div className="absolute -bottom-1 -right-1">
              <Avatar
                size="sm"
                src={networkConfig.icon}
                className="w-4 h-4 border border-background"
                fallback={
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold bg-${networkConfig.color}-500`}>
                    {networkConfig.name[0]}
                  </div>
                }
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full min-w-0 space-y-1">
            {/* Header Row */}
            <div className="flex  justify-between">
            
                <div className="flex items-center gap-2 ">
                  <span className="font-semibold text-foreground text-sm">{txConfig.label}</span>
                  
                {/*   {application?.name && (
                    <>
                      <span className="text-default-400 text-sm">via</span>
                      <Chip className="h-6"
                      variant="faded"
                      startContent= {application?.icon && (
                        <Avatar
                          size="sm"
                          src={application.icon}
                          className="w-4 h-4"
                          fallback={<Building2 className="w-3 h-3" />}
                        />
                      )}
                      >
                     
                      <span className="text-xs text-default-600 font-medium truncate">
                        {application.name}
                      </span></Chip>
                    </>
                  )} */}

                   {/* Asset details */}
                {asset?.name && (
                  <Chip className="h-6 rounded-lg"
                      variant="faded"
                  startContent= {asset.icon && (
                      <Avatar size="sm" src={asset.icon} className="w-4 h-4" />
                    )}
                  >
                   
                    <span className="text-xs text-default-600 font-medium truncate">{asset.name}</span>
                   
                  </Chip>
                )}
                </div>
                
               
            

                 {/* Trade/Swap Details */}
            {(transaction.transaction_type === "trade" || transaction.transaction_type === "swap") && inTransfer && outTransfer && (
           <div className="flex w-full justify-center">
         
                <div className="flex w-fit  items-center justify-between gap-4 bg-primary-500/15 px-2 rounded-xl">
                  <div className="flex items-center gap-2 ">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-danger-500" />
                      
                    </div>
                    <span className="font-medium text-xs">
                      {formatCurrency(outTransfer.quantity, outTransfer.asset, showBalance)}
                    </span>
                  </div>
                  
                  {application && (<Chip className="h-6 rounded-lg"
                      variant="faded"
                      startContent= {application?.icon && (
                        <Avatar
                          size="sm"
                          src={application.icon}
                          className="w-4 h-4"
                          fallback={<Building2 className="w-3 h-3" />}
                        />
                      )}
                      >
                     
                      <span className="text-xs text-default-600 font-medium truncate">
                        {application.name}
                      </span></Chip>)} 
                  
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-medium text-xs">
                      {formatCurrency(inTransfer.quantity, inTransfer.asset, showBalance)}
                    </span>
                    <div className="flex items-center gap-1">
                     
                      <ArrowDown className="w-3 h-3 text-success-500" />
                    </div>
                  </div>
                </div>
           </div>
            )}

              {/* Value Display */}
              <div className="text-right flex-shrink-0">
                <div className={`font-bold text-sm ${
                  transaction.direction === "in" ? "text-success-600" :
                  transaction.direction === "out" ? "text-danger-600" :
                  "text-foreground"
                }`}>
                  {transaction.direction === "in" && "+"}
                  {transaction.direction === "out" && "-"}
                  {formatCurrency(displayValue, displayCurrency, showBalance)}
                </div>
                
                {totalUSDValue > 0 && (
                  <div className="text-xs font-medium text-default-600 flex items-center justify-end gap-1">
                  
                    {formatUSDValue(totalUSDValue, showBalance)}
                  </div>
                )}
              </div>
            </div>

         

            {/* Transaction Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-default-500">
       
                
                {/* Time */}
                {transaction.timestamp && (
                  <div className="flex items-center text-[10px] gap-1">
                    <UimClock className="w-3 h-3" />
                    <span>{timestampzPresets.relative(transaction.timestamp)}</span>
                  </div>
                )}
                
       

                {/* Fee */}
                {transaction.fee && (
                  <div className="flex items-center text-[10px] gap-1">
                    <SolarGasStationBoldDuotone className="w-3 h-3" />
                    <span>{formatCurrency(transaction.fee, "ETH", showBalance)}</span>
                  </div>
                )}
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {isNFT && (
                    <Chip size="sm" variant="flat" color="secondary" className="h-5 text-[10px] rounded-md">NFT</Chip>
                  )}
                  
                  {hasMultipleTransfers && (
                    <Chip size="sm" variant="flat" color="primary"  className="h-5 text-[10px] rounded-md bg-primary-500/20">
                      {transfers.length} transfers
                    </Chip>
                  )}
                  
                  {hasApprovals && (
                    <Chip size="sm" variant="flat" color="warning" className="h-5 text-[10px] rounded-md ">
                      {approvals.length} approval{approvals.length > 1 ? 's' : ''}
                    </Chip>
                  )}
                  
                  {metadata?.isTrash && (
                    <Chip size="sm" variant="flat" color="danger">Spam</Chip>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip content="View on explorer">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="h-8 w-8 min-w-8"
                      onPress={(e) => {
                       
                        const explorerUrl = `https://etherscan.io/tx/${transaction.hash}`;
                        window.open(explorerUrl, "_blank");
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  
                  <ChevronRight className="w-4 h-4 text-default-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Skeleton Loader
const TransactionRowSkeleton: React.FC = () => (
  <Card className="border-divider bg-content1/50">
    <CardBody className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-default-200 rounded-xl animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-default-200 rounded-full animate-pulse" />
              <div className="h-4 bg-default-200 rounded w-32 animate-pulse" />
            </div>
            <div className="h-6 bg-default-200 rounded w-20 animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 bg-default-200 rounded w-48 animate-pulse" />
            <div className="h-3 bg-default-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
);

// Main Component
export const TransactionsList: React.FC<TransactionsListProps> = ({
  walletId,
  transactions,
  showBalances,
  onShowBalancesChange,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onTransactionClick,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    type: "all",
    status: "all",
    timeRange: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
    hideSpam: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const transactionTypes = useMemo(() => {
    const types = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.transaction_type) {
        types.add(tx.transaction_type);
      }
    });
    return Array.from(types).map((type) => ({
      key: type,
      label: TRANSACTION_CONFIGS[type as keyof typeof TRANSACTION_CONFIGS]?.label || 
             type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((tx) => {
        const searchableFields = [
          tx.hash,
          tx.transaction_type,
          tx.from_address,
          tx.to_address,
          tx.metadata?.application?.name,
          tx.metadata?.asset?.name,
          tx.metadata?.asset?.symbol,
        ].filter(Boolean);

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((tx) => tx.transaction_type === filters.type);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    if (filters.timeRange !== "all" && filters.timeRange) {
      const now = new Date();
      const ranges: Record<string, number> = {
        "1d": 1, "7d": 7, "30d": 30, "90d": 90,
      };
      
      if (ranges[filters.timeRange]) {
        const cutoff = new Date(now.getTime() - ranges[filters.timeRange] * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((tx) => 
          tx.timestamp ? new Date(tx.timestamp) >= cutoff : false
        );
      }
    }

    if (filters.hideSpam) {
      filtered = filtered.filter((tx) => !tx.metadata?.isTrash);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case "timestamp":
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case "value":
          comparison = (a.value || 0) - (b.value || 0);
          break;
        case "type":
          comparison = (a.transaction_type || "").localeCompare(b.transaction_type || "");
          break;
        case "fee":
          comparison = (a.fee || 0) - (b.fee || 0);
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [transactions, filters]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== "" ||
      filters.type !== "all" ||
      filters.status !== "all" ||
      filters.timeRange !== "all" ||
      !filters.hideSpam
    );
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      timeRange: "all",
      sortBy: "timestamp",
      sortOrder: "desc",
      hideSpam: true,
    });
    setCurrentPage(1);
  }, []);

  const handleCopyHash = useCallback((hash: string) => {
    console.log(`Copied hash: ${hash}`);
  }, []);

  console.log("Filtered Transactions:", filteredTransactions);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Transaction History</h3>
          <p className="text-xs text-default-600 ">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="faded"
            className="text-xs"
            size="sm"
            startContent={<Filter className="w-3.5 h-3.5" />}
            onPress={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          
   
        </div>
      </div>

      {/* Summary Stats */}
      <TransactionsSummary transactions={transactions} filteredCount={filteredTransactions.length} />

      {/* Enhanced Filters */}
      {showFilters && (
        <Card className="border-divider bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onValueChange={(value) => handleFilterChange("search", value)}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                isClearable
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-7 bg-background/50 border-default-300",
                }}
              />

              {/* Type Filter */}
              <Select
                placeholder="All types"
                selectedKeys={filters.type !== "all" ? [filters.type] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleFilterChange("type", value || "all");
                }}
                variant="bordered"
                classNames={{
                  trigger: "h-10 bg-background/50 border-default-300",
                }}
              >
                <SelectItem key="all">All Types</SelectItem>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.key}>{type.label}</SelectItem>
                ))}
              </Select>

              {/* Status Filter */}
              <Select
                placeholder="All statuses"
                selectedKeys={filters.status !== "all" ? [filters.status] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleFilterChange("status", value || "all");
                }}
                variant="bordered"
                classNames={{
                  trigger: "h-10 bg-background/50 border-default-300",
                }}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="confirmed">Confirmed</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="failed">Failed</SelectItem>
              </Select>

              {/* Time Range Filter */}
              <Select
                placeholder="All time"
                selectedKeys={filters.timeRange !== "all" ? [filters.timeRange] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleFilterChange("timeRange", value || "all");
                }}
                variant="bordered"
                classNames={{
                  trigger: "h-10 bg-background/50 border-default-300",
                }}
              >
                <SelectItem key="all">All Time</SelectItem>
                <SelectItem key="1d">Last 24 hours</SelectItem>
                <SelectItem key="7d">Last 7 days</SelectItem>
                <SelectItem key="30d">Last 30 days</SelectItem>
                <SelectItem key="90d">Last 90 days</SelectItem>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select
                  placeholder="Sort by"
                  selectedKeys={[filters.sortBy]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleFilterChange("sortBy", value || "timestamp");
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "h-10 flex-1 bg-background/50 border-default-300",
                  }}
                >
                  <SelectItem key="timestamp">Date</SelectItem>
                  <SelectItem key="value">Value</SelectItem>
                  <SelectItem key="type">Type</SelectItem>
                  <SelectItem key="fee">Fee</SelectItem>
                </Select>
                
                <Button
                  isIconOnly
                  variant="bordered"
                  className="h-10 w-10 min-w-10 bg-background/50 border-default-300"
                  onPress={() => handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                >
                  {filters.sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-divider">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch
                    size="sm"
                    isSelected={filters.hideSpam}
                    onValueChange={(checked) => handleFilterChange("hideSpam", checked)}
                  />
                  <span className="text-default-600">Hide spam transactions</span>
                </label>
              </div>

              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={handleClearFilters}
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <TransactionRowSkeleton key={index} />
            ))}
          </div>
        ) : paginatedTransactions.length > 0 ? (
          <>
            {paginatedTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                showBalance={showBalances}
                onCopyHash={handleCopyHash}
                onClick={() => onTransactionClick?.(transaction)}
              />
            ))}
          </>
        ) : (
          <Card className="border-divider bg-content1/50">
            <CardBody className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-default-100 dark:bg-default-800 rounded-full flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-default-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">No transactions found</h3>
              <p className="text-default-500 text-sm mb-4 max-w-sm">
                {hasActiveFilters
                  ? "No transactions match your current filters. Try adjusting your search criteria."
                  : "This wallet doesn't have any transactions yet. Once you start using this wallet, your transaction history will appear here."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="flat"
                  color="primary"
                  onPress={handleClearFilters}
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  Clear all filters
                </Button>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card className="border-divider bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="text-sm text-default-500 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-4">
                {/* Items per page */}
                <Select
                  size="sm"
                  selectedKeys={[itemsPerPage.toString()]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "h-8 min-h-8 bg-background/50 border-default-300",
                  }}
                  placeholder="Per page"
                >
                  <SelectItem key="5">5 per page</SelectItem>
                  <SelectItem key="10">10 per page</SelectItem>
                  <SelectItem key="20">20 per page</SelectItem>
                  <SelectItem key="50">50 per page</SelectItem>
                </Select>

                {/* Pagination */}
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  showControls
                  size="sm"
                  classNames={{
                    wrapper: "gap-0 overflow-visible",
                    item: "w-8 h-8 text-small rounded-lg bg-background/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-default-300",
                    cursor: "bg-primary-500 text-white font-medium",
                    prev: "bg-background/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-default-300",
                    next: "bg-background/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-default-300",
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TransactionsList;