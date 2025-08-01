

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  CheckCircle, 
  ChevronRight,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Button } from '@heroui/react';
import { Spinner } from '@heroui/spinner';
import { toast } from 'sonner';

interface WalletCardProps {
  wallet: any;
  walletData: any;
  isSelected: boolean;
  onToggleSelect: () => void;
  onSelect: () => void;
  onSync: () => void;
  onRemove: () => void;
  showBalances: boolean;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
  viewMode: 'grid' | 'list';
  index: number;
}


// Wallet Card Component (inline to fix import issues)
const WalletCard = ({ 
  wallet, 
  walletData,
  isSelected, 
  onToggleSelect,
  onSelect,
  onSync, 
  onRemove, 
  showBalances, 
  isLoading,
  formatCurrency,
  formatPercentage,
  viewMode,
  index 
}) => {
  const value = walletData?.portfolio?.totalValue || 0;
  const change = walletData?.portfolio?.dayChange || 0;
  const changePercent = value > 0 ? (change / (value - change)) * 100 : 0;
  const positionsCount = walletData?.metadata?.positionsCount || 0;
  const chainsCount = walletData?.metadata?.chainsCount || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'syncing': return 'warning';
      case 'error': return 'danger';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: index * 0.1,
        duration: 0.3 
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <Card className={`border-none bg-content1 hover:bg-content2 transition-colors cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={onToggleSelect}
                  className="rounded border-default-300"
                />
                
                <div className="flex items-center gap-3 cursor-pointer" onClick={onSelect}>
                  <Avatar 
                    name={(wallet.name || wallet.address).charAt(0).toUpperCase()}
                    className="bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                  />
                  
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {wallet.name || `Wallet ${wallet.address.slice(0, 6)}...`}
                    </h3>
                    <p className="text-small text-default-500 font-mono">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(value)}
                  </p>
                  <div className="flex items-center gap-1">
                    {changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-danger" />
                    )}
                    <span className={`text-small ${changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatPercentage(changePercent)}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-small font-medium text-foreground">{positionsCount}</p>
                  <p className="text-tiny text-default-500">Positions</p>
                </div>

                <div className="text-center">
                  <p className="text-small font-medium text-foreground">{chainsCount}</p>
                  <p className="text-tiny text-default-500">Chains</p>
                </div>

                <Chip size="sm" color={getStatusColor(wallet.sync_status)} variant="flat">
                  {wallet.sync_status}
                </Chip>

                <div className="flex items-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={(e) => {
                      e.stopPropagation();
                      onSync();
                    }}
                    isLoading={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to remove this wallet?')) {
                        onRemove();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card 
        className={`border-none bg-content1 hover:bg-content2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${isSelected ? 'ring-2 ring-primary' : ''}`}
        isPressable
        onPress={onSelect}
      >
        <CardBody className="p-6">
          {/* Wallet Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect();
                }}
                className="rounded border-default-300"
              />
              
              <Avatar 
                name={(wallet.name || wallet.address).charAt(0).toUpperCase()}
                className="bg-gradient-to-br from-primary to-secondary text-primary-foreground"
              />
              
              <div>
                <h3 className="font-semibold text-foreground">
                  {wallet.name || `Wallet ${wallet.address.slice(0, 6)}...`}
                </h3>
                <p className="text-small text-default-500 font-mono">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Chip size="sm" color={getStatusColor(wallet.sync_status)} variant="flat">
                {wallet.sync_status}
              </Chip>
              
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Wallet actions">
                  <DropdownItem 
                    key="copy" 
                    startContent={<Copy className="h-4 w-4" />}
                    onPress={() => {
                      navigator.clipboard.writeText(wallet.address);
                      toast.success('Address copied');
                    }}
                  >
                    Copy Address
                  </DropdownItem>
                  <DropdownItem 
                    key="view" 
                    startContent={<ExternalLink className="h-4 w-4" />}
                    onPress={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                  >
                    View on Explorer
                  </DropdownItem>
                  <DropdownItem 
                    key="sync" 
                    startContent={<RefreshCw className="h-4 w-4" />}
                    onPress={onSync}
                  >
                    Sync Wallet
                  </DropdownItem>
                  <DropdownItem 
                    key="delete" 
                    className="text-danger" 
                    color="danger"
                    startContent={<Trash2 className="h-4 w-4" />}
                    onPress={() => {
                      if (confirm('Are you sure you want to remove this wallet?')) {
                        onRemove();
                      }
                    }}
                  >
                    Remove Wallet
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-small text-default-500">Portfolio Value</span>
              <div className="flex items-center gap-1">
                {changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-danger" />
                )}
                <span className={`text-tiny font-medium ${changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercentage(changePercent)}
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(value)}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{positionsCount}</p>
              <p className="text-tiny text-default-500">Positions</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{chainsCount}</p>
              <p className="text-tiny text-default-500">Chains</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <Spinner size="sm" color="primary" />
                ) : (
                  
<CheckCircle className="h-4 w-4 text-success" />
                )}
              </div>
              <p className="text-tiny text-default-500">Status</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-divider">
            <span className="text-tiny text-default-500">
              Last sync: {wallet.last_sync_at ? new Date(wallet.last_sync_at).toLocaleDateString() : 'Never'}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={(e) => {
                  e.stopPropagation();
                  onSync();
                }}
                isLoading={isLoading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <ChevronRight className="h-4 w-4 text-default-400" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default WalletCard;