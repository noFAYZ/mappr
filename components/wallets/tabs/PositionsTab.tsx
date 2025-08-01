import React, { useState } from 'react';
import { Coins, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';

interface PositionsTabProps {
  positions: any[];
  showBalances: boolean;
  formatCurrency: (value: number) => string;
}

const PositionsTab: React.FC<PositionsTabProps> = ({ positions, showBalances, formatCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('value');

  const filteredPositions = positions
    .filter(position => 
      !searchQuery || 
      position.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'amount':
          return (b.amount || 0) - (a.amount || 0);
        case 'name':
          return (a.name || a.symbol || '').localeCompare(b.name || b.symbol || '');
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Positions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{positions.length} positions</p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="value">Sort by Value</option>
            <option value="amount">Sort by Amount</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      {/* Positions List */}
      {filteredPositions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {positions.length === 0 ? 'No positions found' : 'No matching positions'}
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            {positions.length === 0 
              ? 'This wallet doesn\'t have any token positions yet'
              : 'Try adjusting your search query'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPositions.map((position, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              
              {/* Token Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {position.symbol?.charAt(0) || 'T'}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {position.name || position.symbol || 'Unknown Token'}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{position.symbol}</span>
                    {position.amount && (
                      <>
                        <span>•</span>
                        <span>{showBalances ? Number(position.amount).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '••••'} tokens</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Value & Price */}
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(position.value || 0)}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    ${showBalances ? (position.price || 0).toFixed(4) : '••••'}
                  </span>
                  {position.change24h !== undefined && (
                    <div className="flex items-center gap-1">
                      {position.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs ${position.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {showBalances ? `${position.change24h >= 0 ? '+' : ''}${position.change24h.toFixed(2)}%` : '•••%'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredPositions.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Positions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{filteredPositions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(filteredPositions.reduce((sum, pos) => sum + (pos.value || 0), 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unique Tokens</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Set(filteredPositions.map(pos => pos.symbol)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionsTab;