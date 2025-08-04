import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { Tabs, Tab } from '@heroui/tabs';
import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { Switch } from '@heroui/switch';
import { Spinner } from '@heroui/spinner';
import { Divider } from '@heroui/divider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  Shield,
  Upload,
  Link2,
  CheckCircle2,
  AlertCircle,
  Search,
  Zap,
  Activity,
  Globe,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ArrowRight,
  Sparkles,
  TrendingUp,
  X,
  AlertTriangle,
  Info,
  Clock,
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Mock wallet analytics hook (replace with your actual implementation)
const useWalletAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncing, setSyncing] = useState({});
  
  const addWallet = async (address, name) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    return true;
  };
  
  const isWalletSyncing = (id) => syncing[id] || false;
  
  return {
    addWallet,
    isWalletSyncing,
    isLoading
  };
};

// Progress tracking hook
const useProgressTracker = () => {
  const [progress, setProgress] = useState({
    phase: 'idle',
    progress: 0,
    message: '',
    details: null
  });

  const updateProgress = useCallback((phase, progressValue, message, details = null) => {
    setProgress({
      phase,
      progress: Math.min(100, Math.max(0, progressValue)),
      message,
      details
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      phase: 'idle',
      progress: 0,
      message: '',
      details: null
    });
  }, []);

  return { progress, updateProgress, resetProgress };
};

// Network configurations
const SUPPORTED_NETWORKS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    color: 'rgb(96, 165, 250)',
    icon: '⟠',
    chainId: 1,
    isPopular: true
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    color: 'rgb(139, 92, 246)',
    icon: '⬟',
    chainId: 137,
    isPopular: true
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    color: 'rgb(34, 197, 94)',
    icon: '◦',
    chainId: 42161,
    isPopular: true
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    color: 'rgb(239, 68, 68)',
    icon: '○',
    chainId: 10,
    isPopular: false
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    color: 'rgb(59, 130, 246)',
    icon: '◉',
    chainId: 8453,
    isPopular: false
  },
  {
    id: 'bsc',
    name: 'BSC',
    symbol: 'BNB',
    color: 'rgb(245, 158, 11)',
    icon: '◈',
    chainId: 56,
    isPopular: false
  }
];

// Address validation utility
const validateAddress = (address) => {
  if (!address || address.length < 10) {
    return { isValid: false, error: 'Address too short' };
  }
  
  if (address.startsWith('0x') && address.length === 42) {
    return { isValid: true, type: 'ethereum' };
  }
  
  if (address.length >= 26 && address.length <= 35) {
    return { isValid: true, type: 'bitcoin' };
  }
  
  if (address.length === 44) {
    return { isValid: true, type: 'solana' };
  }
  
  return { isValid: false, error: 'Invalid address format' };
};

// Address input component with real-time validation
const AddressInput = ({ value, onChange, onValidation, disabled, className }) => {
  const [validation, setValidation] = useState({ isValid: false });
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value || value.length < 10) {
      setValidation({ isValid: false });
      onValidation({ isValid: false });
      return;
    }

    setIsCheckingAddress(true);
    
    timeoutRef.current = setTimeout(() => {
      const result = validateAddress(value);
      setValidation(result);
      onValidation(result);
      setIsCheckingAddress(false);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onValidation]);

  const getValidationColor = () => {
    if (isCheckingAddress) return 'default';
    if (!value) return 'default';
    return validation.isValid ? 'success' : 'danger';
  };

  const getValidationIcon = () => {
    if (isCheckingAddress) return <Spinner size="sm" />;
    if (!value) return null;
    return validation.isValid ? 
      <CheckCircle2 className="w-4 h-4 text-success" /> : 
      <AlertCircle className="w-4 h-4 text-danger" />;
  };

  return (
    <div className="space-y-2">
      <Input
        label="Wallet Address"
        placeholder="0x... or bc1... or 1A..."
        value={value}
        onValueChange={onChange}
        isDisabled={disabled}
        color={getValidationColor()}
        endContent={getValidationIcon()}
        description="Enter your wallet's public address"
        className={className}
        classNames={{
          input: "font-mono text-sm",
          label: "font-medium"
        }}
      />
      
      <AnimatePresence>
        {validation.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-danger text-xs"
          >
            <AlertCircle className="w-3 h-3" />
            {validation.error}
          </motion.div>
        )}
        
        {validation.isValid && validation.type && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-success text-xs"
          >
            <CheckCircle2 className="w-3 h-3" />
            Valid {validation.type} address detected
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Network selector component
const NetworkSelector = ({ selectedNetworks, onNetworkToggle, disabled }) => {
  const popularNetworks = SUPPORTED_NETWORKS.filter(n => n.isPopular);
  const otherNetworks = SUPPORTED_NETWORKS.filter(n => !n.isPopular);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Networks</h4>
        <Chip size="sm" variant="flat">
          {selectedNetworks.length} selected
        </Chip>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs text-default-500 font-medium">Popular</p>
          <div className="grid grid-cols-2 gap-2">
            {popularNetworks.map(network => (
              <NetworkCard
                key={network.id}
                network={network}
                isSelected={selectedNetworks.includes(network.id)}
                onToggle={() => onNetworkToggle(network.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
        
        <Divider />
        
        <div className="space-y-2">
          <p className="text-xs text-default-500 font-medium">Others</p>
          <div className="grid grid-cols-2 gap-2">
            {otherNetworks.map(network => (
              <NetworkCard
                key={network.id}
                network={network}
                isSelected={selectedNetworks.includes(network.id)}
                onToggle={() => onNetworkToggle(network.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual network card
const NetworkCard = ({ network, isSelected, onToggle, disabled }) => (
  <Card 
    isPressable={!disabled}
    onPress={onToggle}
    className={`cursor-pointer transition-all duration-150 ${
      isSelected 
        ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-950' 
        : 'hover:bg-default-100'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <CardBody className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: network.color }}
          >
            {network.icon}
          </div>
          <div>
            <p className="font-medium text-sm">{network.name}</p>
            <p className="text-xs text-default-500">{network.symbol}</p>
          </div>
        </div>
        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-500" />}
      </div>
    </CardBody>
  </Card>
);

// Progress tracker component
const ProgressTracker = ({ progress }) => {
  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'validating':
        return <Search className="w-4 h-4" />;
      case 'connecting':
        return <Link2 className="w-4 h-4" />;
      case 'syncing':
        return <Database className="w-4 h-4" />;
      case 'finalizing':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'complete':
        return <Sparkles className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'complete':
        return 'success';
      case 'error':
        return 'danger';
      case 'syncing':
      case 'connecting':
      case 'validating':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (progress.phase === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 bg-default-50 dark:bg-default-900 rounded-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-${getPhaseColor(progress.phase)}-100 dark:bg-${getPhaseColor(progress.phase)}-900`}>
            {getPhaseIcon(progress.phase)}
          </div>
          <div>
            <p className="font-medium text-sm">{progress.message}</p>
            {progress.details && (
              <p className="text-xs text-default-500">{progress.details}</p>
            )}
          </div>
        </div>
        <Chip size="sm" variant="flat" color={getPhaseColor(progress.phase)}>
          {progress.progress}%
        </Chip>
      </div>
      
      <Progress
        value={progress.progress}
        color={getPhaseColor(progress.phase)}
        size="sm"
        className="w-full"
      />
    </motion.div>
  );
};

// Connect wallet tab (placeholder)
const ConnectWalletTab = () => (
  <div className="py-8 text-center space-y-6">
    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto">
      <Link2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
    </div>
    
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Connect Wallet</h3>
      <p className="text-default-600 text-sm max-w-sm mx-auto">
        Connect directly with supported wallet providers
      </p>
    </div>
    
    <div className="space-y-3">
      <Button
        color="primary"
        size="lg"
        startContent={<Wallet className="w-4 h-4" />}
        onPress={() => toast.info('MetaMask connection coming soon')}
        className="w-full"
      >
        MetaMask
      </Button>
      <Button
        color="secondary"
        size="lg"
        startContent={<Wallet className="w-4 h-4" />}
        onPress={() => toast.info('WalletConnect coming soon')}
        className="w-full"
      >
        WalletConnect
      </Button>
    </div>
  </div>
);

// Import tab (placeholder)
const ImportTab = () => (
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

// Main modal component
const AddWalletModal = ({ isOpen, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    networks: ['ethereum'],
    isWatchOnly: true,
    autoSync: true
  });
  const [validation, setValidation] = useState({ isValid: false });
  
  const { addWallet } = useWalletAnalytics();
  const { progress, updateProgress, resetProgress } = useProgressTracker();

  const handleOpenChange = useCallback((open) => {
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
      resetProgress();
    }
    onOpenChange(open);
  }, [onOpenChange, resetProgress]);

  const handleNetworkToggle = useCallback((networkId) => {
    setFormData(prev => ({
      ...prev,
      networks: prev.networks.includes(networkId)
        ? prev.networks.filter(id => id !== networkId)
        : [...prev.networks, networkId]
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validation.isValid || !formData.address) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    if (formData.networks.length === 0) {
      toast.error('Please select at least one network');
      return;
    }

    try {
      // Phase 1: Validation
      updateProgress('validating', 10, 'Validating wallet address...', 'Checking address format and network compatibility');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Phase 2: Connecting
      updateProgress('connecting', 35, 'Connecting to blockchain...', 'Establishing secure connection to network');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 3: Syncing
      updateProgress('syncing', 60, 'Syncing wallet data...', 'Fetching portfolio and transaction history');
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Phase 4: Finalizing
      updateProgress('finalizing', 85, 'Finalizing setup...', 'Saving wallet configuration and preferences');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add wallet using the analytics hook
      await addWallet(formData.address.trim(), formData.name.trim() || undefined);

      // Phase 5: Complete
      updateProgress('complete', 100, 'Wallet added successfully!', 'Ready to track your portfolio');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Wallet added successfully!');
      handleOpenChange(false);
      
    } catch (error) {
      updateProgress('error', 100, 'Failed to add wallet', error.message);
      toast.error(error instanceof Error ? error.message : 'Failed to add wallet');
    }
  }, [validation, formData, addWallet, updateProgress, handleOpenChange]);

  const isSubmitDisabled = useMemo(() => 
    activeTab === 'manual' && (
      !validation.isValid || 
      !formData.address || 
      formData.networks.length === 0 ||
      progress.phase !== 'idle'
    ),
    [activeTab, validation.isValid, formData.address, formData.networks.length, progress.phase]
  );

  const isProcessing = progress.phase !== 'idle' && progress.phase !== 'complete';

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size="2xl"
      scrollBehavior="inside"
      isDismissable={!isProcessing}
      hideCloseButton={isProcessing}
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
              <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg">
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
              <div className="space-y-6">
                <ProgressTracker progress={progress} />
                
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  className="w-full"
                  isDisabled={isProcessing}
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
                      <AddressInput
                        value={formData.address}
                        onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                        onValidation={setValidation}
                        disabled={isProcessing}
                      />

                      <Input
                        label="Wallet Name (Optional)"
                        placeholder="My Portfolio"
                        value={formData.name}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                        isDisabled={isProcessing}
                        description="Give your wallet a memorable name"
                      />

                      <NetworkSelector
                        selectedNetworks={formData.networks}
                        onNetworkToggle={handleNetworkToggle}
                        disabled={isProcessing}
                      />

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Eye className="w-4 h-4 text-default-500" />
                              <div>
                                <p className="font-medium text-sm">Watch-Only Mode</p>
                                <p className="text-xs text-default-500">Track portfolio without private keys</p>
                              </div>
                            </div>
                            <Switch
                              isSelected={formData.isWatchOnly}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, isWatchOnly: value }))}
                              isDisabled={isProcessing}
                              size="sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4 text-default-500" />
                              <div>
                                <p className="font-medium text-sm">Auto Sync</p>
                                <p className="text-xs text-default-500">Automatically update portfolio data</p>
                              </div>
                            </div>
                            <Switch
                              isSelected={formData.autoSync}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, autoSync: value }))}
                              isDisabled={isProcessing}
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
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <Shield className="w-3 h-3" />
                  <span>Data encrypted & secure</span>
                  {progress.phase !== 'idle' && (
                    <>
                      <Divider orientation="vertical" className="h-3" />
                      <span>Please don't close this window</span>
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="flat"
                    onPress={onClose}
                    isDisabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isDisabled={isSubmitDisabled}
                    isLoading={isProcessing}
                    startContent={!isProcessing ? <Plus className="w-4 h-4" /> : null}
                  >
                    {isProcessing ? 'Adding Wallet...' : 'Add Wallet'}
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