// components/WalletAnalytics/TokensList.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  Pagination,
  Select,
  SelectItem,
  Button,
  Spinner
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  RefreshCw,
  Sparkles,
  Filter,
  Zap,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

import { formatCurrency } from '@/lib/wallet-analytics/utils';
import type { WalletPosition } from '@/lib/wallet-analytics/types';
import clsx from 'clsx';
import GooeyLoader from '@/components/shared/loader';
import { TokensListControls } from './TokensListControls';
import { TokenRow, TokenRowSkeleton, ProcessedToken } from './TokenRow';
import { LogoLoader } from '@/components/icons';

// Types
interface TokensListProps {
  walletId: string;
  positions: WalletPosition[];
  showBalance: boolean;
  onShowBalanceChange?: (show: boolean) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

type SortMode = 'value' | 'change' | 'quantity' | 'alphabetical' | 'price';
type FilterMode = 'all' | 'verified' | 'highValue' | 'gainers' | 'losers';

// Constants
const DUST_THRESHOLD = 0.01;
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 25;

// Main Component
export const TokensList: React.FC<TokensListProps> = ({ 
  walletId,
  positions = [],
  showBalance,
  onShowBalanceChange,
  isLoading = false,
  isRefreshing = false,
  onRefresh
}) => {
  // State management
  const [processedTokens, setProcessedTokens] = useState<ProcessedToken[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('value');
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [hideZeroValues, setHideZeroValues] = useState(true);
  const [hideDustTokens, setHideDustTokens] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Process positions into normalized token format
  const processPositions = useCallback((positions: WalletPosition[]) => {
    if (!Array.isArray(positions)) {
      console.warn('TokensList: positions is not an array:', positions);
      return [];
    }

    const totalValue = positions.reduce((sum, pos) => 
      sum + (pos.attributes?.value  ||pos?.value|| 0), 0
    );




    return positions.map((position, index) => ({
      id: position.id || `${walletId}-${index}`,
      symbol: position.attributes?.fungible_info?.symbol || position.attributes?.symbol ||position?.symbol || 'Unknown',
      name: position.attributes?.fungible_info?.name || position.attributes?.name || position?.name || 'Unknown Asset',
      value: position.attributes?.value  || position?.value || 0,
      quantity: position.attributes?.quantity?.numeric || position.attributes?.quantity_float ||  position?.quantity || 0,
      price: position.attributes?.price || position?.price || 0,
      change24h: position.attributes?.change24h || position?.change24h || 0,
      chainId: position.attributes?.chain || position?.chain || '',
      isVerified: position.attributes?.verified  || position?.is_verified || false,
      tokenAddress: position.attributes?.fungible_info?.implementations?.[0]?.address || position.attributes?.address || position?.address || '',
      icon: position.attributes?.fungible_info?.icon?.url || position.attributes?.icon || position?.icon_url || '',
      percentage: totalValue > 0 ? ((position.attributes?.value ||position?.value || 0) / totalValue) * 100 : 0 
    }));
  }, [walletId]);

  // Update processed tokens when positions or walletId changes
  useEffect(() => {
    setLocalLoading(true);
    
    const timer = setTimeout(() => {
      try {
        const processed = processPositions(positions);
        setProcessedTokens(processed);
        setCurrentPage(1); // Reset to first page when data changes
      } catch (error) {
        console.error('TokensList: Error processing positions:', error);
        setProcessedTokens([]);
      } finally {
        setLocalLoading(false);
      }
    }, isLoading ? 0 : 100);

    return () => clearTimeout(timer);
  }, [positions, walletId, processPositions, isLoading]);

  // Reset filters and pagination when wallet changes
  useEffect(() => {
    setSearchQuery('');
    setFilterMode('all');
    setCurrentPage(1);
    setCopiedAddress(null);
  }, [walletId]);

  // Filter and sort tokens
  const filteredAndSortedTokens = useMemo(() => {
    let filtered = processedTokens.filter(token => {
      // Value filters
      if (hideZeroValues && token.value <= 0) return false;
      if (hideDustTokens && token.value > 0 && token.value <= DUST_THRESHOLD) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.tokenAddress.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filters
      switch (filterMode) {
        case 'verified':
          return token.isVerified;
        case 'highValue':
          return token.value >= 1000;
        case 'gainers':
          return token.change24h > 0;
        case 'losers':
          return token.change24h < 0;
        default:
          return true;
      }
    });

    // Sort tokens
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortMode) {
        case 'value':
          comparison = b.value - a.value;
          break;
        case 'change':
          comparison = b.change24h - a.change24h;
          break;
        case 'quantity':
          comparison = b.quantity - a.quantity;
          break;
        case 'price':
          comparison = b.price - a.price;
          break;
        case 'alphabetical':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        default:
          comparison = 0;
      }

      return sortAscending ? -comparison : comparison;
    });

    return filtered;
  }, [processedTokens, searchQuery, sortMode, sortAscending, filterMode, hideZeroValues, hideDustTokens]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTokens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTokens = filteredAndSortedTokens.slice(startIndex, endIndex);

  // Portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const validTokens = processedTokens.filter(token => token.value > 0);
    const totalValue = validTokens.reduce((sum, token) => sum + token.value, 0);
    const totalGainers = validTokens.filter(token => token.change24h > 0).length;
    const totalLosers = validTokens.filter(token => token.change24h < 0).length;

    return {
      totalValue,
      totalTokens: validTokens.length,
      totalGainers,
      totalLosers
    };
  }, [processedTokens]);

  // Utility functions
  const handleCopyAddress = useCallback(async (tokenAddress: string) => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopiedAddress(tokenAddress);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of list
    const element = document.getElementById('tokens-list-top');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Loading state
  if (isLoading || localLoading) {
    return (
      <Card className="border-none shadow-sm">
        <CardBody className="py-20">
          <div className="text-center">
            <div className="relative mb-6">
              <GooeyLoader />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-default-500 font-medium">Loading tokens...</p>
            <p className="text-xs text-default-400 mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Analyzing portfolio for wallet
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // No tokens state
  if (processedTokens.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardBody className="py-20">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
              <Coins className="w-10 h-10 text-primary relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              No Tokens Found
            </h3>
            <p className="text-default-500 mb-6">
              This wallet doesn't have any token positions, or they haven't been synced yet.
            </p>
            {onRefresh && (
              <Button 
                variant="flat" 
                color="primary" 
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={onRefresh}
                isLoading={isRefreshing}
                className="relative overflow-hidden"
              >
                <span className="relative z-10">Refresh Data</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 hover:opacity-100 transition-opacity"></div>
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-2 p-2" id="tokens-list-top">
      {/* Enhanced Controls */}
      <TokensListControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        sortAscending={sortAscending}
        onSortDirectionChange={setSortAscending}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
        hideZeroValues={hideZeroValues}
        onHideZeroValuesChange={setHideZeroValues}
        hideDustTokens={hideDustTokens}
        onHideDustTokensChange={setHideDustTokens}
        showBalance={showBalance}
        onShowBalanceChange={onShowBalanceChange || (() => {})}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        totalTokens={processedTokens.length}
        filteredTokens={filteredAndSortedTokens.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Portfolio Summary Card */}
      {filteredAndSortedTokens.length > 0 && (
        <Card className="border border-divider shadow-sm rounded-2xl">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-default-500 font-medium uppercase tracking-wide">Total Value</p>
                  <p className="text-xl font-bold  bg-clip-text">
                    {formatCurrency(portfolioMetrics.totalValue, showBalance)}
                  </p>
                </div>
                
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center text-success">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-sm font-medium">{portfolioMetrics.totalGainers}</span>
                    </div>
                    <p className="text-xs text-default-500">Gainers</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center text-danger">
                      <TrendingDown className="w-3 h-3" />
                      <span className="text-sm font-medium">{portfolioMetrics.totalLosers}</span>
                    </div>
                    <p className="text-xs text-default-500">Losers</p>
                  </div>
                </div>
              </div>

            
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tokens List */}
      <Card className="border border-divider shadow-sm rounded-3xl">
      
          {isLoading ? (
            <div className="divide-y divide-default-100">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <TokenRowSkeleton key={index} />
              ))}
            </div>
          ) : paginatedTokens.length > 0 ? (
            <div className="divide-y divide-default-200/50">
              <AnimatePresence mode="popLayout">
                {paginatedTokens.map((token, index) => (
                  <TokenRow
                    key={token.id}
                    token={token}
                    index={index}
                    showBalance={showBalance}
                    portfolioTotalValue={portfolioMetrics.totalValue}
                    onCopyAddress={handleCopyAddress}
                    copiedAddress={copiedAddress}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-16">
              <NoResultsState
                searchQuery={searchQuery}
                filterMode={filterMode}
                onClearSearch={() => setSearchQuery('')}
                onResetFilters={() => {
                  setFilterMode('all');
                  setHideZeroValues(false);
                  setHideDustTokens(false);
                }}
              />
            </div>
          )}
   
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-default-500 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedTokens.length)} of {filteredAndSortedTokens.length} tokens
            </span>
          </div>
          
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            showShadow
            color="primary"
            size="sm"
            classNames={{
              wrapper: "gap-0 overflow-visible",
              item: "w-8 h-8 text-small rounded-lg bg-transparent hover:bg-default-100",
              cursor: "bg-gradient-to-b shadow-lg from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white font-semibold rounded-lg"
            }}
          />
        </div>
      )}

      {/* Loading overlay for refresh */}
      {isRefreshing && (
        <div className="fixed inset-0  bg-blur backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="border border-divider shadow-lg">
            <CardBody className="flex items-center gap-3 p-6">
              <LogoLoader className='w-10 h-10'  />
              <span className="text-sm font-medium">Refreshing tokens...</span>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

// No Results Component
const NoResultsState = ({
  searchQuery,
  filterMode,
  onClearSearch,
  onResetFilters
}: {
  searchQuery: string;
  filterMode: string;
  onClearSearch: () => void;
  onResetFilters: () => void;
}) => (
  <div className="text-center max-w-md mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
      <Filter className="w-8 h-8 text-primary relative z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse"></div>
    </div>
    
    <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      No matches found
    </h3>
    
    <p className="text-sm text-default-500 mb-6">
      {searchQuery && (
        <>No tokens match <span className="font-medium text-primary">"{searchQuery}"</span></>
      )}
      {filterMode !== 'all' && (
        <> with <span className="font-medium text-secondary">"{filterMode}"</span> filter applied</>
      )}
    </p>
    
    <div className="flex items-center justify-center gap-3">
      {searchQuery && (
        <Button 
          variant="flat" 
          color="primary"
          size="sm"
          onPress={onClearSearch}
          startContent={<Filter className="w-4 h-4" />}
          className="relative overflow-hidden"
        >
          <span className="relative z-10">Clear Search</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 hover:opacity-100 transition-opacity"></div>
        </Button>
      )}
      
      {(filterMode !== 'all' || searchQuery) && (
        <Button 
          variant="flat" 
          color="secondary"
          size="sm"
          onPress={onResetFilters}
          startContent={<RefreshCw className="w-4 h-4" />}
          className="relative overflow-hidden"
        >
          <span className="relative z-10">Reset All</span>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-0 hover:opacity-100 transition-opacity"></div>
        </Button>
      )}
    </div>
  </div>
);

// Export the main component and types
export default TokensList;
export type { ProcessedToken, SortMode, FilterMode };