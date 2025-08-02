'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Switch } from '@heroui/switch';
import { Divider } from '@heroui/divider';
import {
  Wallet,
  Plus,
  Link2,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  Zap,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useWalletAnalytics } from '@/lib/hooks/useWalletAnalytics';

// Types
interface Network {
  id: string;
  name: string;
  symbol: string;
  color: string;
  icon: string;
  popular: boolean;
}

interface WalletData {
  address: string;
  name: string;
  networks: string[];
  isWatchOnly: boolean;
  autoSync: boolean;
}

interface AddWalletModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (address: string, name?: string) => Promise<void>;
}

// Constants
const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    color: 'from-blue-500 to-purple-600',
    icon: '🔷',
    popular: true
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    color: 'from-purple-500 to-pink-600',
    icon: '🟣',
    popular: true
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    color: 'from-blue-400 to-cyan-600',
    icon: '🔵',
    popular: true
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    color: 'from-red-500 to-pink-600',
    icon: '🔴',
    popular: true
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    color: 'from-blue-600 to-indigo-600',
    icon: '🏗️',
    popular: false
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    color: 'from-yellow-500 to-orange-600',
    icon: '🟨',
    popular: false
  }
];

// Validation utility
const validateEthereumAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return { 
      isValid: false, 
      error: 'Invalid Ethereum address format' 
    };
  }

  return { isValid: true };
};

// Components
const AddressValidationInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onValidation: (result: { isValid: boolean; error?: string }) => void;
  disabled?: boolean;
}> = ({ value, onChange, onValidation, disabled = false }) => {
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: false });

  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    if (!newValue.trim()) {
      const result = { isValid: false };
      setValidation(result);
      onValidation(result);
      return;
    }

    const result = validateEthereumAddress(newValue.trim());
    setValidation(result);
    onValidation(result);
  }, [onChange, onValidation]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleChange(text);
        toast.success('Address pasted from clipboard');
      }
    } catch (error) {
      toast.error('Failed to read from clipboard');
    }
  }, [handleChange]);

  return (
    <div className="space-y-2">
      <Input
        label="Wallet Address"
        placeholder="0x742d35Cc6935C4532A252e2F7fE3982F21810A47"
        value={value}
        onValueChange={handleChange}
        isDisabled={disabled}
        startContent={<Wallet className="w-4 h-4 text-default-400" />}
        endContent={
          <div className="flex items-center gap-1">
            {value && (
              validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-success-500" />
              ) : validation.error ? (
                <AlertTriangle className="w-4 h-4 text-danger-500" />
              ) : null
            )}
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={pasteFromClipboard}
              className="h-6 w-6 min-w-6"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        }
        classNames={{
          inputWrapper: `${
            value && validation.error ? 'border-danger-500' : 
            value && validation.isValid ? 'border-success-500' : ''
          }`,
          input: "font-mono text-sm"
        }}
      />
      {validation.error && (
        <p className="text-xs text-danger-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {validation.error}
        </p>
      )}
    </div>
  );
};

