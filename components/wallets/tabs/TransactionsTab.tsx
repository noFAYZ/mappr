import React, { useState } from 'react';
import { Activity, ExternalLink, Calendar, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';

interface TransactionsTabProps {
  transactions: any[];
  showBalances: boolean;
  formatCurrency: (value: number) => string;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions, showBalances, formatCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = !searchQuery || 
        tx.hash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || tx.type === filterType;
      return matchesSearch && matchesType;
    })
    .slice(0, 50); // Limit to 50 transactions for performance

  const getTransactionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'send':
      case 'transfer_out':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      case 'receive':
      case 'transfer_in':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'send':
      case 'transfer_out':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'receive':
      case 'transfer_in':
        return 'bg-green-100 dark:bg-green-900/30';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transactions.length} transactions {filteredTransactions.length < transactions.length && `(showing ${filteredTransactions.length})`}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by hash or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="send">Send</option>
            <option value="receive">Receive</option>
            <option value="swap">Swap</option>
            <option value="approve">Approve</option>
          </select>
        </div>
      </div>
      
      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {transactions.length === 0 ? 'No transactions found' : 'No matching transactions'}
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            {transactions.length === 0 
              ? 'This wallet doesn\'t have any transaction history yet'
              : 'Try adjusting your search or filter'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              
              {/* Transaction Info */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {tx.type || 'Transaction'}
                    </h4>
                    {tx.hash && (
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {tx.hash && (
                      <>
                        <span className="font-mono">
                          {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    
                    {tx.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Value */}
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(tx.value || 0)}
                </p>
                
                {tx.gasUsed && tx.gasPrice && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gas: {showBalances ? `${(tx.gasUsed * tx.gasPrice / 1e18).toFixed(6)} ETH` : '••••••'}
                  </p>
                )}
                
                {tx.status && (
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    tx.status === 'success' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : tx.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {tx.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {transactions.length > 50 && filteredTransactions.length >= 50 && (
        <div className="text-center py-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Load More Transactions
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
      )}

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{filteredTransactions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(filteredTransactions.reduce((sum, tx) => sum + (tx.value || 0), 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-lg font-semibold text-green-600">
                {filteredTransactions.length > 0 
                  ? Math.round((filteredTransactions.filter(tx => tx.status === 'success').length / filteredTransactions.length) * 100)
                  : 0
                }%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {filteredTransactions[0]?.date 
                  ? new Date(filteredTransactions[0].date).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;