// lib/wallet-analytics/utils.ts
import { SUPPORTED_CHAINS, NFT_RARITY_LEVELS } from './constants';
import type { Chain, ChartDataPoint, ChartMetrics } from './types';

export const formatCurrency = (value: number | undefined, showBalance = true, compact = false): string => {
  if (!showBalance) return '••••••';
  
  const numValue = Number(value) || 0;
  
  if (compact) {
    if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `$${(numValue / 1000).toFixed(1)}K`;
    if (numValue >= 1) return `$${(numValue / 1000).toFixed(2)}`;
    if (numValue >= 0.01) return `$${(numValue / 1000).toFixed(3)}`;
    if (numValue >= 0.001) return `$${(numValue / 1000).toFixed(4)}`;
    if (numValue >= 0.0001) return `$${(numValue / 1000).toFixed(5)}`;
    if (numValue >= 0.00001) return `$${(numValue / 1000).toFixed(6)}`;
    if (numValue >= 0.000001) return `$${(numValue / 1000).toFixed(7)}`;
    const formatted = numValue.toFixed(10);
    return `${parseFloat(formatted)}`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: numValue >= 1000000 ? 'compact' : 'standard',
    maximumFractionDigits: numValue >= 1000 ? 1 : 2
  }).format(numValue);
};

export const formatNumber = (value: number | undefined, showBalance = true): string => {
  if (!showBalance) return '••••••';
  const num = Number(value) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(4);
};

export const formatPercent = (value: number | undefined): string => {
  const numValue = Number(value) || 0;
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
};

export const formatTokenId = (tokenId: string | undefined): string => {
  if (!tokenId) return 'N/A';
  if (tokenId.length > 10) {
    return `#${tokenId.slice(0, 6)}...${tokenId.slice(-4)}`;
  }
  return `#${tokenId}`;
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const getChainInfo = (chainId: string): Chain => {
  return SUPPORTED_CHAINS.find(c => c.id === chainId) || 
         { id: chainId, name: 'Unknown', color: '#6B7280', icon: '?' };
};

export const getUniqueChains = (positions: any[]): string[] => {
  if (!positions) return [];
  const chains = new Set<string>();
  positions.forEach(position => {
    const chainId = position.relationships?.chain?.data?.id;
    if (chainId && SUPPORTED_CHAINS.find(c => c.id === chainId)) {
      chains.add(chainId);
    }
  });
  return Array.from(chains);
};

export const calculateChartMetrics = (chartData: ChartDataPoint[]): ChartMetrics | null => {
  if (!chartData || chartData.length < 2) return null;
  
  const values = chartData.map(p => p.value);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const change = lastValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  
  return {
    current: lastValue,
    change,
    changePercent,
    isPositive: change >= 0,
    high: maxValue,
    low: minValue
  };
};
 // Human-readable price formatting function
 export const formatTokenPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)}M`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(2)}K`;
  } else if (price >= 1) {
    return `${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `${price.toFixed(3)}`;
  } else if (price >= 0.001) {
    return `${price.toFixed(4)}`;
  } else if (price >= 0.0001) {
    return `${price.toFixed(5)}`;
  } else if (price >= 0.00001) {
    return `${price.toFixed(6)}`;
  } else if (price >= 0.000001) {
    return `${price.toFixed(7)}`;
  } else if (price >= 0.0000001) {
    return `${price.toFixed(8)}`;
  } else {
    // For extremely small numbers, show up to 10 decimal places
    const formatted = price.toFixed(10);
    // Remove trailing zeros
    return `${parseFloat(formatted)}`;
  }
};


export const getNFTRarity = (lastPrice: number = 0) => {
  for (const [level, config] of Object.entries(NFT_RARITY_LEVELS)) {
    if (lastPrice >= config.threshold) {
      return { level, ...config };
    }
  }
  return { level: 'common', ...NFT_RARITY_LEVELS.common };
};

export const getTokenTypeIcon = (interfaceType: string) => {
  switch (interfaceType) {
    case 'ERC721': return 'Crown';
    case 'ERC1155': return 'Sparkles';
    default: return 'Star';
  }
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};

export const openEtherscan = (address: string, type: 'address' | 'tx' = 'address'): void => {
  const baseUrl = 'https://etherscan.io';
  const url = type === 'address' ? `${baseUrl}/address/${address}` : `${baseUrl}/tx/${address}`;
  window.open(url, '_blank');
};

export const openOpenSea = (chainId: string, contractAddress: string, tokenId: string): void => {
  const url = `https://opensea.io/assets/${chainId}/${contractAddress}/${tokenId}`;
  window.open(url, '_blank');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address || address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};