const NetworkSelector: React.FC<{
  selectedNetworks: string[];
  onNetworkToggle: (networkId: string) => void;
  maxSelection?: number;
}> = ({ selectedNetworks, onNetworkToggle, maxSelection = 4 }) => {
  const { popularNetworks, otherNetworks } = useMemo(() => ({
    popularNetworks: SUPPORTED_NETWORKS.filter(n => n.popular),
    otherNetworks: SUPPORTED_NETWORKS.filter(n => !n.popular)
  }), []);

  const NetworkCard: React.FC<{
    network: Network;
    isSelected: boolean;
    onToggle: () => void;
    disabled: boolean;
  }> = ({ network, isSelected, onToggle, disabled }) => (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-950' 
          : 'border border-default-200 hover:border-default-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      isPressable={!disabled}
      onPress={onToggle}
    >
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${network.color} flex items-center justify-center text-xs`}>
            {network.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{network.name}</p>
            <p className="text-xs text-default-500">{network.symbol}</p>
          </div>
          {isSelected && (
            <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
          )}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">Networks</h4>
          <p className="text-xs text-default-500">Select networks to track</p>
        </div>
        <Chip size="sm" variant="flat" color={selectedNetworks.length > 0 ? "primary" : "default"}>
          {selectedNetworks.length}/{maxSelection}
        </Chip>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {popularNetworks.map((network) => (
            <NetworkCard
              key={network.id}
              network={network}
              isSelected={selectedNetworks.includes(network.id)}
              onToggle={() => onNetworkToggle(network.id)}
              disabled={!selectedNetworks.includes(network.id) && selectedNetworks.length >= maxSelection}
            />
          ))}
        </div>

        {otherNetworks.length > 0 && (
          <>
            <Divider />
            <div className="grid grid-cols-2 gap-2">
              {otherNetworks.map((network) => (
                <NetworkCard
                  key={network.id}
                  network={network}
                  isSelected={selectedNetworks.includes(network.id)}
                  onToggle={() => onNetworkToggle(network.id)}
                  disabled={!selectedNetworks.includes(network.id) && selectedNetworks.length >= maxSelection}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ConnectWalletTab: React.FC = () => (
  <div className="py-8 text-center space-y-6">
    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto">
      <Zap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
    </div>
    
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Connect Wallet</h3>
      <p className="text-default-600 text-sm max-w-sm mx-auto">
        Connect your wallet for enhanced features and automatic updates
      </p>
    </div>
    
    <div className="space-y-3 max-w-xs mx-auto">
      <Button
        color="primary"
        size="lg"
        className="w-full"
        onPress={() => toast.info('MetaMask connection coming soon')}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
            🦊
          </div>
          MetaMask
        </div>
      </Button>
      
      <Button
        variant="flat"
        size="lg"
        className="w-full"
        onPress={() => toast.info('WalletConnect coming soon')}
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          WalletConnect
        </div>
      </Button>
    </div>

    <div className="flex items-center justify-center gap-6 text-xs text-default-500 pt-4">
      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3 text-success-500" />
        <span>Secure</span>
      </div>
      <div className="flex items-center gap-1">
        <Activity className="w-3 h-3 text-primary-500" />
        <span>Real-time</span>
      </div>
    </div>
  </div>
);

const ImportTab: React.FC = () => (
  <div className="py-8 text-center space-y-6">
    <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900 dark:to-secondary-800 rounded-2xl flex items-center justify-center mx-auto">
      <Upload className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
    </div>
    
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Import Wallets</h3>
      <p className="text-default-600 text-sm max-w-sm mx-auto">
        Import multiple wallets from CSV or other platforms
      </p>
    </div>
    
    <Button
      color="secondary"
      size="lg"
      startContent={<Upload className="w-4 h-4" />}
      onPress={() => toast.info('File import coming soon')}
    >
      Choose File
    </Button>

    <div className="text-xs text-default-500">
      <p className="mb-2">Supported formats:</p>
      <div className="flex gap-2 justify-center">
        <Chip size="sm" variant="flat">CSV</Chip>
        <Chip size="sm" variant="flat">JSON</Chip>
      </div>
    </div>
  </div>
);

// Main Component
const AddWalletModal: React.FC<AddWalletModalProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState<WalletData>({
    address: '',
    name: '',
    networks: ['ethereum'],
    isWatchOnly: true,
    autoSync: true
  });
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setFormData({
        address: '',
        name: '',
        networks: ['ethereum'],
        isWatchOnly: true,
        autoSync: true
      });
      setValidation({ isValid: false });
      setActiveTab('manual');
    }
    onOpenChange(open);
  }, [onOpenChange]);

  const {
    wallets,
    addWallet
    
  } = useWalletAnalytics();

  const handleSubmit = useCallback(async () => {
    if (!validation.isValid || !formData.address) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    if (formData.networks.length === 0) {
      toast.error('Please select at least one network');
      return;
    }

    setIsLoading(true);
    try {
      // Call the onAdd function with address and name (matching the existing interface)
      await addWallet(
        formData.address.trim(), 
        formData.name.trim() || undefined
      );
      
      toast.success('Wallet added successfully!');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add wallet');
    } finally {
      setIsLoading(false);
    }
  }, [validation, formData, handleOpenChange]);

  const handleNetworkToggle = useCallback((networkId: string) => {
    setFormData(prev => ({
      ...prev,
      networks: prev.networks.includes(networkId)
        ? prev.networks.filter(id => id !== networkId)
        : [...prev.networks, networkId]
    }));
  }, []);

  const isSubmitDisabled = useMemo(() => 
    activeTab === 'manual' && (!validation.isValid || !formData.address || formData.networks.length === 0),
    [activeTab, validation.isValid, formData.address, formData.networks.length]
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-content1",
        header: "border-b border-divider",
        body: "py-4",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-3 pb-4">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Add Wallet</h2>
                <p className="text-sm text-default-500 font-normal">
                  Track your crypto portfolio across networks
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="px-6">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                className="w-full"
                classNames={{
                  tabList: "grid w-full grid-cols-3",
                  cursor: "w-full",
                  tab: "h-10",
                  tabContent: "group-data-[selected=true]:text-primary-600"
                }}
              >
                <Tab
                  key="manual"
                  title={
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span className="hidden sm:inline">Manual</span>
                    </div>
                  }
                >
                  <div className="space-y-6 mt-4">
                    <AddressValidationInput
                      value={formData.address}
                      onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                      onValidation={setValidation}
                      disabled={isLoading}
                    />

                    <Input
                      label="Wallet Name (Optional)"
                      placeholder="My Portfolio"
                      value={formData.name}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                      isDisabled={isLoading}
                    />

                    <NetworkSelector
                      selectedNetworks={formData.networks}
                      onNetworkToggle={handleNetworkToggle}
                    />

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Watch-only mode</p>
                            <p className="text-xs text-default-500">Track without connecting</p>
                          </div>
                          <Switch
                            isSelected={formData.isWatchOnly}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, isWatchOnly: value }))}
                            isDisabled={isLoading}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Auto-sync</p>
                            <p className="text-xs text-default-500">Automatic updates</p>
                          </div>
                          <Switch
                            isSelected={formData.autoSync}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, autoSync: value }))}
                            isDisabled={isLoading}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab>

                <Tab
                  key="connect"
                  title={
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Connect</span>
                    </div>
                  }
                >
                  <ConnectWalletTab />
                </Tab>

                <Tab
                  key="import"
                  title={
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Import</span>
                    </div>
                  }
                >
                  <ImportTab />
                </Tab>
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <div className="flex items-center justify-between w-full">
                <p className="text-xs text-default-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Data encrypted & secure</span>
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="flat"
                    onPress={onClose}
                    isDisabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    isDisabled={isSubmitDisabled}
                    startContent={!isLoading ? <Plus className="w-4 h-4" /> : null}
                  >
                    {isLoading ? 'Adding...' : 'Add Wallet'}
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddWalletModal;