"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Card, CardBody } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Plus,
  Shield,
  Upload,
  Link2,
  CheckCircle2,
  AlertCircle,
  Search,
  Globe,
  Database,
  ArrowRight,
  Settings,
} from "lucide-react";

import { useToast } from "@/components/ui/Toaster";
import { useWalletAnalytics } from "@/lib/hooks/useWalletAnalytics";

// Types and Interfaces
interface Network {
  id: string;
  name: string;
  chainId: number;
  symbol: string;
  icon: string;
  isPopular: boolean;
  color: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  type?: string;
  network?: string;
}

interface WalletFormData {
  address: string;
  name: string;
  networks: string[];
  isWatchOnly: boolean;
  autoSync: boolean;
  enableNotifications: boolean;
  includeNFTs: boolean;
  trackTransactions: boolean;
}

interface ProgressState {
  phase:
    | "idle"
    | "validating"
    | "connecting"
    | "syncing"
    | "complete"
    | "error";
  message: string;
  details?: string;
  progress: number;
}

// Constants
const SUPPORTED_NETWORKS: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    symbol: "ETH",
    icon: "⟠",
    isPopular: true,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    chainId: 0,
    symbol: "BTC",
    icon: "₿",
    isPopular: true,
    color: "from-orange-400 to-yellow-500",
  },
  {
    id: "polygon",
    name: "Polygon",
    chainId: 137,
    symbol: "MATIC",
    icon: "◈",
    isPopular: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "binance",
    name: "BNB Chain",
    chainId: 56,
    symbol: "BNB",
    icon: "◉",
    isPopular: true,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "solana",
    name: "Solana",
    chainId: 0,
    symbol: "SOL",
    icon: "◎",
    isPopular: true,
    color: "from-green-400 to-blue-500",
  },
];

// Utility Functions
const validateWalletAddress = (address: string): ValidationResult => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: "Address is required" };
  }

  const trimmedAddress = address.trim();

  // Ethereum-like addresses (0x...)
  if (trimmedAddress.startsWith("0x")) {
    if (
      trimmedAddress.length === 42 &&
      /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)
    ) {
      return {
        isValid: true,
        type: "Ethereum-compatible",
        network: "ethereum",
      };
    }

    return { isValid: false, error: "Invalid Ethereum address format" };
  }

  // Bitcoin addresses
  if (
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedAddress) ||
    /^bc1[a-z0-9]{39,59}$/.test(trimmedAddress)
  ) {
    return {
      isValid: true,
      type: "Bitcoin",
      network: "bitcoin",
    };
  }

  // Solana addresses
  if (
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedAddress) &&
    trimmedAddress.length >= 32
  ) {
    return {
      isValid: true,
      type: "Solana",
      network: "solana",
    };
  }

  return {
    isValid: false,
    error:
      "Unsupported address format. Please enter a valid Ethereum, Bitcoin, or Solana address.",
  };
};

const getChainTypeFromNetwork = (networkId: string): string => {
  const networkMap: Record<string, string> = {
    ethereum: "ethereum",
    bitcoin: "bitcoin",
    solana: "solana",
    polygon: "ethereum",
    binance: "ethereum",
  };

  return networkMap[networkId] || "ethereum";
};

// Hooks
const useProgressTracker = () => {
  const [progress, setProgress] = useState<ProgressState>({
    phase: "idle",
    message: "",
    progress: 0,
  });

  const updateProgress = useCallback((updates: Partial<ProgressState>) => {
    setProgress((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      phase: "idle",
      message: "",
      progress: 0,
    });
  }, []);

  return { progress, updateProgress, resetProgress };
};

