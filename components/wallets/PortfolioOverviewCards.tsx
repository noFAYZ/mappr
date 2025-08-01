import React from 'react';
import { 
  Wallet, 
  Target, 
  Coins, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PortfolioOverviewCardsProps {
  portfolioSummary: {
    totalValue: number;
    totalChangePercent: number;
    walletsCount: number;
    activeWallets?: number;
    totalPositions: number;
    totalChains: number;
    lastSyncTime?: number;
  };
  showBalances: boolean;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

const PortfolioOverviewCards: React.FC<PortfolioOverviewCardsProps> = ({
  portfolioSummary,
  showBalances,
  formatCurrency,
  formatPercentage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Value Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolioSummary.totalValue)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {portfolioSummary.totalChangePercent >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${portfolioSummary.totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(portfolioSummary.totalChangePercent)} (24h)
          </span>
        </div>
      </div>

      {/* Active Wallets Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Wallets</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolioSummary.activeWallets || portfolioSummary.walletsCount}
            </p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Out of {portfolioSummary.walletsCount} total
        </p>
      </div>

      {/* Total Positions Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Positions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolioSummary.totalPositions}
            </p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Coins className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Across {portfolioSummary.totalChains} chains
        </p>
      </div>

      {/* Last Sync Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {portfolioSummary.lastSyncTime ? 
                new Date(portfolioSummary.lastSyncTime).toLocaleDateString() : 
                'Never'
              }
            </p>
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Portfolio sync status
        </p>
      </div>

    </div>
  );
};

export default PortfolioOverviewCards;