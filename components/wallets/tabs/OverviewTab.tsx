import React from 'react';
import { LineChart, Globe, BarChart3, PieChart } from 'lucide-react';

interface OverviewTabProps {
  data: any;
  showBalances: boolean;
  formatCurrency: (value: number) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data, showBalances, formatCurrency }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Overview</h3>
      
      {/* Chart Placeholder */}
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <LineChart className="h-12 w-12 text-gray-400" />
            <BarChart3 className="h-8 w-8 text-gray-300" />
            <PieChart className="h-10 w-10 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Portfolio Performance Chart</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interactive charts coming soon</p>
          </div>
        </div>
      </div>

      {/* Portfolio Breakdown */}
      {data?.portfolio?.chains && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Chain Distribution</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.portfolio.chains.map((chain: string, index: number) => (
              <div key={chain} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{chain}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Network</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Asset Allocation</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Assets</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data?.metadata?.positionsCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Chains</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data?.metadata?.chainsCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(data?.portfolio?.totalValue || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Activity Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data?.metadata?.transactionsCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">NFTs Owned</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data?.metadata?.nftsCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data?.metadata?.lastSyncAt ? 
                  new Date(data.metadata.lastSyncAt).toLocaleDateString() : 
                  'Never'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="text-md font-medium text-blue-900 dark:text-blue-100 mb-3">
          📊 Advanced Analytics Coming Soon
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• Interactive portfolio performance charts</li>
          <li>• Asset allocation pie charts</li>
          <li>• Historical value tracking</li>
          <li>• Profit/Loss analysis</li>
          <li>• Risk assessment metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default OverviewTab;