// Components
const AddressInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onValidation: (validation: ValidationResult) => void;
  disabled?: boolean;
}> = ({ value, onChange, onValidation, disabled }) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
  });
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value || value.trim().length < 10) {
      const result = { isValid: false };

      setValidation(result);
      onValidation(result);
      setIsValidating(false);

      return;
    }

    setIsValidating(true);

    timeoutRef.current = setTimeout(() => {
      const result = validateWalletAddress(value);

      setValidation(result);
      onValidation(result);
      setIsValidating(false);
    }, 600);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onValidation]);

  const getInputColor = () => {
    if (isValidating || !value) return "default";

    return validation.isValid ? "success" : "danger";
  };

  const getEndContent = () => {
    if (isValidating) return <Spinner size="sm" />;
    if (!value) return null;

    return validation.isValid ? (
      <CheckCircle2 className="w-4 h-4 text-success" />
    ) : (
      <AlertCircle className="w-4 h-4 text-danger" />
    );
  };

  return (
    <div className="space-y-2">
      <Input
        classNames={{
          input: "font-mono text-sm",
          label: "font-medium text-default-700",
          description: "text-xs text-default-500",
        }}
        color={getInputColor()}
        description="Enter your wallet's public address to start tracking"
        endContent={getEndContent()}
        isDisabled={disabled}
        label="Wallet Address"
        placeholder="0x... or bc1... or 1A... or Base58"
        value={value}
        onValueChange={onChange}
      />

      <AnimatePresence>
        {validation.error && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 text-danger text-xs px-1"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{validation.error}</span>
          </motion.div>
        )}

        {validation.isValid && validation.type && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 text-success text-xs px-1"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span>Valid {validation.type} address detected</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NetworkSelector: React.FC<{
  selectedNetworks: string[];
  onNetworkToggle: (networkId: string) => void;
  disabled?: boolean;
}> = ({ selectedNetworks, onNetworkToggle, disabled }) => {
  const NetworkCard: React.FC<{ network: Network; isSelected: boolean }> = ({
    network,
    isSelected,
  }) => (
    <Card
      isPressable
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-primary-50 dark:bg-primary-500/20 border-primary-200 dark:border-primary-800"
          : "border border-divider hover:bg-default-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onPress={() => !disabled && onNetworkToggle(network.id)}
    >
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${network.color} flex items-center justify-center text-white font-bold text-sm`}
          >
            {network.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{network.name}</p>
            <p className="text-xs text-default-500">{network.symbol}</p>
          </div>
          {isSelected && (
            <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
          )}
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm text-default-700">
            Select Networks
          </h4>
          <p className="text-xs text-default-500">
            Choose which networks to track
          </p>
        </div>
        <Chip color="primary" size="sm" variant="flat">
          {selectedNetworks.length} selected
        </Chip>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUPPORTED_NETWORKS.map((network) => (
          <NetworkCard
            key={network.id}
            isSelected={selectedNetworks.includes(network.id)}
            network={network}
          />
        ))}
      </div>
    </div>
  );
};

const ProgressDisplay: React.FC<{ progress: ProgressState }> = ({
  progress,
}) => {
  if (progress.phase === "idle") return null;

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "validating":
        return <Search className="w-4 h-4" />;
      case "connecting":
        return <Globe className="w-4 h-4" />;
      case "syncing":
        return <Database className="w-4 h-4" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Spinner size="sm" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "complete":
        return "success";
      case "error":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 bg-gradient-to-r from-default-50 to-default-100 dark:from-default-900 dark:to-default-800 rounded-lg border border-default-200"
      initial={{ opacity: 0, y: 10 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-${getPhaseColor(progress.phase)}-100 dark:bg-${getPhaseColor(progress.phase)}-900 text-${getPhaseColor(progress.phase)}-600`}
          >
            {getPhaseIcon(progress.phase)}
          </div>
          <div>
            <p className="font-medium text-sm text-default-700">
              {progress.message}
            </p>
            {progress.details && (
              <p className="text-xs text-default-500">{progress.details}</p>
            )}
          </div>
        </div>
        <Chip color={getPhaseColor(progress.phase)} size="sm" variant="flat">
          {progress.progress}%
        </Chip>
      </div>

      <Progress
        className="w-full"
        color={getPhaseColor(progress.phase)}
        size="sm"
        value={progress.progress}
      />
    </motion.div>
  );
};

const WalletSettingsSection: React.FC<{
  formData: WalletFormData;
  setFormData: React.Dispatch<React.SetStateAction<WalletFormData>>;
  disabled: boolean;
}> = ({ formData, setFormData, disabled }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-sm text-default-700 flex items-center gap-2">
      <Settings className="w-4 h-4" />
      Wallet Settings
    </h4>

    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 border border-divider rounded-xl">
        <div className="space-y-1">
          <p className="font-medium text-sm">Watch-Only Mode</p>
          <p className="text-xs text-default-500">
            Track balances without private keys
          </p>
        </div>
        <Switch
          color="success"
          isDisabled={disabled}
          isSelected={formData.isWatchOnly}
          size="sm"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, isWatchOnly: value }))
          }
        />
      </div>

      <div className="flex items-center justify-between p-3 border border-divider rounded-xl">
        <div className="space-y-1">
          <p className="font-medium text-sm">Auto-Sync Data</p>
          <p className="text-xs text-default-500">
            Refresh data every 15 minutes
          </p>
        </div>
        <Switch
          color="success"
          isDisabled={disabled}
          isSelected={formData.autoSync}
          size="sm"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, autoSync: value }))
          }
        />
      </div>

      <div className="flex items-center justify-between p-3 border border-divider rounded-xl">
        <div className="space-y-1">
          <p className="font-medium text-sm">Enable Notifications</p>
          <p className="text-xs text-default-500">Get alerts for changes</p>
        </div>
        <Switch
          color="success"
          isDisabled={disabled}
          isSelected={formData.enableNotifications}
          size="sm"
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, enableNotifications: value }))
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 border border-divider rounded-xl">
          <div>
            <p className="font-medium text-sm">Include NFTs</p>
            <p className="text-xs text-default-500">Track NFT collections</p>
          </div>
          <Checkbox
            color="success"
            isDisabled={disabled}
            isSelected={formData.includeNFTs}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, includeNFTs: value }))
            }
          />
        </div>

        <div className="flex items-center justify-between p-3 border border-divider rounded-xl">
          <div>
            <p className="font-medium text-sm">Track History</p>
            <p className="text-xs text-default-500">Import transactions</p>
          </div>
          <Checkbox
            color="success"
            isDisabled={disabled}
            isSelected={formData.trackTransactions}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, trackTransactions: value }))
            }
          />
        </div>
      </div>
    </div>
  </div>
);

const ConnectWalletTab: React.FC = () => {
  const toast = useToast();

  const walletProviders = [
    { name: "MetaMask", icon: "🦊", color: "from-orange-500 to-yellow-500" },
    { name: "WalletConnect", icon: "🔗", color: "from-blue-500 to-purple-500" },
    { name: "Coinbase", icon: "🟦", color: "from-blue-600 to-blue-700" },
    { name: "Rainbow", icon: "🌈", color: "from-pink-500 to-purple-600" },
  ];

  const handleWalletConnect = (walletName: string) => {
    toast.info(`${walletName} Connection`, {
      description: "Web3 wallet connection coming soon!",
    });
  };

  return (
    <div className="py-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center mx-auto">
          <Link2 className="w-8 h-8 text-primary-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-default-700">
            Connect Your Wallet
          </h3>
          <p className="text-sm text-default-500 mt-2">
            Securely connect your existing wallet to start tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {walletProviders.map((wallet) => (
          <motion.div
            key={wallet.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              isPressable
              className="cursor-pointer hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
              onPress={() => handleWalletConnect(wallet.name)}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${wallet.color} flex items-center justify-center text-2xl`}
                  >
                    {wallet.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-xs text-default-500">
                      Connect via extension
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-default-400" />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ImportTab: React.FC = () => {
  const toast = useToast();

  return (
    <div className="py-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900 dark:to-secondary-800 rounded-2xl flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-secondary-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-default-700">
            Import Wallet Data
          </h3>
          <p className="text-sm text-default-500 mt-2">
            Upload transaction history or portfolio data
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          className="w-full"
          color="secondary"
          size="lg"
          startContent={<Upload className="w-4 h-4" />}
          onPress={() =>
            toast.warning("File Import", {
              description: "CSV and JSON import functionality coming soon!",
            })
          }
        >
          Choose File to Import
        </Button>

        <div className="text-center text-xs text-default-500 space-y-2">
          <p>Supported formats:</p>
          <div className="flex gap-2 justify-center">
            <Chip size="sm" variant="flat">
              CSV
            </Chip>
            <Chip size="sm" variant="flat">
              JSON
            </Chip>
            <Chip size="sm" variant="flat">
              Excel
            </Chip>
          </div>
          <p className="mt-2">Maximum file size: 10MB</p>
        </div>
      </div>
    </div>
  );
};

const TabNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  disabled?: boolean;
}> = ({ activeTab, onTabChange, disabled }) => {
  const tabs = [
    { id: "manual", label: "Manual Entry", icon: Wallet },
    { id: "connect", label: "Connect", icon: Link2 },
    { id: "import", label: "Import", icon: Upload },
  ];

  return (
    <div className="flex rounded-xl border border-divider bg-default-50 dark:bg-default-900 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white dark:bg-default-700 text-primary-600 shadow-sm"
                : "text-default-500 hover:text-default-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            disabled={disabled}
            onClick={() => !disabled && onTabChange(tab.id)}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Main Modal Component
const AddWalletModal: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ isOpen, onOpenChange }) => {
  const toast = useToast();
  const { addWallet } = useWalletAnalytics();
  const { progress, updateProgress, resetProgress } = useProgressTracker();

  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState<WalletFormData>({
    address: "",
    name: "",
    networks: ["ethereum"],
    isWatchOnly: true,
    autoSync: true,
    enableNotifications: true,
    includeNFTs: false,
    trackTransactions: true,
  });
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
  });

  const isProcessing =
    progress.phase !== "idle" && progress.phase !== "complete";
  const isManualTab = activeTab === "manual";
  const canSubmit =
    isManualTab && validation.isValid && formData.networks.length > 0;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isProcessing) {
        setFormData({
          address: "",
          name: "",
          networks: ["ethereum"],
          isWatchOnly: true,
          autoSync: true,
          enableNotifications: true,
          includeNFTs: false,
          trackTransactions: true,
        });
        setValidation({ isValid: false });
        setActiveTab("manual");
        resetProgress();
      }
      onOpenChange(open);
    },
    [onOpenChange, resetProgress, isProcessing],
  );

  const handleNetworkToggle = useCallback((networkId: string) => {
    setFormData((prev) => ({
      ...prev,
      networks: prev.networks.includes(networkId)
        ? prev.networks.filter((id) => id !== networkId)
        : [...prev.networks, networkId],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isProcessing) return;

    try {
      // Phase 1: Validation
      updateProgress({
        phase: "validating",
        message: "Validating wallet address",
        details: "Checking address format and network compatibility",
        progress: 20,
      });
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Phase 2: Connecting
      updateProgress({
        phase: "connecting",
        message: "Connecting to blockchain",
        details: `Establishing connection to ${formData.networks.length} network(s)`,
        progress: 50,
      });
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Phase 3: Syncing
      updateProgress({
        phase: "syncing",
        message: "Syncing wallet data",
        details: "Fetching balances and transaction history",
        progress: 80,
      });
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Determine chain type based on primary network
      const primaryNetwork = formData.networks[0] || "ethereum";
      const chainType = getChainTypeFromNetwork(primaryNetwork);

      // Add wallet using analytics hook
      const success = await addWallet(
        formData.address.trim(),
        formData.name.trim() || undefined,
        chainType,
      );

      if (success) {
        updateProgress({
          phase: "complete",
          message: "Wallet added successfully!",
          details: "Your wallet is now ready to track",
          progress: 100,
        });

        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      } else {
        throw new Error("Failed to add wallet");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      updateProgress({
        phase: "error",
        message: "Failed to add wallet",
        details: errorMessage,
        progress: 100,
      });

      toast.error("Failed to Add Wallet", {
        description: errorMessage,
        duration: 5000,
      });
    }
  }, [
    canSubmit,
    isProcessing,
    formData,
    addWallet,
    updateProgress,
    handleOpenChange,
    toast,
  ]);

  const handleCancel = useCallback(() => {
    if (isProcessing) {
      toast.warning("Process in Progress", {
        description: "Please wait for the current operation to complete",
      });

      return;
    }
    handleOpenChange(false);
  }, [isProcessing, handleOpenChange, toast]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "manual":
        return (
          <div className="space-y-6 mt-4">
            <AddressInput
              disabled={isProcessing}
              value={formData.address}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, address: value }))
              }
              onValidation={setValidation}
            />

            <Input
              description="Give your wallet a memorable name"
              isDisabled={isProcessing}
              label="Wallet Name (Optional)"
              placeholder="My Portfolio Wallet"
              startContent={<Wallet className="w-4 h-4 text-default-500" />}
              value={formData.name}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
            />

            <NetworkSelector
              disabled={isProcessing}
              selectedNetworks={formData.networks}
              onNetworkToggle={handleNetworkToggle}
            />

            <WalletSettingsSection
              disabled={isProcessing}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        );

      case "connect":
        return <ConnectWalletTab />;

      case "import":
        return <ImportTab />;

      default:
        return null;
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: "backdrop-opacity-20",
        base: "border border-divider",
        header: "border-b-[1px] border-divider",
        footer: "border-t-[1px] border-divider",
        closeButton: "",
      }}
      hideCloseButton={isProcessing}
      isDismissable={!isProcessing}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={handleOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Plus className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-default-700">
                    Add New Wallet
                  </h2>
                  <p className="text-sm font-normal text-default-500">
                    Connect or import a wallet to track your crypto portfolio
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="py-4">
              {/* Progress Display */}
              <AnimatePresence>
                {progress.phase !== "idle" && (
                  <ProgressDisplay progress={progress} />
                )}
              </AnimatePresence>

              {/* Tab Navigation */}
              <div className="w-full">
                <TabNavigation
                  activeTab={activeTab}
                  disabled={isProcessing}
                  onTabChange={setActiveTab}
                />

                {/* Tab Content */}
                <div className="min-h-[400px]">{renderTabContent()}</div>
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex items-center justify-between w-full">
                {/* Security Notice */}
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <Shield className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    Data encrypted & secure
                  </span>
                  <span className="sm:hidden">Secure</span>
                  {isProcessing && (
                    <>
                      <Divider className="h-3 mx-1" orientation="vertical" />
                      <span className="text-warning-600">
                        Don't close window
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    className="font-medium text-sm"
                    isDisabled={isProcessing}
                    size="sm"
                    variant="faded"
                    onPress={handleCancel}
                  >
                    Cancel
                  </Button>

                  {isManualTab && (
                    <Button
                      className="bg-gradient-to-br from-orange-400/90 via-orange-600/90 to-pink-400/90 text-white shadow-md hover:shadow-lg font-medium text-sm"
                      color="primary"
                      isDisabled={!canSubmit}
                      isLoading={isProcessing}
                      size="sm"
                      startContent={
                        !isProcessing ? <Plus className="w-4 h-4" /> : undefined
                      }
                      onPress={handleSubmit}
                    >
                      {isProcessing ? "Adding Wallet..." : "Add Wallet"}
                    </Button>
                  )}
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// Export component and utilities
export default AddWalletModal;

export type { WalletFormData, ValidationResult, ProgressState, Network };

export { validateWalletAddress, SUPPORTED_NETWORKS, getChainTypeFromNetwork };
