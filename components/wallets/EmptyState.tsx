import React from 'react';
import { Wallet, Plus, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@heroui/button';
import { FluentCubeSync20Regular, SolarShieldCheckBoldDuotone, SolarWalletBoldDuotone, StreamlineFreehandHierarchyWeb } from '../icons/icons';

interface EmptyStateProps {
  onAddWallet: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddWallet }) => {
  return (
    <div className="text-center py-4">
      <div className="max-w-md mx-auto">
        
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SolarWalletBoldDuotone className="h-12 w-12 text-white" />
          </div>
          
      
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No wallets added yet
        </h3>
        <p className="text-gray-600 text-sm dark:text-gray-400 mb-8 leading-relaxed">
          Add your first cryptocurrency wallet to start tracking your portfolio across all supported chains. 
          Monitor your assets, analyze performance, and stay on top of your investments.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-default-200 rounded-2xl">
            <SolarShieldCheckBoldDuotone className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Secure</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Read-only access</p>
          </div>
          <div className="text-center p-4 bg-default-200 rounded-2xl">
            <FluentCubeSync20Regular className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Fast</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Real-time sync</p>
          </div>
          <div className="text-center p-4 bg-default-200 rounded-2xl">
            <StreamlineFreehandHierarchyWeb className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Multi-Chain</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">All networks</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onAddWallet}
          className="inline-flex items-center  bg-gradient-to-br from-orange-600 via-amber-600 to-pink-600 text-white rounded-xl font-medium transition-all duration-100 shadow-lg"
          startContent={<Plus className="h-5 w-5" />}
          size='sm'
          
        >
          
          Add Your First Wallet
        </Button>

        {/* Support Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          We support Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, and 24+ more
        </p>
      </div>
    </div>
  );
};

export default EmptyState;