import React, { useState } from 'react';
import { 
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Coins,
  Activity,
  Star,
  Wallet
} from 'lucide-react';
import { useWalletData } from '@/lib/hooks/useWalletAnalytics';
import { toast } from 'sonner';

import OverviewTab from '@/components/wallets/tabs/OverviewTab';
import PositionsTab from '@/components/wallets/tabs/PositionsTab';
import TransactionsTab from '@/components/wallets/tabs/TransactionsTab';
import NFTsTab from '@/components/wallets/tabs/NFTsTab';
import { Avatar } from '@heroui/avatar';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/react';

interface WalletDetailsProps {
  wallet: any;
  onBack: () => void;
  showBalances: boolean;
  onToggleBalances: () => void;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

const WalletDetails = ({ wallet, onBack, showBalances, onToggleBalances, formatCurrency, formatPercentage }) => {
    const [activeTab, setActiveTab] = useState('overview');
    // You'll need to implement useWalletData hook or get data from props
    const data = null; // Replace with actual wallet data
    const analytics = null; // Replace with actual analytics data
    const isLoading = false; // Replace with actual loading state
  
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="flat"
            startContent={<ArrowLeft className="h-4 w-4" />}
            onPress={onBack}
          >
            Back to Wallets
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Avatar 
                name={(wallet.name || wallet.address).charAt(0).toUpperCase()}
                className="bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                size="lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {wallet.name || `Wallet ${wallet.address.slice(0, 8)}...`}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-default-500 font-mono text-small">
                    {wallet.address}
                  </p>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => {
                      navigator.clipboard.writeText(wallet.address);
                      toast.success('Address copied');
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
  
          <div className="flex items-center gap-3">
            <Button
              variant="flat"
              startContent={showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              onPress={onToggleBalances}
            >
              {showBalances ? 'Hide' : 'Show'} Balances
            </Button>
            
            <Button 
              color="primary"
              startContent={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
              isDisabled={isLoading}
            >
              Sync Wallet
            </Button>
          </div>
        </div>
  
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none bg-content1">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Total Value</h3>
                <div className="flex items-center gap-1">
                  {(data?.portfolio?.dayChange || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger" />
                  )}
                  <span className={`text-small font-medium ${(data?.portfolio?.dayChange || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatPercentage((data?.portfolio?.dayChange || 0) / (data?.portfolio?.totalValue || 1) * 100)}
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(data?.portfolio?.totalValue || 0)}
              </p>
              <p className="text-small text-default-500 mt-2">
                24h change: {formatCurrency(data?.portfolio?.dayChange || 0)}
              </p>
            </CardBody>
          </Card>
  
          <Card className="border-none bg-content1">
            <CardBody className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-small text-default-500">Rating</span>
                  <span className="text-small font-medium text-success capitalize">
                    {analytics?.performance?.rating || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-default-500">30d Avg</span>
                  <span className="text-small font-medium text-foreground">
                    {formatCurrency(analytics?.performance?.avg30DValue || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-default-500">Total Return</span>
                  <span className={`text-small font-medium ${(analytics?.performance?.totalReturnPercent || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatPercentage(analytics?.performance?.totalReturnPercent || 0)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
  
          <Card className="border-none bg-content1">
            <CardBody className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-small text-default-500">Positions</span>
                  <span className="text-small font-medium text-foreground">
                    {data?.metadata?.positionsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-default-500">Chains</span>
                  <span className="text-small font-medium text-foreground">
                    {data?.metadata?.chainsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-default-500">Transactions</span>
                  <span className="text-small font-medium text-foreground">
                    {data?.metadata?.transactionsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-small text-default-500">NFTs</span>
                  <span className="text-small font-medium text-foreground">
                    {data?.metadata?.nftsCount || 0}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
  
        {/* Placeholder for detailed content */}
        <Card className="border-none bg-content1">
          <CardBody className="p-6">
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-default-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Wallet Details Coming Soon</h3>
              <p className="text-default-500">
                Advanced wallet analytics and detailed breakdowns will be available here.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

export default WalletDetails;