// lib/wallet-analytics/constants.ts
import { Chain } from './types';

export const SUPPORTED_CHAINS: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
  { id: 'polygon', name: 'Polygon', icon: '⬟', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', icon: '🔴', color: '#FF0420' },
  { id: 'base', name: 'Base', icon: '🟦', color: '#0052FF' },
  { id: 'bsc', name: 'BSC', icon: '🟡', color: '#F3BA2F' }
];

export const CHART_COLORS = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export const PERIOD_MAP = {
  '1h': 'hour',
  '24h': 'day', 
  '1w': 'week',
  '1m': 'month',
  '1y': 'year'
} as const;

export const TRANSACTION_TYPES = {
  send: { 
    icon: 'Send', 
    color: 'warning',
    bg: 'bg-warning/10',
    text: 'text-warning'
  },
  receive: { 
    icon: 'Download', 
    color: 'success',
    bg: 'bg-success/10',
    text: 'text-success'
  },
  trade: { 
    icon: 'Repeat', 
    color: 'primary',
    bg: 'bg-primary/10',
    text: 'text-primary'
  },
  swap: { 
    icon: 'Repeat', 
    color: 'primary',
    bg: 'bg-primary/10',
    text: 'text-primary'
  },
  deposit: {
    icon: 'ArrowDownRight',
    color: 'secondary',
    bg: 'bg-secondary/10',
    text: 'text-secondary'
  },
  withdraw: {
    icon: 'ArrowUpRight',
    color: 'danger',
    bg: 'bg-danger/10',
    text: 'text-danger'
  }
} as const;

export const NFT_RARITY_LEVELS = {
  legendary: { threshold: 5, color: 'warning', icon: 'Crown' },
  rare: { threshold: 1, color: 'secondary', icon: 'Sparkles' },
  uncommon: { threshold: 0.1, color: 'primary', icon: 'Star' },
  common: { threshold: 0, color: 'default', icon: 'Shield' }
} as const;

export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_CHART_HEIGHT = 320;
export const ANIMATION_DELAYS = {
  STATS_CARD: 0.1,
  CHART_ITEM: 0.03,
  LIST_ITEM: 0.05,
  NFT_ITEM: 0.02
} as const;