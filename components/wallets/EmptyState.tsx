import React from 'react';
import { Wallet, Plus, Shield, Zap, Globe } from 'lucide-react';

interface EmptyStateProps {
  onAddWallet: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddWallet }) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="h-12 w-12 text-white" />
          </div>
          
          {/* Floating icons */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="absolute top-1/2 -left-4 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No wallets added yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Add your first cryptocurrency wallet to start tracking your portfolio across all supported chains. 
          Monitor your assets, analyze performance, and stay on top of your investments.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Secure</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Read-only access</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Fast</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Real-time sync</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Multi-Chain</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">All networks</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onAddWallet}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Your First Wallet
        </button>

        {/* Support Text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          We support Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, and more
        </p>
      </div>
    </div>
  );
};

export default EmptyState;